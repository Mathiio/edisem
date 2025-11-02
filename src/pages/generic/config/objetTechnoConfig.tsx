import { GenericDetailPageConfig, FetchResult } from '../config';
import { RecitiaOverviewCard, RecitiaOverviewSkeleton } from '@/components/features/miseEnRecit/RecitiaOverview';
import { RecitiaDetailsCard, RecitiaDetailsSkeleton } from '@/components/features/miseEnRecit/RecitiaDetails';
import { getObjetsTechnoIndustriels, getKeywords } from '@/services/Items';
import { createItemsListView, createTextView } from '../helpers';

export const objetTechnoConfig: GenericDetailPageConfig = {
  // Data fetching avec enrichissement des keywords
  dataFetcher: async (id: string): Promise<FetchResult> => {
    const [objets, concepts] = await Promise.all([getObjetsTechnoIndustriels(), getKeywords()]);

    console.log(objets);

    const objet = objets.find((o: any) => String(o.id) === String(id));

    // Enrichir les keywords si nécessaire
    const objetKeywords = concepts.filter((c: any) => objet?.keywords?.some((k: any) => String(k.id) === String(c.id)));

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

  // ✨ Vues personnalisées pour les objets techno-industriels
  viewOptions: [
    // Vue 1 : Condition initiale / Contexte
    createTextView({
      key: 'ConditionInitiale',
      title: 'Figure narrative',
      getText: (itemDetails) => itemDetails?.conditionInitiale,
      emptyMessage: 'Aucune condition initiale définie',
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
      emptyMessage: 'Aucun outil associé',
      annotationType: 'Outil',
    }),

    // Vue 3 : Reviews et critiques
    createItemsListView({
      key: 'Reviews',
      title: 'Contenus scientifiques',
      getItems: (itemDetails) => itemDetails?.reviews || [],
      emptyMessage: 'Aucune critique disponible',
      annotationType: 'Critique',
    }),

    // Vue 4 : Ressources liées (articles, autres ressources)
    createItemsListView({
      key: 'RessourcesLiees',
      title: 'Contenus culturels',
      getItems: (itemDetails) => itemDetails?.relatedResources || [],
      emptyMessage: 'Aucune ressource liée',
      annotationType: 'Ressource',
    }),

    // Vue 5 : Descriptions/Analyses critiques
    createItemsListView({
      key: 'Descriptions',
      title: 'Analyses critiques',
      getItems: (itemDetails) => itemDetails?.descriptions || [],
      emptyMessage: 'Aucune analyse détaillée',
      annotationType: 'Analyse',
      mapUrl: (item) => `/corpus/analyse-critique/${item.id}`,
    }),
  ],

  // Sections optionnelles
  showKeywords: true,
  showComments: true,
  showRecommendations: false,
};
