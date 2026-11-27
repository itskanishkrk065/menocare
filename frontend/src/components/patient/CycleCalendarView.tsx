import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Droplet,
  Sparkles,
  Info,
  Clock,
  AlertCircle,
  Activity,
} from 'lucide-react';
import { translateStage } from '../../utils/terminology';

interface CycleCalendarViewProps {
  history: any[];
  strawStage?: string;
  onSelectDate?: (date: string) => void;
}

export const CycleCalendarView: React.FC<CycleCalendarViewProps> = ({
  history,
  strawStage = 'early_transition',
  onSelectDate,
}) => {
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date());
  const [selectedDayRecord, setSelectedDayRecord] = useState<any | null>(null);

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  // Create lookup map of records by 'YYYY-MM-DD'
  const historyMap = new Map<string, any>();
  history.forEach((h) => {
    historyMap.set(h.date, h);
  });

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  // Calendar math
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const pad = (n: number) => n.toString().padStart(2, '0');

  // Days since last bleeding
  let daysSinceLastBleed = 0;
  const bleedingDates = history
    .filter((h) => h.bleeding && h.bleeding.status && h.bleeding.status !== 'none')
    .map((h) => new Date(h.date).getTime())
    .sort((a, b) => b - a);

  if (bleedingDates.length > 0) {
    const diffTime = Math.abs(Date.now() - bleedingDates[0]);
    daysSinceLastBleed = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  return (
    <div className="bg-cream rounded-[26px] p-6 border border-[#E2DBD0] shadow-warm-sm space-y-6">
      
      {/* Top Banner & Cycle KPIs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2DBD0]/70 pb-5">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="p-2 rounded-xl bg-peach-soft text-peach border border-peach/30 shadow-warm-sm">
              <Droplet className="w-5 h-5 text-[#C48068]" />
            </span>
            <h3 className="font-serif text-xl font-semibold text-charcoal">
              Cycle & Period Calendar
            </h3>
          </div>
          <p className="text-xs text-charcoal-muted mt-1">
            Track cycle lengths, missed periods, and flow intensity during your menopause transition.
          </p>
        </div>

        {/* Amenorrhea Counter Badge */}
        <div className="flex items-center gap-3">
          <div className="bg-peach-soft px-4 py-2 rounded-xl border border-peach/30 text-center shadow-warm-sm">
            <div className="text-xs font-medium text-charcoal-muted">
              Days Since Last Period
            </div>
            <div className="font-serif text-lg font-bold text-charcoal">
              {daysSinceLastBleed > 0 ? `${daysSinceLastBleed} Days` : 'Period Active'}
            </div>
          </div>
          <div className="bg-sage-soft px-4 py-2 rounded-xl border border-sage/30 text-center shadow-warm-sm">
            <div className="text-xs font-medium text-sage-dark">
              Menopause Stage
            </div>
            <div className="text-xs font-bold text-sage-dark">
              {translateStage(strawStage, 'patient')}
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Controls */}
      <div className="flex items-center justify-between">
        <h4 className="font-serif text-lg font-semibold text-charcoal flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-sage-dark" />
          <span>{monthNames[month]} {year}</span>
        </h4>

        <div className="flex items-center space-x-1.5">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1.5 rounded-xl bg-ivory hover:bg-oat-light border border-[#E2DBD0] text-charcoal transition-all shadow-warm-sm"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentMonthDate(new Date())}
            className="px-3 py-1 text-xs font-semibold text-charcoal bg-ivory hover:bg-oat-light border border-[#E2DBD0] rounded-xl shadow-warm-sm"
          >
            Today
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1.5 rounded-xl bg-ivory hover:bg-oat-light border border-[#E2DBD0] text-charcoal transition-all shadow-warm-sm"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-charcoal-muted">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Empty cells before month starts */}
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} className="h-14 sm:h-20 rounded-xl sm:rounded-2xl bg-ivory/50 border border-transparent" />
        ))}

        {/* Days of current month */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const dateStr = `${year}-${pad(month + 1)}-${pad(dayNum)}`;
          const record = historyMap.get(dateStr);
          const bleeding = record?.bleeding;
          const isBleeding = bleeding && bleeding.status && bleeding.status !== 'none';
          const isSelected = selectedDayRecord?.date === dateStr;

          // Flow color mapping in Warm Health palette
          let bgClass = 'bg-white border-[#E2DBD0] text-charcoal hover:border-sage';
          if (isBleeding) {
            if (bleeding.status === 'spotting') {
              bgClass = 'bg-peach-soft border-peach text-charcoal font-semibold';
            } else if (bleeding.status === 'light') {
              bgClass = 'bg-peach/25 border-peach text-charcoal font-bold';
            } else if (bleeding.status === 'normal') {
              bgClass = 'bg-peach border-peach text-charcoal font-bold shadow-warm-sm';
            } else if (bleeding.status === 'heavy') {
              bgClass = 'bg-[#C48068] border-[#9E604C] text-cream font-bold ring-2 ring-peach/50';
            }
          }

          if (isSelected) {
            bgClass += ' ring-2 ring-sage-dark shadow-warm-md';
          }

          return (
            <div
              key={dateStr}
              onClick={() => {
                setSelectedDayRecord(record || { date: dateStr, responses: {}, bleeding: null });
                if (onSelectDate) onSelectDate(dateStr);
              }}
              className={`h-14 sm:h-20 rounded-xl sm:rounded-2xl border p-1 sm:p-2 transition-all cursor-pointer flex flex-col justify-between ${bgClass}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">{dayNum}</span>
                {isBleeding && (
                  <Droplet className="w-3 h-3 text-peach shrink-0 fill-current" />
                )}
              </div>

              {/* Day indicator dots */}
              <div className="flex items-center gap-1 flex-wrap">
                {record?.hot_flashes > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Hot Flash Logged" />
                )}
                {record?.mrs_total !== undefined && (
                  <span className="w-1.5 h-1.5 rounded-full bg-sage-dark" title="MRS Recorded" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Day Telemetry Details Panel */}
      {selectedDayRecord && (
        <div className="p-5 rounded-2xl bg-ivory border border-[#E2DBD0] shadow-warm-sm space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="font-serif text-base font-semibold text-charcoal">
              Telemetry Record for {selectedDayRecord.date}
            </h5>
            <button
              onClick={() => setSelectedDayRecord(null)}
              className="text-xs text-charcoal-muted hover:text-charcoal"
            >
              Clear
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-white rounded-xl border border-[#E2DBD0]">
              <span className="text-charcoal-muted block">Flow Status:</span>
              <strong className="text-charcoal capitalize mt-0.5 block">
                {selectedDayRecord.bleeding?.status || 'No bleeding recorded'}
              </strong>
            </div>
            <div className="p-3 bg-white rounded-xl border border-[#E2DBD0]">
              <span className="text-charcoal-muted block">Pelvic Pain / Cramps:</span>
              <strong className="text-charcoal mt-0.5 block">
                {selectedDayRecord.pelvic_pain_intensity ?? 'None reported'}
              </strong>
            </div>
            <div className="p-3 bg-white rounded-xl border border-[#E2DBD0]">
              <span className="text-charcoal-muted block">Sentinel Hot Flashes:</span>
              <strong className="text-charcoal mt-0.5 block">
                {selectedDayRecord.hot_flashes ?? 0} episodes
              </strong>
            </div>
          </div>
        </div>
      )}

      {/* Color Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-charcoal-muted pt-2 border-t border-[#E2DBD0]/60">
        <span className="font-semibold text-charcoal">Flow Guide:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-peach-soft border border-peach" />
          <span>Spotting</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-peach border border-peach" />
          <span>Moderate Flow</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#C48068]" />
          <span>Heavy Flow</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span>Vasomotor Event</span>
        </div>
      </div>

    </div>
  );
};
