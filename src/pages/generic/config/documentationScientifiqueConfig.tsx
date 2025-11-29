import { GenericDetailPageConfig, FetchResult } from '../config';
import { RecitiaOverviewCard, RecitiaOverviewSkeleton } from '@/components/features/miseEnRecit/RecitiaOverview';
import { RecitiaDetailsCard, RecitiaDetailsSkeleton } from '@/components/features/miseEnRecit/RecitiaDetails';
import { getDocumentationsScientifiques, getKeywords, getAllItems } from '@/services/Items';
import { createItemsListView, createTextView } from '../helpers';

export const documentationScientifiqueConfig: GenericDetailPageConfig = {
  // Data fetching avec enrichissement des keywords
  dataFetcher: async (id: string): Promise<FetchResult> => {
    const [docs, concepts] = await Promise.all([getDocumentationsScientifiques(), getKeywords()]);

    const doc = docs.find((d: any) => String(d.id) === String(id));

    // Enrichir les keywords si nécessaire
    const docKeywords = concepts.filter((c: any) => doc?.keywords?.some((k: any) => String(k.id) === String(c.id)));

    // Extraire les IDs de isRelatedTo pour les recommandations
    const recommendationIds = doc?.isRelatedTo?.map((item: any) => String(item.id)) || [];

    console.log(doc);

    return {
      itemDetails: doc,
      keywords: docKeywords,
      recommendations: recommendationIds,
    };
  },

  // Fonction pour récupérer les recommandations complètes depuis isRelatedTo
  fetchRecommendations: async (ids: string[]) => {
    const allItems = await getAllItems();
    return allItems.filter((item: any) => ids.includes(String(item.id)));
  },

  // Composants UI réutilisés
  overviewComponent: RecitiaOverviewCard,
  detailsComponent: RecitiaDetailsCard,
  overviewSkeleton: RecitiaOverviewSkeleton,
  detailsSkeleton: RecitiaDetailsSkeleton,

  // Mapper les props pour l'overview
  mapOverviewProps: (doc: any, currentVideoTime: number) => ({
    id: doc.id,
    title: doc.title,
    personnes: doc.creator ? [doc.creator] : [],
    medias: doc.associatedMedia || [],
    fullUrl: doc.url || doc.source || '#',
    currentTime: currentVideoTime,
    buttonText: 'Voir plus',
  }),

  // Mapper les props pour les détails
  mapDetailsProps: (doc: any) => ({
    date: doc.dateIssued,
    actants: doc.creator ? [doc.creator] : [],
    description:
      [doc.purpose ? `<strong>Objectif:</strong> ${doc.purpose}` : '', doc.application ? `<strong>Résumé:</strong> ${doc.application}` : ''].filter(Boolean).join('<br><br>') || '',
  }),

  // Mapper pour les recommandations (format SmConfCard)
  mapRecommendationProps: (doc: any) => ({
    id: doc.id,
    title: doc.title,
    type: 'documentationScientifique',
    url: null, // url est pour YouTube, on ne l'utilise pas ici
    thumbnail: doc.associatedMedia?.[0] || doc.thumbnail || null,
    actant: doc.creator ? [doc.creator] : [],
  }),

  // ✨ Vues personnalisées pour les documentations scientifiques
  viewOptions: [
    // Vue 4 : Descriptions / Analyses critiques
    createItemsListView({
      key: 'Descriptions',
      title: 'Analyses détaillées',
      getItems: (itemDetails) => itemDetails?.descriptions || [],
      emptyMessage: 'Aucune analyse détaillée',
      annotationType: 'Analyse',
      mapUrl: (item) => `/corpus/analyse-critique/${item.id}`,
    }),

    // Vue 3 : Condition initiale / Contexte
    createTextView({
      key: 'ConditionInitiale',
      title: 'Figure narrative',
      getText: (itemDetails) => itemDetails?.conditionInitiale,
      emptyMessage: 'Aucune condition initiale définie',
    }),

    // Vue 5 : Sources
    createItemsListView({
      key: 'Sources',
      title: 'Contenus scientifiques',
      getItems: (itemDetails) => itemDetails?.sources || [],
      emptyMessage: 'Aucun contenu scientifique lié',
      annotationType: 'Source',
    }),

    // Vue 6 : Ressources liées
    createItemsListView({
      key: 'RessourcesLiees',
      title: 'Contenus culturels',
      getItems: (itemDetails) => itemDetails?.isRelatedTo || [],
      emptyMessage: 'Aucun contenu culturel lié',
      annotationType: 'Ressource',
    }),
  ],

  // Sections optionnelles
  showKeywords: true,
  showComments: true,
  showRecommendations: true,
  recommendationsTitle: 'Documentations similaires',

  // Smart recommendations
  smartRecommendations: {
    // Récupère toutes les documentations scientifiques pour trouver des similaires
    getAllResourcesOfType: async () => {
      const docs = await getDocumentationsScientifiques();
      return docs;
    },

    // Pour les documentations scientifiques, on veut seulement des documentations similaires
    getRelatedItems: () => [],

    maxRecommendations: 5,
  },

  // Type à afficher
  type: 'Documentation scientifique',
};
