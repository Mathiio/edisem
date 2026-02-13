/**
 * Mapping centralisé entre les template IDs et les fonctions de fetching
 * 
 * Ce fichier évite la duplication du switch/case dans getAnnotationsWithTargets
 */

import { TEMPLATE_ID_TO_TYPE, ResourceType } from '@/config/resourceConfig';
import * as Items from './Items';
import { getResourceDetails } from './resourceDetails';

/**
 * Type pour une fonction de fetching
 */
type FetcherFunction = (id: number | string) => Promise<any>;

/**
 * Mapping des types de ressources vers leurs fonctions de fetching
 * Note: Les wrappers convertissent les string en number pour compatibilité avec Items.ts
 */
const RESOURCE_TYPE_FETCHERS: Record<ResourceType, FetcherFunction> = {
  mediagraphie: async (id) => Items.getMediagraphies(typeof id === 'string' ? parseInt(id) : id),
  bibliographie: async (id) => Items.getBibliographies(typeof id === 'string' ? parseInt(id) : id),
  recit_scientifique: async (id) => getResourceDetails(id),
  recit_artistique: async (id) => getResourceDetails(id),
  recit_techno_industriel: async (id) => getResourceDetails(id),
  recit_citoyen: async (id) => getResourceDetails(id),
  recit_mediatique: async (id) => getResourceDetails(id),
  annotation: async (id) => Items.getAnnotations(typeof id === 'string' ? parseInt(id) : id),
  journee_etudes: async (id) => getResourceDetails(id),
  seminaire: async (id) => getResourceDetails(id),
  colloque: async (id) => getResourceDetails(id),
  element_esthetique: async (id) => getResourceDetails(id),
  element_narratif: async (id) => getResourceDetails(id),
  experimentation: async (id) => getResourceDetails(id),
  experimentation_etudiant: async () => "",
  tool: async (id) => getResourceDetails(id),
  feedback: async (id) => getResourceDetails(id),
};

/**
 * Récupère la fonction de fetching pour un template ID donné
 */
export function getFetcherByTemplateId(templateId: number | string): FetcherFunction | null {
  const id = parseInt(String(templateId));
  const resourceType = TEMPLATE_ID_TO_TYPE[id];

  if (!resourceType) {
    return null;
  }

  return RESOURCE_TYPE_FETCHERS[resourceType] || null;
}

/**
 * Récupère la fonction de fetching pour un type de ressource donné
 */
export function getFetcherByType(type: ResourceType): FetcherFunction | null {
  return RESOURCE_TYPE_FETCHERS[type] || null;
}

/**
 * Fetch une ressource par son template ID et son ID
 */
export async function fetchResourceByTemplateId(templateId: number | string, id: number | string): Promise<any> {
  const fetcher = getFetcherByTemplateId(templateId);

  if (!fetcher) {
    console.warn(`No fetcher found for template_id: ${templateId}`);
    return null;
  }

  try {
    return await fetcher(id);
  } catch (error) {
    console.error(`Error fetching resource (template_id: ${templateId}, id: ${id}):`, error);
    return null;
  }
}

