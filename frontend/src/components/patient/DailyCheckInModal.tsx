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
    const labels = ['0: None', '1: Mild', '2: Moderate', '3: Severe', '4: Very Severe'];
    return (
      <div className="grid grid-cols-5 gap-1.5 mt-1.5">
        {labels.map((lbl, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setVal(idx)}
            className={`py-1.5 px-1 text-xs font-medium rounded-lg border text-center transition-all ${
              val === idx
                ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {lbl}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-100 my-8 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 to-teal-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Sparkles className="w-5 h-5 text-teal-200" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Daily Micro-Check-in</h2>
              <p className="text-xs text-teal-100">60-90 seconds sentinel symptom & physiological tracker</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Date Picker */}
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="flex items-center space-x-2 text-slate-700 text-sm font-medium">
              <Calendar className="w-4 h-4 text-teal-600" />
              <span>Assessment Date:</span>
            </div>
            <input
              type="date"
              value={assessmentDate}
              onChange={(e) => setAssessmentDate(e.target.value)}
              className="bg-white border border-slate-300 text-slate-800 text-sm rounded-lg px-2.5 py-1 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          {/* Section: Sentinel Symptoms */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800 border-b pb-1">
              Sentinel Symptoms (Past 24 Hours)
            </h3>

            {/* Hot Flashes */}
            <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-900 flex items-center space-x-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span>1. Hot Flashes (Vasomotor)</span>
                </span>
                <div className="flex items-center space-x-2 text-xs text-slate-600">
                  <span>Episodes:</span>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={hotFlashesCount}
                    onChange={(e) => setHotFlashesCount(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-16 bg-white border border-slate-300 rounded px-1.5 py-0.5 text-center font-bold"
                  />
                </div>
              </div>
              {renderIntensityChips(hotFlashesIntensity, setHotFlashesIntensity)}
            </div>

            {/* Night Sweats */}
            <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-900 flex items-center space-x-2">
                  <Moon className="w-4 h-4 text-indigo-500" />
                  <span>2. Night Sweats & Awakenings</span>
                </span>
                <div className="flex items-center space-x-2 text-xs text-slate-600">
                  <span>Awakenings:</span>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={nightSweatsCount}
                    onChange={(e) => setNightSweatsCount(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-16 bg-white border border-slate-300 rounded px-1.5 py-0.5 text-center font-bold"
                  />
                </div>
              </div>
              {renderIntensityChips(nightSweatsIntensity, setNightSweatsIntensity)}
            </div>

            {/* Sleep Disruption */}
            <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
              <span className="text-sm font-semibold text-slate-900">3. Sleep Disruption / Fragmentation</span>
              <p className="text-xs text-slate-500">Difficulty falling asleep, frequent waking, or non-restorative sleep.</p>
              {renderIntensityChips(sleepDisruption, setSleepDisruption)}
            </div>

            {/* Mood Instability */}
            <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
              <span className="text-sm font-semibold text-slate-900">4. Mood Swings & Irritability</span>
              <p className="text-xs text-slate-500">Emotional volatility, sudden crying spells, or frustration.</p>
              {renderIntensityChips(moodInstability, setMoodInstability)}
            </div>

            {/* Anxiety & Tension */}
            <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
              <span className="text-sm font-semibold text-slate-900">5. Internal Anxiety & Restlessness</span>
              <p className="text-xs text-slate-500">Nervous tension, panic-like feeling, or difficulty relaxing.</p>
              {renderIntensityChips(anxietyTension, setAnxietyTension)}
            </div>

            {/* Physical Fatigue */}
            <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
              <span className="text-sm font-semibold text-slate-900">6. Physical Fatigue / Lethargy</span>
              <p className="text-xs text-slate-500">Unexplained energy deficit or muscle heaviness.</p>
              {renderIntensityChips(fatigueLethargy, setFatigueLethargy)}
            </div>
          </div>

          {/* Section: Menstrual & Bleeding Dynamics */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-800 border-b pb-1">
              Bleeding & Ovarian Dynamics (PCOD, Cysts & Red-Flag Screening)
            </h3>

            <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-200 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-800">Menstrual Flow Status Today:</label>
                <div className="grid grid-cols-5 gap-1.5 mt-1">
                  {(['none', 'spotting', 'light', 'normal', 'heavy'] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setBleedingStatus(status)}
                      className={`py-1.5 text-xs font-medium rounded-lg border capitalize ${
                        bleedingStatus === status
                          ? 'bg-rose-600 text-white border-rose-600 font-bold'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
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
                    <label className="text-xs font-medium text-slate-700">Consecutive Days Bleeding:</label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={bleedingDuration}
                      onChange={(e) => setBleedingDuration(parseInt(e.target.value) || 0)}
                      className="w-full mt-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-sm font-semibold"
                    />
                    {bleedingDuration >= 7 && (
                      <p className="text-[11px] text-amber-700 font-medium mt-0.5">
                        ⚠️ Bleeding ≥7 days flags prolonged anovulatory / PCOD pattern.
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 pt-4">
                    <input
                      type="checkbox"
                      id="clotsCheck"
                      checked={hasClots}
                      onChange={(e) => setHasClots(e.target.checked)}
                      className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500"
                    />
                    <label htmlFor="clotsCheck" className="text-xs text-slate-700 font-medium">
                      Passage of visible blood clots
                    </label>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-xs font-medium text-slate-700">Basal Body Temperature (°C):</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 36.8"
                    value={basalTemp}
                    onChange={(e) => setBasalTemp(e.target.value)}
                    className="w-full mt-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-sm"
                  />
                  <span className="text-[10px] text-slate-400">Used for PCOD & ovulation tracking</span>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700">Pelvic Pain / Discomfort (0-4):</label>
                  <select
                    value={pelvicPain}
                    onChange={(e) => setPelvicPain(parseInt(e.target.value))}
                    className="w-full mt-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-sm"
                  >
                    <option value={0}>0: No pelvic pain</option>
                    <option value={1}>1: Mild dull ache</option>
                    <option value={2}>2: Moderate localized pain</option>
                    <option value={3}>3: Severe sharp / unilateral pain</option>
                    <option value={4}>4: Disabling pelvic pain</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Additional Notes */}
          <div>
            <label className="text-xs font-semibold text-slate-800">Additional Notes / Other Symptoms:</label>
            <textarea
              rows={2}
              placeholder="e.g. Headaches, bloating, joint pain, facial hair, cold intolerance..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center space-x-2"
            >
              {isSubmitting ? <span>Saving...</span> : <span>Save Daily Check-in</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
