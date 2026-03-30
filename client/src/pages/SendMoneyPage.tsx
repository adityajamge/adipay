import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { ArrowLeft, Search, ArrowRight, Check, UserIcon } from 'lucide-react';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import confetti from 'canvas-confetti';

const RECENTS = [
  { id: 1, name: 'Parth Kondhawale', phone: '+91 98765 43210', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Parth' },
  { id: 2, name: 'Rohan Sharma', phone: '+91 87654 32109', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan' },
  { id: 3, name: 'Aarav Patel', phone: '+91 76543 21098', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav' },
  { id: 4, name: 'Vikram Singh', phone: '+91 65432 10987', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram' },
];

export default function SendMoneyPage() {
  const navigate = useNavigate();

  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<typeof RECENTS>([]);
  
  // Selection States
  const [selectedUser, setSelectedUser] = useState<typeof RECENTS[0] | null>(null);
  
  // Payment States
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [refNumber, setRefNumber] = useState('');

  // Slider State
  const x = useMotionValue(0);
  const dragProgress = useTransform(x, [0, 220], [0, 1]);
  const bgOpacity = useTransform(dragProgress, [0, 1], [0.1, 1]);
  const textOpacity = useTransform(dragProgress, [0, 0.5], [1, 0]);

  // Debounce logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Mock API Search
  useEffect(() => {
    if (!debouncedQuery) {
      setSearchResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const timer = setTimeout(() => {
      const term = debouncedQuery.toLowerCase();
      const results = RECENTS.filter(r => r.name.toLowerCase().includes(term) || r.phone.includes(term));
      setSearchResults(results);
      setSearching(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [debouncedQuery]);

  const handleDragEnd = async (_: any, info: any) => {
    if (info.offset.x >= 200) {
      // Success! Proceed to send.
      try {
        await Haptics.notification({ type: NotificationType.Success });
      } catch {}

      // Snap slider to end and show success
      x.set(220);
      setTimeout(() => {
        setRefNumber('TXN' + Math.floor(Math.random() * 1000000000).toString());
        setIsSuccess(true);
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#4285F4', '#34A853', '#EA4335', '#FBBC04']
        });
      }, 300);
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
              <img src={selectedUser?.avatar} alt={selectedUser?.name} className="h-10 w-10 rounded-full bg-bg-secondary" />
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
                      <button key={user.id} onClick={() => setSelectedUser(user)} className="flex items-center space-x-4 rounded-2xl bg-white/5 p-3 transition-colors active:bg-white/10 text-left">
                        <img src={user.avatar} className="h-12 w-12 rounded-full" />
                        <div>
                          <p className="font-semibold text-white">{user.name}</p>
                          <p className="text-sm text-text-secondary">{user.phone}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 opacity-50">
                    <UserIcon size={48} className="mb-4 text-text-tertiary" />
                    <p className="text-white">No user found</p>
                  </div>
                )}
              </div>
            ) : (
              // Recent Contacts
              <div>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-tertiary">Recent contacts</h3>
                <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
                  {RECENTS.map((user) => (
                    <button key={user.id} onClick={() => setSelectedUser(user)} className="flex flex-col items-center space-y-2 w-16 shrink-0 group">
                      <div className="relative h-14 w-14 rounded-full border-2 border-transparent group-active:border-brand-primary transition-colors overflow-hidden">
                        <img src={user.avatar} className="h-full w-full object-cover bg-white/5" />
                      </div>
                      <p className="text-xs text-center text-text-secondary truncate w-full">{user.name.split(' ')[0]}</p>
                    </button>
                  ))}
                </div>
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
              <img src={selectedUser.avatar} className="h-10 w-10 rounded-full" />
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
                  <span className="uppercase text-sm">Slide to Send</span>
                  <div className="ml-2 flex space-x-1 opacity-50">
                     <ArrowRight size={14} />
                     <ArrowRight size={14} className="-ml-2" />
                  </div>
                </div>
              </motion.div>

              {/* The Draggable Thumb */}
              <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 280 }} // width minus padding roughly
                dragElastic={0.05}
                onDragEnd={handleDragEnd}
                style={{ x }}
                className="absolute z-10 ml-2 h-16 w-16 cursor-grab active:cursor-grabbing rounded-full bg-bg-secondary border border-white/10 flex justify-center items-center shadow-lg"
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
