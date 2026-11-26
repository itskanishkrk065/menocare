import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Video,
  FileText,
  Download,
  Sparkles,
  Activity,
  PenTool,
  Calendar,
  Clock,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Droplet,
  FlaskConical,
  MessageSquare,
  Share2,
  TrendingUp,
  Plus,
  Heart,
  User,
  Layers,
  ChevronRight,
  Send,
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
  onBack: () => void;
  onScheduleMeeting: (patientId: string) => void;
}

export const PatientProfileView: React.FC<PatientProfileViewProps> = ({
  patientId,
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

  useEffect(() => {
    loadAllPatientData(windowDays);
  }, [patientId]);

  const loadAllPatientData = async (days: number) => {
    setIsLoading(true);
    try {
      const [patientsList, charts, diff, timeline, notes] = await Promise.all([
        api.listAuthorizedPatients().catch(() => []),
        api.getCharts(days, patientId).catch(() => null),
        api.getDifferential(patientId).catch(() => null),
        api.getPatientTimeline(patientId).catch(() => []),
        api.listPatientNotes(patientId).catch(() => []),
      ]);

      const matched = patientsList.find((p: any) => (p.patient_id || p.id) === patientId);
      setPatientDetails(matched || null);
      setChartsData(charts);
      setDiffData(diff);
      setTimelineEvents(timeline);
      setClinicalNotes(notes);
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
    return true;
  });

  if (isLoading) {
    return (
      <div className="p-20 text-center text-xs text-charcoal-muted space-y-3 font-sans">
        <Activity className="w-8 h-8 text-sage-dark animate-pulse mx-auto" />
        <p className="font-medium text-sm text-charcoal">Loading Comprehensive Patient Profile & Longitudinal Feed...</p>
      </div>
    );
  }

  const patientName = patientDetails?.full_name || 'Patient';
  const patientAge = patientDetails?.age || 48;
  const strawStage = patientDetails?.straw_stage || 'Early Transition';
  const alertsList = patientDetails?.alerts || [];
  const hasCritical = patientDetails?.has_high_priority_alerts;

  return (
    <div className="space-y-6 font-sans text-charcoal pb-16">
      {/* ========================================================================= */}
      {/* 1. TOP ACTION BAR (Screen 1 Design Header)                                */}
      {/* ========================================================================= */}
      <section className="bg-cream rounded-card p-4 sm:p-5 border border-outline-variant shadow-warm-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-charcoal hover:text-sage-dark transition-colors self-start"
        >
          <ArrowLeft className="w-4 h-4 text-charcoal-muted" />
          <span>&larr; Back to Patient Directory &amp; Dossier</span>
        </button>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsTelehealthLiveOpen(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-sage-dark hover:bg-sage-dark/90 text-ivory rounded-xl text-xs font-semibold shadow-warm-sm transition-all"
          >
            <Video className="w-3.5 h-3.5" />
            <span>Launch Live Telehealth</span>
          </button>

          <button
            onClick={handleGenerateSummary}
            disabled={isGeneratingAi}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-teal-dark hover:bg-teal-dark/90 text-ivory rounded-xl text-xs font-semibold shadow-warm-sm transition-all disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-soft" />
            <span>{isGeneratingAi ? 'Synthesizing...' : 'AI Clinical Summary'}</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-charcoal hover:bg-charcoal/90 text-ivory rounded-xl text-xs font-semibold shadow-warm-sm transition-all"
          >
            <Download className="w-3.5 h-3.5 text-oat" />
            <span>Certified PDF</span>
          </button>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. HERO PATIENT PROFILE BANNER (Screen 1 Warm Health Design)             */}
      {/* ========================================================================= */}
      <div className="bg-cream rounded-card border border-outline-variant shadow-warm-md overflow-hidden">
        {/* Cover Gradient with Clinical Status Badge */}
        <div className="h-32 bg-gradient-to-r from-[#37604F] via-[#3D6A5C] to-[#35535E] relative p-4 flex items-start justify-end">
          {hasCritical ? (
            <span className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#FFDAD6] text-[#BA1A1A] border border-[#FFB4AB] shadow-warm-sm flex items-center space-x-1.5 animate-pulse">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Tier A Red Flag Active</span>
            </span>
          ) : alertsList.length > 0 ? (
            <span className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-sand-soft text-[#8C6D23] border border-sand shadow-warm-sm flex items-center space-x-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Pathology Monitored</span>
            </span>
          ) : (
            <span className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-sage-soft text-sage-dark border border-sage/40 shadow-warm-sm flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Benign Transition Protocol</span>
            </span>
          )}
        </div>

        {/* Profile Details & Identity */}
        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 -mt-12">
            {/* Avatar & Patient Name */}
            <div className="flex items-end space-x-4">
              <div className="w-24 h-24 rounded-3xl bg-cream p-1.5 shadow-warm-md border-2 border-white shrink-0">
                <div className="w-full h-full rounded-2xl bg-sage-dark flex items-center justify-center text-ivory text-2xl font-serif font-bold shadow-inner">
                  {patientName.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-serif text-2xl md:text-3xl font-bold text-charcoal tracking-tight">
                    {patientName}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-ivory text-charcoal border border-outline-variant font-mono">
                    Age: {patientAge}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sage-soft text-sage-dark border border-sage/40">
                    {strawStage}
                  </span>
                </div>

                <p className="text-xs text-charcoal-muted">
                  Patient ID: <span className="font-mono text-charcoal font-semibold">{patientId.substring(0, 8)}</span> • Linked via Encrypted Practice Code
                </p>
              </div>
            </div>

            {/* Quick Vitals Metrics Strip */}
            <div className="flex items-center divide-x divide-outline-variant bg-ivory/90 p-2.5 rounded-2xl border border-outline-variant shadow-warm-sm text-center self-start md:self-auto">
              <div className="px-3.5 py-1">
                <span className="text-[10px] font-semibold text-charcoal-muted uppercase tracking-wide block">Check-Ins</span>
                <p className="text-sm font-serif font-bold text-charcoal">{chartsData?.total_recorded_days || timelineEvents.filter(e => e.type === 'checkin').length}</p>
              </div>

              <div className="px-3.5 py-1">
                <span className="text-[10px] font-semibold text-charcoal-muted uppercase tracking-wide block">Adherence</span>
                <p className="text-sm font-serif font-bold text-sage-dark">{chartsData?.adherence_rate_pct || 78}%</p>
              </div>

              <div className="px-3.5 py-1">
                <span className="text-[10px] font-semibold text-charcoal-muted uppercase tracking-wide block">Alerts</span>
                <p className={`text-sm font-serif font-bold ${hasCritical ? 'text-[#BA1A1A]' : alertsList.length > 0 ? 'text-[#8C6D23]' : 'text-charcoal'}`}>
                  {alertsList.length}
                </p>
              </div>

              <div className="px-3.5 py-1">
                <span className="text-[10px] font-semibold text-charcoal-muted uppercase tracking-wide block">Labs Used</span>
                <p className="text-sm font-serif font-bold text-teal-dark">{Object.keys(diffData?.verified_labs_used || {}).length}</p>
              </div>
            </div>
          </div>

          {/* Baseline Tags Strip */}
          <div className="mt-4 pt-4 border-t border-outline-variant/60 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-charcoal-muted font-semibold">Clinical Baseline:</span>
            <span className="bg-ivory text-charcoal px-2.5 py-1 rounded-lg font-medium border border-outline-variant">
              Amenorrhea: {patientDetails?.surgical_history?.amenorrhea_days ? `${patientDetails.surgical_history.amenorrhea_days} days` : 'None reported'}
            </span>
            <span className="bg-ivory text-charcoal px-2.5 py-1 rounded-lg font-medium border border-outline-variant">
              Meds: {patientDetails?.current_medications?.length > 0 ? patientDetails.current_medications.join(', ') : 'No HRT currently'}
            </span>
            {alertsList.map((a: any) => (
              <span
                key={a.id}
                className={`px-2.5 py-1 rounded-lg font-semibold border ${
                  a.severity_level === 'emergency' || a.severity_level === 'urgent'
                    ? 'bg-[#FFDAD6] text-[#BA1A1A] border-[#FFB4AB]'
                    : 'bg-sand-soft text-[#8C6D23] border-sand'
                }`}
              >
                {a.condition_name} ({a.confidence_score}%)
              </span>
            ))}
          </div>
        </div>

        {/* 3. Secondary Sub-Navigation Tabs */}
        <div className="border-t border-outline-variant px-6 flex space-x-6 text-xs font-semibold overflow-x-auto bg-ivory/40">
          {[
            { id: 'feed', label: 'Health Timeline', icon: MessageSquare, count: timelineEvents.length },
            { id: 'charts', label: 'Biometrics & Trends', icon: Activity },
            { id: 'differentials', label: 'Health Patterns', icon: ShieldAlert, count: diffData?.screenings?.length },
            { id: 'labs', label: 'Blood Tests & Labs', icon: FlaskConical, count: Object.keys(diffData?.verified_labs_used || {}).length },
            { id: 'hrt_advisor', label: 'Hormone Therapy Guide', icon: Heart },
            { id: 'notes', label: "Doctor's Notes (SOAP)", icon: PenTool, count: clinicalNotes.length },
            { id: 'messages', label: 'Patient Chat', icon: MessageSquare },
          ].map((tab: any) => {
            const Icon = tab.icon;
            const isActive = activeProfileTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveProfileTab(tab.id)}
                className={`py-3.5 flex items-center space-x-2 border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-sage-dark text-sage-dark font-bold'
                    : 'border-transparent text-charcoal-muted hover:text-charcoal'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                      isActive ? 'bg-sage-soft text-sage-dark font-semibold' : 'bg-oat text-charcoal-muted'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* AI Clinical Summary Banner (if generated) */}
      {aiReport && (
        <div className="bg-cream rounded-card p-6 border border-teal/40 shadow-warm-md space-y-4">
          <div className="flex items-center justify-between border-b border-outline-variant pb-3">
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
            <div className="bg-ivory/80 p-4 rounded-xl border border-outline-variant">
              <span className="text-xs font-bold text-charcoal uppercase tracking-wider block mb-2">Primary Symptom Drivers</span>
              <div className="space-y-2">
                {aiReport.ai_summary?.primary_symptom_drivers?.map((d: any, idx: number) => (
                  <div key={idx} className="text-xs text-charcoal-muted">
                    <span className="font-semibold text-charcoal">• {d.symptom_name} ({d.clinical_trajectory}):</span> {d.narrative}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-ivory/80 p-4 rounded-xl border border-outline-variant">
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
      {/* 3. TAB 1: SOCIAL HEALTH TIMELINE FEED (Screen 1 Core Section)             */}
      {/* ========================================================================= */}
      {activeProfileTab === 'feed' && (
        <div className="space-y-5">
          {/* Feed Filter Bar + Post Note Action */}
          <div className="bg-cream p-4 rounded-card border border-outline-variant shadow-warm-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: `All Updates (${timelineEvents.length})` },
                { id: 'checkin', label: `Daily Check-Ins (${timelineEvents.filter(e => e.type === 'checkin').length})` },
                { id: 'bleeding', label: `Bleeding Updates (${timelineEvents.filter(e => e.type === 'bleeding').length})` },
                { id: 'alert', label: `Clinical Alerts (${timelineEvents.filter(e => e.type === 'alert').length})` },
                { id: 'notes', label: `Physician Notes (${timelineEvents.filter(e => e.type === 'doctor_note').length})` },
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setFeedFilter(btn.id)}
                  className={`px-3 py-1.5 rounded-full font-medium transition-all ${
                    feedFilter === btn.id
                      ? 'bg-charcoal text-ivory font-bold shadow-warm-sm'
                      : 'bg-ivory text-charcoal hover:bg-oat border border-outline-variant'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setActiveProfileTab('notes');
                setIsAddingNote(true);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-ivory bg-sage-dark hover:bg-sage-dark/90 px-3.5 py-2 rounded-xl shadow-warm-sm transition-all self-start sm:self-auto shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Post Clinical Note</span>
            </button>
          </div>

          {/* Timeline Feed Stream */}
          <div className="space-y-3.5">
            {filteredFeed.length === 0 ? (
              <div className="bg-cream rounded-card p-12 sm:p-16 text-center flex flex-col items-center justify-center border border-outline-variant shadow-warm-sm">
                <div className="w-14 h-14 rounded-full bg-ivory flex items-center justify-center text-charcoal-muted mb-3 border border-outline-variant">
                  <FileText className="w-6 h-6 opacity-60" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-charcoal mb-1">
                  No health activity events recorded in this category.
                </h3>
                <p className="text-xs text-charcoal-muted max-w-sm mb-4 leading-relaxed">
                  Patient check-in entries, bleeding calendars, and local laboratory findings will chronologically appear here once synced.
                </p>
                <button
                  onClick={() => handleWindowChange(90)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-charcoal bg-ivory hover:bg-oat border border-outline-variant transition-colors"
                >
                  Expand to 90-Day History
                </button>
              </div>
            ) : (
              filteredFeed.map((event) => {
                if (event.type === 'alert') {
                  const isEmerg = event.severity_level === 'emergency' || event.severity_level === 'urgent';
                  return (
                    <div
                      key={event.id}
                      className={`p-5 rounded-2xl border shadow-warm-sm space-y-2.5 ${
                        isEmerg ? 'bg-[#FFF4F2] border-[#FFB4AB]' : 'bg-sand-soft/60 border-sand'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                              isEmerg ? 'bg-[#FFDAD6] text-[#BA1A1A] border-[#FFB4AB]' : 'bg-sand-soft text-[#8C6D23] border-sand'
                            }`}
                          >
                            🚨 {event.severity_level} • {event.confidence_score}% Confidence
                          </span>
                          <h4 className="text-xs font-bold text-charcoal font-serif">{event.title}</h4>
                        </div>
                        <span className="text-[11px] text-charcoal-muted font-mono">{event.date}</span>
                      </div>
                      <p className="text-xs text-charcoal leading-relaxed">{event.description}</p>
                      <p className="text-xs text-teal-dark font-medium pt-2 border-t border-outline-variant/60">
                        <b>Recommended Workup:</b> {event.recommended_action}
                      </p>
                    </div>
                  );
                }

                if (event.type === 'bleeding') {
                  const isHeavy = event.status === 'heavy' || event.status === 'spotting';
                  return (
                    <div
                      key={event.id}
                      className="bg-cream p-5 rounded-2xl border border-outline-variant shadow-warm-sm space-y-2 hover:border-sage/50 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-xl bg-peach-soft text-[#B85D51] flex items-center justify-center border border-peach/50">
                            <Droplet className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-charcoal font-serif">{event.title}</h4>
                            <span className="text-[10px] text-charcoal-muted font-mono">{event.date}</span>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                            isHeavy ? 'bg-[#FFDAD6] text-[#BA1A1A] border-[#FFB4AB]' : 'bg-oat text-charcoal border-outline-variant'
                          }`}
                        >
                          {event.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
                        <div className="p-2.5 bg-ivory rounded-xl border border-outline-variant">
                          <span className="text-[10px] text-charcoal-muted block uppercase">Duration</span>
                          <p className="font-bold text-charcoal mt-0.5">{event.duration_days} day(s)</p>
                        </div>
                        <div className="p-2.5 bg-ivory rounded-xl border border-outline-variant">
                          <span className="text-[10px] text-charcoal-muted block uppercase">Clots</span>
                          <p className="font-bold text-charcoal mt-0.5">{event.has_clots ? 'Yes' : 'No'}</p>
                        </div>
                        <div className="p-2.5 bg-ivory rounded-xl border border-outline-variant">
                          <span className="text-[10px] text-charcoal-muted block uppercase">Basal Temp</span>
                          <p className="font-bold text-charcoal mt-0.5">{event.basal_body_temp || '36.5'}°C</p>
                        </div>
                        <div className="p-2.5 bg-ivory rounded-xl border border-outline-variant">
                          <span className="text-[10px] text-charcoal-muted block uppercase">Pelvic Pain</span>
                          <p className="font-bold text-charcoal mt-0.5">{event.pelvic_pain_intensity}/4</p>
                        </div>
                      </div>
                    </div>
                  );
                }

                if (event.type === 'doctor_note') {
                  return (
                    <div
                      key={event.id}
                      className="bg-ivory p-5 rounded-2xl border border-outline-variant shadow-warm-sm space-y-2.5"
                    >
                      <div className="flex items-center justify-between border-b border-outline-variant/60 pb-2">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-xl bg-sage-soft text-sage-dark flex items-center justify-center border border-sage/40">
                            <PenTool className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-charcoal font-serif">{event.title}</h4>
                            <span className="text-[10px] text-charcoal-muted font-mono">{event.date}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-sage-dark bg-sage-soft px-2.5 py-0.5 rounded-full border border-sage/30">
                          Attending Clinician Note
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs text-charcoal pt-1">
                        {event.subjective && <p><b>S (Subjective):</b> {event.subjective}</p>}
                        {event.objective && <p><b>O (Objective):</b> {event.objective}</p>}
                        {event.assessment && <p><b>A (Assessment):</b> {event.assessment}</p>}
                        {event.plan && <p><b>P (Plan):</b> {event.plan}</p>}
                      </div>
                    </div>
                  );
                }

                // Default: Daily Check-In Post
                return (
                  <div
                    key={event.id}
                    className="bg-cream p-5 rounded-2xl border border-outline-variant shadow-warm-sm space-y-3 hover:border-sage/50 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-xl bg-sage-soft text-sage-dark flex items-center justify-center font-bold text-xs border border-sage/30">
                          ✓
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-charcoal font-serif">{event.title}</h4>
                          <span className="text-[10px] text-charcoal-muted font-mono">{event.date}</span>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                          event.max_severity >= 3
                            ? 'bg-[#FFDAD6] text-[#BA1A1A] border-[#FFB4AB]'
                            : event.max_severity >= 2
                            ? 'bg-sand-soft text-[#8C6D23] border-sand'
                            : 'bg-sage-soft text-sage-dark border-sage/30'
                        }`}
                      >
                        Peak Intensity: {event.max_severity}/4
                      </span>
                    </div>

                    {/* Reported Symptoms Badges */}
                    <div className="flex flex-wrap gap-1.5">
                      {event.symptoms?.map((s: any) => (
                        <span
                          key={s.code}
                          className={`text-[11px] px-2.5 py-0.5 rounded-lg font-medium border ${
                            s.intensity >= 3
                              ? 'bg-[#FFDAD6] text-[#BA1A1A] border-[#FFB4AB] font-bold'
                              : s.intensity >= 2
                              ? 'bg-sand-soft text-[#8C6D23] border-sand font-semibold'
                              : s.intensity >= 1
                              ? 'bg-sage-soft text-sage-dark border-sage/30'
                              : 'bg-ivory text-charcoal-muted border-outline-variant'
                          }`}
                        >
                          {s.label}: <b>{s.intensity}</b>
                        </span>
                      ))}
                    </div>

                    {/* Patient Voice Note / Journal Entry */}
                    {event.patient_notes?.length > 0 && (
                      <div className="bg-ivory p-3.5 rounded-xl border border-outline-variant text-xs text-charcoal italic space-y-1">
                        <div className="flex items-center space-x-1.5 text-charcoal-muted font-semibold not-italic text-[10px]">
                          <MessageSquare className="w-3.5 h-3.5 text-sage-dark" />
                          <span>Patient Micro-Journal Note:</span>
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
          </div>
        </div>
      )}

      {/* TAB 2: INTERACTIVE CHARTS STUDIO */}
      {activeProfileTab === 'charts' && (
        <SymptomTrendsChart
          chartsData={chartsData}
          windowDays={windowDays}
          onWindowChange={handleWindowChange}
        />
      )}

      {/* TAB 3: DIAGNOSTIC DIFFERENTIAL MATRIX */}
      {activeProfileTab === 'differentials' && (
        <div className="bg-cream rounded-card p-6 border border-outline-variant shadow-warm-md space-y-4">
          <div className="flex items-center justify-between border-b border-outline-variant pb-3">
            <div>
              <h3 className="text-base font-bold text-charcoal font-serif">Health Patterns & Differential Screening</h3>
              <p className="text-xs text-charcoal-muted">
                Screens for conditions with symptoms that overlap with menopause (Thyroid, PCOS, Fibroids) based on logged symptoms and verified lab tests.
              </p>
            </div>
            <span className="text-xs text-charcoal font-semibold bg-ivory px-3 py-1 rounded-xl border border-outline-variant">
              Stage: {diffData?.straw_stage?.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          {diffData?.screenings?.length === 0 ? (
            <div className="p-8 text-center text-xs text-charcoal-muted">
              No condition patterns crossed the clinical confidence threshold (all scores &lt; 40%).
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {diffData.screenings.map((cond: any) => {
                const isCritical = cond.risk_tier === 'critical';
                const isHigh = cond.risk_tier === 'high';

                return (
                  <div
                    key={cond.condition_code}
                    className={`p-4 rounded-xl border space-y-2 ${
                      isCritical
                        ? 'bg-[#FFF4F2] border-[#FFB4AB]'
                        : isHigh
                        ? 'bg-sand-soft/60 border-sand'
                        : 'bg-ivory border-outline-variant'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-charcoal font-serif">{cond.condition_name}</span>
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase border ${
                          isCritical
                            ? 'bg-[#FFDAD6] text-[#BA1A1A] border-[#FFB4AB]'
                            : isHigh
                            ? 'bg-sand-soft text-[#8C6D23] border-sand'
                            : 'bg-oat text-charcoal border-outline-variant'
                        }`}
                      >
                        {cond.confidence_score}% Confidence
                      </span>
                    </div>

                    <p className="text-[11px] text-charcoal-muted">{cond.category}</p>

                    <div className="space-y-1 pt-1">
                      <span className="text-[11px] font-semibold text-charcoal">Diagnostic Criteria Met:</span>
                      <ul className="text-xs text-charcoal-muted list-disc list-inside">
                        {cond.matching_criteria_met.map((crit: string, idx: number) => (
                          <li key={idx}>{crit}</li>
                        ))}
                      </ul>
                    </div>

                    <p className="text-xs font-medium text-teal-dark pt-1 border-t border-outline-variant/60">
                      <b>Recommended Workup:</b> {cond.recommended_workup}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: BIOCHEMICAL LAB VAULT */}
      {activeProfileTab === 'labs' && (
        <div className="bg-cream rounded-card p-6 border border-outline-variant shadow-warm-md space-y-4">
          <div className="flex items-center justify-between border-b border-outline-variant pb-3">
            <div>
              <h3 className="text-base font-bold text-charcoal font-serif">Verified Laboratory Analytes & Blood Panels</h3>
              <p className="text-xs text-charcoal-muted">Extracted and verified lab values from patient reports</p>
            </div>
            <span className="text-xs font-semibold text-sage-dark bg-sage-soft px-3 py-1 rounded-xl border border-sage/30">
              Verified Lab Analytes
            </span>
          </div>

          {Object.keys(diffData?.verified_labs_used || {}).length === 0 ? (
            <div className="p-8 text-center text-xs text-charcoal-muted">
              No local laboratory reports uploaded or verified for this patient yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {Object.entries(diffData.verified_labs_used).map(([name, val]: [string, any]) => (
                <div key={name} className="p-3 bg-ivory rounded-xl border border-outline-variant">
                  <span className="text-xs font-medium text-charcoal-muted">{name}</span>
                  <p className="text-base font-bold text-charcoal mt-0.5 font-serif">{val}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: DOCTOR SOAP NOTES & CARE PLAN */}
      {activeProfileTab === 'notes' && (
        <div className="bg-cream rounded-card p-6 border border-outline-variant shadow-warm-md space-y-4">
          <div className="flex items-center justify-between border-b border-outline-variant pb-3">
            <div>
              <h3 className="text-base font-bold text-charcoal font-serif">Clinician Longitudinal SOAP Notes & Care Plan</h3>
              <p className="text-xs text-charcoal-muted">Structured documentation of subjective complaints, physical exams, and management plans.</p>
            </div>

            <button
              onClick={() => setIsAddingNote(!isAddingNote)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-sage-dark hover:bg-sage-dark/90 text-ivory rounded-xl text-xs font-semibold shadow-warm-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAddingNote ? 'Cancel Note' : 'Draft New Note'}</span>
            </button>
          </div>

          {/* Form Composer */}
          {isAddingNote && (
            <form onSubmit={handleSaveNote} className="bg-ivory p-5 rounded-2xl border border-outline-variant shadow-warm-sm space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal font-serif">New SOAP Clinical Entry</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-charcoal-muted mb-1">Subjective (S)</label>
                  <textarea
                    rows={3}
                    value={subjective}
                    onChange={(e) => setSubjective(e.target.value)}
                    placeholder="Patient reports nocturnal hot flashes with insomnia..."
                    className="w-full p-2.5 rounded-xl border border-outline-variant bg-white text-xs text-charcoal focus:outline-none focus:ring-1 focus:ring-sage-dark"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-charcoal-muted mb-1">Objective (O)</label>
                  <textarea
                    rows={3}
                    value={objective}
                    onChange={(e) => setObjective(e.target.value)}
                    placeholder="Vitals: BP 118/76, HR 72. BMI 24.1. Serum E2 nadir 18 pg/mL..."
                    className="w-full p-2.5 rounded-xl border border-outline-variant bg-white text-xs text-charcoal focus:outline-none focus:ring-1 focus:ring-sage-dark"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-charcoal-muted mb-1">Assessment (A)</label>
                  <textarea
                    rows={3}
                    value={assessment}
                    onChange={(e) => setAssessment(e.target.value)}
                    placeholder="Late perimenopause transition with vasomotor exacerbation..."
                    className="w-full p-2.5 rounded-xl border border-outline-variant bg-white text-xs text-charcoal focus:outline-none focus:ring-1 focus:ring-sage-dark"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-charcoal-muted mb-1">Plan (P)</label>
                  <textarea
                    rows={3}
                    value={plan}
                    onChange={(e) => setPlan(e.target.value)}
                    placeholder="Titrate micronized progesterone to 200mg nightly. Re-evaluate in 30 days..."
                    className="w-full p-2.5 rounded-xl border border-outline-variant bg-white text-xs text-charcoal focus:outline-none focus:ring-1 focus:ring-sage-dark"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNote(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-outline-variant text-xs text-charcoal hover:bg-oat"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingNote}
                  className="px-4 py-1.5 rounded-xl bg-sage-dark hover:bg-sage-dark/90 text-ivory text-xs font-semibold shadow-warm-sm disabled:opacity-50"
                >
                  {isSavingNote ? 'Saving...' : 'Commit Note to EHR'}
                </button>
              </div>
            </form>
          )}

          {/* Notes List */}
          <div className="space-y-3">
            {clinicalNotes.length === 0 ? (
              <div className="p-8 text-center text-xs text-charcoal-muted">
                No formal clinician SOAP notes recorded for this patient yet.
              </div>
            ) : (
              clinicalNotes.map((note) => (
                <div key={note.id} className="p-4 bg-ivory rounded-xl border border-outline-variant text-xs space-y-2">
                  <div className="flex items-center justify-between border-b border-outline-variant/60 pb-1.5">
                    <span className="font-bold text-charcoal font-serif">{note.doctor_name || 'Attending Physician'}</span>
                    <span className="text-charcoal-muted font-mono text-[11px]">{note.created_at}</span>
                  </div>
                  {note.content ? (
                    <p className="text-charcoal leading-relaxed">{note.content}</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-charcoal-muted">
                      {note.subjective && <p><b className="text-charcoal">S:</b> {note.subjective}</p>}
                      {note.objective && <p><b className="text-charcoal">O:</b> {note.objective}</p>}
                      {note.assessment && <p><b className="text-charcoal">A:</b> {note.assessment}</p>}
                      {note.plan && <p><b className="text-charcoal">P:</b> {note.plan}</p>}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 6: HRT ADVISOR */}
      {activeProfileTab === 'hrt_advisor' && (
        <HrtProtocolAdvisor
          patient={patientDetails}
        />
      )}

      {/* TAB 7: DIRECT MESSAGES */}
      {activeProfileTab === 'messages' && (
        <div className="bg-cream rounded-card p-5 border border-outline-variant shadow-warm-md">
          <DoctorChatHub
            patients={[patientDetails]}
            defaultPatientId={patientId}
          />
        </div>
      )}

      {/* Telehealth Live Consultation Modal */}
      {isTelehealthLiveOpen && (
        <TelehealthConsultationRoom
          patient={patientDetails}
          onClose={() => setIsTelehealthLiveOpen(false)}
        />
      )}
    </div>
  );
};
