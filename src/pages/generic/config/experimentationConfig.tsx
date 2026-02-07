import { GenericDetailPageConfig, FetchResult } from '../config';
import { ExpOverviewCard } from '@/components/features/experimentation/ExpOverview';
import { ExpDetailsCard, ExpDetailsSkeleton } from '@/components/features/experimentation/ExpDetails';
import { ConfOverviewSkeleton } from '@/components/features/conference/ConfOverview';
import { getResourceDetails } from '@/services/resourceDetails';
import { createExperimentationViews } from '@/pages/generic/helpers';

/**
 * Configuration pour les pages d'expérimentation
 *
 * Utilise l'endpoint unifié getResourceDetails
 */
export const experimentationConfig: GenericDetailPageConfig = {
  // Data fetching avec unified endpoint
  dataFetcher: async (id: string): Promise<FetchResult> => {
    const data = await getResourceDetails(id);

    if (!data) {
      throw new Error(`Experimentation ${id} not found`);
    }

    return {
      itemDetails: {
        id: data.id,
        title: data.title,
        description: data.description,
        abstract: data.abstract, // Pour createHypothesisView
        date: data.date,
        status: data.status,
        percentage: data.percentage,
        actants: data.actants || [],
        associatedMedia: data.associatedMedia || [],
        url: data.videoUrl,
        // Données pour les vues - les helpers les cherchent dans itemDetails
        feedbacks: data.feedbacks || [],
        references: data.references || [], // Pour createScientificReferencesView
        tools: data.tools || [],
      },
      keywords: (data.keywords || []).map((kw: any) => ({
        ...kw,
        title: kw.name || kw.title,
      })),
      recommendations: [], // Les recommendations sont dans viewData
      viewData: {
        // Garder aussi dans viewData pour compatibilité avec le système générique
        tools: data.tools || [],
        feedbacks: data.feedbacks || [],
        citations: data.citations || [],
        references: data.references || [],
        relatedExperimentations: data.relatedExperimentations || [],
      },
    };
  },

  // Fetch recommendations from viewData
  fetchRecommendations: async (fetchedData?: any) => {
    // Use relatedExperimentations from viewData
    if (fetchedData?.viewData?.relatedExperimentations) {
      return fetchedData.viewData.relatedExperimentations.map((exp: any) => ({
        id: exp.id,
        title: exp.title,
        type: 'experimentation',
        thumbnail: exp.thumbnail,
        personnes: [], // Les actants seront chargés si nécessaire
      }));
    }
    return [];
  },

  // Composants
  overviewComponent: ExpOverviewCard,
  detailsComponent: ExpDetailsCard,
  overviewSkeleton: ConfOverviewSkeleton,
  detailsSkeleton: ExpDetailsSkeleton,

  // Mappers de props - ici on ajoute percentage et status pour la barre de progression
  mapOverviewProps: (exp: any, currentVideoTime: number) => ({
    id: exp.id,
    title: exp.title,
    personnes: exp.actants, // Tous les crédits sont maintenant fusionnés dans actants
    medias: exp.associatedMedia?.map((media: any) => media.thumbnail).filter((url: string) => url) || [],
    fullUrl: exp.url,
    currentTime: currentVideoTime,
    buttonText: 'Voir plus',
    percentage: exp.percentage, // Spécifique aux expérimentations
    status: exp.status, // Spécifique aux expérimentations
  }),

  mapDetailsProps: (exp: any) => ({
    date: exp.date,
    actants: exp.actants,
    description: exp.description,
  }),

  // Mapper pour les recommandations (format SmConfCard)
  mapRecommendationProps: (exp: any) => ({
    id: exp.id,
    title: exp.title,
    type: 'experimentation',
    url: null, // url est pour YouTube, on ne l'utilise pas ici
    thumbnail: exp.associatedMedia?.[0] || exp.thumbnail || null,
    personnes: exp.actants || [],
  }),

  //  Options de vue - tools, feedbacks, citations, références affichées dans la colonne de droite
  viewOptions: createExperimentationViews(
    (_itemDetails, viewData) => viewData?.tools || [],
    (tool) => `/corpus/tool/${tool.id}`
  ),

  // Sections optionnelles
  showKeywords: true,
  showRecommendations: true,
  showComments: true,
  recommendationsTitle: 'Expérimentations similaires',

  // Type à afficher
  type: 'Expérimentation',
};
