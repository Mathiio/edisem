import { GenericDetailPageConfig, FetchResult } from '../config';
import { ExpOverviewCard } from '@/components/features/experimentation/ExpOverview';
import { ExpDetailsCard, ExpDetailsSkeleton } from '@/components/features/experimentation/ExpDetails';
import { ConfOverviewSkeleton } from '@/components/features/conference/ConfOverview';
import { getExperimentations, getActants, getStudents } from '@/services/Items';

// Configuration des catégories avec leurs propriétés
const FEEDBACK_CATEGORIES = [
  {
    key: 'Experimentation',
    title: 'Expérimentation',
    subcategories: [
      { key: 'achievements', label: 'Succès / Avancées notables' },
      { key: 'issues', label: 'Problèmes rencontrés' },
      { key: 'methodsUsed', label: 'Solutions apportées' },
    ],
  },
  {
    key: 'Reactions',
    title: 'Réactions',
    subcategories: [
      { key: 'reviews', label: 'Réactions du public ou des pairs' },
      { key: 'instructionalMethod', label: "Suggestions pour d'autres expérimentateur·ices" },
    ],
  },
  {
    key: 'Perspectives',
    title: 'Perspectives',
    subcategories: [
      { key: 'potentialActions', label: 'Prolongements possibles' },
      { key: 'coverage', label: "Autres contextes d'application" },
      { key: 'workExamples', label: 'Modifications envisagées' },
    ],
  },
];

/**
 * Configuration pour les pages de feedback
 */
export const feedbackConfig: GenericDetailPageConfig = {
  dataFetcher: async (id: string): Promise<FetchResult> => {
    const [experimentations, actants, students] = await Promise.all([getExperimentations(), getActants(), getStudents()]);

    // Créer des maps pour recherche rapide
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

    // Recherche du feedback dans toutes les expérimentations
    let feedbackFound: any = null;
    let parentExperimentation: any = null;

    for (const exp of experimentations) {
      if (exp.feedbacks && Array.isArray(exp.feedbacks)) {
        feedbackFound = exp.feedbacks.find((feedback: any) => String(feedback.id) === String(id));
        if (feedbackFound) {
          parentExperimentation = exp;
          break;
        }
      }
    }

    if (feedbackFound && parentExperimentation) {
      // Ajouter les infos de l'expérimentation parente
      feedbackFound.experimentation = {
        id: parentExperimentation.id,
        title: parentExperimentation.title,
        url: parentExperimentation.url,
        date: parentExperimentation.date,
      };

      feedbackFound.url = `/corpus/experimentation/${parentExperimentation.id}`;
      feedbackFound.date = parentExperimentation.date ?? null;

      // Enrichir les contributeurs
      let enrichedContributors = [];
      let primaryActant = null;

      if (feedbackFound.contributors && Array.isArray(feedbackFound.contributors)) {
        if (feedbackFound.contributors.length > 0 && feedbackFound.contributors[0].firstname) {
          enrichedContributors = feedbackFound.contributors;
          primaryActant = enrichedContributors[0];
        } else {
          enrichedContributors = feedbackFound.contributors
            .map((contributor: any) => {
              const contributorId = contributor.id || contributor;
              return (
                actantMap.get(contributorId) ||
                actantMap.get(Number(contributorId)) ||
                actantMap.get(String(contributorId)) ||
                studentMap.get(contributorId) ||
                studentMap.get(Number(contributorId)) ||
                studentMap.get(String(contributorId)) ||
                contributor
              );
            })
            .filter(Boolean);
          primaryActant = enrichedContributors.length > 0 ? enrichedContributors[0] : null;
        }
      } else if (parentExperimentation.actants && Array.isArray(parentExperimentation.actants)) {
        enrichedContributors = parentExperimentation.actants
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
        primaryActant = enrichedContributors.length > 0 ? enrichedContributors[0] : null;
      }

      feedbackFound.enrichedActants = enrichedContributors.map((contributor: any) => ({
        ...contributor,
        name: `${contributor.firstname} ${contributor.lastname}`,
        thumbnail: contributor.picture || contributor.thumbnail,
      }));

      feedbackFound.primaryActant = primaryActant;
    }

    return {
      itemDetails: feedbackFound,
      keywords: [],
      recommendations: [],
    };
  },

  overviewComponent: ExpOverviewCard,
  detailsComponent: ExpDetailsCard,
  overviewSkeleton: ConfOverviewSkeleton,
  detailsSkeleton: ExpDetailsSkeleton,

  mapOverviewProps: (feedback: any, currentVideoTime: number) => ({
    id: feedback.id,
    title: feedback.title,
    personnes: feedback.enrichedActants,
    fullUrl: feedback.url,
    medias: feedback.associatedMedia,
    currentTime: currentVideoTime,
    buttonText: 'Expérience associée',
    percentage: feedback.percentage,
    status: feedback.status,
  }),

  mapDetailsProps: (feedback: any) => ({
    actants: feedback.enrichedActants,
    date: feedback.date,
    description: feedback.description,
  }),

  // Vues basées sur les catégories de feedback
  viewOptions: FEEDBACK_CATEGORIES.map((category) => ({
    key: category.key,
    title: category.title,
    renderContent: ({ itemDetails }) => {
      if (!itemDetails) return null;

      // Vérifier si la catégorie a des données
      const hasData = category.subcategories.some((subcategory) => itemDetails[subcategory.key] && itemDetails[subcategory.key].trim() !== '');

      if (!hasData) {
        return <div className='p-20 bg-c2 rounded-12 border-2 border-c3 text-c4'>Aucune donnée disponible pour cette catégorie</div>;
      }

      return (
        <div className='flex flex-col gap-10'>
          {category.subcategories.map((subcategory) => {
            const content = itemDetails[subcategory.key];
            if (!content || content.trim() === '') return null;

            return (
              <div key={subcategory.key} className='flex flex-col gap-10'>
                <h3 className='text-c6 font-semibold text-16'>{subcategory.label}</h3>
                <div className='bg-c1 rounded-8 p-25 border-2 border-c3'>
                  <p className='text-c5 text-14 leading-[125%]'>{content}</p>
                </div>
              </div>
            );
          })}
        </div>
      );
    },
  })),

  showKeywords: false,
  showRecommendations: false,
  showComments: true,
};
