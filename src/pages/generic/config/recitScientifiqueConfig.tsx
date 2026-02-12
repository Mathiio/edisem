import { GenericDetailPageConfig, FetchResult } from '../config';
import { RecitiaOverviewCard, RecitiaOverviewSkeleton } from '@/components/features/misesEnRecits/RecitiaOverview';
import { RecitiaDetailsCard, RecitiaDetailsSkeleton } from '@/components/features/misesEnRecits/RecitiaDetails';
import { getResourceDetails } from '@/services/resourceDetails';
import { getRecitsScientifiquesCards } from '@/services/Items';
import { createCriticalAnalysisView, createCulturalReferencesView, createScientificReferencesView, createTextView } from '../helpers';

export const recitScientifiqueConfig: GenericDetailPageConfig = {
  // Data fetching avec enrichissement des keywords
  // Data fetching with unified endpoint
  dataFetcher: async (id: string): Promise<FetchResult> => {
    const data = await getResourceDetails(id);

    if (!data) {
      throw new Error(`Recit Scientifique ${id} not found`);
    }

    return {
      itemDetails: {
        ...data,
         // Ensure specific fields are mapped/preserved
         date: data.date, 
         actants: data.actants || [],
      },
      keywords: (data.keywords || []).map((kw: any) => ({
        ...kw,
        title: kw.name || kw.title,
      })),
      viewData: {
         // Pass references to viewData for helper functions
         referencesScient: data.referencesScient || [],
         referencesCultu: data.referencesCultu || [],
      }
    };
  },


  // Composants UI réutilisés
  overviewComponent: RecitiaOverviewCard,
  detailsComponent: RecitiaDetailsCard,
  overviewSkeleton: RecitiaOverviewSkeleton,
  detailsSkeleton: RecitiaDetailsSkeleton,

  // Mapper les props pour l'overview
  mapOverviewProps: (recit: any, currentVideoTime: number) => ({
    id: recit.id,
    title: recit.title,
    personnes: recit.actants || [],
    medias: recit.associatedMedia || [],
    fullUrl: recit.url || recit.source || '#',
    currentTime: currentVideoTime,
    buttonText: 'Voir plus',
  }),

  // Mapper les props pour les détails
  mapDetailsProps: (recit: any) => ({
    date: recit.date,
    actants: recit.actants || [],
    description:
      [
        recit.purpose ? `<strong>Objectif:</strong> ${recit.purpose}` : '',
        recit.application ? `<strong>Résumé:</strong> ${recit.application}` : '',
        recit.conditionInitiale ? `<strong>Condition Initiale:</strong> ${recit.conditionInitiale}` : ''
      ].filter(Boolean).join('<br><br>') || (recit.descriptions?.[0]?.description || ''),
  }),

  // Mapper pour les recommandations (format SmConfCard)
  mapRecommendationProps: (recit: any) => ({
    id: recit.id,
    title: recit.title,
    type: recit.type || 'recit_scientifique',
    url: null,
    thumbnail: recit.associatedMedia?.[0]?.thumbnail || recit.thumbnail || null,
    actant: recit.actants || [],
  }),

  // ✨ Vues personnalisées pour les documentations scientifiques
  viewOptions: [
    createCriticalAnalysisView(),

    // Vue 3 : Condition initiale / Contexte
    createTextView({
      key: 'ConditionInitiale',
      title: 'Figure narrative',
      getText: (itemDetails) => itemDetails?.conditionInitiale,
    }),

    createScientificReferencesView(),

    createCulturalReferencesView(),
  ],

  // Sections optionnelles
  showKeywords: true,
  showComments: true,
  showRecommendations: true,
  recommendationsTitle: 'Documentations similaires',

  // Smart recommendations
  smartRecommendations: {
    // Retourne toutes les autres documentations scientifiques comme recommandations
    getRelatedItems: async (itemDetails: any) => {
      const docs = await getRecitsScientifiquesCards();
      // Retourner toutes les docs sauf celle actuelle
      return docs.filter((doc: any) => String(doc.id) !== String(itemDetails.id));
    },

    maxRecommendations: 5, // Afficher plus de recommandations
  },

  // Type à afficher
  type: 'Récit Scientifique',
};
