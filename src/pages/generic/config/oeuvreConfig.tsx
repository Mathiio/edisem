import { GenericDetailPageConfig, FetchResult } from '../config';
import { RecitiaOverviewCard, RecitiaOverviewSkeleton } from '@/components/features/miseEnRecit/RecitiaOverview';
import { RecitiaDetailsCard, RecitiaDetailsSkeleton } from '@/components/features/miseEnRecit/RecitiaDetails';
import { getOeuvres, getActants, getStudents, getTools, getKeywords } from '@/services/Items';
import * as Items from '@/services/Items';
import { createOeuvreViews } from '../helpers';

/**
 * Configuration pour les pages d'oeuvre
 *
 * Cas complexe avec:
 * - 6 vues différentes (ContentScient, ContentCultu, Archives, ElementsNarratifs, ElementsEsthetique, AnalyseCritique)
 * - Enrichissement des keywords depuis plusieurs sources
 * - Mapping complexe pour les éléments narratifs/esthétiques
 */
export const oeuvreConfig: GenericDetailPageConfig = {
  // Data fetching avec enrichissement complet
  dataFetcher: async (id: string): Promise<FetchResult> => {
    const [recitIas, actants, students, , keywords] = await Promise.all([getOeuvres(), getActants(), getStudents(), getTools(), getKeywords()]);

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

    const oeuvre = recitIas.find((r: any) => String(r.id) === String(id));

    if (oeuvre) {
      // Enrichir les actants
      if (oeuvre.actants && Array.isArray(oeuvre.actants)) {
        oeuvre.enrichedActants = oeuvre.actants
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

        oeuvre.primaryActant = oeuvre.enrichedActants.length > 0 ? oeuvre.enrichedActants[0] : null;
      }

      // Legacy support
      if (oeuvre.actant && !oeuvre.primaryActant) {
        if (typeof oeuvre.actant === 'object' && oeuvre.actant.id) {
          oeuvre.primaryActant = oeuvre.actant;
        } else {
          const actantId = oeuvre.actant;
          oeuvre.primaryActant =
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
      if (oeuvre.feedbacks) {
        oeuvre.feedbacks.forEach((feedback: any) => {
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
      ...(oeuvre?.keywords || []),
      ...(oeuvre?.risks || []),
      ...(oeuvre?.roles || []),
      ...(oeuvre?.scenarios || []),
      ...(oeuvre?.themes || []),
      ...(oeuvre?.processes || []),
      ...(oeuvre?.affects || []),
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
    if (oeuvre?.recommendations?.length) {
      try {
        const recommendationsPromises = oeuvre.recommendations.map((recId: string) => Items.getSeminarConfs(Number(recId)));
        recommendedConfs = await Promise.all(recommendationsPromises);
      } catch (error) {
        console.error('Error fetching recommended conferences:', error);
      }
    }

    console.log('oeuvre', oeuvre);

    return {
      itemDetails: oeuvre,
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
  mapOverviewProps: (oeuvre: any, currentVideoTime: number) => ({
    id: oeuvre.id,
    title: oeuvre.title,
    personnes: oeuvre.personne,
    medias: oeuvre.associatedMedia && oeuvre.associatedMedia.length > 0 ? oeuvre.associatedMedia : oeuvre.thumbnail ? [oeuvre.thumbnail] : [],
    credits: oeuvre.credits,
    fullUrl: oeuvre.url,
    currentTime: currentVideoTime,
    buttonText: 'Voir plus',
  }),

  mapDetailsProps: (oeuvre: any) => ({
    date: oeuvre.date,
    description: oeuvre.abstract,
    medium: oeuvre.medium,
    actants: oeuvre.actants,
  }),

  // Mapper pour les recommandations (format SmConfCard)
  mapRecommendationProps: (oeuvre: any) => ({
    id: oeuvre.id,
    title: oeuvre.title,
    type: 'oeuvre',
    url: null, // url est pour YouTube, on ne l'utilise pas ici
    thumbnail: oeuvre.associatedMedia?.[0] || oeuvre.thumbnail || null,
    actant: oeuvre.personne || [],
  }),

  // ✨ Options de vue simplifiées avec viewHelpers (6 vues en 1 ligne!)
  viewOptions: createOeuvreViews(),

  // Sections optionnelles
  showKeywords: true,
  showRecommendations: true,
  showComments: true,
  recommendationsTitle: 'Œuvres similaires',

  // Smart recommendations
  smartRecommendations: {
    // Récupère toutes les oeuvres pour trouver des similaires
    getAllResourcesOfType: async () => {
      const oeuvres = await getOeuvres();
      return oeuvres;
    },

    // Pour les oeuvres, on ne veut pas de recommandations liées
    // Les éléments narratifs/esthétiques sont déjà dans les vues
    // On veut seulement des oeuvres similaires
    getRelatedItems: () => [],

    maxRecommendations: 5,
  },

  // Type à afficher
  type: 'Œuvre',
};
