import React, { useState } from 'react';
import { Copy, Check, QrCode, Stethoscope, ShieldCheck } from 'lucide-react';

interface PracticeCodeCardProps {
  practiceCode: string | null;
  doctorName: string;
  clinicName: string | null;
}

export const PracticeCodeCard: React.FC<PracticeCodeCardProps> = ({ practiceCode, doctorName, clinicName }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (practiceCode) {
      navigator.clipboard.writeText(practiceCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-cream rounded-[26px] p-6 border border-[#E2DBD0] shadow-warm-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="space-y-1.5">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-soft text-teal-dark border border-teal/20 flex items-center justify-center font-bold shadow-warm-sm">
            <Stethoscope className="w-5 h-5 text-teal" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-serif text-lg font-semibold text-charcoal">
                Clinic Pairing Code
              </h2>
              <span className="text-xs bg-teal-soft text-teal-dark border border-teal/20 px-2.5 py-0.5 rounded-full font-medium">
                Direct Patient Link
              </span>
            </div>
            <p className="text-xs text-charcoal-muted">{clinicName || "Women's Midlife Health & Reproductive Endocrinology"}</p>
          </div>
        </div>

        <p className="text-xs text-charcoal-muted max-w-2xl leading-relaxed">
          Provide this practice code to your patients so their symptom logs, period tracking, and lab reports connect directly to your clinical workspace.
        </p>
      </div>

      <div className="bg-ivory border border-[#E2DBD0] rounded-xl px-4 py-2.5 flex items-center space-x-3.5 shrink-0 self-start sm:self-auto shadow-warm-sm">
        <div className="text-right">
          <span className="text-xs text-charcoal-muted font-medium block">Pairing Code</span>
          <span className="text-base font-mono font-bold tracking-widest text-teal-dark">
            {practiceCode || 'DR-SHARMA-91A'}
          </span>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center space-x-1.5 px-3 py-2 bg-sage-dark hover:bg-[#3E5437] text-white rounded-xl text-xs font-medium transition-colors shadow-warm-sm"
        >
          {copied ? <Check className="w-4 h-4 text-cream" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
    </div>
  );
};
