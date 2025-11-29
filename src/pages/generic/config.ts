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
 * Strategy de génération de recommandations intelligentes
 */
export interface SmartRecommendationsStrategy {
  // Récupère toutes les ressources du même type pour trouver des similaires
  getAllResourcesOfType?: () => Promise<any[]>;
  
  // Récupère les éléments liés (ex: autres analyses critiques d'un objet techno)
  // Peut être synchrone (si données déjà dans itemDetails) ou asynchrone
  getRelatedItems?: (itemDetails: any) => any[] | Promise<any[]>;
  
  // Récupère le contexte parent (ex: l'objet techno quand on est sur une analyse critique)
  getParentContext?: (itemDetails: any) => Promise<any>;
  
  // Calcule la similarité entre deux ressources (0-1)
  calculateSimilarity?: (item1: any, item2: any) => number;
  
  // Nombre max de recommandations à afficher
  maxRecommendations?: number;
}

/**
 * Context passé aux renderContent functions
 */
export interface RenderContentContext {
  itemDetails: any;
  viewData: Record<string, any>;
  loading: boolean;
  onTimeChange: (newTime: number) => void;
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
  
  // Smart recommendations (nouvelle approche)
  smartRecommendations?: SmartRecommendationsStrategy;

  // Composants Overview/Details
  overviewComponent: React.ComponentType<any>;
  detailsComponent: React.ComponentType<any>;
  overviewSkeleton?: React.ComponentType<any>;
  detailsSkeleton?: React.ComponentType<any>;

  // Mappers de props
  mapOverviewProps: (itemDetails: any, currentVideoTime: number) => any;
  mapDetailsProps: (itemDetails: any) => any;
  
  // Mapper pour les recommandations (pour SmConfCard)
  mapRecommendationProps?: (item: any) => any;

  // Options de vue (tabs)
  viewOptions: ViewOption[];
  defaultView?: string; // Clé de l'onglet par défaut (sinon utilise le premier élément de viewOptions)

  // Sections optionnelles
  showKeywords?: boolean;
  showRecommendations?: boolean;
  showComments?: boolean;
  recommendationsTitle?: string;
  
  // Type à afficher à droite du titre
  type?: string;
}

