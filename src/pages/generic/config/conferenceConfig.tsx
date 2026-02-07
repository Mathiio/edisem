import { GenericDetailPageConfig, FetchResult } from '../config';
import { ConfOverviewCard, ConfOverviewSkeleton } from '@/components/features/conference/ConfOverview';
import { ConfDetailsCard, ConfDetailsSkeleton } from '@/components/features/conference/ConfDetails';
import { Citations } from '@/components/features/conference/CitationsCards';
import { Microresumes } from '@/components/features/conference/MicroresumesCards';
import { Bibliographies } from '@/components/features/conference/BibliographyCards';
import { Mediagraphies } from '@/components/features/conference/MediagraphyCards';
import { getResourceDetails } from '@/services/resourceDetails';

/**
 * Configuration pour les pages de conférence
 * Utilise l'endpoint unifié getResourceDetails
 */
export const conferenceConfig: GenericDetailPageConfig = {
  // Data fetching - using unified endpoint
  dataFetcher: async (id: string): Promise<FetchResult> => {
    // Fetch unified resource details
    const details = await getResourceDetails(id);
    
    if (!details) {
      throw new Error('Resource not found');
    }

    // Backend now provides complete structures, minimal transformation needed
    const conf = {
      id: details.id,
      title: details.title,
      description: details.abstract || details.description || '',
      date: details.date || '',
      motcles: details.keywords || [],
      actant: details.actants || [],
      type: details.type,
      url: details.videoUrl || '',
      fullUrl: details.videoUrl || '',
      event: details.type,
      season: '',
      edition: '',
      collection: '',
      citations: details.citations || [],
      bibliographies: details.references || [],
      mediagraphies: details.associatedMedia || [],
      recommendation: [],
      thumbnail: '',
    };

    return {
      itemDetails: conf,
      keywords: (details.keywords || []).map((kw: any) => ({
        ...kw,
        title: kw.name || kw.title,
      })),
      recommendations: (details.relatedConferences || []).map(ref => ref.id),
      viewData: {
        citations: details.citations || [],
        bibliographies: details.references || [],
        mediagraphies: details.associatedMedia || [],
        microresumes: details.microResumes || [],
        relatedConferences: details.relatedConferences || [],
      },
    };
  },

  fetchRecommendations: async (fetchedData?: any) => {
    // Use relatedConferences from viewData
    if (fetchedData?.viewData?.relatedConferences) {
      return fetchedData.viewData.relatedConferences.map((conf: any) => ({
        id: conf.id,
        title: conf.title,
        date: conf.date,
        thumbnail: conf.thumbnail,
        actant: conf.actants || [],
        type: 'seminaire',
      }));
    }
    return [];
  },

  // Composants
  overviewComponent: ConfOverviewCard,
  detailsComponent: ConfDetailsCard,
  overviewSkeleton: ConfOverviewSkeleton,
  detailsSkeleton: ConfDetailsSkeleton,

  // Mappers de props
  mapOverviewProps: (conf: any, currentVideoTime: number) => ({
    conf,
    currentTime: currentVideoTime,
  }),

  mapDetailsProps: (conf: any) => ({
    conf,
  }),

  // Options de vue
  viewOptions: [
    {
      key: 'MicroResumes',
      title: 'Micro-résumés',
      renderContent: ({ viewData, loading, onTimeChange }) => {
        const microresumes = viewData.microresumes || [];
        // Si pas de microresumes, ne pas afficher la vue
        if (!loading && microresumes.length === 0) {
          return null;
        }
        return <Microresumes microresumes={microresumes} loading={loading} onTimeChange={onTimeChange} />;
      },
    },
    {
      key: 'Citations',
      title: 'Citations',
      renderContent: ({ viewData, loading, onTimeChange }) => <Citations citations={viewData.citations || []} loading={loading} onTimeChange={onTimeChange} />,
    },
    {
      key: 'Bibliographie',
      title: 'Bibliographie',
      renderContent: ({ viewData, loading }) => (
        <Bibliographies
          bibliographies={viewData.bibliographies || []}
          loading={loading}
          legacyConfig={{
            normalTitle: 'Bibliographies de Conférence',
            complementaryTitle: 'Bibliographies Complémentaires',
            complementaryTemplateId: '83',
          }}
        />
      ),
    },
    {
      key: 'Medias',
      title: 'Médias',
      renderContent: ({ viewData, loading }) => <Mediagraphies items={viewData.mediagraphies || []} loading={loading} />,
    },
  ],

  // Sections optionnelles
  showKeywords: true,
  showRecommendations: true,
  showComments: true,
  recommendationsTitle: 'Conférences associées',

  // Type à afficher
  type: 'Conférence',
};
