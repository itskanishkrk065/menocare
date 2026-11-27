/**
 * Pure Menopause Rating Scale (MRS) Scoring & Interpretation Engine.
 * Framework-agnostic.
 */

export interface MrsCalculationResult {
  totalScore: number;
  maxScore: number;
  somatovegetativeScore: number;
  psychologicalScore: number;
  urogenitalScore: number;
  impactTier: 'none' | 'mild' | 'moderate' | 'severe';
  impactLabel: string;
}

export function calculateMrsScore(answers: Record<string, number>): MrsCalculationResult {
  const somatovegetativeCodes = ['hot_flashes', 'heart_discomfort', 'sleep_problems', 'joint_discomfort'];
  const psychologicalCodes = ['depressive_mood', 'irritability', 'anxiety', 'exhaustion'];
  const urogenitalCodes = ['sexual_problems', 'bladder_problems', 'vaginal_dryness'];

  const getSum = (codes: string[]) =>
    codes.reduce((acc, code) => acc + (answers[code] !== undefined ? Math.min(4, Math.max(0, answers[code])) : 0), 0);

  const somatovegetativeScore = getSum(somatovegetativeCodes);
  const psychologicalScore = getSum(psychologicalCodes);
  const urogenitalScore = getSum(urogenitalCodes);
  const totalScore = somatovegetativeScore + psychologicalScore + urogenitalScore;

  let impactTier: 'none' | 'mild' | 'moderate' | 'severe' = 'mild';
  let impactLabel = 'Mild Symptoms';

  if (totalScore === 0) {
    impactTier = 'none';
    impactLabel = 'No Reported Symptoms';
  } else if (totalScore <= 14) {
    impactTier = 'mild';
    impactLabel = 'Mild Symptoms';
  } else if (totalScore <= 24) {
    impactTier = 'moderate';
    impactLabel = 'Moderate Symptoms';
  } else {
    impactTier = 'severe';
    impactLabel = 'Noticeable Symptoms';
  }

  return {
    totalScore,
    maxScore: 44,
    somatovegetativeScore,
    psychologicalScore,
    urogenitalScore,
    impactTier,
    impactLabel,
  };
}
