import { SimplifiedDetailConfig } from '../simplifiedConfig';
import { convertToGenericConfig } from '../simplifiedConfigAdapter';
import { getExperimentationsStudents } from '@/services/Items';

/**
 * Configuration simplifiée pour les expérimentations étudiantes
 * Utilisée pour le dropdown d'ajout et les formulaires
 */
export const experimentationStudentConfigSimplified: SimplifiedDetailConfig = {
  resourceType: 'Expérimentation',
  templateId: 127,

  fields: {
    title: { property: 'dcterms:title', type: 'title', zone: 'header' },
    date: { property: 'dcterms:date', type: 'date', zone: 'details' },
    description: { property: 'dcterms:description', type: 'textarea', label: 'Description', placeholder: 'Décrivez votre expérimentation...', zone: 'details' },
    percentage: { property: 'schema:ratingValue', type: 'slider', label: 'Avancement', min: 0, max: 100, step: 5, zone: 'overview' },
    contributors: {
      property: 'schema:agent',
      type: 'resource',
      label: 'Contributeurs',
      resourceTemplateId: 96,
      multiSelect: true,
      zone: 'overview',
      sourceProperties: ['schema:agent', 'cito:credits'],
    },
    keywords: {
      property: 'jdc:hasConcept',
      type: 'resource',
      label: 'Mots-clés',
      resourceTemplateId: 34,
      multiSelect: true,
      zone: 'header',
    },
    externalLink: { property: 'schema:url', type: 'url', label: 'Lien externe', placeholder: 'https://...', zone: 'details' },
  },

  views: [
    {
      key: 'bibo:abstract',
      title: 'Hypothèse',
      property: 'bibo:abstract',
      renderType: 'text',
    },
    {
      key: 'theatre:credit',
      title: 'Outils',
      property: 'theatre:credit',
      renderType: 'items',
      urlPattern: '/corpus/tool/:id',
      resourceTemplateIds: [114, 129],
    },
    {
      key: 'schema:description',
      title: "Retours d'expérience",
      property: 'schema:description',
      renderType: 'items',
      urlPattern: '/feedback/:id',
      resourceTemplateId: 110,
    },
    {
      key: 'dcterms:references',
      title: 'Références scientifiques',
      property: 'dcterms:references',
      renderType: 'references',
      referenceType: 'scientific',
      resourceTemplateIds: [81, 99, 98, 83],
    },
    {
      key: 'dcterms:bibliographicCitation',
      title: 'Références culturelles',
      property: 'dcterms:bibliographicCitation',
      renderType: 'references',
      referenceType: 'cultural',
      resourceTemplateIds: [81, 99, 98, 83],
    },
  ],

  showKeywords: true,
  showRecommendations: true,
  showComments: true,
  recommendationsTitle: 'Expérimentations similaires',
  defaultView: 'bibo:abstract',
  formEnabled: true,

  smartRecommendations: {
    getAllResourcesOfType: async () => {
      const experimentationsStudents = await getExperimentationsStudents();
      return experimentationsStudents;
    },
    getRelatedItems: () => [],
    maxRecommendations: 5,
  },
};

// Export de la config convertie pour utilisation avec ConfigurableDetailPage/GenericDetailPage
export const experimentationStudentConfig = convertToGenericConfig(experimentationStudentConfigSimplified);
