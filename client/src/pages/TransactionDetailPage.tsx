import { useParams, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Share2, Copy } from 'lucide-react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useState, useEffect } from 'react';
import { transactionService } from '../services/transactionService';

// --- TYPES ---
interface TransactionDetail {
  id: string;
  reference_no?: string;
  status?: string;
  type: 'sent' | 'received' | 'added';
  amount: number;
  description: string;
  created_at: string;
  party_name?: string;
}

export default function TransactionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tx, setTx] = useState<TransactionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) {
      setError('Invalid transaction id');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    transactionService
      .getTransactionDetail(id)
      .then((res) => {
        if (res && res.transaction) {
          setTx(res.transaction);
        } else {
          setTx(null);
          setError('Transaction not found');
        }
      })
      .catch((fetchError: any) => {
        console.error(fetchError);
        setTx(null);
        setError(fetchError?.response?.data?.message || 'Unable to load transaction details');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
     return <div className="flex h-screen items-center justify-center bg-bg-primary text-white">Loading...</div>;
  }

  if (!tx) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-bg-primary px-6 text-center text-white">
        <p className="text-sm font-medium text-accent-send">{error || 'Transaction not found'}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 rounded-xl bg-white/10 px-6 py-2 text-sm font-semibold text-white"
        >
          Go Back
        </button>
      </div>
    );
  }

  const isDebit = tx.type === 'sent';
  const isAdd = tx.type === 'added';
  const prefix = isDebit ? '-' : '+';
  const colorClass = isDebit ? 'text-accent-send' : isAdd ? 'text-brand-primary' : 'text-accent-receive';

  const handleShare = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch {}

    const reference = tx.reference_no || tx.id;
    const shareText = `AdiPay Transaction\nReference: ${reference}\nAmount: ₹${Number(tx.amount).toFixed(2)}`;

    if (navigator.share) {
      try {
        await navigator.share({ text: shareText });
      } catch {
        // Ignore share cancellation errors.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard errors.
    }
  };

  const handleCopyRef = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch {}

    const reference = tx.reference_no || tx.id;

    try {
      await navigator.clipboard.writeText(reference);
    } catch {
      // Ignore clipboard errors.
    }

    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
              className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent-receive shadow-[0_0_20px_rgba(52,168,83,0.3)]`}
            >
              <Check size={32} strokeWidth={3} className="text-bg-primary" />
            </motion.div>
            <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-text-tertiary">
              Transaction Completed
            </p>
            <div className="flex items-center justify-center">
              <span className={`mr-1 font-mono text-2xl font-bold ${colorClass}`}>{prefix}</span>
              <h2 className="font-mono text-[42px] font-bold tracking-tight text-white leading-none">
                ₹{Number(tx.amount).toFixed(2)}
              </h2>
            </div>
          </div>

          {/* Transaction Metadata Rows */}
          <div className="pt-2">
            <DataRow label={isDebit ? "To" : isAdd ? "Funding Source" : "From"} value={tx.party_name || ((tx.type === 'added' || tx.type === 'received') ? 'Wallet' : 'Unknown')} />
            <DataRow label="Date" value={new Date(tx.created_at).toLocaleDateString()} />
            <DataRow label="Time" value={new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
            
            {/* Custom Interactive Ref Row */}
            <div className="flex items-center justify-between border-b border-white/5 py-3.5 last:border-0">
              <span className="text-sm font-medium text-text-tertiary">Ref No.</span>
              <button onClick={handleCopyRef} className="flex items-center space-x-2 text-right transition-opacity active:opacity-50">
                <span className="text-sm font-semibold text-white">{tx.reference_no || tx.id}</span>
                {copied ? <Check size={14} className="text-accent-receive" /> : <Copy size={14} className="text-text-tertiary" />}
              </button>
            </div>
            
            {tx.description && <DataRow label="Note" value={`"${tx.description}"`} valueClass="text-text-secondary italic" />}
            <DataRow
              label="Status"
              value={tx.status || 'COMPLETED'}
              valueClass={(tx.status || 'COMPLETED').toUpperCase() === 'COMPLETED' ? 'text-accent-receive' : 'text-accent-warning'}
            />
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
