import { GenericDetailPageConfig, FetchResult } from '../config';
import { ExpOverviewCard } from '@/components/features/experimentation/ExpOverview';
import { ExpDetailsCard, ExpDetailsSkeleton } from '@/components/features/experimentation/ExpDetails';
import { ConfOverviewSkeleton } from '@/components/features/conference/ConfOverview';
import { getResourceDetails } from '@/services/Items';

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
    const feedback = await getResourceDetails(Number(id));

    // Enrichir le feedback pour l'affichage
    if (feedback) {
        // Enriched Actants (Contributors)
        if (feedback.contributors) {
            feedback.enrichedActants = feedback.contributors.map((c: any) => ({
                id: c.id,
                name: c.title || c.name,
                thumbnail: c.thumbnail,
                // ...other properties if needed
            }));
            feedback.primaryActant = feedback.enrichedActants.length > 0 ? feedback.enrichedActants[0] : null;
        }
    }

    return {
      itemDetails: feedback,
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

  // Mapper pour les recommandations (format SmConfCard)
  mapRecommendationProps: (feedback: any) => ({
    id: feedback.id,
    title: feedback.title,
    type: 'feedback',
    url: null, // url est pour YouTube, on ne l'utilise pas ici
    thumbnail: feedback.thumbnail || null,
    actant: feedback.enrichedActants || [],
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
        return null;
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
  showRecommendations: true,
  showComments: true,
  recommendationsTitle: "Autres retours d'expérience",

  // Smart recommendations
  smartRecommendations: {

    maxRecommendations: 5,
  },

  // Type à afficher
  type: 'Feedback',
};
