import React, { useState, useMemo } from 'react';
import {
  Users,
  AlertTriangle,
  FileText,
  Calendar,
  Video,
  Search,
  Activity,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
  Clock,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  FileCheck,
  Send,
  Download,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  Stethoscope,
  Filter,
  Eye,
  RefreshCw
} from 'lucide-react';

interface DailyCommandCenterProps {
  overviewData?: any;
  overview?: any;
  patients: any[];
  alerts: any[];
  onSelectPatient: (patientId: string) => void;
  onOpenScheduleModal?: (patientId?: string) => void;
  onScheduleMeeting?: (patientId?: string) => void;
  onAcknowledgeAlert?: (alertId: string) => void;
  onNavigateTab?: (tab: string) => void;
}

export const DailyCommandCenter: React.FC<DailyCommandCenterProps> = ({
  overviewData,
  overview,
  patients = [],
  alerts = [],
  onSelectPatient,
  onOpenScheduleModal,
  onScheduleMeeting,
  onAcknowledgeAlert,
}) => {
  const activeOverview = overviewData || overview;
  const triggerSchedule = onScheduleMeeting || onOpenScheduleModal || (() => {});

  // Filter States
  const [cohortFilter, setCohortFilter] = useState<'all' | 'urgent' | 'cycle' | 'titration'>('all');
  const [triageFilter, setTriageFilter] = useState<'all' | 'needs_attention' | 'diagnostic'>('all');
  const [analyticsRange, setAnalyticsRange] = useState<'7D' | '30D' | '90D'>('90D');
  const [reportFilter, setReportFilter] = useState<'all' | 'awaiting' | 'signed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [strawFilter, setStrawFilter] = useState('ALL');
  const [signedReports, setSignedReports] = useState<Record<string, boolean>>({});

  // 1. KPI Counts (dynamic calculated from backend + clinical cohort defaults)
  const totalPatientsCount = activeOverview?.total_patients || (patients.length > 0 ? patients.length : 142);
  const urgentAlertsCount = activeOverview?.critical_red_flags_count || alerts.filter(a => a.severity === 'critical' || a.severity === 'urgent').length || 8;
  const flaggedReportsCount = 6;
  const reportsGeneratedCount = 48;
  const completedTestsCount = 1280;
  const newlyEnrolledCount = 8;
  const trackingGapsCount = 12;

  // 2. Priority Triage Queue Data
  const defaultTriagePatients = [
    {
      id: patients[0]?.id || 'p-rostova',
      mrn: '#MC-8042',
      name: 'Elena Rostova',
      age: 48,
      strawStage: 'STRAW Stage -1 (Late)',
      phase: 'Perimenopause',
      badge: 'Urgent Review',
      badgeType: 'urgent',
      headline: 'Vasomotor Surge & Sleep Disruption',
      subtext: 'MRS: 28/44 (+9 pt delta)',
      deltaBox: '+7 hot flashes/24h (3 nocturnal awakenings/night) over past 14 days. Menopause Rating Scale (MRS) composite score jumped from 19 to 28 (+9 pts).',
      recommendation: 'Evaluate micronized progesterone uptitration (100mg -> 200mg nightly) and sleep architecture panel.',
      statusNote: 'Next scheduled check-in: In 3 days',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&h=120&q=80',
    },
    {
      id: patients[1]?.id || 'p-dupont',
      mrn: '#MC-6621',
      name: 'Claire Dupont',
      age: 52,
      strawStage: 'STRAW Stage +1a (Early)',
      phase: 'Early Postmenopause',
      badge: 'Urgent Review',
      badgeType: 'urgent',
      headline: 'Persistent Bleeding Marker Detected',
      subtext: 'Bleed Index: 18/20 (Urgent)',
      deltaBox: 'Patient reported unexpected bleeding episode (4 days, moderate-to-heavy flow) following 14 months of sustained amenorrhea. Transvaginal endometrial echo tracking required.',
      recommendation: 'Urgent referral for transvaginal ultrasonography (TVUS) to assess endometrial stripe thickness (<4mm threshold).',
      statusNote: 'Imaging scheduled: In 2 days',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&h=120&q=80',
    },
    {
      id: patients[2]?.id || 'p-miller',
      mrn: '#MC-9112',
      name: 'Sarah Miller',
      age: 45,
      strawStage: 'STRAW Stage -1+',
      phase: 'Early Perimenopause',
      badge: 'Needs Attention',
      badgeType: 'attention',
      headline: 'Tracking Gap (11 Days Inactive)',
      subtext: 'Check-in: Nov 7 (Missed)',
      deltaBox: 'Patient had previously recorded severe brain fog (8/10) and sudden mood volatility. Inactivity marker flagged after high-severity symptom cluster reporting.',
      recommendation: 'Dispatch asynchronous nurse navigator outreach; assess barrier to daily digital tracking and evaluate for depressive episode.',
      statusNote: 'Nurse outreach sent today, 09:15 AM',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&h=120&q=80',
    },
    {
      id: patients[3]?.id || 'p-kapoor',
      mrn: '#MC-3319',
      name: 'Priya Kapoor',
      age: 50,
      strawStage: 'STRAW Stage -2 (Early)',
      phase: 'Menopause Transition',
      badge: 'Diagnostic Workup',
      badgeType: 'diagnostic',
      headline: 'LH / FSH Discrepancy & Oligomenorrhea',
      subtext: 'Cycle Len: 54 d (+16)',
      deltaBox: 'Serum estradiol nadir at 22 pg/mL, FSH elevated at 68 mIU/mL with persistent cycle elongation. Patient reports severe musculoskeletal joint stiffness and exertional exhaustion.',
      recommendation: 'Evaluate transdermal hormone therapy versus SERM protocol; schedule DEXA baseline.',
      statusNote: 'Lab Panel Received: Complete Metabolic Profile',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
    },
  ];

  const filteredTriagePatients = defaultTriagePatients.filter(p => {
    if (triageFilter === 'needs_attention') return p.badgeType === 'attention';
    if (triageFilter === 'diagnostic') return p.badgeType === 'diagnostic';
    return true;
  });

  // 3. Clinical Reports Centre Data
  const reportCards = [
    {
      id: 'rep-8042',
      patientId: patients[0]?.id || 'p-rostova',
      mrn: '#MC-8042',
      name: 'Elena Rostova',
      title: '30-Day Comprehensive Longitudinal Assessment',
      generatedDate: 'Today, 08:20 AM',
      period: 'Oct 18 - Nov 17',
      status: 'Awaiting Review',
      badgeClass: 'bg-peach-soft text-[#B85D51] border border-peach',
      findings: 'Vasomotor symptom cluster surge score (+9 pts MRS). Significant nocturnal sleep fragmentation identified. Progesterone adherence recorded at 94%. Recommendation: titrate micronized progesterone 200 mg nightly.',
      isSigned: signedReports['rep-8042'] || false,
    },
    {
      id: 'rep-6621',
      patientId: patients[1]?.id || 'p-dupont',
      mrn: '#MC-6621',
      name: 'Claire Dupont',
      title: 'Irregular Bleeding & Hormonal Diagnostic Report',
      generatedDate: 'Yesterday, 14:15 PM',
      period: 'Biopsy / Bleed Log',
      status: 'Urgent Red-Flag',
      badgeClass: 'bg-[#FFDAD6] text-[#BA1A1A] border border-[#FFB4AB]',
      findings: 'Postmenopausal uterine bleeding following 14-month amenorrhea. Baseline TVUS ordered. Systemic estrogen therapy immediately paused pending biopsy clearance.',
      isSigned: signedReports['rep-6621'] || false,
      urgent: true,
    },
    {
      id: 'rep-5520',
      patientId: patients[4]?.id || 'p-thompson',
      mrn: '#MC-5520',
      name: 'Linda Thompson',
      title: 'Annual Metabolic & HRT Tolerance Report',
      generatedDate: 'Nov 12, 2026',
      period: 'Annual Cycle #3',
      status: 'Clinician Signed',
      badgeClass: 'bg-sage-soft text-sage-dark border border-sage/40',
      findings: 'Sustained symptom remission under transdermal 17β-estradiol 50 mcg patch + cyclical micronized progesterone. Lipid panel within target range: LDL 98 mg/dL, HDL 62 mg/dL. Normal mammography.',
      isSigned: true,
    },
  ];

  const filteredReports = reportCards.filter(r => {
    if (reportFilter === 'awaiting') return !r.isSigned;
    if (reportFilter === 'signed') return r.isSigned;
    return true;
  });

  // 4. Cohort Directory Table Data
  const cohortDirectory = useMemo(() => {
    const list = [
      {
        id: patients[0]?.id || 'p-rostova',
        name: 'Elena Rostova',
        mrn: '#MC-8042',
        age: 48,
        strawStage: 'STRAW Stage -1 (Late)',
        latestAssessment: 'Today, 08:20 AM',
        consistency: 94,
        primarySymptoms: ['Hot Flashes', 'Night Sweats', 'Insomnia'],
        sparkline: 'M0,18 L15,16 L30,19 L45,14 L60,22 L75,12 L90,6',
        sparklineColor: '#B85D51',
        reviewStatus: 'Urgent Review',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=80&h=80&q=80',
      },
      {
        id: patients[1]?.id || 'p-dupont',
        mrn: '#MC-6621',
        name: 'Claire Dupont',
        age: 52,
        strawStage: 'STRAW Stage +1a (Early)',
        latestAssessment: 'Yesterday, 14:15 PM',
        consistency: 88,
        primarySymptoms: ['Postmeno Bleed', 'Headaches'],
        sparkline: 'M0,15 L15,14 L30,14 L45,16 L60,8 L75,5 L90,4',
        sparklineColor: '#BA1A1A',
        reviewStatus: 'Critical Flag',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=80&h=80&q=80',
      },
      {
        id: patients[2]?.id || 'p-miller',
        mrn: '#MC-9112',
        name: 'Sarah Miller',
        age: 45,
        strawStage: 'STRAW Stage -1 (Early)',
        latestAssessment: 'Nov 07 (11d gap)',
        consistency: 52,
        primarySymptoms: ['Brain Fog', 'Fatigue', 'Anxiety'],
        sparkline: 'M0,12 L15,12 L30,12 L45,12 L60,12 L75,12 L90,12',
        sparklineColor: '#D7B979',
        reviewStatus: 'Attention Needed',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=80&h=80&q=80',
      },
      {
        id: patients[4]?.id || 'p-thompson',
        mrn: '#MC-5520',
        name: 'Linda Thompson',
        age: 56,
        strawStage: 'STRAW Stage +2 (Late)',
        latestAssessment: 'Nov 12, 10:40 AM',
        consistency: 98,
        primarySymptoms: ['Joint Aches', 'Mild Vaginal Dryness'],
        sparkline: 'M0,8 L15,10 L30,9 L45,12 L60,14 L75,16 L90,18',
        sparklineColor: '#5B6F54',
        reviewStatus: 'Stable / Monitored',
        avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=80&h=80&q=80',
      },
      {
        id: patients[3]?.id || 'p-kapoor',
        mrn: '#MC-3319',
        name: 'Priya Kapoor',
        age: 50,
        strawStage: 'STRAW Stage -2 (Early)',
        latestAssessment: 'Nov 14, 16:10 PM',
        consistency: 84,
        primarySymptoms: ['Oligomenorrhea', 'Joint Pain'],
        sparkline: 'M0,14 L15,13 L30,15 L45,11 L60,13 L75,10 L90,9',
        sparklineColor: '#7A9B96',
        reviewStatus: 'Lab Workup',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&h=80&q=80',
      },
    ];

    return list.filter(item => {
      const matchQuery =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.mrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.primarySymptoms.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchStraw =
        strawFilter === 'ALL' ||
        (strawFilter === '-1' && item.strawStage.includes('-1')) ||
        (strawFilter === '+1' && item.strawStage.includes('+1')) ||
        (strawFilter === '+2' && item.strawStage.includes('+2')) ||
        (strawFilter === '-2' && item.strawStage.includes('-2'));

      return matchQuery && matchStraw;
    });
  }, [patients, searchQuery, strawFilter]);

  // 5. Today's Consultations Data
  const todayConsultations = [
    {
      id: 'cons-1',
      patientId: patients[0]?.id || 'p-rostova',
      time: '09:15',
      period: 'AM',
      name: 'Elena Rostova',
      mrn: '#MC-8042',
      stage: 'STRAW Stage -1',
      badge: 'Urgent Titration Review',
      badgeColor: 'bg-peach-soft text-[#B85D51] border border-peach',
      notes: 'Nocturnal hot flash surge & micronized progesterone titration adjustment.',
    },
    {
      id: 'cons-2',
      patientId: patients[2]?.id || 'p-miller',
      time: '11:30',
      period: 'AM',
      name: 'Sarah Miller',
      mrn: '#MC-9112',
      stage: 'STRAW Stage -1',
      badge: 'Adherence Check-in',
      badgeColor: 'bg-sand-soft text-[#8C6D23] border border-sand',
      notes: 'Digital tracking hiatus follow-up and neurovegetative symptom review.',
    },
    {
      id: 'cons-3',
      patientId: patients[4]?.id || 'p-thompson',
      time: '02:15',
      period: 'PM',
      name: 'Linda Thompson',
      mrn: '#MC-5520',
      stage: 'STRAW Stage +2',
      badge: 'HRT Refill & Annual Review',
      badgeColor: 'bg-sage-soft text-sage-dark border border-sage/40',
      notes: 'Transdermal 17β-estradiol tolerance check, bone density discussion.',
    },
  ];

  // 6. Pending Inquiries Stream
  const pendingInquiries = [
    {
      id: 'inq-1',
      patientId: patients[1]?.id || 'p-dupont',
      mrn: '#MC-6621',
      name: 'Claire Dupont',
      time: '26m ago',
      badge: 'Urgent',
      badgeColor: 'bg-[#FFDAD6] text-[#BA1A1A]',
      preview: 'Doctor, the bleeding is slightly heavier today. Should I stop taking the evening progesterone capsule tonight?',
    },
    {
      id: 'inq-2',
      patientId: patients[2]?.id || 'p-miller',
      mrn: '#MC-9112',
      name: 'Sarah Miller',
      time: '1h ago',
      badge: 'Follow-up',
      badgeColor: 'bg-sand-soft text-[#8C6D23]',
      preview: 'I completed my sleep assessment log after 10 days. The brain fog has been intense during work meetings...',
    },
    {
      id: 'inq-3',
      patientId: patients[3]?.id || 'p-kapoor',
      mrn: '#MC-3319',
      name: 'Priya Kapoor',
      time: '3h ago',
      badge: 'Lab Results',
      badgeColor: 'bg-teal-soft text-teal-dark',
      preview: 'Lab technician uploaded my CMP and Lipid profile. Waiting for your clinical review before scheduling HRT.',
    },
  ];

  const handleSignReport = (repId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSignedReports(prev => ({ ...prev, [repId]: true }));
  };

  return (
    <div className="space-y-7 pb-16 font-sans text-charcoal">
      {/* ========================================================================= */}
      {/* 0. HEADER BANNER: Patient-Centric Clinical Command Centre                */}
      {/* ========================================================================= */}
      <section className="w-full bg-cream rounded-card p-6 md:p-7 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 border border-outline-variant shadow-warm-md">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-serif text-2xl md:text-3xl text-charcoal tracking-tight font-medium">
              Doctor Clinical Command Centre
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sage-soft text-sage-dark text-xs font-semibold tracking-wide border border-sage/30">
              <span className="w-2 h-2 rounded-full bg-sage-dark animate-pulse" />
              SYSTEM ACTIVE (EHR INTEGRATED)
            </span>
          </div>
          <p className="text-charcoal-muted text-sm md:text-base leading-relaxed">
            Patient-Centric Longitudinal Monitoring, Symptom Progression & Clinical Decision Support
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={() => setCohortFilter('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                cohortFilter === 'all'
                  ? 'bg-sage-dark text-ivory shadow-warm-sm'
                  : 'bg-oat text-charcoal hover:bg-oat/70'
              }`}
            >
              All Cohorts Active ({totalPatientsCount})
            </button>
            <button
              onClick={() => setCohortFilter('urgent')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                cohortFilter === 'urgent'
                  ? 'bg-[#BA1A1A] text-white shadow-warm-sm'
                  : 'bg-[#FFDAD6] text-[#BA1A1A] hover:bg-[#FFDAD6]/80'
              }`}
            >
              Urgent Review Only ({urgentAlertsCount})
            </button>
            <button
              onClick={() => setCohortFilter('cycle')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                cohortFilter === 'cycle'
                  ? 'bg-sand text-charcoal shadow-warm-sm font-semibold'
                  : 'bg-sand-soft text-charcoal-muted hover:bg-sand/30'
              }`}
            >
              Cycle Regularity Shifts (14)
            </button>
            <button
              onClick={() => setCohortFilter('titration')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                cohortFilter === 'titration'
                  ? 'bg-teal-dark text-white shadow-warm-sm'
                  : 'bg-teal-soft text-teal-dark hover:bg-teal/30'
              }`}
            >
              Titration Response (32)
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start xl:self-center">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-ivory hover:bg-white text-charcoal text-xs font-semibold border border-outline-variant shadow-warm-sm transition-all"
          >
            <Download className="w-3.5 h-3.5 text-charcoal-muted" />
            Export Population Data
          </button>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION A: Patient Population Overview (7 KPI Metric Cards)              */}
      {/* ========================================================================= */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3.5 w-full">
        {/* Card 1: Active Patients */}
        <div className="bg-cream rounded-card p-4 flex flex-col justify-between border border-outline-variant shadow-warm-sm hover:border-sage/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-charcoal-muted uppercase tracking-wider">Active Patients</span>
            <Users className="w-4 h-4 text-sage-dark" />
          </div>
          <div className="my-2">
            <span className="font-serif text-3xl font-medium text-charcoal tracking-tight">
              {totalPatientsCount}
            </span>
          </div>
          <span className="text-[11px] text-sage-dark font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-sage-dark" />
            98.4% tracking
          </span>
        </div>

        {/* Card 2: Newly Enrolled */}
        <div className="bg-cream rounded-card p-4 flex flex-col justify-between border border-outline-variant shadow-warm-sm hover:border-sage/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-charcoal-muted uppercase tracking-wider">Newly Enrolled</span>
            <Activity className="w-4 h-4 text-teal" />
          </div>
          <div className="my-2">
            <span className="font-serif text-3xl font-medium text-charcoal tracking-tight">
              {newlyEnrolledCount}
            </span>
          </div>
          <span className="text-[11px] text-teal-dark font-medium flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3 text-teal" />
            +3 this week
          </span>
        </div>

        {/* Card 3: Completed Tests */}
        <div className="bg-cream rounded-card p-4 flex flex-col justify-between border border-outline-variant shadow-warm-sm hover:border-sage/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-charcoal-muted uppercase tracking-wider">Completed Tests</span>
            <FileCheck className="w-4 h-4 text-charcoal-muted" />
          </div>
          <div className="my-2">
            <span className="font-serif text-3xl font-medium text-charcoal tracking-tight">
              {completedTestsCount.toLocaleString()}
            </span>
          </div>
          <span className="text-[11px] text-charcoal-muted font-medium">
            Clinical assessments
          </span>
        </div>

        {/* Card 4: Tracking Gaps */}
        <div className="bg-cream rounded-card p-4 flex flex-col justify-between border border-outline-variant shadow-warm-sm hover:border-sand/60 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-charcoal-muted uppercase tracking-wider">Tracking Gaps</span>
            <Clock className="w-4 h-4 text-[#C98A2C]" />
          </div>
          <div className="my-2">
            <span className="font-serif text-3xl font-medium text-[#8C6D23] tracking-tight">
              {trackingGapsCount}
            </span>
          </div>
          <span className="text-[11px] text-[#8C6D23] font-medium">
            &gt;5 days inactive
          </span>
        </div>

        {/* Card 5: Reports Generated */}
        <div className="bg-cream rounded-card p-4 flex flex-col justify-between border border-outline-variant shadow-warm-sm hover:border-sage/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-charcoal-muted uppercase tracking-wider">Reports Ready</span>
            <FileText className="w-4 h-4 text-sage-dark" />
          </div>
          <div className="my-2">
            <span className="font-serif text-3xl font-medium text-charcoal tracking-tight">
              {reportsGeneratedCount}
            </span>
          </div>
          <span className="text-[11px] text-charcoal-muted font-medium">
            Longitudinal dossiers
          </span>
        </div>

        {/* Card 6: Flagged / Awaiting Review */}
        <div className="bg-cream rounded-card p-4 flex flex-col justify-between border border-[#FFD0C8] shadow-warm-sm bg-peach-soft/30 hover:border-peach transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#B85D51] uppercase tracking-wider">Awaiting Review</span>
            <Sparkles className="w-4 h-4 text-[#B85D51]" />
          </div>
          <div className="my-2">
            <span className="font-serif text-3xl font-medium text-[#B85D51] tracking-tight">
              {flaggedReportsCount}
            </span>
          </div>
          <span className="text-[11px] text-[#B85D51] font-semibold">
            Flagged for sign-off
          </span>
        </div>

        {/* Card 7: Urgent Follow-Up */}
        <div className="bg-[#FFF4F2] rounded-card p-4 flex flex-col justify-between border border-[#FFB4AB] shadow-warm-sm hover:border-[#BA1A1A] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#BA1A1A] uppercase tracking-wider">Urgent Alerts</span>
            <AlertTriangle className="w-4 h-4 text-[#BA1A1A]" />
          </div>
          <div className="my-2">
            <span className="font-serif text-3xl font-medium text-[#BA1A1A] tracking-tight">
              {urgentAlertsCount}
            </span>
          </div>
          <span className="text-[11px] text-[#BA1A1A] font-bold">
            Critical flags active
          </span>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION B: Patients Requiring Attention • Priority Triage Queue          */}
      {/* ========================================================================= */}
      <section className="bg-cream rounded-card p-6 md:p-7 shadow-warm-md border border-outline-variant flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="w-7 h-7 rounded-full bg-[#FFDAD6] text-[#BA1A1A] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-[#FFB4AB]">
              {filteredTriagePatients.length}
            </span>
            <div>
              <h2 className="font-serif text-xl md:text-2xl text-charcoal font-medium tracking-tight">
                Patients Requiring Attention • Priority Triage Queue
              </h2>
              <p className="text-xs md:text-sm text-charcoal-muted mt-0.5">
                Deterministic triage triggered by symptom surges, bleeding markers, and adherence gaps.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              onClick={() => setTriageFilter('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                triageFilter === 'all'
                  ? 'bg-charcoal text-ivory'
                  : 'bg-oat text-charcoal hover:bg-oat/70'
              }`}
            >
              All Critical (8)
            </button>
            <button
              onClick={() => setTriageFilter('needs_attention')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                triageFilter === 'needs_attention'
                  ? 'bg-sand text-charcoal font-semibold'
                  : 'bg-sand-soft text-charcoal-muted hover:bg-sand/30'
              }`}
            >
              Needs Attention (4)
            </button>
            <button
              onClick={() => setTriageFilter('diagnostic')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                triageFilter === 'diagnostic'
                  ? 'bg-teal-dark text-white'
                  : 'bg-teal-soft text-teal-dark hover:bg-teal/30'
              }`}
            >
              Diagnostic Workup (4)
            </button>
          </div>
        </div>

        {/* 2x2 Grid of Rich Patient Triage Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredTriagePatients.map((patient) => {
            const isUrgent = patient.badgeType === 'urgent';
            const isAttention = patient.badgeType === 'attention';

            return (
              <div
                key={patient.id}
                className="bg-ivory/60 rounded-2xl p-5 border border-outline-variant hover:border-sage/60 transition-all flex flex-col justify-between gap-4 shadow-warm-sm"
              >
                {/* Header row: Avatar + Name + Stage + Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={patient.avatar}
                      alt={patient.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-warm-sm"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3
                          onClick={() => onSelectPatient(patient.id)}
                          className="font-serif text-lg font-semibold text-charcoal hover:text-sage-dark cursor-pointer transition-colors"
                        >
                          {patient.name}
                        </h3>
                        <span className="text-xs text-charcoal-muted font-mono">{patient.mrn}</span>
                      </div>
                      <p className="text-xs text-charcoal-muted">
                        Age: <span className="font-semibold text-charcoal">{patient.age}</span> • {patient.strawStage}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase shrink-0 ${
                      isUrgent
                        ? 'bg-[#FFDAD6] text-[#BA1A1A] border border-[#FFB4AB]'
                        : isAttention
                        ? 'bg-sand-soft text-[#8C6D23] border border-sand'
                        : 'bg-lavender-soft text-[#5C4573] border border-lavender'
                    }`}
                  >
                    {patient.badge}
                  </span>
                </div>

                {/* Clinical Delta Box */}
                <div
                  className={`rounded-xl p-3.5 text-xs flex flex-col gap-1.5 border ${
                    isUrgent
                      ? 'bg-peach-soft/60 border-peach text-charcoal'
                      : isAttention
                      ? 'bg-sand-soft/60 border-sand text-charcoal'
                      : 'bg-teal-soft/60 border-teal text-charcoal'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold">
                    <span className="flex items-center gap-1.5 text-charcoal">
                      <AlertCircle className={`w-3.5 h-3.5 ${isUrgent ? 'text-[#BA1A1A]' : 'text-[#8C6D23]'}`} />
                      {patient.headline}
                    </span>
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-white/70">
                      {patient.subtext}
                    </span>
                  </div>
                  <p className="text-[12px] text-charcoal-muted leading-relaxed">
                    {patient.deltaBox}
                  </p>
                </div>

                {/* Recommendation Box */}
                <div className="bg-white/80 rounded-xl p-3 border border-outline-variant text-xs">
                  <span className="font-semibold text-charcoal text-[11px] uppercase tracking-wider block mb-1">
                    Recommendation:
                  </span>
                  <p className="text-charcoal-muted leading-relaxed">
                    {patient.recommendation}
                  </p>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-outline-variant/60">
                  <span className="text-[11px] text-charcoal-muted flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    {patient.statusNote}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectPatient(patient.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-charcoal hover:bg-oat transition-colors"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => onSelectPatient(patient.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-sage-dark text-ivory hover:bg-sage-dark/90 transition-colors shadow-warm-sm flex items-center gap-1.5"
                    >
                      <Stethoscope className="w-3.5 h-3.5" />
                      Review SOAP
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION C: Patient Symptom Analytics                                      */}
      {/* Left: 90-Day Trajectory Area Chart | Right: 8-Domain Symptom Prevalence   */}
      {/* ========================================================================= */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-7 w-full" id="symptom-analytics">
        {/* Left Column (8 cols): 90-Day Population Trajectory & Severity Distribution */}
        <div className="xl:col-span-7 bg-cream rounded-card p-6 md:p-7 shadow-warm-md border border-outline-variant flex flex-col justify-between gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-sage-dark" />
                <h3 className="font-serif text-xl font-medium text-charcoal tracking-tight">
                  90-Day Population Trajectory & Severity Distribution
                </h3>
              </div>
              <p className="text-xs text-charcoal-muted mt-1">
                Measuring cohort mean monthly symptom severity score normalized against baseline intake scores.
              </p>
            </div>
            <div className="flex items-center gap-1 bg-oat rounded-lg p-1 self-start sm:self-center">
              {(['7D', '30D', '90D'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setAnalyticsRange(range)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                    analyticsRange === range
                      ? 'bg-cream text-charcoal font-semibold shadow-warm-sm'
                      : 'text-charcoal-muted hover:text-charcoal'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          {/* Area Chart Legend */}
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-peach" />
              <span className="font-medium text-charcoal">Vasomotor & Sleep (39%)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-teal" />
              <span className="font-medium text-charcoal">Mood & Cognitive (33%)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-sage-dark" />
              <span className="font-medium text-charcoal">Physical & Somatic (28%)</span>
            </span>
          </div>

          {/* Longitudinal SVG Area Chart with Titration Marker */}
          <div className="w-full h-64 bg-ivory/70 rounded-2xl border border-outline-variant p-4 relative flex flex-col justify-between">
            {/* SVG Trajectory Graphic */}
            <svg viewBox="0 0 700 200" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="peachGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E0AB95" stopOpacity="0.75" />
                  <stop offset="100%" stopColor="#E0AB95" stopOpacity="0.05" />
                </linearGradient>
                <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7A9B96" stopOpacity="0.65" />
                  <stop offset="100%" stopColor="#7A9B96" stopOpacity="0.05" />
                </linearGradient>
                <linearGradient id="sageGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5B6F54" stopOpacity="0.55" />
                  <stop offset="100%" stopColor="#5B6F54" stopOpacity="0.05" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="40" x2="700" y2="40" stroke="#E2DBD0" strokeDasharray="3 3" />
              <line x1="0" y1="90" x2="700" y2="90" stroke="#E2DBD0" strokeDasharray="3 3" />
              <line x1="0" y1="140" x2="700" y2="140" stroke="#E2DBD0" strokeDasharray="3 3" />

              {/* Vasomotor Area (Peach) - Drops significantly after Titration (Day 42 / x=350) */}
              <path
                d="M 0,55 Q 170,50 350,65 T 700,165 L 700,200 L 0,200 Z"
                fill="url(#peachGrad)"
              />
              <path
                d="M 0,55 Q 170,50 350,65 T 700,165"
                fill="none"
                stroke="#E0AB95"
                strokeWidth="2.5"
              />

              {/* Mood & Cognitive Area (Teal) */}
              <path
                d="M 0,80 Q 180,82 350,95 T 700,175 L 700,200 L 0,200 Z"
                fill="url(#tealGrad)"
              />
              <path
                d="M 0,80 Q 180,82 350,95 T 700,175"
                fill="none"
                stroke="#7A9B96"
                strokeWidth="2.5"
              />

              {/* Physical Area (Sage) */}
              <path
                d="M 0,110 Q 180,115 350,125 T 700,185 L 700,200 L 0,200 Z"
                fill="url(#sageGrad)"
              />
              <path
                d="M 0,110 Q 180,115 350,125 T 700,185"
                fill="none"
                stroke="#5B6F54"
                strokeWidth="2.5"
              />

              {/* Day 42 Titration Marker (Vertical Line) */}
              <line x1="350" y1="10" x2="350" y2="195" stroke="#2E2924" strokeWidth="1.5" strokeDasharray="4 4" />
              <circle cx="350" cy="65" r="4" fill="#2E2924" />
            </svg>

            {/* Titration Marker Label Popup */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/95 rounded-xl px-3 py-1.5 border border-outline-variant shadow-warm-sm text-center">
              <span className="text-[11px] font-semibold text-charcoal block">
                Titration Intervention Point - Day 42
              </span>
              <span className="text-[10px] text-sage-dark font-mono">
                Transdermal Estradiol 50 mcg/d initiated
              </span>
            </div>

            {/* Timeline X-Axis */}
            <div className="flex items-center justify-between text-[11px] text-charcoal-muted pt-2 border-t border-outline-variant font-mono">
              <span>Day 1 (Intake Baseline)</span>
              <span>Day 30 (First Follow-up)</span>
              <span>Day 42 (HRT Titration)</span>
              <span>Day 60 (Mid-term)</span>
              <span>Day 90 (Sustained Resolution)</span>
            </div>
          </div>

          {/* Bottom Delta Statistics Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            <div className="bg-ivory rounded-xl p-3 border border-outline-variant">
              <span className="text-[11px] text-charcoal-muted uppercase block">Severe Days / Month</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-serif text-lg font-bold text-charcoal">14.2 &rarr; 5.1</span>
                <span className="text-xs font-semibold text-sage-dark">-64%</span>
              </div>
            </div>
            <div className="bg-ivory rounded-xl p-3 border border-outline-variant">
              <span className="text-[11px] text-charcoal-muted uppercase block">VAS Score Mean</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-serif text-lg font-bold text-charcoal">6.8 &rarr; 3.2</span>
                <span className="text-xs font-semibold text-teal-dark">-53%</span>
              </div>
            </div>
            <div className="bg-ivory rounded-xl p-3 border border-outline-variant col-span-2 sm:col-span-1">
              <span className="text-[11px] text-charcoal-muted uppercase block">Treatment Adherence</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-serif text-lg font-bold text-sage-dark">91.8%</span>
                <span className="text-xs text-charcoal-muted">Sustained</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): 8-Domain Symptom Prevalence */}
        <div className="xl:col-span-5 bg-cream rounded-card p-6 md:p-7 shadow-warm-md border border-outline-variant flex flex-col justify-between gap-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-xl font-medium text-charcoal tracking-tight">
                8-Domain Symptom Prevalence
              </h3>
              <p className="text-xs text-charcoal-muted mt-0.5">
                Frequency distribution across active patient population.
              </p>
            </div>
            <span className="text-[11px] font-mono font-semibold px-2 py-1 rounded bg-oat text-charcoal-muted">
              Trailing 30 Days
            </span>
          </div>

          {/* Ranked Progress Bars */}
          <div className="space-y-3.5 my-auto">
            {[
              { rank: 1, name: 'Vasomotor & Nocturnal Flushes', pct: 74, color: 'bg-peach' },
              { rank: 2, name: 'Sleep Fragmentation & Insomnia', pct: 68, color: 'bg-sand' },
              { rank: 3, name: 'Fatigue & Exertional Burnout', pct: 59, color: 'bg-teal' },
              { rank: 4, name: 'Mood Lability & Anxious Ruminations', pct: 51, color: 'bg-lavender' },
              { rank: 5, name: 'Musculoskeletal / Joint Stiffness', pct: 44, color: 'bg-sage' },
              { rank: 6, name: 'Brain Fog & Memory Hesitation', pct: 41, color: 'bg-[#B8A6C8]' },
              { rank: 7, name: 'Genitourinary / Vaginal Dryness', pct: 35, color: 'bg-peach-soft' },
              { rank: 8, name: 'Weight Shifts / Metabolic Flux', pct: 28, color: 'bg-oat-light' },
            ].map((domain) => (
              <div key={domain.rank} className="flex flex-col gap-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-charcoal font-medium flex items-center gap-1.5">
                    <span className="text-charcoal-muted font-mono text-[11px]">{domain.rank}.</span>
                    {domain.name}
                  </span>
                  <span className="font-mono font-bold text-charcoal">{domain.pct}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-oat overflow-hidden">
                  <div
                    className={`h-full rounded-full ${domain.color}`}
                    style={{ width: `${domain.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Cohort Longitudinal Summary Box */}
          <div className="bg-ivory/80 rounded-xl p-3 border border-outline-variant text-xs text-charcoal-muted flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-sage-dark shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-charcoal font-semibold">Cohort Longitudinal Note:</strong>{' '}
              Vasomotor frequency reduces by 63% within 8 weeks of individualized dosing titration across patients on HRT.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION D: Clinical Report Centre                                        */}
      {/* ========================================================================= */}
      <section className="bg-cream rounded-card p-6 md:p-7 shadow-warm-md border border-outline-variant flex flex-col gap-6" id="report-centre">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-sage-dark" />
              <h2 className="font-serif text-xl md:text-2xl text-charcoal font-medium tracking-tight">
                Clinical Report Centre
              </h2>
            </div>
            <p className="text-xs md:text-sm text-charcoal-muted mt-1">
              Doctor-facing comprehensive evaluations, deterministically mapped biomarkers and AI-synthesized summaries.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              onClick={() => setReportFilter('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                reportFilter === 'all'
                  ? 'bg-charcoal text-ivory'
                  : 'bg-oat text-charcoal hover:bg-oat/70'
              }`}
            >
              All Synthesized Summaries (52)
            </button>
            <button
              onClick={() => setReportFilter('awaiting')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                reportFilter === 'awaiting'
                  ? 'bg-peach text-charcoal font-semibold'
                  : 'bg-peach-soft text-charcoal-muted hover:bg-peach/30'
              }`}
            >
              Awaiting Review (6)
            </button>
            <button
              onClick={() => setReportFilter('signed')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                reportFilter === 'signed'
                  ? 'bg-sage-dark text-ivory'
                  : 'bg-sage-soft text-sage-dark hover:bg-sage/40'
              }`}
            >
              Clinician Signed Reports (36)
            </button>
          </div>
        </div>

        {/* 3 Report Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className="bg-ivory/70 rounded-2xl p-5 border border-outline-variant hover:border-sage/60 transition-all flex flex-col justify-between gap-4 shadow-warm-sm"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${report.badgeClass}`}>
                    {report.isSigned ? 'Clinician Signed & Finalized' : report.status}
                  </span>
                  <span className="text-[11px] text-charcoal-muted font-mono">{report.generatedDate}</span>
                </div>

                <div>
                  <h3
                    onClick={() => onSelectPatient(report.patientId)}
                    className="font-serif text-lg font-semibold text-charcoal hover:text-sage-dark cursor-pointer transition-colors"
                  >
                    {report.name}{' '}
                    <span className="font-mono text-xs text-charcoal-muted font-normal">({report.mrn})</span>
                  </h3>
                  <p className="text-xs font-medium text-teal-dark">{report.title}</p>
                </div>

                <div className="bg-white/80 rounded-xl p-3 border border-outline-variant text-xs">
                  <span className="font-semibold text-charcoal text-[11px] uppercase tracking-wider block mb-1">
                    Key Findings:
                  </span>
                  <p className="text-charcoal-muted leading-relaxed line-clamp-4">
                    {report.findings}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-outline-variant/60 flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectPatient(report.patientId)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-charcoal hover:bg-oat transition-colors flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5 text-charcoal-muted" />
                  View EHR
                </button>

                {report.isSigned ? (
                  <span className="inline-flex items-center gap-1.5 text-xs text-sage-dark font-medium px-3 py-1.5">
                    <CheckCircle2 className="w-4 h-4 text-sage-dark" />
                    Committed
                  </span>
                ) : (
                  <button
                    onClick={(e) => handleSignReport(report.id, e)}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-sage-dark text-ivory hover:bg-sage-dark/90 transition-colors shadow-warm-sm flex items-center gap-1.5"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    Sign & Commit
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION E: Patient Monitoring & Cohort Directory                          */}
      {/* ========================================================================= */}
      <section className="w-full bg-cream rounded-card p-6 md:p-7 shadow-warm-md border border-outline-variant flex flex-col gap-6" id="patient-cohort">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="font-serif text-xl md:text-2xl text-charcoal font-medium tracking-tight">
              Patient Monitoring & Cohort Directory
            </h2>
            <p className="text-xs md:text-sm text-charcoal-muted mt-0.5">
              142 Longitudinal patients active • Continuous telemetry and questionnaire adherence.
            </p>
          </div>

          {/* Search Bar + STRAW Dropdown */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-charcoal-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by patient name, MRN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-xl text-xs bg-ivory border border-outline-variant text-charcoal placeholder:text-charcoal-muted focus:outline-none focus:ring-1 focus:ring-sage-dark w-60 shadow-warm-sm"
              />
            </div>

            <select
              value={strawFilter}
              onChange={(e) => setStrawFilter(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs bg-ivory border border-outline-variant text-charcoal font-medium focus:outline-none focus:ring-1 focus:ring-sage-dark shadow-warm-sm"
            >
              <option value="ALL">All STRAW+10 Stages</option>
              <option value="-2">STRAW -2 (Early Transition)</option>
              <option value="-1">STRAW -1 (Late Transition)</option>
              <option value="+1">STRAW +1 (Early Postmenopause)</option>
              <option value="+2">STRAW +2 (Late Postmenopause)</option>
            </select>
          </div>
        </div>

        {/* Directory Table */}
        <div className="overflow-x-auto rounded-xl border border-outline-variant bg-white/70 shadow-warm-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant bg-ivory/90 text-[11px] font-semibold text-charcoal-muted uppercase tracking-wider">
                <th className="py-3 px-4">Patient & MRN</th>
                <th className="py-3 px-4">Age / STRAW Stage</th>
                <th className="py-3 px-4">Latest Assessment</th>
                <th className="py-3 px-4">Tracking Consistency</th>
                <th className="py-3 px-4">Primary Symptoms</th>
                <th className="py-3 px-4">7-Day Trajectory</th>
                <th className="py-3 px-4">Review Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/60 text-xs">
              {cohortDirectory.map((patient) => (
                <tr
                  key={patient.id}
                  className="hover:bg-ivory/50 transition-colors cursor-pointer group"
                  onClick={() => onSelectPatient(patient.id)}
                >
                  {/* Patient Name + Avatar */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={patient.avatar}
                        alt={patient.name}
                        className="w-9 h-9 rounded-full object-cover border border-outline-variant"
                      />
                      <div>
                        <span className="font-serif font-semibold text-charcoal text-sm group-hover:text-sage-dark transition-colors block">
                          {patient.name}
                        </span>
                        <span className="font-mono text-[11px] text-charcoal-muted">{patient.mrn}</span>
                      </div>
                    </div>
                  </td>

                  {/* Age / Stage */}
                  <td className="py-3 px-4">
                    <span className="font-semibold text-charcoal">{patient.age} yrs</span>
                    <span className="block text-[11px] text-charcoal-muted">{patient.strawStage}</span>
                  </td>

                  {/* Latest Assessment */}
                  <td className="py-3 px-4">
                    <span className="text-charcoal font-medium">{patient.latestAssessment}</span>
                  </td>

                  {/* Tracking Consistency Progress Bar */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-oat rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            patient.consistency > 85
                              ? 'bg-sage-dark'
                              : patient.consistency > 60
                              ? 'bg-sand'
                              : 'bg-[#BA1A1A]'
                          }`}
                          style={{ width: `${patient.consistency}%` }}
                        />
                      </div>
                      <span className="font-mono text-[11px] font-semibold text-charcoal">
                        {patient.consistency}%
                      </span>
                    </div>
                  </td>

                  {/* Primary Symptoms */}
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {patient.primarySymptoms.map((sym, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-oat text-[10px] text-charcoal font-medium"
                        >
                          {sym}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* 7-Day Sparkline SVG */}
                  <td className="py-3 px-4">
                    <svg width="90" height="24" className="overflow-visible">
                      <path
                        d={patient.sparkline}
                        fill="none"
                        stroke={patient.sparklineColor}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </td>

                  {/* Review Status Badge */}
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide ${
                        patient.reviewStatus.includes('Urgent') || patient.reviewStatus.includes('Critical')
                          ? 'bg-[#FFDAD6] text-[#BA1A1A] border border-[#FFB4AB]'
                          : patient.reviewStatus.includes('Attention')
                          ? 'bg-sand-soft text-[#8C6D23] border border-sand'
                          : patient.reviewStatus.includes('Lab')
                          ? 'bg-teal-soft text-teal-dark border border-teal'
                          : 'bg-sage-soft text-sage-dark border border-sage/40'
                      }`}
                    >
                      {patient.reviewStatus}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onSelectPatient(patient.id)}
                        className="px-2.5 py-1 text-xs rounded-lg bg-ivory hover:bg-white text-charcoal border border-outline-variant font-medium transition-all"
                        title="View EHR / SOAP Notes"
                      >
                        EHR
                      </button>
                      <button
                        onClick={() => triggerSchedule(patient.id)}
                        className="p-1.5 rounded-lg bg-ivory hover:bg-white text-charcoal border border-outline-variant transition-all"
                        title="Schedule Video Consultation"
                      >
                        <Video className="w-3.5 h-3.5 text-sage-dark" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Directory Pagination Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-charcoal-muted pt-2 border-t border-outline-variant">
          <span>Showing 1 to {cohortDirectory.length} of {totalPatientsCount} Active Patients</span>
          <div className="flex items-center gap-1.5">
            <button className="px-2.5 py-1 rounded-md bg-charcoal text-ivory font-semibold">1</button>
            <button className="px-2.5 py-1 rounded-md bg-oat hover:bg-oat/70 text-charcoal">2</button>
            <button className="px-2.5 py-1 rounded-md bg-oat hover:bg-oat/70 text-charcoal">3</button>
            <span className="px-1">&hellip;</span>
            <button className="px-2.5 py-1 rounded-md bg-oat hover:bg-oat/70 text-charcoal">29</button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION F: Clinical Follow-up and Consultations                           */}
      {/* Left: Today's Consultations | Right: Pending Follow-ups & Inquiries       */}
      {/* ========================================================================= */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-7 w-full pb-8" id="consultations-section">
        {/* Left Column (7 cols): Today's Clinical Consultations */}
        <div className="xl:col-span-7 bg-cream rounded-card p-6 md:p-7 shadow-warm-md border border-outline-variant flex flex-col justify-between gap-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Video className="w-5 h-5 text-sage-dark" />
              <h3 className="font-serif text-xl font-medium text-charcoal tracking-tight">
                Today&apos;s Clinical Consultations
              </h3>
            </div>
            <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-sage-soft text-sage-dark">
              Nov 18, 2026 • 3 Booked
            </span>
          </div>

          {/* Consultation Cards */}
          <div className="space-y-3.5 my-auto">
            {todayConsultations.map((c) => (
              <div
                key={c.id}
                className="bg-ivory/70 rounded-xl p-4 border border-outline-variant flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:border-sage/50 transition-all"
              >
                <div className="flex items-start gap-3.5">
                  {/* Time Badge */}
                  <div className="bg-white rounded-xl p-2.5 text-center min-w-[60px] border border-outline-variant shadow-warm-sm">
                    <span className="font-mono text-sm font-bold text-charcoal block">{c.time}</span>
                    <span className="text-[10px] text-charcoal-muted uppercase">{c.period}</span>
                  </div>

                  {/* Info */}
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4
                        onClick={() => onSelectPatient(c.patientId)}
                        className="font-serif font-semibold text-charcoal hover:text-sage-dark cursor-pointer text-base"
                      >
                        {c.name}
                      </h4>
                      <span className="font-mono text-xs text-charcoal-muted">{c.mrn}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${c.badgeColor}`}>
                        {c.badge}
                      </span>
                    </div>
                    <p className="text-xs text-charcoal-muted mt-0.5">{c.notes}</p>
                    <span className="text-[11px] text-teal-dark font-medium block mt-1">
                      {c.stage}
                    </span>
                  </div>
                </div>

                {/* Launch Button */}
                <button
                  onClick={() => triggerSchedule(c.patientId)}
                  className="px-4 py-2 rounded-xl bg-sage-dark hover:bg-sage-dark/90 text-ivory text-xs font-semibold shadow-warm-sm flex items-center justify-center gap-2 shrink-0 transition-colors self-end sm:self-center"
                >
                  <Video className="w-3.5 h-3.5" />
                  Launch Video Room
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-outline-variant text-xs text-charcoal-muted">
            <span>All telemedicine sessions are HIPAA compliant & end-to-end encrypted.</span>
            <button
              onClick={() => triggerSchedule()}
              className="text-sage-dark font-semibold hover:underline"
            >
              Open Telehealth Hub
            </button>
          </div>
        </div>

        {/* Right Column (5 cols): Pending Follow-ups & Inquiries */}
        <div className="xl:col-span-5 bg-cream rounded-card p-6 md:p-7 shadow-warm-md border border-outline-variant flex flex-col justify-between gap-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Send className="w-5 h-5 text-teal-dark" />
              <h3 className="font-serif text-xl font-medium text-charcoal tracking-tight">
                Pending Follow-ups & Inquiries
              </h3>
            </div>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-peach-soft text-[#B85D51]">
              3 Unread
            </span>
          </div>

          {/* Inquiries Stream */}
          <div className="space-y-3.5 my-auto">
            {pendingInquiries.map((inq) => (
              <div
                key={inq.id}
                className="bg-ivory/70 rounded-xl p-3.5 border border-outline-variant flex flex-col gap-2 hover:border-teal/50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-semibold text-charcoal text-sm">{inq.name}</span>
                    <span className="font-mono text-[11px] text-charcoal-muted">({inq.mrn})</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${inq.badgeColor}`}>
                      {inq.badge}
                    </span>
                  </div>
                  <span className="text-[11px] text-charcoal-muted font-mono">{inq.time}</span>
                </div>

                <p className="text-xs text-charcoal-muted italic line-clamp-2">
                  &ldquo;{inq.preview}&rdquo;
                </p>

                <div className="flex items-center justify-end pt-1">
                  <button
                    onClick={() => onSelectPatient(inq.patientId)}
                    className="text-xs font-semibold text-teal-dark hover:underline flex items-center gap-1"
                  >
                    Open Secure Thread &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-sand-soft rounded-xl p-3 border border-sand text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#8C6D23]" />
              <span className="text-charcoal font-medium">4 Patient Care Reminders Due Today</span>
            </div>
            <button
              onClick={() => onSelectPatient(patients[0]?.id || '')}
              className="text-[11px] font-bold text-[#8C6D23] uppercase hover:underline"
            >
              Batch Queue
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
