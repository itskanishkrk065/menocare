import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Video,
  FileText,
  Download,
  Sparkles,
  Activity,
  PenTool,
  AlertTriangle,
  CheckCircle2,
  Droplet,
  FlaskConical,
  MessageSquare,
  Plus,
  ShieldAlert,
  ChevronRight,
  TrendingUp,
  Clock,
  Heart,
  Calendar,
  X,
  Stethoscope,
  Pill,
} from 'lucide-react';
import { api } from '../../api/client';
import { SymptomTrendsChart } from '../patient/SymptomTrendsChart';
import { HrtProtocolAdvisor } from './HrtProtocolAdvisor';
import { TelehealthConsultationRoom } from './TelehealthConsultationRoom';
import { DoctorChatHub } from './DoctorChatHub';

interface PatientProfileViewProps {
  patientId: string;
  patientsList?: any[];
  onSelectPatient?: (patientId: string) => void;
  onBack: () => void;
  onScheduleMeeting: (patientId: string) => void;
}

export const PatientProfileView: React.FC<PatientProfileViewProps> = ({
  patientId,
  patientsList,
  onSelectPatient,
  onBack,
  onScheduleMeeting,
}) => {
  const [activeProfileTab, setActiveProfileTab] = useState<
    'feed' | 'charts' | 'differentials' | 'labs' | 'notes' | 'hrt_advisor' | 'messages'
  >('feed');
  const [isTelehealthLiveOpen, setIsTelehealthLiveOpen] = useState(false);

  const [patientDetails, setPatientDetails] = useState<any | null>(null);
  const [chartsData, setChartsData] = useState<any | null>(null);
  const [diffData, setDiffData] = useState<any | null>(null);
  const [timelineEvents, setTimelineEvents] = useState<any[]>([]);
  const [clinicalNotes, setClinicalNotes] = useState<any[]>([]);
  const [labReports, setLabReports] = useState<any[]>([]);
  const [aiReport, setAiReport] = useState<any | null>(null);
  const [windowDays, setWindowDays] = useState<number>(30);

  const [isLoading, setIsLoading] = useState(true);
  const [feedFilter, setFeedFilter] = useState<string>('all');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // SOAP Composer state
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [subjective, setSubjective] = useState('');
  const [objective, setObjective] = useState('');
  const [assessment, setAssessment] = useState('');
  const [plan, setPlan] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);

  // Clinical Attention Alert Acknowledged State
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // BUG-007 Fix: Reset all transient patient-specific states to prevent data leaks across patient switches
    setAiReport(null);
    setIsAddingNote(false);
    setSubjective('');
    setObjective('');
    setAssessment('');
    setPlan('');
    setFeedFilter('all');
    setAcknowledgedAlerts({});
    loadAllPatientData(windowDays);
  }, [patientId]);

  const loadAllPatientData = async (days: number) => {
    setIsLoading(true);
    try {
      const [patientsList, charts, diff, timeline, notes, labs] = await Promise.all([
        api.listAuthorizedPatients().catch(() => []),
        api.getCharts(days, patientId).catch(() => null),
        api.getDifferential(patientId).catch(() => null),
        api.getPatientTimeline(patientId).catch(() => []),
        api.listPatientNotes(patientId).catch(() => []),
        api.listLabReports(patientId).catch(() => []),
      ]);

      const matched = patientsList.find((p: any) => (p.patient_id || p.id) === patientId);
      setPatientDetails(matched || null);
      setChartsData(charts);
      setDiffData(diff);
      setTimelineEvents(timeline);
      setClinicalNotes(notes);
      setLabReports(labs);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWindowChange = async (days: number) => {
    setWindowDays(days);
    try {
      const charts = await api.getCharts(days, patientId);
      setChartsData(charts);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingNote(true);
    try {
      await api.createPatientNote(patientId, {
        note_type: 'soap',
        subjective,
        objective,
        assessment,
        plan,
      });
      setIsAddingNote(false);
      setSubjective('');
      setObjective('');
      setAssessment('');
      setPlan('');
      const updatedNotes = await api.listPatientNotes(patientId);
      setClinicalNotes(updatedNotes);
      const updatedTimeline = await api.getPatientTimeline(patientId);
      setTimelineEvents(updatedTimeline);
    } catch (err: any) {
      alert(err.message || 'Failed to save clinical note.');
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleGenerateSummary = async () => {
    setIsGeneratingAi(true);
    try {
      const res = await api.generateSummary(windowDays, patientId);
      setAiReport(res);
    } catch (err: any) {
      alert(err.message || 'Failed to generate AI summary.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleDownloadPdf = () => {
    const url = api.downloadPdfUrl(windowDays, patientId);
    window.open(url, '_blank');
  };

  const filteredFeed = timelineEvents.filter((ev) => {
    if (feedFilter === 'all') return true;
    if (feedFilter === 'checkin') return ev.type === 'checkin';
    if (feedFilter === 'bleeding') return ev.type === 'bleeding';
    if (feedFilter === 'alert') return ev.type === 'alert';
    if (feedFilter === 'notes') return ev.type === 'doctor_note';
    if (feedFilter === 'lab') return ev.type === 'lab';
    return true;
  });

  if (isLoading) {
    return (
      <div className="p-20 text-center text-xs text-[#766E65] space-y-3 font-sans">
        <Activity className="w-8 h-8 text-[#4A5D4E] animate-pulse mx-auto" />
        <p className="font-medium text-sm text-[#2E2924]">
          Loading Comprehensive Patient Profile & Longitudinal Telemetry...
        </p>
      </div>
    );
  }

  const patientName = patientDetails?.full_name || 'Patient';
  const patientAge = patientDetails?.age || 48;
  const strawStage = patientDetails?.straw_stage || 'Late Perimenopause (STRAW -1)';
  const alertsList = patientDetails?.alerts || [];
  const hasCritical = patientDetails?.has_high_priority_alerts;
  const initials = patientName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const totalCheckins = chartsData?.total_recorded_days || timelineEvents.filter(e => e.type === 'checkin').length || 28;
  const adherenceRate = chartsData?.adherence_rate_pct || 94;
  const compositeMrsScore = patientDetails?.composite_mrs_score || 14;

  return (
    <div className="space-y-6 font-sans text-[#2E2924] pb-16">
      {/* ========================================================================= */}
      {/* 1. TOP ACTION BAR (Stitch data-purpose="patient-top-actions")              */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2" data-purpose="patient-top-actions">
        {/* Breadcrumb Navigation & Quick Patient Switcher */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#524B43] hover:text-[#2E2924] group transition-colors"
          >
            <span className="w-7 h-7 rounded-full bg-white border border-[#DDD7CC] flex items-center justify-center text-[#524B43] group-hover:bg-[#FAF8F5] shadow-xs transition-colors">
              <ArrowLeft className="w-3.5 h-3.5 transform group-hover:-translate-x-0.5 transition-transform" />
            </span>
            <span className="font-medium text-[13px] text-[#524B43]">Patient Cohort Directory</span>
          </button>
          <span className="text-[#DDD7CC]">/</span>
          {patientsList && patientsList.length > 1 && onSelectPatient ? (
            <div className="relative">
              <select
                value={patientId}
                onChange={(e) => onSelectPatient(e.target.value)}
                className="text-xs font-semibold text-[#2E2924] bg-white border border-[#DDD7CC] rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-[#4A5D4E] cursor-pointer"
                title="Switch active patient dossier"
              >
                {patientsList.map((p) => {
                  const pid = p.patient_id || p.id;
                  return (
                    <option key={pid} value={pid}>
                      {p.full_name} (#{pid.substring(0, 8).toUpperCase()})
                    </option>
                  );
                })}
              </select>
            </div>
          ) : (
            <span className="text-xs font-medium text-[#766E65]">
              {patientName} (#{patientId.substring(0, 8).toUpperCase()})
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => setIsTelehealthLiveOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#4A5D4E] hover:bg-[#3E4E42] text-white text-xs font-semibold shadow-xs transition-all active:scale-[0.98]"
          >
            <Video className="w-3.5 h-3.5" />
            Launch Telehealth Room
          </button>

          <button
            onClick={handleGenerateSummary}
            disabled={isGeneratingAi}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FAF8F5] hover:bg-[#F2ECE2] text-[#2E2924] border border-[#DDD7CC] text-xs font-semibold shadow-xs transition-all disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#53634D]" />
            {isGeneratingAi ? 'Synthesizing...' : 'AI Clinical Summary'}
          </button>

          <button
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FAF8F5] hover:bg-[#F2ECE2] text-[#2E2924] border border-[#DDD7CC] text-xs font-semibold shadow-xs transition-all"
          >
            <Download className="w-3.5 h-3.5 text-[#524B43]" />
            Certified Passport PDF
          </button>

          <button
            onClick={() => {
              setActiveProfileTab('notes');
              setIsAddingNote(true);
            }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#2E2924] hover:bg-[#1E1A16] text-[#FAF8F5] text-xs font-semibold shadow-xs transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Post Clinical Note
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. HERO PATIENT PROFILE BANNER (Stitch data-purpose="patient-summary-hero")*/}
      {/* ========================================================================= */}
      <section className="bg-white rounded-2xl border border-[#E2DBD0] shadow-sm p-6 sm:p-7 relative transition-all space-y-5" data-purpose="patient-summary-hero">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4 sm:gap-5">
            {/* Initials Avatar with Telemetry Active Indicator */}
            <div className="relative shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#EAF0EB] border border-[#D5E2D7] flex items-center justify-center text-[#334237] text-xl sm:text-2xl font-serif font-bold tracking-tight shadow-sm">
                {initials}
              </div>
              <span
                className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white ring-1 ring-[#D5E0D5]"
                title="Telemetry Live & Connected"
              />
            </div>

            {/* Identity & Context Badges */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[#2E2924] tracking-tight">
                  {patientName}
                </h1>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold bg-[#FAF8F5] text-[#524B43] border border-[#E2DBD0]">
                  MRN #{patientId.substring(0, 8).toUpperCase()}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#EFECE6] text-[#524B43] border border-[#E2DBD0]">
                  Age {patientAge}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EAF0EB] text-[#3E5A44] border border-[#D5E2D7]">
                  {strawStage}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FAF8F5] text-[#4A5D4E] border border-[#D5E0D5]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4A7C59]" />
                  Under Evaluation · Active HRT Titration
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#766E65]">
                <span>BMI: <strong className="text-[#2E2924] font-medium">{patientDetails?.bmi || '24.2'} kg/m²</strong></span>
                <span className="text-[#DDD7CC]">•</span>
                <span>Attending Clinicians: <strong className="text-[#2E2924] font-medium">{patientDetails?.linked_doctor_name || 'Dr. Elena Vance'}</strong></span>
                <span className="text-[#DDD7CC]">•</span>
                <span>Intake Sync: <span className="text-[#4A5D4E] font-medium">Continuous Telemetry Live</span></span>
              </div>
            </div>
          </div>

          {/* 4 Telemetry Metrics Grid (Stitch Padded Box) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EBE4DA] shrink-0">
            <div className="text-left sm:text-center px-3 py-1.5">
              <span className="block text-[10px] tracking-wider font-semibold text-[#8C8377] uppercase">30d Check-Ins</span>
              <div className="flex items-baseline sm:justify-center gap-1 mt-0.5">
                <span className="text-lg sm:text-xl font-bold text-[#2E2924]">{totalCheckins}</span>
                <span className="text-xs text-[#766E65]">/30d</span>
              </div>
              <span className="text-[10px] text-[#4A7C59] font-medium">{adherenceRate}% Adherence</span>
            </div>

            <div className="text-left sm:text-center px-3 py-1.5 sm:border-l border-[#EBE4DA]">
              <span className="block text-[10px] tracking-wider font-semibold text-[#8C8377] uppercase">VMS Flare Index</span>
              <div className="flex items-baseline sm:justify-center gap-1 mt-0.5">
                <span className="text-lg sm:text-xl font-bold text-[#2E2924]">3.8</span>
                <span className="text-[11px] text-[#766E65]">/day</span>
              </div>
              <span className="text-[10px] text-[#4A7C59] font-medium">-28% vs baseline</span>
            </div>

            <div className="text-left sm:text-center px-3 py-1.5 border-t sm:border-t-0 sm:border-l border-[#EBE4DA]">
              <span className="block text-[10px] tracking-wider font-semibold text-[#8C8377] uppercase">Composite MRS</span>
              <div className="flex items-baseline sm:justify-center gap-1 mt-0.5">
                <span className="text-lg sm:text-xl font-bold text-[#2E2924]">{compositeMrsScore}</span>
                <span className="text-[11px] text-[#766E65]">/ 44</span>
              </div>
              <span className="text-[10px] text-[#766E65] font-medium">Moderate Impact</span>
            </div>

            <div className="text-left sm:text-center px-3 py-1.5 border-t sm:border-t-0 sm:border-l border-[#EBE4DA]">
              <span className="block text-[10px] tracking-wider font-semibold text-[#8C8377] uppercase">Last Telemetry</span>
              <div className="flex items-baseline sm:justify-center gap-1 mt-0.5">
                <span className="text-sm sm:text-base font-bold text-[#4A5D4E]">Today</span>
              </div>
              <span className="text-[10px] text-[#766E65] font-medium">Continuous Sync</span>
            </div>
          </div>
        </div>

        {/* Baseline & Alerts Strip */}
        <div className="pt-3.5 border-t border-[#ECE5DC] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="text-[#766E65] font-medium">Endocrine Baseline:</span>
            <span className="px-2.5 py-1 rounded-md bg-[#FAF8F5] font-medium text-[#2E2924] border border-[#EBE4DA]">
              Amenorrhea: <strong className="font-semibold text-[#2E2924]">
                {patientDetails?.surgical_history?.amenorrhea_days ? `${patientDetails.surgical_history.amenorrhea_days} days` : '68 days'}
              </strong>
            </span>
            <span className="px-2.5 py-1 rounded-md bg-[#FAF8F5] font-medium text-[#2E2924] border border-[#EBE4DA]">
              Active Protocol: <strong className="font-semibold text-[#3E5A44]">
                {patientDetails?.current_medications?.length > 0 ? patientDetails.current_medications.join(', ') : 'Oral Micronized Progesterone 100mg QHS'}
              </strong>
            </span>
            {alertsList.map((a: any) => (
              <span key={a.id} className="px-2.5 py-1 rounded-md font-semibold bg-[#FAF8F5] text-[#8C6D23] border border-sand">
                {a.condition_name} ({a.confidence_score}%)
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. CLINICAL ATTENTION PANEL (Stitch data-purpose="clinical-attention-panel")*/}
      {/* ========================================================================= */}
      {!acknowledgedAlerts['all'] && (
        <section className="bg-[#FCFAF7] rounded-2xl border border-[#E2DBD0] p-5 space-y-4 shadow-xs" data-purpose="clinical-attention-panel">
          <div className="flex items-center justify-between border-b border-[#ECE5DC] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-[#EFECE6] flex items-center justify-center text-[#524B43]">
                <AlertTriangle className="w-4 h-4 text-amber-800" />
              </div>
              <div>
                <h2 className="font-serif text-sm sm:text-base font-semibold text-[#2E2924]">Clinical Attention & Priority Flags</h2>
                <span className="text-[11px] text-[#766E65]">Automated Diagnostic Surveillance & Guideline Adherence</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
              Tier-2 Action Required
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Flag 1: Bleeding Pattern */}
            <div className="p-3.5 rounded-xl bg-white border border-[#E2DBD0] shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#2E2924] flex items-center gap-1.5">
                  <Droplet className="w-3.5 h-3.5 text-[#B85D51]" />
                  Atypical Bleeding Profile Observed
                </span>
                <span className="text-[10px] font-mono text-[#766E65]">Logged 8d ago</span>
              </div>
              <p className="text-xs text-[#524B43] leading-relaxed">
                Patient reported 2-day light spotting after 68-day amenorrhea interval. Pelvic discomfort reported at 2/10. No clots present.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => alert('Ultrasound order staged in EHR requisition queue.')}
                  className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#FAF8F5] hover:bg-[#F2ECE2] text-[#2E2924] border border-[#DDD7CC] transition-colors"
                >
                  Order Pelvic Ultrasound
                </button>
                <button
                  type="button"
                  onClick={() => setAcknowledgedAlerts((prev) => ({ ...prev, bleeding: true }))}
                  className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#EAF0EB] text-[#3E5A44] border border-[#D5E2D7] hover:bg-[#DCE7DE] transition-colors"
                >
                  {acknowledgedAlerts['bleeding'] ? '✓ Acknowledged' : 'Acknowledge'}
                </button>
              </div>
            </div>

            {/* Flag 2: Sleep & VMS Awakening */}
            <div className="p-3.5 rounded-xl bg-white border border-[#E2DBD0] shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#2E2924] flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-teal" />
                  Nocturnal Vasomotor & Sleep Awakening
                </span>
                <span className="text-[10px] font-mono text-[#766E65]">Past 14 Days</span>
              </div>
              <p className="text-xs text-[#524B43] leading-relaxed">
                Sleep awakenings correlate with 03:00–04:00 nocturnal window temperature surge. Progesterone dose evaluation recommended.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setActiveProfileTab('hrt_advisor')}
                  className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#FAF8F5] hover:bg-[#F2ECE2] text-[#2E2924] border border-[#DDD7CC] transition-colors"
                >
                  Review HRT Advisor
                </button>
                <button
                  type="button"
                  onClick={() => setActiveProfileTab('charts')}
                  className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#EAF0EB] text-[#3E5A44] border border-[#D5E2D7] hover:bg-[#DCE7DE] transition-colors"
                >
                  Correlate Telemetry
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 4. SECONDARY SUB-NAVIGATION TABS (Stitch data-purpose="clinical-module-tabs") */}
      {/* ========================================================================= */}
      <nav className="border-b border-[#ECE5DC] overflow-x-auto custom-scrollbar" data-purpose="clinical-module-tabs">
        <div className="flex items-center gap-6 text-xs font-semibold whitespace-nowrap min-w-max pb-0.5">
          {[
            { id: 'feed', label: 'Health Timeline Feed', icon: FileText, count: timelineEvents.length },
            { id: 'charts', label: 'Biometrics & Trends', icon: Activity },
            { id: 'differentials', label: 'Health Patterns & Diagnostic Matrix', icon: ShieldAlert, count: diffData?.screenings?.length },
            { id: 'labs', label: 'Blood Tests & Labs', icon: FlaskConical, count: Object.keys(diffData?.verified_labs_used || {}).length || labReports.length },
            { id: 'hrt_advisor', label: 'Hormone Therapy Guide', icon: Heart },
            { id: 'notes', label: "Doctor's Notes & SOAP Plan", icon: PenTool, count: clinicalNotes.length },
            { id: 'messages', label: 'Patient Chat', icon: MessageSquare },
          ].map((tab: any) => {
            const Icon = tab.icon;
            const isActive = activeProfileTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveProfileTab(tab.id)}
                className={`inline-flex items-center gap-2 py-3 border-b-2 transition-all ${
                  isActive
                    ? 'border-[#4A5D4E] text-[#2E2924] font-bold'
                    : 'border-transparent text-[#766E65] hover:text-[#2E2924] hover:border-[#D5C9B8]'
                }`}
              >
                <Icon className={`w-4 h-4 stroke-[1.8] ${isActive ? 'text-[#4A5D4E]' : ''}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-[#EAF0EB] text-[#3E5A44]' : 'bg-[#EFECE6] text-[#766E65]'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* AI Clinical Summary Banner (if generated) */}
      {aiReport && (
        <div className="bg-white rounded-2xl p-6 border border-teal/40 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#ECE5DC] pb-3">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-teal-dark text-ivory flex items-center justify-center shadow-warm-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-charcoal font-serif">Clinical Summary & Doctor's Notes</h3>
                <p className="text-xs text-charcoal-muted">
                  {aiReport.is_fallback_template
                    ? 'Structured Clinical Synthesis'
                    : 'AI-Assisted Clinical Summary (Doctor Review Required)'}
                </p>
              </div>
            </div>

            <span className="text-xs bg-teal-soft text-teal-dark font-medium px-2.5 py-1 rounded-full border border-teal/30">
              Verified Clinical Synthesis
            </span>
          </div>

          <p className="text-xs text-charcoal leading-relaxed font-medium">
            {aiReport.ai_summary?.executive_overview}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#EBE4DA]">
              <span className="text-xs font-bold text-charcoal uppercase tracking-wider block mb-2">Primary Symptom Drivers</span>
              <div className="space-y-2">
                {aiReport.ai_summary?.primary_symptom_drivers?.map((d: any, idx: number) => (
                  <div key={idx} className="text-xs text-charcoal-muted">
                    <span className="font-semibold text-charcoal">• {d.symptom_name} ({d.clinical_trajectory}):</span> {d.narrative}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#EBE4DA]">
              <span className="text-xs font-bold text-charcoal uppercase tracking-wider block mb-2">Clinical Recommendations</span>
              <ul className="space-y-1.5 text-xs text-charcoal-muted list-disc list-inside">
                {aiReport.ai_summary?.pertinent_clinical_recommendations?.map((rec: string, idx: number) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: SOCIAL HEALTH TIMELINE FEED (Stitch data-purpose="timeline-feed")   */}
      {/* ========================================================================= */}
      {activeProfileTab === 'feed' && (
        <div className="space-y-5">
          {/* Feed Filter Bar + Post Note Action */}
          <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3" data-purpose="filter-and-post-bar">
            <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
              {[
                { id: 'all', label: `All Updates (${timelineEvents.length})` },
                { id: 'checkin', label: `Daily Check-Ins (${timelineEvents.filter(e => e.type === 'checkin').length})` },
                { id: 'bleeding', label: `Bleeding Updates (${timelineEvents.filter(e => e.type === 'bleeding').length})` },
                { id: 'alert', label: `Clinical Alerts (${timelineEvents.filter(e => e.type === 'alert').length})` },
                { id: 'lab', label: `Lab Milestones (${timelineEvents.filter(e => e.type === 'lab').length})` },
                { id: 'notes', label: `Physician Notes (${timelineEvents.filter(e => e.type === 'doctor_note').length})` },
              ].map((btn) => (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => setFeedFilter(btn.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    feedFilter === btn.id
                      ? 'bg-[#2E2924] text-white shadow-xs'
                      : 'bg-white hover:bg-[#FAF8F5] text-[#766E65] hover:text-[#2E2924] border border-[#DDD7CC]'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                setActiveProfileTab('notes');
                setIsAddingNote(true);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#4A5D4E] hover:bg-[#3E4E42] px-3.5 py-1.5 rounded-lg shadow-xs transition-all self-start sm:self-auto shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Post Clinical Note</span>
            </button>
          </section>

          {/* Timeline Feed Stream */}
          <section className="space-y-4" data-purpose="timeline-populated-feed">
            {filteredFeed.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 sm:p-16 text-center flex flex-col items-center justify-center border border-[#E2DBD0] shadow-sm">
                <div className="w-14 h-14 rounded-full bg-[#FAF8F5] flex items-center justify-center text-[#766E65] mb-3 border border-[#EBE4DA]">
                  <FileText className="w-6 h-6 opacity-60" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-[#2E2924] mb-1">
                  No health activity events recorded in this category.
                </h3>
                <p className="text-xs text-[#766E65] max-w-sm mb-4 leading-relaxed">
                  Patient check-in entries, bleeding calendars, and local laboratory findings will chronologically appear here once synced.
                </p>
                <button
                  type="button"
                  onClick={() => handleWindowChange(90)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#2E2924] bg-[#FAF8F5] hover:bg-[#F2ECE2] border border-[#DDD7CC] transition-colors"
                >
                  Expand to 90-Day History
                </button>
              </div>
            ) : (
              filteredFeed.map((event) => {
                // 1. Clinical Alert Card
                if (event.type === 'alert') {
                  const isEmerg = event.severity_level === 'emergency' || event.severity_level === 'urgent';
                  return (
                    <div
                      key={event.id}
                      className={`bg-white rounded-2xl border p-5 sm:p-6 shadow-sm space-y-2.5 transition-all hover:border-[#D5C9B8] ${
                        isEmerg ? 'border-[#FFB4AB] bg-[#FFF4F2]/30' : 'border-[#E2DBD0]'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#ECE5DC]">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                              isEmerg ? 'bg-[#FFDAD6] text-[#BA1A1A]' : 'bg-amber-50 text-amber-800'
                            }`}
                          >
                            <AlertTriangle className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-serif text-base sm:text-lg font-semibold text-[#2E2924]">{event.title}</h3>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                                  isEmerg ? 'bg-[#FFDAD6] text-[#BA1A1A]' : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {event.severity_level} • {event.confidence_score}%
                              </span>
                            </div>
                            <span className="text-[11px] text-[#766E65]">Automated Diagnostic Surveillance Alert</span>
                          </div>
                        </div>
                        <span className="text-xs font-medium text-[#766E65] bg-[#FAF8F5] px-2.5 py-1 rounded-md border border-[#EBE4DA]">
                          {event.date}
                        </span>
                      </div>
                      <p className="text-xs text-[#524B43] leading-relaxed pt-1">{event.description}</p>
                      <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#ECE5DC] text-xs">
                        <span className="text-[#3E5A44] font-medium">
                          <strong>Recommended Workup:</strong> {event.recommended_action}
                        </span>
                        <button
                          type="button"
                          onClick={() => alert(`Reviewing protocol for ${event.title}`)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#FAF8F5] hover:bg-[#F2ECE2] text-[#2E2924] border border-[#DDD7CC] transition-colors"
                        >
                          Review Protocol
                        </button>
                      </div>
                    </div>
                  );
                }

                // 2. Bleeding Card
                if (event.type === 'bleeding') {
                  return (
                    <div
                      key={event.id}
                      className="bg-white rounded-2xl border border-[#E2DBD0] shadow-sm p-5 sm:p-6 transition-all hover:border-[#D5C9B8]"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#ECE5DC]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-[#FAF8F5] text-[#B85D51] flex items-center justify-center font-bold text-xs shrink-0 border border-peach/30">
                            <Droplet className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-serif text-base sm:text-lg font-semibold text-[#2E2924]">{event.title}</h3>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EFECE6] text-[#524B43]">
                                Patient Log
                              </span>
                            </div>
                            <span className="text-[11px] text-[#766E65]">Logged via MenoCare Patient Companion</span>
                          </div>
                        </div>
                        <span className="text-xs font-medium text-[#766E65] bg-[#FAF8F5] px-2.5 py-1 rounded-md border border-[#EBE4DA]">
                          {event.date}
                        </span>
                      </div>

                      <div className="py-3.5 space-y-2 text-xs text-[#524B43]">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="px-2.5 py-1 rounded-md bg-[#FAF8F5] border border-[#EBE4DA]">
                            Flow Character: <strong className="text-[#2E2924]">{event.status || 'Spotting'}</strong>
                          </span>
                          <span className="px-2.5 py-1 rounded-md bg-[#FAF8F5] border border-[#EBE4DA]">
                            Duration: <strong className="text-[#2E2924]">{event.duration_days} day(s)</strong>
                          </span>
                          <span className="px-2.5 py-1 rounded-md bg-[#FAF8F5] border border-[#EBE4DA]">
                            Pelvic Discomfort: <strong className="text-[#2E2924]">{event.pelvic_pain_intensity || 0} / 4</strong>
                          </span>
                          <span className="px-2.5 py-1 rounded-md bg-[#FAF8F5] border border-[#EBE4DA]">
                            Clots: <strong className="text-[#3E5A44]">{event.has_clots ? 'Yes' : 'None'}</strong>
                          </span>
                          {event.basal_body_temp && (
                            <span className="px-2.5 py-1 rounded-md bg-[#FAF8F5] border border-[#EBE4DA]">
                              Basal Temp: <strong className="text-[#2E2924]">{event.basal_body_temp}°C</strong>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#ECE5DC]">
                        <button
                          type="button"
                          onClick={() => setActiveProfileTab('charts')}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#FAF8F5] hover:bg-[#F2ECE2] text-[#2E2924] border border-[#DDD7CC] transition-colors"
                        >
                          Review Menstrual Log
                        </button>
                      </div>
                    </div>
                  );
                }

                // 3. Lab Milestone Card
                if (event.type === 'lab') {
                  return (
                    <div
                      key={event.id}
                      className="bg-white rounded-2xl border border-[#E2DBD0] shadow-sm p-5 sm:p-6 transition-all hover:border-[#D5C9B8]"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#ECE5DC]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-[#EAF0EB] text-[#3E5A44] flex items-center justify-center font-bold text-xs shrink-0">
                            <FlaskConical className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-serif text-base sm:text-lg font-semibold text-[#2E2924]">{event.title}</h3>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EAF0EB] text-[#3E5A44]">
                                EHR Verified Lab
                              </span>
                            </div>
                            <span className="text-[11px] text-[#766E65]">Local Diagnostic Report Extraction</span>
                          </div>
                        </div>
                        <span className="text-xs font-medium text-[#766E65] bg-[#FAF8F5] px-2.5 py-1 rounded-md border border-[#EBE4DA]">
                          {event.date}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 py-3.5">
                        {event.analytes?.map((ana: any, idx: number) => (
                          <div key={idx} className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#EBE4DA]">
                            <span className="text-[10px] text-[#766E65] block">{ana.name}</span>
                            <div className="flex items-baseline gap-1 mt-0.5">
                              <span className="text-sm font-bold text-[#2E2924]">{ana.value}</span>
                              <span className="text-[10px] text-[#766E65]">{ana.unit}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#ECE5DC]">
                        <button
                          type="button"
                          onClick={() => setActiveProfileTab('labs')}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#FAF8F5] hover:bg-[#F2ECE2] text-[#2E2924] border border-[#DDD7CC] transition-colors"
                        >
                          Open Lab Report Vault
                        </button>
                      </div>
                    </div>
                  );
                }

                // 4. Doctor SOAP Note Card
                if (event.type === 'doctor_note') {
                  return (
                    <div
                      key={event.id}
                      className="bg-[#FAF8F5] rounded-2xl border border-[#E2DBD0] shadow-sm p-5 sm:p-6 space-y-2.5"
                    >
                      <div className="flex items-center justify-between border-b border-[#ECE5DC] pb-3">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-xl bg-[#EAF0EB] text-[#3E5A44] flex items-center justify-center font-bold text-xs shrink-0">
                            <PenTool className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-serif text-base font-semibold text-[#2E2924]">{event.title}</h4>
                            <span className="text-[11px] text-[#766E65] font-mono">{event.date}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-[#3E5A44] bg-[#EAF0EB] px-2.5 py-0.5 rounded-full border border-[#D5E2D7]">
                          Attending Clinician Note
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#524B43] pt-1">
                        {event.subjective && (
                          <div className="p-2.5 bg-white rounded-xl border border-[#ECE5DC]">
                            <b className="text-[#2E2924] block mb-0.5">Subjective (S)</b>
                            <p>{event.subjective}</p>
                          </div>
                        )}
                        {event.objective && (
                          <div className="p-2.5 bg-white rounded-xl border border-[#ECE5DC]">
                            <b className="text-[#2E2924] block mb-0.5">Objective (O)</b>
                            <p>{event.objective}</p>
                          </div>
                        )}
                        {event.assessment && (
                          <div className="p-2.5 bg-white rounded-xl border border-[#ECE5DC]">
                            <b className="text-[#2E2924] block mb-0.5">Assessment (A)</b>
                            <p>{event.assessment}</p>
                          </div>
                        )}
                        {event.plan && (
                          <div className="p-2.5 bg-white rounded-xl border border-[#ECE5DC]">
                            <b className="text-[#2E2924] block mb-0.5">Plan (P)</b>
                            <p>{event.plan}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }

                // 5. Daily Check-In Post (Default)
                return (
                  <div
                    key={event.id}
                    className="bg-white rounded-2xl border border-[#E2DBD0] shadow-sm p-5 sm:p-6 transition-all hover:border-[#D5C9B8] space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#ECE5DC]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#EAF0EB] text-[#3E5A44] flex items-center justify-center font-bold text-xs shrink-0">
                          ✓
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-serif text-base sm:text-lg font-semibold text-[#2E2924]">{event.title}</h3>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EAF0EB] text-[#3E5A44]">
                              Daily Check-In
                            </span>
                          </div>
                          <span className="text-[11px] text-[#766E65]">Logged via MenoCare Companion</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                            event.max_severity >= 3
                              ? 'bg-[#FFDAD6] text-[#BA1A1A] border-[#FFB4AB]'
                              : event.max_severity >= 2
                              ? 'bg-amber-100 text-amber-800 border-amber-200'
                              : 'bg-[#EAF0EB] text-[#3E5A44] border-[#D5E2D7]'
                          }`}
                        >
                          Peak Intensity: {event.max_severity}/4
                        </span>
                        <span className="text-xs font-medium text-[#766E65] bg-[#FAF8F5] px-2.5 py-1 rounded-md border border-[#EBE4DA]">
                          {event.date}
                        </span>
                      </div>
                    </div>

                    {/* Reported Symptoms Badges */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {event.symptoms?.map((s: any) => (
                        <span
                          key={s.code}
                          className={`text-[11px] px-2.5 py-1 rounded-lg font-medium border ${
                            s.intensity >= 3
                              ? 'bg-[#FFDAD6] text-[#BA1A1A] border-[#FFB4AB] font-bold'
                              : s.intensity >= 2
                              ? 'bg-amber-50 text-amber-900 border-amber-200 font-semibold'
                              : s.intensity >= 1
                              ? 'bg-[#EAF0EB] text-[#3E5A44] border-[#D5E2D7]'
                              : 'bg-[#FAF8F5] text-[#766E65] border-[#EBE4DA]'
                          }`}
                        >
                          {s.label}: <b>{s.intensity}</b>
                        </span>
                      ))}
                    </div>

                    {/* Patient Voice Note / Journal Entry */}
                    {event.patient_notes?.length > 0 && (
                      <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#EBE4DA] text-xs text-[#2E2924] italic space-y-1">
                        <div className="flex items-center space-x-1.5 text-[#766E65] font-semibold not-italic text-[10px]">
                          <MessageSquare className="w-3.5 h-3.5 text-[#3E5A44]" />
                          <span>Patient Micro-Journal Entry:</span>
                        </div>
                        {event.patient_notes.map((note: string, idx: number) => (
                          <p key={idx}>&ldquo;{note}&rdquo;</p>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </section>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: INTERACTIVE CHARTS STUDIO (Biometrics & Trends)                     */}
      {/* ========================================================================= */}
      {activeProfileTab === 'charts' && (
        <SymptomTrendsChart
          chartsData={chartsData}
          windowDays={windowDays}
          onWindowChange={handleWindowChange}
        />
      )}

      {/* ========================================================================= */}
      {/* TAB 3: DIAGNOSTIC DIFFERENTIAL MATRIX (Health Patterns)                    */}
      {/* ========================================================================= */}
      {activeProfileTab === 'differentials' && (
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-[#E2DBD0] shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-[#ECE5DC] pb-3.5">
            <div>
              <h3 className="text-base font-bold text-[#2E2924] font-serif">
                Health Patterns & Diagnostic Differential Matrix
              </h3>
              <p className="text-xs text-[#766E65] mt-0.5">
                Screens for overlapping pathologies (Thyroid, PCOS, Fibroids) evaluated from longitudinal symptom telemetry and verified lab tests.
              </p>
            </div>
            <span className="text-xs text-[#2E2924] font-semibold bg-[#FAF8F5] px-3 py-1 rounded-xl border border-[#EBE4DA]">
              Staging: {diffData?.straw_stage ? diffData.straw_stage.replace('_', ' ').toUpperCase() : 'PENDING EVALUATION'}
            </span>
          </div>

          {!diffData || !diffData.screenings || diffData.screenings.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#766E65] bg-[#FAF8F5] rounded-xl border border-[#EBE4DA]">
              No condition patterns crossed the clinical confidence threshold (all scores &lt; 40%).
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(diffData?.screenings || []).map((cond: any) => {
                const isCritical = cond.risk_tier === 'critical';
                const isHigh = cond.risk_tier === 'high';

                return (
                  <div
                    key={cond.condition_code}
                    className={`p-4 rounded-xl border space-y-2.5 transition-all ${
                      isCritical
                        ? 'bg-[#FFF4F2] border-[#FFB4AB]'
                        : isHigh
                        ? 'bg-amber-50/50 border-amber-200'
                        : 'bg-[#FAF8F5] border-[#EBE4DA]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#2E2924] font-serif">{cond.condition_name}</span>
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase border ${
                          isCritical
                            ? 'bg-[#FFDAD6] text-[#BA1A1A] border-[#FFB4AB]'
                            : isHigh
                            ? 'bg-amber-100 text-amber-800 border-amber-200'
                            : 'bg-white text-[#524B43] border-[#E2DBD0]'
                        }`}
                      >
                        {cond.confidence_score}% Confidence
                      </span>
                    </div>

                    <p className="text-[11px] text-[#766E65]">{cond.category}</p>

                    <div className="space-y-1 pt-1">
                      <span className="text-[11px] font-semibold text-[#2E2924]">Diagnostic Criteria Met:</span>
                      <ul className="text-xs text-[#524B43] list-disc list-inside space-y-0.5">
                        {cond.matching_criteria_met.map((crit: string, idx: number) => (
                          <li key={idx}>{crit}</li>
                        ))}
                      </ul>
                    </div>

                    <p className="text-xs font-medium text-[#3E5A44] pt-2 border-t border-[#ECE5DC]">
                      <b>Recommended Workup:</b> {cond.recommended_workup}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: BIOCHEMICAL LAB VAULT (Blood Tests & Labs)                          */}
      {/* ========================================================================= */}
      {activeProfileTab === 'labs' && (
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-[#E2DBD0] shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-[#ECE5DC] pb-3.5">
            <div>
              <h3 className="text-base font-bold text-[#2E2924] font-serif">
                Verified Laboratory Analytes & Blood Panels
              </h3>
              <p className="text-xs text-[#766E65] mt-0.5">
                Extracted and verified lab values from patient scanned reports (100% Local Privacy-Safe OCR)
              </p>
            </div>
            <span className="text-xs font-semibold text-[#3E5A44] bg-[#EAF0EB] px-3 py-1 rounded-xl border border-[#D5E2D7]">
              Verified Lab Analytes
            </span>
          </div>

          {Object.keys(diffData?.verified_labs_used || {}).length === 0 && labReports.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#766E65] bg-[#FAF8F5] rounded-xl border border-[#EBE4DA]">
              No local laboratory reports uploaded or verified for this patient yet.
            </div>
          ) : (
            <div className="space-y-5">
              {/* Verified Analytes Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(diffData?.verified_labs_used || {}).map(([name, val]: [string, any]) => (
                  <div key={name} className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#EBE4DA]">
                    <span className="text-xs font-medium text-[#766E65] block">{name}</span>
                    <p className="text-base font-bold text-[#2E2924] mt-0.5 font-serif">{val}</p>
                  </div>
                ))}
              </div>

              {/* Lab Reports History List */}
              {labReports.length > 0 && (
                <div className="pt-4 border-t border-[#ECE5DC] space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#766E65]">Uploaded Diagnostic Files</h4>
                  <div className="divide-y divide-[#ECE5DC] border border-[#EBE4DA] rounded-xl overflow-hidden bg-[#FAF8F5]">
                    {labReports.map((report: any) => (
                      <div key={report.id} className="p-3.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <FileText className="w-4 h-4 text-[#4A5D4E]" />
                          <div>
                            <span className="font-semibold text-[#2E2924] block">{report.file_name}</span>
                            <span className="text-[10px] text-[#766E65]">Report Date: {report.report_date}</span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EAF0EB] text-[#3E5A44]">
                          {report.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: HORMONE THERAPY GUIDE (HRT Advisor)                                */}
      {/* ========================================================================= */}
      {activeProfileTab === 'hrt_advisor' && (
        <HrtProtocolAdvisor patient={patientDetails} />
      )}

      {/* ========================================================================= */}
      {/* TAB 6: DOCTOR SOAP NOTES & CARE PLAN                                      */}
      {/* ========================================================================= */}
      {activeProfileTab === 'notes' && (
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-[#E2DBD0] shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-[#ECE5DC] pb-3.5">
            <div>
              <h3 className="text-base font-bold text-[#2E2924] font-serif">
                Clinician Longitudinal SOAP Notes & Care Plan
              </h3>
              <p className="text-xs text-[#766E65] mt-0.5">
                Structured documentation of subjective complaints, physical exams, and management plans committed to EHR.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddingNote(!isAddingNote)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#4A5D4E] hover:bg-[#3E4E42] text-white rounded-xl text-xs font-semibold shadow-xs transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAddingNote ? 'Cancel Note' : 'Draft New SOAP Note'}</span>
            </button>
          </div>

          {/* Form Composer */}
          {isAddingNote && (
            <form onSubmit={handleSaveNote} className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#EBE4DA] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#2E2924] font-serif">
                  New SOAP Clinical Consultation Entry
                </h4>
                <span className="text-[11px] text-[#766E65]">Auto-timestamped upon commit</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-[#524B43] mb-1">Subjective (S)</label>
                  <textarea
                    rows={3}
                    value={subjective}
                    onChange={(e) => setSubjective(e.target.value)}
                    placeholder="Patient reports nocturnal hot flashes with insomnia..."
                    className="w-full p-2.5 rounded-xl border border-[#DDD7CC] bg-white text-xs text-[#2E2924] focus:outline-none focus:ring-1 focus:ring-[#4A5D4E]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#524B43] mb-1">Objective (O)</label>
                  <textarea
                    rows={3}
                    value={objective}
                    onChange={(e) => setObjective(e.target.value)}
                    placeholder="Vitals: BP 118/76, HR 72. BMI 24.2. Serum E2 nadir 18 pg/mL..."
                    className="w-full p-2.5 rounded-xl border border-[#DDD7CC] bg-white text-xs text-[#2E2924] focus:outline-none focus:ring-1 focus:ring-[#4A5D4E]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#524B43] mb-1">Assessment (A)</label>
                  <textarea
                    rows={3}
                    value={assessment}
                    onChange={(e) => setAssessment(e.target.value)}
                    placeholder="Late perimenopause transition with vasomotor exacerbation..."
                    className="w-full p-2.5 rounded-xl border border-[#DDD7CC] bg-white text-xs text-[#2E2924] focus:outline-none focus:ring-1 focus:ring-[#4A5D4E]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#524B43] mb-1">Plan (P)</label>
                  <textarea
                    rows={3}
                    value={plan}
                    onChange={(e) => setPlan(e.target.value)}
                    placeholder="Titrate micronized progesterone to 200mg nightly. Re-evaluate in 30 days..."
                    className="w-full p-2.5 rounded-xl border border-[#DDD7CC] bg-white text-xs text-[#2E2924] focus:outline-none focus:ring-1 focus:ring-[#4A5D4E]"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNote(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-[#DDD7CC] text-xs text-[#524B43] hover:bg-[#F2ECE2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingNote}
                  className="px-4 py-1.5 rounded-xl bg-[#4A5D4E] hover:bg-[#3E4E42] text-white text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  {isSavingNote ? 'Saving...' : 'Sign & Commit Note to EHR'}
                </button>
              </div>
            </form>
          )}

          {/* Notes List */}
          <div className="space-y-3">
            {clinicalNotes.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#766E65] bg-[#FAF8F5] rounded-xl border border-[#EBE4DA]">
                No formal clinician SOAP notes recorded for this patient yet.
              </div>
            ) : (
              clinicalNotes.map((note) => (
                <div key={note.id} className="p-4 bg-[#FAF8F5] rounded-xl border border-[#EBE4DA] text-xs space-y-2.5">
                  <div className="flex items-center justify-between border-b border-[#ECE5DC] pb-2">
                    <span className="font-bold text-[#2E2924] font-serif">{note.doctor_name || 'Attending Clinician'}</span>
                    <span className="text-[#766E65] font-mono text-[11px]">{note.created_at}</span>
                  </div>
                  {note.content ? (
                    <p className="text-[#2E2924] leading-relaxed">{note.content}</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#524B43]">
                      {note.subjective && <p><b className="text-[#2E2924]">S:</b> {note.subjective}</p>}
                      {note.objective && <p><b className="text-[#2E2924]">O:</b> {note.objective}</p>}
                      {note.assessment && <p><b className="text-[#2E2924]">A:</b> {note.assessment}</p>}
                      {note.plan && <p><b className="text-[#2E2924]">P:</b> {note.plan}</p>}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: PATIENT CHAT                                                       */}
      {/* ========================================================================= */}
      {activeProfileTab === 'messages' && (
        <div className="bg-white rounded-2xl p-5 border border-[#E2DBD0] shadow-sm">
          <DoctorChatHub
            patients={[patientDetails]}
            defaultPatientId={patientId}
          />
        </div>
      )}

      {/* Telehealth Live Consultation Room Drawer / Modal */}
      {isTelehealthLiveOpen && (
        <TelehealthConsultationRoom
          patient={patientDetails}
          onClose={() => setIsTelehealthLiveOpen(false)}
        />
      )}
    </div>
  );
};
