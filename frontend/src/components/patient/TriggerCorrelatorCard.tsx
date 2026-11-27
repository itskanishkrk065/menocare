import React, { useState } from 'react';
import {
  Flame,
  Coffee,
  Wine,
  Zap,
  Activity,
  Moon,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export const TriggerCorrelatorCard: React.FC = () => {
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([
    'caffeine_late',
    'stress_high',
  ]);
  const [isSaved, setIsSaved] = useState(false);

  const TRIGGERS = [
    { id: 'caffeine_late', label: 'Caffeine after 2 PM', icon: Coffee, desc: 'Can trigger hot flashes or disrupt sleep' },
    { id: 'alcohol_evening', label: 'Evening Alcohol', icon: Wine, desc: 'May cause night sweats or sleep awakenings' },
    { id: 'spicy_food', label: 'Spicy or Rich Meal', icon: Flame, desc: 'Can bring on sudden facial flushing' },
    { id: 'stress_high', label: 'High Daily Stress', icon: Zap, desc: 'Elevates heart rate, tension, and heat spikes' },
    { id: 'room_warm', label: 'Warm Bedroom (>20°C)', icon: Moon, desc: 'Makes nocturnal sweating more likely' },
    { id: 'intense_exercise_late', label: 'Late Evening Workout', icon: Activity, desc: 'Keeps core body temperature high near bedtime' },
  ];

  const toggleTrigger = (id: string) => {
    setIsSaved(false);
    setSelectedTriggers((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="bg-cream rounded-2xl p-6 border border-[#E2DBD0] shadow-warm-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2DBD0]/70 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-peach-soft text-peach flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-[#C48068]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-serif font-semibold text-charcoal">
                Factors You Are Tracking
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-ivory text-charcoal-muted border border-[#E2DBD0] font-medium">
                Observed Influences (Not Direct Causation)
              </span>
            </div>
            <p className="text-xs text-charcoal-muted mt-0.5">
              Select lifestyle factors you want to observe alongside your symptoms.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="px-3.5 py-1.5 bg-sage-dark hover:bg-sage text-white rounded-xl text-xs font-semibold transition-colors shadow-warm-sm flex items-center gap-1.5 self-start sm:self-auto"
        >
          {isSaved ? <CheckCircle2 className="w-3.5 h-3.5 text-white" /> : null}
          <span>{isSaved ? 'Saved for Today' : 'Save Tracked Factors'}</span>
        </button>
      </div>

      {/* Causality Disclaimer Callout */}
      <div className="p-3 bg-ivory rounded-xl border border-[#E2DBD0] text-xs text-charcoal-muted leading-relaxed">
        <span className="font-semibold text-charcoal">How to interpret these: </span>
        Noticing that a symptom occurred after late coffee or stress is a helpful pattern to discuss with your doctor. An observed association does not necessarily prove one caused the other.
      </div>

      {/* Trigger Chips Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {TRIGGERS.map((t) => {
          const Icon = t.icon;
          const isSelected = selectedTriggers.includes(t.id);

          return (
            <div
              key={t.id}
              onClick={() => toggleTrigger(t.id)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-colors flex items-start space-x-3 ${
                isSelected
                  ? 'bg-sage-soft border-sage-dark text-charcoal font-medium'
                  : 'bg-white border-[#E2DBD0] text-charcoal-muted hover:border-sage'
              }`}
            >
              <div
                className={`p-2 rounded-lg mt-0.5 ${
                  isSelected ? 'bg-sage-dark text-white' : 'bg-ivory border border-[#E2DBD0] text-charcoal-muted'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-xs flex items-center justify-between text-charcoal">
                  <span>{t.label}</span>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-sage-dark shrink-0" />}
                </div>
                <div className="text-xs text-charcoal-muted mt-1 leading-relaxed text-pretty">{t.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
