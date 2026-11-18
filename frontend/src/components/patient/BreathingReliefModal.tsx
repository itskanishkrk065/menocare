import React, { useState, useEffect } from 'react';
import { X, Wind, Heart, Sparkles, CheckCircle2 } from 'lucide-react';

interface BreathingReliefModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BreathingReliefModal: React.FC<BreathingReliefModalProps> = ({
  isOpen,
  onClose,
}) => {
  // Stages: 'inhale' (4s), 'hold' (7s), 'exhale' (8s)
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [secondsLeft, setSecondsLeft] = useState<number>(4);
  const [cyclesCompleted, setCyclesCompleted] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(true);

  useEffect(() => {
    if (!isOpen || !isActive) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev > 1) {
          return prev - 1;
        }

        // Phase transition
        if (phase === 'inhale') {
          setPhase('hold');
          return 7;
        } else if (phase === 'hold') {
          setPhase('exhale');
          return 8;
        } else {
          setPhase('inhale');
          setCyclesCompleted((c) => c + 1);
          return 4;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isActive, phase]);

  if (!isOpen) return null;

  const getPhaseInstructions = () => {
    switch (phase) {
      case 'inhale':
        return {
          title: 'Inhale Slowly',
          instruction: 'Breathe in quietly through your nose, expanding your diaphragm.',
          color: 'from-teal-400 to-emerald-400',
          scale: 'scale-110',
          ring: 'ring-teal-300',
        };
      case 'hold':
        return {
          title: 'Hold Breath',
          instruction: 'Gently retain your breath. Keep shoulders relaxed and soft.',
          color: 'from-amber-400 to-rose-400',
          scale: 'scale-115',
          ring: 'ring-amber-300',
        };
      case 'exhale':
        return {
          title: 'Exhale Completely',
          instruction: 'Release all air through your mouth with a gentle whooshing sound.',
          color: 'from-indigo-400 to-blue-400',
          scale: 'scale-95',
          ring: 'ring-indigo-300',
        };
    }
  };

  const meta = getPhaseInstructions();

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 sm:p-8 text-center space-y-6 relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-teal-800 rounded-full text-[11px] font-bold border border-teal-200/80 mb-2">
            <Wind className="w-3.5 h-3.5 text-teal-600" />
            <span>Acute Hot Flash & Vasomotor Relief</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">4-7-8 Parasympathetic Reset</h2>
          <p className="text-xs text-slate-500 mt-1">
            Proven to widen the hypothalamic thermoneutral zone and relieve palpitations.
          </p>
        </div>

        {/* Pulsing Breathing Circle */}
        <div className="py-6 flex items-center justify-center">
          <div
            className={`w-48 h-48 rounded-full bg-gradient-to-tr ${meta.color} p-1 shadow-xl transition-all duration-1000 ease-in-out flex items-center justify-center ring-8 ${meta.ring} ${meta.scale}`}
          >
            <div className="w-full h-full bg-white/90 backdrop-blur-xs rounded-full flex flex-col items-center justify-center p-4">
              <span className="text-3xl font-black text-slate-900 tracking-tight">{secondsLeft}s</span>
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 mt-1">
                {meta.title}
              </span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-1">
          <p className="font-semibold text-slate-800">{meta.instruction}</p>
          <div className="text-[11px] text-slate-500 pt-1">
            Cycles Completed: <b className="text-teal-700">{cyclesCompleted}</b> (Recommended: 4 cycles)
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2 justify-center">
          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all"
          >
            {isActive ? 'Pause Session' : 'Resume Session'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-teal-600/20"
          >
            Done & Relaxed
          </button>
        </div>
      </div>
    </div>
  );
};
