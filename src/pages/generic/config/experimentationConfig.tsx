import { GenericDetailPageConfig, FetchResult } from '../config';
import { ExpOverviewCard } from '@/components/features/experimentation/ExpOverview';
import { ExpDetailsCard, ExpDetailsSkeleton } from '@/components/features/experimentation/ExpDetails';
import { ConfOverviewSkeleton } from '@/components/features/conference/ConfOverview';
import { getExperimentations, getActants, getStudents, getTools, getKeywords } from '@/services/Items';
import { createExperimentationViews } from '../helpers';

/**
 * Configuration pour les pages d'expérimentation
 *
 * Exemple de flexibilité: on peut ajouter percentage et status dans mapOverviewProps
 * pour afficher la barre de progression spécifique aux expérimentations
 */
export const experimentationConfig: GenericDetailPageConfig = {
  // Data fetching avec enrichissement des actants
  dataFetcher: async (id: string): Promise<FetchResult> => {
    const [experimentations, actants, students, tools, concepts] = await Promise.all([getExperimentations(), getActants(), getStudents(), getTools(), getKeywords()]);

    // Créer des maps pour enrichir les données
    const actantMap = new Map();
    actants.forEach((a: any) => {
      actantMap.set(a.id, a);
      actantMap.set(String(a.id), a);
      actantMap.set(Number(a.id), a);
    });

    const studentMap = new Map();
    students.forEach((s: any) => {
      studentMap.set(s.id, s);
      studentMap.set(String(s.id), s);
      studentMap.set(Number(s.id), s);
    });

    const experimentation = experimentations.find((e: any) => String(e.id) === String(id));

    if (experimentation) {
      // Enrichir les actants
      if (experimentation.actants && Array.isArray(experimentation.actants)) {
        experimentation.enrichedActants = experimentation.actants
          .map((actantId: any) => {
            return (
              actantMap.get(actantId) ||
              actantMap.get(Number(actantId)) ||
              actantMap.get(String(actantId)) ||
              studentMap.get(actantId) ||
              studentMap.get(Number(actantId)) ||
              studentMap.get(String(actantId)) ||
              null
            );
          })
          .filter(Boolean);

        experimentation.primaryActant = experimentation.enrichedActants.length > 0 ? experimentation.enrichedActants[0] : null;
      }

      // Enrichir les feedbacks
      if (experimentation.feedbacks) {
        experimentation.feedbacks.forEach((feedback: any) => {
          if (feedback.contributors) {
            feedback.contributors = feedback.contributors.map((contributor: any) => {
              const contributorId = contributor.id;
              let enrichedContributor = actantMap.get(contributorId) || actantMap.get(String(contributorId)) || actantMap.get(Number(contributorId));
              if (!enrichedContributor) {
                enrichedContributor = studentMap.get(contributorId) || studentMap.get(String(contributorId)) || studentMap.get(Number(contributorId));
              }
              return enrichedContributor || contributor;
            });
          }
        });
      }
    }

    const confTools = tools.filter((t: any) => experimentation?.technicalCredits?.includes(String(t.id)));
    const confConcepts = concepts.filter((c: any) => experimentation?.concepts?.includes(String(c.id)));

    return {
      itemDetails: experimentation,
      keywords: confConcepts,
      recommendations: [],
      viewData: {
        tools: confTools,
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
    personnes: exp.acteurs,
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

  // ✨ Options de vue simplifiées avec viewHelpers (5 vues en 1 ligne!)
  viewOptions: createExperimentationViews(
    (_itemDetails, viewData) => viewData?.tools || [],
    (tool) => `/corpus/tool/${tool.id}`,
  ),

  // Sections optionnelles
  showKeywords: true,
  showRecommendations: true,
  showComments: true,
  recommendationsTitle: 'Autres expérimentations',
};
