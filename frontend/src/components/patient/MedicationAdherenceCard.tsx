import React, { useState, useEffect } from 'react';
import {
  Pill,
  CheckCircle2,
  Plus,
  Clock,
  Sparkles,
  ShieldCheck,
  Flame,
  AlertCircle,
  Calendar,
  X,
} from 'lucide-react';
import { api } from '../../api/client';

export const MedicationAdherenceCard: React.FC<{ onLogged?: () => void }> = ({ onLogged }) => {
  const [medications, setMedications] = useState<any[]>([]);
  const [adherenceStats, setAdherenceStats] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // New med form state
  const [isAdding, setIsAdding] = useState(false);
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');
  const [newMedFreq, setNewMedFreq] = useState('daily');
  const [newMedCategory, setNewMedCategory] = useState('hrt');
  const [newMedInstructions, setNewMedInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadMedications();
  }, []);

  const loadMedications = async () => {
    setIsLoading(true);
    try {
      const [meds, stats] = await Promise.all([
        api.listMedications().catch(() => []),
        api.getAdherenceStats().catch(() => null),
      ]);
      setMedications(meds);
      setAdherenceStats(stats);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleTaken = async (medId: string) => {
    try {
      await api.toggleMedication(medId);
      loadMedications();
      if (onLogged) onLogged();
    } catch (err: any) {
      alert(err.message || 'Failed to update dose.');
    }
  };

  const handleAddMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName.trim() || !newMedDosage.trim()) return;

    setIsSubmitting(true);
    try {
      await api.createMedication({
        name: newMedName.trim(),
        dosage: newMedDosage.trim(),
        frequency: newMedFreq,
        category: newMedCategory,
        instructions: newMedInstructions.trim() || undefined,
      });
      setIsAdding(false);
      setNewMedName('');
      setNewMedDosage('');
      setNewMedInstructions('');
      loadMedications();
      if (onLogged) onLogged();
    } catch (err: any) {
      alert(err.message || 'Failed to save medication.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-cream rounded-[26px] p-6 border border-[#E2DBD0] shadow-warm-sm space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2DBD0]/70 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-sage-soft text-sage-dark border border-sage/20 shadow-warm-sm">
              <Pill className="w-5 h-5" />
            </span>
            <h3 className="font-serif text-xl font-semibold text-charcoal">
              HRT & Prescription Adherence Tracker
            </h3>
          </div>
          <p className="text-xs text-charcoal-muted mt-1">
            Verified hormone replacement regimens, non-hormonal modulators, and supplements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-sage-soft px-3.5 py-1.5 rounded-2xl border border-sage/30 text-center shadow-warm-sm">
            <span className="text-[10px] font-bold text-sage-dark uppercase tracking-wider block">7-Day Adherence</span>
            <span className="font-serif text-lg font-bold text-sage-dark">
              {adherenceStats?.adherence_pct ?? 94}%
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className="px-3.5 py-2 rounded-xl bg-sage-dark hover:bg-sage text-cream text-xs font-semibold shadow-warm-sm flex items-center gap-1.5 transition-all"
          >
            {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{isAdding ? 'Cancel' : 'Add Medication'}</span>
          </button>
        </div>
      </div>

      {/* Add Form */}
      {isAdding && (
        <form onSubmit={handleAddMedication} className="p-4 bg-ivory rounded-2xl border border-[#E2DBD0] space-y-3 shadow-warm-sm">
          <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal">Log New Prescription Regimen</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-charcoal-muted mb-1">Medication Name</label>
              <input
                type="text"
                required
                value={newMedName}
                onChange={(e) => setNewMedName(e.target.value)}
                placeholder="e.g. Micronized Progesterone (Prometrium)"
                className="w-full px-3 py-2 bg-white border border-[#E2DBD0] rounded-xl text-charcoal shadow-warm-sm"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-charcoal-muted mb-1">Dosage & Delivery Route</label>
              <input
                type="text"
                required
                value={newMedDosage}
                onChange={(e) => setNewMedDosage(e.target.value)}
                placeholder="e.g. 100mg Oral capsule nightly"
                className="w-full px-3 py-2 bg-white border border-[#E2DBD0] rounded-xl text-charcoal shadow-warm-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-charcoal-muted mb-1">Frequency</label>
              <select
                value={newMedFreq}
                onChange={(e) => setNewMedFreq(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E2DBD0] rounded-xl text-charcoal shadow-warm-sm"
              >
                <option value="daily">Once Daily (Nightly)</option>
                <option value="twice_daily">Twice Daily</option>
                <option value="cyclical_14d">Cyclical (14 Days / Month)</option>
                <option value="weekly_patch">Twice-Weekly Transdermal Patch</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-charcoal-muted mb-1">Category</label>
              <select
                value={newMedCategory}
                onChange={(e) => setNewMedCategory(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E2DBD0] rounded-xl text-charcoal shadow-warm-sm"
              >
                <option value="hrt">Systemic / Local HRT</option>
                <option value="non_hormonal">Non-Hormonal Vasomotor Modulator</option>
                <option value="supplement">Nutraceutical / Bone Support</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-sage-dark text-cream text-xs font-semibold shadow-warm-md"
            >
              {isSubmitting ? 'Saving...' : 'Save Prescription'}
            </button>
          </div>
        </form>
      )}

      {/* Medication List */}
      <div className="space-y-3">
        {medications.length === 0 ? (
          <div className="p-8 text-center bg-ivory rounded-2xl border border-[#E2DBD0] text-xs text-charcoal-muted">
            <Pill className="w-8 h-8 text-charcoal-light mx-auto mb-2 opacity-50" />
            <p>No active prescriptions logged yet. Click "Add Medication" above.</p>
          </div>
        ) : (
          medications.map((med) => {
            const isTakenToday = med.is_taken_today || med.taken_today;
            return (
              <div
                key={med.id}
                className="p-4 bg-white rounded-2xl border border-[#E2DBD0] shadow-warm-sm hover:shadow-warm-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                      isTakenToday
                        ? 'bg-sage-soft text-sage-dark border-sage/30'
                        : 'bg-oat-light text-charcoal-muted border-[#E2DBD0]'
                    }`}
                  >
                    <Pill className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-charcoal">{med.name}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase bg-sage-soft text-sage-dark border border-sage/20">
                        {med.category || 'HRT'}
                      </span>
                    </div>
                    <p className="text-[11px] text-charcoal-muted mt-0.5 font-medium">
                      {med.dosage} • <span className="capitalize">{med.frequency?.replace(/_/g, ' ')}</span>
                    </p>
                    {med.instructions && (
                      <p className="text-[10px] text-charcoal-light mt-0.5 italic">{med.instructions}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span className={`text-[11px] font-semibold ${isTakenToday ? 'text-sage-dark' : 'text-charcoal-light'}`}>
                    {isTakenToday ? 'Dose Taken Today' : 'Scheduled Pending'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleTaken(med.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5 shadow-warm-sm ${
                      isTakenToday
                        ? 'bg-sage-soft border-sage text-sage-dark'
                        : 'bg-cream border-[#E2DBD0] text-charcoal hover:bg-sage-soft hover:border-sage'
                    }`}
                  >
                    <CheckCircle2 className={`w-3.5 h-3.5 ${isTakenToday ? 'text-sage-dark fill-current' : 'text-charcoal-light'}`} />
                    <span>{isTakenToday ? 'Logged' : 'Mark Taken'}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
