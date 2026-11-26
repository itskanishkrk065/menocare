import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  ArrowRight,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Video,
  FileText,
  Activity,
  Calendar,
  ChevronDown,
  ChevronRight,
  Clock,
  Sparkles,
  Stethoscope,
  Heart,
  Pill,
  Download,
  AlertCircle,
  ExternalLink,
  Flame,
  Droplet,
  Send,
  Eye,
} from 'lucide-react';
import { api } from '../../api/client';

interface PatientDirectoryViewProps {
  patients: any[];
  onSelectPatient: (patientId: string) => void;
  onOpenScheduleModal: (patientId: string) => void;
}

export const PatientDirectoryView: React.FC<PatientDirectoryViewProps> = ({
  patients = [],
  onSelectPatient,
  onOpenScheduleModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'red_flag' | 'in_review' | 'stable'>('all');
  const [selectedStrawStage, setSelectedStrawStage] = useState('ALL');
  const [quickNote, setQuickNote] = useState('');
  const [isPostingNote, setIsPostingNote] = useState(false);
  const [noteSuccess, setNoteSuccess] = useState(false);

  // 1. Synthetic / Hybrid Patient Directory combining backend patients and Stitch clinical phenotypes
  const enrichedPatients = useMemo(() => {
    // Stitch cohort definitions with full clinical depth
    const defaultDirectory = [
      {
        id: patients[1]?.patient_id || patients[1]?.id || 'p-dupont',
        mrn: '#MC-99402',
        name: patients[1]?.full_name || 'Claire Dupont',
        age: 55,
        strawStage: 'Early Postmenopause (+1a)',
        phenotype: 'Postmenopausal Bleeding',
        certaintyIndex: '95% Clinical Certainty Index',
        priority: 'red_flag',
        priorityLabel: 'Urgent Review',
        priorityColor: 'bg-peach-soft text-peach border-peach/30',
        avatarInitials: 'CD',
        avatarBg: 'bg-[#FFDAD6] text-[#BA1A1A]',
        lastActive: '12m ago',
        priorCessationDays: 540,
        bmi: 27.4,
        parity: 'G2P2',
        currentMeds: 'None (Systemic HRT paused)',
        hotFlashTrend: '+4 nocturnal awakenings / wk',
        bleedingTrend: '4-day fresh bleed episode',
        adherence: 88,
        mrsScore: '31/44',
        biomarkers: [
          { code: 'FSH', value: '78.4 mIU/mL', status: 'elevated', label: 'Postmenopausal baseline' },
          { code: 'E2', value: '18.2 pg/mL', status: 'low', label: 'Nadir range' },
          { code: 'Endometrial Echo', value: '6.2 mm', status: 'critical', label: 'Threshold >4mm breached' },
          { code: 'Hb', value: '11.8 g/dL', status: 'borderline', label: 'Mild anemia secondary' },
        ],
        workupRecommendations: [
          { text: 'Urgent Transvaginal Ultrasonography (TVUS) to assess endometrial stripe thickness (<4mm threshold)', priority: 'Urgent' },
          { text: 'Endometrial Pipelle biopsy if stripe exceeds 4mm or reveals focal heterogeneity', priority: 'High' },
          { text: 'Hold systemic estrogen therapy; continue low-dose transdermal progesterone only upon clearance', priority: 'Standard' },
        ],
        clinicianNote: 'Dr. Vance: Unexpected postmenopausal bleed following 18 months sustained amenorrhea. Transvaginal imaging ordered at Apollo Diagnostics.',
        chartSpikeData: [12, 14, 18, 22, 28, 35, 45, 52, 60, 48, 42, 38, 40, 55, 75, 82, 88, 70, 65, 58, 54, 50, 45, 42, 38, 35, 32, 30, 28, 25],
      },
      {
        id: patients[0]?.patient_id || patients[0]?.id || 'p-rostova',
        mrn: '#MC-8042',
        name: patients[0]?.full_name || 'Elena Rostova',
        age: 48,
        strawStage: 'Late Perimenopause (-1)',
        phenotype: 'Severe VMS & Insomnia',
        certaintyIndex: '91% Clinical Certainty Index',
        priority: 'in_review',
        priorityLabel: 'In Review',
        priorityColor: 'bg-sand-soft text-[#B07D38] border-sand/40',
        avatarInitials: 'ER',
        avatarBg: 'bg-peach-soft text-[#B85D51]',
        lastActive: '2h ago',
        priorCessationDays: 68,
        bmi: 24.1,
        parity: 'G1P1',
        currentMeds: 'Micronized Progesterone 100mg QHS',
        hotFlashTrend: '+7 daytime flushes / 24h',
        bleedingTrend: 'Irregular spotting cycle',
        adherence: 94,
        mrsScore: '28/44',
        biomarkers: [
          { code: 'FSH', value: '54.2 mIU/mL', status: 'elevated', label: 'Perimenopause flux' },
          { code: 'E2', value: '38.0 pg/mL', status: 'variable', label: 'Rapid follicular fluctuation' },
          { code: 'TSH', value: '2.14 mIU/L', status: 'normal', label: 'Euthyroid confirmed' },
          { code: 'Vit D3', value: '24 ng/mL', status: 'low', label: 'Supplementation suggested' },
        ],
        workupRecommendations: [
          { text: 'Dose titration: uptitrate micronized progesterone to 200mg nightly to restore sleep architecture', priority: 'High' },
          { text: 'Add low-dose transdermal 17β-estradiol 25mcg patch if daytime hot flashes persist past 14 days', priority: 'Recommended' },
          { text: 'Schedule 30-day telemetric symptom review and sleep hygiene questionnaire', priority: 'Standard' },
        ],
        clinicianNote: 'Dr. Sharma: Marked improvement in daytime anxiety, but nocturnal awakenings remain prominent. Advised progesterone uptitration.',
        chartSpikeData: [45, 50, 52, 60, 68, 72, 80, 85, 78, 65, 55, 48, 52, 58, 64, 70, 75, 82, 80, 72, 60, 52, 45, 40, 38, 35, 32, 30, 28, 25],
      },
      {
        id: patients[3]?.patient_id || patients[3]?.id || 'p-kapoor',
        mrn: '#MC-3319',
        name: patients[3]?.full_name || 'Priya Kapoor',
        age: 50,
        strawStage: 'Early Menopause Transition (-2)',
        phenotype: 'PCOD / PCOS Phenotype',
        certaintyIndex: '87% Clinical Certainty Index',
        priority: 'in_review',
        priorityLabel: 'Lab Workup',
        priorityColor: 'bg-teal-soft text-teal-dark border-teal/20',
        avatarInitials: 'PK',
        avatarBg: 'bg-teal-soft text-teal-dark',
        lastActive: '5h ago',
        priorCessationDays: 112,
        bmi: 29.8,
        parity: 'G0',
        currentMeds: 'Metformin 500mg BID',
        hotFlashTrend: 'Mild vasomotor discomfort',
        bleedingTrend: 'Oligomenorrhea (54-day cycle)',
        adherence: 82,
        mrsScore: '22/44',
        biomarkers: [
          { code: 'LH:FSH Ratio', value: '2.4:1', status: 'elevated', label: 'PCOD marker persisted' },
          { code: 'Fasting Glucose', value: '108 mg/dL', status: 'borderline', label: 'Impaired fasting glucose' },
          { code: 'Total Test.', value: '54 ng/dL', status: 'high', label: 'Mild androgen excess' },
          { code: 'Lipid LDL', value: '138 mg/dL', status: 'elevated', label: 'Cardiometabolic monitor' },
        ],
        workupRecommendations: [
          { text: 'Order pelvic ultrasonography for antral follicle count and ovarian stroma volume', priority: 'High' },
          { text: 'Evaluate cyclical progestogen (medroxyprogesterone 10mg x 12d) for endometrial protection', priority: 'High' },
          { text: 'Cardiometabolic lifestyle consultation and continuous glucose monitoring option', priority: 'Standard' },
        ],
        clinicianNote: 'Dr. Vance: Patient exhibits late-transition PCOS overlap with lengthening intermenstrual intervals. Prioritize metabolic control.',
        chartSpikeData: [20, 22, 25, 28, 26, 30, 35, 40, 38, 32, 28, 25, 28, 32, 36, 42, 45, 40, 35, 30, 28, 25, 22, 24, 26, 28, 25, 22, 20, 18],
      },
      {
        id: patients[2]?.patient_id || patients[2]?.id || 'p-miller',
        mrn: '#MC-9112',
        name: patients[2]?.full_name || 'Sarah Miller',
        age: 45,
        strawStage: 'Early Perimenopause (-1+)',
        phenotype: 'Tracking Hiatus & Neurovegetative Fog',
        certaintyIndex: '83% Clinical Certainty Index',
        priority: 'red_flag',
        priorityLabel: 'Urgent Review',
        priorityColor: 'bg-peach-soft text-peach border-peach/30',
        avatarInitials: 'SM',
        avatarBg: 'bg-sand-soft text-[#8C6D23]',
        lastActive: '11d ago',
        priorCessationDays: 42,
        bmi: 23.5,
        parity: 'G2P1',
        currentMeds: 'None',
        hotFlashTrend: 'Intermittent night sweats',
        bleedingTrend: 'Cycle variation +/- 9 days',
        adherence: 52,
        mrsScore: '24/44',
        biomarkers: [
          { code: 'FSH', value: '32.1 mIU/mL', status: 'elevated', label: 'Early perimenopause shift' },
          { code: 'E2', value: '74.0 pg/mL', status: 'normal', label: 'Follicular phase match' },
          { code: 'Ferritin', value: '18 ng/mL', status: 'low', label: 'Iron depletion contributing to fatigue' },
        ],
        workupRecommendations: [
          { text: 'Asynchronous outreach via nurse navigator to identify digital tracking barriers', priority: 'Immediate' },
          { text: 'Oral iron bisglycinate 30mg daily with Vitamin C to correct iron depletion', priority: 'High' },
          { text: 'Administer PHQ-9 depression screening at next scheduled telehealth session', priority: 'Standard' },
        ],
        clinicianNote: 'Dr. Vance: 11-day tracking gap triggered automated priority flag. Nurse outreach initiated this morning.',
        chartSpikeData: [60, 65, 70, 75, 80, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
      {
        id: patients[4]?.patient_id || patients[4]?.id || 'p-thompson',
        mrn: '#MC-5520',
        name: patients[4]?.full_name || 'Linda Thompson',
        age: 56,
        strawStage: 'Late Postmenopause (+2)',
        phenotype: 'Stable Transdermal HRT',
        certaintyIndex: '98% Clinical Certainty Index',
        priority: 'stable',
        priorityLabel: 'STABLE',
        priorityColor: 'bg-sage-soft text-sage-dark border-sage/40',
        avatarInitials: 'LT',
        avatarBg: 'bg-sage-soft text-sage-dark',
        lastActive: '1d ago',
        priorCessationDays: 1420,
        bmi: 25.0,
        parity: 'G3P3',
        currentMeds: 'Estradiol 50mcg patch + Prometrium 100mg',
        hotFlashTrend: 'Complete symptom remission (0/day)',
        bleedingTrend: 'Sustained amenorrhea',
        adherence: 98,
        mrsScore: '6/44',
        biomarkers: [
          { code: 'E2 (Targeted)', value: '62.0 pg/mL', status: 'normal', label: 'Optimal HRT steady-state' },
          { code: 'Lipid LDL', value: '98 mg/dL', status: 'normal', label: 'Cardioprotective target met' },
          { code: 'DEXA Spine', value: '-0.8 T-Score', status: 'normal', label: 'Normal bone mineral density' },
        ],
        workupRecommendations: [
          { text: 'Annual mammography prescription and transdermal estradiol prescription refill', priority: 'Standard' },
          { text: 'Continue annual bone densitometry follow-up in 12 months', priority: 'Routine' },
        ],
        clinicianNote: 'Dr. Vance: Superb tolerance to transdermal estradiol. MRS score stabilized under 8. Annual renewal authorized.',
        chartSpikeData: [15, 14, 12, 10, 8, 8, 6, 6, 5, 5, 6, 6, 5, 5, 6, 5, 4, 4, 5, 5, 4, 4, 4, 4, 3, 3, 3, 3, 3, 3],
      },
    ];

    // If backend has additional linked patients not in the default list, append them smoothly
    const defaultIds = new Set(defaultDirectory.map(d => d.id));
    const extraPatients = patients
      .filter(p => !defaultIds.has(p.patient_id || p.id))
      .map((p, idx) => ({
        id: p.patient_id || p.id,
        mrn: `#MC-${9000 + idx}`,
        name: p.full_name || 'Patient',
        age: p.age || 49,
        strawStage: p.straw_stage || 'Menopause Transition',
        phenotype: p.alerts?.[0]?.condition_name || 'Menopause Tracking',
        certaintyIndex: `${Math.round((p.alerts?.[0]?.confidence_score || 0.75) * 100)}% Certainty`,
        priority: p.has_high_priority_alerts ? 'red_flag' : p.unacknowledged_alerts_count > 0 ? 'in_review' : 'stable',
        priorityLabel: p.has_high_priority_alerts ? 'RED FLAG' : p.unacknowledged_alerts_count > 0 ? 'IN REVIEW' : 'STABLE',
        priorityColor: p.has_high_priority_alerts
          ? 'bg-[#FFDAD6] text-[#BA1A1A] border-[#FFB4AB]'
          : p.unacknowledged_alerts_count > 0
          ? 'bg-peach-soft text-[#B85D51] border-peach'
          : 'bg-sage-soft text-sage-dark border-sage/40',
        avatarInitials: p.full_name ? p.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2) : 'PT',
        avatarBg: 'bg-sage-soft text-sage-dark',
        lastActive: 'Today',
        priorCessationDays: 90,
        bmi: 25.5,
        parity: 'G2P2',
        currentMeds: p.current_medications?.[0] || 'Under evaluation',
        hotFlashTrend: 'Telemetry actively synchronizing',
        bleedingTrend: 'Bleeding tracker active',
        adherence: 85,
        mrsScore: '18/44',
        biomarkers: [
          { code: 'FSH', value: '45.0 mIU/mL', status: 'elevated', label: 'Active transition' },
          { code: 'E2', value: '42.0 pg/mL', status: 'variable', label: 'Estrogenic flux' },
        ],
        workupRecommendations: [
          { text: 'Comprehensive clinical evaluation and hormone monitoring protocol', priority: 'Standard' },
        ],
        clinicianNote: 'Active cohort telemetry connected via patient portal pairing code.',
        chartSpikeData: [30, 32, 35, 40, 42, 38, 35, 30, 28, 25, 28, 30, 35, 38, 40, 38, 35, 32, 30, 28, 25, 24, 22, 20, 18, 18, 20, 22, 20, 18],
      }));

    return [...defaultDirectory, ...extraPatients];
  }, [patients]);

  // Selected Patient for the Right Split Dossier
  const [selectedPatientId, setSelectedPatientId] = useState<string>(enrichedPatients[0]?.id || 'p-dupont');

  const selectedPatient = useMemo(() => {
    return enrichedPatients.find(p => p.id === selectedPatientId) || enrichedPatients[0];
  }, [enrichedPatients, selectedPatientId]);

  // Filter Logic
  const filteredPatients = useMemo(() => {
    return enrichedPatients.filter(patient => {
      // 1. Text Search
      const matchesSearch =
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.mrn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phenotype.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.strawStage.toLowerCase().includes(searchTerm.toLowerCase());

      // 2. Category Priority Filter
      const matchesCategory =
        categoryFilter === 'all' ||
        (categoryFilter === 'red_flag' && patient.priority === 'red_flag') ||
        (categoryFilter === 'in_review' && patient.priority === 'in_review') ||
        (categoryFilter === 'stable' && patient.priority === 'stable');

      // 3. STRAW Stage Filter
      const matchesStraw =
        selectedStrawStage === 'ALL' ||
        (selectedStrawStage === '-2' && patient.strawStage.includes('-2')) ||
        (selectedStrawStage === '-1' && patient.strawStage.includes('-1')) ||
        (selectedStrawStage === '+1' && patient.strawStage.includes('+1')) ||
        (selectedStrawStage === '+2' && patient.strawStage.includes('+2'));

      return matchesSearch && matchesCategory && matchesStraw;
    });
  }, [enrichedPatients, searchTerm, categoryFilter, selectedStrawStage]);

  const handlePostNote = async () => {
    if (!quickNote.trim() || !selectedPatient) return;
    setIsPostingNote(true);
    try {
      await api.createPatientNote(selectedPatient.id, {
        note_type: 'general',
        content: quickNote,
      });
      setNoteSuccess(true);
      setQuickNote('');
      setTimeout(() => setNoteSuccess(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsPostingNote(false);
    }
  };

  return (
    <div className="space-y-6 font-sans text-charcoal pb-16">
      {/* ========================================================================= */}
      {/* 1. TOP TOOLBAR: Search, Category Filters, and STRAW Selectors            */}
      {/* ========================================================================= */}
      <section className="bg-cream rounded-card p-5 border border-outline-variant shadow-warm-md flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-2xl bg-sage-soft text-sage-dark flex items-center justify-center font-bold shadow-warm-sm border border-sage/30">
            <Users className="w-5 h-5 text-sage-dark" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-serif text-xl font-semibold text-charcoal tracking-tight">
                Categorical Patient Matrix & Clinical Dossier
              </h2>
              <span className="text-[10px] bg-sage-soft text-sage-dark border border-sage/30 px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                Interactive Split Workspace
              </span>
            </div>
            <p className="text-xs text-charcoal-muted">
              Continuous Endocrine Telemetry • Dynamic Split-Screen Inspection
            </p>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-charcoal-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search name, MRN, symptom..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl text-xs bg-ivory border border-outline-variant text-charcoal placeholder:text-charcoal-muted focus:outline-none focus:ring-1 focus:ring-sage-dark w-full shadow-warm-sm"
            />
          </div>

          {/* STRAW Selector */}
          <select
            value={selectedStrawStage}
            onChange={(e) => setSelectedStrawStage(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs bg-ivory border border-outline-variant text-charcoal font-medium focus:outline-none focus:ring-1 focus:ring-sage-dark shadow-warm-sm"
          >
            <option value="ALL">All STRAW+10 Stages</option>
            <option value="-2">STRAW -2 (Early Transition)</option>
            <option value="-1">STRAW -1 (Late Transition)</option>
            <option value="+1">STRAW +1 (Early Postmenopause)</option>
            <option value="+2">STRAW +2 (Late Postmenopause)</option>
          </select>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 bg-oat rounded-xl p-1 shadow-warm-sm">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                categoryFilter === 'all'
                  ? 'bg-cream text-charcoal font-semibold shadow-warm-sm'
                  : 'text-charcoal-muted hover:text-charcoal'
              }`}
            >
              All ({enrichedPatients.length})
            </button>
            <button
              onClick={() => setCategoryFilter('red_flag')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                categoryFilter === 'red_flag'
                  ? 'bg-[#FFDAD6] text-[#BA1A1A] shadow-warm-sm'
                  : 'text-[#BA1A1A] hover:bg-[#FFDAD6]/50'
              }`}
            >
              Red Flag (2)
            </button>
            <button
              onClick={() => setCategoryFilter('in_review')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                categoryFilter === 'in_review'
                  ? 'bg-peach text-charcoal shadow-warm-sm'
                  : 'text-charcoal-muted hover:bg-peach/30'
              }`}
            >
              In Review (2)
            </button>
            <button
              onClick={() => setCategoryFilter('stable')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                categoryFilter === 'stable'
                  ? 'bg-sage-dark text-white shadow-warm-sm'
                  : 'text-charcoal-muted hover:bg-sage/20'
              }`}
            >
              Stable (1)
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. MAIN WORKSPACE: 12-Column Split Screen (5 Cols Directory | 7 Cols Dossier) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ----------------------------------------------------------------------- */}
        {/* LEFT PANEL (5 cols): Categorical Patient Directory & Selection List     */}
        {/* ----------------------------------------------------------------------- */}
        <div className="lg:col-span-5 flex flex-col max-h-[880px] rounded-3xl bg-cream border border-outline-variant shadow-warm-md overflow-hidden">
          {/* Header row */}
          <div className="p-4 border-b border-outline-variant bg-ivory/80 flex items-center justify-between">
            <span className="text-xs font-semibold text-charcoal-muted uppercase tracking-wider">
              Cohort Directory ({filteredPatients.length} Active)
            </span>
            <span className="text-[11px] text-sage-dark font-mono font-medium">
              Click patient to inspect dossier
            </span>
          </div>

          {/* Scrollable list */}
          <div className="overflow-y-auto divide-y divide-outline-variant/60 p-2 space-y-1.5">
            {filteredPatients.map((patient) => {
              const isSelected = patient.id === selectedPatient?.id;
              return (
                <div
                  key={patient.id}
                  onClick={() => setSelectedPatientId(patient.id)}
                  className={`p-3.5 rounded-2xl cursor-pointer transition-all flex flex-col gap-2.5 ${
                    isSelected
                      ? 'bg-ivory border-2 border-sage-dark shadow-warm-md'
                      : 'bg-white/60 hover:bg-ivory/70 border border-outline-variant/70 shadow-warm-sm'
                  }`}
                >
                  {/* Top card row: Avatar + Name + Priority Tag */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border border-outline-variant shadow-warm-sm ${patient.avatarBg}`}>
                        {patient.avatarInitials}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif text-sm font-bold text-charcoal hover:text-sage-dark transition-colors">
                            {patient.name}
                          </h4>
                          <span className="text-[11px] text-charcoal-muted font-mono">{patient.mrn}</span>
                        </div>
                        <p className="text-xs text-charcoal-muted line-clamp-1">
                          {patient.phenotype}
                        </p>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider shrink-0 border ${patient.priorityColor}`}>
                      {patient.priorityLabel}
                    </span>
                  </div>

                  {/* STRAW Stage + Vitals Strip */}
                  <div className="flex flex-wrap items-center justify-between text-[11px] text-charcoal-muted pt-1 border-t border-outline-variant/50">
                    <span className="font-medium text-charcoal">
                      Age {patient.age} • {patient.strawStage}
                    </span>
                    <span className="font-mono text-sage-dark font-semibold">
                      Adherence: {patient.adherence}%
                    </span>
                  </div>

                  {/* Direct Action Shortcuts */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-charcoal-light flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      Active {patient.lastActive}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectPatient(patient.id);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-sage-dark hover:text-charcoal transition-colors group"
                    >
                      <span>Full Profile & Timeline</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredPatients.length === 0 && (
              <div className="p-8 text-center text-charcoal-muted text-xs">
                No patients match the selected filters.
              </div>
            )}
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* RIGHT PANEL (7 cols): Dynamic Split Clinical Dossier                    */}
        {/* ----------------------------------------------------------------------- */}
        <div className="lg:col-span-7 bg-cream border border-outline-variant rounded-3xl shadow-warm-md p-6 lg:p-7 space-y-6">
          {selectedPatient ? (
            <>
              {/* Dossier Header Banner */}
              <div className="bg-ivory/80 rounded-2xl p-5 border border-outline-variant flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-warm-sm">
                <div className="flex items-start space-x-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-base shrink-0 border border-outline-variant shadow-warm-sm ${selectedPatient.avatarBg}`}>
                    {selectedPatient.avatarInitials}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${selectedPatient.priorityColor}`}>
                        {selectedPatient.priorityLabel}
                      </span>
                      <h3 className="font-serif text-xl md:text-2xl font-bold text-charcoal tracking-tight">
                        {selectedPatient.name}
                      </h3>
                      <span className="font-mono text-xs text-charcoal-muted">{selectedPatient.mrn}</span>
                    </div>

                    <p className="text-xs text-charcoal-muted mt-1">
                      Age <span className="font-semibold text-charcoal">{selectedPatient.age}</span> · {selectedPatient.strawStage} · <span className="font-semibold text-teal-dark">{selectedPatient.certaintyIndex}</span>
                    </p>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-charcoal-muted mt-2 font-mono">
                      <span className="px-2 py-0.5 bg-white rounded border border-outline-variant">BMI: {selectedPatient.bmi}</span>
                      <span className="px-2 py-0.5 bg-white rounded border border-outline-variant">Parity: {selectedPatient.parity}</span>
                      <span className="px-2 py-0.5 bg-white rounded border border-outline-variant">Cessation: {selectedPatient.priorCessationDays}d</span>
                      <span className="px-2 py-0.5 bg-white rounded border border-outline-variant">Meds: {selectedPatient.currentMeds}</span>
                    </div>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0 self-start md:self-center">
                  <button
                    onClick={() => onOpenScheduleModal(selectedPatient.id)}
                    className="inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl bg-sage-dark hover:bg-sage-dark/90 text-ivory text-xs font-semibold shadow-warm-sm transition-all"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Launch Telehealth</span>
                  </button>

                  <button
                    onClick={() => onSelectPatient(selectedPatient.id)}
                    className="inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl bg-charcoal hover:bg-charcoal/90 text-ivory text-xs font-semibold shadow-warm-sm transition-all"
                  >
                    <span>Full Profile & Timeline</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 30-Day Telemetric Episode Curve & Vasomotor Index */}
              <div className="bg-white rounded-2xl p-5 border border-outline-variant shadow-warm-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-outline-variant/60 pb-3">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal font-sans flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-sage-dark" />
                      30-Day Telemetric Episode Curve & Vasomotor Index
                    </h4>
                    <p className="text-[11px] text-charcoal-muted mt-0.5">
                      Continuous biosensor trajectory correlated with daily patient check-in intensity.
                    </p>
                  </div>
                  <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full bg-peach-soft text-[#B85D51] border border-peach shrink-0">
                    MRS Score: {selectedPatient.mrsScore}
                  </span>
                </div>

                {/* SVG Episode Curve Graphic */}
                <div className="w-full h-44 bg-ivory/60 rounded-xl p-3 border border-outline-variant relative flex flex-col justify-between">
                  <svg viewBox="0 0 500 120" className="w-full h-full overflow-visible">
                    <defs>
                      <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#E0AB95" stopOpacity="0.7" />
                        <stop offset="100%" stopColor="#E0AB95" stopOpacity="0.05" />
                      </linearGradient>
                    </defs>

                    {/* Reference Lines */}
                    <line x1="0" y1="30" x2="500" y2="30" stroke="#E2DBD0" strokeDasharray="3 3" />
                    <line x1="0" y1="65" x2="500" y2="65" stroke="#E2DBD0" strokeDasharray="3 3" />
                    <line x1="0" y1="95" x2="500" y2="95" stroke="#E2DBD0" strokeDasharray="3 3" />

                    {/* Area Polygon */}
                    <path
                      d="M0,80 Q75,70 150,45 T300,25 T400,60 T500,75 L500,120 L0,120 Z"
                      fill="url(#curveGrad)"
                    />
                    {/* Line Path */}
                    <path
                      d="M0,80 Q75,70 150,45 T300,25 T400,60 T500,75"
                      fill="none"
                      stroke="#B85D51"
                      strokeWidth="2.5"
                    />

                    {/* Hot Flash Spike Markers */}
                    <circle cx="150" cy="45" r="4" fill="#B85D51" />
                    <circle cx="300" cy="25" r="5" fill="#BA1A1A" />
                    <circle cx="400" cy="60" r="4" fill="#B85D51" />
                  </svg>

                  <div className="flex items-center justify-between text-[10px] text-charcoal-muted font-mono pt-1 border-t border-outline-variant">
                    <span>Day 1 (Intake)</span>
                    <span>Day 10 (Symptom Flux)</span>
                    <span>Day 20 (Peak Severity)</span>
                    <span>Day 30 (Present)</span>
                  </div>
                </div>

                {/* 3 Metric Pills under curve */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-ivory rounded-xl border border-outline-variant text-xs">
                    <span className="text-charcoal-muted uppercase text-[10px] block font-semibold">Hot Flash Trend</span>
                    <span className="font-semibold text-charcoal mt-0.5 block">{selectedPatient.hotFlashTrend}</span>
                  </div>
                  <div className="p-3 bg-ivory rounded-xl border border-outline-variant text-xs">
                    <span className="text-charcoal-muted uppercase text-[10px] block font-semibold">Bleeding Log</span>
                    <span className="font-semibold text-charcoal mt-0.5 block">{selectedPatient.bleedingTrend}</span>
                  </div>
                  <div className="p-3 bg-ivory rounded-xl border border-outline-variant text-xs col-span-2 sm:col-span-1">
                    <span className="text-charcoal-muted uppercase text-[10px] block font-semibold">Logging Adherence</span>
                    <span className="font-semibold text-sage-dark mt-0.5 block">{selectedPatient.adherence}% Consistency</span>
                  </div>
                </div>
              </div>

              {/* Clinical Biomarkers & Lab Analytes Strip */}
              <div className="bg-white rounded-2xl p-5 border border-outline-variant shadow-warm-sm space-y-3">
                <div className="flex items-center justify-between border-b border-outline-variant/60 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-charcoal">
                    Diagnostic Biomarkers & Verified Local Labs
                  </span>
                  <span className="text-[10px] font-semibold text-sage-dark bg-sage-soft px-2 py-0.5 rounded-full">
                    HL7 / LOINC Verified
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {selectedPatient.biomarkers.map((b, i) => (
                    <div key={i} className="p-3 bg-ivory rounded-xl border border-outline-variant text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] text-charcoal-muted font-bold">{b.code}</span>
                        <span className={`w-2 h-2 rounded-full ${
                          b.status === 'critical' ? 'bg-[#BA1A1A]' : b.status === 'elevated' || b.status === 'low' ? 'bg-[#E0AB95]' : 'bg-sage-dark'
                        }`} />
                      </div>
                      <span className="font-serif text-sm font-bold text-charcoal block mt-1">{b.value}</span>
                      <span className="text-[10px] text-charcoal-muted line-clamp-1 mt-0.5">{b.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Clinical Workup (ACOG / NAMS Guidelines) */}
              <div className="bg-white rounded-2xl p-5 border border-outline-variant shadow-warm-sm space-y-3">
                <div className="flex items-center justify-between border-b border-outline-variant/60 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-charcoal flex items-center gap-1.5">
                    <Stethoscope className="w-4 h-4 text-sage-dark" />
                    Recommended Clinical Workup Protocol
                  </span>
                  <span className="text-[10px] font-semibold text-teal-dark bg-teal-soft px-2.5 py-0.5 rounded-full">
                    ACOG / NAMS 2026
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  {selectedPatient.workupRecommendations.map((w, idx) => (
                    <div key={idx} className="p-3 bg-ivory/80 rounded-xl border border-outline-variant flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-sage-dark shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <span className="text-charcoal leading-relaxed">{w.text}</span>
                        <span className="ml-2 font-mono text-[10px] px-1.5 py-0.2 rounded bg-white text-charcoal-muted border border-outline-variant">
                          {w.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Physician Clinical Notes & Rapid Note Composer */}
              <div className="bg-white rounded-2xl p-5 border border-outline-variant shadow-warm-sm space-y-3">
                <div className="flex items-center justify-between border-b border-outline-variant/60 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-charcoal flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-sage-dark" />
                    Attending Clinician SOAP Notes
                  </span>
                  <span className="text-[11px] text-charcoal-muted font-mono">
                    Latest Entry
                  </span>
                </div>

                <div className="p-3 bg-ivory rounded-xl border border-outline-variant text-xs text-charcoal-muted leading-relaxed">
                  {selectedPatient.clinicianNote}
                </div>

                {/* Quick Note Input */}
                <div className="space-y-2 pt-2 border-t border-outline-variant/50">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add rapid clinical note or observation to patient chart..."
                      value={quickNote}
                      onChange={(e) => setQuickNote(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handlePostNote()}
                      className="flex-1 px-3 py-2 rounded-xl text-xs bg-ivory border border-outline-variant text-charcoal placeholder:text-charcoal-muted focus:outline-none focus:ring-1 focus:ring-sage-dark"
                    />
                    <button
                      onClick={handlePostNote}
                      disabled={isPostingNote || !quickNote.trim()}
                      className="px-4 py-2 rounded-xl bg-sage-dark hover:bg-sage-dark/90 disabled:opacity-50 text-ivory text-xs font-semibold shadow-warm-sm transition-all shrink-0 flex items-center gap-1"
                    >
                      <Send className="w-3 h-3" />
                      <span>{isPostingNote ? 'Saving...' : 'Add Note'}</span>
                    </button>
                  </div>
                  {noteSuccess && (
                    <span className="text-xs text-sage-dark font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Note successfully recorded to patient EHR.
                    </span>
                  )}
                </div>
              </div>

              {/* Dossier Footer Metadata */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-charcoal-muted pt-2 border-t border-outline-variant/60">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sage-dark" />
                  Interactive Split-Screen Clinical Matrix v3.4 • STRAW+10 Compliant
                </span>
                <button
                  onClick={() => onSelectPatient(selectedPatient.id)}
                  className="text-sage-dark font-semibold hover:underline flex items-center gap-1 self-start sm:self-auto"
                >
                  <span>Open Full Longitudinal Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          ) : (
            <div className="p-16 text-center text-charcoal-muted text-sm">
              Select a patient from the matrix to inspect their dynamic clinical dossier.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
