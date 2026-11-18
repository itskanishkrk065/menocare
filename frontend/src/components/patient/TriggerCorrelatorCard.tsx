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
  TrendingUp,
} from 'lucide-react';

export const TriggerCorrelatorCard: React.FC = () => {
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([
    'caffeine_late',
    'stress_high',
  ]);
  const [isSaved, setIsSaved] = useState(false);

  const TRIGGERS = [
    { id: 'caffeine_late', label: 'Caffeine after 2 PM', icon: Coffee, desc: 'Narrows hypothalamic threshold' },
    { id: 'alcohol_evening', label: 'Evening Alcohol', icon: Wine, desc: 'Increases peripheral vasodilation' },
    { id: 'spicy_food', label: 'Spicy / High-Sodium Meal', icon: Flame, desc: 'Stimulates capsaicin thermoreceptors' },
    { id: 'stress_high', label: 'High Work / Emotional Stress', icon: Zap, desc: 'Adrenaline and cortisol surge' },
    { id: 'room_warm', label: 'Warm Bedroom (>20°C)', icon: Moon, desc: 'Inhibits core cooling prior to sleep' },
    { id: 'intense_exercise_late', label: 'Late Vigorous Exercise', icon: Activity, desc: 'Elevates sympathetic tone' },
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
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Lifestyle & Symptom Trigger Correlator
            </h3>
            <p className="text-xs text-slate-500">
              Track environmental triggers to identify acute flare-up patterns.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
        >
          {isSaved ? <CheckCircle2 className="w-3.5 h-3.5 text-white" /> : null}
          <span>{isSaved ? 'Saved for Today' : 'Save Triggers'}</span>
        </button>
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
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start space-x-3 ${
                isSelected
                  ? 'bg-amber-50/80 border-amber-400 text-amber-950 shadow-2xs'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/60'
              }`}
            >
              <div
                className={`p-2 rounded-xl mt-0.5 ${
                  isSelected ? 'bg-amber-200/60 text-amber-800' : 'bg-white border border-slate-200 text-slate-500'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="font-extrabold text-xs flex items-center justify-between">
                  <span>{t.label}</span>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">{t.desc}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deterministic Correlation Insight Box */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50/90 to-teal-50/40 border border-amber-200/80 space-y-2">
        <div className="flex items-center space-x-2 text-xs font-extrabold text-amber-950">
          <TrendingUp className="w-4 h-4 text-amber-600" />
          <span>Longitudinal Correlation Insight (Last 30 Days)</span>
        </div>
        <p className="text-xs text-amber-900 leading-relaxed">
          On days when <b>Caffeine after 2 PM</b> or <b>Evening Alcohol</b> were recorded, your recorded nocturnal
          flush frequency was <b className="text-rose-700">2.4x higher</b> than non-trigger days.
        </p>
        <div className="pt-1 text-[11px] text-slate-600 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
          <span>Clinical Tip: Switching to decaffeinated herbal infusions after 1 PM significantly widens sleep continuity.</span>
        </div>
      </div>
    </div>
  );
};
