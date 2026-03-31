import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Download, Clock, Check, X } from 'lucide-react';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

import BottomNav from '../components/BottomNav';
import { userService } from '../services/userService';
import { transactionService } from '../services/transactionService';

interface UserResult {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
}

interface MoneyRequest {
  id: string;
  request_id?: number;
  amount: number;
  description: string;
  status: string;
  created_at: string;
  payer: {
    full_name: string;
    phone: string;
  };
  requester: {
    full_name: string;
    phone: string;
  };
}

const formatTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Just now';
  }

  const today = new Date();
  const isToday = today.toDateString() === date.toDateString();
  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  return date.toLocaleDateString();
};

export default function RequestMoneyPage() {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<UserResult[]>([]);
  const [searchError, setSearchError] = useState('');

  const [selectedUser, setSelectedUser] = useState<UserResult | null>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [incoming, setIncoming] = useState<MoneyRequest[]>([]);
  const [outgoing, setOutgoing] = useState<MoneyRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [requestsError, setRequestsError] = useState('');
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>('incoming');
  const [actionBusyId, setActionBusyId] = useState('');
  const [reloadSeed, setReloadSeed] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    let isMounted = true;

    if (!debouncedQuery || debouncedQuery.length < 2 || selectedUser) {
      setSearchResults([]);
      setSearching(false);
      setSearchError('');
      return;
    }

    setSearching(true);
    setSearchError('');

    userService
      .searchUsers(debouncedQuery)
      .then((res: any) => {
        if (isMounted) {
          setSearchResults(res?.users || []);
        }
      })
      .catch((error: any) => {
        if (!isMounted) {
          return;
        }

        setSearchResults([]);
        setSearchError(error?.response?.data?.message || 'Unable to search users');
      })
      .finally(() => {
        if (isMounted) {
          setSearching(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [debouncedQuery, selectedUser]);

  useEffect(() => {
    let isMounted = true;

    setRequestsLoading(true);
    setRequestsError('');

    transactionService
      .getPendingRequests()
      .then((res: any) => {
        if (!isMounted) {
          return;
        }

        setIncoming(res?.incoming || []);
        setOutgoing(res?.outgoing || []);
      })
      .catch((error: any) => {
        if (!isMounted) {
          return;
        }

        setIncoming([]);
        setOutgoing([]);
        setRequestsError(error?.response?.data?.message || 'Unable to load requests');
      })
      .finally(() => {
        if (isMounted) {
          setRequestsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [reloadSeed]);

  const visibleRequests = useMemo(
    () => (activeTab === 'incoming' ? incoming : outgoing),
    [activeTab, incoming, outgoing]
  );

  const handleSelectUser = async (user: UserResult) => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch {
      // Ignore haptics on unsupported platforms.
    }

    setSelectedUser(user);
    setSearchQuery(user.full_name);
    setSearchResults([]);
    setSearchError('');
    setFormError('');
    setFormSuccess('');
  };

  const handleCreateRequest = async () => {
    const parsedAmount = Number(amount);

    if (!selectedUser) {
      setFormError('Select a user to request money from');
      return;
    }

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setFormError('Enter a valid amount');
      return;
    }

    setSubmitting(true);
    setFormError('');
    setFormSuccess('');

    try {
      await transactionService.requestMoney({
        payer_identifier: selectedUser.phone_number,
        amount: parsedAmount,
        description: note,
      });

      try {
        await Haptics.notification({ type: NotificationType.Success });
      } catch {
        // Ignore haptics on unsupported platforms.
      }

      setFormSuccess(`Requested Rs ${parsedAmount.toLocaleString('en-IN')} from ${selectedUser.full_name}`);
      setActiveTab('outgoing');
      setAmount('');
      setNote('');
      setSelectedUser(null);
      setSearchQuery('');
      setReloadSeed((value) => value + 1);
    } catch (error: any) {
      try {
        await Haptics.notification({ type: NotificationType.Error });
      } catch {
        // Ignore haptics on unsupported platforms.
      }

      setFormError(error?.response?.data?.message || 'Unable to send request');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayRequest = async (requestId: string) => {
    setActionBusyId(`pay-${requestId}`);
    setFormError('');
    setFormSuccess('');

    try {
      await transactionService.payRequest(requestId);
      setFormSuccess('Request paid successfully');
      setReloadSeed((value) => value + 1);
    } catch (error: any) {
      setFormError(error?.response?.data?.message || 'Unable to pay request');
    } finally {
      setActionBusyId('');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    setActionBusyId(`reject-${requestId}`);
    setFormError('');
    setFormSuccess('');

    try {
      await transactionService.rejectRequest(requestId);
      setFormSuccess(activeTab === 'incoming' ? 'Request declined' : 'Request canceled');
      setReloadSeed((value) => value + 1);
    } catch (error: any) {
      setFormError(error?.response?.data?.message || 'Unable to update request');
    } finally {
      setActionBusyId('');
    }
  };

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-bg-primary text-text-primary">
      <div className="flex items-center px-6 pt-6 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="rounded-full bg-white/5 p-3 text-text-secondary transition-colors active:bg-white/10 active:text-white"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="ml-4 font-heading text-xl font-bold text-white">Request Money</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-28">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">Create Request</p>

          <div className="mt-3">
            <div className="relative flex items-center">
              <Search size={18} className="absolute left-3 text-text-tertiary" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSelectedUser(null);
                  setSearchQuery(e.target.value);
                }}
                placeholder="Search by phone or email"
                className="w-full rounded-xl border border-white/10 bg-bg-secondary py-3 pl-10 pr-3 text-sm text-white outline-none transition-colors focus:border-brand-primary"
              />
            </div>

            {!selectedUser && searchQuery.trim().length >= 2 && (
              <div className="mt-2 max-h-44 overflow-y-auto rounded-xl border border-white/10 bg-bg-secondary/80">
                {searching ? (
                  <p className="px-3 py-3 text-xs text-text-secondary">Searching...</p>
                ) : searchResults.length > 0 ? (
                  searchResults.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleSelectUser(user)}
                      className="flex w-full items-center justify-between border-b border-white/5 px-3 py-3 text-left transition-colors last:border-b-0 hover:bg-white/5"
                    >
                      <span className="text-sm text-white">{user.full_name}</span>
                      <span className="text-xs text-text-secondary">{user.phone_number}</span>
                    </button>
                  ))
                ) : (
                  <p className="px-3 py-3 text-xs text-text-secondary">{searchError || 'No user found'}</p>
                )}
              </div>
            )}
          </div>

          {selectedUser && (
            <div className="mt-3 flex items-center justify-between rounded-xl border border-brand-primary/30 bg-brand-primary/10 px-3 py-2">
              <div>
                <p className="text-sm font-semibold text-white">{selectedUser.full_name}</p>
                <p className="text-xs text-text-secondary">{selectedUser.phone_number}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedUser(null);
                  setSearchQuery('');
                }}
                className="rounded-full bg-white/10 p-1 text-text-secondary"
              >
                <X size={14} />
              </button>
            </div>
          )}

          <div className="mt-3 grid grid-cols-[1fr_auto] items-center gap-3">
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => {
                const sanitized = e.target.value.replace(/[^0-9.]/g, '');
                setAmount(sanitized);
              }}
              placeholder="Amount"
              className="rounded-xl border border-white/10 bg-bg-secondary px-3 py-3 text-sm text-white outline-none transition-colors focus:border-brand-primary"
            />
            <div className="flex items-center gap-2">
              {['100', '500', '1000'].map((value) => (
                <button
                  key={value}
                  onClick={() => setAmount(value)}
                  className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-text-secondary"
                >
                  Rs {value}
                </button>
              ))}
            </div>
          </div>

          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add note (optional)"
            className="mt-3 w-full rounded-xl border border-white/10 bg-bg-secondary px-3 py-3 text-sm text-white outline-none transition-colors focus:border-brand-primary"
          />

          <button
            onClick={handleCreateRequest}
            disabled={submitting}
            className="mt-3 flex w-full items-center justify-center space-x-2 rounded-xl bg-brand-primary py-3 text-sm font-semibold text-white transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Download size={16} />
            <span>{submitting ? 'Sending Request...' : 'Send Request'}</span>
          </button>

          {formError && <p className="mt-3 text-sm font-medium text-accent-send">{formError}</p>}
          {formSuccess && <p className="mt-3 text-sm font-medium text-accent-receive">{formSuccess}</p>}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">Pending Requests</p>

          <div className="mt-3 grid grid-cols-2 rounded-xl border border-white/10 bg-bg-secondary/60 p-1">
            <button
              onClick={() => setActiveTab('incoming')}
              className={`rounded-lg py-2 text-xs font-semibold transition-colors ${
                activeTab === 'incoming' ? 'bg-white/10 text-white' : 'text-text-secondary'
              }`}
            >
              To Pay ({incoming.length})
            </button>
            <button
              onClick={() => setActiveTab('outgoing')}
              className={`rounded-lg py-2 text-xs font-semibold transition-colors ${
                activeTab === 'outgoing' ? 'bg-white/10 text-white' : 'text-text-secondary'
              }`}
            >
              Requested ({outgoing.length})
            </button>
          </div>

          {requestsLoading ? (
            <p className="mt-4 text-sm text-text-secondary">Loading requests...</p>
          ) : requestsError ? (
            <p className="mt-4 text-sm text-accent-send">{requestsError}</p>
          ) : visibleRequests.length === 0 ? (
            <div className="mt-4 rounded-xl border border-white/10 bg-bg-secondary/60 p-4 text-center text-sm text-text-secondary">
              {activeTab === 'incoming'
                ? 'No requests waiting for payment.'
                : 'You have not sent any pending requests.'}
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {visibleRequests.map((item) => {
                const person = activeTab === 'incoming' ? item.requester : item.payer;
                const payLoading = actionBusyId === `pay-${item.id}`;
                const rejectLoading = actionBusyId === `reject-${item.id}`;

                return (
                  <div key={item.id} className="rounded-2xl border border-white/10 bg-bg-secondary/70 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-white">{person.full_name}</p>
                        <p className="text-xs text-text-secondary">{person.phone}</p>
                      </div>
                      <p className="font-mono text-lg font-bold text-brand-primary">
                        Rs {Number(item.amount).toLocaleString('en-IN')}
                      </p>
                    </div>

                    <div className="mt-2 flex items-center gap-2 text-xs text-text-tertiary">
                      <Clock size={13} />
                      <span>{formatTime(item.created_at)}</span>
                    </div>

                    {item.description && (
                      <p className="mt-2 rounded-lg bg-white/5 px-2 py-1 text-xs text-text-secondary">"{item.description}"</p>
                    )}

                    <div className="mt-3 flex gap-2">
                      {activeTab === 'incoming' ? (
                        <>
                          <button
                            onClick={() => handlePayRequest(item.id)}
                            disabled={payLoading || rejectLoading}
                            className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-accent-receive/80 py-2 text-xs font-semibold text-white disabled:opacity-70"
                          >
                            <Check size={14} />
                            <span>{payLoading ? 'Paying...' : 'Pay'}</span>
                          </button>
                          <button
                            onClick={() => handleRejectRequest(item.id)}
                            disabled={payLoading || rejectLoading}
                            className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-white/10 py-2 text-xs font-semibold text-text-secondary disabled:opacity-70"
                          >
                            <X size={14} />
                            <span>{rejectLoading ? 'Updating...' : 'Decline'}</span>
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleRejectRequest(item.id)}
                          disabled={rejectLoading}
                          className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-white/10 py-2 text-xs font-semibold text-text-secondary disabled:opacity-70"
                        >
                          <X size={14} />
                          <span>{rejectLoading ? 'Updating...' : 'Cancel Request'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      <BottomNav activeTab="send" />
    </div>
  );
}
