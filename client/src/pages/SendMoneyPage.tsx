import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { ArrowLeft, Search, ArrowRight, Check, UserIcon } from 'lucide-react';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import confetti from 'canvas-confetti';

import { transactionService } from '../services/transactionService';
import { userService } from '../services/userService';

// --- TYPES ---
interface UserResult {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
}

interface RecentContact {
  id: string; // user ID
  full_name: string;
  phone_number: string;
}

export default function SendMoneyPage() {
  const navigate = useNavigate();

  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<UserResult[]>([]);
  const [recentContacts, setRecentContacts] = useState<RecentContact[]>([]);
  const [contactsLoading, setContactsLoading] = useState(true);
  const [contactsError, setContactsError] = useState('');
  const [searchError, setSearchError] = useState('');
  
  // Selection States
  const [selectedUser, setSelectedUser] = useState<{ id: string, name: string, phone: string } | null>(null);
  
  // Payment States
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [refNumber, setRefNumber] = useState('');
  const [sendError, setSendError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Slider State
  const x = useMotionValue(0);
  const dragProgress = useTransform(x, [0, 220], [0, 1]);
  const bgOpacity = useTransform(dragProgress, [0, 1], [0.1, 1]);
  const textOpacity = useTransform(dragProgress, [0, 0.5], [1, 0]);
  const canSlideToSend = Number(amount) > 0 && !isSubmitting;

  // Debounce logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    let isMounted = true;
    setContactsLoading(true);
    setContactsError('');

    transactionService
      .getRecentContacts()
      .then((res) => {
        if (isMounted) {
          setRecentContacts(res?.contacts || []);
        }
      })
      .catch((error: any) => {
        if (isMounted) {
          setContactsError(error?.response?.data?.message || 'Unable to load recent contacts');
          setRecentContacts([]);
        }
      })
      .finally(() => {
        if (isMounted) {
          setContactsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // API Search
  useEffect(() => {
    if (!debouncedQuery) {
      setSearchResults([]);
      setSearching(false);
      setSearchError('');
      return;
    }
    setSearching(true);
    setSearchError('');
    let isMounted = true;
    userService.searchUsers(debouncedQuery).then(res => {
      if(isMounted) {
        setSearchResults(res.users);
      }
    }).catch((error: any) => {
      if (isMounted) {
        setSearchResults([]);
        setSearchError(error?.response?.data?.message || 'Search is unavailable right now');
      }
    }).finally(() => {
      if(isMounted) setSearching(false);
    });
    return () => { isMounted = false; };
  }, [debouncedQuery]);

  useEffect(() => {
    setSendError('');
    setIsSubmitting(false);
    x.set(0);
  }, [selectedUser, x]);

  const handleDragEnd = async (_: any, info: any) => {
    const parsedAmount = Number(amount);

    if (isSubmitting) {
      return;
    }

    if (info.offset.x >= 200 && parsedAmount > 0 && selectedUser) {
      // Success! Proceed to send.
      setSendError('');
      setIsSubmitting(true);

      try {
        const response = await transactionService.sendMoney({
          recipient_identifier: selectedUser.phone, // sending by phone
          amount: parsedAmount,
          description: note
        });
        
        await Haptics.notification({ type: NotificationType.Success });
        x.set(220);
        setTimeout(() => {
          setRefNumber(response.transaction?.reference_no || String(response.transaction?.id || 'N/A'));
          setIsSuccess(true);
          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.5 },
            colors: ['#4285F4', '#34A853', '#EA4335', '#FBBC04']
          });
        }, 300);
      } catch (e: any) {
        console.error('Send error:', e);
        try {
          await Haptics.notification({ type: NotificationType.Error });
        } catch {}
        x.set(0);
        setSendError(e?.response?.data?.message || 'Transaction failed. Please try again.');
        setIsSubmitting(false);
      }
    } else {
      // Reset Spring
      try {
        await Haptics.impact({ style: ImpactStyle.Light });
      } catch {}
      x.set(0);
    }
  };

  const handleChipSelect = async (val: string) => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch {}
    setSendError('');
    setAmount(val);
  };

  // ---------------------------------
  // RENDER SUCCESS SCREEN
  // ---------------------------------
  if (isSuccess) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-screen flex-col bg-bg-primary text-text-primary">
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-accent-receive/20"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent-receive shadow-[0_0_40px_rgba(52,168,83,0.5)]">
               <Check size={40} strokeWidth={3} className="text-bg-primary" />
            </div>
          </motion.div>
          
          <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="font-heading text-3xl font-bold text-white">
             Transfer Successful
          </motion.h2>
          
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="mt-4 flex flex-col items-center">
            <p className="text-text-secondary">You sent <span className="font-bold text-brand-primary">₹{Number(amount).toLocaleString('en-IN')}</span> to</p>
            <div className="mt-4 flex items-center space-x-3 rounded-2xl bg-white/5 px-5 py-3 border border-white/10">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser?.name}`} alt={selectedUser?.name} className="h-10 w-10 rounded-full bg-bg-secondary" />
              <div className="text-left">
                <p className="font-semibold text-white">{selectedUser?.name}</p>
                <p className="text-xs text-text-tertiary">{selectedUser?.phone}</p>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="mt-8 border-t border-white/10 pt-6">
            <p className="text-xs font-mono text-text-tertiary">Ref No: {refNumber}</p>
          </motion.div>
        </div>

        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }} className="p-6">
          <button
            onClick={() => navigate('/home', { replace: true })}
            className="w-full rounded-2xl bg-white/10 py-4 font-semibold text-white backdrop-blur-md transition-all active:scale-95 active:bg-white/20"
          >
            Done
          </button>
        </motion.div>
      </motion.div>
    );
  }

  // ---------------------------------
  // RENDER MAIN SCREEN
  // ---------------------------------
  return (
    <div className="flex h-screen flex-col bg-bg-primary text-text-primary">
      {/* Header */}
      <div className="flex items-center px-6 pt-6 pb-4">
        <button
          onClick={() => selectedUser ? setSelectedUser(null) : navigate(-1)}
          className="rounded-full bg-white/5 p-3 text-text-secondary transition-colors active:bg-white/10 active:text-white"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="ml-4 font-heading text-xl font-bold text-white">
          {selectedUser ? 'Send Money' : 'Pay Someone'}
        </h1>
      </div>

      {!selectedUser ? (
        // --- STEP 1: SEARCH / SELECT USER ---
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 py-2">
            <div className="relative flex items-center">
              <Search className="absolute left-4 text-text-tertiary" size={20} />
              <input
                type="text"
                placeholder="Search by phone/email"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-white outline-none backdrop-blur-md transition-colors focus:border-brand-primary focus:bg-white/10"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            {searchQuery ? (
              // Search Results
              <div>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-tertiary">Search Results</h3>
                {searching ? (
                  // Skeleton Loading
                  <div className="flex flex-col space-y-4 animate-pulse">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-full bg-white/5"></div>
                        <div className="flex flex-col space-y-2 flex-1">
                          <div className="h-4 w-1/2 rounded bg-white/5"></div>
                          <div className="h-3 w-1/3 rounded bg-white/5"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="flex flex-col space-y-2">
                    {searchResults.map((user) => (
                      <button key={user.id} onClick={() => setSelectedUser({ id: user.id, name: user.full_name, phone: user.phone_number })} className="flex items-center space-x-4 rounded-2xl bg-white/5 p-3 transition-colors active:bg-white/10 text-left">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.full_name}`} alt={user.full_name} className="h-12 w-12 rounded-full bg-white/5" />
                        <div>
                          <p className="font-semibold text-white">{user.full_name}</p>
                          <p className="text-sm text-text-secondary">{user.phone_number}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 opacity-50">
                    <UserIcon size={48} className="mb-4 text-text-tertiary" />
                    <p className="text-white">{searchError || 'No user found'}</p>
                  </div>
                )}
              </div>
            ) : (
              // Recent Contacts
              <div>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-tertiary">Recent contacts</h3>
                {contactsLoading ? (
                  <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide animate-pulse">
                    {[1, 2, 3, 4].map((item) => (
                      <div key={item} className="flex flex-col items-center space-y-2 w-16 shrink-0">
                        <div className="h-14 w-14 rounded-full bg-white/5" />
                        <div className="h-2 w-10 rounded bg-white/5" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
                    {recentContacts.map((user) => (
                      <button key={user.id} onClick={() => setSelectedUser({ id: user.id, name: user.full_name, phone: user.phone_number })} className="flex flex-col items-center space-y-2 w-16 shrink-0 group">
                        <div className="relative h-14 w-14 rounded-full border-2 border-transparent group-active:border-brand-primary transition-colors overflow-hidden">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.full_name}`} alt={user.full_name} className="h-full w-full object-cover bg-white/5" />
                        </div>
                        <p className="text-xs text-center text-text-secondary truncate w-full">{user.full_name.split(' ')[0]}</p>
                      </button>
                    ))}
                    {!contactsError && recentContacts.length === 0 && <p className="text-xs text-text-tertiary">No recent contacts</p>}
                    {contactsError && <p className="text-xs text-accent-send">{contactsError}</p>}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      ) : (
        // --- STEP 2: ENTER AMOUNT & SEND ---
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 flex flex-col justify-between overflow-hidden">
          
          <div className="px-6 flex flex-col items-center pt-2">
            {/* Selected User Badge */}
            <div className="flex items-center space-x-3 rounded-full bg-white/5 pr-6 pl-2 py-2 border border-white/10 mb-8 max-w-full">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser.name}`} className="h-10 w-10 rounded-full" />
              <div className="truncate text-left">
                <p className="font-semibold text-white truncate text-sm">Sending to {selectedUser.name}</p>
                <p className="text-xs text-text-tertiary truncate">{selectedUser.phone}</p>
              </div>
            </div>

            {/* Amount Input */}
            <div className="flex w-full justify-center items-center py-8">
              <span className="text-4xl font-light text-brand-primary mr-2">₹</span>
              <input 
                type="text" 
                inputMode="decimal"
                autoFocus
                placeholder="0"
                className="bg-transparent text-[64px] font-mono text-white text-center w-full max-w-[280px] outline-none placeholder:text-white/20 h-20 leading-none"
                style={{ caretColor: '#4285F4' }}
                value={amount}
                onChange={(e) => {
                  let val = e.target.value.replace(/[^0-9.]/g, '');
                  const parts = val.split('.');
                  if (parts.length > 2) return;
                  if (parts[1]?.length > 2) val = `${parts[0]}.${parts[1].slice(0, 2)}`;
                  setSendError('');
                  setAmount(val);
                }}
              />
            </div>

            {/* Quick Chips */}
            <div className="mt-2 flex space-x-3 justify-center">
              {['100', '500', '1000'].map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleChipSelect(chip)}
                  className="rounded-full border border-brand-primary/30 bg-brand-primary/10 px-6 py-2 text-sm font-semibold text-brand-primary transition-all active:scale-95 hover:bg-brand-primary/20"
                >
                  ₹{chip}
                </button>
              ))}
            </div>

            {/* Note Input */}
            <div className="mt-12 w-full">
              <input
                type="text"
                placeholder="Add a note (optional)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full rounded-2xl bg-white/5 px-4 py-4 text-center text-sm text-white outline-none backdrop-blur-md transition-colors placeholder:text-text-tertiary focus:bg-white/10 border border-transparent focus:border-white/10"
              />
            </div>

            {sendError && (
              <p className="mt-4 text-center text-sm font-medium text-accent-send">{sendError}</p>
            )}
          </div>

          <div className="px-6 pb-10">
            {/* Slide to Send Slider Button */}
            <div className="relative h-20 w-full rounded-full bg-white/5 border border-white/10 mx-auto overflow-hidden flex items-center backdrop-blur-md shadow-inner">
              
              {/* Animated Progress Background behind Slider */}
              <motion.div 
                 className="absolute left-0 top-0 bottom-0 bg-brand-primary"
                 style={{ width: x, opacity: bgOpacity }}
              />

              {/* Instructional Text */}
              <motion.div 
                style={{ opacity: textOpacity }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <div className="flex items-center text-text-secondary/70 font-semibold tracking-wider">
                  <span className="uppercase text-sm">{isSubmitting ? 'Sending...' : 'Slide to Send'}</span>
                  {!isSubmitting && (
                    <div className="ml-2 flex space-x-1 opacity-50">
                       <ArrowRight size={14} />
                       <ArrowRight size={14} className="-ml-2" />
                    </div>
                  )}
                </div>
              </motion.div>

              {/* The Draggable Thumb */}
              <motion.div
                drag={canSlideToSend ? 'x' : false}
                dragConstraints={{ left: 0, right: 280 }} // width minus padding roughly
                dragElastic={0.05}
                onDragEnd={handleDragEnd}
                style={{ x }}
                className={`absolute z-10 ml-2 h-16 w-16 rounded-full bg-bg-secondary border border-white/10 flex justify-center items-center shadow-lg ${canSlideToSend ? 'cursor-grab active:cursor-grabbing' : 'cursor-not-allowed opacity-80'}`}
              >
                <div className="h-12 w-12 rounded-full bg-brand-primary flex items-center justify-center shadow-[0_0_15px_rgba(66,133,244,0.5)]">
                  <ArrowRight className="text-white" size={24} />
                </div>
              </motion.div>
            </div>
          </div>

        </motion.div>
      )}
    </div>
  );
}
