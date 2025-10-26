import { GenericDetailPageConfig, FetchResult } from '../config';
import { RecitiaOverviewCard, RecitiaOverviewSkeleton } from '@/components/features/miseEnRecit/RecitiaOverview';
import { RecitiaDetailsCard, RecitiaDetailsSkeleton } from '@/components/features/miseEnRecit/RecitiaDetails';
import { getElementEsthetique } from '@/services/Items';

/**
 * Configuration pour les pages d'éléments esthétiques
 */
export const elementEsthetiqueConfig: GenericDetailPageConfig = {
  dataFetcher: async (id: string): Promise<FetchResult> => {
    const data = await getElementEsthetique(Number(id));

    return {
      itemDetails: data,
      keywords: [], // TODO: Ajouter les keywords si nécessaire
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

  // Vue unique : Analyse avec toutes les caractéristiques
  viewOptions: [
    {
      key: 'Analyse',
      title: 'Analyse',
      renderContent: ({ itemDetails }) => {
        if (!itemDetails) {
          return <div className='p-20 bg-c2 rounded-12 border-2 border-c3 text-c4'>Aucune donnée disponible</div>;
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
                      <div className='w-full gap-25 py-25 pl-25 flex flex-row justify-between'>
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
  showRecommendations: false,
  showComments: true,
};
