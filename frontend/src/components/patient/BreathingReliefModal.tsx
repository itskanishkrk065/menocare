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
          instruction: 'Breathe in gently through your nose, letting your belly expand.',
          color: 'from-sage-dark to-sage',
          scale: 'scale-105',
          ring: 'ring-sage/30',
        };
      case 'hold':
        return {
          title: 'Hold Gently',
          instruction: 'Pause and retain your breath comfortably. Keep shoulders relaxed and soft.',
          color: 'from-sand to-[#B07D38]',
          scale: 'scale-110',
          ring: 'ring-sand/30',
        };
      case 'exhale':
        return {
          title: 'Exhale Slowly',
          instruction: 'Release all air gently through your mouth with a slow, smooth breath out.',
          color: 'from-teal to-teal-dark',
          scale: 'scale-95',
          ring: 'ring-teal/30',
        };
    }
  };

  const meta = getPhaseInstructions();

  return (
    <div className="fixed inset-0 z-50 bg-charcoal/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-cream rounded-t-[28px] sm:rounded-2xl max-w-md w-full border-t sm:border border-[#E2DBD0] shadow-warm-lg p-5 sm:p-8 text-center space-y-5 relative max-h-[92vh] sm:max-h-[88vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
        
        {/* Mobile Swipe Grab Handle */}
        <div className="sm:hidden w-full -mt-2 pb-2 flex justify-center">
          <div className="w-12 h-1.5 rounded-full bg-[#E2DBD0]" />
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-ivory hover:bg-oat-light text-charcoal-muted hover:text-charcoal border border-[#E2DBD0] flex items-center justify-center transition-colors min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sage-soft text-sage-dark rounded-full text-xs font-semibold mb-2">
            <Wind className="w-3.5 h-3.5 text-sage-dark" />
            <span>Hot Flash & Stress Relief</span>
          </div>
          <h2 className="text-xl font-serif font-semibold text-charcoal">Calming 4-7-8 Breathing</h2>
          <p className="text-xs text-charcoal-muted mt-1 text-pretty">
            A simple, rhythmic breathing exercise to help calm sudden heat, ease heart racing, and relax your nervous system.
          </p>
        </div>

        {/* Pulsing Breathing Circle */}
        <div className="py-6 flex items-center justify-center">
          <div
            className={`w-44 h-44 rounded-full bg-gradient-to-tr ${meta.color} p-1 shadow-warm-md transition-all duration-1000 ease-out flex items-center justify-center ring-8 ${meta.ring} ${meta.scale}`}
          >
            <div className="w-full h-full bg-white/95 rounded-full flex flex-col items-center justify-center p-4">
              <span className="text-3xl font-serif font-bold text-charcoal tracking-tight">{secondsLeft}s</span>
              <span className="text-xs font-semibold text-sage-dark mt-1">
                {meta.title}
              </span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white p-4 rounded-xl border border-[#E2DBD0] text-xs text-charcoal space-y-1">
          <p className="font-medium text-charcoal text-pretty">{meta.instruction}</p>
          <div className="text-xs text-charcoal-muted pt-1">
            Cycles Completed: <strong className="text-sage-dark">{cyclesCompleted}</strong> (4 cycles recommended)
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            className="px-4 py-2.5 min-h-[44px] bg-ivory hover:bg-oat-light text-charcoal rounded-xl text-xs font-medium border border-[#E2DBD0] transition-colors flex-1 sm:flex-none"
          >
            {isActive ? 'Pause' : 'Resume'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 min-h-[44px] bg-sage-dark hover:bg-[#3E5437] text-white rounded-xl text-xs font-medium transition-colors flex-1 sm:flex-none shadow-warm-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
