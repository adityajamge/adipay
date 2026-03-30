import { useEffect, useState, useRef } from 'react';
import { motion, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Plus, Download, ArrowDownLeft, Clock, User, Bell, Home, Send, Wallet, History as HistoryIcon } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

// --- NUMBER COUNTER COMPONENT ---
const AnimatedCounter = ({ value }: { value: number }) => {
  const springValue = useSpring(0, { bounce: 0, duration: 1500 });
  const displayValue = useTransform(springValue, (current) =>
    `₹${current.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  );

  useEffect(() => {
    springValue.set(value);
  }, [value, springValue]);

  return <motion.span className="tabular font-mono">{displayValue}</motion.span>;
};

// --- MOCK DATA ---
const TRANSACTIONS = [
  { id: 1, type: 'sent', name: 'Parth Patil', amount: 500.00, time: '2 min ago', icon: ArrowUpRight, color: 'text-accent-send', bg: 'bg-accent-send/10' },
  { id: 2, type: 'received', name: 'Rohan Sharma', amount: 1200.00, time: '1 hr ago', icon: ArrowDownLeft, color: 'text-accent-receive', bg: 'bg-accent-receive/10' },
  { id: 3, type: 'added', name: 'Added to wallet', amount: 5000.00, time: 'Yesterday', icon: Wallet, color: 'text-brand-primary', bg: 'bg-brand-primary/10' },
  { id: 4, type: 'sent', name: 'Swiggy Instamart', amount: 345.50, time: 'Yesterday', icon: ArrowUpRight, color: 'text-accent-send', bg: 'bg-accent-send/10' },
  { id: 5, type: 'sent', name: 'Uber Rides', amount: 120.00, time: '2 days ago', icon: ArrowUpRight, color: 'text-accent-send', bg: 'bg-accent-send/10' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Pull-to-refresh mockup simulation
  const handleDragEnd = async (_: any, info: any) => {
    if (info.offset.y > 100 && containerRef.current?.scrollTop === 0) {
      await Haptics.impact({ style: ImpactStyle.Heavy });
      setIsRefreshing(true);
      setTimeout(() => setIsRefreshing(false), 2000);
    }
  };

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-bg-primary text-text-primary">
      {/* Scrollable Content */}
      <motion.div
        ref={containerRef}
        className="flex-1 overflow-y-auto pb-24 pt-6"
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
      >
        {/* Refresh Loader */}
        <AnimatePresence>
          {isRefreshing && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 60, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex items-center justify-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="h-6 w-6 rounded-full border-2 border-brand-primary border-t-transparent"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- HEADER --- */}
        <div className="flex items-center justify-between px-6 pb-6">
          <div className="flex items-center space-x-3">
            <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-white/10">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aditya&backgroundColor=4285F4" alt="Avatar" className="h-full w-full object-cover" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-text-secondary">Welcome back</p>
              <h1 className="font-heading text-xl font-bold text-white">Hi, Aditya</h1>
            </div>
          </div>
          <button className="relative rounded-full bg-white/5 p-2.5 text-text-secondary transition-colors active:bg-white/10 active:text-white">
            <Bell size={22} />
            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-bg-primary bg-accent-send" />
          </button>
        </div>

        {/* --- BALANCE CARD --- */}
        <div className="px-6 pb-8">
          <div className="relative rounded-3xl bg-gradient-to-br from-[#4285F4]/30 to-[#34A853]/10 p-[1px] shadow-[0_8px_32px_rgba(66,133,244,0.15)]">
            <div className="relative overflow-hidden rounded-[23px] bg-bg-secondary/90 px-6 py-8 backdrop-blur-xl">
              {/* Backglow element */}
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-primary opacity-20 blur-3xl filter" />
              
              <div className="relative z-10 flex flex-col justify-between">
                <div>
                  <p className="text-sm font-medium text-text-secondary">Available Balance</p>
                  <motion.h2 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", duration: 0.8 }}
                    className="mt-1 font-heading text-[38px] font-bold text-white tracking-tight"
                  >
                    <AnimatedCounter value={12450.00} />
                  </motion.h2>
                </div>
                
                {/* Quick Action Pills inside Card */}
                <div className="mt-8 flex space-x-3">
                  <button className="flex flex-1 items-center justify-center space-x-2 rounded-xl bg-brand-primary py-3.5 text-sm font-semibold text-white shadow-lg transition-transform active:scale-95">
                    <Plus size={18} />
                    <span>Add</span>
                  </button>
                  <button className="flex flex-1 items-center justify-center space-x-2 rounded-xl bg-white/10 py-3.5 text-sm font-semibold text-white transition-all active:scale-95 active:bg-white/20 hover:bg-white/15">
                    <ArrowUpRight size={18} />
                    <span>Send</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- ACTION GRID (GPay Style) --- */}
        <div className="px-6 pb-6 pt-2">
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Send', icon: Send, color: 'bg-brand-primary', text: 'text-white' },
              { label: 'Request', icon: Download, color: 'bg-white/5', text: 'text-brand-primary' },
              { label: 'History', icon: HistoryIcon, color: 'bg-white/5', text: 'text-accent-warning' },
              { label: 'Add', icon: Plus, color: 'bg-white/5', text: 'text-accent-receive' },
            ].map((action, i) => (
              <motion.div key={i} whileTap={{ scale: 0.9 }} className="flex flex-col items-center space-y-2">
                <button className={`flex h-[60px] w-[60px] items-center justify-center rounded-2xl ${action.color} border border-white/5 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-primary/50`}>
                  <action.icon size={26} className={action.text} strokeWidth={2} />
                </button>
                <span className="text-xs font-medium text-text-secondary">{action.label}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* --- RECENT TRANSACTIONS --- */}
        <div className="px-6 pt-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-heading text-lg font-bold text-white">Recent Transactions</h3>
            <button className="text-sm font-semibold text-brand-primary active:text-blue-400">View All</button>
          </div>
          
          <div className="flex flex-col space-y-3">
            {TRANSACTIONS.map((tx, idx) => (
              <motion.div
                key={tx.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 * idx, duration: 0.4 }}
                className="relative overflow-hidden group"
              >
                {/* Swipeable Foreground */}
                <motion.div
                  drag="x"
                  dragConstraints={{ left: -80, right: 0 }}
                  dragElastic={0.1}
                  className="relative z-10 flex cursor-grab items-center justify-between rounded-2xl border border-white/5 bg-bg-secondary p-4 active:cursor-grabbing backdrop-blur-md"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full ${tx.bg}`}>
                      <tx.icon size={20} className={tx.color} />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{tx.name}</p>
                      <p className="text-sm text-text-secondary">{tx.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-mono font-bold ${tx.type === 'received' || tx.type === 'added' ? 'text-accent-receive' : 'text-white'}`}>
                      {tx.type === 'received' || tx.type === 'added' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                    </p>
                  </div>
                </motion.div>
                
                {/* Swiped Background Actions */}
                <div className="absolute inset-y-0 right-0 z-0 flex w-20 items-center justify-center rounded-r-2xl bg-brand-primary">
                  <span className="text-xs font-semibold text-white">Repeat</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* --- BOTTOM NAVIGATION --- */}
      <div className="absolute bottom-0 w-full">
        {/* Blur overlay below nav for standard safe-area support */}
        <div className="absolute inset-0 -bottom-10 bg-gradient-to-t from-[#0a0a0f] to-transparent pointer-events-none" />
        
        <div className="relative flex items-center justify-around border-t border-white/10 bg-bg-secondary/40 px-6 py-4 backdrop-blur-2xl">
          {[
            { id: 'home', icon: Home, label: 'Home', active: true },
            { id: 'send', icon: ArrowUpRight, label: 'Send', active: false },
            { id: 'history', icon: Clock, label: 'History', active: false },
            { id: 'profile', icon: User, label: 'Profile', active: false },
          ].map((tab) => (
            <button key={tab.id} className="relative flex flex-col items-center space-y-1 p-2 focus:outline-none">
              <tab.icon size={22} className={tab.active ? 'text-brand-primary' : 'text-text-secondary transition-colors hover:text-white'} strokeWidth={tab.active ? 2.5 : 2} />
              <span className={`text-[10px] font-medium transition-colors ${tab.active ? 'text-brand-primary' : 'text-text-tertiary'}`}>
                {tab.label}
              </span>
              {/* Animated dot indicator */}
              {tab.active && (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  className="absolute -top-1 h-1 w-1 rounded-full bg-brand-primary"
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
