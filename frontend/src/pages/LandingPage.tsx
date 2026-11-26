import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  Brain,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Flame,
  Lock,
  Moon,
  Shield,
  Sparkles,
  Stethoscope,
  TrendingUp,
  UserCheck,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface LandingPageProps {
  onGetStarted?: () => void;
  onSignIn?: (role?: 'patient' | 'doctor') => void;
  onNavigate?: (view: 'login' | 'register', role?: 'patient' | 'doctor') => void;
  onQuickDemoLogin?: (email: string, role: 'patient' | 'doctor') => void;
}

// Longitudinal trend data
const TREND_DATA_30 = [
  { day: 'Day 1', hotFlashes: 7, sleepQuality: 4, moodScore: 5 },
  { day: 'Day 5', hotFlashes: 8, sleepQuality: 3, moodScore: 4 },
  { day: 'Day 10', hotFlashes: 6, sleepQuality: 5, moodScore: 6 },
  { day: 'Day 15', hotFlashes: 9, sleepQuality: 2, moodScore: 3 },
  { day: 'Day 20', hotFlashes: 5, sleepQuality: 6, moodScore: 7 },
  { day: 'Day 25', hotFlashes: 4, sleepQuality: 7, moodScore: 8 },
  { day: 'Day 30', hotFlashes: 3, sleepQuality: 8, moodScore: 8 },
];

const TREND_DATA_90 = [
  { day: 'Wk 1', hotFlashes: 8, sleepQuality: 3, moodScore: 4 },
  { day: 'Wk 3', hotFlashes: 7, sleepQuality: 4, moodScore: 5 },
  { day: 'Wk 5', hotFlashes: 9, sleepQuality: 3, moodScore: 3 },
  { day: 'Wk 7', hotFlashes: 6, sleepQuality: 5, moodScore: 6 },
  { day: 'Wk 9', hotFlashes: 4, sleepQuality: 7, moodScore: 7 },
  { day: 'Wk 11', hotFlashes: 3, sleepQuality: 8, moodScore: 8 },
  { day: 'Wk 13', hotFlashes: 2, sleepQuality: 9, moodScore: 9 },
];

// Authentic clinical archetypes
const STORIES = [
  {
    id: 'perimenopause',
    name: 'Maya S., 48',
    stage: 'Late Perimenopause (STRAW -1)',
    location: 'Design Director, Chicago',
    quote:
      'The sudden brain fog and nocturnal hot flashes made me question my competence in high-stakes meetings. MenoCare showed me that my symptoms weren’t random anxiety—they spiked in direct correlation with cycle phase and sleep debt.',
    keyInsight: 'Correlated late afternoon caffeine with 3:00 AM vasomotor spikes.',
    scoreReduction: 'MRS Score reduced from 19 to 11 in 8 weeks',
    tagColor: 'bg-peach-soft text-[#8C371D] border-[#8C371D]/30',
  },
  {
    id: 'surgical',
    name: 'Sarah T., 51',
    stage: 'Surgical Menopause (Post-Oophorectomy)',
    location: 'Architect, Seattle',
    quote:
      'After my surgery, hormonal changes hit like a freight train overnight. Having a structured, quiet tool that recorded symptom intensity every evening gave my endocrinologist and gynecologist exact longitudinal data to calibrate my HRT.',
    keyInsight: 'Documented 14-day symptom response to transdermal estradiol adjustment.',
    scoreReduction: 'Eliminated severe night sweats within 21 days',
    tagColor: 'bg-teal-soft text-teal-dark border-teal/30',
  },
  {
    id: 'postmenopause',
    name: 'Dr. Priya K., 55',
    stage: 'Early Postmenopause (STRAW +1)',
    location: 'University Dean, Austin',
    quote:
      'As a researcher myself, vague questionnaires felt insulting. MenoCare’s reliance on validated MRS categories and clean trend graphs gave me back my sense of agency and grounded my annual review with my physician in solid facts.',
    keyInsight: 'Identified chronic joint stiffness responding to evening resistance training.',
    scoreReduction: 'Sleep quality index improved by 64%',
    tagColor: 'bg-sage-soft text-sage-dark border-sage/30',
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onSignIn,
  onNavigate,
  onQuickDemoLogin,
}) => {
  const [activeStory, setActiveStory] = useState(0);
  const [sliderHotFlash, setSliderHotFlash] = useState(6);
  const [sliderSleep, setSliderSleep] = useState(4);
  const [sliderMood, setSliderMood] = useState(5);
  const [trendRange, setTrendRange] = useState<'30' | '90'>('30');
  const [perspective, setPerspective] = useState<'patient' | 'doctor'>('patient');

  const handleStart = () => {
    if (onGetStarted) {
      onGetStarted();
    } else if (onNavigate) {
      onNavigate('register', 'patient');
    }
  };

  const handleLogin = (role?: 'patient' | 'doctor') => {
    if (onSignIn) {
      onSignIn(role);
    } else if (onNavigate) {
      onNavigate('login', role);
    }
  };

  const handlePatientDemo = () => {
    if (onQuickDemoLogin) {
      onQuickDemoLogin('patient1@menocare.com', 'patient');
    }
  };

  const handleDoctorDemo = () => {
    if (onQuickDemoLogin) {
      onQuickDemoLogin('doctor@menocare.com', 'doctor');
    }
  };

  // Compute calculated MRS score for simulator
  const calculatedMRS = Math.round(
    sliderHotFlash * 1.8 + (10 - sliderSleep) * 1.2 + (10 - sliderMood) * 1.4
  );

  const getMRSSeverityLabel = (score: number) => {
    if (score < 10) return { label: 'Mild Impact', color: 'text-sage-dark bg-sage-soft border-sage/20' };
    if (score < 20) return { label: 'Moderate Symptoms', color: 'text-amber-900 bg-amber-50 border-amber-300' };
    return { label: 'Severe Impact — Clinical Review Recommended', color: 'text-rose-900 bg-rose-50 border-rose-300' };
  };

  const severityMeta = getMRSSeverityLabel(calculatedMRS);

  return (
    <div className="min-h-screen bg-ivory text-charcoal font-sans antialiased selection:bg-sage/20 selection:text-charcoal relative overflow-x-hidden">
      {/* Top ambient color glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-gradient-to-b from-sage-soft/60 via-peach-soft/30 to-transparent blur-3xl pointer-events-none -z-10"
        aria-hidden="true"
      />

      {/* =========================================================================
          GLOBAL STICKY HEADER (Visitor-Oriented Navigation)
          ========================================================================= */}
      <header className="sticky top-0 z-50 bg-ivory/90 backdrop-blur-md border-b border-outline-variant/60 transition-all duration-200">
        <div className="w-[92%] max-w-[1500px] mx-auto h-20 flex items-center justify-between">
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sage-dark flex items-center justify-center text-ivory shadow-warm-sm">
              <Activity className="w-5 h-5 text-cream" />
            </div>
            <div>
              <span className="font-serif font-semibold text-2xl tracking-tight text-charcoal flex items-center gap-1.5">
                MenoCare
                <span className="w-1.5 h-1.5 rounded-full bg-sage inline-block" />
              </span>
              <p className="text-xs text-charcoal-muted font-medium tracking-wide">
                Clinical Health Intelligence
              </p>
            </div>
          </div>

          {/* Visitor-Oriented Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-charcoal-muted" aria-label="Main Navigation">
            <a href="#how-it-works" className="hover:text-charcoal transition-colors">
              How it works
            </a>
            <a href="#your-experience" className="hover:text-charcoal transition-colors">
              Your experience
            </a>
            <a href="#providers" className="hover:text-charcoal transition-colors">
              For healthcare providers
            </a>
            <a href="#approach" className="hover:text-charcoal transition-colors">
              Our approach
            </a>
          </nav>

          {/* Demo Access & Auth CTAs */}
          <div className="flex items-center gap-3">
            {onQuickDemoLogin && (
              <div className="hidden sm:flex items-center gap-1.5 bg-oat-light/80 p-1 rounded-xl border border-outline-variant text-xs">
                <span className="px-2 text-charcoal-muted font-semibold">1-Click Demo:</span>
                <button
                  type="button"
                  onClick={handlePatientDemo}
                  className="px-2.5 py-1 rounded-lg bg-cream hover:bg-white text-charcoal font-semibold shadow-warm-sm border border-outline-variant/50 transition-all active:scale-[0.98]"
                  title="Log in directly as Elena Rostova (Patient)"
                >
                  Elena (Patient)
                </button>
                <button
                  type="button"
                  onClick={handleDoctorDemo}
                  className="px-2.5 py-1 rounded-lg bg-cream hover:bg-white text-teal-dark font-semibold shadow-warm-sm border border-outline-variant/50 transition-all active:scale-[0.98]"
                  title="Log in directly as Dr. Elena Vance (Physician)"
                >
                  Dr. Vance (Doctor)
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => handleLogin()}
              className="px-4 py-2 text-sm font-semibold text-charcoal hover:text-sage-dark transition-colors"
            >
              Sign In
            </button>

            <button
              type="button"
              onClick={handleStart}
              className="px-5 py-2.5 rounded-xl bg-sage-dark hover:bg-charcoal text-cream text-sm font-semibold shadow-warm-sm transition-all duration-200 active:scale-[0.98] flex items-center gap-2"
            >
              Get Started
              <ArrowRight className="w-4 h-4 text-cream" />
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          ANCHORING EDITORIAL OPENING STATEMENT (Centered & Balanced Poise)
          ========================================================================= */}
      <section className="relative w-[92%] max-w-[1500px] mx-auto pt-8 pb-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="max-w-4xl mx-auto space-y-5 flex flex-col items-center text-center"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cream border border-outline-variant text-xs font-semibold text-charcoal-muted shadow-warm-sm">
            <Sparkles className="w-3.5 h-3.5 text-sage-dark" />
            <span>Clinical Women's Health Platform</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl lg:text-[62px] font-medium text-charcoal tracking-tight text-balance leading-[1.12]">
            Your body is changing. <br />
            <span className="text-sage-dark font-normal">Your experience deserves to be understood.</span>
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-charcoal-muted max-w-2xl mx-auto font-normal leading-relaxed text-pretty">
            Menopause is not a decline, nor is it a single statistic. It is a nuanced biological transition that deserves compassionate daily awareness and precise clinical collaboration.
          </p>
        </motion.div>
      </section>

      {/* =========================================================================
          SECTION 1: THE SPLIT-SCREEN HERO (Wide Asymmetric Split Viewport)
          ========================================================================= */}
      <section className="relative w-[92%] max-w-[1500px] mx-auto py-12 lg:py-20 min-h-[calc(100vh-14rem)] flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center w-full">
          {/* Left Column: Left-Aligned Editorial Typography & CTAs (6 cols) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
            className="lg:col-span-6 xl:col-span-6 space-y-6 text-left"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sage-soft text-sage-dark border border-sage/20 text-xs font-semibold shadow-warm-sm">
              <Activity className="w-3.5 h-3.5" />
              <span>Validated MRS Framework & STRAW+10 Criteria</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-5xl lg:text-[50px] font-medium text-charcoal tracking-tight text-balance leading-[1.12]">
              Your menopause transition. <br />
              <span className="text-sage-dark font-normal">Finally seen in high resolution.</span>
            </h2>

            <p className="text-base sm:text-lg text-charcoal-muted max-w-xl font-normal leading-relaxed text-pretty">
              No more isolated bad days or vague recollections during rushed 15-minute visits.
              MenoCare turns daily 60-second check-ins into validated clinical trendlines—giving you clarity today and your doctor precision tomorrow.
            </p>

            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button
                type="button"
                onClick={handleStart}
                className="px-7 py-3.5 rounded-xl bg-sage-dark hover:bg-charcoal text-cream font-semibold text-base shadow-warm-md hover:shadow-warm-lg transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2.5"
              >
                Start Free Health Diary
                <ArrowRight className="w-4 h-4 text-cream" />
              </button>

              {onQuickDemoLogin && (
                <button
                  type="button"
                  onClick={handlePatientDemo}
                  className="px-6 py-3.5 rounded-xl bg-cream hover:bg-white text-charcoal font-semibold text-base border border-outline-variant shadow-warm-sm transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <UserCheck className="w-4 h-4 text-sage" />
                  Explore Demo as Elena
                </button>
              )}
            </div>

            {/* Trust Badges */}
            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-charcoal-muted font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-sage" />
                Standardized MRS Scoring
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-sage" />
                Zero Third-Party Ad Tracking
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-sage" />
                Doctor-Ready Clinical Exports
              </span>
            </div>
          </motion.div>

          {/* Right Column: Layered Live Product Interface Showcase (6 cols) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
            className="lg:col-span-6 xl:col-span-6 relative"
          >
            {/* Ambient Backlight Glow */}
            <div
              className="absolute -inset-3 bg-gradient-to-tr from-sage/15 via-peach/10 to-teal/15 rounded-[2.5rem] blur-2xl -z-10"
              aria-hidden="true"
            />

            {/* Product Window Frame */}
            <div className="bg-cream rounded-3xl border border-outline-variant shadow-warm-lg overflow-hidden">
              {/* Window Chrome Header */}
              <div className="px-5 py-3.5 bg-oat-light/60 border-b border-outline-variant flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-oat border border-outline-variant" />
                    <span className="w-2.5 h-2.5 rounded-full bg-oat border border-outline-variant" />
                    <span className="w-2.5 h-2.5 rounded-full bg-oat border border-outline-variant" />
                  </div>
                  <div className="h-4 w-[1px] bg-outline-variant mx-1" />
                  <div className="flex items-center gap-2 text-xs font-semibold text-charcoal-muted">
                    <Activity className="w-3.5 h-3.5 text-sage" />
                    <span>Elena Rostova — Patient Clinical Overview</span>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-sage-soft text-sage-dark text-xs font-semibold border border-sage/20">
                  Late Perimenopause (STRAW -1)
                </span>
              </div>

              {/* Dashboard Content */}
              <div className="p-6 space-y-5">
                {/* Top Metrics Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-outline-variant border-b border-outline-variant pb-4">
                  <div className="p-4 bg-oat-light/25">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
                        Menopause Rating Scale
                      </span>
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
                        Moderate Impact
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-serif font-bold text-charcoal">14</span>
                      <span className="text-xs text-charcoal-muted font-medium">/ 44 total points</span>
                    </div>
                    <div className="w-full bg-oat-light h-2 rounded-full mt-3 overflow-hidden">
                      <div className="bg-sage h-full rounded-full transition-all duration-500" style={{ width: '31%' }} />
                    </div>
                    <p className="text-xs text-charcoal-muted mt-2">
                      Down from 19 points 4 weeks ago. Vasomotor domain improved by 28%.
                    </p>
                  </div>

                  <div className="p-4 bg-oat-light/25 space-y-2.5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-muted block">
                      Active Primary Clusters
                    </span>
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 text-charcoal font-medium">
                        <Flame className="w-3.5 h-3.5 text-[#8C371D]" />
                        Hot Flashes
                      </span>
                      <span className="font-semibold text-charcoal">3/day (Mild)</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 text-charcoal font-medium">
                        <Moon className="w-3.5 h-3.5 text-[#654B7C]" />
                        Sleep Awakenings
                      </span>
                      <span className="font-semibold text-charcoal">1 episode / night</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 text-charcoal font-medium">
                        <Brain className="w-3.5 h-3.5 text-teal" />
                        Cognitive Focus
                      </span>
                      <span className="font-semibold text-sage-dark">Good / Clear</span>
                    </div>
                  </div>
                </div>

                {/* Recharts Longitudinal Preview on Warm Cream Background */}
                <div className="p-2">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-serif font-semibold text-base text-charcoal">
                        Vasomotor vs. Sleep Recovery (Last 30 Days)
                      </h3>
                      <p className="text-xs text-charcoal-muted">
                        Inverse correlation between nocturnal flashes and restorative deep sleep.
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-sage-dark bg-sage-soft border border-sage/20 px-2.5 py-1 rounded-lg">
                      Strong Correlation
                    </span>
                  </div>

                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={TREND_DATA_30} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="heroSageLight" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#71846A" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#71846A" stopOpacity={0.0} />
                          </linearGradient>
                          <linearGradient id="heroPeachLight" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#C97F63" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#C97F63" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2DBD0" vertical={false} />
                        <XAxis dataKey="day" stroke="#544E45" fontSize={11} tickLine={false} />
                        <YAxis stroke="#544E45" fontSize={11} tickLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#FAF8F3',
                            borderColor: '#E2DBD0',
                            borderRadius: '0.75rem',
                            color: '#2E2924',
                            fontSize: '12px',
                          }}
                        />
                        <Area type="monotone" dataKey="sleepQuality" stroke="#71846A" strokeWidth={2} fillOpacity={1} fill="url(#heroSageLight)" name="Sleep Quality" />
                        <Area type="monotone" dataKey="hotFlashes" stroke="#8C371D" strokeWidth={2} fillOpacity={1} fill="url(#heroPeachLight)" name="Vasomotor Severity" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="pt-2 border-t border-outline-variant flex items-center justify-between text-xs text-charcoal-muted">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-sage" /> Sleep Index
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#8C371D]" /> Hot Flashes
                      </span>
                    </div>
                    <span className="text-charcoal font-medium">Continuous Sync</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: THE HUMAN EXPERIENCE ("Your experience" anchor, #your-experience)
          ========================================================================= */}
      <section id="your-experience" className="py-20 lg:py-28 bg-oat-light/60 border-y border-outline-variant">
        <div className="w-[92%] max-w-[1500px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left Narrative (5 cols) */}
            <div className="lg:col-span-5 space-y-6 text-left">
              <h2 className="font-serif text-3xl sm:text-5xl font-medium text-charcoal tracking-tight text-balance leading-tight">
                Menopause is not a single monolith. <br />
                <span className="text-charcoal-muted font-normal">Every woman experiences a distinct rhythm.</span>
              </h2>
              <p className="text-base text-charcoal-muted leading-relaxed font-normal text-pretty">
                Hear how women in different clinical stages use structured tracking to reclaim confidence, adjust lifestyle habits, and advocate for themselves with doctors.
              </p>

              {/* Story selector buttons */}
              <div className="flex flex-col gap-2 pt-2">
                {STORIES.map((story, index) => (
                  <button
                    key={story.id}
                    type="button"
                    onClick={() => setActiveStory(index)}
                    className={`p-3.5 rounded-xl text-left transition-all duration-200 border flex items-center justify-between ${
                      activeStory === index
                        ? 'bg-sage-dark border-sage-dark text-cream shadow-warm-md'
                        : 'bg-cream/90 border-outline-variant text-charcoal-muted hover:text-charcoal hover:bg-white'
                    }`}
                  >
                    <div>
                      <span className="font-semibold text-sm block">{story.name}</span>
                      <span className={`text-xs ${activeStory === index ? 'text-cream/80' : 'text-charcoal-muted'}`}>
                        {story.stage.split('(')[0]}
                      </span>
                    </div>
                    <ArrowRight className={`w-4 h-4 transition-transform ${activeStory === index ? 'text-cream translate-x-1' : 'opacity-40'}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Right Story Card (7 cols) */}
            <div className="lg:col-span-7">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStory}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="bg-gradient-to-br from-cream via-white to-oat-light/40 rounded-3xl p-8 sm:p-12 border border-outline-variant shadow-warm-md space-y-6"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant">
                    <div>
                      <h3 className="font-serif text-2xl font-semibold text-charcoal">
                        {STORIES[activeStory].name}
                      </h3>
                      <p className="text-xs text-charcoal-muted font-medium mt-0.5">
                        {STORIES[activeStory].location}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${STORIES[activeStory].tagColor}`}>
                      {STORIES[activeStory].stage}
                    </span>
                  </div>

                  <blockquote className="font-serif text-xl sm:text-2xl text-charcoal leading-relaxed font-normal">
                    “{STORIES[activeStory].quote}”
                  </blockquote>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-outline-variant">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-sage-soft text-sage-dark flex items-center justify-center">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-charcoal-muted block">Observed Pattern</span>
                        <span className="text-xs font-bold text-charcoal">{STORIES[activeStory].keyInsight}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-teal-soft text-teal-dark flex items-center justify-center">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-charcoal-muted block">Measured Outcome</span>
                        <span className="text-xs font-bold text-teal-dark">{STORIES[activeStory].scoreReduction}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: INTERACTIVE CHECK-IN SIMULATOR (Wide Asymmetric Split)
          ========================================================================= */}
      <section className="py-20 lg:py-28 w-[92%] max-w-[1500px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Interactive Check-in Controls (7 cols) */}
          <div className="lg:col-span-7 bg-gradient-to-br from-cream via-white to-oat-light/30 rounded-3xl p-6 sm:p-10 border border-outline-variant shadow-warm-md space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant">
              <div>
                <h2 className="font-serif font-semibold text-2xl text-charcoal">
                  Test the 60-Second Daily Check-In
                </h2>
                <p className="text-xs text-charcoal-muted mt-1">
                  Drag the sliders to simulate an evening log. Watch the clinical scoring respond dynamically.
                </p>
              </div>
              <span className="text-xs font-semibold text-charcoal-muted flex items-center gap-1.5 bg-oat-light/60 px-3 py-1.5 rounded-xl border border-outline-variant">
                <Clock className="w-3.5 h-3.5 text-sage" /> 60 seconds
              </span>
            </div>

            {/* Slider 1: Hot Flashes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-charcoal">
                  <Flame className="w-4 h-4 text-[#8C371D]" /> Hot Flashes & Night Sweats
                </span>
                <span className="text-[#8C371D] font-bold">{sliderHotFlash} / 10 intensity</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={sliderHotFlash}
                onChange={(e) => setSliderHotFlash(Number(e.target.value))}
                className="w-full accent-[#8C371D] h-2 bg-oat-light rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-xs text-charcoal-muted">
                <span>None today</span>
                <span>Mild</span>
                <span>Severe episodes</span>
              </div>
            </div>

            {/* Slider 2: Sleep Quality */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-charcoal">
                  <Moon className="w-4 h-4 text-[#654B7C]" /> Sleep Restfulness
                </span>
                <span className="text-[#654B7C] font-bold">{sliderSleep} / 10 quality</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={sliderSleep}
                onChange={(e) => setSliderSleep(Number(e.target.value))}
                className="w-full accent-[#654B7C] h-2 bg-oat-light rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-xs text-charcoal-muted">
                <span>Restless / Woke 3x</span>
                <span>Average</span>
                <span>Deep & Unbroken</span>
              </div>
            </div>

            {/* Slider 3: Mood & Focus */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-charcoal">
                  <Brain className="w-4 h-4 text-teal" /> Mood Stability & Energy
                </span>
                <span className="text-teal-dark font-bold">{sliderMood} / 10 stability</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={sliderMood}
                onChange={(e) => setSliderMood(Number(e.target.value))}
                className="w-full accent-teal h-2 bg-oat-light rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-xs text-charcoal-muted">
                <span>High irritability</span>
                <span>Balanced</span>
                <span>Calm & Energetic</span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Calculated Synthesis Output (5 cols) */}
          <div className="lg:col-span-5 bg-gradient-to-b from-oat-light/60 via-cream to-oat-light/30 rounded-3xl p-6 sm:p-10 border border-outline-variant shadow-warm-md flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-charcoal-muted">
                  Simulated Real-Time Synthesis
                </span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${severityMeta.color}`}>
                  {severityMeta.label}
                </span>
              </div>

              <div className="py-5 my-4 border-y border-outline-variant/60">
                <span className="text-xs text-charcoal-muted font-medium block">
                  Simulated Menopause Rating Scale Score
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl font-serif font-bold text-charcoal">
                    {calculatedMRS}
                  </span>
                  <span className="text-xs text-charcoal-muted font-semibold">/ 44 points</span>
                </div>
              </div>

              {/* Dynamic Guidance Note */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-charcoal flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-sage" /> Automated Observation:
                </span>
                <div className="p-4 text-xs text-charcoal leading-relaxed font-normal border-l-2 border-sage bg-oat-light/50">
                  {calculatedMRS < 12 && (
                    <p>
                      Your reported symptoms indicate a stable rhythm. Continuing consistent evening check-ins ensures subtle shifts in cycle cadence are captured early.
                    </p>
                  )}
                  {calculatedMRS >= 12 && calculatedMRS < 22 && (
                    <p>
                      Vasomotor intensity is moderately impacting daytime recovery. MenoCare flags this pattern for review so your doctor can evaluate non-hormonal or hormonal options.
                    </p>
                  )}
                  {calculatedMRS >= 22 && (
                    <p>
                      High symptom convergence detected across vasomotor and sleep domains. A 1-click clinical dossier export is prepared to share directly with your provider.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleStart}
              className="w-full py-3.5 rounded-xl bg-sage-dark hover:bg-charcoal text-cream text-sm font-semibold shadow-warm-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              Track Your Real Symptoms Today
              <ArrowRight className="w-4 h-4 text-cream" />
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: LONGITUDINAL TRENDS & STRAW+10 ("Our approach", #approach)
          ========================================================================= */}
      <section id="approach" className="py-20 lg:py-28 bg-oat-light/60 border-y border-outline-variant">
        <div className="w-[92%] max-w-[1500px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Narrative (5 cols) */}
            <div className="lg:col-span-5 space-y-6 text-left">
              <h2 className="font-serif text-3xl sm:text-5xl font-medium text-charcoal tracking-tight text-balance leading-tight">
                Move from isolated bad days to longitudinal clarity.
              </h2>
              <p className="text-base text-charcoal-muted leading-relaxed font-normal text-pretty">
                A single check-in captures how you feel tonight. But thirty check-ins reveal seasonal trends, trigger associations, and hormonal cycle shifts.
              </p>
              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-sage-soft text-sage-dark flex items-center justify-center font-bold text-xs mt-0.5">
                    1
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-charcoal">STRAW+10 Reproductive Staging</h3>
                    <p className="text-xs text-charcoal-muted mt-0.5">
                      Classifies whether changes align with early transition, late perimenopause, or postmenopause.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-teal-soft text-teal-dark flex items-center justify-center font-bold text-xs mt-0.5">
                    2
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-charcoal">Trigger Identification</h3>
                    <p className="text-xs text-charcoal-muted mt-0.5">
                      Isolate the true impact of caffeine, stress, alcohol, and evening screen time on night sweats.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-peach-soft text-[#8C371D] flex items-center justify-center font-bold text-xs mt-0.5">
                    3
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-charcoal">Treatment Efficacy Tracking</h3>
                    <p className="text-xs text-charcoal-muted mt-0.5">
                      Verify objectively if new supplements, lifestyle changes, or HRT are making a measurable difference.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Chart Showcase (7 cols) */}
            <div className="lg:col-span-7 bg-gradient-to-b from-cream via-white to-oat-light/30 rounded-3xl p-6 sm:p-10 border border-outline-variant shadow-warm-md">
              <div className="flex items-center justify-between pb-4 border-b border-outline-variant mb-6">
                <div>
                  <h3 className="font-serif text-lg font-semibold text-charcoal">
                    Multi-Metric Trajectory
                  </h3>
                  <p className="text-xs text-charcoal-muted">
                    Elena Rostova’s symptom recovery arc
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setTrendRange('30')}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                      trendRange === '30'
                        ? 'bg-cream text-charcoal shadow-warm-sm border border-outline-variant'
                        : 'text-charcoal-muted hover:text-charcoal'
                    }`}
                  >
                    30 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => setTrendRange('90')}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                      trendRange === '90'
                        ? 'bg-cream text-charcoal shadow-warm-sm border border-outline-variant'
                        : 'text-charcoal-muted hover:text-charcoal'
                    }`}
                  >
                    90 Days
                  </button>
                </div>
              </div>

              {/* Chart Render */}
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={trendRange === '30' ? TREND_DATA_30 : TREND_DATA_90}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2DBD0" vertical={false} />
                    <XAxis
                      dataKey="day"
                      stroke="#544E45"
                      fontSize={11}
                      tickLine={false}
                    />
                    <YAxis stroke="#544E45" fontSize={11} tickLine={false} domain={[0, 10]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FAF8F3',
                        borderColor: '#E2DBD0',
                        borderRadius: '0.75rem',
                        color: '#2E2924',
                        fontSize: '12px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="sleepQuality"
                      stroke="#71846A"
                      strokeWidth={2}
                      fillOpacity={0.2}
                      fill="#71846A"
                      name="Sleep Quality Index"
                    />
                    <Area
                      type="monotone"
                      dataKey="hotFlashes"
                      stroke="#8C371D"
                      strokeWidth={2}
                      fillOpacity={0.2}
                      fill="#8C371D"
                      name="Hot Flash Episodes"
                    />
                    <Area
                      type="monotone"
                      dataKey="moodScore"
                      stroke="#527772"
                      strokeWidth={2}
                      fillOpacity={0.15}
                      fill="#527772"
                      name="Mood Stability"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 pt-4 border-t border-outline-variant flex flex-wrap items-center justify-between text-xs text-charcoal-muted">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-sage" /> Sleep Index
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#8C371D]" /> Hot Flashes
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal" /> Mood Stability
                  </span>
                </div>
                <span className="font-semibold text-sage-dark">
                  STRAW Stage: Late Transition (-1)
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: DESIGNED AROUND REAL EXPERIENCES (Patient App Bento)
          ========================================================================= */}
      <section className="py-20 lg:py-28 w-[92%] max-w-[1500px] mx-auto">
        <div className="max-w-3xl mb-12 text-left">
          <h2 className="font-serif text-3xl sm:text-5xl font-medium text-charcoal tracking-tight text-balance">
            Designed for human beings, not medical databases.
          </h2>
          <p className="text-base text-charcoal-muted mt-3 font-normal text-pretty">
            Healthcare interfaces shouldn’t feel intimidating. Every screen in MenoCare uses plain everyday language, calm surfaces, and considerate interactions.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-3xl bg-gradient-to-br from-cream via-white to-sage-soft/40 border border-outline-variant shadow-warm-sm hover:shadow-warm-md transition-all">
            <h3 className="font-serif text-xl font-semibold text-charcoal mb-3 flex items-center gap-3">
              <Clock className="w-6 h-6 text-sage-dark shrink-0" />
              <span>60-Second Evening Log</span>
            </h3>
            <p className="text-sm text-charcoal-muted leading-relaxed font-normal">
              No exhausting multiple-choice grids. Four intuitive sliders let you capture sleep, mood, vasomotor severity, and brain fog in under a minute.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-gradient-to-br from-cream via-white to-teal-soft/40 border border-outline-variant shadow-warm-sm hover:shadow-warm-md transition-all">
            <h3 className="font-serif text-xl font-semibold text-charcoal mb-3 flex items-center gap-3">
              <Brain className="w-6 h-6 text-teal-dark shrink-0" />
              <span>Plain-Language Summaries</span>
            </h3>
            <p className="text-sm text-charcoal-muted leading-relaxed font-normal">
              Instead of cryptic medical shorthand, your dashboard tells you simply: “Hot flashes occurred less often this week than last week.”
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-gradient-to-br from-cream via-white to-peach-soft/30 border border-outline-variant shadow-warm-sm hover:shadow-warm-md transition-all">
            <h3 className="font-serif text-xl font-semibold text-charcoal mb-3 flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-[#8C371D] shrink-0" />
              <span>Trigger Correlation</span>
            </h3>
            <p className="text-sm text-charcoal-muted leading-relaxed font-normal">
              Discover subtle connections between afternoon espresso, evening screen time, or daily work stress and subsequent nighttime awakenings.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: DOCTOR WORKSPACE LENS ("For healthcare providers", #providers)
          ========================================================================= */}
      <section id="providers" className="py-20 lg:py-28 bg-oat-light/60 border-y border-outline-variant">
        <div className="w-[92%] max-w-[1500px] mx-auto">
          <div className="max-w-3xl mb-12 text-left">
            <h2 className="font-serif text-3xl sm:text-5xl font-medium text-charcoal tracking-tight text-balance">
              Two perspectives. One continuous source of truth.
            </h2>
            <p className="text-base text-charcoal-muted mt-3 font-normal text-pretty">
              Switch between the patient-friendly daily journal and the clinician’s structured diagnostic dossier.
            </p>

            {/* Perspective Switcher */}
            <div className="inline-flex items-center gap-1.5 p-1 bg-white rounded-2xl border border-outline-variant shadow-warm-sm mt-6">
              <button
                type="button"
                onClick={() => setPerspective('patient')}
                className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  perspective === 'patient'
                    ? 'bg-sage-dark text-cream shadow-warm-sm'
                    : 'text-charcoal-muted hover:text-charcoal'
                }`}
              >
                Patient View (Daily Diary)
              </button>
              <button
                type="button"
                onClick={() => setPerspective('doctor')}
                className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  perspective === 'doctor'
                    ? 'bg-teal-dark text-cream shadow-warm-sm'
                    : 'text-charcoal-muted hover:text-charcoal'
                }`}
              >
                Doctor View (Clinical Dossier)
              </button>
            </div>
          </div>

          {/* Perspective Container */}
          <div className="bg-gradient-to-b from-cream via-white to-oat-light/30 rounded-3xl border border-outline-variant shadow-warm-md p-6 sm:p-10">
            {perspective === 'patient' ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-outline-variant">
                  <div>
                    <h3 className="font-serif text-xl font-semibold text-charcoal">
                      Your Personal Health Log
                    </h3>
                    <p className="text-xs text-charcoal-muted">
                      Calm, gentle terminology focused on how you actually felt.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-sage-soft text-sage-dark text-xs font-semibold">
                    Elena’s Private Portal
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-outline-variant border-y border-outline-variant py-2">
                  <div className="p-4">
                    <span className="text-xs text-charcoal-muted font-medium">How you slept</span>
                    <p className="text-base font-semibold text-charcoal mt-1">
                      7 hours (woke up once warm)
                    </p>
                  </div>
                  <div className="p-4">
                    <span className="text-xs text-charcoal-muted font-medium">Hot flashes</span>
                    <p className="text-base font-semibold text-charcoal mt-1">
                      2 mild episodes during the day
                    </p>
                  </div>
                  <div className="p-4">
                    <span className="text-xs text-charcoal-muted font-medium">Mood & focus</span>
                    <p className="text-base font-semibold text-charcoal mt-1">
                      Clear head, slight 3 PM fatigue
                    </p>
                  </div>
                </div>

                <div className="p-4 border-l-2 border-sage bg-oat-light/40 text-xs text-sage-dark font-medium">
                  💡 <strong>Daily insight:</strong> You’ve had 4 consecutive nights with unbroken rest. Sleep consistency is up 35% compared to last month.
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-outline-variant">
                  <div>
                    <h3 className="font-serif text-xl font-semibold text-teal-dark flex items-center gap-2">
                      <Stethoscope className="w-5 h-5 text-teal" />
                      Physician Clinical Dossier (Dr. Elena Vance)
                    </h3>
                    <p className="text-xs text-charcoal-muted">
                      Structured for 15-minute consultation review and EHR charting.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-teal-soft text-teal-dark text-xs font-semibold">
                    ICD-10 / STRAW+10 Aligned
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-outline-variant border-y border-outline-variant py-2">
                  <div className="p-4">
                    <span className="text-xs text-charcoal-muted font-semibold uppercase tracking-wider">
                      Composite MRS Score
                    </span>
                    <p className="text-2xl font-serif font-bold text-charcoal mt-1">
                      14 <span className="text-xs text-charcoal-muted font-normal">/ 44 (Mild/Mod)</span>
                    </p>
                  </div>
                  <div className="p-4">
                    <span className="text-xs text-charcoal-muted font-semibold uppercase tracking-wider">
                      Vasomotor Domain
                    </span>
                    <p className="text-2xl font-serif font-bold text-[#8C371D] mt-1">
                      4 <span className="text-xs text-charcoal-muted font-normal">/ 16 (-28% vs baseline)</span>
                    </p>
                  </div>
                  <div className="p-4">
                    <span className="text-xs text-charcoal-muted font-semibold uppercase tracking-wider">
                      Clinical Staging
                    </span>
                    <p className="text-base font-bold text-teal-dark mt-1">
                      Late Perimenopause (-1)
                    </p>
                  </div>
                </div>

                <div className="p-4 border-l-2 border-teal-dark bg-teal-soft/40 text-xs text-teal-dark font-medium flex items-center justify-between">
                  <span>
                    📋 <strong>Ready for EHR export:</strong> 30-day longitudinal report verified with complete symptom domain scoring.
                  </span>
                  {onQuickDemoLogin && (
                    <button
                      type="button"
                      onClick={handleDoctorDemo}
                      className="px-3 py-1.5 rounded-lg bg-teal-dark hover:bg-charcoal text-cream font-semibold text-xs shadow-warm-sm transition-all"
                    >
                      Open Doctor Portal
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: HOW MENOCARE WORKS ("How it works", #how-it-works)
          ========================================================================= */}
      <section id="how-it-works" className="py-20 lg:py-28 w-[92%] max-w-[1500px] mx-auto">
        <div className="max-w-3xl mb-12 text-left">
          <h2 className="font-serif text-3xl sm:text-5xl font-medium text-charcoal tracking-tight text-balance">
            From your first evening check-in to your next doctor visit.
          </h2>
          <p className="text-base text-charcoal-muted mt-3 font-normal text-pretty">
            MenoCare turns daily health awareness into collaborative, evidence-based medical care.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl bg-gradient-to-b from-cream to-sage-soft/30 border border-outline-variant shadow-warm-sm">
            <span className="text-3xl font-serif font-bold text-sage mb-4 block">01</span>
            <h3 className="font-serif text-lg font-semibold text-charcoal mb-2">
              Baseline Assessment
            </h3>
            <p className="text-xs text-charcoal-muted leading-relaxed font-normal">
              A gentle 3-minute initial check-in maps your cycle history, current symptom clusters, and baseline Menopause Rating Scale.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-gradient-to-b from-cream to-teal-soft/30 border border-outline-variant shadow-warm-sm">
            <span className="text-3xl font-serif font-bold text-teal mb-4 block">02</span>
            <h3 className="font-serif text-lg font-semibold text-charcoal mb-2">
              60-Second Daily Log
            </h3>
            <p className="text-xs text-charcoal-muted leading-relaxed font-normal">
              Check in each evening using intuitive sliders. Log sleep awakenings, hot flash frequency, and emotional rhythm without fuss.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-gradient-to-b from-cream to-peach-soft/30 border border-outline-variant shadow-warm-sm">
            <span className="text-3xl font-serif font-bold text-[#8C371D] mb-4 block">03</span>
            <h3 className="font-serif text-lg font-semibold text-charcoal mb-2">
              Automated Synthesis
            </h3>
            <p className="text-xs text-charcoal-muted leading-relaxed font-normal">
              Our pattern engine correlates symptoms with lifestyle triggers, generating calm, plain-language insights on your dashboard.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-gradient-to-b from-cream to-lavender-soft/40 border border-outline-variant shadow-warm-sm">
            <span className="text-3xl font-serif font-bold text-[#654B7C] mb-4 block">04</span>
            <h3 className="font-serif text-lg font-semibold text-charcoal mb-2">
              Shared Care Review
            </h3>
            <p className="text-xs text-charcoal-muted leading-relaxed font-normal">
              Export a concise, standardized clinical dossier directly for your doctor so you arrive prepared with real data.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 8: TRUST & VALIDATED SCIENCE
          ========================================================================= */}
      <section className="py-20 lg:py-28 bg-oat-light/60 border-y border-outline-variant">
        <div className="w-[92%] max-w-[1500px] mx-auto">
          <div className="max-w-3xl mb-12 text-left">
            <h2 className="font-serif text-3xl sm:text-5xl font-medium text-charcoal tracking-tight text-balance">
              Ground truth science. Absolute data privacy.
            </h2>
            <p className="text-base text-charcoal-muted mt-3 font-normal text-pretty">
              We never sell your sensitive health data. We never display third-party advertisements. Everything is built on peer-reviewed clinical research.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-cream border border-outline-variant shadow-warm-sm hover:bg-white transition-colors">
              <Shield className="w-8 h-8 text-sage mb-4" />
              <h3 className="font-serif font-semibold text-base text-charcoal mb-1">
                Zero Data Monetization
              </h3>
              <p className="text-xs text-charcoal-muted leading-relaxed font-normal">
                Your symptom records are private and encrypted. We do not sell data to insurers, data brokers, or advertisers.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-cream border border-outline-variant shadow-warm-sm hover:bg-white transition-colors">
              <FileText className="w-8 h-8 text-teal mb-4" />
              <h3 className="font-serif font-semibold text-base text-charcoal mb-1">
                Validated MRS Scale
              </h3>
              <p className="text-xs text-charcoal-muted leading-relaxed font-normal">
                Built on the internationally recognized Menopause Rating Scale, measuring somatic, psychological, and urogenital domains.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-cream border border-outline-variant shadow-warm-sm hover:bg-white transition-colors">
              <Calendar className="w-8 h-8 text-[#8C371D] mb-4" />
              <h3 className="font-serif font-semibold text-base text-charcoal mb-1">
                STRAW+10 Criteria
              </h3>
              <p className="text-xs text-charcoal-muted leading-relaxed font-normal">
                Grounded in the Stages of Reproductive Aging Workshop criteria, helping differentiate perimenopause from postmenopause.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-cream border border-outline-variant shadow-warm-sm hover:bg-white transition-colors">
              <Lock className="w-8 h-8 text-charcoal mb-4" />
              <h3 className="font-serif font-semibold text-base text-charcoal mb-1">
                Client-Controlled Access
              </h3>
              <p className="text-xs text-charcoal-muted leading-relaxed font-normal">
                You decide who sees your records. Generate one-time secure links or download clinical summaries for in-person consultations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 9: PRESERVED WARM ESPRESSO CLOSING FINALE & RICH FOOTER
          ========================================================================= */}
      <section className="bg-espresso text-espresso-text py-24 lg:py-32 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-sage-forest/15 rounded-full blur-[140px] pointer-events-none"
          aria-hidden="true"
        />

        <div className="w-[92%] max-w-[1200px] mx-auto text-center space-y-8 relative z-10">
          <h2 className="font-serif text-4xl sm:text-6xl font-medium tracking-tight text-balance text-espresso-text leading-[1.1]">
            Your body isn’t failing. <br className="hidden sm:inline" />
            It’s transitioning. <br />
            <span className="text-sage-accent font-normal">Understand the story it’s telling.</span>
          </h2>

          <p className="text-base sm:text-lg text-espresso-muted max-w-2xl mx-auto font-normal leading-relaxed text-pretty">
            Take control of your menopause transition with dignified, clinical-grade clarity.
            Get started in under two minutes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              type="button"
              onClick={handleStart}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-sage-forest hover:bg-sage-forest/80 text-espresso-text font-semibold text-base border border-sage-accent/30 shadow-warm-lg transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              Start Free Health Diary
              <ArrowRight className="w-4 h-4 text-sage-accent" />
            </button>

            {onQuickDemoLogin && (
              <button
                type="button"
                onClick={handlePatientDemo}
                className="w-full sm:w-auto px-7 py-4 rounded-xl bg-espresso-surface hover:bg-espresso-surface-light text-espresso-text font-semibold text-base border border-espresso-border transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                Explore Demo First
              </button>
            )}
          </div>
        </div>

        {/* Global Editorial Footer */}
        <div className="w-[92%] max-w-[1500px] mx-auto mt-24 pt-12 border-t border-espresso-border grid grid-cols-1 md:grid-cols-12 gap-8 text-xs text-espresso-muted">
          <div className="md:col-span-5 space-y-3">
            <span className="font-serif font-semibold text-xl text-espresso-text flex items-center gap-2">
              MenoCare
              <span className="w-1.5 h-1.5 rounded-full bg-sage-accent inline-block" />
            </span>
            <p className="text-xs text-espresso-muted leading-relaxed max-w-sm">
              MenoCare is a clinical health intelligence platform designed to empower women and healthcare providers with structured longitudinal symptom clarity.
            </p>
            <p className="text-xs text-espresso-muted">
              Disclaimer: MenoCare is an informational tool and does not provide formal medical diagnoses. Always consult a qualified healthcare professional.
            </p>
          </div>

          <div className="md:col-span-2 space-y-2">
            <span className="font-semibold text-espresso-text text-xs block mb-3 uppercase tracking-wider">
              Navigation
            </span>
            <p><a href="#how-it-works" className="hover:text-espresso-text transition-colors">How it works</a></p>
            <p><a href="#your-experience" className="hover:text-espresso-text transition-colors">Your experience</a></p>
            <p><a href="#providers" className="hover:text-espresso-text transition-colors">For healthcare providers</a></p>
            <p><a href="#approach" className="hover:text-espresso-text transition-colors">Our approach</a></p>
          </div>

          <div className="md:col-span-2 space-y-2">
            <span className="font-semibold text-espresso-text text-xs block mb-3 uppercase tracking-wider">
              Clinical Models
            </span>
            <p><a href="#approach" className="hover:text-espresso-text transition-colors">MRS Validation</a></p>
            <p><a href="#approach" className="hover:text-espresso-text transition-colors">STRAW+10 Framework</a></p>
            <p><a href="#approach" className="hover:text-espresso-text transition-colors">Vasomotor Clustering</a></p>
            <p><a href="#approach" className="hover:text-espresso-text transition-colors">Privacy Architecture</a></p>
          </div>

          <div className="md:col-span-3 space-y-3">
            <span className="font-semibold text-espresso-text text-xs block mb-1 uppercase tracking-wider">
              Clinical Demo Access
            </span>
            <p className="text-xs text-espresso-muted">
              Instantly review the application using pre-configured test profiles:
            </p>
            {onQuickDemoLogin && (
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handlePatientDemo}
                  className="px-3 py-1.5 rounded-lg bg-espresso-surface hover:bg-espresso-surface-light text-espresso-text font-semibold text-xs border border-espresso-border transition-all"
                >
                  Elena (Patient)
                </button>
                <button
                  type="button"
                  onClick={handleDoctorDemo}
                  className="px-3 py-1.5 rounded-lg bg-espresso-surface hover:bg-espresso-surface-light text-sage-accent font-semibold text-xs border border-espresso-border transition-all"
                >
                  Dr. Vance (Doctor)
                </button>
              </div>
            )}
            <p className="text-xs text-espresso-muted pt-2">
              © {new Date().getFullYear()} MenoCare Health. All rights reserved.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
