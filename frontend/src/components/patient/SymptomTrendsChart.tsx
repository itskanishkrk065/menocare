import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Area,
  ComposedChart,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, Activity, Layers } from 'lucide-react';

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
    { code: 'VM_HF', label: 'Hot Flashes' },
    { code: 'VM_NS', label: 'Night Sweats' },
    { code: 'SL_SQ', label: 'Sleep Disruption' },
    { code: 'PS_MD', label: 'Mood Swings' },
    { code: 'PS_AX', label: 'Anxiety' },
    { code: 'PH_FT', label: 'Fatigue' },
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

  if (!chartsData || !chartsData.time_series_data) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-200 text-center text-xs text-slate-500">
        No longitudinal time-series data logged yet. Complete daily micro-check-ins to generate trends.
      </div>
    );
  }

  const trend = summary.trend || 'stable';
  const isIncreasing = trend === 'increasing';
  const isDecreasing = trend === 'decreasing';

  const primaryLabel = symptomsList.find((s) => s.code === selectedSymptom)?.label || 'Primary';
  const compareLabel = compareSymptom ? symptomsList.find((s) => s.code === compareSymptom)?.label : null;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-teal-600" />
            <h3 className="text-base font-bold text-slate-900">Deterministic Time-Series Trends</h3>
          </div>
          <p className="text-xs text-slate-500">
            Computed via 7-day and 30-day Simple Moving Averages (SMA) & Mann-Kendall monotonic test
          </p>
        </div>

        {/* Time Horizon Window Toggle */}
        {onWindowChange && (
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl self-start">
            {[
              { days: 30, label: '30 Days' },
              { days: 90, label: '90 Days' },
              { days: 180, label: '180 Days (6M)' },
            ].map((w) => (
              <button
                key={w.days}
                onClick={() => onWindowChange(w.days)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  windowDays === w.days
                    ? 'bg-white text-teal-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
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
        <div className="flex flex-wrap gap-1.5">
          {symptomsList.map((s) => {
            const count = chartsData.time_series_data[s.code]?.length || 0;
            return (
              <button
                key={s.code}
                onClick={() => {
                  setSelectedSymptom(s.code);
                  if (compareSymptom === s.code) setCompareSymptom(null);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center space-x-1.5 ${
                  selectedSymptom === s.code
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{s.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedSymptom === s.code
                      ? 'bg-teal-700 text-teal-100'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {count}d
                </span>
              </button>
            );
          })}
        </div>

        {/* Multi-Symptom Comparison Dropdown */}
        <div className="flex items-center space-x-1.5 text-xs shrink-0 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-xl">
          <Layers className="w-3.5 h-3.5 text-indigo-600" />
          <span className="text-slate-600 font-medium">Overlay:</span>
          <select
            value={compareSymptom || ''}
            onChange={(e) => setCompareSymptom(e.target.value || null)}
            className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none"
          >
            <option value="">None (Single Symptom)</option>
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

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
          <span className="text-[11px] text-slate-500 font-medium">Trajectory</span>
          <div className="flex items-center space-x-1.5 mt-0.5">
            {isIncreasing ? (
              <TrendingUp className="w-4 h-4 text-rose-600" />
            ) : isDecreasing ? (
              <TrendingDown className="w-4 h-4 text-emerald-600" />
            ) : (
              <Minus className="w-4 h-4 text-slate-600" />
            )}
            <span
              className={`text-xs font-bold uppercase ${
                isIncreasing ? 'text-rose-600' : isDecreasing ? 'text-emerald-600' : 'text-slate-700'
              }`}
            >
              {trend} ({summary.confidence || 'Moderate'})
            </span>
          </div>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
          <span className="text-[11px] text-slate-500 font-medium">Presence Rate</span>
          <p className="text-sm font-bold text-slate-900 mt-0.5">
            {summary.presence_rate_pct ?? 0}% <span className="text-[10px] text-slate-400 font-normal">of logged days</span>
          </p>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
          <span className="text-[11px] text-slate-500 font-medium">Mean Severity</span>
          <p className="text-sm font-bold text-slate-900 mt-0.5">
            {summary.mean_intensity ?? 0} <span className="text-[10px] text-slate-400 font-normal">/ 4.0</span>
          </p>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
          <span className="text-[11px] text-slate-500 font-medium">Current 30-Day SMA</span>
          <p className="text-sm font-bold text-teal-700 mt-0.5">
            {summary.current_sma_30 ?? 0} <span className="text-[10px] text-teal-600/70 font-normal">/ 4.0</span>
          </p>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-72 w-full pt-2">
        {mergedData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            No observation days recorded for this symptom.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={mergedData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} />
              <YAxis domain={[0, 4]} ticks={[0, 1, 2, 3, 4]} tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  fontSize: '11px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />

              {/* Primary Daily Scatter Points */}
              <Line
                type="monotone"
                dataKey="intensity"
                name={`${primaryLabel} (Daily)`}
                stroke="#94a3b8"
                strokeWidth={1}
                dot={{ r: 2.5, fill: '#64748b' }}
              />

              {/* Primary SMA-7 Wave */}
              <Line
                type="monotone"
                dataKey="sma_7"
                name={`${primaryLabel} (7d SMA)`}
                stroke="#0d9488"
                strokeWidth={2.5}
                dot={false}
              />

              {/* Primary SMA-30 Baseline */}
              <Line
                type="monotone"
                dataKey="sma_30"
                name={`${primaryLabel} (30d Baseline)`}
                stroke="#0f766e"
                strokeWidth={2.5}
                strokeDasharray="4 4"
                dot={false}
              />

              {/* Secondary Comparison Line if enabled */}
              {compareSymptom && (
                <Line
                  type="monotone"
                  dataKey="compare_sma_7"
                  name={`${compareLabel} (7d SMA)`}
                  stroke="#8b5cf6"
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