import { ReactNode } from 'react';

/**
 * Résultat du data fetcher
 */
export interface FetchResult {
  itemDetails: any;
  keywords?: any[];
  recommendations?: string[];
  viewData?: Record<string, any>;
}

/**
 * Function pour récupérer les données d'une ressource
 */
export type DataFetcher = (id: string) => Promise<FetchResult>;

/**
 * Function pour récupérer les recommandations
 */
export type RecommendationsFetcher = (ids: string[]) => Promise<any[]>;

/**
 * Context passé aux renderContent functions
 */
export interface RenderContentContext {
  itemDetails: any;
  viewData: Record<string, any>;
  loading: boolean;
}

/**
 * Option de vue (tab/dropdown)
 */
export interface ViewOption {
  key: string;
  title: string;
  renderContent: (context: RenderContentContext) => ReactNode;
}

/**
 * Configuration complète d'une page générique
 */
export interface GenericDetailPageConfig {
  // Data fetching
  dataFetcher: DataFetcher;
  fetchRecommendations?: RecommendationsFetcher;

  // Composants Overview/Details
  overviewComponent: React.ComponentType<any>;
  detailsComponent: React.ComponentType<any>;
  overviewSkeleton?: React.ComponentType<any>;
  detailsSkeleton?: React.ComponentType<any>;

  // Mappers de props
  mapOverviewProps: (itemDetails: any, currentVideoTime: number) => any;
  mapDetailsProps: (itemDetails: any) => any;

  // Options de vue (tabs)
  viewOptions: ViewOption[];

  // Sections optionnelles
  showKeywords?: boolean;
  showRecommendations?: boolean;
  showComments?: boolean;
  recommendationsTitle?: string;
}

