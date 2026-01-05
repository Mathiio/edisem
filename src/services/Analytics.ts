/**
 * Service pour l'API Analytics
 * Endpoints optimisés pour les visualisations analytiques (heatmaps, trends, coverage)
 */

const API_BASE = 'https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Analytics';

// ========== TYPES ==========

/**
 * Vue d'ensemble - comptages par type
 */
export interface TypeCount {
  type: string;
  label: string;
  count: number;
  templateId: number;
}

export interface OverviewData {
  types: TypeCount[];
  total: number;
  generatedAt: string;
}

/**
 * Activité par jour (heatmap calendrier)
 */
export interface DayActivity {
  date: string;
  count: number;
  weekday: number; // 0=dimanche
  week: number;
}

export interface ActivityByDayData {
  year: number;
  days: DayActivity[];
  stats: {
    totalActivity: number;
    activeDays: number;
    maxDailyActivity: number;
    avgDailyActivity: number;
  };
}

/**
 * Tendances des keywords
 */
export interface KeywordInfo {
  id: number;
  title: string;
  key: string;
  total?: number;
}

export interface KeywordTrendPoint {
  year: number;
  [key: string]: number; // kw_123: count
}

export interface KeywordTrendsData {
  keywords: KeywordInfo[];
  timeline: KeywordTrendPoint[];
}

/**
 * Timeline des ressources
 */
export interface TimelineItem {
  id: number;
  title: string;
  created: string;
  template_id: number;
  type: string;
  label: string;
}

export interface TimelineData {
  items: TimelineItem[];
  count: number;
}

/**
 * Matrice de couverture
 */
export interface KeywordUsage {
  keyword_id: string;
  keyword_title: string;
  usage_count: number;
}

export interface TypeCoverage {
  type: string;
  label: string;
  keywords: Record<string, number>; // keywordId -> count
}

export interface CoverageGap {
  type: string;
  typeLabel: string;
  keywordId: string;
  keywordTitle: string;
}

export interface CoverageMatrixData {
  matrix: TypeCoverage[];
  keywords: KeywordUsage[];
  types: string[];
  gaps: CoverageGap[];
  gapCount: number;
}

/**
 * Ressources orphelines
 */
export interface OrphanResource {
  id: number;
  title: string;
  template_id: number;
  created: string;
  link_count: number;
  type: string;
  label: string;
}

export interface OrphansByType {
  type: string;
  label: string;
  count: number;
  items: OrphanResource[];
}

export interface OrphanResourcesData {
  threshold: number;
  totalOrphans: number;
  byType: OrphansByType[];
  items: OrphanResource[];
}

/**
 * Complétude des métadonnées
 * Basée sur les propriétés définies dans le Resource Template de chaque type
 */
export interface PropertyCompleteness {
  id: number;
  label: string;
  required: boolean;
  filled: number;
  missing: number;
  percentage: number;
}

export interface TypeCompleteness {
  type: string;
  label: string;
  total: number;
  templatePropertyCount: number;
  properties: Record<string, PropertyCompleteness>;
  overallCompleteness: number;
  requiredCompleteness: number;
}

export interface CompletenessStatsData {
  stats: TypeCompleteness[];
}

/**
 * Relations entre types (chord diagram)
 */
export interface TypeNode {
  id: string;
  label: string;
}

export interface TypeLink {
  source: string;
  target: string;
  value: number;
}

export interface TypeRelationsData {
  nodes: TypeNode[];
  links: TypeLink[];
}

/**
 * Co-occurrence des keywords
 */
export interface KeywordNode {
  id: number;
  label: string;
  value: number;
}

export interface KeywordLink {
  source: number;
  target: number;
  value: number;
}

export interface KeywordCooccurrenceData {
  nodes: KeywordNode[];
  links: KeywordLink[];
}

/**
 * Métriques des actants
 */
export interface ActantMetric {
  id: number;
  name: string;
  intervention_count: number;
  keyword_diversity: number;
  picture: string | null;
}

export interface ActantMetricsData {
  actants: ActantMetric[];
  count: number;
}

/**
 * Réseau de collaboration
 */
export interface CollaborationNode {
  id: number;
  name: string;
  picture: string | null;
}

export interface CollaborationLink {
  source: number;
  target: number;
  value: number;
}

export interface CollaborationNetworkData {
  nodes: CollaborationNode[];
  links: CollaborationLink[];
}

// ========== FONCTIONS API ==========

/**
 * Récupère la vue d'ensemble (comptages par type)
 */
export async function getOverview(): Promise<OverviewData> {
  const response = await fetch(`${API_BASE}&action=getOverview&json=1`);
  if (!response.ok) {
    throw new Error("Erreur lors de la récupération de la vue d'ensemble");
  }
  return response.json();
}

/**
 * Récupère l'activité par jour pour une année (heatmap calendrier)
 */
export async function getActivityByDay(year?: number): Promise<ActivityByDayData> {
  const yearParam = year ? `&year=${year}` : '';
  const response = await fetch(`${API_BASE}&action=getActivityByDay${yearParam}&json=1`);
  if (!response.ok) {
    throw new Error("Erreur lors de la récupération de l'activité");
  }
  return response.json();
}

/**
 * Récupère les tendances des keywords dans le temps
 */
export async function getKeywordTrends(limit?: number): Promise<KeywordTrendsData> {
  const limitParam = limit ? `&limit=${limit}` : '';
  const response = await fetch(`${API_BASE}&action=getKeywordTrends${limitParam}&json=1`);
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des tendances');
  }
  return response.json();
}

/**
 * Récupère la timeline des ressources
 */
export async function getTimeline(types?: string[]): Promise<TimelineData> {
  const typesParam = types ? `&types=${types.join(',')}` : '';
  const response = await fetch(`${API_BASE}&action=getTimeline${typesParam}&json=1`);
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération de la timeline');
  }
  return response.json();
}

/**
 * Récupère la matrice de couverture Types × Keywords
 */
export async function getCoverageMatrix(topKeywords?: number): Promise<CoverageMatrixData> {
  const param = topKeywords ? `&topKeywords=${topKeywords}` : '';
  const response = await fetch(`${API_BASE}&action=getCoverageMatrix${param}&json=1`);
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération de la matrice de couverture');
  }
  return response.json();
}

/**
 * Récupère les ressources orphelines (peu connectées)
 */
export async function getOrphanResources(threshold?: number): Promise<OrphanResourcesData> {
  const param = threshold ? `&threshold=${threshold}` : '';
  const response = await fetch(`${API_BASE}&action=getOrphanResources${param}&json=1`);
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des ressources orphelines');
  }
  return response.json();
}

/**
 * Récupère les statistiques de complétude des métadonnées
 */
export async function getCompletenessStats(): Promise<CompletenessStatsData> {
  const response = await fetch(`${API_BASE}&action=getCompletenessStats&json=1`);
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des statistiques de complétude');
  }
  return response.json();
}

/**
 * Récupère les relations entre types (pour chord diagram)
 */
export async function getTypeRelations(): Promise<TypeRelationsData> {
  const response = await fetch(`${API_BASE}&action=getTypeRelations&json=1`);
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des relations entre types');
  }
  return response.json();
}

/**
 * Récupère les co-occurrences de keywords
 */
export async function getKeywordCooccurrence(limit?: number, minOccurrence?: number): Promise<KeywordCooccurrenceData> {
  const params = [];
  if (limit) params.push(`limit=${limit}`);
  if (minOccurrence) params.push(`minOccurrence=${minOccurrence}`);
  const queryString = params.length ? `&${params.join('&')}` : '';

  const response = await fetch(`${API_BASE}&action=getKeywordCooccurrence${queryString}&json=1`);
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des co-occurrences');
  }
  return response.json();
}

/**
 * Récupère les métriques des actants
 */
export async function getActantMetrics(limit?: number): Promise<ActantMetricsData> {
  const param = limit ? `&limit=${limit}` : '';
  const response = await fetch(`${API_BASE}&action=getActantMetrics${param}&json=1`);
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des métriques actants');
  }
  return response.json();
}

/**
 * Récupère le réseau de collaboration entre actants
 */
export async function getCollaborationNetwork(minCollabs?: number): Promise<CollaborationNetworkData> {
  const param = minCollabs ? `&minCollabs=${minCollabs}` : '';
  const response = await fetch(`${API_BASE}&action=getCollaborationNetwork${param}&json=1`);
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération du réseau de collaboration');
  }
  return response.json();
}

/**
 * Récupère les keywords spécifiques à un type de ressource
 */
export interface TypeKeywordsData {
  type: string;
  label: string;
  totalResources: number;
  resourcesWithKeywords: number;
  coveragePercentage: number;
  keywords: Array<{
    id: number;
    title: string;
    count: number;
  }>;
}

export async function getKeywordsByType(type: string): Promise<TypeKeywordsData> {
  const response = await fetch(`${API_BASE}&action=getKeywordsByType&type=${encodeURIComponent(type)}&json=1`);
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des keywords par type');
  }
  return response.json();
}

/**
 * Récupère les statistiques de couverture par type
 */
export interface TypeCoverageStats {
  type: string;
  label: string;
  totalResources: number;
  resourcesWithTopKeywords: number;
  coveragePercentage: number;
}

export interface CoverageStatsData {
  stats: TypeCoverageStats[];
  topKeywordsCount: number;
}

export async function getCoverageStats(topKeywords?: number): Promise<CoverageStatsData> {
  const param = topKeywords ? `&topKeywords=${topKeywords}` : '';
  const response = await fetch(`${API_BASE}&action=getCoverageStats${param}&json=1`);
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des statistiques de couverture');
  }
  return response.json();
}

// ========== HELPER FUNCTIONS ==========

/**
 * Préfixe une URL de média avec le domaine
 */
export function getFullMediaUrl(relativePath: string | null): string | null {
  if (!relativePath) return null;
  return `https://tests.arcanes.ca/omk${relativePath}`;
}

/**
 * Années disponibles pour l'analyse
 */
export function getAvailableYears(): number[] {
  const currentYear = new Date().getFullYear();
  // Retourner les 5 dernières années par défaut
  return Array.from({ length: 5 }, (_, i) => currentYear - i);
}
