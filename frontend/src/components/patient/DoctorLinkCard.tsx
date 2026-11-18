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
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
      <div className="flex items-center space-x-3 mb-3">
        <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
          <Stethoscope className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">Care Team & Attending Clinician</h3>
          <p className="text-xs text-slate-500">Pair with your doctor using their unique practice code</p>
        </div>
      </div>

      {linkedDoctorName ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-emerald-800">
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <div>
              <span className="font-bold">Active Clinician Link: </span>
              <span className="font-semibold">{linkedDoctorName}</span>
            </div>
          </div>
          <span className="text-[10px] text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full font-bold">
            Synchronized
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
              className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold uppercase tracking-wider focus:ring-2 focus:ring-teal-500 focus:bg-white focus:outline-none"
            />
            <button
              type="submit"
              disabled={isLoading || !practiceCode}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center space-x-1"
            >
              <span>{isLoading ? 'Linking...' : 'Connect'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {message && (
            <p className={`text-xs ${message.type === 'success' ? 'text-emerald-700' : 'text-rose-600'}`}>
              {message.text}
            </p>
          )}

          <p className="text-[11px] text-slate-400 flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
            <span>Enables automatic anomaly alerting and clinical summary synchronization with your doctor.</span>
          </p>
        </form>
      )}
    </div>
  );
};
