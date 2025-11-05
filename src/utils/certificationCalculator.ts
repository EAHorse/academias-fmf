export interface CertificationLevel {
  name: string;
  minScore: number;
  maxScore: number;
  benefits: string;
  color: string;
  bgColor: string;
}

export const CERTIFICATION_LEVELS: CertificationLevel[] = [
  {
    name: 'Categoría 1 (Elite)',
    minScore: 850,
    maxScore: 1000,
    benefits: 'Certificación máxima + todos los beneficios',
    color: 'text-yellow-800',
    bgColor: 'bg-yellow-100'
  },
  {
    name: 'Categoría 2 (Avanzado)',
    minScore: 650,
    maxScore: 849,
    benefits: 'Certificación intermedia + beneficios estándar',
    color: 'text-blue-800',
    bgColor: 'bg-blue-100'
  },
  {
    name: 'Categoría 3 (Básico)',
    minScore: 450,
    maxScore: 649,
    benefits: 'Certificación básica + beneficios limitados',
    color: 'text-green-800',
    bgColor: 'bg-green-100'
  },
  {
    name: 'Pre-Certificación',
    minScore: 300,
    maxScore: 449,
    benefits: 'Plan de mejora obligatorio',
    color: 'text-orange-800',
    bgColor: 'bg-orange-100'
  },
  {
    name: 'No Certificable',
    minScore: 0,
    maxScore: 299,
    benefits: 'Reestructuración requerida',
    color: 'text-red-800',
    bgColor: 'bg-red-100'
  }
];

export function calculateCertification(totalScore: number): CertificationLevel {
  const level = CERTIFICATION_LEVELS.find(
    level => totalScore >= level.minScore && totalScore <= level.maxScore
  );

  return level || CERTIFICATION_LEVELS[CERTIFICATION_LEVELS.length - 1];
}

export function calculateWeightedScore(
  scores: Record<string, number>,
  weights: Record<string, number>
): number {
  let totalWeightedScore = 0;

  Object.keys(scores).forEach(categoryId => {
    const categoryScore = scores[categoryId];
    const categoryWeight = weights[categoryId] || 0;
    totalWeightedScore += (categoryScore * categoryWeight) / 100;
  });

  return Math.round(totalWeightedScore * 10) / 10;
}

export function normalizeCategoryScore(rawScore: number, maxPossible: number): number {
  if (maxPossible === 0) return 0;
  return Math.min(100, (rawScore / maxPossible) * 100);
}
