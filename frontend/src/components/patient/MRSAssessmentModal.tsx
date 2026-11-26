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
  // Domain 1: Physical Symptoms
  {
    code: 'mrs_1',
    domain: 'somato_vegetative',
    domainTitle: 'Physical Symptoms',
    title: '1. Hot flashes and sweating',
    description: 'Sudden waves of heat across your face, neck, or chest, sweating episodes, or sudden chills.',
  },
  {
    code: 'mrs_2',
    domain: 'somato_vegetative',
    domainTitle: 'Physical Symptoms',
    title: '2. Heart fluttering or racing',
    description: 'Feeling your heart beating rapidly, pounding, fluttering, or skipping a beat unexpectedly.',
  },
  {
    code: 'mrs_3',
    domain: 'somato_vegetative',
    domainTitle: 'Physical Symptoms',
    title: '3. Sleep problems',
    description: 'Trouble falling asleep, waking up frequently during the night, or waking up feeling unrefreshed.',
  },
  {
    code: 'mrs_11',
    domain: 'somato_vegetative',
    domainTitle: 'Physical Symptoms',
    title: '4. Joint and muscle stiffness',
    description: 'Aching, stiffness, or discomfort in your joints (knees, fingers, shoulders) or muscle soreness.',
  },

  // Domain 2: Emotional Wellbeing
  {
    code: 'mrs_4',
    domain: 'psychological',
    domainTitle: 'Emotional Wellbeing',
    title: '5. Feeling down or sad',
    description: 'Feeling unusually low, sad, on the verge of tears, lacking motivation, or emotionally flat.',
  },
  {
    code: 'mrs_5',
    domain: 'psychological',
    domainTitle: 'Emotional Wellbeing',
    title: '6. Irritability and tension',
    description: 'Feeling unusually short-tempered, impatient, nervous, hurried, or easily frustrated.',
  },
  {
    code: 'mrs_6',
    domain: 'psychological',
    domainTitle: 'Emotional Wellbeing',
    title: '7. Anxiety and worry',
    description: 'Inner restlessness, feeling on edge, or experiencing sudden waves of worry or nervousness.',
  },
  {
    code: 'mrs_7',
    domain: 'psychological',
    domainTitle: 'Emotional Wellbeing',
    title: '8. Fatigue and brain fog',
    description: 'Feeling mentally exhausted, forgetful, physically drained, or having unusually low stamina.',
  },

  // Domain 3: Bladder & Intimate Health
  {
    code: 'mrs_8',
    domain: 'urogenital',
    domainTitle: 'Bladder & Intimate Health',
    title: '9. Changes in sexual comfort',
    description: 'Changes in sexual desire, natural lubrication, or comfort during intimacy.',
  },
  {
    code: 'mrs_9',
    domain: 'urogenital',
    domainTitle: 'Bladder & Intimate Health',
    title: '10. Bladder urgency or changes',
    description: 'Needing to pee more urgently or often, waking at night to pee, or accidental bladder leaks.',
  },
  {
    code: 'mrs_10',
    domain: 'urogenital',
    domainTitle: 'Bladder & Intimate Health',
    title: '11. Vaginal dryness or irritation',
    description: 'Feelings of vaginal dryness, stinging, burning, itching, or pain during intimacy.',
  },
];

const SEVERITY_SCALE = [
  { value: 0, label: 'None', desc: 'Not experienced' },
  { value: 1, label: 'Mild', desc: 'Rare or mild' },
  { value: 2, label: 'Moderate', desc: 'Noticeable regularly' },
  { value: 3, label: 'Severe', desc: 'Disrupts daily routine' },
  { value: 4, label: 'Very Severe', desc: 'Very intense burden' },
];

export const MRSAssessmentModal: React.FC<MRSAssessmentModalProps> = ({
  isOpen,
  onClose,
  onCompleted,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1); // 1 = Physical, 2 = Emotional, 3 = Intimate, 4 = Review
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
    if (total <= 4) return { label: 'Minimal / Mild Symptoms', color: 'text-sage-dark bg-sage-soft border-sage/30' };
    if (total <= 8) return { label: 'Mild Symptoms', color: 'text-sage-dark bg-sage-soft border-sage/30' };
    if (total <= 16) return { label: 'Moderate Symptoms', color: 'text-[#B07D38] bg-sand-soft border-sand/40' };
    return { label: 'Significant Symptoms', color: 'text-error bg-error-container border-error/30' };
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
      alert(err.message || 'Failed to submit symptom assessment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-cream rounded-2xl max-w-3xl w-full border border-[#E2DBD0] shadow-warm-lg overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-ivory border-b border-[#E2DBD0] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sage-soft text-sage-dark flex items-center justify-center">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <span className="font-serif text-xl font-semibold text-charcoal">
                Menopause Symptom Assessment
              </span>
              <p className="text-xs text-charcoal-muted mt-0.5">
                Standard health assessment to understand how symptoms have affected you over the past month.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-cream hover:bg-oat-light border border-[#E2DBD0] text-charcoal-muted hover:text-charcoal flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Navigation Ribbon */}
        <div className="px-6 py-3 bg-oat-light/60 border-b border-[#E2DBD0] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            {[
              { step: 1, label: 'Physical' },
              { step: 2, label: 'Emotional' },
              { step: 3, label: 'Intimate Health' },
              { step: 4, label: 'Summary' },
            ].map((s) => (
              <button
                type="button"
                key={s.step}
                onClick={() => (currentStep < 4 ? setCurrentStep(s.step) : null)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-colors ${
                  currentStep === s.step
                    ? 'bg-sage-dark text-white font-medium'
                    : currentStep > s.step
                    ? 'bg-sage-soft text-sage-dark font-medium'
                    : 'text-charcoal-muted bg-cream border border-[#E2DBD0]'
                }`}
              >
                <span>{s.step}.</span>
                <span>{s.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs text-charcoal-muted font-medium">
            <span>Score: <strong className="text-charcoal font-semibold">{totalScore} / 44</strong></span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {currentStep <= 3 ? (
            <div className="space-y-5">
              <div className="border-b border-[#E2DBD0]/70 pb-3">
                <h3 className="font-serif text-lg font-semibold text-charcoal">
                  {currentStep === 1
                    ? 'Part 1: Physical Symptoms & Discomfort'
                    : currentStep === 2
                    ? 'Part 2: Emotional Wellbeing & Energy'
                    : 'Part 3: Bladder & Intimate Health'}
                </h3>
                <p className="text-xs text-charcoal-muted mt-0.5">
                  Rate how noticeable each symptom was over the past 30 days (0 = None to 4 = Very Severe).
                </p>
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                {currentQuestions.map((q) => {
                  const currentScore = scores[q.code] || 0;
                  return (
                    <div
                      key={q.code}
                      className="p-4 bg-white rounded-xl border border-[#E2DBD0] space-y-3"
                    >
                      <div>
                        <h4 className="text-sm font-semibold text-charcoal">{q.title}</h4>
                        <p className="text-xs text-charcoal-muted mt-0.5 text-pretty">{q.description}</p>
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
                              className={`p-2.5 rounded-lg text-center border transition-colors ${
                                isSelected
                                  ? 'bg-sage-soft border-sage-dark text-sage-dark font-semibold'
                                  : 'bg-ivory border-[#E2DBD0] text-charcoal-muted hover:border-sage'
                              }`}
                            >
                              <span className="block text-xs font-medium">{s.label}</span>
                              <span className="text-xs text-charcoal-muted block mt-0.5">
                                {s.value}
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
            /* Step 4: Summary Screen */
            <div className="space-y-6 text-center py-4">
              <div className="w-12 h-12 rounded-full bg-sage-soft text-sage-dark flex items-center justify-center mx-auto">
                <Award className="w-6 h-6" />
              </div>

              <div className="space-y-2">
                <h3 className="font-serif text-2xl font-semibold text-charcoal">
                  Your Assessment is Complete
                </h3>
                <p className="text-sm text-charcoal-muted max-w-md mx-auto text-pretty">
                  Your answers have been securely saved to your health profile and organized for your next consultation with your doctor.
                </p>
              </div>

              {/* Domain Breakdown Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto text-left">
                <div className="p-3.5 bg-white rounded-xl border border-[#E2DBD0]">
                  <span className="text-xs font-medium text-charcoal-muted">Physical Symptoms</span>
                  <p className="font-serif text-2xl font-semibold text-sage-dark mt-1">{somaticScore} / 16</p>
                </div>
                <div className="p-3.5 bg-white rounded-xl border border-[#E2DBD0]">
                  <span className="text-xs font-medium text-charcoal-muted">Emotional Wellbeing</span>
                  <p className="font-serif text-2xl font-semibold text-teal mt-1">{psychScore} / 16</p>
                </div>
                <div className="p-3.5 bg-white rounded-xl border border-[#E2DBD0]">
                  <span className="text-xs font-medium text-charcoal-muted">Intimate Health</span>
                  <p className="font-serif text-2xl font-semibold text-peach mt-1">{uroScore} / 12</p>
                </div>
              </div>

              {/* Composite Severity Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#E2DBD0] bg-white text-xs font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-sage-dark" />
                <span>Overall Symptom Score: <strong>{totalScore} / 44</strong> ({getSeverityBadge(totalScore).label})</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 sm:p-5 bg-ivory border-t border-[#E2DBD0] flex items-center justify-between shrink-0">
          {currentStep > 1 && currentStep <= 3 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-4 py-2 rounded-xl border border-[#E2DBD0] bg-cream text-charcoal-muted hover:text-charcoal text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Previous Section
            </button>
          ) : (
            <div />
          )}

          {currentStep < 3 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep + 1)}
              className="px-5 py-2.5 rounded-xl bg-sage-dark hover:bg-[#3E5437] text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              Next Section
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : currentStep === 3 ? (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="px-6 py-2.5 rounded-xl bg-sage-dark hover:bg-[#3E5437] text-white text-xs font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Saving Assessment...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Assessment</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-sage-dark hover:bg-[#3E5437] text-white text-xs font-medium transition-colors"
            >
              Return to Dashboard
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
