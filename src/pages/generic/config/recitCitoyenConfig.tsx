import { GenericDetailPageConfig, FetchResult } from '../config';
import { RecitiaOverviewCard, RecitiaOverviewSkeleton } from '@/components/features/misesEnRecits/RecitiaOverview';
import { RecitiaDetailsCard, RecitiaDetailsSkeleton } from '@/components/features/misesEnRecits/RecitiaDetails';
import { getResourceDetails } from '@/services/resourceDetails';
import { getRecitsCitoyensCards } from '@/services/Items';
import { createCulturalReferencesView, createScientificReferencesView, createItemsListView, createTextView, createCriticalAnalysisView } from '../helpers';

export const recitCitoyenConfig: GenericDetailPageConfig = {
  // Data fetching avec enrichissement des keywords
  dataFetcher: async (id: string): Promise<FetchResult> => {
    const data = await getResourceDetails(id);

    if (!data) {
      throw new Error(`Recit Citoyen ${id} not found`);
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
        citations: data.citations || [],
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
    medias: recit.associatedMedia && recit.associatedMedia.length > 0 ? recit.associatedMedia : recit.thumbnail ? [recit.thumbnail] : [],
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
        recit.descriptionLiteral ? `<div class="line-clamp-3">${recit.descriptionLiteral}</div>` : ''
      ]
        .filter(Boolean)
        .join('<br><br>') || (recit.descriptions?.[0]?.description || ''),
  }),

  // Mapper pour les recommandations (format SmConfCard)
  mapRecommendationProps: (recit: any) => ({
    id: recit.id,
    title: recit.title,
    type: recit.type || 'recit_citoyen',
    url: null, // url est pour YouTube, on ne l'utilise pas ici
    thumbnail: recit.associatedMedia?.[0]?.thumbnail || recit.thumbnail || null,
    actant: recit.actants || [],
  }),

  // ✨ Vues personnalisées pour les récits citoyens
  viewOptions: [
    // Vue 2 : Descriptions / Analyses critiques
    createCriticalAnalysisView(),

    // Vue 1 : Citations
    createTextView({
      key: 'Citations',
      title: 'Citations',
      getText: (itemDetails) => {
        if (!itemDetails?.citations || itemDetails.citations.length === 0) return '';
        // Handle both string[] (legacy) and object[] (new)
        return itemDetails.citations.map((c: any) => {
          if (typeof c === 'string') return `"${c}"`;
          return `"${c.citation}"${c.actant?.name && c.actant.name !== 'Inconnu' ? ` — ${c.actant.name}` : ''}`;
        }).join('<br><br>');
      },
    }),

    // Vue 3 : Condition initiale / Contexte
    createTextView({
      key: 'ConditionInitiale',
      title: 'Figure narrative',
      getText: (itemDetails) => itemDetails?.conditionInitiale,
    }),

    // Vue 4 : Outils
    createItemsListView({
      key: 'Tools',
      title: 'Outils',
      getItems: (itemDetails) => itemDetails?.tools || [],
      mapUrl: (item) => `/corpus/outil/${item.id}`,
    }),

    // Vue 5 : Sources
    createScientificReferencesView(),

    createCulturalReferencesView(),
  ],

  // Sections optionnelles
  showKeywords: true,
  showComments: true,
  showRecommendations: true,
  recommendationsTitle: 'Récits citoyens similaires',

  // Smart recommendations
  smartRecommendations: {
    // Retourne toutes les autres récits citoyens comme recommandations
    getRelatedItems: async (itemDetails: any) => {
      const recits = await getRecitsCitoyensCards();
      // Retourner tous les récits sauf celui actuel
      return recits.filter((recit: any) => String(recit.id) !== String(itemDetails.id));
    },

    maxRecommendations: 5, // Afficher plus de recommandations
  },

  // Type à afficher
  type: 'recit_citoyen',
};
