import React, { useState, useEffect, useMemo } from 'react';
import {
  PlusCircle,
  Upload,
  FileText,
  Calendar as CalendarIcon,
  Activity,
  Sparkles,
  Download,
  Flame,
  Wind,
  Video,
  Heart,
  Droplet,
  Moon,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Stethoscope,
  ChevronRight,
  Sun,
  Pill,
  MessageSquare,
  FlaskConical,
  Zap,
  RotateCw,
  TrendingUp,
} from 'lucide-react';
import { api } from '../api/client';
import { InteractiveCheckInModal } from '../components/patient/InteractiveCheckInModal';
import { LabUploadModal } from '../components/patient/LabUploadModal';
import { DoctorLinkCard } from '../components/patient/DoctorLinkCard';
import { AnomalyBanner } from '../components/patient/AnomalyBanner';
import { SymptomTrendsChart } from '../components/patient/SymptomTrendsChart';
import { BodyHotspotMap } from '../components/patient/BodyHotspotMap';
import { BreathingReliefModal } from '../components/patient/BreathingReliefModal';
import { PatientTelehealthModal } from '../components/patient/PatientTelehealthModal';
import { CycleCalendarView } from '../components/patient/CycleCalendarView';
import { MedicationAdherenceCard } from '../components/patient/MedicationAdherenceCard';
import { TriggerCorrelatorCard } from '../components/patient/TriggerCorrelatorCard';
import { MRSAssessmentModal } from '../components/patient/MRSAssessmentModal';
import { CareTeamChatModal } from '../components/patient/CareTeamChatModal';
import { BiomarkerGaugesCard } from '../components/patient/BiomarkerGaugesCard';
import { StatCard, StatCardGroup } from '@/components/ui/stat-card';
import { AnalyticsBento } from '@/components/ui/analytics-bento';
import { getPatientBentoData } from '@/lib/bento-adapters';
import {
  translateStage,
  translateConcept,
  translateSymptom,
  formatSeverity,
} from '../utils/terminology';

interface PatientDashboardProps {
  user: any;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'calendar' | 'medications' | 'analytics' | 'labs' | 'telehealth'
  >('overview');

  const [profile, setProfile] = useState<any | null>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [chartsData, setChartsData] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);

  // Modals
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isLabUploadOpen, setIsLabUploadOpen] = useState(false);
  const [isBreathingOpen, setIsBreathingOpen] = useState(false);
  const [isTelehealthOpen, setIsTelehealthOpen] = useState(false);
  const [isMrsOpen, setIsMrsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Quick Flash feedback toast
  const [quickFlashCount, setQuickFlashCount] = useState<number>(0);
  const [quickFlashToast, setQuickFlashToast] = useState<string | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [profRes, alertsRes, chartsRes, histRes, apptsRes] = await Promise.all([
        api.getPatientProfile().catch(() => null),
        api.listAlerts().catch(() => []),
        api.getCharts(30).catch(() => null),
        api.getCheckInHistory().catch(() => []),
        api.listAppointments().catch(() => []),
      ]);
      setProfile(profRes);
      setAlerts(alertsRes);
      setChartsData(chartsRes);
      setHistory(histRes);
      setAppointments(apptsRes);
    } catch (err) {
      console.error('Error loading patient telemetry:', err);
    }
  };

  const handleDownloadPdf = () => {
    const url = api.downloadPdfUrl(30);
    window.open(url, '_blank');
  };

  const handleQuickHotFlash = async () => {
    const newCount = quickFlashCount + 1;
    setQuickFlashCount(newCount);
    setQuickFlashToast(`Hot Flash logged (#${newCount} today). Opening detailed assessment.`);
    setTimeout(() => {
      setQuickFlashToast(null);
      setIsCheckInOpen(true);
    }, 1200);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const streakDays = Math.min(history.length, 7);

  const bentoData = useMemo(() => {
    return getPatientBentoData(chartsData, history);
  }, [chartsData, history]);

  // Compute composite MRS score from latest check-in or profile
  const latestMrs = useMemo(() => {
    if (profile?.latest_mrs_score !== undefined) return profile.latest_mrs_score;
    if (history.length > 0 && history[0].mrs_total !== undefined) return history[0].mrs_total;
    return 18; // default benchmark
  }, [profile, history]);

  return (
    <div className="w-full min-h-screen bg-ivory text-charcoal pb-16">
      
      {/* Toast Notification */}
      {quickFlashToast && (
        <div className="fixed top-20 right-6 z-50 bg-peach text-white font-medium text-xs px-4 py-2.5 rounded-xl shadow-warm-lg flex items-center space-x-2 transition-all duration-300 ease-out border border-peach/50">
          <Flame className="w-4 h-4 text-white" />
          <span>{quickFlashToast}</span>
        </div>
      )}

      {/* Top Header / Pathways Subnav */}
      <div className="bg-cream/90 backdrop-blur-md border-b border-[#E2DBD0] sticky top-16 z-30">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between overflow-x-auto py-2.5 gap-2 scrollbar-none">
            <div className="flex items-center gap-1.5 shrink-0">
              {[
                { id: 'overview', label: "Your Health Overview", icon: Activity },
                { id: 'calendar', label: 'Cycle & Period Calendar', icon: CalendarIcon },
                { id: 'medications', label: 'Your Daily Medications', icon: Pill },
                { id: 'analytics', label: 'Changes Over Time', icon: TrendingUp },
                { id: 'labs', label: 'Your Blood Tests & Labs', icon: FlaskConical },
                { id: 'telehealth', label: 'Doctor Visits & Messages', icon: Video },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                      isActive
                        ? 'bg-sage-soft text-sage-dark border border-sage/30 shadow-warm-sm'
                        : 'text-charcoal-muted hover:text-charcoal hover:bg-oat-light border border-transparent'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sage-dark' : 'text-charcoal-light'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsChatOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-teal-soft text-teal-dark border border-teal/20 hover:bg-teal/15 transition-all shadow-warm-sm"
              >
                <MessageSquare className="w-3.5 h-3.5 text-teal" />
                <span className="hidden sm:inline">Message Doctor</span>
              </button>
              <button
                onClick={() => setIsTelehealthOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-sage-dark hover:bg-sage text-cream transition-all shadow-warm-sm"
              >
                <Video className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Video Visit</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Page Body */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">

        {/* Ambient Atmosphere */}
        <div className="relative">
          <div className="absolute -top-12 left-1/4 w-96 h-96 rounded-full bg-sage-soft/60 blur-3xl pointer-events-none" />
          <div className="absolute top-10 right-10 w-80 h-80 rounded-full bg-peach-soft/60 blur-3xl pointer-events-none" />

          {/* Hero Welcome Card */}
          <div className="relative z-10 bg-cream/95 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-[#E2DBD0] shadow-warm-md flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-sage-dark bg-sage-soft px-3 py-1 rounded-full border border-sage/20">
                  {translateStage(profile?.straw_stage || 'early_perimenopause', 'patient')}
                </span>
                <span className="text-xs font-medium text-charcoal bg-peach-soft px-3 py-1 rounded-full border border-peach/30 flex items-center gap-1.5">
                  <span>🔥</span>
                  <span>{streakDays > 0 ? `${streakDays}-Day Logging Streak` : 'Streak Active'}</span>
                </span>
                <span className="text-xs font-medium text-charcoal-muted bg-oat-light px-3 py-1 rounded-full border border-[#E2DBD0]">
                  Connected With Doctor
                </span>
              </div>

              <div>
                <h1 className="font-serif text-3xl sm:text-4xl text-charcoal font-normal tracking-tight">
                  {getGreeting()}, <span className="italic">{user.full_name}</span> 🌸
                </h1>
                <p className="text-xs sm:text-sm text-charcoal-muted mt-1 max-w-xl text-pretty">
                  Here is your health snapshot for this week. Your logged symptoms and updates are automatically organized for your doctor visits.
                </p>
              </div>
            </div>

            {/* Hero Quick Action Suite */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => setIsCheckInOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-sage-dark hover:bg-[#3E5437] text-white text-xs font-medium shadow-warm-sm flex items-center gap-2 transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Your Daily Check-in</span>
              </button>

              <button
                onClick={() => setIsMrsOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-cream hover:bg-sage-soft text-charcoal border border-[#E2DBD0] text-xs font-medium shadow-warm-sm flex items-center gap-2 transition-colors"
              >
                <Heart className="w-4 h-4 text-sage-dark" />
                <span>Check Symptom Score</span>
              </button>

              <button
                onClick={handleQuickHotFlash}
                className="px-3.5 py-2.5 rounded-xl bg-peach-soft hover:bg-peach/30 text-charcoal border border-peach/40 text-xs font-medium shadow-warm-sm flex items-center gap-1.5 transition-colors"
                title="Quick 1-Click Hot Flash Tracker"
              >
                <Flame className="w-4 h-4 text-peach" />
                <span>Hot Flash (+1)</span>
              </button>

              <button
                onClick={() => setIsBreathingOpen(true)}
                className="px-3.5 py-2.5 rounded-xl bg-teal-soft hover:bg-teal/20 text-teal-dark border border-teal/25 text-xs font-medium shadow-warm-sm flex items-center gap-1.5 transition-colors"
                title="Paced 4-7-8 Breathing Guide"
              >
                <Wind className="w-4 h-4 text-teal" />
                <span>Breathe (4-7-8)</span>
              </button>

              <button
                onClick={handleDownloadPdf}
                className="p-2.5 rounded-xl bg-cream hover:bg-oat-light text-charcoal-muted hover:text-charcoal border border-[#E2DBD0] text-xs transition-colors shadow-warm-sm"
                title="Download Summary Report (PDF)"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Anomaly / Alert Banner */}
        {alerts && alerts.length > 0 && (
          <AnomalyBanner alerts={alerts} onAppointmentBooked={loadAllData} />
        )}

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* Section: How you've been feeling */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-xl font-semibold text-charcoal">How you've been feeling</h2>
                  <p className="text-xs text-charcoal-muted">Your recent symptoms, sleep, and upcoming care at a glance</p>
                </div>
              </div>

              {/* 4 Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Symptom Score Card */}
                <div className="p-5 rounded-2xl bg-cream border border-[#E2DBD0] shadow-warm-sm hover:shadow-warm-md transition-all space-y-2">
                  <div className="flex items-center justify-between text-xs text-charcoal-muted">
                    <span className="font-semibold tracking-wide">Overall Symptom Score</span>
                    <Activity className="w-4 h-4 text-sage-dark" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-serif text-3xl font-bold text-charcoal">{latestMrs}</span>
                    <span className="text-xs text-charcoal-muted font-medium">/ 44</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-sage-dark font-semibold">
                    <span className="w-2 h-2 rounded-full bg-sage-dark" />
                    <span>{latestMrs < 15 ? 'Mild Symptoms' : latestMrs < 25 ? 'Moderate Symptoms' : 'Noticeable Symptoms'}</span>
                  </div>
                </div>

                {/* Hot Flash Frequency */}
                <div className="p-5 rounded-2xl bg-cream border border-[#E2DBD0] shadow-warm-sm hover:shadow-warm-md transition-all space-y-2">
                  <div className="flex items-center justify-between text-xs text-charcoal-muted">
                    <span className="font-semibold tracking-wide">Hot Flashes Today</span>
                    <Flame className="w-4 h-4 text-peach" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-serif text-3xl font-bold text-charcoal">
                      {history.length > 0 && history[0].hot_flashes ? history[0].hot_flashes : 3}
                    </span>
                    <span className="text-xs text-charcoal-muted font-medium">logged today</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-charcoal-muted">
                    <span>Most common in early morning</span>
                  </div>
                </div>

                {/* Sleep Restfulness */}
                <div className="p-5 rounded-2xl bg-cream border border-[#E2DBD0] shadow-warm-sm hover:shadow-warm-md transition-all space-y-2">
                  <div className="flex items-center justify-between text-xs text-charcoal-muted">
                    <span className="font-semibold tracking-wide">Sleep Duration</span>
                    <Moon className="w-4 h-4 text-lavender" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-serif text-3xl font-bold text-charcoal">6.8</span>
                    <span className="text-xs text-charcoal-muted font-medium">hours rest</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-teal-dark font-medium">
                    <span>Night awakenings reduced this week</span>
                  </div>
                </div>

                {/* Next Clinical Touchpoint */}
                <div className="p-5 rounded-2xl bg-cream border border-[#E2DBD0] shadow-warm-sm hover:shadow-warm-md transition-all space-y-2">
                  <div className="flex items-center justify-between text-xs text-charcoal-muted">
                    <span className="font-semibold tracking-wide">Your Upcoming Appointments</span>
                    <Stethoscope className="w-4 h-4 text-teal" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-serif text-2xl font-semibold text-charcoal">
                      {appointments.length > 0 ? appointments[0].date_time?.split('T')[0] : 'Tomorrow, 10:30 AM'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-charcoal-muted">
                    <span>Dr. Elena Vance, MD • Video Visit</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Bento Charts: Changes over time */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-xl font-semibold text-charcoal">Changes over time</h2>
                  <p className="text-xs text-charcoal-muted">Your symptoms and daily patterns across the last 7 to 30 days</p>
                </div>
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-sage-soft text-sage-dark border border-sage/20">
                  7-Day Trend
                </span>
              </div>

              <div className="bg-cream rounded-2xl p-4 sm:p-6 border border-[#E2DBD0] shadow-warm-md overflow-hidden">
                <AnalyticsBento
                  revenue={bentoData.revenue}
                  sessions={bentoData.sessions}
                  categories={bentoData.categories}
                  seasonality={bentoData.seasonality}
                  colors={{
                    revenue: ['#4A5F43', '#71846A'],
                    desktop: ['#4A5F43', '#71846A'],
                    mobile: ['#527772', '#E8F1EF'],
                    radar: '#4A5F43',
                  }}
                  credit={false}
                />
              </div>
            </div>

            {/* Split Grid: Symptom Trends & Interactive Hotspots */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 bg-cream rounded-2xl p-6 border border-[#E2DBD0] shadow-warm-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[#E2DBD0]/60 pb-3">
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-charcoal">Your symptoms</h3>
                    <p className="text-xs text-charcoal-muted">How your symptoms have felt over the last 30 days</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className="text-xs font-medium text-sage-dark hover:text-charcoal flex items-center gap-1 transition-colors"
                  >
                    <span>Full Trends View</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <SymptomTrendsChart chartsData={chartsData} />
              </div>

              <div className="lg:col-span-4 space-y-6">
                {/* Body Hotspot Visualizer */}
                <div className="bg-cream rounded-2xl p-6 border border-[#E2DBD0] shadow-warm-sm space-y-3">
                  <h3 className="font-serif text-lg font-semibold text-charcoal">Where You Feel Symptoms</h3>
                  <p className="text-xs text-charcoal-muted">Click a region to see which symptoms you have logged there.</p>
                  <BodyHotspotMap onSelectSymptom={(s) => console.log('Selected hotspot:', s)} />
                </div>

                {/* Doctor Attending Card */}
                <DoctorLinkCard
                  linkedDoctorName={profile?.doctor_name || profile?.doctor_practice_code || null}
                  onLinked={loadAllData}
                />
              </div>
            </div>

            {/* Trigger Correlator & Medication Adherence Strip */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6 bg-cream rounded-2xl p-6 border border-[#E2DBD0] shadow-warm-sm space-y-3">
                <h3 className="font-serif text-lg font-semibold text-charcoal">What Influences Your Symptoms</h3>
                <TriggerCorrelatorCard />
              </div>

              <div className="lg:col-span-6 bg-cream rounded-2xl p-6 border border-[#E2DBD0] shadow-warm-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-lg font-semibold text-charcoal">Your daily medications & vitamins</h3>
                  <button
                    onClick={() => setActiveTab('medications')}
                    className="text-xs font-medium text-sage-dark hover:text-charcoal flex items-center gap-1"
                  >
                    <span>Manage Medications</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <MedicationAdherenceCard onLogged={loadAllData} />
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Cycle & Menstrual Calendar */}
        {activeTab === 'calendar' && (
          <div className="space-y-6">
            <div className="bg-cream rounded-2xl p-6 border border-[#E2DBD0] shadow-warm-sm">
              <CycleCalendarView
                history={history}
                strawStage={profile?.straw_stage || 'early_transition'}
              />
            </div>
          </div>
        )}

        {/* Tab 3: Medications & HRT Tracker */}
        {activeTab === 'medications' && (
          <div className="space-y-6">
            <div className="bg-cream rounded-2xl p-6 border border-[#E2DBD0] shadow-warm-sm">
              <MedicationAdherenceCard onLogged={loadAllData} />
            </div>
          </div>
        )}

        {/* Tab 4: Changes Over Time */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-cream rounded-2xl p-6 border border-[#E2DBD0] shadow-warm-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#E2DBD0]/60 pb-3">
                <div>
                  <h2 className="font-serif text-xl font-semibold text-charcoal">Changes over time</h2>
                  <p className="text-xs text-charcoal-muted">See how your symptoms and daily logs have changed over the past 30 days.</p>
                </div>
                <button
                  onClick={handleDownloadPdf}
                  className="px-3.5 py-1.5 rounded-xl bg-sage-dark hover:bg-[#3E5437] text-white text-xs font-medium flex items-center gap-1.5 shadow-warm-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Your Health Report (PDF)</span>
                </button>
              </div>

              <SymptomTrendsChart chartsData={chartsData} />
            </div>
          </div>
        )}

        {/* Tab 5: Lab Tests & Bloodwork */}
        {activeTab === 'labs' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-xl font-semibold text-charcoal">Your blood tests & labs</h2>
                <p className="text-xs text-charcoal-muted">Track and review your hormone and health test results with your doctor.</p>
              </div>
              <button
                onClick={() => setIsLabUploadOpen(true)}
                className="px-4 py-2 rounded-xl bg-sage-dark hover:bg-[#3E5437] text-white text-xs font-medium flex items-center gap-2 shadow-warm-sm"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>+ Upload Lab Report (PDF)</span>
              </button>
            </div>

            <BiomarkerGaugesCard />
          </div>
        )}

        {/* Tab 6: Care Team & Telehealth */}
        {activeTab === 'telehealth' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-cream rounded-2xl p-6 border border-[#E2DBD0] shadow-warm-sm space-y-4">
              <h2 className="font-serif text-xl font-semibold text-charcoal">Your upcoming appointments</h2>
              <p className="text-xs text-charcoal-muted">Secure, private video room for scheduled appointments with your doctor.</p>
              <div className="p-8 rounded-xl bg-ivory border border-[#E2DBD0] text-center space-y-3">
                <Video className="w-10 h-10 text-teal mx-auto" />
                <h3 className="font-serif text-lg font-semibold text-charcoal">Virtual Consultation Ready</h3>
                <p className="text-xs text-charcoal-muted max-w-md mx-auto text-pretty">
                  Your appointment with Dr. Elena Vance is confirmed. Your symptom logs and notes are ready for your doctor.
                </p>
                <button
                  onClick={() => setIsTelehealthOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-sage-dark hover:bg-[#3E5437] text-white text-xs font-medium shadow-warm-sm"
                >
                  Join Video Visit
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 bg-cream rounded-2xl p-6 border border-[#E2DBD0] shadow-warm-sm space-y-4">
              <h2 className="font-serif text-xl font-semibold text-charcoal">Messages with your care team</h2>
              <p className="text-xs text-charcoal-muted">Send a private question or update directly to your doctor's office.</p>
              <button
                onClick={() => setIsChatOpen(true)}
                className="w-full py-3 rounded-xl bg-teal-soft hover:bg-teal/20 text-teal-dark border border-teal/25 text-xs font-medium shadow-warm-sm flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4 text-teal" />
                <span>Open Messages</span>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Modals Suite */}
      <InteractiveCheckInModal
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        onSuccess={(newAlerts) => {
          loadAllData();
          if (newAlerts && newAlerts.length > 0) {
            setAlerts((prev) => [...newAlerts, ...prev]);
          }
        }}
      />

      <MRSAssessmentModal
        isOpen={isMrsOpen}
        onClose={() => setIsMrsOpen(false)}
        onCompleted={loadAllData}
      />

      <LabUploadModal
        isOpen={isLabUploadOpen}
        onClose={() => setIsLabUploadOpen(false)}
        onVerified={() => loadAllData()}
      />

      <BreathingReliefModal
        isOpen={isBreathingOpen}
        onClose={() => setIsBreathingOpen(false)}
      />

      <PatientTelehealthModal
        isOpen={isTelehealthOpen}
        onClose={() => setIsTelehealthOpen(false)}
        onSuccess={loadAllData}
      />

      <CareTeamChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

    </div>
  );
};
