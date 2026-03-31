import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Wallet, Check, AlertCircle } from 'lucide-react';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import confetti from 'canvas-confetti';
import { walletService } from '../services/walletService';

export default function AddMoneyPage() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [refNumber, setRefNumber] = useState('');
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    let isMounted = true;
    setBalanceLoading(true);
    setLoadError('');

    walletService
      .getBalance()
      .then((res) => {
        if (isMounted) {
          setCurrentBalance(Number(res.balance || 0));
        }
      })
      .catch((error: any) => {
        if (isMounted) {
          setLoadError(error?.response?.data?.message || 'Unable to load wallet balance');
        }
      })
      .finally(() => {
        if (isMounted) {
          setBalanceLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChipSelect = async (val: string) => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch {}
    setSubmitError('');
    setAmount(val);
  };

  const handleAddMoney = async () => {
    if (!amount || Number(amount) <= 0 || loading) {
      try {
        await Haptics.impact({ style: ImpactStyle.Heavy });
      } catch {}
      return;
    }

    setLoading(true);
    setSubmitError('');

    try {
      const res = await walletService.addMoney(Number(amount));
      
      try {
        await Haptics.notification({ type: NotificationType.Success });
      } catch {}

      setRefNumber(res.transaction?.reference_no || String(res.transaction?.id || 'N/A'));
      setIsSuccess(true);
      
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#4285F4', '#34A853', '#EA4335', '#FBBC04']
      });

      setTimeout(() => {
        navigate('/home', { replace: true });
      }, 2500);
    } catch (e: any) {
      console.error(e);
      setSubmitError(e?.response?.data?.message || 'Unable to add money right now');
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-screen flex-col bg-bg-primary text-text-primary">
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-brand-primary/20"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-primary shadow-[0_0_40px_rgba(66,133,244,0.5)]">
               <Check size={40} strokeWidth={3} className="text-bg-primary" />
            </div>
          </motion.div>
          
          <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="font-heading text-3xl font-bold text-white">
             Added to Wallet
          </motion.h2>
          
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="mt-4 flex flex-col items-center">
            <p className="text-text-secondary">Successfully deposited</p>
            <div className="mt-4 flex items-center justify-center">
              <span className="font-heading text-[48px] font-bold text-brand-primary">₹{Number(amount).toLocaleString('en-IN')}</span>
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

  return (
    <div className="flex h-screen flex-col bg-bg-primary text-text-primary">
      {/* Header */}
      <div className="flex items-center px-6 pt-6 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="rounded-full bg-white/5 p-3 text-text-secondary transition-colors active:bg-white/10 active:text-white"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="ml-4 font-heading text-xl font-bold text-white">Add Money</h1>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.4 }}
        className="flex flex-1 flex-col overflow-hidden"
      >
        <div className="flex flex-col items-center px-6 pt-6">
          
          {/* Current Balance Glass Card */}
          <div className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary/20">
                <Wallet size={20} className="text-brand-primary" />
              </div>
              <span className="font-medium text-text-secondary">Current Balance</span>
            </div>
              <span className="font-mono text-lg font-bold text-white">
                {balanceLoading
                  ? 'Loading...'
                  : `₹${currentBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
              </span>
          </div>

            {loadError && (
              <p className="mt-3 w-full text-sm font-medium text-accent-send">{loadError}</p>
            )}

          {/* Amount Input */}
          <div className="flex w-full justify-center items-center py-12">
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
                setSubmitError('');
                setAmount(val);
              }}
            />
          </div>

          {/* Quick Amount Chips */}
          <div className="flex space-x-3 justify-center w-full">
            {['500', '1000', '5000'].map((chip) => (
              <button
                key={chip}
                onClick={() => handleChipSelect(chip)}
                className="rounded-full border border-brand-primary/30 bg-brand-primary/10 px-6 py-2.5 text-sm font-semibold text-brand-primary transition-all active:scale-95 hover:bg-brand-primary/20"
              >
                +₹{chip}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-auto px-6 pb-10 flex flex-col space-y-6">
          
          {/* Note Section */}
          <div className="flex items-start space-x-3 rounded-xl bg-accent-warning/10 p-4 border border-accent-warning/20">
            <AlertCircle size={20} className="text-accent-warning flex-shrink-0 mt-0.5" />
            <div className="text-sm text-accent-warning/90">
              <p className="font-semibold mb-1">Note: This is a demo app.</p>
              <p>No real money is involved. Adding funds simply credits your virtual wallet balance.</p>
            </div>
          </div>

          <button
            onClick={handleAddMoney}
            disabled={!amount || Number(amount) <= 0 || loading}
            className={`group flex w-full items-center justify-center space-x-2 rounded-2xl py-4 font-semibold text-white transition-all active:scale-[0.98] ${
              !amount || Number(amount) <= 0 || loading
                ? 'bg-white/10 text-white/50 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#4285F4] to-[#5B9EF7] shadow-[0_8px_20px_-6px_rgba(66,133,244,0.6)]'
            }`}
          >
            <span>{loading ? 'Processing...' : 'Add to Wallet'}</span>
            <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
          </button>

          {submitError && (
            <p className="text-center text-sm font-medium text-accent-send">{submitError}</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
