/**
 * Fonctions utilitaires pour le Dashboard analytique
 */

import type {
  OverviewData,
  TypeCount,
  CompletenessStatsData,
  ActivityByDayData,
} from '@/services/Analytics';

/**
 * Interface pour les données agrégées par mois
 */
export interface MonthlyActivity {
  month: string; // Format "YYYY-MM"
  count: number;
}

/**
 * Calcule la complétude moyenne globale à travers tous les types de ressources
 */
export function calculateOverallCompleteness(data: CompletenessStatsData): number {
  if (!data.stats.length) return 0;

  const sum = data.stats.reduce((total, type) => total + type.overallCompleteness, 0);
  return Math.round(sum / data.stats.length);
}

/**
 * Trouve le type de ressource le plus actif (celui avec le plus de ressources)
 */
export function getMostActiveType(overview: OverviewData): TypeCount | null {
  if (!overview.types.length) return null;

  return overview.types.reduce((max, type) => (type.count > max.count ? type : max));
}

/**
 * Calcule le pourcentage de diversité des types
 * (combien de types différents sont utilisés par rapport au total possible)
 */
export function calculateTypeDiversity(overview: OverviewData): number {
  if (!overview.types.length) return 0;

  const activeTypes = overview.types.filter((t) => t.count > 0).length;
  const totalTypes = overview.types.length;

  return Math.round((activeTypes / totalTypes) * 100);
}

/**
 * Agrège l'activité quotidienne par mois
 */
export function aggregateActivityByMonth(activity: ActivityByDayData): MonthlyActivity[] {
  const monthMap = new Map<string, number>();

  activity.days.forEach((day) => {
    const month = day.date.substring(0, 7); // Extrait "YYYY-MM" de "YYYY-MM-DD"
    monthMap.set(month, (monthMap.get(month) || 0) + day.count);
  });

  return Array.from(monthMap.entries())
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

/**
 * Retourne une couleur pour un type de ressource donné
 * Assure une cohérence visuelle à travers le dashboard
 */
export function getTypeColor(type: string): string {
  const colorMap: Record<string, string> = {
    mediagraphie: '#0284c7', // datavisBlue
    bibliographie: '#84cc16', // datavisGreen
    citation: '#eab308', // datavisYellow
    oeuvre: '#c2410c', // datavisOrange
    recitArtistique: '#c2410c', // datavisOrange
    recitScientifique: '#8b5cf6', // violet
    recitCitoyen: '#ec4899', // pink
    recitMediatique: '#06b6d4', // cyan
    recitTechnoIndustriel: '#6366f1', // indigo
    experimentation: '#f59e0b', // amber
    tool: '#10b981', // emerald
    annotation: '#a855f7', // purple
    seminar: '#3b82f6', // blue
    colloque: '#14b8a6', // teal
    studyday: '#f97316', // orange
    elementEsthetique: '#db2777', // pink-600
    elementNarratif: '#7c3aed', // violet-600
    actant: '#059669', // emerald-600
    keyword: '#ca8a04', // yellow-600
  };

  return colorMap[type] || '#64748b'; // default: slate-500
}

/**
 * Retourne une couleur basée sur le pourcentage de complétude
 * Gradient: Rouge (faible) → Jaune (moyen) → Vert (élevé)
 */
export function getCompletenessColor(percentage: number): string {
  if (percentage < 30) return '#ef4444'; // red-500
  if (percentage < 60) return '#f59e0b'; // amber-500
  if (percentage < 90) return '#eab308'; // yellow-500
  return '#84cc16'; // green-500 (datavisGreen)
}

/**
 * Formate un nombre avec séparateurs de milliers
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('fr-FR');
}

/**
 * Calcule le pourcentage avec 1 décimale
 */
export function calculatePercentage(part: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((part / total) * 1000) / 10; // 1 décimale
}
