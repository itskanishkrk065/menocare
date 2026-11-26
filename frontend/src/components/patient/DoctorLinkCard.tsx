import React, { useState } from 'react';
import { Stethoscope, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { api } from '../../api/client';

interface DoctorLinkCardProps {
  linkedDoctorName: string | null;
  onLinked: () => void;
}

export const DoctorLinkCard: React.FC<DoctorLinkCardProps> = ({ linkedDoctorName, onLinked }) => {
  const [practiceCode, setPracticeCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!practiceCode.trim()) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const res = await api.linkDoctor(practiceCode);
      setMessage({ type: 'success', text: res.message });
      setPracticeCode('');
      onLinked();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to link doctor.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-cream rounded-2xl p-5 border border-[#E2DBD0] shadow-warm-sm">
      <div className="flex items-center space-x-3 mb-3">
        <div className="w-9 h-9 rounded-xl bg-teal-soft text-teal-dark flex items-center justify-center">
          <Stethoscope className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-serif font-semibold text-charcoal">Connected Doctor</h3>
          <p className="text-xs text-charcoal-muted">Link your account with your doctor's practice code</p>
        </div>
      </div>

      {linkedDoctorName ? (
        <div className="bg-sage-soft border border-sage/30 rounded-xl p-3 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-sage-dark">
            <CheckCircle className="w-4 h-4 text-sage-dark flex-shrink-0" />
            <div>
              <span className="font-semibold">Connected With: </span>
              <span className="font-bold">{linkedDoctorName}</span>
            </div>
          </div>
          <span className="text-xs text-sage-dark bg-white/70 px-2.5 py-0.5 rounded-full font-medium">
            Active
          </span>
        </div>
      ) : (
        <form onSubmit={handleLink} className="space-y-3">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="e.g. DR-SHARMA-91A"
              value={practiceCode}
              onChange={(e) => setPracticeCode(e.target.value.toUpperCase())}
              className="flex-1 bg-white border border-[#E2DBD0] rounded-xl px-3 py-2 text-xs font-mono font-bold uppercase tracking-wider focus:border-sage-dark focus:outline-none"
            />
            <button
              type="submit"
              disabled={isLoading || !practiceCode}
              className="px-4 py-2 bg-sage-dark hover:bg-[#3E5437] text-white rounded-xl text-xs font-medium transition-colors disabled:opacity-50 flex items-center space-x-1"
            >
              <span>{isLoading ? 'Connecting...' : 'Connect'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {message && (
            <p className={`text-xs ${message.type === 'success' ? 'text-sage-dark' : 'text-error'}`}>
              {message.text}
            </p>
          )}

          <p className="text-xs text-charcoal-muted flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-sage-dark flex-shrink-0" />
            <span>Allows your doctor to review your symptom logs before visits.</span>
          </p>
        </form>
      )}
    </div>
  );
};
