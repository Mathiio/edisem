import { GenericDetailPageConfig, FetchResult } from '../config';
import { RecitiaOverviewCard, RecitiaOverviewSkeleton } from '@/components/features/miseEnRecit/RecitiaOverview';
import { RecitiaDetailsCard, RecitiaDetailsSkeleton } from '@/components/features/miseEnRecit/RecitiaDetails';
import { getRecitIas, getActants, getStudents, getTools, getKeywords } from '@/services/Items';
import * as Items from '@/services/Items';
import { createAnalysisView, createItemsListView } from '../helpers';

/**
 * Configuration pour les pages de mise en récit
 *
 * Exemple avec:
 * - Enrichissement des actants (nouveau système avec tableau)
 * - Support de l'ancien système (legacy)
 * - Gestion des concepts multiples (risks, roles, scenarios, etc.)
 */
export const miseEnRecitConfig: GenericDetailPageConfig = {
  // Data fetching avec enrichissement complet
  dataFetcher: async (id: string): Promise<FetchResult> => {
    const [recitIas, actants, students] = await Promise.all([getRecitIas(), getActants(), getStudents(), getTools(), getKeywords()]);

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

    const oeuvre = recitIas.find((r: any) => String(r.id) === String(id));

    if (oeuvre) {
      // ✅ NOUVEAU: Traiter le tableau actants
      if (oeuvre.actants && Array.isArray(oeuvre.actants)) {
        oeuvre.enrichedActants = oeuvre.actants
          .map((actant: any) => {
            // Si l'actant est déjà une chaîne (nom + organisation), on la garde telle quelle
            if (typeof actant === 'string' && !/^\d{5}$/.test(actant)) {
              return { displayName: actant };
            }

            // Sinon, c'est un ID numérique, on cherche dans les maps
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

      // ✅ LEGACY: Gérer l'ancien système actant
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
            studentMap.get(String(actantId));
        }
      }

      // Enrichir les feedbacks et leurs contributors
      if (oeuvre.feedbacks) {
        oeuvre.feedbacks.forEach((feedback: any) => {
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

    // Créer les concepts à partir de plusieurs sources
    const oeuvreConcepts = [
      ...(oeuvre?.concepts || []),
      ...(oeuvre?.risks || []),
      ...(oeuvre?.roles || []),
      ...(oeuvre?.scenarios || []),
      ...(oeuvre?.themes || []),
      ...(oeuvre?.processes || []),
      ...(oeuvre?.affects || []),
    ].map((word: string) => ({ title: word }));

    // Récupérer les conférences recommandées
    let recommendedConfs: any[] = [];
    if (oeuvre?.recommendations?.length) {
      try {
        const recommendationsPromises = oeuvre.recommendations.map((recId: string) => Items.getSeminarConfs(Number(recId)));
        recommendedConfs = await Promise.all(recommendationsPromises);
      } catch (error) {
        console.error('Error fetching recommended conferences:', error);
      }
    }

    return {
      itemDetails: oeuvre,
      keywords: oeuvreConcepts,
      recommendations: [],
      viewData: {
        recommendedConfs,
      },
    };
  },

  // Composants - Utilise RecitiaOverview qui prend des props individuelles
  overviewComponent: RecitiaOverviewCard,
  detailsComponent: RecitiaDetailsCard,
  overviewSkeleton: RecitiaOverviewSkeleton,
  detailsSkeleton: RecitiaDetailsSkeleton,

  // Mappers de props - Exemple de mapping vers des props individuelles
  mapOverviewProps: (oeuvre: any, currentVideoTime: number) => ({
    id: oeuvre.id,
    title: oeuvre.title,
    personnes: oeuvre.primaryActant ? oeuvre.primaryActant.displayName || `${oeuvre.primaryActant.firstname} ${oeuvre.primaryActant.lastname}` : '',
    credits: oeuvre.credits,
    medias: oeuvre.associatedMedia && oeuvre.associatedMedia.length > 0 ? oeuvre.associatedMedia : oeuvre.thumbnail ? [oeuvre.thumbnail] : [],
    fullUrl: oeuvre.fullUrl,
    currentTime: currentVideoTime,
    buttonText: 'Voir plus',
  }),

  mapDetailsProps: (oeuvre: any) => ({
    date: oeuvre.date,
    credits: oeuvre.credits,
    description: oeuvre.abstract,
    genre: oeuvre.genre,
    medium: oeuvre.medium,
  }),

  // ✨ Options de vue simplifiées avec viewHelpers
  viewOptions: [
    createAnalysisView(),
    createItemsListView({
      key: 'Reference',
      title: 'Références',
      getItems: (itemDetails) => itemDetails?.references || [],
      emptyMessage: 'Aucune référence',
      annotationType: 'Référence',
    }),
  ],

  // Sections optionnelles
  showKeywords: true,
  showRecommendations: false, // Géré manuellement via viewData
  showComments: true,
  recommendationsTitle: 'Conférences associées',
};
