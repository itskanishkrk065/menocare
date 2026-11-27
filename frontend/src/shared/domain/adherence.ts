/**
 * Pure Medication Adherence Calculator
 * Framework-agnostic.
 */

export interface AdherenceCalculationResult {
  totalExpectedDoses: number;
  recordedTakenDoses: number;
  adherencePercentage: number;
  unrecordedDoses: number;
  summaryLabel: string;
}

export function calculateAdherence(
  doses: Array<{ date: string; taken: boolean; recorded: boolean }>,
  windowDays: number = 7
): AdherenceCalculationResult {
  const windowSlice = doses.slice(-windowDays);
  const totalExpectedDoses = windowSlice.length;

  if (totalExpectedDoses === 0) {
    return {
      totalExpectedDoses: 0,
      recordedTakenDoses: 0,
      adherencePercentage: 100,
      unrecordedDoses: 0,
      summaryLabel: 'No active doses in period',
    };
  }

  const recordedTakenDoses = windowSlice.filter((d) => d.taken).length;
  const unrecordedDoses = windowSlice.filter((d) => !d.recorded).length;
  const adherencePercentage = Math.round((recordedTakenDoses / totalExpectedDoses) * 100);

  return {
    totalExpectedDoses,
    recordedTakenDoses,
    adherencePercentage,
    unrecordedDoses,
    summaryLabel: `${adherencePercentage}% of scheduled doses logged as taken`,
  };
}
