import React, { useState } from 'react';
import { X, CheckCircle, AlertTriangle, Calendar, Flame, Moon, CloudSun, Smile, ShieldAlert, Sparkles } from 'lucide-react';
import { api } from '../../api/client';

interface DailyCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newAlerts: any[]) => void;
}

export const DailyCheckInModal: React.FC<DailyCheckInModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [assessmentDate, setAssessmentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sentinel symptom states (0 to 4)
  const [hotFlashesIntensity, setHotFlashesIntensity] = useState(0);
  const [hotFlashesCount, setHotFlashesCount] = useState(0);

  const [nightSweatsIntensity, setNightSweatsIntensity] = useState(0);
  const [nightSweatsCount, setNightSweatsCount] = useState(0);

  const [sleepDisruption, setSleepDisruption] = useState(0);
  const [moodInstability, setMoodInstability] = useState(0);
  const [anxietyTension, setAnxietyTension] = useState(0);
  const [fatigueLethargy, setFatigueLethargy] = useState(0);

  // Bleeding & physiological markers
  const [bleedingStatus, setBleedingStatus] = useState<'none' | 'spotting' | 'light' | 'normal' | 'heavy'>('none');
  const [bleedingDuration, setBleedingDuration] = useState(0);
  const [hasClots, setHasClots] = useState(false);
  const [basalTemp, setBasalTemp] = useState<string>('');
  const [pelvicPain, setPelvicPain] = useState(0);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        assessment_date: assessmentDate,
        responses: [
          { question_code: 'VM_HF', intensity: hotFlashesIntensity, frequency_count: hotFlashesCount },
          { question_code: 'VM_NS', intensity: nightSweatsIntensity, frequency_count: nightSweatsCount },
          { question_code: 'SL_SQ', intensity: sleepDisruption },
          { question_code: 'PS_MD', intensity: moodInstability },
          { question_code: 'PS_AX', intensity: anxietyTension },
          { question_code: 'PH_FT', intensity: fatigueLethargy },
        ],
        bleeding_status: bleedingStatus,
        duration_days: bleedingDuration,
        has_clots: hasClots,
        basal_body_temp: basalTemp ? parseFloat(basalTemp) : null,
        pelvic_pain_intensity: pelvicPain,
        additional_symptom_notes: notes || null,
      };

      const result = await api.submitDailyCheckIn(payload);
      onSuccess(result.new_alerts_triggered || []);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit daily check-in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderIntensityChips = (val: number, setVal: (n: number) => void) => {
    const labels = ['None', 'Mild', 'Moderate', 'Severe', 'Very Severe'];
    return (
      <div className="grid grid-cols-5 gap-1.5 mt-2">
        {labels.map((lbl, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setVal(idx)}
            className={`py-2 px-1 text-xs font-medium rounded-lg border text-center transition-colors ${
              val === idx
                ? 'bg-sage-dark text-white border-sage-dark font-semibold'
                : 'bg-ivory text-charcoal border-[#E2DBD0] hover:border-sage'
            }`}
          >
            <span className="block">{lbl}</span>
            <span className="text-xs text-charcoal-muted opacity-80 mt-0.5">{idx}</span>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-cream rounded-2xl max-w-2xl w-full border border-[#E2DBD0] shadow-warm-lg my-8 overflow-hidden">
        {/* Header */}
        <div className="bg-ivory border-b border-[#E2DBD0] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-sage-soft text-sage-dark rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-semibold text-charcoal">Daily Symptom Check-In</h2>
              <p className="text-xs text-charcoal-muted">Take a minute to log how your body felt today.</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-cream hover:bg-oat-light border border-[#E2DBD0] text-charcoal-muted hover:text-charcoal flex items-center justify-center transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-error-container border border-error/30 text-error rounded-xl text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Date Picker */}
          <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-[#E2DBD0]">
            <div className="flex items-center space-x-2 text-charcoal text-xs font-medium">
              <Calendar className="w-4 h-4 text-sage-dark" />
              <span>Check-in Date:</span>
            </div>
            <input
              type="date"
              value={assessmentDate}
              onChange={(e) => setAssessmentDate(e.target.value)}
              className="bg-ivory border border-[#E2DBD0] text-charcoal text-xs rounded-lg px-3 py-1.5 focus:border-sage-dark focus:outline-none"
            />
          </div>

          {/* Section: Symptoms */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-charcoal-muted border-b border-[#E2DBD0] pb-1">
              Today's Key Symptoms (Past 24 Hours)
            </h3>

            {/* Hot Flashes */}
            <div className="bg-white p-4 rounded-xl border border-[#E2DBD0]">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-charcoal flex items-center space-x-2">
                    <Flame className="w-4 h-4 text-peach" />
                    <span>Hot Flashes</span>
                  </span>
                  <p className="text-xs text-charcoal-muted mt-0.5">Sudden warmth across chest, neck, or face.</p>
                </div>
                <div className="flex items-center space-x-2 text-xs text-charcoal-muted">
                  <span>How many today:</span>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={hotFlashesCount}
                    onChange={(e) => setHotFlashesCount(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-16 bg-ivory border border-[#E2DBD0] rounded-lg px-2 py-1 text-center font-semibold text-charcoal"
                  />
                </div>
              </div>
              {renderIntensityChips(hotFlashesIntensity, setHotFlashesIntensity)}
            </div>

            {/* Night Sweats */}
            <div className="bg-white p-4 rounded-xl border border-[#E2DBD0]">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-charcoal flex items-center space-x-2">
                    <Moon className="w-4 h-4 text-teal" />
                    <span>Night Sweats</span>
                  </span>
                  <p className="text-xs text-charcoal-muted mt-0.5">Waking up hot or sweaty during the night.</p>
                </div>
                <div className="flex items-center space-x-2 text-xs text-charcoal-muted">
                  <span>Times woke up:</span>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={nightSweatsCount}
                    onChange={(e) => setNightSweatsCount(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-16 bg-ivory border border-[#E2DBD0] rounded-lg px-2 py-1 text-center font-semibold text-charcoal"
                  />
                </div>
              </div>
              {renderIntensityChips(nightSweatsIntensity, setNightSweatsIntensity)}
            </div>

            {/* Sleep Quality */}
            <div className="bg-white p-4 rounded-xl border border-[#E2DBD0]">
              <span className="text-sm font-semibold text-charcoal">Sleep Quality</span>
              <p className="text-xs text-charcoal-muted mt-0.5">Trouble falling asleep, restless sleep, or waking unrefreshed.</p>
              {renderIntensityChips(sleepDisruption, setSleepDisruption)}
            </div>

            {/* Mood */}
            <div className="bg-white p-4 rounded-xl border border-[#E2DBD0]">
              <span className="text-sm font-semibold text-charcoal">Mood & Emotional Balance</span>
              <p className="text-xs text-charcoal-muted mt-0.5">Feeling irritable, unusually sensitive, impatient, or tearful.</p>
              {renderIntensityChips(moodInstability, setMoodInstability)}
            </div>

            {/* Anxiety */}
            <div className="bg-white p-4 rounded-xl border border-[#E2DBD0]">
              <span className="text-sm font-semibold text-charcoal">Anxiety & Tension</span>
              <p className="text-xs text-charcoal-muted mt-0.5">Feeling nervous, on edge, restless, or sudden flutter of worry.</p>
              {renderIntensityChips(anxietyTension, setAnxietyTension)}
            </div>

            {/* Fatigue */}
            <div className="bg-white p-4 rounded-xl border border-[#E2DBD0]">
              <span className="text-sm font-semibold text-charcoal">Energy & Stamina</span>
              <p className="text-xs text-charcoal-muted mt-0.5">Feeling physically sluggish, heavy, or experiencing brain fog.</p>
              {renderIntensityChips(fatigueLethargy, setFatigueLethargy)}
            </div>
          </div>

          {/* Section: Period & Bleeding */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-charcoal-muted border-b border-[#E2DBD0] pb-1">
              Period & Flow Patterns
            </h3>

            <div className="bg-white p-4 rounded-xl border border-[#E2DBD0] space-y-3">
              <div>
                <label className="text-xs font-semibold text-charcoal">Bleeding or Spotting Today:</label>
                <div className="grid grid-cols-5 gap-1.5 mt-2">
                  {(['none', 'spotting', 'light', 'normal', 'heavy'] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setBleedingStatus(status)}
                      className={`py-2 text-xs font-medium rounded-lg border capitalize transition-colors ${
                        bleedingStatus === status
                          ? 'bg-peach text-white border-peach font-semibold'
                          : 'bg-ivory text-charcoal border-[#E2DBD0] hover:border-peach'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {bleedingStatus !== 'none' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-xs font-medium text-charcoal-muted">Days in a Row Bleeding:</label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={bleedingDuration}
                      onChange={(e) => setBleedingDuration(parseInt(e.target.value) || 0)}
                      className="w-full mt-1 bg-ivory border border-[#E2DBD0] rounded-lg px-3 py-1.5 text-xs font-semibold text-charcoal"
                    />
                    {bleedingDuration >= 7 && (
                      <p className="text-xs text-[#B07D38] font-medium mt-1">
                        Notice: Bleeding 7 or more days in a row is helpful to note for your doctor.
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 pt-4">
                    <input
                      type="checkbox"
                      id="clotsCheck"
                      checked={hasClots}
                      onChange={(e) => setHasClots(e.target.checked)}
                      className="w-4 h-4 text-peach rounded border-[#E2DBD0] focus:ring-peach"
                    />
                    <label htmlFor="clotsCheck" className="text-xs text-charcoal font-medium">
                      Noticeable blood clots present
                    </label>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-xs font-medium text-charcoal-muted">Body Temperature (°C, optional):</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 36.8"
                    value={basalTemp}
                    onChange={(e) => setBasalTemp(e.target.value)}
                    className="w-full mt-1 bg-ivory border border-[#E2DBD0] rounded-lg px-3 py-1.5 text-xs text-charcoal"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-charcoal-muted">Pelvic Discomfort or Cramps:</label>
                  <select
                    value={pelvicPain}
                    onChange={(e) => setPelvicPain(parseInt(e.target.value))}
                    className="w-full mt-1 bg-ivory border border-[#E2DBD0] rounded-lg px-3 py-1.5 text-xs text-charcoal"
                  >
                    <option value={0}>None</option>
                    <option value={1}>Mild dull ache</option>
                    <option value={2}>Noticeable cramps</option>
                    <option value={3}>Significant pain</option>
                    <option value={4}>Severe pain</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Notes */}
          <div>
            <label className="text-xs font-semibold text-charcoal">Personal Notes (Optional):</label>
            <textarea
              rows={2}
              placeholder="Any other sensations today, e.g. headache, bloating, foods eaten, sleep notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full mt-1 p-3 bg-white border border-[#E2DBD0] rounded-xl text-xs text-charcoal focus:border-sage-dark focus:outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#E2DBD0]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-charcoal-muted hover:text-charcoal rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-medium text-white bg-sage-dark hover:bg-[#3E5437] rounded-xl transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {isSubmitting ? <span>Saving...</span> : <span>Save Daily Check-in</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
