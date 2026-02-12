import { GenericDetailPageConfig, FetchResult } from '../config';
import { RecitiaOverviewCard, RecitiaOverviewSkeleton } from '@/components/features/misesEnRecits/RecitiaOverview';
import { RecitiaDetailsCard, RecitiaDetailsSkeleton } from '@/components/features/misesEnRecits/RecitiaDetails';

import { getResourceDetails } from '@/services/resourceDetails';
import { createOeuvreViews } from '../helpers';

/**
 * Configuration pour les pages d'recit
 *
 * Cas complexe avec:
 * - 6 vues différentes (ContentScient, ContentCultu, Archives, ElementsNarratifs, ElementsEsthetique, AnalyseCritique)
 * - Enrichissement des keywords depuis plusieurs sources
 * - Mapping complexe pour les éléments narratifs/esthétiques
 */
export const recitArtitstiqueConfig: GenericDetailPageConfig = {
  // Data fetching optimisé via getResourceDetails
  dataFetcher: async (id: string): Promise<FetchResult> => {
    try {
      const recit = await getResourceDetails(id);
      
      if (!recit) {
        throw new Error(`Récit artistique ${id} non trouvé`);
      }

      return {
        itemDetails: recit,
        keywords: (recit.keywords || []).map((kw: any) => ({
          ...kw,
          title: kw.name || kw.title,
        })),
        recommendations: recit.relatedRecits || [],
      };
    } catch (error) {
      console.error('Erreur chargement récit artistique:', error);
      return { itemDetails: null };
    }
  },

  // Composants
  overviewComponent: RecitiaOverviewCard,
  detailsComponent: RecitiaDetailsCard,
  overviewSkeleton: RecitiaOverviewSkeleton,
  detailsSkeleton: RecitiaDetailsSkeleton,

  // Mappers de props
  mapOverviewProps: (recit: any, currentVideoTime: number) => {
    const medias = [
      ...(recit.associatedMedia || [])
    ];

    return {
      id: recit.id,
      title: recit.title,
      personnes: recit.personne || [],
      medias: medias.length > 0 ? medias : (recit.thumbnail ? [recit.thumbnail] : []),
      credits: recit.credits,
      fullUrl: recit.url,
      currentTime: currentVideoTime,
      buttonText: 'Voir plus',
    };
  },

  mapDetailsProps: (recit: any) => ({
    date: recit.date,
    description: recit.description,
    medium: recit.medium,
    actants: recit.actants || [],
  }),

  // Mapper pour les recommandations (format SmConfCard)
  mapRecommendationProps: (recit: any) => ({
    id: recit.id,
    title: recit.title,
    type: recit.type || 'recit_artistique',
    url: null, // url est pour YouTube, on ne l'utilise pas ici
    thumbnail: recit.associatedMedia?.[0] || recit.thumbnail || null,
    actant: recit.personne || recit.actants || [],
    date: recit.date,
  }),

  // Utiliser directement les références fournies par l'API
  fetchRecommendations: async (recommendations) => {
    return recommendations;
  },

  viewOptions: createOeuvreViews(),

  // Sections optionnelles
  showKeywords: true,
  showRecommendations: true,
  showComments: true,
  recommendationsTitle: 'Récits Artistiques similaires',

  // Type à afficher
  type: 'Récit Artistique',
};
