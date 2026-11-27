import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, Activity, Layers, Info } from 'lucide-react';
import { translateSymptom, formatSymptomNarrative } from '../../utils/terminology';

interface SymptomTrendsChartProps {
  chartsData: any;
  windowDays?: number;
  onWindowChange?: (days: number) => void;
}

export const SymptomTrendsChart: React.FC<SymptomTrendsChartProps> = ({
  chartsData,
  windowDays = 30,
  onWindowChange,
}) => {
  const [selectedSymptom, setSelectedSymptom] = useState<string>('VM_HF');
  const [compareSymptom, setCompareSymptom] = useState<string | null>(null);

  const symptomsList = [
    { code: 'VM_HF', label: 'Hot Flashes & Sweating', domain: 'Somato-vegetative' },
    { code: 'VM_NS', label: 'Night Sweats', domain: 'Somato-vegetative' },
    { code: 'SL_SQ', label: 'Sleep Problems', domain: 'Somato-vegetative' },
    { code: 'PS_MD', label: 'Changes in Mood', domain: 'Psychological' },
    { code: 'PS_AX', label: 'Anxiety & Tension', domain: 'Psychological' },
    { code: 'PH_FT', label: 'Fatigue & Low Energy', domain: 'Physical Asthenia' },
  ];

  const primarySeries = chartsData?.time_series_data?.[selectedSymptom] || [];
  const secondarySeries = compareSymptom ? chartsData?.time_series_data?.[compareSymptom] || [] : [];
  const summary = chartsData?.symptom_summary?.[selectedSymptom] || {};

  // Merge primary and secondary series for multi-symptom overlay
  const mergedData = useMemo(() => {
    if (!compareSymptom || secondarySeries.length === 0) {
      return primarySeries;
    }
    const secMap = new Map<string, any>();
    secondarySeries.forEach((item: any) => secMap.set(item.date, item));

    return primarySeries.map((pItem: any) => {
      const sItem = secMap.get(pItem.date);
      return {
        ...pItem,
        compare_intensity: sItem ? sItem.intensity : null,
        compare_sma_7: sItem ? sItem.sma_7 : null,
      };
    });
  }, [primarySeries, secondarySeries, compareSymptom]);

  const primaryLabel = symptomsList.find((s) => s.code === selectedSymptom)?.label || 'Primary';
  const compareLabel = compareSymptom ? symptomsList.find((s) => s.code === compareSymptom)?.label : null;

  const trend = summary?.trend || 'stable';
  const isIncreasing = trend === 'increasing';
  const isDecreasing = trend === 'decreasing';

  const narrative = useMemo(() => {
    const count = primarySeries.length;
    return formatSymptomNarrative(primaryLabel, trend, {
      recentAvg: summary?.current_sma_30,
      baselineAvg: summary?.mean_intensity,
      daysCount: count,
    });
  }, [primaryLabel, trend, summary, primarySeries]);

  if (!chartsData || !chartsData.time_series_data) {
    return (
      <div className="bg-cream rounded-2xl p-6 border border-[#E2DBD0] text-center text-xs text-charcoal-muted">
        No symptom data logged yet. Complete a daily check-in to see your trends.
      </div>
    );
  }

  return (
    <div className="bg-cream rounded-2xl p-6 border border-[#E2DBD0] space-y-4">
      {/* Plain-Language Narrative Interpretation Banner */}
      <div className="p-4 bg-ivory rounded-xl border border-sage/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-warm-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold text-charcoal">{narrative.headline}</h4>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${narrative.badgeColor}`}>
              {narrative.badge}
            </span>
          </div>
          <p className="text-xs text-charcoal-muted">{narrative.detail}</p>
        </div>

        <div className="text-[11px] text-charcoal-muted shrink-0 bg-white/70 px-3 py-1.5 rounded-lg border border-[#E2DBD0]">
          <span>Logged: <strong>{primarySeries.length} entries</strong></span>
        </div>
      </div>

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#E2DBD0]/70 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-sage-dark" />
            <h3 className="text-base font-serif font-semibold text-charcoal">Symptom Patterns Over Time</h3>
          </div>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Shows your daily ratings alongside 7-day trend averages to highlight patterns over time.
          </p>
        </div>

        {/* Time Horizon Window Toggle */}
        {onWindowChange && (
          <div className="flex items-center space-x-1 bg-ivory p-1 rounded-xl border border-[#E2DBD0] self-start">
            {[
              { days: 30, label: '30 Days' },
              { days: 90, label: '90 Days' },
              { days: 180, label: '6 Months' },
            ].map((w) => (
              <button
                key={w.days}
                onClick={() => onWindowChange(w.days)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  windowDays === w.days
                    ? 'bg-sage-dark text-white font-semibold'
                    : 'text-charcoal-muted hover:text-charcoal'
                }`}
              >
                {w.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Primary Symptom Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {symptomsList.map((s) => {
            const count = chartsData.time_series_data[s.code]?.length || 0;
            const isSelected = selectedSymptom === s.code;
            return (
              <button
                key={s.code}
                onClick={() => {
                  setSelectedSymptom(s.code);
                  if (compareSymptom === s.code) setCompareSymptom(null);
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-colors flex items-center space-x-1.5 ${
                  isSelected
                    ? 'bg-sage-dark text-white border-sage-dark font-semibold shadow-warm-sm'
                    : 'bg-ivory text-charcoal-muted border-[#E2DBD0] hover:text-charcoal hover:border-sage/40'
                }`}
              >
                <span>{s.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-oat text-charcoal-muted'
                  }`}
                >
                  {count}d
                </span>
              </button>
            );
          })}
        </div>

        {/* Multi-Symptom Comparison Dropdown */}
        <div className="flex items-center space-x-1.5 text-xs shrink-0 bg-white border border-[#E2DBD0] px-3 py-1.5 rounded-xl">
          <Layers className="w-3.5 h-3.5 text-teal" />
          <span className="text-charcoal-muted font-medium">Compare with:</span>
          <select
            value={compareSymptom || ''}
            onChange={(e) => setCompareSymptom(e.target.value || null)}
            className="bg-transparent text-xs font-semibold text-charcoal focus:outline-none"
          >
            <option value="">None</option>
            {symptomsList
              .filter((s) => s.code !== selectedSymptom)
              .map((s) => (
                <option key={s.code} value={s.code}>
                  + {s.label}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Summary Stat Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-[#E2DBD0]">
          <span className="text-xs text-charcoal-muted font-medium">Trend Direction</span>
          <div className="flex items-center space-x-1.5 mt-1">
            {isIncreasing ? (
              <TrendingUp className="w-4 h-4 text-peach" />
            ) : isDecreasing ? (
              <TrendingDown className="w-4 h-4 text-sage-dark" />
            ) : (
              <Minus className="w-4 h-4 text-charcoal-muted" />
            )}
            <span
              className={`text-xs font-semibold ${
                isIncreasing ? 'text-peach' : isDecreasing ? 'text-sage-dark' : 'text-charcoal'
              }`}
            >
              {isDecreasing ? 'Improving' : isIncreasing ? 'More Frequent' : 'Stable'}
            </span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-[#E2DBD0]">
          <span className="text-xs text-charcoal-muted font-medium">How often it happened</span>
          <p className="text-sm font-semibold text-charcoal mt-1">
            {summary.presence_rate_pct ?? 0}% <span className="text-xs text-charcoal-muted font-normal">of logged days</span>
          </p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-[#E2DBD0]">
          <span className="text-xs text-charcoal-muted font-medium">Average strength</span>
          <p className="text-sm font-semibold text-charcoal mt-1">
            {summary.mean_intensity ?? 0} <span className="text-xs text-charcoal-muted font-normal">/ 4.0</span>
          </p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-[#E2DBD0]">
          <span className="text-xs text-charcoal-muted font-medium">Recent 7-day pattern</span>
          <p className="text-sm font-semibold text-sage-dark mt-1">
            {summary.current_sma_30 ?? 0} <span className="text-xs text-charcoal-muted font-normal">/ 4.0</span>
          </p>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-72 w-full pt-2">
        {mergedData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-charcoal-muted">
            No check-ins recorded for this symptom yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={mergedData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2DBD0" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#544E45' }} tickLine={false} />
              <YAxis domain={[0, 4]} ticks={[0, 1, 2, 3, 4]} tick={{ fontSize: 11, fill: '#544E45' }} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FAF8F3',
                  borderRadius: '12px',
                  border: '1px solid #E2DBD0',
                  boxShadow: '0 4px 12px rgba(46, 41, 36, 0.08)',
                  fontSize: '12px',
                  color: '#2E2924',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

              {/* Primary Daily Scatter Points */}
              <Line
                type="monotone"
                dataKey="intensity"
                name={`${primaryLabel} (Daily)`}
                stroke="#A69F93"
                strokeWidth={1}
                dot={{ r: 2.5, fill: '#544E45' }}
              />

              {/* Primary SMA-7 Wave */}
              <Line
                type="monotone"
                dataKey="sma_7"
                name={`${primaryLabel} (7d Trend)`}
                stroke="#4A5F43"
                strokeWidth={2.5}
                dot={false}
              />

              {/* Primary SMA-30 Baseline */}
              <Line
                type="monotone"
                dataKey="sma_30"
                name={`${primaryLabel} (30d Baseline)`}
                stroke="#527772"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
              />

              {/* Secondary Comparison Line if enabled */}
              {compareSymptom && (
                <Line
                  type="monotone"
                  dataKey="compare_sma_7"
                  name={`${compareLabel} (7d Trend)`}
                  stroke="#C97F63"
                  strokeWidth={2.5}
                  dot={false}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
