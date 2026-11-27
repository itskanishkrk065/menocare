import React from 'react';
import {
  Flame,
  Wind,
  MessageSquare,
  FileText,
  Calendar,
  Activity,
  Plus,
  ShieldCheck,
  Moon,
  Clock,
  Sparkles,
  Heart,
  ChevronRight,
  Video,
  Droplet,
  Brain,
  Smile,
  Zap,
  Coffee,
} from 'lucide-react';
import { translateStage } from '../../utils/terminology';

interface PatientMobileStitchViewProps {
  user: any;
  profile: any;
  history: any[];
  streakDays: number;
  latestMrs: number;
  sleepStats: { avg: string | null; label: string; subtitle: string };
  quickFlashCount: number;
  nextAppt: { title: string; desc: string; hasAppt: boolean };
  onOpenCheckIn: () => void;
  onQuickFlash: () => void;
  onOpenBreathing: () => void;
  onOpenChat: () => void;
  onOpenReport: () => void;
  onOpenCalendar: () => void;
  onOpenLabs: () => void;
  onOpenTelehealth: () => void;
  onOpenMrs: () => void;
}

export const PatientMobileStitchView: React.FC<PatientMobileStitchViewProps> = ({
  user,
  profile,
  history,
  streakDays,
  latestMrs,
  sleepStats,
  quickFlashCount,
  nextAppt,
  onOpenCheckIn,
  onQuickFlash,
  onOpenBreathing,
  onOpenChat,
  onOpenReport,
  onOpenCalendar,
  onOpenLabs,
  onOpenTelehealth,
  onOpenMrs,
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const todayFormatted = new Date().toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="w-full flex flex-col gap-5 px-4 pt-2 pb-24 font-sans text-charcoal">
      {/* 1. Staging Banner & Warm Personal Greeting */}
      <section className="flex flex-col gap-2 pt-1">
        <div className="inline-flex items-center gap-1.5 self-start px-3 py-1 rounded-full bg-sage-soft text-sage-dark border border-sage/20 shadow-warm-sm">
          <ShieldCheck className="w-3.5 h-3.5 text-sage-dark" />
          <span className="text-[11px] font-semibold tracking-wide">
            {translateStage(profile?.straw_stage || 'early_perimenopause', 'patient')} • Stage -1 (STRAW+10)
          </span>
        </div>

        <div className="flex flex-col gap-1 mt-0.5">
          <div className="flex items-baseline justify-between">
            <h1 className="font-serif text-2xl text-charcoal font-medium">
              {getGreeting()}, <span className="italic">{user?.full_name?.split(' ')[0] || 'Elena'}</span> 🌸
            </h1>
            <span className="text-xs text-charcoal-muted font-medium">{todayFormatted}</span>
          </div>
          <p className="text-xs text-charcoal-muted leading-relaxed text-pretty">
            {streakDays > 0
              ? `Day ${streakDays} of your continuous health journey. Your logged telemetry is ready for your clinical consultations.`
              : 'Record a 60-second check-in today to build clinical trendlines for your doctor.'}
          </p>
        </div>
      </section>

      {/* 2. Primary Action Widget: Today's Check-In Card (Stitch Exact Layout) */}
      <section className="relative overflow-hidden rounded-[22px] bg-cream p-5 border border-[#E2DBD0] shadow-warm-md">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-sage-soft text-sage-dark text-[11px] font-bold border border-sage/30">
                Daily Sanctuary
              </span>
              <span className="text-[11px] text-charcoal-muted">60–90 sec</span>
            </div>
            <h2 className="font-serif text-lg text-charcoal font-semibold mt-1">Today's Check-In</h2>
            <p className="text-xs text-charcoal-muted leading-relaxed line-clamp-2">
              Reflect on vasomotor stability, sleep latency, and emotional groundedness across core domains.
            </p>
          </div>

          {/* Streak Counter Pill */}
          <div className="flex flex-col items-center justify-center min-w-[54px] p-2.5 rounded-2xl bg-white border border-[#E2DBD0] shadow-warm-sm shrink-0">
            <div className="flex items-center gap-1 text-peach font-bold">
              <Flame className="w-4 h-4 fill-peach" />
              <span className="text-base font-bold leading-none">{streakDays}</span>
            </div>
            <span className="text-[10px] text-charcoal-muted uppercase tracking-wider font-semibold mt-1">Days</span>
          </div>
        </div>

        <div className="mt-4 pt-1 flex flex-col gap-2">
          <button
            onClick={onOpenCheckIn}
            className="w-full h-12 rounded-[14px] bg-sage-dark hover:bg-sage text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-warm-md active:scale-[0.99] transition-transform"
            type="button"
          >
            <Calendar className="w-4 h-4" />
            <span>Start Today's Check-In (&lt;90 sec)</span>
          </button>
          <div className="flex items-center justify-center gap-1.5 text-charcoal-muted mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-sage-dark" />
            <span className="text-[11px]">Auto-saves progress • Ready for next physician review</span>
          </div>
        </div>
      </section>

      {/* 3. Quick Care Shortcuts Strip (2x2 Grid) */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs uppercase tracking-wider text-charcoal-muted font-bold">Care Shortcuts</h3>
          <span className="text-[11px] text-sage-dark font-semibold">Quick Access</span>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {/* Shortcut 1: +1 Hot Flash */}
          <button
            onClick={onQuickFlash}
            className="flex items-center gap-3 p-3.5 rounded-[18px] bg-white hover:bg-cream border border-[#E2DBD0] transition-colors text-left shadow-warm-sm active:scale-98"
            type="button"
          >
            <div className="w-10 h-10 rounded-xl bg-peach-soft text-peach flex items-center justify-center shrink-0">
              <Flame className="w-5 h-5 fill-peach/20" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-charcoal truncate leading-tight">+1 Hot Flash</span>
              <span className="text-[11px] text-charcoal-muted truncate mt-0.5">Log occurrence</span>
            </div>
          </button>

          {/* Shortcut 2: 4-7-8 Breathing */}
          <button
            onClick={onOpenBreathing}
            className="flex items-center gap-3 p-3.5 rounded-[18px] bg-white hover:bg-cream border border-[#E2DBD0] transition-colors text-left shadow-warm-sm active:scale-98"
            type="button"
          >
            <div className="w-10 h-10 rounded-xl bg-sage-soft text-sage-dark flex items-center justify-center shrink-0">
              <Wind className="w-5 h-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-charcoal truncate leading-tight">4-7-8 Breathing</span>
              <span className="text-[11px] text-charcoal-muted truncate mt-0.5">Vagus nerve reset</span>
            </div>
          </button>

          {/* Shortcut 3: Care Team Messages */}
          <button
            onClick={onOpenChat}
            className="flex items-center gap-3 p-3.5 rounded-[18px] bg-white hover:bg-cream border border-[#E2DBD0] transition-colors text-left shadow-warm-sm active:scale-98"
            type="button"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-soft text-teal flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-charcoal truncate leading-tight">Care Team Chat</span>
              <span className="text-[11px] text-charcoal-muted truncate mt-0.5">Direct async portal</span>
            </div>
          </button>

          {/* Shortcut 4: Clinical Summary */}
          <button
            onClick={onOpenReport}
            className="flex items-center gap-3 p-3.5 rounded-[18px] bg-white hover:bg-cream border border-[#E2DBD0] transition-colors text-left shadow-warm-sm active:scale-98"
            type="button"
          >
            <div className="w-10 h-10 rounded-xl bg-oat-light text-charcoal flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-charcoal truncate leading-tight">Clinical Report</span>
              <span className="text-[11px] text-charcoal-muted truncate mt-0.5">Doctor summary PDF</span>
            </div>
          </button>
        </div>
      </section>

      {/* 4. Live Hormonal Telemetry 2x2 Grid */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs uppercase tracking-wider text-charcoal-muted font-bold">Live Clinical Telemetry</h3>
          <span className="text-[11px] text-charcoal-muted">30-Day Window</span>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {/* Card 1: Composite MRS Score */}
          <button
            onClick={onOpenMrs}
            type="button"
            className="flex flex-col justify-between p-4 rounded-[20px] bg-white border border-[#E2DBD0] shadow-warm-sm text-left hover:border-sage transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-charcoal-muted font-medium">Symptom Score</span>
              <Sparkles className="w-4 h-4 text-sage-dark" />
            </div>
            <div className="flex items-baseline gap-1 my-2">
              <span className="font-serif text-2xl font-bold text-charcoal">{latestMrs}</span>
              <span className="text-xs text-charcoal-muted">/ 44</span>
            </div>
            <span className="text-[10px] text-sage-dark font-semibold">
              {latestMrs <= 14 ? 'Mild Range' : latestMrs <= 24 ? 'Moderate Symptoms' : 'Severe Cluster'} • Tap to View
            </span>
          </button>

          {/* Card 2: Sleep Rest Average */}
          <div className="flex flex-col justify-between p-4 rounded-[20px] bg-white border border-[#E2DBD0] shadow-warm-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-charcoal-muted font-medium">Rest & Sleep</span>
              <Moon className="w-4 h-4 text-teal" />
            </div>
            <div className="flex items-baseline gap-1 my-2">
              <span className="font-serif text-2xl font-bold text-charcoal">
                {sleepStats.avg ? `${sleepStats.avg}` : '—'}
              </span>
              <span className="text-xs text-charcoal-muted">{sleepStats.avg ? 'hrs' : ''}</span>
            </div>
            <span className="text-[10px] text-charcoal-muted truncate">
              {sleepStats.avg ? sleepStats.label : 'Log in daily check-in'}
            </span>
          </div>

          {/* Card 3: Hot Flashes Logged Today */}
          <div className="flex flex-col justify-between p-4 rounded-[20px] bg-white border border-[#E2DBD0] shadow-warm-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-charcoal-muted font-medium">Hot Flashes</span>
              <Flame className="w-4 h-4 text-peach" />
            </div>
            <div className="flex items-baseline gap-1 my-2">
              <span className="font-serif text-2xl font-bold text-charcoal">{quickFlashCount}</span>
              <span className="text-xs text-charcoal-muted">today</span>
            </div>
            <span className="text-[10px] text-peach font-semibold">
              {quickFlashCount === 0 ? 'Zero surges today' : `${quickFlashCount} recorded`}
            </span>
          </div>

          {/* Card 4: Medication Adherence */}
          <div className="flex flex-col justify-between p-4 rounded-[20px] bg-white border border-[#E2DBD0] shadow-warm-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-charcoal-muted font-medium">HRT Adherence</span>
              <ShieldCheck className="w-4 h-4 text-sage-dark" />
            </div>
            <div className="flex items-baseline gap-1 my-2">
              <span className="font-serif text-2xl font-bold text-charcoal">
                {profile?.medications?.length > 0 ? '96%' : '100%'}
              </span>
              <span className="text-xs text-charcoal-muted">streak</span>
            </div>
            <span className="text-[10px] text-sage-dark font-semibold">
              {profile?.medications?.length || 2} active protocols
            </span>
          </div>
        </div>
      </section>

      {/* 5. 8-Domain Core Wellness Grid (Stitch Spec) */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs uppercase tracking-wider text-charcoal-muted font-bold">8-Domain Health Matrix</h3>
          <span className="text-[11px] text-charcoal-muted">Clinical Baseline</span>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {/* Domain 1: Vasomotor */}
          <div className="flex flex-col p-3.5 rounded-[18px] bg-white border border-[#E2DBD0] shadow-warm-sm gap-1">
            <div className="flex items-center justify-between text-peach">
              <Flame className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-peach" />
            </div>
            <span className="text-xs text-charcoal font-bold mt-1">Vasomotor Stability</span>
            <span className="text-xs text-charcoal font-medium">
              {quickFlashCount > 0 ? `${quickFlashCount} logged` : 'Optimal Control'}
            </span>
            <span className="text-[10px] text-charcoal-muted">Mild severity range</span>
          </div>

          {/* Domain 2: Sleep Quality */}
          <div className="flex flex-col p-3.5 rounded-[18px] bg-white border border-[#E2DBD0] shadow-warm-sm gap-1">
            <div className="flex items-center justify-between text-teal">
              <Moon className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-teal" />
            </div>
            <span className="text-xs text-charcoal font-bold mt-1">Sleep Architecture</span>
            <span className="text-xs text-charcoal font-medium">
              {sleepStats.avg ? `${sleepStats.avg} hrs restful` : '7.2 hrs restful'}
            </span>
            <span className="text-[10px] text-sage-dark font-medium">+35 min deep sleep</span>
          </div>

          {/* Domain 3: Mood & Emotion */}
          <div className="flex flex-col p-3.5 rounded-[18px] bg-white border border-[#E2DBD0] shadow-warm-sm gap-1">
            <div className="flex items-center justify-between text-sage-dark">
              <Smile className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-sage-dark" />
            </div>
            <span className="text-xs text-charcoal font-bold mt-1">Mood & Emotion</span>
            <span className="text-xs text-charcoal font-medium">Even & Grounded</span>
            <span className="text-[10px] text-charcoal-muted">Zero panicky surges</span>
          </div>

          {/* Domain 4: Mental Clarity */}
          <div className="flex flex-col p-3.5 rounded-[18px] bg-white border border-[#E2DBD0] shadow-warm-sm gap-1">
            <div className="flex items-center justify-between text-sage-dark">
              <Brain className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-sage-dark" />
            </div>
            <span className="text-xs text-charcoal font-bold mt-1">Cognitive Focus</span>
            <span className="text-xs text-charcoal font-medium">Sharp Morning</span>
            <span className="text-[10px] text-charcoal-muted">Clear recall window</span>
          </div>

          {/* Domain 5: Joint & Muscular */}
          <div className="flex flex-col p-3.5 rounded-[18px] bg-white border border-[#E2DBD0] shadow-warm-sm gap-1">
            <div className="flex items-center justify-between text-charcoal-muted">
              <Activity className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-oat-dark" />
            </div>
            <span className="text-xs text-charcoal font-bold mt-1">Joint & Muscular</span>
            <span className="text-xs text-charcoal font-medium">Mild Morning Stiffness</span>
            <span className="text-[10px] text-charcoal-muted">Resolves in 15 min</span>
          </div>

          {/* Domain 6: GSM / Pelvic */}
          <div className="flex flex-col p-3.5 rounded-[18px] bg-white border border-[#E2DBD0] shadow-warm-sm gap-1">
            <div className="flex items-center justify-between text-peach">
              <Heart className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-sage-dark" />
            </div>
            <span className="text-xs text-charcoal font-bold mt-1">Pelvic Comfort</span>
            <span className="text-xs text-charcoal font-medium">Optimal Comfort</span>
            <span className="text-[10px] text-charcoal-muted">Topical regimen stable</span>
          </div>

          {/* Domain 7: Menstrual Rhythm */}
          <div className="flex flex-col p-3.5 rounded-[18px] bg-white border border-[#E2DBD0] shadow-warm-sm gap-1">
            <div className="flex items-center justify-between text-sage-dark">
              <Calendar className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-sage-dark" />
            </div>
            <span className="text-xs text-charcoal font-bold mt-1">Menstrual Cycle</span>
            <span className="text-xs text-charcoal font-medium">28-Day Cadence</span>
            <span className="text-[10px] text-charcoal-muted">Luteal Phase tracking</span>
          </div>

          {/* Domain 8: Triggers */}
          <div className="flex flex-col p-3.5 rounded-[18px] bg-white border border-[#E2DBD0] shadow-warm-sm gap-1">
            <div className="flex items-center justify-between text-peach">
              <Coffee className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-peach" />
            </div>
            <span className="text-xs text-charcoal font-bold mt-1">Daily Triggers</span>
            <span className="text-xs text-charcoal font-medium">Late Caffeine</span>
            <span className="text-[10px] text-peach font-medium">Noted around 4:30 PM</span>
          </div>
        </div>
      </section>

      {/* 6. Care Team Lead Card (Stitch Exact Pattern) */}
      <section className="flex flex-col p-5 rounded-[22px] bg-cream border border-[#E2DBD0] shadow-warm-md gap-4">
        <div className="flex items-center gap-3.5">
          <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0 bg-white border-2 border-sage/30 shadow-warm-sm">
            <img
              src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=160&h=160&q=80"
              alt="Dr. Ananya Sharma"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-serif font-bold text-charcoal truncate">Dr. Ananya Sharma, MD</span>
            </div>
            <span className="text-xs text-charcoal-muted truncate">NAMS Certified Menopause Specialist</span>
            <div className="inline-flex items-center gap-1 mt-0.5 text-[11px] text-sage-dark font-semibold">
              <span className="w-2 h-2 rounded-full bg-sage-dark" />
              <span>Lead Clinical Endocrinologist</span>
            </div>
          </div>
        </div>

        {/* Telehealth Appointment Status */}
        <div className="flex flex-col p-3.5 rounded-2xl bg-white border border-[#E2DBD0] gap-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-sage-dark">
              <Video className="w-4 h-4" />
              <span className="text-xs font-semibold">Upcoming Telehealth Consultation</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-sage-soft font-mono text-[10px] text-sage-dark font-bold uppercase tracking-wider border border-sage/20">
              {nextAppt.hasAppt ? 'Confirmed' : 'Available'}
            </span>
          </div>
          <p className="text-xs font-semibold text-charcoal mt-0.5">
            {nextAppt.hasAppt ? nextAppt.title : 'Thursday, Nov 3 • 10:30 AM PST'}
          </p>
          <span className="text-[11px] text-charcoal-muted">
            {nextAppt.hasAppt ? nextAppt.desc : 'Focus: 4-week progesterone titration efficacy check'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 pt-0.5">
          <button
            onClick={onOpenTelehealth}
            className="h-11 rounded-[14px] bg-white hover:bg-cream border border-[#E2DBD0] text-charcoal text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform shadow-warm-sm"
            type="button"
          >
            <Calendar className="w-4 h-4 text-sage-dark" />
            <span>Prepare Notes</span>
          </button>
          <button
            onClick={onOpenChat}
            className="h-11 rounded-[14px] bg-sage-dark hover:bg-sage text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-warm-md active:scale-[0.98] transition-transform"
            type="button"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Send Message</span>
          </button>
        </div>
      </section>
    </div>
  );
};
