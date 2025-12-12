import { GenericDetailPageConfig, FetchResult } from '../config';
import { ConfOverviewCard, ConfOverviewSkeleton } from '@/components/features/conference/ConfOverview';
import { ConfDetailsCard, ConfDetailsSkeleton } from '@/components/features/conference/ConfDetails';
import { Citations } from '@/components/features/conference/CitationsCards';
import { Microresumes } from '@/components/features/conference/MicroresumesCards';
import { Bibliographies } from '@/components/features/conference/BibliographyCards';
import { Mediagraphies } from '@/components/features/conference/MediagraphyCards';
import { getConfCitations, getConfBibliographies, getConfMediagraphies } from '@/services/api';
import * as Items from '@/services/Items';

/**
 * Configuration pour les pages de conférence
 */
export const conferenceConfig: GenericDetailPageConfig = {
  // Data fetching
  dataFetcher: async (id: string): Promise<FetchResult> => {
    const [conf, citations, bibliographies, mediagraphies] = await Promise.all([
      Items.getAllConfs(Number(id)),
      getConfCitations(Number(id)),
      getConfBibliographies(Number(id)),
      getConfMediagraphies(Number(id)),
    ]);

    console.log('🔍 Conf récupérée:', conf);

    return {
      itemDetails: conf,
      keywords: conf?.motcles || [],
      recommendations: conf?.recommendation || [],
      viewData: {
        citations,
        bibliographies,
        mediagraphies,
        microresumes: (conf?.micro_resumes || []).slice().sort((a: any, b: any) => a.startTime - b.startTime),
      },
    };
  },

  fetchRecommendations: async (ids: string[]) => {
    const allConfs = await Items.getAllConfs();
    return allConfs.filter((conf: any) => ids.includes(String(conf.id)) || ids.includes(conf.id));
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
