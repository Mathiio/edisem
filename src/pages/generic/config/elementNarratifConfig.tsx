import { GenericDetailPageConfig, FetchResult } from '../config';
import { RecitiaOverviewCard, RecitiaOverviewSkeleton } from '@/components/features/miseEnRecit/RecitiaOverview';
import { RecitiaDetailsCard, RecitiaDetailsSkeleton } from '@/components/features/miseEnRecit/RecitiaDetails';
import { getElementNarratifs } from '@/services/Items';
import { createItemsListView } from '../helpers';

/**
 * Configuration pour les pages d'éléments narratifs
 */
export const elementNarratifConfig: GenericDetailPageConfig = {
  dataFetcher: async (id: string): Promise<FetchResult> => {
    const data = await getElementNarratifs(Number(id));

    return {
      itemDetails: data,
      keywords: [], // TODO: Ajouter les keywords si nécessaire
      recommendations: [],
    };
  },

  overviewComponent: RecitiaOverviewCard,
  detailsComponent: RecitiaDetailsCard,
  overviewSkeleton: RecitiaOverviewSkeleton,
  detailsSkeleton: RecitiaDetailsSkeleton,

  mapOverviewProps: (element: any, currentVideoTime: number) => ({
    id: element.id,
    title: element.title,
    personnes: element.creator,
    medias: element.associatedMedia && element.associatedMedia.length > 0 ? element.associatedMedia : element.associatedMedia ? [element.associatedMedia] : [],
    fullUrl: element.transcript,
    currentTime: currentVideoTime,
    buttonText: 'Voir plus',
  }),

  mapDetailsProps: (element: any) => ({
    date: element.eventDate,
    description: element.description,
    genre: element.genre,
    medium: element.duration,
  }),

  // Vue unique : Références
  viewOptions: [
    createItemsListView({
      key: 'References',
      title: 'Références',
      getItems: (itemDetails) => itemDetails?.references || [],
      emptyMessage: 'Aucune référence disponible',
      annotationType: 'Bibliographie',
    }),
  ],

  showKeywords: false,
  showRecommendations: false,
  showComments: true,
};
