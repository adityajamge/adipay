import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, Wallet, Home, Clock, User, FileText, Send } from 'lucide-react';
import { useNavigate } from 'react-router';

// Mock Transaction Data
const TRANSACTIONS = [
  { id: 'tx-100', type: 'sent', name: 'Parth Kondhawale', amount: 500.00, note: 'Lunch', time: '2:30 PM', date: 'Today' },
  { id: 'tx-101', type: 'received', name: 'Rohan Sharma', amount: 1200.00, note: 'Books', time: '11:00 AM', date: 'Today' },
  { id: 'tx-102', type: 'received', name: 'Priya Patel', amount: 50.00, note: 'Coffee share', time: '9:15 AM', date: 'Today' },
  { id: 'tx-103', type: 'added', name: 'Wallet Funding', amount: 5000.00, note: 'Top up', time: '9:00 PM', date: 'Yesterday' },
  { id: 'tx-104', type: 'sent', name: 'Amazon Prime', amount: 1499.00, note: 'Subscription', time: '6:20 PM', date: 'Yesterday' },
  { id: 'tx-105', type: 'sent', name: 'Amit Jain', amount: 200.00, note: 'Snacks', time: '4:15 PM', date: 'March 28' },
];

export default function TransactionHistoryPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');
  const tabs = ['All', 'Sent', 'Received', 'Added'];

  // Data logic
  const filteredTxs = useMemo(() => {
    if (activeTab === 'All') return TRANSACTIONS;
    return TRANSACTIONS.filter((t) => t.type.toLowerCase() === activeTab.toLowerCase());
  }, [activeTab]);

  const groupedTxs = useMemo(() => {
    const groups: Record<string, typeof TRANSACTIONS> = {};
    filteredTxs.forEach((tx) => {
      if (!groups[tx.date]) groups[tx.date] = [];
      groups[tx.date].push(tx);
    });
    return groups;
  }, [filteredTxs]);

  // Bottom Nav items
  const navItems = [
    { id: 'home', icon: Home, label: 'Home', path: '/home' },
    { id: 'send', icon: ArrowUpRight, label: 'Send', path: '/send' },
    { id: 'history', icon: Clock, label: 'History', path: '/history' },
    { id: 'profile', icon: User, label: 'Profile', path: '/profile' },
  ];

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
      {Object.keys(groupedTxs).length === 0 ? (
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
                          <p className="truncate font-semibold text-white">{isAdd && 'Added to Wallet'} {isDebit && 'Paid to ' + tx.name} {tx.type === 'received' && 'From ' + tx.name}</p>
                          <p className="mt-0.5 truncate text-xs text-text-tertiary">
                            {tx.note && `"${tx.note}" • `}{tx.time}
                          </p>
                        </div>
                      </div>
                      <div className="ml-4 text-right flex-shrink-0">
                        <p className={`font-mono font-bold tracking-tight ${colorClass}`}>
                          {prefix}₹{tx.amount.toFixed(2)}
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
      <div className="absolute bottom-0 w-full z-30">
        <div className="absolute inset-0 -bottom-10 bg-gradient-to-t from-[#0a0a0f] to-transparent pointer-events-none" />
        <div className="relative flex items-center justify-around border-t border-white/10 bg-bg-secondary/40 px-6 py-4 backdrop-blur-2xl">
          {navItems.map((tab) => {
            const isActive = tab.id === 'history'; // Hardcode active state for this view module
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className="relative flex flex-col items-center space-y-1 p-2 focus:outline-none"
              >
                <tab.icon
                  size={22}
                  className={isActive ? 'text-brand-primary' : 'text-text-secondary transition-colors hover:text-white'}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-brand-primary' : 'text-text-tertiary'}`}>
                  {tab.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="bottom-nav-indicator"
                    className="absolute -top-1 h-1 w-1 rounded-full bg-brand-primary shadow-[0_0_8px_rgba(66,133,244,0.8)]"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
