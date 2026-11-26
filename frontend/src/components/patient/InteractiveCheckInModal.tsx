import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Flame,
  Moon,
  CloudLightning,
  Heart,
  Droplet,
  Plus,
  Minus,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Info,
  Clock,
  Activity,
} from 'lucide-react';
import { api } from '../../api/client';

interface InteractiveCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newAlerts?: any[]) => void;
}

const SYMPTOMS_CONFIG = [
  {
    code: 'VM_HF',
    name: 'Hot Flashes',
    category: 'Temperature',
    icon: Flame,
    color: 'text-amber-700 bg-peach-soft border-peach/30',
    description: 'Sudden waves of heat across your face, neck, or chest, often followed by chills.',
  },
  {
    code: 'VM_NS',
    name: 'Night Sweats',
    category: 'Sleep & Night',
    icon: Moon,
    color: 'text-teal-dark bg-teal-soft border-teal/20',
    description: 'Waking up hot and sweaty, or needing to change clothing or bedding during the night.',
  },
  {
    code: 'SL_SQ',
    name: 'Sleep Quality',
    category: 'Sleep & Rest',
    icon: Moon,
    color: 'text-charcoal bg-lavender-soft border-lavender/30',
    description: 'Trouble falling asleep, waking up frequently during the night, or waking up exhausted.',
  },
  {
    code: 'MD_MS',
    name: 'Mood & Emotional Changes',
    category: 'Emotional Health',
    icon: CloudLightning,
    color: 'text-charcoal bg-oat-light border-[#E2DBD0]',
    description: 'Feeling unusually irritable, down, tearful, impatient, or emotionally sensitive.',
  },
  {
    code: 'MD_AN',
    name: 'Anxiety & Tension',
    category: 'Emotional Health',
    icon: Heart,
    color: 'text-peach bg-peach-soft border-peach/30',
    description: 'Feeling restless, nervous, tense, heart fluttering, or having sudden waves of worry.',
  },
  {
    code: 'SO_FT',
    name: 'Fatigue & Energy Deficit',
    category: 'Physical Energy',
    icon: Sparkles,
    color: 'text-sage-dark bg-sage-soft border-sage/30',
    description: 'Feeling physically drained, heavy, sluggish, or experiencing brain fog and low stamina.',
  },
];

const INTENSITY_LEVELS = [
  { level: 0, label: 'None', desc: 'No symptoms today' },
  { level: 1, label: 'Mild', desc: 'Noticeable, but did not slow me down' },
  { level: 2, label: 'Moderate', desc: 'Bothersome, interrupted daily tasks' },
  { level: 3, label: 'Severe', desc: 'Hard to manage, stopped normal activities' },
  { level: 4, label: 'Very Severe', desc: 'Overwhelming, needed to stop and rest' },
];

export const InteractiveCheckInModal: React.FC<InteractiveCheckInModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [assessmentDate, setAssessmentDate] = useState(todayStr);

  // Intensities (0 to 4)
  const [intensities, setIntensities] = useState<Record<string, number>>({
    VM_HF: 1,
    VM_NS: 0,
    SL_SQ: 1,
    MD_MS: 0,
    MD_AN: 0,
    SO_FT: 1,
  });

  // Frequencies
  const [frequencies, setFrequencies] = useState<Record<string, number>>({
    VM_HF: 2,
    VM_NS: 0,
    SL_SQ: 0,
    MD_MS: 0,
    MD_AN: 0,
    SO_FT: 0,
  });

  // Bleeding details
  const [bleedingStatus, setBleedingStatus] = useState<
    'none' | 'spotting' | 'light' | 'normal' | 'heavy'
  >('none');
  const [durationDays, setDurationDays] = useState<number>(0);
  const [hasClots, setHasClots] = useState<boolean>(false);
  const [pelvicPain, setPelvicPain] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleIntensityChange = (code: string, val: number) => {
    setIntensities((prev) => ({ ...prev, [code]: val }));
  };

  const handleFrequencyChange = (code: string, delta: number) => {
    setFrequencies((prev) => ({
      ...prev,
      [code]: Math.max(0, (prev[code] || 0) + delta),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const responses = Object.entries(intensities).map(([code, val]) => ({
      question_code: code,
      intensity: val,
      frequency_count: frequencies[code] || 0,
      functional_impact: val > 2 ? 2 : val > 0 ? 1 : 0,
    }));

    const payload = {
      assessment_date: assessmentDate,
      responses,
      bleeding_status: bleedingStatus,
      duration_days: bleedingStatus !== 'none' ? durationDays : 0,
      has_clots: hasClots,
      pelvic_pain_intensity: pelvicPain,
      additional_symptom_notes: notes.trim() || undefined,
    };

    try {
      const res = await api.submitDailyCheckIn(payload);
      onSuccess(res?.new_alerts_triggered || []);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit check-in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-cream rounded-[26px] max-w-2xl w-full border border-[#E2DBD0] shadow-warm-lg overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-ivory border-b border-[#E2DBD0] flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sage-dark" />
              <h2 className="font-serif text-xl font-semibold text-charcoal">Your Daily Check-in</h2>
            </div>
            <p className="text-xs text-charcoal-muted mt-0.5">
              Takes about 1 minute. Helps track how your body feels and keeps your doctor informed.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-cream hover:bg-oat-light border border-[#E2DBD0] text-charcoal-muted hover:text-charcoal flex items-center justify-center transition-all shadow-warm-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-error-container border border-error/20 text-error text-xs rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-error shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Assessment Date Field */}
          <div className="flex items-center justify-between p-3.5 bg-ivory rounded-2xl border border-[#E2DBD0] shadow-warm-sm">
            <div className="flex items-center gap-2 text-xs font-semibold text-charcoal">
              <Calendar className="w-4 h-4 text-sage-dark" />
              <span>Check-In Date:</span>
            </div>
            <input
              type="date"
              value={assessmentDate}
              onChange={(e) => setAssessmentDate(e.target.value)}
              className="px-3 py-1 bg-white border border-[#E2DBD0] rounded-xl text-xs font-medium text-charcoal shadow-warm-sm"
            />
          </div>

          {/* 6 Core Symptoms */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-sage-dark flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-sage" />
              How strongly you felt these today
            </h3>

            <div className="space-y-3">
              {SYMPTOMS_CONFIG.map((symp) => {
                const Icon = symp.icon;
                const currentVal = intensities[symp.code] ?? 0;
                const currentFreq = frequencies[symp.code] ?? 0;

                return (
                  <div
                    key={symp.code}
                    className="p-4 bg-white rounded-2xl border border-[#E2DBD0] shadow-warm-sm space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${symp.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-charcoal">{symp.name}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-oat-light text-charcoal-muted font-medium">
                              {symp.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-charcoal-muted mt-0.5">{symp.description}</p>
                        </div>
                      </div>

                      {/* Frequency Stepper (For hot flashes / night sweats) */}
                      {(symp.code === 'VM_HF' || symp.code === 'VM_NS') && (
                        <div className="flex items-center gap-1 bg-ivory border border-[#E2DBD0] rounded-xl p-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleFrequencyChange(symp.code, -1)}
                            className="w-5 h-5 rounded-lg bg-cream hover:bg-oat-light text-charcoal-muted flex items-center justify-center"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-charcoal">
                            {currentFreq}x
                          </span>
                          <button
                            type="button"
                            onClick={() => handleFrequencyChange(symp.code, 1)}
                            className="w-5 h-5 rounded-lg bg-cream hover:bg-oat-light text-charcoal-muted flex items-center justify-center"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Intensity Level Pill Selectors */}
                    <div className="grid grid-cols-5 gap-1.5 pt-1">
                      {INTENSITY_LEVELS.map((lvl) => {
                        const isSelected = currentVal === lvl.level;
                        return (
                          <button
                            type="button"
                            key={lvl.level}
                            onClick={() => handleIntensityChange(symp.code, lvl.level)}
                            className={`py-1.5 px-1 rounded-xl text-center transition-all border ${
                              isSelected
                                ? 'bg-sage-soft border-sage-dark text-sage-dark font-bold shadow-warm-sm'
                                : 'bg-ivory border-[#E2DBD0] text-charcoal-muted hover:border-sage'
                            }`}
                          >
                            <span className="block text-[11px] font-semibold">{lvl.label}</span>
                            <span className="text-[9px] text-charcoal-light font-medium block">Lvl {lvl.level}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Menstrual & Bleeding Section */}
          <div className="p-4 bg-white rounded-2xl border border-[#E2DBD0] shadow-warm-sm space-y-3">
            <div className="flex items-center gap-2">
              <Droplet className="w-4 h-4 text-peach" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal">Menstrual Flow & Bleeding</h3>
            </div>

            <div className="grid grid-cols-5 gap-1.5">
              {[
                { id: 'none', label: 'None' },
                { id: 'spotting', label: 'Spotting' },
                { id: 'light', label: 'Light' },
                { id: 'normal', label: 'Moderate' },
                { id: 'heavy', label: 'Heavy/Flood' },
              ].map((flow) => (
                <button
                  type="button"
                  key={flow.id}
                  onClick={() => setBleedingStatus(flow.id as any)}
                  className={`py-2 px-1 text-xs rounded-xl font-medium border text-center transition-all ${
                    bleedingStatus === flow.id
                      ? 'bg-peach-soft border-peach text-charcoal font-bold shadow-warm-sm'
                      : 'bg-ivory border-[#E2DBD0] text-charcoal-muted hover:border-peach/50'
                  }`}
                >
                  {flow.label}
                </button>
              ))}
            </div>

            {bleedingStatus !== 'none' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-semibold text-charcoal-muted mb-1">Duration (Consecutive Days)</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={durationDays}
                    onChange={(e) => setDurationDays(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-ivory border border-[#E2DBD0] rounded-xl text-xs text-charcoal shadow-warm-sm"
                  />
                </div>
                <div className="flex items-center justify-between p-2.5 bg-ivory rounded-xl border border-[#E2DBD0]">
                  <span className="text-xs font-semibold text-charcoal">Noticeable Blood Clots?</span>
                  <input
                    type="checkbox"
                    checked={hasClots}
                    onChange={(e) => setHasClots(e.target.checked)}
                    className="w-4 h-4 accent-sage-dark rounded"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Pelvic Pain Intensity (0 to 4) */}
          <div className="p-4 bg-white rounded-2xl border border-[#E2DBD0] shadow-warm-sm space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-charcoal">Pelvic or period cramping</span>
              <span className="font-bold text-sage-dark">
                {['None', 'Mild', 'Noticeable', 'Strong', 'Very strong'][pelvicPain]}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="4"
              value={pelvicPain}
              onChange={(e) => setPelvicPain(Number(e.target.value))}
              className="w-full accent-sage-dark cursor-pointer"
            />
          </div>

          {/* Qualitative Journal Notes */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-charcoal-muted">
              Personal notes (Optional notes for your doctor)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Woke up at 3:15 AM sweating; drank coffee later than usual; experienced brain fog during morning meeting."
              className="w-full p-3 bg-white border border-[#E2DBD0] rounded-2xl text-xs text-charcoal placeholder:text-charcoal-light focus:outline-none focus:border-sage-dark focus:ring-2 focus:ring-sage/20 transition-all shadow-warm-sm"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#E2DBD0] bg-cream text-charcoal-muted hover:text-charcoal text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sage-dark to-sage hover:to-teal text-cream text-xs font-semibold shadow-warm-md flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Saving your check-in...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Today's Check-in</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
