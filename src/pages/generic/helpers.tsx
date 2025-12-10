import { ViewOption, SmartRecommendationsStrategy } from './config';
import { ItemsList, SimpleTextBlock, ToolItemData } from './components';
import { Bibliographies } from '@/components/features/conference/BibliographyCards';
import { Mediagraphies } from '@/components/features/conference/MediagraphyCards';
import { getResourceConfigByTemplateId, getDisplayName, getResourceUrl } from '@/config/resourceTypes';

/**
 * Helpers pour créer des viewOptions communes facilement
 *
 * Au lieu de copier-coller le même code, utilisez ces fonctions!
 */

// ========================================
// createItemsListView - Vue avec une liste d'items
// ========================================

interface CreateItemsListViewOptions {
  key: string;
  title: string;
  getItems: (itemDetails: any) => ToolItemData[];
  showAnnotation?: boolean;
  annotationType?: string;
  mapUrl?: (item: ToolItemData) => string;
}

export const createItemsListView = (options: CreateItemsListViewOptions): ViewOption => {
  return {
    key: options.key,
    title: options.title,
    renderContent: ({ itemDetails }) => {
      const items = options.getItems(itemDetails);
      return <ItemsList items={items} showAnnotation={options.showAnnotation} annotationType={options.annotationType} mapUrl={options.mapUrl} />;
    },
  };
};

// ========================================
// createTextView - Vue avec du texte simple
// ========================================

interface CreateTextViewOptions {
  key: string;
  title: string;
  getText: (itemDetails: any) => string | undefined;
  emptyMessage?: string;
}

export const createTextView = (options: CreateTextViewOptions): ViewOption => {
  return {
    key: options.key,
    title: options.title,
    renderContent: ({ itemDetails }) => {
      const text = options.getText(itemDetails);

      if (!text || text.trim() === '') {
        return (
          <div className='p-20 bg-c2 rounded-12 border-2 border-c3 text-center'>
            <p className='text-c4 text-14'>{options.emptyMessage || 'Aucun contenu disponible'}</p>
          </div>
        );
      }

      return <SimpleTextBlock content={text} />;
    },
  };
};

// ========================================
// Helpers prédéfinis pour cas courants
// ========================================

/**
 * Vue pour les références scientifiques
 */
export const createScientificReferencesView = (): ViewOption => {
  return {
    key: 'ContentScient',
    title: 'Contenus scientifiques',
    renderContent: ({ itemDetails, loading }) => {
      const references = itemDetails?.referencesScient || itemDetails?.references || [];

      // Filtrage mutuellement exclusif : d'abord les médiagraphies, puis le reste en bibliographies
      const mediagraphies = references.filter((ref: any) => ref?.type === 'mediagraphie' || ref?.mediagraphyType);
      const bibliographies = references
        .filter((ref: any) => {
          // Exclure les médiagraphies déjà filtrées
          const isMediagraphie = ref?.type === 'mediagraphie' || ref?.mediagraphyType;
          const isBibliographie = ref?.type === 'bibliographie' || ref?.template || ref?.resource_template_id;
          return !isMediagraphie && isBibliographie;
        })
        .map((ref: any) => ({
          ...ref,
          id: parseInt(ref.id) || ref.id, // Convertir id en number si c'est une string
          creator: Array.isArray(ref.creator) && ref.creator.length > 0 && typeof ref.creator[0] === 'object' ? ref.creator : [], // Garder le creator tel quel s'il est déjà au bon format, sinon tableau vide
        }));

      // Si aucune référence, ne rien afficher du tout
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
  };
};

/**
 * Vue pour les références culturelles
 */
export const createCulturalReferencesView = (): ViewOption => {
  return {
    key: 'ContentCultu',
    title: 'Contenus culturels',
    renderContent: ({ itemDetails, loading }) => {
      const references = itemDetails?.referencesCultu || itemDetails?.bibliographicCitations || [];

      // Filtrage mutuellement exclusif : d'abord les médiagraphies, puis le reste en bibliographies
      const mediagraphies = references.filter((ref: any) => ref?.type === 'mediagraphie' || ref?.mediagraphyType);
      const bibliographies = references
        .filter((ref: any) => {
          // Exclure les médiagraphies déjà filtrées
          const isMediagraphie = ref?.type === 'mediagraphie' || ref?.mediagraphyType;
          const isBibliographie = ref?.type === 'bibliographie' || ref?.template || ref?.resource_template_id;
          return !isMediagraphie && isBibliographie;
        })
        .map((ref: any) => ({
          ...ref,
          id: parseInt(ref.id) || ref.id, // Convertir id en number si c'est une string
          creator: Array.isArray(ref.creator) && ref.creator.length > 0 && typeof ref.creator[0] === 'object' ? ref.creator : [], // Garder le creator tel quel s'il est déjà au bon format, sinon tableau vide
        }));

      // Si aucune référence, ne rien afficher du tout
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
  };
};

/**
 * Vue pour les outils
 */
export const createToolsView = (getTools?: (itemDetails: any, viewData?: any) => ToolItemData[], mapUrl?: (item: ToolItemData) => string): ViewOption => {
  return {
    key: 'Outils',
    title: 'Outils',
    renderContent: ({ itemDetails, viewData }) => {
      const items = getTools ? getTools(itemDetails, viewData) : itemDetails?.tools || [];
      return <ItemsList items={items} annotationType='Outil' mapUrl={mapUrl} />;
    },
  };
};

/**
 * Vue pour les archives
 */
export const createArchivesView = (): ViewOption => {
  return createItemsListView({
    key: 'Archives',
    title: 'Archives',
    getItems: (itemDetails) => itemDetails?.archives || [],

    annotationType: 'Archive',
  });
};

/**
 * Vue pour les éléments narratifs
 */
export const createNarrativeElementsView = (): ViewOption => {
  return createItemsListView({
    key: 'ElementsNarratifs',
    title: 'Éléments narratifs',
    getItems: (itemDetails) => itemDetails?.elementsNarratifs || [],
    annotationType: 'Élément narratif',
    mapUrl: (item) => `/corpus/element-narratif/${item.id}`,
  });
};

/**
 * Vue pour les éléments esthétiques
 */
export const createAestheticElementsView = (): ViewOption => {
  return createItemsListView({
    key: 'ElementsEsthetique',
    title: 'Éléments esthétiques',
    getItems: (itemDetails) => itemDetails?.elementsEsthetique || [],
    annotationType: 'Élément esthétique',
    mapUrl: (item) => `/corpus/element-esthetique/${item.id}`,
  });
};

/**
 * Vue pour les analyses critiques
 */
export const createCriticalAnalysisView = (): ViewOption => {
  return createItemsListView({
    key: 'AnalyseCritique',
    title: 'Analyses critiques',
    getItems: (itemDetails) => itemDetails?.annotations || itemDetails?.descriptions || itemDetails?.abstract || [],
    annotationType: 'Analyse',
    mapUrl: (item) => `/corpus/analyse-critique/${item.id}`,
  });
};

/**
 * Vue pour les feedbacks
 */
export const createFeedbacksView = (): ViewOption => {
  return createItemsListView({
    key: 'Feedback',
    title: "Retours d'expérience",
    getItems: (itemDetails) => itemDetails?.feedbacks || [],
    annotationType: 'Feedback',
    mapUrl: (item) => `/feedback/${item.id}`,
  });
};

/**
 * Vue pour une hypothèse/abstract
 */
export const createHypothesisView = (): ViewOption => {
  return createTextView({
    key: 'Hypothese',
    title: 'Hypothèse à expérimenter',
    getText: (itemDetails) => itemDetails?.abstract,
  });
};

/**
 * Vue pour une description/analyse
 */
export const createAnalysisView = (): ViewOption => {
  return createTextView({
    key: 'Analyse',
    title: 'Analyse',
    getText: (itemDetails) => itemDetails?.description || itemDetails?.abstract,
  });
};

/**
 * Ensemble complet pour une page Oeuvre
 */
export const createOeuvreViews = (): ViewOption[] => {
  return [createCriticalAnalysisView(), createScientificReferencesView(), createCulturalReferencesView(), createNarrativeElementsView(), createAestheticElementsView()];
};

/**
 * Ensemble complet pour une page Experimentation
 */
export const createExperimentationViews = (toolsGetter?: (itemDetails: any, viewData?: any) => ToolItemData[], toolsMapUrl?: (item: ToolItemData) => string): ViewOption[] => {
  return [createFeedbacksView(), createHypothesisView(), createScientificReferencesView(), createCulturalReferencesView(), createToolsView(toolsGetter, toolsMapUrl)];
};

// ========================================
// Smart Recommendations System
// ========================================

/**
 * Calcule la similarité entre deux items basée sur leurs keywords
 */
const calculateKeywordSimilarity = (item1: any, item2: any): number => {
  const keywords1 = new Set((item1.keywords || []).map((k: any) => (typeof k === 'string' ? k : k.id || k.title)).filter(Boolean));
  const keywords2 = new Set((item2.keywords || []).map((k: any) => (typeof k === 'string' ? k : k.id || k.title)).filter(Boolean));

  if (keywords1.size === 0 && keywords2.size === 0) return 0;

  // Intersection des keywords
  const intersection = new Set([...keywords1].filter((x) => keywords2.has(x)));
  const union = new Set([...keywords1, ...keywords2]);

  return intersection.size / union.size; // Jaccard similarity
};

/**
 * Calcule la similarité par défaut entre deux items
 * Combine plusieurs critères: keywords, type, date, etc.
 */
export const defaultSimilarityCalculator = (item1: any, item2: any): number => {
  let score = 0;
  let factors = 0;

  // 1. Similarité des keywords (poids: 0.5)
  const keywordSimilarity = calculateKeywordSimilarity(item1, item2);
  score += keywordSimilarity * 0.5;
  factors += 0.5;

  // 2. Même type/catégorie (poids: 0.2)
  if (item1.type && item2.type && item1.type === item2.type) {
    score += 0.2;
  }
  factors += 0.2;

  // 3. Même actant/auteur (poids: 0.15)
  const actant1 = item1.primaryActant?.id || item1.actant?.id;
  const actant2 = item2.primaryActant?.id || item2.actant?.id;
  if (actant1 && actant2 && String(actant1) === String(actant2)) {
    score += 0.15;
  }
  factors += 0.15;

  // 4. Date proche (poids: 0.15)
  if (item1.date && item2.date) {
    try {
      const date1 = new Date(item1.date).getTime();
      const date2 = new Date(item2.date).getTime();
      const daysDiff = Math.abs(date1 - date2) / (1000 * 60 * 60 * 24);

      // Plus les dates sont proches, plus le score est élevé
      // Score maximal si < 30 jours, décroissance jusqu'à 365 jours
      const dateScore = Math.max(0, 1 - daysDiff / 365);
      score += dateScore * 0.15;
    } catch (e) {
      // Ignore les erreurs de parsing de date
    }
  }
  factors += 0.15;

  return factors > 0 ? score / factors : 0;
};

/**
 * Génère des recommandations intelligentes basées sur:
 * 1. Les éléments liés (même contexte parent)
 * 2. Les éléments similaires (même type avec keywords similaires)
 */
export const generateSmartRecommendations = async (itemDetails: any, strategy: SmartRecommendationsStrategy): Promise<any[]> => {
  const maxRecommendations = strategy.maxRecommendations || 5;
  const recommendations: any[] = [];

  // 1. Récupérer les éléments liés (priorité haute)
  if (strategy.getRelatedItems) {
    const relatedItemsResult = strategy.getRelatedItems(itemDetails);

    // Support pour retour synchrone ou asynchrone
    const relatedItems = relatedItemsResult instanceof Promise ? await relatedItemsResult : relatedItemsResult;

    // Filtrer l'item actuel
    const filteredRelated = relatedItems.filter((item: any) => String(item.id) !== String(itemDetails.id));

    recommendations.push(...filteredRelated);
  }

  // 2. Si pas assez de recommandations, chercher des items similaires
  if (recommendations.length < maxRecommendations && strategy.getAllResourcesOfType) {
    const allResources = await strategy.getAllResourcesOfType();

    // Filtrer l'item actuel et ceux déjà dans les recommandations
    const existingIds = new Set([String(itemDetails.id), ...recommendations.map((r) => String(r.id))]);

    const candidates = allResources.filter((item: any) => !existingIds.has(String(item.id)));

    // Calculer la similarité avec chaque candidat
    const similarityCalculator = strategy.calculateSimilarity || defaultSimilarityCalculator;

    const scored = candidates.map((item: any) => ({
      item,
      score: similarityCalculator(itemDetails, item),
    }));

    // Trier par score décroissant et prendre les meilleurs
    scored.sort((a, b) => b.score - a.score);

    const needed = maxRecommendations - recommendations.length;
    const similarItems = scored.slice(0, needed).map((s) => s.item);

    recommendations.push(...similarItems);
  }

  return recommendations.slice(0, maxRecommendations);
};

// helpers.ts - Section Target Mapper (à ajouter à votre fichier existant)

// ========================================
// Target Mapper Configuration
// ========================================
// NOTE: Cette configuration est maintenant centralisée dans @/config/resourceTypes.ts

// ========================================
// Helper pour créer une vue Target
// ========================================

/**
 * Crée une vue pour afficher le target d'une annotation de manière dynamique
 * Utilise le composant ItemsList existant pour l'affichage
 */
export const createTargetView = (options?: { key?: string; title?: string; getTargets?: (itemDetails: any) => any }): ViewOption => {
  return {
    key: options?.key || 'target',
    title: options?.title || 'Contenus annotés',

    renderContent: ({ itemDetails }) => {
      const targets = options?.getTargets ? options.getTargets(itemDetails) : itemDetails?.target;

      // Support pour les tableaux (nouveau format) et objets simples (ancien format)
      const targetArray = Array.isArray(targets) ? targets : targets ? [targets] : [];
      const firstTarget = targetArray[0];

      if (!firstTarget) {
        return null;
      }

      // Utiliser le renderer spécial si disponible, sinon le rendu par défaut
      const renderer = TARGET_COMPONENT_MAP[firstTarget.type] || renderDefaultTarget;

      return (
        <div className='space-y-4'>
          <div>
            <span className='inline-block py-1 text-xs font-medium text-c5 rounded-full'>{getDisplayName(firstTarget.type)}</span>
          </div>

          {renderer(firstTarget)}
        </div>
      );
    },
  };
};

// Mapping type -> rendu du composant métier correct
// Note: Certains types (bibliographie, mediagraphie) ont des composants spéciaux
const TARGET_COMPONENT_MAP: Record<string, (target: any) => JSX.Element> = {
  bibliographie: (t) => <Bibliographies bibliographies={[t]} loading={false} notitle />,
  mediagraphie: (t) => <Mediagraphies items={[t]} loading={false} notitle />,
};

/**
 * Rendu par défaut pour un target utilisant ItemsList
 */
const renderDefaultTarget = (target: any) => {
  const displayName = getDisplayName(target.type);
  const url = getResourceUrl(target.type, target.id);
  return <ItemsList items={[target]} annotationType={displayName} mapUrl={() => url} />;
};

/**
 * Crée une vue pour afficher plusieurs targets (si l'annotation en a plusieurs)
 */
export const createTargetsListView = (options?: { key?: string; title?: string; emptyMessage?: string; getTargets?: (itemDetails: any) => any }): ViewOption => {
  return {
    key: options?.key || 'targets',
    title: options?.title || 'Ressources liées',
    renderContent: ({ itemDetails }) => {
      let targets = options?.getTargets ? options.getTargets(itemDetails) : itemDetails?.targets || [itemDetails?.target].filter(Boolean);

      // Aplatir les tableaux imbriqués (cas où un target est lui-même un tableau)
      const flattenTargets = (items: any[]): any[] => {
        return items.reduce((acc, item) => {
          if (Array.isArray(item)) {
            return [...acc, ...flattenTargets(item)];
          }
          return [...acc, item];
        }, []);
      };

      // Filtrer les valeurs null, undefined et autres valeurs falsy
      if (Array.isArray(targets)) {
        targets = flattenTargets(targets);
        targets = targets.filter((target: any) => target !== null && target !== undefined && target !== '');
      }

      console.log('Targets received:', targets);

      if (!targets || targets.length === 0) {
        return null;
      }

      // Grouper les targets par type pour un affichage organisé
      const targetsByType: Record<string, { typeInfo: any; items: any[] }> = targets.reduce((acc: Record<string, { typeInfo: any; items: any[] }>, target: any) => {
        // Debug: afficher les targets pour comprendre la structure
        console.log('Target debug:', target);

        // Si c'est une URL externe (juste uri + title, sans id), créer un type spécial
        if (target.uri && !target.id && !target.template_id && !target.resource_template_id) {
          const externalLinkType = 'Liens externes';
          if (!acc[externalLinkType]) {
            acc[externalLinkType] = {
              typeInfo: {
                type: externalLinkType,
                getUrl: (item: any) => item.uri,
              },
              items: [],
            };
          }
          acc[externalLinkType].items.push(target);
          return acc;
        }

        // Si l'objet a un type défini mais pas de template_id (ex: objets déjà enrichis)
        if (target.type && target.id && !target.template_id && !target.resource_template_id) {
          const displayName = getDisplayName(target.type);

          if (!acc[displayName]) {
            acc[displayName] = {
              typeInfo: {
                type: displayName,
                getUrl: (item: any) => getResourceUrl(item.type, item.id),
              },
              items: [],
            };
          }
          acc[displayName].items.push(target);
          return acc;
        }

        // Ignorer les targets sans template_id et sans type
        if (!target || (!target.template_id && !target.resource_template_id)) return acc;

        const templateId = target.template_id || target.resource_template_id;
        const resourceConfig = getResourceConfigByTemplateId(templateId);

        if (!resourceConfig) {
          console.log('No resource config found for template_id:', templateId, 'target:', target);
          // Pour le debug, créons une config temporaire pour les template_id inconnus
          const unknownType = `Type inconnu (${templateId})`;
          if (!acc[unknownType]) {
            acc[unknownType] = {
              typeInfo: {
                type: unknownType,
                getUrl: (item: any) => item.url || item.uri || '#',
              },
              items: [],
            };
          }
          acc[unknownType].items.push(target);
          return acc;
        }

        const displayName = resourceConfig.displayName;
        if (!acc[displayName]) {
          acc[displayName] = {
            typeInfo: {
              type: displayName,
              getUrl: (item: any) => resourceConfig.getUrl(item.id),
            },
            items: [],
          };
        }
        acc[displayName].items.push(target);
        return acc;
      }, {});

      console.log('targetsByType:', targetsByType);

      return (
        <div className='space-y-8'>
          {Object.entries(targetsByType).map(([typeName, { typeInfo, items }]) => {
            console.log('Rendering type:', typeName, 'with items:', items);
            return (
              <div key={typeName} className='space-y-3'>
                <h3 className='text-lg font-semibold text-c5 flex items-center gap-2'>
                  <span className='inline-block  py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full'>{typeName}</span>
                </h3>
                <ItemsList
                  items={items}
                  showAnnotation={true}
                  annotationType={typeName}
                  mapUrl={(item) => (typeInfo.getUrl ? typeInfo.getUrl(item) : item.url || item.uri || '#')}
                />
              </div>
            );
          })}
        </div>
      );
    },
  };
};
