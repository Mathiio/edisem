import { GenericDetailPageConfig, FetchResult } from '../config';
import { RecitiaOverviewCard, RecitiaOverviewSkeleton } from '@/components/features/miseEnRecit/RecitiaOverview';
import { RecitiaDetailsCard, RecitiaDetailsSkeleton } from '@/components/features/miseEnRecit/RecitiaDetails';
import { getRecitsMediatiques, getKeywords } from '@/services/Items';
import { createItemsListView, createTextView } from '../helpers';
import { Bibliographies } from '@/components/features/conference/BibliographyCards';
import { Mediagraphies } from '@/components/features/conference/MediagraphyCards';

export const recitmediatiqueConfig: GenericDetailPageConfig = {
  // Data fetching avec enrichissement des keywords
  dataFetcher: async (id: string): Promise<FetchResult> => {
    const [recit, concepts] = await Promise.all([getRecitsMediatiques(Number(id)), getKeywords()]);
    console.log('recit', recit);
    // Enrichir les keywords si nécessaire
    const recitKeywords = concepts.filter((c: any) => recit?.keywords?.some((k: any) => String(k.id) === String(c.id)));

    return {
      itemDetails: recit,
      keywords: recitKeywords,
      // Pas de recommendations classiques pour déclencher les smart recommendations
    };
  },

  // Composants UI réutilisés
  overviewComponent: RecitiaOverviewCard,
  detailsComponent: RecitiaDetailsCard,
  overviewSkeleton: RecitiaOverviewSkeleton,
  detailsSkeleton: RecitiaDetailsSkeleton,

  // Mapper les props pour l'overview
  mapOverviewProps: (recit: any, currentVideoTime: number) => ({
    id: recit.id,
    title: recit.title,
    personnes: recit.creator ? [recit.creator] : [],
    medias: recit.associatedMedia || [],
    fullUrl: recit.url || recit.source || '#',
    currentTime: currentVideoTime,
    buttonText: 'Voir plus',
  }),

  // Mapper les props pour les détails
  mapDetailsProps: (recit: any) => ({
    date: recit.dateIssued,
    actants: recit.creator ? [recit.creator] : [],
    description:
      [recit.purpose ? `<strong>Objectif:</strong> ${recit.purpose}` : '', recit.application ? `<strong>Résumé:</strong> ${recit.application}` : '']
        .filter(Boolean)
        .join('<br><br>') || '',
  }),

  // Mapper pour les recommandations (format SmConfCard)
  mapRecommendationProps: (recit: any) => ({
    id: recit.id,
    title: recit.title,
    type: 'recitMediatique',
    url: null, // url est pour YouTube, on ne l'utilise pas ici
    thumbnail: recit.associatedMedia?.[0] || recit.thumbnail || null,
    actant: recit.creator ? [recit.creator] : [],
  }),

  // ✨ Vues personnalisées pour les récits médiatiques
  viewOptions: [
    // Vue 2 : Descriptions / Analyses critiques
    createItemsListView({
      key: 'Descriptions',
      title: 'Analyses détaillées',
      getItems: (itemDetails) => itemDetails?.descriptions || [],
      annotationType: 'Analyse',
      mapUrl: (item) => `/corpus/analyse-critique/${item.id}`,
    }),

    // Vue 1 : Citations
    createTextView({
      key: 'Citations',
      title: 'Citations',
      getText: (itemDetails) => {
        if (!itemDetails?.citations || itemDetails.citations.length === 0) return '';
        return itemDetails.citations.map((citation: string) => `"${citation}"`).join('<br><br>');
      },
    }),

    // Vue 3 : Condition initiale / Contexte
    createTextView({
      key: 'ConditionInitiale',
      title: 'Figure narrative',
      getText: (itemDetails) => itemDetails?.conditionInitiale,
    }),

    // Vue 4 : Outils
    createItemsListView({
      key: 'Tools',
      title: 'Outils',
      getItems: (itemDetails) => itemDetails?.tools || [],
      annotationType: 'Outil',
      mapUrl: (item) => `/corpus/outil/${item.id}`,
    }),

    // Vue 5 : Sources scientifiques (utilise scientificContent pour les récits médiatiques)
    {
      key: 'ContentScient',
      title: 'Contenus scientifiques',
      renderContent: ({ itemDetails, loading }) => {
        const references = itemDetails?.scientificContent || [];
        const mediagraphies = references.filter((ref: any) => ref?.type === 'mediagraphie' || ref?.mediagraphyType);
        const bibliographies = references
          .filter((ref: any) => ref?.type === 'bibliographie' || ref?.template || ref?.resource_template_id)
          .map((ref: any) => ({
            ...ref,
            id: parseInt(ref.id) || ref.id,
            creator: Array.isArray(ref.creator) && ref.creator.length > 0 && typeof ref.creator[0] === 'object' ? ref.creator : [],
          }));

        if (references.length === 0) {
          return null;
        }

        return (
          <div className='space-y-6'>
            {mediagraphies.length > 0 && (
              <div>
                <h3 className='text-lg text-c5 font-semibold mb-4'>Médias</h3>
                <Mediagraphies items={mediagraphies} loading={loading} notitle />
              </div>
            )}
            {bibliographies.length > 0 && (
              <div>
                <h3 className='text-lg text-c5 font-semibold mb-4'>Bibliographies</h3>
                <Bibliographies sections={[{ title: 'Bibliographies', bibliographies }]} loading={loading} notitle />
              </div>
            )}
          </div>
        );
      },
    },

    // Vue 6 : Sources culturelles (utilise culturalContent pour les récits médiatiques)
    {
      key: 'ContentCultu',
      title: 'Contenus culturels',
      renderContent: ({ itemDetails, loading }) => {
        const references = itemDetails?.culturalContent || [];
        const mediagraphies = references.filter((ref: any) => ref?.type === 'mediagraphie' || ref?.mediagraphyType);
        const bibliographies = references
          .filter((ref: any) => ref?.type === 'bibliographie' || ref?.template || ref?.resource_template_id)
          .map((ref: any) => ({
            ...ref,
            id: parseInt(ref.id) || ref.id,
            creator: Array.isArray(ref.creator) && ref.creator.length > 0 && typeof ref.creator[0] === 'object' ? ref.creator : [],
          }));

        if (references.length === 0) {
          return null;
        }

        return (
          <div className='space-y-6'>
            {mediagraphies.length > 0 && (
              <div>
                <h3 className='text-lg text-c5 font-semibold mb-4'>Médias</h3>
                <Mediagraphies items={mediagraphies} loading={loading} notitle />
              </div>
            )}
            {bibliographies.length > 0 && (
              <div>
                <h3 className='text-lg text-c5 font-semibold mb-4'>Bibliographies</h3>
                <Bibliographies sections={[{ title: 'Bibliographies', bibliographies }]} loading={loading} notitle />
              </div>
            )}
          </div>
        );
      },
    },
  ],

  // Sections optionnelles
  showKeywords: true,
  showComments: true,
  showRecommendations: true,
  recommendationsTitle: 'Récits médiatiques similaires',

  // Smart recommendations
  smartRecommendations: {
    // Retourne toutes les autres récits médiatiques comme recommandations
    getRelatedItems: async (itemDetails: any) => {
      const recits = await getRecitsMediatiques();
      // Retourner tous les récits sauf celui actuel
      return recits.filter((recit: any) => String(recit.id) !== String(itemDetails.id));
    },

    maxRecommendations: 5, // Afficher plus de recommandations
  },

  // Type à afficher
  type: 'recitMediatique',
};
