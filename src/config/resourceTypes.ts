/**
 * Configuration centralisée pour tous les types de ressources
 * 
 * Ce fichier définit :
 * - Les types de ressources
 * - Les template IDs associés
 * - Les noms d'affichage
 * - Les URLs de routage
 */

// ========================================
// Types de ressources
// ========================================

export type ResourceType =
  | 'mediagraphie'
  | 'bibliographie'
  | 'documentationScientifique'
  | 'oeuvre'
  | 'objetTechnoIndustriel'
  | 'recitCitoyen'
  | 'recitMediatique'
  | 'annotation'
  | 'studyDay'
  | 'seminar'
  | 'colloque'
  | 'elementEsthetique'
  | 'elementNarratif'
  | 'experimentation'
  | 'tool';

// ========================================
// Configuration des types de ressources
// ========================================

export interface ResourceTypeConfig {
  type: ResourceType;
  displayName: string;
  templateIds: number[];
  getUrl: (id: string | number) => string;
}

export const RESOURCE_TYPES: Record<ResourceType, ResourceTypeConfig> = {
  mediagraphie: {
    type: 'mediagraphie',
    displayName: 'Médiagraphie',
    templateIds: [83, 98],
    getUrl: (id) => `/corpus/mediagraphie/${id}`,
  },

  bibliographie: {
    type: 'bibliographie',
    displayName: 'Bibliographie',
    templateIds: [81, 99],
    getUrl: (id) => `/corpus/bibliographie/${id}`,
  },

  documentationScientifique: {
    type: 'documentationScientifique',
    displayName: 'Documentation scientifique',
    templateIds: [124],
    getUrl: (id) => `/corpus/documentation/${id}`,
  },

  oeuvre: {
    type: 'oeuvre',
    displayName: 'Œuvre',
    templateIds: [103],
    getUrl: (id) => `/corpus/oeuvre/${id}`,
  },

  objetTechnoIndustriel: {
    type: 'objetTechnoIndustriel',
    displayName: 'Objet techno-industriel',
    templateIds: [117],
    getUrl: (id) => `/corpus/objet-techno-industriel/${id}`,
  },

  recitCitoyen: {
    type: 'recitCitoyen',
    displayName: 'Récit citoyen',
    templateIds: [119],
    getUrl: (id) => `/corpus/recit-citoyen/${id}`,
  },

  recitMediatique: {
    type: 'recitMediatique',
    displayName: 'Récit médiatique',
    templateIds: [120],
    getUrl: (id) => `/corpus/recit-mediatique/${id}`,
  },

  annotation: {
    type: 'annotation',
    displayName: 'Analyse critique',
    templateIds: [101, 125],
    getUrl: (id) => `/corpus/analyse-critique/${id}`,
  },

  studyDay: {
    type: 'studyDay',
    displayName: 'Conférence Study Day',
    templateIds: [121],
    getUrl: (id) => `/corpus/journees-etudes/conference/${id}`,
  },

  seminar: {
    type: 'seminar',
    displayName: 'Conférence Séminaire',
    templateIds: [71],
    getUrl: (id) => `/corpus/seminaires/conference/${id}`,
  },

  colloque: {
    type: 'colloque',
    displayName: 'Conférence Colloque',
    templateIds: [122],
    getUrl: (id) => `/corpus/colloques/conference/${id}`,
  },

  elementEsthetique: {
    type: 'elementEsthetique',
    displayName: 'Élément esthétique',
    templateIds: [104],
    getUrl: (id) => `/corpus/element-esthetique/${id}`,
  },

  elementNarratif: {
    type: 'elementNarratif',
    displayName: 'Élément narratif',
    templateIds: [105],
    getUrl: (id) => `/corpus/element-narratif/${id}`,
  },

  experimentation: {
    type: 'experimentation',
    displayName: 'Expérimentation',
    templateIds: [106],
    getUrl: (id) => `/corpus/experimentation/${id}`,
  },

  tool: {
    type: 'tool',
    displayName: 'Outil',
    templateIds: [118],
    getUrl: (id) => `/corpus/tool/${id}`,
  },
};

// ========================================
// Helpers et utilitaires
// ========================================

/**
 * Map inversé: template_id -> ResourceType
 */
export const TEMPLATE_ID_TO_TYPE: Record<number, ResourceType> = Object.values(RESOURCE_TYPES).reduce((acc, config) => {
  config.templateIds.forEach((templateId) => {
    acc[templateId] = config.type;
  });
  return acc;
}, {} as Record<number, ResourceType>);

/**
 * Récupère la config d'un type de ressource par son template_id
 */
export function getResourceConfigByTemplateId(templateId: number | string): ResourceTypeConfig | null {
  const id = parseInt(String(templateId));
  const type = TEMPLATE_ID_TO_TYPE[id];
  return type ? RESOURCE_TYPES[type] : null;
}

/**
 * Récupère la config d'un type de ressource par son type
 */
export function getResourceConfigByType(type: string): ResourceTypeConfig | null {
  return RESOURCE_TYPES[type as ResourceType] || null;
}

/**
 * Récupère le nom d'affichage d'un type
 */
export function getDisplayName(type: string): string {
  const config = getResourceConfigByType(type);
  return config?.displayName || type;
}

/**
 * Récupère l'URL d'une ressource
 */
export function getResourceUrl(type: string, id: string | number): string {
  const config = getResourceConfigByType(type);
  return config ? config.getUrl(id) : '#';
}

/**
 * Récupère tous les template IDs utilisés
 */
export function getAllTemplateIds(): number[] {
  return Object.keys(TEMPLATE_ID_TO_TYPE).map(Number);
}

/**
 * Vérifie si un template ID est connu
 */
export function isKnownTemplateId(templateId: number | string): boolean {
  const id = parseInt(String(templateId));
  return id in TEMPLATE_ID_TO_TYPE;
}

