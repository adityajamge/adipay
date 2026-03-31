import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, Wallet, FileText, Send } from 'lucide-react';
import { useNavigate } from 'react-router';
import BottomNav from '../components/BottomNav';
import { transactionService } from '../services/transactionService';

// --- TYPES ---
interface Transaction {
  id: string;
  type: 'sent' | 'received' | 'added';
  amount: number;
  description: string;
  created_at: string;
  party_name?: string;
}

export default function TransactionHistoryPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadSeed, setReloadSeed] = useState(0);
  const tabs = ['All', 'Sent', 'Received', 'Added'];

  useEffect(() => {
    let isMounted = true;
    const filterMap: Record<string, 'all' | 'sent' | 'received' | 'added'> = {
      All: 'all',
      Sent: 'sent',
      Received: 'received',
      Added: 'added',
    };

    setLoading(true);
    setError('');

    transactionService
      .getHistory(1, 100, filterMap[activeTab] || 'all')
      .then((res) => {
        if (isMounted) {
          setTransactions(res?.transactions || []);
        }
      })
      .catch((fetchError: any) => {
        if (isMounted) {
          setTransactions([]);
          setError(fetchError?.response?.data?.message || 'Unable to load transaction history');
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [activeTab, reloadSeed]);

  const groupedTxs = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    transactions.forEach((tx: Transaction) => {
      const dateObj = new Date(tx.created_at);
      const isToday = new Date().toDateString() === dateObj.toDateString();
      const dateStr = isToday ? 'Today' : dateObj.toLocaleDateString();

      if (!groups[dateStr]) groups[dateStr] = [];
      groups[dateStr].push(tx);
    });
    return groups;
  }, [transactions]);

  return (
    <div className="relative flex h-screen flex-col bg-bg-primary text-text-primary overflow-hidden">
      
      {/* --- HEADER --- */}
      <div className="flex items-center px-6 pt-6 pb-2">
        <button
          onClick={() => navigate(-1)}
          className="rounded-full bg-white/5 p-3 text-text-secondary transition-colors active:bg-white/10 active:text-white"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="ml-4 font-heading text-xl font-bold text-white">Transaction History</h1>
      </div>

      {/* --- ANIMATED TABS --- */}
      <div className="px-6 py-4">
        <div className="flex rounded-full bg-white/5 p-1 border border-white/5 relative">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative flex-1 rounded-full py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors z-10 ${
                activeTab === tab ? 'text-white' : 'text-text-tertiary hover:text-text-secondary'
              }`}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="history-tab"
                  className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-md shadow-sm border border-white/5 z-[-1]"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* --- SCROLLABLE LIST --- */}
      {loading ? (
        <div className="flex-1 px-6 pb-24 pt-2">
          <div className="animate-pulse space-y-3">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="h-20 rounded-2xl border border-white/5 bg-white/5" />
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="flex flex-1 flex-col items-center justify-center px-10 pb-20 text-center">
          <p className="text-sm font-medium text-accent-send">{error}</p>
          <button
            onClick={() => setReloadSeed((value) => value + 1)}
            className="mt-4 rounded-xl bg-white/10 px-6 py-2 text-sm font-semibold text-white"
          >
            Retry
          </button>
        </div>
      ) : Object.keys(groupedTxs).length === 0 ? (
        // Empty State
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-1 flex-col items-center justify-center px-10 pb-20 mt-[-20px]"
        >
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white/5 border border-white/10">
            <FileText size={40} className="text-text-tertiary" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-white font-heading">No Transactions</h3>
          <p className="mb-8 text-center text-text-secondary leading-relaxed">
            You haven't {activeTab === 'All' ? 'made any transactions' : activeTab === 'Added' ? 'added any money' : activeTab === 'Sent' ? 'sent any money' : 'received any money'} yet.
          </p>
          <button
            onClick={() => navigate('/send')}
            className="flex items-center space-x-2 rounded-xl bg-brand-primary px-8 py-3.5 font-semibold text-white transition-transform active:scale-95 shadow-lg shadow-brand-primary/20"
          >
            <Send size={18} />
            <span>Start a Transfer</span>
          </button>
        </motion.div>
      ) : (
        <div className="flex-1 overflow-y-auto px-6 pb-24">
          {Object.entries(groupedTxs).map(([date, txs]) => (
            <div key={date} className="pt-2 pb-1 relative">
              {/* Sticky Header */}
              <div className="sticky top-[-1px] z-20 bg-bg-primary/90 py-2 backdrop-blur-md">
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-text-tertiary">
                  {date}
                </h3>
              </div>
              
              <div className="mt-2 flex flex-col space-y-3 pb-4">
                {txs.map((tx) => {
                  const isDebit = tx.type === 'sent';
                  const isAdd = tx.type === 'added';
                  const colorClass = isDebit ? 'text-accent-send' : isAdd ? 'text-brand-primary' : 'text-accent-receive';
                  const bgClass = isDebit ? 'bg-accent-send/10' : isAdd ? 'bg-brand-primary/10' : 'bg-accent-receive/10';
                  const Icon = isDebit ? ArrowUpRight : isAdd ? Wallet : ArrowDownLeft;
                  const prefix = isDebit ? '-' : '+';
                  const time = new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const title = tx.party_name || ((tx.type === 'added' || tx.type === 'received') ? 'Wallet' : 'Unknown');

                  return (
                    <motion.button
                      key={tx.id}
                      onClick={() => navigate(`/transaction/${tx.id}`)}
                      whileTap={{ scale: 0.98 }}
                      className="flex w-full items-center justify-between rounded-2xl border border-white/5 bg-white/5 p-4 text-left transition-colors active:bg-white/10"
                    >
                      <div className="flex items-center space-x-4 overflow-hidden truncate">
                        <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${bgClass} border border-white/5`}>
                          <Icon size={20} className={colorClass} />
                        </div>
                        <div className="truncate">
                          <p className="truncate font-semibold text-white">{isAdd && 'Added to Wallet'} {isDebit && 'Paid to ' + title} {tx.type === 'received' && 'From ' + title}</p>
                          <p className="mt-0.5 truncate text-xs text-text-tertiary">
                            {tx.description && `"${tx.description}" • `}{time}
                          </p>
                        </div>
                      </div>
                      <div className="ml-4 text-right flex-shrink-0">
                        <p className={`font-mono font-bold tracking-tight ${colorClass}`}>
                          {prefix}₹{Number(tx.amount).toFixed(2)}
                        </p>

                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- BOTTOM NAVIGATION (Copied from Home dashboard) --- */}
      <BottomNav activeTab="history" />
    </div>
  );
}
