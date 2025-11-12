import { ViewOption } from './config';
import { ItemsList, SimpleTextBlock, ToolItemData } from './components';

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
  emptyMessage?: string;
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
      return (
        <ItemsList items={items} emptyMessage={options.emptyMessage} showAnnotation={options.showAnnotation} annotationType={options.annotationType} mapUrl={options.mapUrl} />
      );
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
  return createItemsListView({
    key: 'ContentScient',
    title: 'Contenus scientifiques',
    getItems: (itemDetails) => itemDetails?.referencesScient || itemDetails?.references || [],
    emptyMessage: 'Aucune référence scientifique',
    annotationType: 'Référence',
  });
};

/**
 * Vue pour les références culturelles
 */
export const createCulturalReferencesView = (): ViewOption => {
  return createItemsListView({
    key: 'ContentCultu',
    title: 'Contenus culturels',
    getItems: (itemDetails) => itemDetails?.referencesCultu || itemDetails?.bibliographicCitations || [],
    emptyMessage: 'Aucune référence culturelle',
    annotationType: 'Référence',
  });
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
      return <ItemsList items={items} emptyMessage='Aucun outil' annotationType='Outil' mapUrl={mapUrl} />;
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
    emptyMessage: 'Aucune archive',
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
    emptyMessage: 'Aucun élément narratif',
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
    emptyMessage: 'Aucun élément esthétique',
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
    getItems: (itemDetails) => itemDetails?.annotations || [],
    emptyMessage: 'Aucune analyse critique',
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
    emptyMessage: "Aucun retour d'expérience",
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
    emptyMessage: 'Aucune hypothèse définie',
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
    emptyMessage: 'Aucune analyse disponible',
  });
};

/**
 * Ensemble complet pour une page Oeuvre
 */
export const createOeuvreViews = (): ViewOption[] => {
  return [
    createCriticalAnalysisView(),
    createScientificReferencesView(),
    createCulturalReferencesView(),
    //createArchivesView(),
    createNarrativeElementsView(),
    createAestheticElementsView(),
  ];
};

/**
 * Ensemble complet pour une page Experimentation
 */
export const createExperimentationViews = (toolsGetter?: (itemDetails: any, viewData?: any) => ToolItemData[], toolsMapUrl?: (item: ToolItemData) => string): ViewOption[] => {
  return [createFeedbacksView(), createHypothesisView(), createScientificReferencesView(), createCulturalReferencesView(), createToolsView(toolsGetter, toolsMapUrl)];
};
