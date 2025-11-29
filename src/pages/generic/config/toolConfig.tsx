import { GenericDetailPageConfig, FetchResult } from '../config';
import { RecitiaOverviewCard, RecitiaOverviewSkeleton } from '@/components/features/miseEnRecit/RecitiaOverview';
import { RecitiaDetailsCard, RecitiaDetailsSkeleton } from '@/components/features/miseEnRecit/RecitiaDetails';
import { getTools, getExperimentations, getActants, getStudents, getPersonnes } from '@/services/Items';
import { ItemsList } from '../components';

export const toolConfig: GenericDetailPageConfig = {
  // Data fetching avec enrichissement des keywords, expérimentations et contributeurs
  dataFetcher: async (id: string): Promise<FetchResult> => {
    const [tools, experimentations, actants, students, personnes] = await Promise.all([getTools(), getExperimentations(), getActants(), getStudents(), getPersonnes()]);

    // Créer des maps pour enrichir les contributeurs
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

    const personneMap = new Map();
    personnes.forEach((p: any) => {
      personneMap.set(p.id, p);
      personneMap.set(String(p.id), p);
      personneMap.set(Number(p.id), p);
    });

    const tool = tools.find((t: any) => String(t.id) === String(id));

    // Enrichir les contributeurs (peuvent être actants, students ou personnes)
    if (tool?.contributors && Array.isArray(tool.contributors)) {
      tool.enrichedContributors = tool.contributors
        .map((contributor: any) => {
          const contributorId = contributor.id || contributor;
          return (
            actantMap.get(contributorId) ||
            actantMap.get(String(contributorId)) ||
            actantMap.get(Number(contributorId)) ||
            studentMap.get(contributorId) ||
            studentMap.get(String(contributorId)) ||
            studentMap.get(Number(contributorId)) ||
            personneMap.get(contributorId) ||
            personneMap.get(String(contributorId)) ||
            personneMap.get(Number(contributorId)) ||
            contributor
          );
        })
        .filter(Boolean)
        .map((contributor: any) => ({
          ...contributor,
          name: contributor.name || contributor.title || `${contributor.firstname || ''} ${contributor.lastname || ''}`.trim() || 'Contributeur sans nom',
          thumbnail: contributor.thumbnail || contributor.picture,
        }));
    }

    // Enrichir le projet associé si c'est une expérimentation
    if (tool?.isPartOf) {
      const experimentation = experimentations.find((exp: any) => String(exp.id) === String(tool.isPartOf.id));
      if (experimentation) {
        tool.isPartOf = {
          ...tool.isPartOf,
          type: 'experimentation',
          url: `/corpus/experimentation/${experimentation.id}`,
        };
      }
    }

    // Enrichir les keywords si nécessaire (si le tool avait des keywords)
    // Pour l'instant, les tools n'ont pas de keywords dans le JSON fourni
    const toolKeywords: any[] = [];

    return {
      itemDetails: tool,
      keywords: toolKeywords,
      recommendations: [],
    };
  },

  // Composants UI réutilisés
  overviewComponent: RecitiaOverviewCard,
  detailsComponent: RecitiaDetailsCard,
  overviewSkeleton: RecitiaOverviewSkeleton,
  detailsSkeleton: RecitiaDetailsSkeleton,

  // Mapper les props pour l'overview
  mapOverviewProps: (tool: any, currentVideoTime: number) => ({
    id: tool.id,
    title: tool.title,
    personnes: tool.enrichedContributors || [],
    medias: tool.associatedMedia || [],
    fullUrl: tool.homepage || tool.repository || tool.bugDatabase || '#',
    currentTime: currentVideoTime,
    buttonText: 'Voir plus',
  }),

  // Mapper les props pour les détails
  mapDetailsProps: (tool: any) => ({
    date: tool.release || '',
    actants: [],
    description:
      [
        tool.description ? tool.description : '',
        tool.category ? `<strong>Catégorie:</strong> ${tool.category}` : '',
        tool.purpose ? `<strong>Objectif:</strong> ${tool.purpose}` : '',
      ]
        .filter(Boolean)
        .join('<br><br>') || '',
  }),

  // Mapper pour les recommandations (format SmConfCard)
  mapRecommendationProps: (tool: any) => ({
    id: tool.id,
    title: tool.name || tool.title,
    type: 'tool',
    url: null, // url est pour YouTube, on ne l'utilise pas ici
    thumbnail: tool.thumbnail || null,
    actant: tool.enrichedContributors || [],
  }),

  // ✨ Vues personnalisées pour les outils
  viewOptions: [
    // Vue 1 : Caractéristiques (Type, Fonction, puis autres)
    {
      key: 'Caracteristiques',
      title: 'Caractéristiques',
      renderContent: ({ itemDetails }) => {
        if (!itemDetails) return null;

        const caracteristiquesGroupe1 = [
          { label: "Type de l'outil", value: itemDetails?.category },
          { label: 'Fonction', value: itemDetails?.purpose },
        ].filter((item) => item.value);

        const caracteristiquesGroupe2 = [
          { label: "Systèmes d'exploitation", value: itemDetails?.operatingSystem },
          { label: 'Licence', value: itemDetails?.license },
        ].filter((item) => item.value);

        const hasData = caracteristiquesGroupe1.length > 0 || caracteristiquesGroupe2.length > 0;

        if (!hasData) {
          return <div className='p-20 bg-c2 rounded-12 border-2 border-c3 text-c4 text-center'>Aucune caractéristique disponible</div>;
        }

        return (
          <div className='flex flex-col gap-10'>
            {/* Premier groupe : Type et Fonction */}
            {caracteristiquesGroupe1.map((item) => (
              <div key={item.label} className='flex flex-col gap-10'>
                <div className='text-c6 font-semibold text-14'>{item.label}</div>
                <div className='bg-c1 rounded-8 p-15 border-2 border-c3'>
                  <p className='text-c5 text-14 leading-[125%]'>{item.value}</p>
                </div>
              </div>
            ))}

            {/* Deuxième groupe : Autres caractéristiques */}
            {caracteristiquesGroupe2.map((item) => (
              <div key={item.label} className='flex flex-col gap-10'>
                <div className='text-c6 font-semibold text-14'>{item.label}</div>
                <div className='bg-c1 rounded-8 p-15 border-2 border-c3'>
                  <p className='text-c5 text-14 leading-[125%]'>{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        );
      },
    },

    // Vue 2 : Spécifications (Release, Formats + Langages de programmation)
    {
      key: 'Specifications',
      title: 'Spécifications',
      renderContent: ({ itemDetails }) => {
        if (!itemDetails) return null;

        const specifications = [{ label: 'Format de fichier', value: itemDetails?.fileRelease }].filter((item) => item.value);

        const programmingLanguages = (itemDetails?.programmingLanguages || []).map((lang: any) => ({
          ...lang,
          title: lang.name || lang.title || 'Langage sans nom',
        }));

        const hasData = specifications.length > 0 || programmingLanguages.length > 0;

        if (!hasData) {
          return <div className='p-20 bg-c2 rounded-12 border-2 border-c3 text-c4 text-center'>Aucune spécification technique disponible</div>;
        }

        return (
          <div className='flex flex-col gap-10'>
            {/* Langages de programmation */}
            {programmingLanguages.length > 0 && (
              <div className='flex flex-col gap-10'>
                <div className='text-c6 font-semibold text-14'>Langage de programmation de l'outil</div>
                <ItemsList items={programmingLanguages} emptyMessage='Aucun langage de programmation spécifié' showAnnotation={false} />
              </div>
            )}

            {/* Spécifications techniques */}
            {specifications.map((item) => (
              <div key={item.label} className='flex flex-col gap-10'>
                <div className='text-c6 font-semibold text-14'>{item.label}</div>
                <div className='bg-c1 rounded-8 p-15 border-2 border-c3'>
                  <p className='text-c5 text-14 leading-[125%]'>{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        );
      },
    },

    // Vue 4 : Projet associé
    {
      key: 'ProjetAssocie',
      title: 'Projets associés',
      renderContent: ({ itemDetails }) => {
        if (!itemDetails?.isPartOf) {
          return <div className='p-20 bg-c2 rounded-12 border-2 border-c3 text-c4 text-center'>Aucun projet associé</div>;
        }

        const projet = itemDetails.isPartOf;
        const isExperimentation = projet.type === 'experimentation' || projet.url?.includes('experimentation');
        console.log(projet);

        return (
          <div className='flex flex-col gap-10'>
            {isExperimentation && projet.url ? (
              <a href={projet.url} className='bg-c1 rounded-8 p-15 border-2 border-c3 hover:border-c4 transition-colors flex items-center gap-15'>
                {projet.thumbnail && <img src={projet.thumbnail} alt={projet.title || 'Expérimentation'} className='w-50 h-50 rounded-8 object-cover flex-shrink-0' />}
                <p className='text-c5 text-14 leading-[125%]'>{projet.title || 'Expérimentation associée'}</p>
              </a>
            ) : (
              <div className='bg-c1 rounded-8 p-15 border-2 border-c3 flex items-center gap-15'>
                {projet.thumbnail && <img src={projet.thumbnail} alt={projet.title || 'Projet'} className='w-50 h-50 rounded-8 object-cover flex-shrink-0' />}
                <p className='text-c5 text-14 leading-[125%]'>{projet.title || 'Projet associé'}</p>
              </div>
            )}
          </div>
        );
      },
    },
  ],

  // Onglet par défaut
  defaultView: 'Caracteristiques',

  // Sections optionnelles
  showKeywords: false, // Les tools n'ont pas de keywords dans le JSON fourni
  showComments: true,
  showRecommendations: true,
  recommendationsTitle: 'Outils similaires',

  // Smart recommendations
  smartRecommendations: {
    // Récupère tous les outils pour trouver des similaires
    getAllResourcesOfType: async () => {
      const tools = await getTools();
      return tools;
    },
    
    // Pour les outils, on veut seulement des outils similaires
    getRelatedItems: () => [],
    
    maxRecommendations: 5,
  },
  
  // Type à afficher
  type: 'Outil',
};
