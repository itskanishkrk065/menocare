import React, { useState } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HeartPulse,
  Activity,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { api } from '../../api/client';

interface MRSAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleted?: () => void;
}

interface MRSQuestion {
  code: string;
  domain: 'somato_vegetative' | 'psychological' | 'urogenital';
  domainTitle: string;
  title: string;
  description: string;
}

const MRS_ITEMS: MRSQuestion[] = [
  // Domain 1: Somato-Vegetative
  {
    code: 'mrs_1',
    domain: 'somato_vegetative',
    domainTitle: 'Domain 1: Somatovegetative Symptoms',
    title: '1. Hot flashes & sweating episodes',
    description: 'Sudden episodes of thoracic or facial warmth, sweating, or cold clamminess.',
  },
  {
    code: 'mrs_2',
    domain: 'somato_vegetative',
    domainTitle: 'Domain 1: Somatovegetative Symptoms',
    title: '2. Cardiac sensations & discomfort',
    description: 'Unusual awareness of heart beat, racing pulses, palpitations, or skipped beats.',
  },
  {
    code: 'mrs_3',
    domain: 'somato_vegetative',
    domainTitle: 'Domain 1: Somatovegetative Symptoms',
    title: '3. Sleep disturbances',
    description: 'Difficulty falling asleep, frequent nocturnal awakenings, or unrefreshing sleep.',
  },
  {
    code: 'mrs_11',
    domain: 'somato_vegetative',
    domainTitle: 'Domain 1: Somatovegetative Symptoms',
    title: '4. Joint and muscular discomfort',
    description: 'Aching in knees, fingers, stiffness in shoulders, or migratory rheumatic sensations.',
  },

  // Domain 2: Psychological
  {
    code: 'mrs_4',
    domain: 'psychological',
    domainTitle: 'Domain 2: Psychological Affect & Cognition',
    title: '5. Depressive affect',
    description: 'Feeling low, sad, lack of motivation, tearfulness, or flat emotional affect.',
  },
  {
    code: 'mrs_5',
    domain: 'psychological',
    domainTitle: 'Domain 2: Psychological Affect & Cognition',
    title: '6. Irritability & nervous tension',
    description: 'Short temper, aggressive impulses, feeling hurried, or easily provoked.',
  },
  {
    code: 'mrs_6',
    domain: 'psychological',
    domainTitle: 'Domain 2: Psychological Affect & Cognition',
    title: '7. Anxiety & panic episodes',
    description: 'Internal restlessness, unexplained foreboding, or physiological panic sensations.',
  },
  {
    code: 'mrs_7',
    domain: 'psychological',
    domainTitle: 'Domain 2: Psychological Affect & Cognition',
    title: '8. Physical and mental exhaustion',
    description: 'Brain fog, word retrieval difficulty, memory decline, or profound stamina deficit.',
  },

  // Domain 3: Urogenital
  {
    code: 'mrs_8',
    domain: 'urogenital',
    domainTitle: 'Domain 3: Urogenital Health',
    title: '9. Sexual health changes',
    description: 'Changes in libido, lubrication latency, or decreased intimacy satisfaction.',
  },
  {
    code: 'mrs_9',
    domain: 'urogenital',
    domainTitle: 'Domain 3: Urogenital Health',
    title: '10. Bladder and urinary urgency',
    description: 'Urgency, nocturia, micro-incontinence upon coughing/sneezing, or dysuria.',
  },
  {
    code: 'mrs_10',
    domain: 'urogenital',
    domainTitle: 'Domain 3: Urogenital Health',
    title: '11. Vaginal dryness & mucosal burning',
    description: 'Sensation of vaginal tightness, burning, stinging, or dyspareunia (pain with intercourse).',
  },
];

const SEVERITY_SCALE = [
  { value: 0, label: 'None', desc: 'No symptoms present' },
  { value: 1, label: 'Mild', desc: 'Rare or mild inconvenience' },
  { value: 2, label: 'Moderate', desc: 'Regular, noticeable burden' },
  { value: 3, label: 'Severe', desc: 'Significantly impairs quality of life' },
  { value: 4, label: 'Very Severe', desc: 'Devastating, almost unbearable' },
];

export const MRSAssessmentModal: React.FC<MRSAssessmentModalProps> = ({
  isOpen,
  onClose,
  onCompleted,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1); // 1 = Somatic, 2 = Psych, 3 = Uro, 4 = Review
  const [scores, setScores] = useState<Record<string, number>>({
    mrs_1: 2,
    mrs_2: 1,
    mrs_3: 2,
    mrs_4: 1,
    mrs_5: 1,
    mrs_6: 1,
    mrs_7: 2,
    mrs_8: 1,
    mrs_9: 0,
    mrs_10: 1,
    mrs_11: 1,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleScoreChange = (code: string, val: number) => {
    setScores((prev) => ({ ...prev, [code]: val }));
  };

  // Subscore math
  let somaticScore = 0;
  let psychScore = 0;
  let uroScore = 0;

  MRS_ITEMS.forEach((item) => {
    const val = scores[item.code] || 0;
    if (item.domain === 'somato_vegetative') somaticScore += val;
    else if (item.domain === 'psychological') psychScore += val;
    else if (item.domain === 'urogenital') uroScore += val;
  });

  const totalScore = somaticScore + psychScore + uroScore;

  const getSeverityBadge = (total: number) => {
    if (total <= 4) return { label: 'No/Little Symptoms', color: 'text-sage-dark bg-sage-soft border-sage/30' };
    if (total <= 8) return { label: 'Mild Burden', color: 'text-sage-dark bg-sage-soft border-sage/30' };
    if (total <= 16) return { label: 'Moderate Menopause Impact', color: 'text-amber-800 bg-sand-soft border-sand/40' };
    return { label: 'Severe Clinical Burden', color: 'text-error bg-error-container border-error/30' };
  };

  const currentQuestions = MRS_ITEMS.filter((item) => {
    if (currentStep === 1) return item.domain === 'somato_vegetative';
    if (currentStep === 2) return item.domain === 'psychological';
    if (currentStep === 3) return item.domain === 'urogenital';
    return true;
  });

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await api.submitBaselineMRS({
        responses: scores,
        cycle_length_variation_days: 14,
        amenorrhea_days: 30,
        is_bilateral_oophorectomy: false,
      });
      setResult(res);
      if (onCompleted) onCompleted();
      setCurrentStep(4);
    } catch (err: any) {
      alert(err.message || 'Failed to submit MRS assessment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-cream rounded-[26px] max-w-3xl w-full border border-[#E2DBD0] shadow-warm-lg overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-ivory border-b border-[#E2DBD0] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sage to-teal flex items-center justify-center text-cream shadow-warm-sm">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <span className="font-serif text-xl font-semibold text-charcoal">
                Menopause Rating Scale (MRS) Validated Assessment
              </span>
              <p className="text-xs text-charcoal-muted mt-0.5">
                Standardized Heinemann clinical instrument with 11 domain metrics.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-cream hover:bg-oat-light border border-[#E2DBD0] text-charcoal-muted hover:text-charcoal flex items-center justify-center transition-all shadow-warm-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Step Tracker & Domain Telemetry Ribbon */}
        <div className="px-6 py-3 bg-oat-light/70 border-b border-[#E2DBD0] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            {[
              { step: 1, label: 'Somatovegetative' },
              { step: 2, label: 'Psychological' },
              { step: 3, label: 'Urogenital' },
              { step: 4, label: 'Clinical Review' },
            ].map((s) => (
              <button
                type="button"
                key={s.step}
                onClick={() => (currentStep < 4 ? setCurrentStep(s.step) : null)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all ${
                  currentStep === s.step
                    ? 'bg-sage-dark text-cream font-semibold shadow-warm-sm'
                    : currentStep > s.step
                    ? 'bg-sage-soft text-sage-dark font-medium'
                    : 'text-charcoal-light bg-cream border border-[#E2DBD0]'
                }`}
              >
                <span>{s.step}.</span>
                <span>{s.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 text-[11px] font-semibold text-charcoal-muted">
            <span>Live Total: <strong className="text-charcoal font-bold text-xs">{totalScore} / 44</strong></span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {currentStep <= 3 ? (
            <div className="space-y-5">
              <div className="border-b border-[#E2DBD0]/70 pb-3">
                <h3 className="font-serif text-lg font-semibold text-charcoal">
                  {currentStep === 1
                    ? 'Domain 1: Vasomotor & Somatovegetative Symptoms'
                    : currentStep === 2
                    ? 'Domain 2: Mood, Affect & Psychological Symptoms'
                    : 'Domain 3: Urogenital & Pelvic Mucosal Symptoms'}
                </h3>
                <p className="text-xs text-charcoal-muted mt-0.5">
                  Select the level of impairment or discomfort experienced over the past 30 days.
                </p>
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                {currentQuestions.map((q) => {
                  const currentScore = scores[q.code] || 0;
                  return (
                    <div
                      key={q.code}
                      className="p-4 bg-white rounded-2xl border border-[#E2DBD0] shadow-warm-sm space-y-3"
                    >
                      <div>
                        <h4 className="text-xs font-semibold text-charcoal">{q.title}</h4>
                        <p className="text-[11px] text-charcoal-muted mt-0.5">{q.description}</p>
                      </div>

                      {/* 5-Level Scale Selector */}
                      <div className="grid grid-cols-5 gap-2 pt-1">
                        {SEVERITY_SCALE.map((s) => {
                          const isSelected = currentScore === s.value;
                          return (
                            <button
                              type="button"
                              key={s.value}
                              onClick={() => handleScoreChange(q.code, s.value)}
                              className={`p-2 rounded-xl text-center border transition-all ${
                                isSelected
                                  ? 'bg-sage-soft border-sage-dark text-sage-dark font-bold shadow-warm-sm'
                                  : 'bg-ivory border-[#E2DBD0] text-charcoal-muted hover:border-sage'
                              }`}
                            >
                              <span className="block text-xs font-semibold">{s.label}</span>
                              <span className="text-[10px] text-charcoal-light font-medium block">
                                Score {s.value}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Step 4: Comprehensive Review & Result Screen */
            <div className="space-y-6 text-center py-4">
              <div className="w-14 h-14 rounded-full bg-sage-soft text-sage-dark flex items-center justify-center mx-auto shadow-warm-sm">
                <Award className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="font-serif text-2xl font-semibold text-charcoal">
                  Validated Clinical Benchmark Computed
                </h3>
                <p className="text-xs text-charcoal-muted max-w-md mx-auto">
                  Your baseline MRS scores have been recorded into your clinical EHR and synchronized with Dr. Elena Vance.
                </p>
              </div>

              {/* Domain Breakdown Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto text-left">
                <div className="p-3.5 bg-white rounded-2xl border border-[#E2DBD0] shadow-warm-sm">
                  <span className="text-[10px] font-semibold text-charcoal-light uppercase">Somatovegetative</span>
                  <p className="font-serif text-2xl font-bold text-sage-dark mt-0.5">{somaticScore} / 16</p>
                </div>
                <div className="p-3.5 bg-white rounded-2xl border border-[#E2DBD0] shadow-warm-sm">
                  <span className="text-[10px] font-semibold text-charcoal-light uppercase">Psychological</span>
                  <p className="font-serif text-2xl font-bold text-teal mt-0.5">{psychScore} / 16</p>
                </div>
                <div className="p-3.5 bg-white rounded-2xl border border-[#E2DBD0] shadow-warm-sm">
                  <span className="text-[10px] font-semibold text-charcoal-light uppercase">Urogenital</span>
                  <p className="font-serif text-2xl font-bold text-peach mt-0.5">{uroScore} / 12</p>
                </div>
              </div>

              {/* Composite Severity Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold shadow-warm-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-sage-dark" />
                <span>Total MRS Score: {totalScore} / 44 — {getSeverityBadge(totalScore).label}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-5 bg-ivory border-t border-[#E2DBD0] flex items-center justify-between shrink-0">
          {currentStep > 1 && currentStep <= 3 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-4 py-2 rounded-xl border border-[#E2DBD0] bg-cream text-charcoal-muted hover:text-charcoal text-xs font-semibold flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Previous Domain
            </button>
          ) : (
            <div />
          )}

          {currentStep < 3 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep + 1)}
              className="px-5 py-2.5 rounded-xl bg-sage-dark hover:bg-sage text-cream text-xs font-semibold shadow-warm-md flex items-center gap-1.5 transition-all"
            >
              Continue to Domain {currentStep + 1}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : currentStep === 3 ? (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sage-dark to-sage hover:to-teal text-cream text-xs font-semibold shadow-warm-md flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Computing Benchmark...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Validated MRS Benchmark</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-sage-dark hover:bg-sage text-cream text-xs font-semibold shadow-warm-md"
            >
              Done & Return to Dashboard
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
