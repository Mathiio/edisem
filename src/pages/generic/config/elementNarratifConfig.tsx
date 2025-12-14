import { GenericDetailPageConfig, FetchResult } from '../config';
import { RecitiaOverviewCard, RecitiaOverviewSkeleton } from '@/components/features/misesEnRecits/RecitiaOverview';
import { RecitiaDetailsCard, RecitiaDetailsSkeleton } from '@/components/features/misesEnRecits/RecitiaDetails';
import { getElementNarratifs, getOeuvres } from '@/services/Items';
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

  // Mapper pour les recommandations (format SmConfCard)
  mapRecommendationProps: (element: any) => ({
    id: element.id,
    title: element.title,
    type: 'elementNarratif',
    url: null, // url est pour YouTube, on ne l'utilise pas ici
    thumbnail: element.associatedMedia?.[0] || element.thumbnail || null,
    actant: [],
  }),

  // Vue unique : Références
  viewOptions: [
    createItemsListView({
      key: 'References',
      title: 'Références',
      getItems: (itemDetails) => itemDetails?.references || [],
      annotationType: 'Bibliographie',
    }),
  ],

  showKeywords: false,
  showRecommendations: true,
  showComments: true,
  recommendationsTitle: 'Autres éléments narratifs',

  // Smart recommendations
  smartRecommendations: {
    // Récupère tous les éléments narratifs pour trouver des similaires
    getAllResourcesOfType: async () => {
      const elements = await getElementNarratifs();
      return elements;
    },

    // Récupère les autres éléments narratifs de la même oeuvre
    getRelatedItems: async (itemDetails) => {
      const oeuvres = await getOeuvres();
      const parentOeuvre = oeuvres.find((o: any) => o.elementsNarratifs?.some((e: any) => String(e.id) === String(itemDetails.id)));

      if (parentOeuvre) {
        return (parentOeuvre.elementsNarratifs || []).filter((e: any) => String(e.id) !== String(itemDetails.id));
      }

      return [];
    },

    maxRecommendations: 5,
  },

  // Type à afficher
  type: 'Élément narratif',
};
