import { GenericDetailPageConfig, FetchResult } from '../config';
import { RecitiaOverviewCard, RecitiaOverviewSkeleton } from '@/components/features/misesEnRecits/RecitiaOverview';
import { RecitiaDetailsCard, RecitiaDetailsSkeleton } from '@/components/features/misesEnRecits/RecitiaDetails';

import { getResourceDetails } from '@/services/resourceDetails';
import { createOeuvreViews } from '../helpers';

/**
 * Configuration pour les pages d'recit_artistique
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
      const recit_artistique = await getResourceDetails(id);
      
      if (!recit_artistique) {
        throw new Error(`Récit artistique ${id} non trouvé`);
      }

      return {
        itemDetails: recit_artistique,
        keywords: (recit_artistique.keywords || []).map((kw: any) => ({
          ...kw,
          title: kw.name || kw.title,
        })),
        recommendations: recit_artistique.relatedRecits || [],
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
  mapOverviewProps: (recit_artistique: any, currentVideoTime: number) => {
    const medias = [
      ...(recit_artistique.associatedMedia || [])
    ];

    return {
      id: recit_artistique.id,
      title: recit_artistique.title,
      personnes: recit_artistique.personne || [],
      medias: medias.length > 0 ? medias : (recit_artistique.thumbnail ? [recit_artistique.thumbnail] : []),
      credits: recit_artistique.credits,
      fullUrl: recit_artistique.url,
      currentTime: currentVideoTime,
      buttonText: 'Voir plus',
    };
  },

  mapDetailsProps: (recit_artistique: any) => ({
    date: recit_artistique.date,
    description: recit_artistique.description,
    medium: recit_artistique.medium,
    actants: recit_artistique.actants || [],
  }),

  // Mapper pour les recommandations (format SmConfCard)
  mapRecommendationProps: (recit_artistique: any) => ({
    id: recit_artistique.id,
    title: recit_artistique.title,
    type: 'recit_artistique',
    url: null, // url est pour YouTube, on ne l'utilise pas ici
    thumbnail: recit_artistique.associatedMedia?.[0] || recit_artistique.thumbnail || null,
    actant: recit_artistique.personne || recit_artistique.actants || [],
    date: recit_artistique.date,
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
