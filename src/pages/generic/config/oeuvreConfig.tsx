import { GenericDetailPageConfig, FetchResult } from '../config';
import { RecitiaOverviewCard, RecitiaOverviewSkeleton } from '@/components/features/misesEnRecits/RecitiaOverview';
import { RecitiaDetailsCard, RecitiaDetailsSkeleton } from '@/components/features/misesEnRecits/RecitiaDetails';
import { getRecitsArtistiques, getActants, getStudents, getTools, getKeywords, getAnnotationsWithTargets } from '@/services/Items';
import * as Items from '@/services/Items';
import { createOeuvreViews } from '../helpers';

/**
 * Configuration pour les pages d'recit_artistique
 *
 * Cas complexe avec:
 * - 6 vues différentes (ContentScient, ContentCultu, Archives, ElementsNarratifs, ElementsEsthetique, AnalyseCritique)
 * - Enrichissement des keywords depuis plusieurs sources
 * - Mapping complexe pour les éléments narratifs/esthétiques
 */
export const oeuvreConfig: GenericDetailPageConfig = {
  // Data fetching avec enrichissement complet
  dataFetcher: async (id: string): Promise<FetchResult> => {
    const [recitIas, actants, students, , keywords] = await Promise.all([getRecitsArtistiques(), getActants(), getStudents(), getTools(), getKeywords()]);

    // Créer des maps
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

    const keywordMap = new Map();
    keywords.forEach((k: any) => {
      keywordMap.set(k.id, k);
      keywordMap.set(String(k.id), k);
      keywordMap.set(Number(k.id), k);
    });

    const recit_artistique = recitIas.find((r: any) => String(r.id) === String(id));

    if (recit_artistique) {
      // Enrichir les actants
      if (recit_artistique.actants && Array.isArray(recit_artistique.actants)) {
        recit_artistique.enrichedActants = recit_artistique.actants
          .map((actant: any) => {
            if (typeof actant === 'string' && !/^\d{5}$/.test(actant)) {
              return { displayName: actant };
            }
            const actantId = actant;
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

        recit_artistique.primaryActant = recit_artistique.enrichedActants.length > 0 ? recit_artistique.enrichedActants[0] : null;
      }

      // Legacy support
      if (recit_artistique.actant && !recit_artistique.primaryActant) {
        if (typeof recit_artistique.actant === 'object' && recit_artistique.actant.id) {
          recit_artistique.primaryActant = recit_artistique.actant;
        } else {
          const actantId = recit_artistique.actant;
          recit_artistique.primaryActant =
            actantMap.get(actantId) ||
            actantMap.get(Number(actantId)) ||
            actantMap.get(String(actantId)) ||
            studentMap.get(actantId) ||
            studentMap.get(Number(actantId)) ||
            studentMap.get(String(actantId)) ||
            null;
        }
      }

      // Enrichir les feedbacks
      if (recit_artistique.feedbacks) {
        recit_artistique.feedbacks.forEach((feedback: any) => {
          if (feedback.contributors) {
            feedback.contributors = feedback.contributors.map((contributor: any) => {
              const contributorId = contributor.id;
              let enrichedContributor = actantMap.get(contributorId) || actantMap.get(String(contributorId)) || actantMap.get(Number(contributorId)) || null;
              if (!enrichedContributor) {
                enrichedContributor = studentMap.get(contributorId) || studentMap.get(String(contributorId)) || studentMap.get(Number(contributorId)) || null;
              }
              return enrichedContributor || contributor;
            });
          }
        });
      }
    }

    // Enrichir les keywords depuis plusieurs sources
    const oeuvreKeywords = [
      ...(recit_artistique?.keywords || []),
      ...(recit_artistique?.risks || []),
      ...(recit_artistique?.roles || []),
      ...(recit_artistique?.scenarios || []),
      ...(recit_artistique?.themes || []),
      ...(recit_artistique?.processes || []),
      ...(recit_artistique?.affects || []),
    ]
      .map((word: any) => {
        if (typeof word === 'object' && word !== null && 'id' in word) {
          return word;
        }
        const enrichedKeyword = keywordMap.get(word) || keywordMap.get(Number(word)) || keywordMap.get(String(word));
        return enrichedKeyword || { title: word };
      })
      .filter(Boolean);

    // Récupérer les recommandations
    let recommendedConfs: any[] = [];
    if (recit_artistique?.recommendations?.length) {
      try {
        const allConfs = await Items.getAllConfs();
        recommendedConfs = recit_artistique.recommendations
          .map((recId: string) => allConfs.find((c: any) => String(c.id) === String(recId)))
          .filter(Boolean);
      } catch (error) {
        console.error('Error fetching recommended conferences:', error);
      }
    }

    console.log('recit_artistique', recit_artistique);

    // Résoudre les targets et related des annotations
    if (recit_artistique?.annotations) {
      recit_artistique.annotations = await getAnnotationsWithTargets(recit_artistique.annotations);
    }

    return {
      itemDetails: recit_artistique,
      keywords: oeuvreKeywords,
      recommendations: [],
      viewData: {
        recommendedConfs,
      },
    };
  },

  // Composants
  overviewComponent: RecitiaOverviewCard,
  detailsComponent: RecitiaDetailsCard,
  overviewSkeleton: RecitiaOverviewSkeleton,
  detailsSkeleton: RecitiaDetailsSkeleton,

  // Mappers de props
  mapOverviewProps: (recit_artistique: any, currentVideoTime: number) => ({
    id: recit_artistique.id,
    title: recit_artistique.title,
    personnes: recit_artistique.personne,
    medias: recit_artistique.associatedMedia && recit_artistique.associatedMedia.length > 0 ? recit_artistique.associatedMedia : recit_artistique.thumbnail ? [recit_artistique.thumbnail] : [],
    credits: recit_artistique.credits,
    fullUrl: recit_artistique.url,
    currentTime: currentVideoTime,
    buttonText: 'Voir plus',
  }),

  mapDetailsProps: (recit_artistique: any) => ({
    date: recit_artistique.date,
    description: recit_artistique.abstract,
    medium: recit_artistique.medium,
    actants: recit_artistique.actants,
  }),

  // Mapper pour les recommandations (format SmConfCard)
  mapRecommendationProps: (recit_artistique: any) => ({
    id: recit_artistique.id,
    title: recit_artistique.title,
    type: 'recit_artistique',
    url: null, // url est pour YouTube, on ne l'utilise pas ici
    thumbnail: recit_artistique.associatedMedia?.[0] || recit_artistique.thumbnail || null,
    actant: recit_artistique.personne || [],
  }),

  viewOptions: createOeuvreViews(),

  // Sections optionnelles
  showKeywords: true,
  showRecommendations: true,
  showComments: true,
  recommendationsTitle: 'Œuvres similaires',

  // Smart recommendations
  smartRecommendations: {
    // Récupère toutes les recitsArtistiques pour trouver des similaires
    getAllResourcesOfType: async () => {
      const recitsArtistiques = await getRecitsArtistiques();
      return recitsArtistiques;
    },

    // Pour les recitsArtistiques, on ne veut pas de recommandations liées
    // Les éléments narratifs/esthétiques sont déjà dans les vues
    // On veut seulement des recitsArtistiques similaires
    getRelatedItems: () => [],

    maxRecommendations: 5,
  },

  // Type à afficher
  type: 'Œuvre',
};
