import { useParams, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Share2, Copy } from 'lucide-react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useState } from 'react';

// Mock Transaction Data Retrieval
const getMockTx = (id: string | undefined) => {
  // Normally would fetch from Zustand store or API based on ID
  return {
    id: id || 'ADP-73010482B',
    type: 'sent', // 'sent', 'received', or 'added'
    name: 'Parth Kondhawale',
    amount: 500.00,
    date: '30 Mar 2026',
    time: '2:30 PM',
    refNo: id || 'ADP-73010482B',
    note: 'Lunch',
    status: 'Completed'
  };
};

export default function TransactionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const tx = getMockTx(id);
  const [copied, setCopied] = useState(false);

  const isDebit = tx.type === 'sent';
  const isAdd = tx.type === 'added';
  const prefix = isDebit ? '-' : '+';
  const colorClass = isDebit ? 'text-accent-send' : isAdd ? 'text-brand-primary' : 'text-accent-receive';

  const handleShare = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch {}
    // In Capacitor, this would call Share.share({...})
  };

  const handleCopyRef = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    // In real app, write to clipboard
  };

  const DataRow = ({ label, value, valueClass = 'text-white' }: { label: string, value: string, valueClass?: string }) => (
    <div className="flex items-center justify-between border-b border-white/5 py-3.5 last:border-0">
      <span className="text-sm font-medium text-text-tertiary">{label}</span>
      <span className={`text-sm font-semibold text-right ${valueClass}`}>{value}</span>
    </div>
  );

  return (
    <div className="flex h-screen flex-col bg-bg-primary text-text-primary">
      
      {/* Header */}
      <div className="flex items-center px-6 pt-6 pb-2">
        <button
          onClick={() => navigate(-1)}
          className="rounded-full bg-white/5 p-3 text-text-secondary transition-colors active:bg-white/10 active:text-white"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="ml-4 font-heading text-xl font-bold text-white">Transaction Details</h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex-1 overflow-y-auto px-6 pt-4 pb-24"
      >
        {/* Detail Card */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-md">
          
          {/* Decorative background glow based on transaction type */}
          <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full ${isDebit ? 'bg-accent-send' : isAdd ? 'bg-brand-primary' : 'bg-accent-receive'} opacity-10 blur-3xl filter pointer-events-none`} />

          {/* Status Block */}
          <div className="flex flex-col items-center border-b border-white/5 pb-8 pt-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.1, stiffness: 200, damping: 20 }}
              className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full ${tx.status === 'Completed' ? 'bg-accent-receive' : 'bg-accent-warning'} shadow-[0_0_20px_rgba(52,168,83,0.3)]`}
            >
              <Check size={32} strokeWidth={3} className="text-bg-primary" />
            </motion.div>
            <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-text-tertiary">
              Transaction {tx.status}
            </p>
            <div className="flex items-center justify-center">
              <span className={`mr-1 font-mono text-2xl font-bold ${colorClass}`}>{prefix}</span>
              <h2 className="font-mono text-[42px] font-bold tracking-tight text-white leading-none">
                ₹{tx.amount.toFixed(2)}
              </h2>
            </div>
          </div>

          {/* Transaction Metadata Rows */}
          <div className="pt-2">
            <DataRow label={isDebit ? "To" : isAdd ? "Funding Source" : "From"} value={tx.name} />
            <DataRow label="Date" value={tx.date} />
            <DataRow label="Time" value={tx.time} />
            
            {/* Custom Interactive Ref Row */}
            <div className="flex items-center justify-between border-b border-white/5 py-3.5 last:border-0">
              <span className="text-sm font-medium text-text-tertiary">Ref No.</span>
              <button onClick={handleCopyRef} className="flex items-center space-x-2 text-right transition-opacity active:opacity-50">
                <span className="text-sm font-semibold text-white">{tx.refNo}</span>
                {copied ? <Check size={14} className="text-accent-receive" /> : <Copy size={14} className="text-text-tertiary" />}
              </button>
            </div>
            
            {tx.note && <DataRow label="Note" value={`"${tx.note}"`} valueClass="text-text-secondary italic" />}
            <DataRow label="Status" value={tx.status} valueClass={tx.status === 'Completed' ? 'text-accent-receive' : 'text-accent-warning'} />
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleShare}
            className="flex w-full items-center justify-center space-x-2 rounded-2xl bg-white/10 px-6 py-4 font-semibold text-white transition-all active:scale-95 active:bg-white/20"
          >
            <Share2 size={20} />
            <span>Share Receipt</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
