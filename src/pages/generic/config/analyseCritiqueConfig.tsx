import { GenericDetailPageConfig, FetchResult } from '../config';
import { RecitiaOverviewCard, RecitiaOverviewSkeleton } from '@/components/features/miseEnRecit/RecitiaOverview';
import { RecitiaDetailsCard, RecitiaDetailsSkeleton } from '@/components/features/miseEnRecit/RecitiaDetails';
import { getAnnotations } from '@/services/Items';
import { createItemsListView } from '../helpers';

/**
 * Configuration pour les pages d'analyse critique
 */
export const analyseCritiqueConfig: GenericDetailPageConfig = {
  dataFetcher: async (id: string): Promise<FetchResult> => {
    const annotation = await getAnnotations(id);

    // getAnnotations retourne un tableau, prendre le premier élément
    const annotationData = Array.isArray(annotation) && annotation.length > 0 ? annotation[0] : annotation;

    return {
      itemDetails: annotationData,
      keywords: [],
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
    personnes: analyse.actants,
    medias: analyse.associatedMedia,
    fullUrl: analyse.fullUrl,
    currentTime: currentVideoTime,
    buttonText: 'Voir plus',
  }),

  mapDetailsProps: (analyse: any) => ({
    actants: analyse.actants,
    date: analyse.date,
    description: analyse.description,
    genre: analyse.genre,
    medium: analyse.medium,
  }),

  // Vue unique : Références
  viewOptions: [
    createItemsListView({
      key: 'References',
      title: 'Références',
      getItems: (itemDetails) => itemDetails?.hasRelatedResource || [],
      emptyMessage: 'Aucune référence disponible',
      annotationType: 'Bibliographie',
    }),
  ],

  showKeywords: false,
  showRecommendations: false,
  showComments: true,
};
