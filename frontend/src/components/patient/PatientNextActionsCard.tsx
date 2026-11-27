import React from 'react';
import {
  CheckCircle2,
  Calendar,
  FileText,
  Wind,
  Pill,
  ArrowRight,
  Sparkles,
  MessageSquare,
  Clock,
  ShieldCheck,
} from 'lucide-react';

interface PatientNextActionsCardProps {
  hasCompletedCheckInToday: boolean;
  onOpenCheckIn: () => void;
  onOpenBreathing: () => void;
  onOpenReport: () => void;
  onOpenChat: () => void;
  onOpenMedications?: () => void;
  unreviewedAlertsCount?: number;
  upcomingAppointment?: any;
  className?: string;
}

export const PatientNextActionsCard: React.FC<PatientNextActionsCardProps> = ({
  hasCompletedCheckInToday,
  onOpenCheckIn,
  onOpenBreathing,
  onOpenReport,
  onOpenChat,
  onOpenMedications,
  unreviewedAlertsCount = 0,
  upcomingAppointment,
  className = '',
}) => {
  return (
    <div className={`p-6 bg-cream rounded-2xl border border-[#E2DBD0] shadow-warm-sm space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E2DBD0]/70 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-sage-soft text-sage-dark flex items-center justify-center border border-sage/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-semibold text-charcoal">
              What Should I Do Next?
            </h3>
            <p className="text-xs text-charcoal-muted">
              Relevant steps tailored to your records today.
            </p>
          </div>
        </div>

        <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-ivory text-charcoal border border-[#E2DBD0]">
          Personalized Guidance
        </span>
      </div>

      {/* Action Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        
        {/* Action 1: Daily Check-in */}
        <div className="p-4 rounded-xl bg-white border border-[#E2DBD0] shadow-warm-sm flex flex-col justify-between space-y-3 hover:border-sage/40 transition-all">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-sage-dark">
                Daily Routine
              </span>
              {hasCompletedCheckInToday ? (
                <CheckCircle2 className="w-4 h-4 text-sage-dark" />
              ) : (
                <Clock className="w-4 h-4 text-peach" />
              )}
            </div>
            <h4 className="text-xs font-bold text-charcoal">
              {hasCompletedCheckInToday ? "Today's Check-in Complete" : "Log Today's Symptoms (<90s)"}
            </h4>
            <p className="text-[11px] text-charcoal-muted leading-relaxed">
              {hasCompletedCheckInToday
                ? "You've recorded today's check-in. Your data is organized for your doctor."
                : "A 60-second check-in captures today's hot flashes, sleep, and emotional patterns."}
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenCheckIn}
            className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              hasCompletedCheckInToday
                ? 'bg-ivory text-charcoal hover:bg-oat-light border border-[#E2DBD0]'
                : 'bg-sage-dark hover:bg-sage text-cream shadow-warm-sm'
            }`}
          >
            <span>{hasCompletedCheckInToday ? 'Review Today’s Entry' : 'Start Check-in'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Action 2: Doctor Visit Preparation & Dossier */}
        <div className="p-4 rounded-xl bg-white border border-[#E2DBD0] shadow-warm-sm flex flex-col justify-between space-y-3 hover:border-sage/40 transition-all">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-teal-dark">
                Clinical Preparation
              </span>
              <FileText className="w-4 h-4 text-teal" />
            </div>
            <h4 className="text-xs font-bold text-charcoal">
              Doctor Consultation Summary
            </h4>
            <p className="text-[11px] text-charcoal-muted leading-relaxed">
              {upcomingAppointment
                ? upcomingAppointment.date_time
                  ? `You have an appointment on ${new Date(upcomingAppointment.date_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}. Preview your doctor summary.`
                  : 'You have an appointment scheduled. Preview your doctor summary.'
                : 'Preview or download your structured 30-day symptom trend dossier for your appointments.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenReport}
            className="w-full py-2 px-3 rounded-lg bg-cream hover:bg-oat-light text-charcoal border border-[#E2DBD0] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-warm-sm"
          >
            <span>Preview Health Report</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Action 3: In-the-moment Relief (Paced Breathing) */}
        <div className="p-4 rounded-xl bg-white border border-[#E2DBD0] shadow-warm-sm flex flex-col justify-between space-y-3 hover:border-sage/40 transition-all sm:col-span-2 lg:col-span-1">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-charcoal-muted">
                Immediate Relief
              </span>
              <Wind className="w-4 h-4 text-teal" />
            </div>
            <h4 className="text-xs font-bold text-charcoal">
              Paced Breathing (4-7-8)
            </h4>
            <p className="text-[11px] text-charcoal-muted leading-relaxed">
              Feeling a hot flash, night sweat, or anxiety surge? A 3-minute guided rhythm cools your body and calms your nervous system.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenBreathing}
            className="w-full py-2 px-3 rounded-lg bg-teal-soft hover:bg-teal/20 text-teal-dark border border-teal/20 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-warm-sm"
          >
            <span>Start Breathing Guide</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
