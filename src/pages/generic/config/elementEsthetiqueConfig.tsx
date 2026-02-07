import { GenericDetailPageConfig, FetchResult } from '../config';
import { RecitiaOverviewCard, RecitiaOverviewSkeleton } from '@/components/features/misesEnRecits/RecitiaOverview';
import { RecitiaDetailsCard, RecitiaDetailsSkeleton } from '@/components/features/misesEnRecits/RecitiaDetails';
import { getElementEsthetiques, getRecitsArtistiques } from '@/services/Items';

/**
 * Configuration pour les pages d'éléments esthétiques
 */
export const elementEsthetiqueConfig: GenericDetailPageConfig = {
  dataFetcher: async (id: string): Promise<FetchResult> => {
    const data = await getElementEsthetiques(Number(id));

    return {
      itemDetails: data,
      recommendations: [],
    };
  },

  overviewComponent: RecitiaOverviewCard,
  detailsComponent: RecitiaDetailsCard,
  overviewSkeleton: RecitiaOverviewSkeleton,
  detailsSkeleton: RecitiaDetailsSkeleton,

  mapOverviewProps: (element: any, currentVideoTime: number) => ({
    id: element.id,
    title: element.title,
    personnes: element.creator,
    medias: element.associatedMedia && element.associatedMedia.length > 0 ? element.associatedMedia : [],
    credits: element.contributor,
    fullUrl: element.relatedResource,
    currentTime: currentVideoTime,
    buttonText: 'Voir plus',
  }),

  mapDetailsProps: (element: any) => ({
    date: element.eventDate,
    description: element.description,
    actants: element.contributor,
  }),

  // Mapper pour les recommandations (format SmConfCard)
  mapRecommendationProps: (element: any) => ({
    id: element.id,
    title: element.title,
    type: 'elementEsthetique',
    url: null, // url est pour YouTube, on ne l'utilise pas ici
    thumbnail: element.associatedMedia?.[0] || element.thumbnail || null,
    actant: [],
  }),

  // Vue unique : Analyse avec toutes les caractéristiques
  viewOptions: [
    {
      key: 'Analyse',
      title: 'Analyse',
      renderContent: ({ itemDetails }) => {
        if (!itemDetails) {
          return null;
        }

        const fields = [
          { key: 'genre', label: 'Genre' },
          { key: 'form', label: 'Forme' },
          { key: 'duration', label: 'Durée' },
          { key: 'language', label: 'Langue' },
          { key: 'audience', label: 'Public' },
          { key: 'temporal', label: 'Temporalité' },
          { key: 'imageCharacteristic', label: 'Caractéristiques visuelles' },
          { key: 'colourCharacteristic', label: 'Caractéristiques colorimétriques' },
          { key: 'soundCharacteristic', label: 'Caractéristiques sonores' },
        ];

        return (
          <div className='flex flex-col gap-20'>
            {fields.map(
              (field) =>
                itemDetails[field.key] && (
                  <div key={field.key} className='flex flex-col gap-10'>
                    <h3 className='text-18 font-medium text-c6'>{field.label}</h3>
                    <div className='w-full flex flex-row justify-between border-2 rounded-12 items-center gap-25 border-c3'>
                      <div className='w-full gap-25 p-25 flex flex-row justify-between'>
                        <div className='flex flex-col gap-4 items-start'>
                          <div className='w-full flex flex-col gap-10'>
                            <p className='text-c6 text-16'>{itemDetails[field.key]}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ),
            )}
          </div>
        );
      },
    },
  ],

  showKeywords: false,
  showRecommendations: true,
  showComments: true,
  recommendationsTitle: 'Autres éléments esthétiques',

  // Smart recommendations
  smartRecommendations: {
    // Récupère tous les éléments esthétiques pour trouver des similaires
    getAllResourcesOfType: async () => {
      const elements = await getElementEsthetiques();
      return elements;
    },

    // Récupère les autres éléments esthétiques de la même recit_artistique
    getRelatedItems: async (itemDetails) => {
      const recitsArtistiques = await getRecitsArtistiques();
      const parentOeuvre = recitsArtistiques.find((o: any) => o.elementsEsthetique?.some((e: any) => String(e.id) === String(itemDetails.id)));

      if (parentOeuvre) {
        return (parentOeuvre.elementsEsthetique || []).filter((e: any) => String(e.id) !== String(itemDetails.id));
      }

      return [];
    },

    maxRecommendations: 5,
  },

  // Type à afficher
  type: 'Élément esthétique',
};
