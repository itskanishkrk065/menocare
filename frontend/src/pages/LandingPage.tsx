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
    tagColor: 'bg-espresso-surface-light text-sage-accent border-sage-accent/30',
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
    tagColor: 'bg-espresso-surface-light text-sage-accent border-sage-accent/30',
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
    tagColor: 'bg-espresso-surface-light text-sage-accent border-sage-accent/30',
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
    if (score < 10) return { label: 'Mild Impact', color: 'text-sage-accent bg-sage-forest/40 border-sage-accent/30' };
    if (score < 20) return { label: 'Moderate Symptoms', color: 'text-amber-100 bg-[#422C1D] border-amber-400/40' };
    return { label: 'Severe Impact — Clinical Review Recommended', color: 'text-rose-100 bg-[#421D24] border-rose-400/40' };
  };

  const severityMeta = getMRSSeverityLabel(calculatedMRS);

  return (
    <div className="min-h-screen bg-espresso text-espresso-text font-sans antialiased selection:bg-sage-accent/30 selection:text-espresso-text relative overflow-x-hidden">
      {/* Top ambient color glow */}
      <div
        className="absolute top-0 right-1/4 w-[800px] h-[450px] bg-sage-forest/15 rounded-full blur-[120px] pointer-events-none -z-10"
        aria-hidden="true"
      />
      <div
        className="absolute top-1/3 left-10 w-[600px] h-[400px] bg-sage-accent/5 rounded-full blur-[140px] pointer-events-none -z-10"
        aria-hidden="true"
      />

      {/* =========================================================================
          GLOBAL STICKY HEADER (Visitor-Oriented Navigation)
          ========================================================================= */}
      <header className="sticky top-0 z-50 bg-espresso/90 backdrop-blur-md border-b border-espresso-border transition-all duration-200">
        <div className="w-[92%] max-w-[1500px] mx-auto h-20 flex items-center justify-between">
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sage-forest flex items-center justify-center text-espresso-text border border-sage-accent/30 shadow-warm-sm">
              <Activity className="w-5 h-5 text-sage-accent" />
            </div>
            <div>
              <span className="font-serif font-semibold text-2xl tracking-tight text-espresso-text flex items-center gap-1.5">
                MenoCare
                <span className="w-1.5 h-1.5 rounded-full bg-sage-accent inline-block" />
              </span>
              <p className="text-xs text-espresso-muted font-medium tracking-wide">
                Clinical Health Intelligence
              </p>
            </div>
          </div>

          {/* Visitor-Oriented Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-espresso-muted" aria-label="Main Navigation">
            <a href="#how-it-works" className="hover:text-espresso-text transition-colors">
              How it works
            </a>
            <a href="#your-experience" className="hover:text-espresso-text transition-colors">
              Your experience
            </a>
            <a href="#providers" className="hover:text-espresso-text transition-colors">
              For healthcare providers
            </a>
            <a href="#approach" className="hover:text-espresso-text transition-colors">
              Our approach
            </a>
          </nav>

          {/* Demo Access & Auth CTAs */}
          <div className="flex items-center gap-3">
            {onQuickDemoLogin && (
              <div className="hidden sm:flex items-center gap-1.5 bg-espresso-surface p-1 rounded-xl border border-espresso-border text-xs">
                <span className="px-2 text-espresso-muted font-semibold">1-Click Demo:</span>
                <button
                  type="button"
                  onClick={handlePatientDemo}
                  className="px-2.5 py-1 rounded-lg bg-espresso hover:bg-espresso-surface-light text-espresso-text font-semibold border border-espresso-border transition-all active:scale-[0.98]"
                  title="Log in directly as Elena Rostova (Patient)"
                >
                  Elena (Patient)
                </button>
                <button
                  type="button"
                  onClick={handleDoctorDemo}
                  className="px-2.5 py-1 rounded-lg bg-espresso hover:bg-espresso-surface-light text-sage-accent font-semibold border border-espresso-border transition-all active:scale-[0.98]"
                  title="Log in directly as Dr. Elena Vance (Physician)"
                >
                  Dr. Vance (Doctor)
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => handleLogin()}
              className="px-4 py-2 text-sm font-semibold text-espresso-muted hover:text-espresso-text transition-colors"
            >
              Sign In
            </button>

            <button
              type="button"
              onClick={handleStart}
              className="px-5 py-2.5 rounded-xl bg-sage-forest hover:bg-sage-forest/80 text-espresso-text text-sm font-semibold border border-sage-accent/30 shadow-warm-sm transition-all duration-200 active:scale-[0.98] flex items-center gap-2"
            >
              Get Started
              <ArrowRight className="w-4 h-4 text-sage-accent" />
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          SECTION 1: THE HERO (Wide Asymmetric Split Viewport)
          ========================================================================= */}
      <section className="relative w-[92%] max-w-[1500px] mx-auto py-12 lg:py-24 min-h-[calc(100vh-5rem)] flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center w-full">
          {/* Left Column: Left-Aligned Editorial Typography & CTAs (7 cols) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="lg:col-span-6 xl:col-span-6 space-y-6 text-left"
          >
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-espresso-surface border border-espresso-border text-xs font-semibold text-sage-accent shadow-warm-sm">
              <Sparkles className="w-3.5 h-3.5 text-sage-accent" />
              <span>Validated MRS Framework & STRAW+10 Criteria</span>
            </div>

            {/* Editorial Headline */}
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-[50px] font-medium text-espresso-text tracking-tight text-balance leading-[1.12]">
              Your menopause transition. <br />
              <span className="text-sage-accent font-normal">Finally seen in high resolution.</span>
            </h1>

            {/* Supporting Copy (Comfortable line length) */}
            <p className="text-base sm:text-lg text-espresso-muted max-w-xl font-normal leading-relaxed text-pretty">
              No more isolated bad days or vague recollections during rushed 15-minute visits.
              MenoCare turns daily 60-second check-ins into validated clinical trendlines—giving you clarity today and your doctor precision tomorrow.
            </p>

            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button
                type="button"
                onClick={handleStart}
                className="px-7 py-3.5 rounded-xl bg-sage-forest hover:bg-sage-forest/80 text-espresso-text font-semibold text-base border border-sage-accent/30 shadow-warm-md hover:shadow-warm-lg transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2.5"
              >
                Start Free Health Diary
                <ArrowRight className="w-4 h-4 text-sage-accent" />
              </button>

              {onQuickDemoLogin && (
                <button
                  type="button"
                  onClick={handlePatientDemo}
                  className="px-6 py-3.5 rounded-xl bg-espresso-surface hover:bg-espresso-surface-light text-espresso-text font-semibold text-base border border-espresso-border shadow-warm-sm transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <UserCheck className="w-4 h-4 text-sage-accent" />
                  Explore Demo as Elena
                </button>
              )}
            </div>

            {/* Trust Badges */}
            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-espresso-muted font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-sage-accent" />
                Standardized MRS Scoring
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-sage-accent" />
                Zero Third-Party Ad Tracking
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-sage-accent" />
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
              className="absolute -inset-3 bg-gradient-to-tr from-sage-forest/20 to-sage-accent/10 rounded-[2.5rem] blur-2xl -z-10"
              aria-hidden="true"
            />

            {/* Product Window Frame */}
            <div className="bg-espresso-surface rounded-3xl border border-espresso-border shadow-warm-lg overflow-hidden">
              {/* Window Chrome Header */}
              <div className="px-5 py-3.5 bg-espresso/60 border-b border-espresso-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-espresso-border" />
                    <span className="w-2.5 h-2.5 rounded-full bg-espresso-border" />
                    <span className="w-2.5 h-2.5 rounded-full bg-espresso-border" />
                  </div>
                  <div className="h-4 w-[1px] bg-espresso-border mx-1" />
                  <div className="flex items-center gap-2 text-xs font-semibold text-espresso-text">
                    <Activity className="w-3.5 h-3.5 text-sage-accent" />
                    <span>Elena Rostova — Patient Clinical Overview</span>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-sage-forest/40 text-sage-accent text-xs font-semibold border border-sage-accent/30">
                  Late Perimenopause (STRAW -1)
                </span>
              </div>

              {/* Dashboard Content */}
              <div className="p-6 space-y-5">
                {/* Top Metrics Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-espresso-border border-b border-espresso-border pb-4">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-espresso-muted">
                        Menopause Rating Scale
                      </span>
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-[#422C1D] text-amber-100 border border-amber-400/40">
                        Moderate Impact
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-serif font-bold text-espresso-text">14</span>
                      <span className="text-xs text-espresso-muted font-medium">/ 44 total points</span>
                    </div>
                    <div className="w-full bg-espresso-surface h-2 rounded-full mt-3 overflow-hidden">
                      <div className="bg-sage-accent h-full rounded-full transition-all duration-500" style={{ width: '31%' }} />
                    </div>
                    <p className="text-xs text-espresso-muted mt-2">
                      Down from 19 points 4 weeks ago. Vasomotor domain improved by 28%.
                    </p>
                  </div>

                  <div className="p-4 space-y-2.5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-espresso-muted block">
                      Active Primary Clusters
                    </span>
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 text-espresso-text font-medium">
                        <Flame className="w-3.5 h-3.5 text-amber-300" />
                        Hot Flashes
                      </span>
                      <span className="font-semibold text-espresso-text">3/day (Mild)</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 text-espresso-text font-medium">
                        <Moon className="w-3.5 h-3.5 text-indigo-200" />
                        Sleep Awakenings
                      </span>
                      <span className="font-semibold text-espresso-text">1 episode / night</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 text-espresso-text font-medium">
                        <Brain className="w-3.5 h-3.5 text-sage-accent" />
                        Cognitive Focus
                      </span>
                      <span className="font-semibold text-sage-accent">Good / Clear</span>
                    </div>
                  </div>
                </div>

                {/* Recharts Longitudinal Preview on Dark Background */}
                <div className="p-2">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h2 className="font-serif font-semibold text-base text-espresso-text">
                        Vasomotor vs. Sleep Recovery (Last 30 Days)
                      </h2>
                      <p className="text-xs text-espresso-muted">
                        Inverse correlation between nocturnal flashes and restorative sleep.
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-sage-accent bg-sage-forest/40 border border-sage-accent/30 px-2.5 py-1 rounded-lg">
                      Strong Correlation
                    </span>
                  </div>

                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={TREND_DATA_30} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="heroSageDark" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#C4D4BE" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#C4D4BE" stopOpacity={0.0} />
                          </linearGradient>
                          <linearGradient id="heroAmberDark" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#E09F67" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#E09F67" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#49413B" vertical={false} />
                        <XAxis dataKey="day" stroke="#C5BDB4" fontSize={11} tickLine={false} />
                        <YAxis stroke="#C5BDB4" fontSize={11} tickLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#39332E',
                            borderColor: '#49413B',
                            borderRadius: '0.75rem',
                            color: '#F5F1EA',
                            fontSize: '12px',
                          }}
                        />
                        <Area type="monotone" dataKey="sleepQuality" stroke="#C4D4BE" strokeWidth={2} fillOpacity={1} fill="url(#heroSageDark)" name="Sleep Quality" />
                        <Area type="monotone" dataKey="hotFlashes" stroke="#E09F67" strokeWidth={2} fillOpacity={1} fill="url(#heroAmberDark)" name="Vasomotor Severity" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="pt-2 border-t border-espresso-border flex items-center justify-between text-xs text-espresso-muted">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-sage-accent" /> Sleep Index
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#E09F67]" /> Hot Flashes
                      </span>
                    </div>
                    <span className="text-espresso-text font-medium">Continuous Sync</span>
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
      <section id="your-experience" className="py-20 lg:py-28 bg-espresso-surface border-y border-espresso-border">
        <div className="w-[92%] max-w-[1500px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left Narrative (5 cols) */}
            <div className="lg:col-span-5 space-y-6 text-left">
              <h2 className="font-serif text-3xl sm:text-5xl font-medium text-espresso-text tracking-tight text-balance leading-tight">
                Menopause is not a single monolith. <br />
                <span className="text-espresso-muted font-normal">Every woman experiences a distinct rhythm.</span>
              </h2>
              <p className="text-base text-espresso-muted leading-relaxed font-normal text-pretty">
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
                        ? 'bg-espresso border-sage-accent text-espresso-text shadow-warm-sm'
                        : 'bg-espresso/40 border-espresso-border text-espresso-muted hover:text-espresso-text hover:border-espresso-muted'
                    }`}
                  >
                    <div>
                      <span className="font-semibold text-sm block">{story.name}</span>
                      <span className="text-xs text-espresso-muted">{story.stage.split('(')[0]}</span>
                    </div>
                    <ArrowRight className={`w-4 h-4 transition-transform ${activeStory === index ? 'text-sage-accent translate-x-1' : 'opacity-40'}`} />
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
                  className="bg-espresso rounded-3xl p-8 sm:p-12 border border-espresso-border shadow-warm-lg space-y-6"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-espresso-border">
                    <div>
                      <h3 className="font-serif text-2xl font-semibold text-espresso-text">
                        {STORIES[activeStory].name}
                      </h3>
                      <p className="text-xs text-espresso-muted font-medium mt-0.5">
                        {STORIES[activeStory].location}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${STORIES[activeStory].tagColor}`}>
                      {STORIES[activeStory].stage}
                    </span>
                  </div>

                  <blockquote className="font-serif text-xl sm:text-2xl text-espresso-text leading-relaxed font-normal">
                    “{STORIES[activeStory].quote}”
                  </blockquote>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-espresso-border">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-sage-forest/50 border border-sage-accent/30 flex items-center justify-center text-sage-accent">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-espresso-muted block">Observed Pattern</span>
                        <span className="text-xs font-bold text-espresso-text">{STORIES[activeStory].keyInsight}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-sage-forest/50 border border-sage-accent/30 flex items-center justify-center text-sage-accent">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-espresso-muted block">Measured Outcome</span>
                        <span className="text-xs font-bold text-sage-accent">{STORIES[activeStory].scoreReduction}</span>
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
          <div className="lg:col-span-7 bg-espresso-surface rounded-3xl p-6 sm:p-10 border border-espresso-border shadow-warm-lg space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-espresso-border">
              <div>
                <h2 className="font-serif font-semibold text-2xl text-espresso-text">
                  Test the 60-Second Daily Check-In
                </h2>
                <p className="text-xs text-espresso-muted mt-1">
                  Drag the sliders to simulate an evening log. Watch the clinical scoring respond dynamically.
                </p>
              </div>
              <span className="text-xs font-semibold text-sage-accent flex items-center gap-1.5 bg-espresso px-3 py-1.5 rounded-xl border border-espresso-border">
                <Clock className="w-3.5 h-3.5" /> 60 seconds
              </span>
            </div>

            {/* Slider 1: Hot Flashes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-espresso-text">
                  <Flame className="w-4 h-4 text-amber-300" /> Hot Flashes & Night Sweats
                </span>
                <span className="text-amber-200 font-bold">{sliderHotFlash} / 10 intensity</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={sliderHotFlash}
                onChange={(e) => setSliderHotFlash(Number(e.target.value))}
                className="w-full accent-amber-300 h-2 bg-espresso rounded-lg cursor-pointer border border-espresso-border"
              />
              <div className="flex justify-between text-xs text-espresso-muted">
                <span>None today</span>
                <span>Mild</span>
                <span>Severe episodes</span>
              </div>
            </div>

            {/* Slider 2: Sleep Quality */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-espresso-text">
                  <Moon className="w-4 h-4 text-indigo-300" /> Sleep Restfulness
                </span>
                <span className="text-indigo-200 font-bold">{sliderSleep} / 10 quality</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={sliderSleep}
                onChange={(e) => setSliderSleep(Number(e.target.value))}
                className="w-full accent-indigo-300 h-2 bg-espresso rounded-lg cursor-pointer border border-espresso-border"
              />
              <div className="flex justify-between text-xs text-espresso-muted">
                <span>Restless / Woke 3x</span>
                <span>Average</span>
                <span>Deep & Unbroken</span>
              </div>
            </div>

            {/* Slider 3: Mood & Focus */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-espresso-text">
                  <Brain className="w-4 h-4 text-sage-accent" /> Mood Stability & Energy
                </span>
                <span className="text-sage-accent font-bold">{sliderMood} / 10 stability</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={sliderMood}
                onChange={(e) => setSliderMood(Number(e.target.value))}
                className="w-full accent-sage-accent h-2 bg-espresso rounded-lg cursor-pointer border border-espresso-border"
              />
              <div className="flex justify-between text-xs text-espresso-muted">
                <span>High irritability</span>
                <span>Balanced</span>
                <span>Calm & Energetic</span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Calculated Synthesis Output (5 cols) */}
          <div className="lg:col-span-5 bg-espresso-surface rounded-3xl p-6 sm:p-10 border border-espresso-border shadow-warm-lg flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-espresso-muted">
                  Simulated Real-Time Synthesis
                </span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${severityMeta.color}`}>
                  {severityMeta.label}
                </span>
              </div>

              <div className="py-5 my-4 border-y border-espresso-border">
                <span className="text-xs text-espresso-muted font-medium block">
                  Simulated Menopause Rating Scale Score
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl font-serif font-bold text-espresso-text">
                    {calculatedMRS}
                  </span>
                  <span className="text-xs text-espresso-muted font-semibold">/ 44 points</span>
                </div>
              </div>

              {/* Dynamic Guidance Note */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-espresso-text flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-sage-accent" /> Automated Observation:
                </span>
                <div className="p-4 text-xs text-espresso-muted leading-relaxed font-normal border-l-2 border-sage-accent/50 bg-espresso/30">
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
              className="w-full py-3.5 rounded-xl bg-sage-forest hover:bg-sage-forest/80 text-espresso-text text-sm font-semibold border border-sage-accent/30 shadow-warm-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              Track Your Real Symptoms Today
              <ArrowRight className="w-4 h-4 text-sage-accent" />
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: LONGITUDINAL TRENDS & STRAW+10 ("Our approach", #approach)
          ========================================================================= */}
      <section id="approach" className="py-20 lg:py-28 bg-espresso-surface border-y border-espresso-border">
        <div className="w-[92%] max-w-[1500px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Narrative (5 cols) */}
            <div className="lg:col-span-5 space-y-6 text-left">
              <h2 className="font-serif text-3xl sm:text-5xl font-medium text-espresso-text tracking-tight text-balance leading-tight">
                Move from isolated bad days to longitudinal clarity.
              </h2>
              <p className="text-base text-espresso-muted leading-relaxed font-normal text-pretty">
                A single check-in captures how you feel tonight. But thirty check-ins reveal seasonal trends, trigger associations, and hormonal cycle shifts.
              </p>
              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-sage-forest/50 border border-sage-accent/30 text-sage-accent flex items-center justify-center font-bold text-xs mt-0.5">
                    1
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-espresso-text">STRAW+10 Reproductive Staging</h3>
                    <p className="text-xs text-espresso-muted mt-0.5">
                      Classifies whether changes align with early transition, late perimenopause, or postmenopause.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-sage-forest/50 border border-sage-accent/30 text-sage-accent flex items-center justify-center font-bold text-xs mt-0.5">
                    2
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-espresso-text">Trigger Identification</h3>
                    <p className="text-xs text-espresso-muted mt-0.5">
                      Isolate the true impact of caffeine, stress, alcohol, and evening screen time on night sweats.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-sage-forest/50 border border-sage-accent/30 text-sage-accent flex items-center justify-center font-bold text-xs mt-0.5">
                    3
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-espresso-text">Treatment Efficacy Tracking</h3>
                    <p className="text-xs text-espresso-muted mt-0.5">
                      Verify objectively if new supplements, lifestyle changes, or HRT are making a measurable difference.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Chart Showcase (7 cols) */}
            <div className="lg:col-span-7 bg-espresso rounded-3xl p-6 sm:p-10 border border-espresso-border shadow-warm-lg">
              <div className="flex items-center justify-between pb-4 border-b border-espresso-border mb-6">
                <div>
                  <h3 className="font-serif text-lg font-semibold text-espresso-text">
                    Multi-Metric Trajectory
                  </h3>
                  <p className="text-xs text-espresso-muted">
                    Elena Rostova’s symptom recovery arc
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setTrendRange('30')}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                      trendRange === '30'
                        ? 'bg-espresso text-espresso-text shadow-warm-sm border border-espresso-border'
                        : 'text-espresso-muted hover:text-espresso-text'
                    }`}
                  >
                    30 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => setTrendRange('90')}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                      trendRange === '90'
                        ? 'bg-espresso text-espresso-text shadow-warm-sm border border-espresso-border'
                        : 'text-espresso-muted hover:text-espresso-text'
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
                    <CartesianGrid strokeDasharray="3 3" stroke="#49413B" vertical={false} />
                    <XAxis
                      dataKey="day"
                      stroke="#C5BDB4"
                      fontSize={11}
                      tickLine={false}
                    />
                    <YAxis stroke="#C5BDB4" fontSize={11} tickLine={false} domain={[0, 10]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#39332E',
                        borderColor: '#49413B',
                        borderRadius: '0.75rem',
                        color: '#F5F1EA',
                        fontSize: '12px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="sleepQuality"
                      stroke="#C4D4BE"
                      strokeWidth={2}
                      fillOpacity={0.2}
                      fill="#C4D4BE"
                      name="Sleep Quality Index"
                    />
                    <Area
                      type="monotone"
                      dataKey="hotFlashes"
                      stroke="#E09F67"
                      strokeWidth={2}
                      fillOpacity={0.2}
                      fill="#E09F67"
                      name="Hot Flash Episodes"
                    />
                    <Area
                      type="monotone"
                      dataKey="moodScore"
                      stroke="#A3B89D"
                      strokeWidth={2}
                      fillOpacity={0.15}
                      fill="#A3B89D"
                      name="Mood Stability"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 pt-4 border-t border-espresso-border flex flex-wrap items-center justify-between text-xs text-espresso-muted">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-sage-accent" /> Sleep Index
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E09F67]" /> Hot Flashes
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#A3B89D]" /> Mood Stability
                  </span>
                </div>
                <span className="font-semibold text-sage-accent">
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
          <h2 className="font-serif text-3xl sm:text-5xl font-medium text-espresso-text tracking-tight text-balance">
            Designed for human beings, not medical databases.
          </h2>
          <p className="text-base text-espresso-muted mt-3 font-normal text-pretty">
            Healthcare interfaces shouldn’t feel intimidating. Every screen in MenoCare uses plain everyday language, calm dark surfaces, and considerate interactions.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-3xl bg-espresso-surface border border-espresso-border shadow-warm-sm hover:border-sage-accent/40 transition-all">
            <h3 className="font-serif text-xl font-semibold text-espresso-text mb-3 flex items-center gap-3">
              <Clock className="w-6 h-6 text-sage-accent shrink-0" />
              <span>60-Second Evening Log</span>
            </h3>
            <p className="text-sm text-espresso-muted leading-relaxed font-normal">
              No exhausting multiple-choice grids. Four intuitive sliders let you capture sleep, mood, vasomotor severity, and brain fog in under a minute.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-espresso-surface border border-espresso-border shadow-warm-sm hover:border-sage-accent/40 transition-all">
            <h3 className="font-serif text-xl font-semibold text-espresso-text mb-3 flex items-center gap-3">
              <Brain className="w-6 h-6 text-sage-accent shrink-0" />
              <span>Plain-Language Summaries</span>
            </h3>
            <p className="text-sm text-espresso-muted leading-relaxed font-normal">
              Instead of cryptic medical shorthand, your dashboard tells you simply: “Hot flashes occurred less often this week than last week.”
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-espresso-surface border border-espresso-border shadow-warm-sm hover:border-sage-accent/40 transition-all">
            <h3 className="font-serif text-xl font-semibold text-espresso-text mb-3 flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-sage-accent shrink-0" />
              <span>Trigger Correlation</span>
            </h3>
            <p className="text-sm text-espresso-muted leading-relaxed font-normal">
              Discover subtle connections between afternoon espresso, evening screen time, or daily work stress and subsequent nighttime awakenings.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: DOCTOR WORKSPACE LENS ("For healthcare providers", #providers)
          ========================================================================= */}
      <section id="providers" className="py-20 lg:py-28 bg-espresso-surface border-y border-espresso-border">
        <div className="w-[92%] max-w-[1500px] mx-auto">
          <div className="max-w-3xl mb-12 text-left">
            <h2 className="font-serif text-3xl sm:text-5xl font-medium text-espresso-text tracking-tight text-balance">
              Two perspectives. One continuous source of truth.
            </h2>
            <p className="text-base text-espresso-muted mt-3 font-normal text-pretty">
              Switch between the patient-friendly daily journal and the clinician’s structured diagnostic dossier.
            </p>

            {/* Perspective Switcher */}
            <div className="inline-flex items-center gap-1.5 p-1 bg-espresso rounded-2xl border border-espresso-border shadow-warm-sm mt-6">
              <button
                type="button"
                onClick={() => setPerspective('patient')}
                className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  perspective === 'patient'
                    ? 'bg-sage-forest text-espresso-text border border-sage-accent/30 shadow-warm-sm'
                    : 'text-espresso-muted hover:text-espresso-text'
                }`}
              >
                Patient View (Daily Diary)
              </button>
              <button
                type="button"
                onClick={() => setPerspective('doctor')}
                className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  perspective === 'doctor'
                    ? 'bg-sage-forest text-espresso-text border border-sage-accent/30 shadow-warm-sm'
                    : 'text-espresso-muted hover:text-espresso-text'
                }`}
              >
                Doctor View (Clinical Dossier)
              </button>
            </div>
          </div>

          {/* Perspective Container */}
          <div className="bg-espresso rounded-3xl border border-espresso-border shadow-warm-lg p-6 sm:p-10">
            {perspective === 'patient' ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-espresso-border">
                  <div>
                    <h3 className="font-serif text-xl font-semibold text-espresso-text">
                      Your Personal Health Log
                    </h3>
                    <p className="text-xs text-espresso-muted">
                      Calm, gentle terminology focused on how you actually felt.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-sage-forest/40 text-sage-accent text-xs font-semibold border border-sage-accent/30">
                    Elena’s Private Portal
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-espresso-border border-y border-espresso-border py-2">
                  <div className="p-4">
                    <span className="text-xs text-espresso-muted font-medium">How you slept</span>
                    <p className="text-base font-semibold text-espresso-text mt-1">
                      7 hours (woke up once warm)
                    </p>
                  </div>
                  <div className="p-4">
                    <span className="text-xs text-espresso-muted font-medium">Hot flashes</span>
                    <p className="text-base font-semibold text-espresso-text mt-1">
                      2 mild episodes during the day
                    </p>
                  </div>
                  <div className="p-4">
                    <span className="text-xs text-espresso-muted font-medium">Mood & focus</span>
                    <p className="text-base font-semibold text-espresso-text mt-1">
                      Clear head, slight 3 PM fatigue
                    </p>
                  </div>
                </div>

                <div className="p-4 border-l-2 border-sage-accent/50 bg-espresso-surface/40 text-xs text-sage-accent font-medium">
                  💡 <strong>Daily insight:</strong> You’ve had 4 consecutive nights with unbroken rest. Sleep consistency is up 35% compared to last month.
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-espresso-border">
                  <div>
                    <h3 className="font-serif text-xl font-semibold text-sage-accent flex items-center gap-2">
                      <Stethoscope className="w-5 h-5" />
                      Physician Clinical Dossier (Dr. Elena Vance)
                    </h3>
                    <p className="text-xs text-espresso-muted">
                      Structured for 15-minute consultation review and EHR charting.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-sage-forest/40 text-sage-accent text-xs font-semibold border border-sage-accent/30">
                    ICD-10 / STRAW+10 Aligned
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-espresso-border border-y border-espresso-border py-2">
                  <div className="p-4">
                    <span className="text-xs text-espresso-muted font-semibold uppercase tracking-wider">
                      Composite MRS Score
                    </span>
                    <p className="text-2xl font-serif font-bold text-espresso-text mt-1">
                      14 <span className="text-xs text-espresso-muted font-normal">/ 44 (Mild/Mod)</span>
                    </p>
                  </div>
                  <div className="p-4">
                    <span className="text-xs text-espresso-muted font-semibold uppercase tracking-wider">
                      Vasomotor Domain
                    </span>
                    <p className="text-2xl font-serif font-bold text-amber-200 mt-1">
                      4 <span className="text-xs text-espresso-muted font-normal">/ 16 (-28% vs baseline)</span>
                    </p>
                  </div>
                  <div className="p-4">
                    <span className="text-xs text-espresso-muted font-semibold uppercase tracking-wider">
                      Clinical Staging
                    </span>
                    <p className="text-base font-bold text-sage-accent mt-1">
                      Late Perimenopause (-1)
                    </p>
                  </div>
                </div>

                <div className="p-4 border-l-2 border-sage-accent/50 bg-espresso-surface/40 text-xs text-sage-accent font-medium flex items-center justify-between">
                  <span>
                    📋 <strong>Ready for EHR export:</strong> 30-day longitudinal report verified with complete symptom domain scoring.
                  </span>
                  {onQuickDemoLogin && (
                    <button
                      type="button"
                      onClick={handleDoctorDemo}
                      className="px-3 py-1.5 rounded-lg bg-sage-forest hover:bg-sage-forest/80 text-espresso-text font-semibold text-xs border border-sage-accent/30 shadow-warm-sm transition-all"
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
          <h2 className="font-serif text-3xl sm:text-5xl font-medium text-espresso-text tracking-tight text-balance">
            From your first evening check-in to your next doctor visit.
          </h2>
          <p className="text-base text-espresso-muted mt-3 font-normal text-pretty">
            MenoCare turns daily health awareness into collaborative, evidence-based medical care.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl bg-espresso-surface border border-espresso-border shadow-warm-sm">
            <span className="text-3xl font-serif font-bold text-sage-accent mb-4 block">01</span>
            <h3 className="font-serif text-lg font-semibold text-espresso-text mb-2">
              Baseline Assessment
            </h3>
            <p className="text-xs text-espresso-muted leading-relaxed font-normal">
              A gentle 3-minute initial check-in maps your cycle history, current symptom clusters, and baseline Menopause Rating Scale.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-espresso-surface border border-espresso-border shadow-warm-sm">
            <span className="text-3xl font-serif font-bold text-sage-accent mb-4 block">02</span>
            <h3 className="font-serif text-lg font-semibold text-espresso-text mb-2">
              60-Second Daily Log
            </h3>
            <p className="text-xs text-espresso-muted leading-relaxed font-normal">
              Check in each evening using intuitive sliders. Log sleep awakenings, hot flash frequency, and emotional rhythm without fuss.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-espresso-surface border border-espresso-border shadow-warm-sm">
            <span className="text-3xl font-serif font-bold text-amber-200 mb-4 block">03</span>
            <h3 className="font-serif text-lg font-semibold text-espresso-text mb-2">
              Automated Synthesis
            </h3>
            <p className="text-xs text-espresso-muted leading-relaxed font-normal">
              Our pattern engine correlates symptoms with lifestyle triggers, generating calm, plain-language insights on your dashboard.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-espresso-surface border border-espresso-border shadow-warm-sm">
            <span className="text-3xl font-serif font-bold text-indigo-200 mb-4 block">04</span>
            <h3 className="font-serif text-lg font-semibold text-espresso-text mb-2">
              Shared Care Review
            </h3>
            <p className="text-xs text-espresso-muted leading-relaxed font-normal">
              Export a concise, standardized clinical dossier directly for your doctor so you arrive prepared with real data.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 8: TRUST & VALIDATED SCIENCE
          ========================================================================= */}
      <section className="py-20 lg:py-28 bg-espresso-surface border-y border-espresso-border">
        <div className="w-[92%] max-w-[1500px] mx-auto">
          <div className="max-w-3xl mb-12 text-left">
            <h2 className="font-serif text-3xl sm:text-5xl font-medium text-espresso-text tracking-tight text-balance">
              Ground truth science. Absolute data privacy.
            </h2>
            <p className="text-base text-espresso-muted mt-3 font-normal text-pretty">
              We never sell your sensitive health data. We never display third-party advertisements. Everything is built on peer-reviewed clinical research.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-espresso border border-espresso-border shadow-warm-sm">
              <Shield className="w-8 h-8 text-sage-accent mb-4" />
              <h3 className="font-serif font-semibold text-base text-espresso-text mb-1">
                Zero Data Monetization
              </h3>
              <p className="text-xs text-espresso-muted leading-relaxed font-normal">
                Your symptom records are private and encrypted. We do not sell data to insurers, data brokers, or advertisers.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-espresso border border-espresso-border shadow-warm-sm">
              <FileText className="w-8 h-8 text-sage-accent mb-4" />
              <h3 className="font-serif font-semibold text-base text-espresso-text mb-1">
                Validated MRS Scale
              </h3>
              <p className="text-xs text-espresso-muted leading-relaxed font-normal">
                Built on the internationally recognized Menopause Rating Scale, measuring somatic, psychological, and urogenital domains.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-espresso border border-espresso-border shadow-warm-sm">
              <Calendar className="w-8 h-8 text-amber-200 mb-4" />
              <h3 className="font-serif font-semibold text-base text-espresso-text mb-1">
                STRAW+10 Criteria
              </h3>
              <p className="text-xs text-espresso-muted leading-relaxed font-normal">
                Grounded in the Stages of Reproductive Aging Workshop criteria, helping differentiate perimenopause from postmenopause.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-espresso border border-espresso-border shadow-warm-sm">
              <Lock className="w-8 h-8 text-espresso-text mb-4" />
              <h3 className="font-serif font-semibold text-base text-espresso-text mb-1">
                Client-Controlled Access
              </h3>
              <p className="text-xs text-espresso-muted leading-relaxed font-normal">
                You decide who sees your records. Generate one-time secure links or download clinical summaries for in-person consultations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 9: MEMORABLE FINALE & RICH EDITORIAL FOOTER
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
            <p className="text-xs text-espresso-muted/60">
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
            <p className="text-xs text-espresso-muted/60 pt-2">
              © {new Date().getFullYear()} MenoCare Health. All rights reserved.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
