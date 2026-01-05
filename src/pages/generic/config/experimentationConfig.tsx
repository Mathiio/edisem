import { GenericDetailPageConfig, FetchResult } from '../config';
import { ExpOverviewCard } from '@/components/features/experimentation/ExpOverview';
import { ExpDetailsCard, ExpDetailsSkeleton } from '@/components/features/experimentation/ExpDetails';
import { ConfOverviewSkeleton } from '@/components/features/conference/ConfOverview';
import { getExperimentations } from '@/services/Items';
import { createExperimentationViews } from '@/pages/generic/helpers';

/**
 * Configuration pour les pages d'expérimentation
 *
 * Exemple de flexibilité: on peut ajouter percentage et status dans mapOverviewProps
 * pour afficher la barre de progression spécifique aux expérimentations
 */
export const experimentationConfig: GenericDetailPageConfig = {
  // Data fetching avec enrichissement des actants
  dataFetcher: async (id: string): Promise<FetchResult> => {
    const [experimentations] = await Promise.all([getExperimentations()]);

    const experimentation = experimentations.find((e: any) => String(e.id) === String(id));

    if (experimentation) {
      // Enrichir les feedbacks
      if (experimentation.feedbacks) {
        experimentation.feedbacks.forEach((feedback: any) => {
          if (feedback.contributors) {
            feedback.contributors = feedback.contributors.map((contributor: any) => {
              const contributorId = contributor.id;
              return experimentation.actants.find((a: any) => String(a.id) === String(contributorId)) || contributor;
            });
          }
        });
      }
    }
    console.log('experimentation', experimentation);
    return {
      itemDetails: experimentation,
      keywords: experimentation?.keywords || [],
      recommendations: [],
      viewData: {
        tools: experimentation?.tools || [],
        allExperimentations: experimentations,
      },
    };
  },

  // Composants
  overviewComponent: ExpOverviewCard,
  detailsComponent: ExpDetailsCard,
  overviewSkeleton: ConfOverviewSkeleton,
  detailsSkeleton: ExpDetailsSkeleton,

  // Mappers de props - ici on ajoute percentage et status pour la barre de progression
  mapOverviewProps: (exp: any, currentVideoTime: number) => ({
    id: exp.id,
    title: exp.title,
    personnes: exp.actants, // Tous les crédits sont maintenant fusionnés dans actants
    medias: exp.associatedMedia,
    fullUrl: exp.url,
    currentTime: currentVideoTime,
    buttonText: 'Voir plus',
    percentage: exp.percentage, // Spécifique aux expérimentations
    status: exp.status, // Spécifique aux expérimentations
  }),

  mapDetailsProps: (exp: any) => ({
    date: exp.date,
    actants: exp.actants,
    description: exp.description,
  }),

  // Mapper pour les recommandations (format SmConfCard)
  mapRecommendationProps: (exp: any) => ({
    id: exp.id,
    title: exp.title,
    type: 'experimentation',
    url: null, // url est pour YouTube, on ne l'utilise pas ici
    thumbnail: exp.associatedMedia?.[0] || exp.thumbnail || null,
    personnes: exp.actants || [],
  }),

  // ✨ Options de vue simplifiées avec viewHelpers (5 vues en 1 ligne!)
  viewOptions: createExperimentationViews(
    (_itemDetails, viewData) => viewData?.tools || [],
    (tool) => `/corpus/tool/${tool.id}`,
  ),

  // Sections optionnelles
  showKeywords: true,
  showRecommendations: true,
  showComments: true,
  recommendationsTitle: 'Expérimentations similaires',

  // Smart recommendations
  smartRecommendations: {
    // Récupère toutes les expérimentations pour trouver des similaires
    getAllResourcesOfType: async () => {
      const experimentations = await getExperimentations();
      return experimentations;
    },

    // Pour les expérimentations, on ne veut pas de recommandations liées
    // Les feedbacks sont déjà dans les vues
    // On veut seulement des expérimentations similaires
    getRelatedItems: () => [],

    maxRecommendations: 5,
  },

  // Type à afficher
  type: 'Expérimentation',
};
