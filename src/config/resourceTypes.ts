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
  | 'recit_scientifique'
  | 'recit_artistique'
  | 'recit_techno_industriel'
  | 'recit_citoyen'
  | 'recit_mediatique'
  | 'annotation'
  | 'journee_etudes'
  | 'seminaire'
  | 'colloque'
  | 'element_esthetique'
  | 'element_narratif'
  | 'experimentation'
  | 'recit_artistique'
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

  recit_scientifique: {
    type: 'recit_scientifique',
    displayName: 'Récit scientifique',
    templateIds: [124],
    getUrl: (id) => `/corpus/recit-scientifique/${id}`,
  },

  recit_artistique: {
    type: 'recit_artistique',
    displayName: 'Œuvre',
    templateIds: [103],
    getUrl: (id) => `/corpus/recit_artistique/${id}`,
  },

  recit_techno_industriel: {
    type: 'recit_techno_industriel',
    displayName: 'Récit techno-industriel',
    templateIds: [117],
    getUrl: (id) => `/corpus/recit-techno-industriel/${id}`,
  },

  recit_citoyen: {
    type: 'recit_citoyen',
    displayName: 'Récit citoyen',
    templateIds: [119],
    getUrl: (id) => `/corpus/recit-citoyen/${id}`,
  },

  recit_mediatique: {
    type: 'recit_mediatique',
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

  journee_etudes: {
    type: 'journee_etudes',
    displayName: 'Journée d\'études',
    templateIds: [121],
    getUrl: (id) => `/corpus/journees-etudes/conference/${id}`,
  },

  seminaire: {
    type: 'seminaire',
    displayName: 'Séminaire',
    templateIds: [71],
    getUrl: (id) => `/corpus/seminaires/conference/${id}`,
  },

  colloque: {
    type: 'colloque',
    displayName: 'Colloque',
    templateIds: [122],
    getUrl: (id) => `/corpus/colloques/conference/${id}`,
  },

  element_esthetique: {
    type: 'element_esthetique',
    displayName: 'Élément esthétique',
    templateIds: [104],
    getUrl: (id) => `/corpus/element-esthetique/${id}`,
  },

  element_narratif: {
    type: 'element_narratif',
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

