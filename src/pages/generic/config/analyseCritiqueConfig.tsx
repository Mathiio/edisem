import { GenericDetailPageConfig, FetchResult } from '../config';
import { RecitiaOverviewCard, RecitiaOverviewSkeleton } from '@/components/features/misesEnRecits/RecitiaOverview';
import { RecitiaDetailsCard, RecitiaDetailsSkeleton } from '@/components/features/misesEnRecits/RecitiaDetails';
import { getResourceDetails } from '@/services/resourceDetails';
import { createTargetsListView, createTextView } from '../helpers';

/**
 * Configuration pour les pages d'analyse critique
 */
export const analyseCritiqueConfig: GenericDetailPageConfig = {
  dataFetcher: async (id: string): Promise<FetchResult> => {
    const annotationData = await getResourceDetails(id);
    return {
      itemDetails: annotationData,
      keywords: (annotationData?.keywords || []).map((kw: any) => ({
        ...kw,
        title: kw.name || kw.title,
      })),
      recommendations: [],
    };
  },

  overviewComponent: RecitiaOverviewCard,
  detailsComponent: RecitiaDetailsCard,
  overviewSkeleton: RecitiaOverviewSkeleton,
  detailsSkeleton: RecitiaDetailsSkeleton,

  mapOverviewProps: (analyse: any, currentVideoTime: number) => ({
    id: analyse.id,
    title: analyse.title,
    personnes: analyse.contributor ? [analyse.contributor] : [],
    medias: analyse.associatedMedia,
    fullUrl: analyse.fullUrl,
    currentTime: currentVideoTime,
    buttonText: 'Voir plus',
  }),

  mapDetailsProps: (analyse: any) => ({
    actants: analyse.contributor ? [analyse.contributor] : [],
    date: analyse.created,
    description: analyse.description,
    genre: analyse.genre,
    medium: analyse.medium,
  }),

  // Mapper pour les recommandations (format SmConfCard)
  mapRecommendationProps: (analyse: any) => ({
    id: analyse.id,
    title: analyse.title,
    type: 'annotation',
    url: null, // url est pour YouTube, on ne l'utilise pas ici
    thumbnail: analyse.associatedMedia?.[0] || analyse.thumbnail || null,
    actant: analyse.contributor ? [analyse.contributor] : [],
    date: analyse.created,
  }),

  // Vue unique : Références
  viewOptions: [
    createTextView({
      key: 'analyseCritique',
      title: 'Analyse critique',
      getText: (itemDetails: { description: string }) => itemDetails?.description,
    }),
    // Vue principale : afficher le target (la ressource analysée)
    createTargetsListView({
      key: 'target',
      title: 'Ressource analysée',
      getTargets: (itemDetails) => itemDetails?.target || [],
    }),
    createTargetsListView({
      key: 'related',
      title: 'Ressources liées',
      getTargets: (itemDetails) => itemDetails?.related || [],
    }),
  ],

  showKeywords: true,
  showRecommendations: false, // Will implement with QueryCardHelper later
  showComments: true,
  recommendationsTitle: 'Autres analyses critiques',

  // Type à afficher
  type: 'Analyse critique',
};
