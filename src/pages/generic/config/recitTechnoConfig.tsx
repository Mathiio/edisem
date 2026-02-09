import { GenericDetailPageConfig, FetchResult } from '../config';
import { RecitiaOverviewCard, RecitiaOverviewSkeleton } from '@/components/features/misesEnRecits/RecitiaOverview';
import { RecitiaDetailsCard, RecitiaDetailsSkeleton } from '@/components/features/misesEnRecits/RecitiaDetails';
import { getRecitsTechnoIndustriels, getKeywords, getAnnotationsWithTargets } from '@/services/Items';
import { createItemsListView, createScientificReferencesView, createTextView } from '../helpers';

export const objetTechnoConfig: GenericDetailPageConfig = {
  // Data fetching avec enrichissement des keywords
  dataFetcher: async (id: string): Promise<FetchResult> => {
    const [objets, concepts] = await Promise.all([getRecitsTechnoIndustriels(), getKeywords()]);

    console.log(objets);

    const objet = objets.find((o: any) => String(o.id) === String(id));

    // Enrichir les keywords si nécessaire
    const objetKeywords = concepts.filter((c: any) => objet?.keywords?.some((k: any) => String(k.id) === String(c.id)));

    // Résoudre les targets et related des descriptions (annotations)
    if (objet?.descriptions) {
      objet.descriptions = await getAnnotationsWithTargets(objet.descriptions);
    }

    return {
      itemDetails: objet,
      keywords: objetKeywords,
      recommendations: [],
    };
  },

  // Composants UI réutilisés
  overviewComponent: RecitiaOverviewCard,
  detailsComponent: RecitiaDetailsCard,
  overviewSkeleton: RecitiaOverviewSkeleton,
  detailsSkeleton: RecitiaDetailsSkeleton,

  // Mapper les props pour l'overview
  mapOverviewProps: (objet: any, currentVideoTime: number) => ({
    id: objet.id,
    title: objet.title,
    personnes: [], // Les objets techno n'ont pas de personnes directes
    medias: objet.associatedMedia || [],
    fullUrl: objet.source || objet.uri || '#',
    currentTime: currentVideoTime,
    buttonText: 'Voir plus',
  }),

  // Mapper les props pour les détails
  mapDetailsProps: (objet: any) => ({
    date: objet.dateIssued,
    actants: [],
    description:
      [
        objet.purpose ? `<strong>Objectif:</strong> ${objet.purpose}` : '',
        objet.slogan ? `<strong>Slogan:</strong> ${objet.slogan}` : '',
        objet.application ? `<strong>Résumé:</strong> ${objet.application}` : '',
      ]
        .filter(Boolean)
        .join('<br><br>') || '',
  }),

  // Mapper pour les recommandations (format SmConfCard)
  mapRecommendationProps: (objet: any) => ({
    id: objet.id,
    title: objet.title,
    type: objet.type || 'recit_techno_industriel',
    url: null, // url est pour YouTube, on ne l'utilise pas ici
    thumbnail: objet.associatedMedia?.[0] || objet.thumbnail || null,
    actant: [],
  }),

  // ✨ Vues personnalisées pour les objets techno-industriels
  viewOptions: [
    // Vue 5 : Descriptions/Analyses critiques
    createItemsListView({
      key: 'Descriptions',
      title: 'Analyses critiques',
      getItems: (itemDetails) => itemDetails?.descriptions || [],
      mapUrl: (item) => `/corpus/analyse-critique/${item.id}`,
    }),
    // Vue 1 : Condition initiale / Contexte
    createTextView({
      key: 'ConditionInitiale',
      title: 'Figure narrative',
      getText: (itemDetails) => itemDetails?.conditionInitiale,
    }),

    createScientificReferencesView(),

    // Vue 3 : Reviews et critiques
    createItemsListView({
      key: 'Reviews',
      title: 'Contenus scientifiques',
      getItems: (itemDetails) => itemDetails?.reviews || [],
    }),

    // Vue 4 : Ressources liées (articles, autres ressources)
    createItemsListView({
      key: 'RessourcesLiees',
      title: 'Contenus culturels',
      getItems: (itemDetails) => itemDetails?.relatedResources || [],
    }),

    // Vue 2 : Outils/Technologies utilisés
    createItemsListView({
      key: 'Outils',
      title: 'Outils',
      getItems: (itemDetails) =>
        (itemDetails?.tools || []).map((tool: any) => ({
          ...tool,
          title: tool.name || tool.title || 'Outil sans nom',
        })),
    }),
  ],

  // Sections optionnelles
  showKeywords: true,
  showComments: true,
  showRecommendations: true,
  recommendationsTitle: 'Objets techno similaires',

  // Smart recommendations
  smartRecommendations: {
    // Récupère tous les objets techno pour trouver des similaires
    getAllResourcesOfType: async () => {
      const objets = await getRecitsTechnoIndustriels();
      return objets;
    },

    // Pour les objets techno, on ne veut pas de recommandations liées
    // Les analyses critiques sont déjà dans les vues
    // On veut seulement des objets techno similaires
    getRelatedItems: () => [],

    maxRecommendations: 5,
  },

  // Type à afficher
  type: 'Récit techno-industriel',
};
