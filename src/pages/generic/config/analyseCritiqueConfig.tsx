import { GenericDetailPageConfig, FetchResult } from '../config';
import { RecitiaOverviewCard, RecitiaOverviewSkeleton } from '@/components/features/misesEnRecits/RecitiaOverview';
import { RecitiaDetailsCard, RecitiaDetailsSkeleton } from '@/components/features/misesEnRecits/RecitiaDetails';
import { getAnnotations, getAnnotationsWithTargets, getRecitsTechnoIndustriels, getOeuvres } from '@/services/Items';
import { createTargetsListView, createTextView } from '../helpers';

/**
 * Configuration pour les pages d'analyse critique
 */
export const analyseCritiqueConfig: GenericDetailPageConfig = {
  dataFetcher: async (id: string): Promise<FetchResult> => {
    const annotation = await getAnnotations(id);
    const annotationFull = await getAnnotationsWithTargets(annotation);

    // getAnnotations retourne un tableau, prendre le premier élément
    const annotationData = Array.isArray(annotationFull) && annotationFull.length > 0 ? annotationFull[0] : annotationFull;
    console.log('annotationData', annotationData);
    return {
      itemDetails: annotationData,
      keywords: [],
      recommendations: [],
    };
  },

  overviewComponent: RecitiaOverviewCard,
  detailsComponent: RecitiaDetailsCard,
  overviewSkeleton: RecitiaOverviewSkeleton,
  detailsSkeleton: RecitiaDetailsSkeleton,

  mapOverviewProps: (analyse: any, currentVideoTime: number) => ({
    id: analyse.id,
    title: analyse.title,
    personnes: analyse.actants,
    medias: analyse.associatedMedia,
    fullUrl: analyse.fullUrl,
    currentTime: currentVideoTime,
    buttonText: 'Voir plus',
  }),

  mapDetailsProps: (analyse: any) => ({
    actants: analyse.actants,
    date: analyse.date,
    genre: analyse.genre,
    medium: analyse.medium,
  }),

  // Mapper pour les recommandations (format SmConfCard)
  mapRecommendationProps: (analyse: any) => ({
    id: analyse.id,
    title: analyse.title,
    type: 'annotation',
    url: null, // url est pour YouTube, on ne l'utilise pas ici
    thumbnail: analyse.associatedMedia?.[0] || analyse.thumbnail || null,
    actant: analyse.actant || [],
  }),

  // Vue unique : Références
  viewOptions: [
    createTextView({
      key: 'analyseCritique',
      title: 'Analyse critique',
      getText: (itemDetails: { description: string }) => itemDetails?.description,
    }),
    // Vue principale : afficher le target (la ressource analysée)
    createTargetsListView({
      key: 'target',
      title: 'Ressource analysée',
      getTargets: (itemDetails) => itemDetails?.target || [],
    }),
    createTargetsListView({
      key: 'related',
      title: 'Ressources liées',
      getTargets: (itemDetails) => itemDetails?.related || [],
    }),
  ],

  showKeywords: false,
  showRecommendations: true,
  showComments: true,
  recommendationsTitle: 'Autres analyses critiques',

  // Smart recommendations
  smartRecommendations: {
    // Récupère toutes les analyses critiques pour trouver des similaires
    getAllResourcesOfType: async () => {
      const annotations = await getAnnotations();
      return annotations;
    },

    // Récupère les autres analyses critiques du même objet parent
    getRelatedItems: async (itemDetails) => {
      // Essayer de trouver l'objet parent dans les objets techno
      const objets = await getRecitsTechnoIndustriels();
      const parentObjet = objets.find((o: any) => o.descriptions?.some((d: any) => String(d.id) === String(itemDetails.id)));

      if (parentObjet) {
        // Retourner les autres analyses du même objet
        return (parentObjet.descriptions || []).filter((d: any) => String(d.id) !== String(itemDetails.id));
      }

      // Essayer dans les oeuvres
      const oeuvres = await getOeuvres();
      const parentOeuvre = oeuvres.find((o: any) => o.annotations?.some((a: any) => String(a.id) === String(itemDetails.id)));

      if (parentOeuvre) {
        return (parentOeuvre.annotations || []).filter((a: any) => String(a.id) !== String(itemDetails.id));
      }

      return [];
    },

    maxRecommendations: 5,
  },

  // Type à afficher
  type: 'Analyse critique',
};
