import { GenericDetailPageConfig, FetchResult } from '../config';
import { RecitiaOverviewCard, RecitiaOverviewSkeleton } from '@/components/features/misesEnRecits/RecitiaOverview';
import { RecitiaDetailsCard, RecitiaDetailsSkeleton } from '@/components/features/misesEnRecits/RecitiaDetails';
import { getResourceDetails } from '@/services/resourceDetails';
import { getRecitsTechnoCards } from '@/services/Items';
import { createCriticalAnalysisView, createCulturalReferencesView, createScientificReferencesView, createTextView } from '../helpers';

export const recitTechnoConfig: GenericDetailPageConfig = {
  // Data fetching with unified endpoint
  dataFetcher: async (id: string): Promise<FetchResult> => {
    const data = await getResourceDetails(id);

    if (!data) {
      throw new Error(`Recit Techno-Industriel ${id} not found`);
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
        descriptions: data.descriptions || [],
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
        recit.slogan ? `<strong>Slogan:</strong> ${recit.slogan}` : '',
        recit.application ? `<strong>Résumé:</strong> ${recit.application}` : '',
        recit.conditionInitiale ? `<strong>Condition Initiale:</strong> ${recit.conditionInitiale}` : ''
      ].filter(Boolean).join('<br><br>') || (recit.descriptionLiteral || ''),
  }),

  // Mapper pour les recommandations (format SmConfCard)
  mapRecommendationProps: (recit: any) => ({
    id: recit.id,
    title: recit.title,
    type: recit.type || 'recit_techno_industriel',
    url: null,
    thumbnail: recit.associatedMedia?.[0]?.thumbnail || recit.thumbnail || null,
    actant: recit.actants || [],
  }),

  // ✨ Vues personnalisées pour les récits techno-industriels
  viewOptions: [
    // Vue 1 : Analyses critiques
    createCriticalAnalysisView(),

    // Vue 2 : Figure narrative / Condition initiale
    createTextView({
      key: 'ConditionInitiale',
      title: 'Figure narrative',
      getText: (itemDetails) => itemDetails?.conditionInitiale,
    }),

    // Vue 3 : Références scientifiques
    createScientificReferencesView(),

    // Vue 4 : Contenus culturels
    createCulturalReferencesView(),
  ],

  // Sections optionnelles
  showKeywords: true,
  showComments: true,
  showRecommendations: true,
  recommendationsTitle: 'Récits techno similaires',

  // Smart recommendations
  smartRecommendations: {
    // Retourne tous les autres récits techno-industriels comme recommandations
    getRelatedItems: async (itemDetails: any) => {
      const recits = await getRecitsTechnoCards();
      // Retourner tous les récits sauf celui actuel
      return recits.filter((recit: any) => String(recit.id) !== String(itemDetails.id));
    },

    maxRecommendations: 5,
  },

  // Type à afficher
  type: 'Récit techno-industriel',
};