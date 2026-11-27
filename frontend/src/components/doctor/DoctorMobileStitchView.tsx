import React, { useState } from 'react';
import {
  Search,
  Users,
  Clock,
  FileText,
  AlertTriangle,
  Video,
  ChevronRight,
  Filter,
  Activity,
  MessageSquare,
  Sparkles,
  Stethoscope,
  Copy,
  Check,
  Flame,
} from 'lucide-react';

interface DoctorMobileStitchViewProps {
  user: any;
  patients: any[];
  triagePatients: any[];
  onSelectPatient: (patientId: string) => void;
  onLaunchTelehealth: (patientId?: string) => void;
  onOpenChat: (patientId?: string) => void;
  practiceCode?: string;
}

export const DoctorMobileStitchView: React.FC<DoctorMobileStitchViewProps> = ({
  user,
  patients = [],
  triagePatients = [],
  onSelectPatient,
  onLaunchTelehealth,
  onOpenChat,
  practiceCode = 'DR-VANCE-77B',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cohortFilter, setCohortFilter] = useState<'all' | 'peri' | 'post' | 'urgent'>('all');
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(practiceCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const filteredTriage = triagePatients.filter((p) => {
    if (searchTerm) {
      const match =
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.mrn?.toLowerCase().includes(searchTerm.toLowerCase());
      if (!match) return false;
    }
    if (cohortFilter === 'urgent') return p.badgeType === 'attention' || p.urgent;
    if (cohortFilter === 'peri') return p.strawStage?.toLowerCase().includes('peri') || p.strawStage?.includes('-1') || p.strawStage?.includes('-2');
    if (cohortFilter === 'post') return p.strawStage?.toLowerCase().includes('post') || p.strawStage?.includes('+1') || p.strawStage?.includes('+2');
    return true;
  });

  return (
    <div className="w-full flex flex-col gap-4 px-4 pt-2 pb-24 font-sans text-charcoal">
      {/* 1. Header with Doctor Identity and Practice Pairing Code */}
      <section className="bg-cream p-4 rounded-2xl border border-[#E2DBD0] shadow-warm-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-teal-soft text-teal flex items-center justify-center font-serif font-bold text-sm border border-teal/20">
              <Stethoscope className="w-5 h-5 text-teal" />
            </div>
            <div>
              <h2 className="font-serif text-base font-semibold text-charcoal leading-tight">
                {user?.full_name || 'Dr. Elena Vance, MD'}
              </h2>
              <span className="text-[11px] text-teal-dark font-medium">Metropolitan Endocrine Health</span>
            </div>
          </div>

          <button
            onClick={handleCopyCode}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E2DBD0] text-xs font-mono font-semibold text-charcoal hover:border-sage transition-colors shadow-warm-sm"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-sage-dark" /> : <Copy className="w-3.5 h-3.5 text-charcoal-muted" />}
            <span>{isCopied ? 'Copied!' : practiceCode}</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search cohort by patient name, MRN #MC-..."
            className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-[#E2DBD0] text-xs text-charcoal placeholder-charcoal-muted/60 focus:outline-none focus:ring-1 focus:ring-teal"
          />
        </div>

        {/* Cohort Filter Chips (Stitch Exact Pattern) */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-0.5">
          <button
            onClick={() => setCohortFilter('all')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              cohortFilter === 'all'
                ? 'bg-teal text-white shadow-warm-sm'
                : 'bg-white text-charcoal-muted border border-[#E2DBD0]'
            }`}
          >
            <span>All Cohorts</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${cohortFilter === 'all' ? 'bg-teal-dark text-white' : 'bg-cream text-charcoal'}`}>
              {patients.length || 9}
            </span>
          </button>

          <button
            onClick={() => setCohortFilter('peri')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              cohortFilter === 'peri'
                ? 'bg-teal text-white shadow-warm-sm'
                : 'bg-white text-charcoal-muted border border-[#E2DBD0]'
            }`}
          >
            <span>Perimenopausal</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${cohortFilter === 'peri' ? 'bg-teal-dark text-white' : 'bg-cream text-charcoal'}`}>
              14
            </span>
          </button>

          <button
            onClick={() => setCohortFilter('post')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              cohortFilter === 'post'
                ? 'bg-teal text-white shadow-warm-sm'
                : 'bg-white text-charcoal-muted border border-[#E2DBD0]'
            }`}
          >
            <span>Postmenopausal</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${cohortFilter === 'post' ? 'bg-teal-dark text-white' : 'bg-cream text-charcoal'}`}>
              36
            </span>
          </button>

          <button
            onClick={() => setCohortFilter('urgent')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              cohortFilter === 'urgent'
                ? 'bg-[#BA1A1A] text-white shadow-warm-sm'
                : 'bg-peach-soft text-[#B85D51] border border-peach/40'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            <span>Urgent</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${cohortFilter === 'urgent' ? 'bg-white text-[#BA1A1A]' : 'bg-[#FFDAD6] text-[#BA1A1A]'}`}>
              6
            </span>
          </button>
        </div>
      </section>

      {/* 2. 2x2 Tactical Metric Matrix (Stitch Exact Pattern) */}
      <section className="grid grid-cols-2 gap-2.5">
        {/* Metric 1: Active Cohort */}
        <div className="bg-white rounded-2xl p-3.5 border border-[#E2DBD0] shadow-warm-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-charcoal-muted mb-1">
            <span className="text-xs font-medium">Active Cohort</span>
            <Users className="w-4 h-4 text-teal" />
          </div>
          <div className="flex items-baseline gap-1.5 my-1">
            <span className="font-serif text-2xl font-bold text-charcoal">{patients.length || 9}</span>
            <span className="text-[11px] text-sage-dark font-semibold">98.4% sync</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-charcoal-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-sage-dark" />
            <span>Continuous Telemetry</span>
          </div>
        </div>

        {/* Metric 2: Tracking Gaps */}
        <div className="bg-white rounded-2xl p-3.5 border border-[#E2DBD0] shadow-warm-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-charcoal-muted mb-1">
            <span className="text-xs font-medium">Tracking Gaps</span>
            <Clock className="w-4 h-4 text-peach" />
          </div>
          <div className="flex items-baseline gap-1.5 my-1">
            <span className="font-serif text-2xl font-bold text-charcoal">12</span>
            <span className="text-[11px] text-peach font-semibold">&gt;3d lapse</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-charcoal-muted">
            <span>5 smart-nudged</span>
          </div>
        </div>

        {/* Metric 3: SOAP Notes */}
        <div className="bg-white rounded-2xl p-3.5 border border-[#E2DBD0] shadow-warm-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-charcoal-muted mb-1">
            <span className="text-xs font-medium">SOAP Notes</span>
            <FileText className="w-4 h-4 text-sage-dark" />
          </div>
          <div className="flex items-baseline gap-1.5 my-1">
            <span className="font-serif text-2xl font-bold text-charcoal">6</span>
            <span className="text-[11px] text-sage-dark font-semibold">Ready</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-charcoal-muted">
            <span>AI drafts queued</span>
          </div>
        </div>

        {/* Metric 4: Priority Action */}
        <div className="bg-peach-soft/40 rounded-2xl p-3.5 border border-peach/30 shadow-warm-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#B85D51] mb-1">
            <span className="text-xs font-bold">Priority Action</span>
            <AlertTriangle className="w-4 h-4 text-[#BA1A1A]" />
          </div>
          <div className="flex items-baseline gap-1.5 my-1">
            <span className="font-serif text-2xl font-bold text-[#BA1A1A]">6</span>
            <span className="text-[11px] text-[#BA1A1A] font-semibold">Surges/PMB</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-[#B85D51]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#BA1A1A]" />
            <span>2 red-flag triage</span>
          </div>
        </div>
      </section>

      {/* 3. Telemedicine Room Instant Banner (Next in 12 min) */}
      <section className="bg-teal-soft/60 rounded-2xl p-3.5 border border-teal/20 shadow-warm-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-teal text-white shadow-warm-sm shrink-0">
            <Video className="w-5 h-5" />
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-teal-soft rounded-full flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-teal rounded-full animate-ping" />
            </span>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-charcoal truncate">Elena Rostova</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-teal text-white font-mono uppercase font-bold">
                In Lobby
              </span>
            </div>
            <span className="text-[11px] text-charcoal-muted truncate">Scheduled: 10:30 AM • VMS Flare Check</span>
          </div>
        </div>

        <button
          onClick={() => onLaunchTelehealth('p-rostova')}
          className="px-3.5 py-1.5 rounded-xl bg-teal hover:bg-teal-dark text-white text-xs font-semibold shrink-0 shadow-warm-sm active:scale-95 transition-transform"
        >
          Join Call
        </button>
      </section>

      {/* 4. Priority Triage Queue (Stitch Exact Feed) */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs uppercase tracking-wider text-charcoal-muted font-bold">
            Priority Clinical Triage Queue ({filteredTriage.length})
          </h3>
          <span className="text-[11px] text-teal-dark font-medium">Deterministic Telemetry</span>
        </div>

        <div className="space-y-3">
          {filteredTriage.map((patient) => (
            <div
              key={patient.id || patient.mrn}
              className="bg-white rounded-2xl p-4 border border-[#E2DBD0] shadow-warm-sm space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-oat-light border border-[#E2DBD0] shrink-0">
                    <img
                      src={patient.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&h=120&q=80'}
                      alt={patient.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-charcoal">{patient.name}</h4>
                      <span className="text-[10px] text-charcoal-muted font-mono">{patient.mrn}</span>
                    </div>
                    <span className="text-[11px] text-charcoal-muted">{patient.strawStage}</span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    patient.badgeType === 'attention'
                      ? 'bg-peach-soft text-[#B85D51] border-peach/50'
                      : 'bg-[#FFDAD6] text-[#BA1A1A] border-[#FFB4AB]'
                  }`}
                >
                  {patient.badge}
                </span>
              </div>

              {/* Clinical Trigger Summary */}
              <div className="p-3 bg-ivory rounded-xl border border-[#E2DBD0] space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold text-charcoal">
                  <span>{patient.title}</span>
                  <span className="text-[10px] font-mono text-charcoal-muted">{patient.mrsBadge}</span>
                </div>
                <p className="text-xs text-charcoal-muted leading-relaxed line-clamp-2">
                  {patient.detail}
                </p>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => onOpenChat(patient.id)}
                  type="button"
                  className="flex items-center gap-1 text-xs text-charcoal-muted hover:text-charcoal p-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Message</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onLaunchTelehealth(patient.id)}
                    type="button"
                    className="p-2 rounded-xl bg-teal-soft text-teal hover:bg-teal hover:text-white transition-colors"
                    title="Launch Video"
                  >
                    <Video className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onSelectPatient(patient.id)}
                    type="button"
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal hover:bg-teal-dark text-white text-xs font-semibold shadow-warm-sm transition-colors"
                  >
                    <span>View Dossier</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
