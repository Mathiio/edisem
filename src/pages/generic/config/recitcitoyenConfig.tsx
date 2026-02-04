import { GenericDetailPageConfig, FetchResult } from '../config';
import { RecitiaOverviewCard, RecitiaOverviewSkeleton } from '@/components/features/misesEnRecits/RecitiaOverview';
import { RecitiaDetailsCard, RecitiaDetailsSkeleton } from '@/components/features/misesEnRecits/RecitiaDetails';
import { getRecitsMediatiques, getKeywords, getAnnotationsWithTargets, getRecitsCitoyens } from '@/services/Items';
import { createCulturalReferencesView, createScientificReferencesView, createItemsListView, createTextView } from '../helpers';

// Helper pour normaliser creator (peut être un objet personne ou une chaîne)
const normalizeCreator = (creator: any): any[] => {
  if (!creator) return [];

  // Si c'est déjà un tableau, le retourner tel quel
  if (Array.isArray(creator)) {
    return creator;
  }

  // Si c'est une chaîne de caractères (comme "BBC World Service")
  if (typeof creator === 'string') {
    return [{ name: creator, id: null }];
  }

  // Si c'est un objet (personne hydratée), le mettre dans un tableau
  return [creator];
};

export const recitcitoyenConfig: GenericDetailPageConfig = {
  // Data fetching avec enrichissement des keywords
  dataFetcher: async (id: string): Promise<FetchResult> => {
    const [recit, concepts] = await Promise.all([getRecitsCitoyens(Number(id)), getKeywords()]);
    console.log('recit', recit);
    // Enrichir les keywords si nécessaire
    const recitKeywords = concepts.filter((c: any) => recit?.keywords?.some((k: any) => String(k.id) === String(c.id)));

    // Résoudre les targets et related des descriptions (annotations)
    if (recit?.descriptions) {
      recit.descriptions = await getAnnotationsWithTargets(recit.descriptions);
    }

    return {
      itemDetails: recit,
      keywords: recitKeywords,
      // Pas de recommendations classiques pour déclencher les smart recommendations
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
    personnes: normalizeCreator(recit.creator),
    medias: recit.associatedMedia && recit.associatedMedia.length > 0 ? recit.associatedMedia : recit.thumbnail ? [recit.thumbnail] : [],
    fullUrl: recit.url || recit.source || '#',
    currentTime: currentVideoTime,
    buttonText: 'Voir plus',
  }),

  // Mapper les props pour les détails
  mapDetailsProps: (recit: any) => ({
    date: recit.dateIssued,
    actants: normalizeCreator(recit.creator),
    description:
      [recit.purpose ? `<strong>Objectif:</strong> ${recit.purpose}` : '', recit.application ? `<strong>Résumé:</strong> ${recit.application}` : '']
        .filter(Boolean)
        .join('<br><br>') || '',
  }),

  // Mapper pour les recommandations (format SmConfCard)
  mapRecommendationProps: (recit: any) => ({
    id: recit.id,
    title: recit.title,
    type: 'recit_mediatique',
    url: null, // url est pour YouTube, on ne l'utilise pas ici
    thumbnail: recit.associatedMedia?.[0] || recit.thumbnail || null,
    actant: normalizeCreator(recit.creator),
  }),

  // ✨ Vues personnalisées pour les récits médiatiques
  viewOptions: [
    // Vue 2 : Descriptions / Analyses critiques
    createItemsListView({
      key: 'Descriptions',
      title: 'Analyses détaillées',
      getItems: (itemDetails) => itemDetails?.descriptions || [],
      mapUrl: (item) => `/corpus/analyse-critique/${item.id}`,
    }),

    // Vue 1 : Citations
    createTextView({
      key: 'Citations',
      title: 'Citations',
      getText: (itemDetails) => {
        if (!itemDetails?.citations || itemDetails.citations.length === 0) return '';
        return itemDetails.citations.map((citation: string) => `"${citation}"`).join('<br><br>');
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
  recommendationsTitle: 'Récits médiatiques similaires',

  // Smart recommendations
  smartRecommendations: {
    // Retourne toutes les autres récits médiatiques comme recommandations
    getRelatedItems: async (itemDetails: any) => {
      const recits = await getRecitsMediatiques();
      // Retourner tous les récits sauf celui actuel
      return recits.filter((recit: any) => String(recit.id) !== String(itemDetails.id));
    },

    maxRecommendations: 5, // Afficher plus de recommandations
  },

  // Type à afficher
  type: 'recit_citoyen',
};
