import { useParams, useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';

export default function TransactionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen flex-col bg-bg-primary text-text-primary px-6 pt-6">
      <button onClick={() => navigate(-1)} className="rounded-full bg-white/5 p-3 w-12 h-12 flex items-center justify-center text-text-secondary">
        <ArrowLeft size={24} />
      </button>
      <div className="flex-1 flex items-center justify-center flex-col">
        <h1 className="text-xl font-bold font-heading">Transaction Detail Placeholder</h1>
        <p className="text-text-secondary mt-2">Transaction ID: {id}</p>
      </div>
    </div>
  );
}
