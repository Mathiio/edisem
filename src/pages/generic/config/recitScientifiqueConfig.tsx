import { GenericDetailPageConfig, FetchResult } from '../config';
import { RecitiaOverviewCard, RecitiaOverviewSkeleton } from '@/components/features/misesEnRecits/RecitiaOverview';
import { RecitiaDetailsCard, RecitiaDetailsSkeleton } from '@/components/features/misesEnRecits/RecitiaDetails';
import { getRecitsScientifiques, getKeywords, getAnnotationsWithTargets } from '@/services/Items';
import { createCriticalAnalysisView, createCulturalReferencesView, createScientificReferencesView, createTextView } from '../helpers';

export const documentationScientifiqueConfig: GenericDetailPageConfig = {
  // Data fetching avec enrichissement des keywords
  dataFetcher: async (id: string): Promise<FetchResult> => {
    const [doc, concepts] = await Promise.all([getRecitsScientifiques(Number(id)), getKeywords()]);

    // Enrichir les keywords si nécessaire
    const docKeywords = concepts.filter((c: any) => doc?.keywords?.some((k: any) => String(k.id) === String(c.id)));

    // Résoudre les targets et related des descriptions (annotations)
    if (doc?.descriptions) {
      doc.descriptions = await getAnnotationsWithTargets(doc.descriptions);
    }

    return {
      itemDetails: doc,
      keywords: docKeywords,
      // Pas de recommendations classiques pour déclencher les smart recommendations
    };
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
    type: doc.type || 'recit_scientifique',
    url: null, // url est pour YouTube, on ne l'utilise pas ici
    thumbnail: doc.associatedMedia?.[0] || doc.thumbnail || null,
    actant: doc.creator ? [doc.creator] : [],
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
      const docs = await getRecitsScientifiques();
      // Retourner toutes les docs sauf celle actuelle
      return docs.filter((doc: any) => String(doc.id) !== String(itemDetails.id));
    },

    maxRecommendations: 5, // Afficher plus de recommandations
  },

  // Type à afficher
  type: 'Récit Scientifique',
};
