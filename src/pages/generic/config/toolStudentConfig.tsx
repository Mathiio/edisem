import { SimplifiedDetailConfig } from '../simplifiedConfig';
import { convertToGenericConfig } from '../simplifiedConfigAdapter';
import { getTools } from '@/services/Items';

/**
 * Configuration simplifiée pour les outils (étudiants)
 * Utilise le système SimplifiedDetailConfig pour générer automatiquement
 * les formulaires en mode édition/création.
 */
export const toolStudentConfigSimplified: SimplifiedDetailConfig = {
  resourceType: 'Outil',
  templateId: 129,

  // Mapping des propriétés principales avec types explicites
  fields: {
    title: { property: 'dcterms:title', type: 'title', zone: 'header' },
    description: { property: 'dcterms:description', type: 'textarea', label: 'Description', placeholder: "Description de l'outil...", zone: 'details' },
    date: { property: 'DOAP:release', type: 'date', label: 'Date de sortie', zone: 'details' },
    contributors: { property: 'dcterms:contributor', type: 'resource', label: 'Contributeurs', resourceTemplateId: 96, multiSelect: true, zone: 'overview' },
    externalLink: { property: 'DOAP:homepage', type: 'url', label: 'Site web', placeholder: 'https://...', zone: 'details' },
  },

  // Vues avec génération automatique des formulaires
  views: [
    {
      key: 'caracteristiques',
      title: 'Caractéristiques',
      renderType: 'categories',
      categories: [
        {
          key: 'general',
          title: 'Informations générales',
          subcategories: [
            { key: 'category', label: "Type d'outil", property: 'DOAP:category' },
            { key: 'purpose', label: 'Fonction', property: 'oa:hasPurpose' },
            { key: 'operatingSystem', label: "Systèmes d'exploitation", property: 'DOAP:os' },
            { key: 'license', label: 'Licence', property: 'DOAP:license' },
          ],
        },
      ],
    },
    {
      key: 'specifications',
      title: 'Spécifications',
      renderType: 'categories',
      categories: [
        {
          key: 'technical',
          title: 'Spécifications techniques',
          subcategories: [
            { key: 'fileRelease', label: 'Formats de fichiers', property: 'DOAP:file-release' },
            { key: 'programmingLanguage', label: 'Langage de programmation', property: 'DOAP:programming-language' },
          ],
        },
      ],
    },
    {
      key: 'liens',
      title: 'Liens',
      renderType: 'categories',
      categories: [
        {
          key: 'external',
          title: 'Liens externes',
          subcategories: [
            { key: 'homepage', label: 'Site web officiel', property: 'DOAP:homepage' },
            { key: 'repository', label: 'Dépôt Git', property: 'DOAP:repository' },
            { key: 'bugDatabase', label: 'Base de bugs', property: 'DOAP:bug-database' },
          ],
        },
      ],
    },
    {
      key: 'projets',
      title: 'Projets associés',
      property: 'dcterms:isPartOf',
      renderType: 'items',
      urlPattern: '/corpus/experimentation/:id',
      resourceTemplateId: 127, // Expérimentation
    },
  ],

  // Options d'affichage
  showKeywords: false,
  showRecommendations: true,
  showComments: true,
  recommendationsTitle: 'Outils similaires',
  defaultView: 'caracteristiques',
  formEnabled: true,

  // Smart recommendations
  smartRecommendations: {
    getAllResourcesOfType: async () => {
      const tools = await getTools();
      return tools;
    },
    getRelatedItems: () => [],
    maxRecommendations: 5,
  },
};

// Export de la config convertie pour utilisation avec ConfigurableDetailPage/GenericDetailPage
export const toolStudentConfig = convertToGenericConfig(toolStudentConfigSimplified);
