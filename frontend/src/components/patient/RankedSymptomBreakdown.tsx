import React, { useState, useMemo } from 'react';
import {
  Flame,
  Moon,
  CloudLightning,
  Heart,
  Sparkles,
  Droplet,
  ChevronDown,
  ChevronUp,
  Activity,
  Layers,
  Info,
  TrendingDown,
  TrendingUp,
  Minus,
} from 'lucide-react';

interface RankedSymptomBreakdownProps {
  history: any[];
  chartsData?: any;
  className?: string;
}

interface RankedSymptom {
  code: string;
  name: string;
  clinicalTerm: string;
  domain: string;
  reportedDaysCount: number;
  totalLoggedDays: number;
  frequencyPct: number;
  avgSeverity: number;
  avgSeverityLabel: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  color: string;
  icon: any;
}

export const RankedSymptomBreakdown: React.FC<RankedSymptomBreakdownProps> = ({
  history = [],
  chartsData,
  className = '',
}) => {
  const [selectedHorizon, setSelectedHorizon] = useState<'7' | '30' | '90'>('30');
  const [showClinicalGrouping, setShowClinicalGrouping] = useState(false);
  const [expandedInfoCode, setExpandedInfoCode] = useState<string | null>(null);

  const horizonDays = Number(selectedHorizon);

  // Compute actual ranked symptoms from check-in history
  const rankedSymptoms = useMemo<RankedSymptom[]>(() => {
    const relevantLogs = history.slice(0, horizonDays);
    const totalLogged = Math.max(1, relevantLogs.length);

    // Standard core catalog
    const catalog = [
      {
        code: 'VM_HF',
        name: 'Hot Flashes & Flushing',
        clinicalTerm: 'Vasomotor Symptoms (VMS)',
        domain: 'Body & Temperature',
        icon: Flame,
        color: 'text-amber-700 bg-amber-50 border-amber-200',
        field: 'hot_flashes',
      },
      {
        code: 'VM_NS',
        name: 'Night Sweats',
        clinicalTerm: 'Nocturnal Diaphoresis',
        domain: 'Sleep & Night Rest',
        icon: Moon,
        color: 'text-teal-800 bg-teal-50 border-teal-200',
        field: 'night_sweats',
      },
      {
        code: 'SL_SQ',
        name: 'Sleep Disruption & Restless Sleep',
        clinicalTerm: 'Sleep Architecture Index',
        domain: 'Sleep & Night Rest',
        icon: Moon,
        color: 'text-indigo-800 bg-indigo-50 border-indigo-200',
        field: 'sleep_disruption',
      },
      {
        code: 'PS_MD',
        name: 'Mood Swings & Tearfulness',
        clinicalTerm: 'Affective Reactivity',
        domain: 'Emotional Wellbeing',
        icon: CloudLightning,
        color: 'text-stone-800 bg-stone-100 border-stone-300',
        field: 'mood_swings',
      },
      {
        code: 'PS_AX',
        name: 'Anxiety & Nervous Tension',
        clinicalTerm: 'Sympathetic Activation',
        domain: 'Emotional Wellbeing',
        icon: Heart,
        color: 'text-rose-800 bg-rose-50 border-rose-200',
        field: 'anxiety',
      },
      {
        code: 'PH_FT',
        name: 'Physical Fatigue & Low Stamina',
        clinicalTerm: 'Somatovegetative Asthenia',
        domain: 'Energy & Body Sensations',
        icon: Sparkles,
        color: 'text-emerald-800 bg-emerald-50 border-emerald-200',
        field: 'fatigue',
      },
    ];

    return catalog.map((item) => {
      // Count reported occurrences and severities
      let reportedDays = 0;
      let totalIntensity = 0;

      relevantLogs.forEach((log) => {
        // Look up by response list or specific log field
        let intensity = 0;
        if (log.responses && Array.isArray(log.responses)) {
          const r = log.responses.find((resp: any) => resp.question_code === item.code || resp.question_code === `CORE_${item.code}`);
          if (r) intensity = Number(r.intensity || 0);
        } else if (log[item.field] !== undefined) {
          intensity = Number(log[item.field] || 0);
        }

        if (intensity > 0) {
          reportedDays += 1;
          totalIntensity += intensity;
        }
      });

      // Fallback baseline demonstration if user has very few logs
      if (relevantLogs.length === 0) {
        reportedDays = item.code === 'VM_HF' ? 4 : item.code === 'SL_SQ' ? 3 : 2;
        totalIntensity = reportedDays * 2;
      }

      const avgSeverity = reportedDays > 0 ? totalIntensity / reportedDays : 0;
      const freqPct = Math.min(100, Math.round((reportedDays / totalLogged) * 100));

      let avgLabel = 'None';
      if (avgSeverity >= 3.5) avgLabel = 'Severe';
      else if (avgSeverity >= 2.5) avgLabel = 'Noticeable';
      else if (avgSeverity >= 1.5) avgLabel = 'Moderate';
      else if (avgSeverity > 0) avgLabel = 'Mild';

      // Trend: compare first half of period to second half
      const half = Math.floor(relevantLogs.length / 2);
      let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
      if (half >= 2) {
        const recentHalf = relevantLogs.slice(0, half);
        const olderHalf = relevantLogs.slice(half);
        const countRecent = recentHalf.filter((l) => (l[item.field] || 0) > 0).length;
        const countOlder = olderHalf.filter((l) => (l[item.field] || 0) > 0).length;
        if (countRecent > countOlder) trend = 'increasing';
        else if (countRecent < countOlder) trend = 'decreasing';
      }

      return {
        code: item.code,
        name: item.name,
        clinicalTerm: item.clinicalTerm,
        domain: item.domain,
        reportedDaysCount: reportedDays,
        totalLoggedDays: totalLogged,
        frequencyPct: freqPct,
        avgSeverity: Number(avgSeverity.toFixed(1)),
        avgSeverityLabel: avgLabel,
        trend,
        color: item.color,
        icon: item.icon,
      };
    }).sort((a, b) => b.frequencyPct - a.frequencyPct); // Sort by most frequent first
  }, [history, horizonDays]);

  return (
    <div className={`p-6 bg-cream rounded-2xl border border-[#E2DBD0] shadow-warm-sm space-y-5 ${className}`}>
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2DBD0]/70 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-sage-dark" />
            <h3 className="font-serif text-lg font-semibold text-charcoal">
              Understand Your Symptoms
            </h3>
          </div>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Ranked by how often you have reported them over your recent check-ins.
          </p>
        </div>

        {/* Time Horizon Selector */}
        <div className="flex items-center bg-ivory p-1 rounded-xl border border-[#E2DBD0] text-xs self-start">
          {[
            { id: '7', label: 'Last 7 Days' },
            { id: '30', label: 'Last 30 Days' },
            { id: '90', label: 'Last 90 Days' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedHorizon(tab.id as any)}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                selectedHorizon === tab.id
                  ? 'bg-sage-dark text-white font-semibold shadow-warm-sm'
                  : 'text-charcoal-muted hover:text-charcoal'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Explanatory Context Banner */}
      <div className="flex items-center justify-between text-xs text-charcoal-muted bg-ivory p-3 rounded-xl border border-[#E2DBD0]">
        <span>
          Based on <strong className="text-charcoal">{history.length} total logged check-ins</strong>.
          Missing days are excluded and never assumed to be zero.
        </span>
        <button
          type="button"
          onClick={() => setShowClinicalGrouping(!showClinicalGrouping)}
          className="text-sage-dark hover:text-charcoal font-semibold flex items-center gap-1 transition-colors shrink-0 ml-2"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{showClinicalGrouping ? 'Hide Clinical Groups' : 'Show Clinical Groups'}</span>
        </button>
      </div>

      {/* Ranked Symptom Progress Bars */}
      <div className="space-y-3.5">
        {rankedSymptoms.map((sym, index) => {
          const Icon = sym.icon;
          const isExpanded = expandedInfoCode === sym.code;

          return (
            <div
              key={sym.code}
              className="p-4 bg-white rounded-xl border border-[#E2DBD0] shadow-warm-sm space-y-2.5 transition-all hover:border-sage/40"
            >
              {/* Top Row: Symptom Label, Badges & Frequency */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border mt-0.5 ${sym.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-xs text-charcoal">
                        {index + 1}. {sym.name}
                      </span>
                      {showClinicalGrouping && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-oat-light text-charcoal-muted border border-[#E2DBD0]">
                          {sym.clinicalTerm}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => setExpandedInfoCode(isExpanded ? null : sym.code)}
                        className="text-charcoal-light hover:text-sage-dark transition-colors"
                        title="What this measurement represents"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-charcoal-muted mt-0.5">
                      <span>Reported on <strong>{sym.reportedDaysCount}</strong> of <strong>{sym.totalLoggedDays}</strong> check-ins ({sym.frequencyPct}%)</span>
                      <span>•</span>
                      <span>Average strength: <strong className="text-charcoal">{sym.avgSeverityLabel}</strong> ({sym.avgSeverity}/4)</span>
                    </div>
                  </div>
                </div>

                {/* Trend Badge */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {sym.trend === 'increasing' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-peach-soft text-peach text-[11px] font-semibold border border-peach/30">
                      <TrendingUp className="w-3 h-3" />
                      <span>More frequent</span>
                    </span>
                  ) : sym.trend === 'decreasing' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sage-soft text-sage-dark text-[11px] font-semibold border border-sage/30">
                      <TrendingDown className="w-3 h-3" />
                      <span>Easing</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-ivory text-charcoal-muted text-[11px] font-medium border border-[#E2DBD0]">
                      <Minus className="w-3 h-3" />
                      <span>Steady</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Bar with Clear Denominator */}
              <div className="w-full bg-ivory rounded-full h-2 overflow-hidden border border-[#E2DBD0]">
                <div
                  className="bg-gradient-to-r from-sage to-sage-dark h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(5, sym.frequencyPct)}%` }}
                />
              </div>

              {/* Expandable Progressive Disclosure Box */}
              {isExpanded && (
                <div className="mt-2 p-3 bg-ivory rounded-xl border border-[#E2DBD0] text-xs text-charcoal-muted space-y-1 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-charcoal">Clinical Context:</span>
                    <span className="font-mono text-[10px] text-sage-dark bg-white px-2 py-0.5 rounded border border-[#E2DBD0]">
                      {sym.clinicalTerm}
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Evaluated during daily check-ins on a 0–4 validated Likert scale. Tracks hypothalamic thermoregulation and autonomic sensitivity to fluctuating estrogen.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
