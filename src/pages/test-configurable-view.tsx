import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Input, Button, Card, Spinner } from '@heroui/react';
import { SimplifiedDetailConfig } from '@/pages/generic/simplifiedConfig';
import { SimpleDetailPage } from '@/pages/generic/simplifiedConfigAdapter';

// ========================================
// Configuration ultra-simplifiée pour une Expérimentation
// ========================================

export const experimentationConfigSimplified: SimplifiedDetailConfig = {
  resourceType: 'Expérimentation',
  templateId: 127,

  // Mapping simple des propriétés principales
  fields: {
    title: 'dcterms:title',
    date: 'dcterms:date',
    description: 'dcterms:description',
    percentage: 'schema:ratingValue',
    contributors: ['schema:agent', 'cito:credits'],
    externalLink: 'schema:url',
  },

  // Les vues chargent automatiquement le titre et l'image comme test-omeka-edit
  views: [
    {
      key: 'hypothesis',
      title: 'Hypothèse',
      property: 'bibo:abstract',
      renderType: 'text',
    },
    {
      key: 'tools',
      title: 'Outils',
      property: 'theatre:credit', // Propriété correcte pour les outils
      renderType: 'items',
      urlPattern: '/tool/:id',
      resourceTemplateId: 114,
    },
    {
      key: 'analysis',
      title: "Retours d'expérience",
      property: 'schema:description',
      renderType: 'items',
      urlPattern: '/feedback/:id',
      resourceTemplateId: 110,
    },
    {
      key: 'scientific',
      title: 'Références scientifiques',
      property: 'dcterms:references',
      renderType: 'references',
      referenceType: 'scientific',
      resourceTemplateIds: [81, 99, 98, 83], // Bibliographies et médiagraphies
    },
    {
      key: 'cultural',
      title: 'Références culturelles',
      property: 'dcterms:bibliographicCitation',
      renderType: 'references',
      referenceType: 'cultural',
      resourceTemplateIds: [81, 99, 98, 83], // Bibliographies et médiagraphies
    },
  ],

  // Options d'affichage
  showKeywords: true,
  showRecommendations: true,
  showComments: true,
  recommendationsTitle: 'Expérimentations similaires',
  defaultView: 'hypothesis',
  formEnabled: true,
};

export const feedbackConfigSimplified: SimplifiedDetailConfig = {
  resourceType: "Retour d'expérience",
  templateId: 110,

  // Mapping simple des propriétés principales
  fields: {
    title: 'dcterms:title',
    description: 'dcterms:description',
    contributors: ['schema:contributor'],
  },

  // Les vues séparées pour chaque catégorie de feedback
  views: [
    {
      key: 'Experimentation',
      title: 'Expérimentation',
      renderType: 'categories',
      categories: [
        {
          key: 'Experimentation',
          title: 'Expérimentation',
          subcategories: [
            { key: 'achievements', label: 'Succès / Avancées notables', property: 'drama:achieves' },
            { key: 'issues', label: 'Problèmes rencontrés', property: 'bibo:issue' },
            { key: 'methodsUsed', label: 'Solutions apportées', property: 'cito:usesMethodIn' },
          ],
        },
      ],
    },
    {
      key: 'Reactions',
      title: 'Réactions',
      renderType: 'categories',
      categories: [
        {
          key: 'Reactions',
          title: 'Réactions',
          subcategories: [
            { key: 'reviews', label: 'Réactions du public ou des pairs', property: 'schema:review' },
            { key: 'instructionalMethod', label: "Suggestions pour d'autres expérimentateur·ices", property: 'dcterms:instructionalMethod' },
          ],
        },
      ],
    },
    {
      key: 'Perspectives',
      title: 'Perspectives',
      renderType: 'categories',
      categories: [
        {
          key: 'Perspectives',
          title: 'Perspectives',
          subcategories: [
            { key: 'potentialActions', label: 'Prolongements possibles', property: 'schema:potentialAction' },
            { key: 'coverage', label: "Autres contextes d'application", property: 'dcterms:coverage' },
            { key: 'workExamples', label: 'Modifications envisagées', property: 'schema:workExample' },
          ],
        },
      ],
    },
    {
      key: 'tools',
      title: 'Outils',
      property: 'schema:tool',
      renderType: 'items',
      urlPattern: '/tool/:id',
      resourceTemplateId: 114,
    },
  ],

  // Options d'affichage
  showKeywords: false,
  showRecommendations: true,
  showComments: true,
  recommendationsTitle: "Autres retours d'expérience",
  defaultView: 'Experimentation',
  formEnabled: true,
};

// ========================================
// Configuration simplifiée pour un Outil
// ========================================

export const toolConfigSimplified: SimplifiedDetailConfig = {
  resourceType: 'Outil',
  templateId: 114,

  // Mapping des propriétés principales (basé sur l'API réelle)
  fields: {
    title: 'dcterms:title',
    description: 'dcterms:description',
    date: 'DOAP:release',
    contributors: ['dcterms:contributor'],
    externalLink: 'DOAP:homepage',
  },

  // Vues organisées par catégorie
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
      key: 'langages',
      title: 'Langages de programmation',
      property: 'DOAP:programming-language',
      renderType: 'items',
      urlPattern: '/corpus/tool/:id', // Les langages sont aussi des outils/items
      resourceTemplateId: 114,
    },
    {
      key: 'specifications',
      title: 'Spécifications',
      renderType: 'categories',
      categories: [
        {
          key: 'technical',
          title: 'Spécifications techniques',
          subcategories: [{ key: 'fileRelease', label: 'Formats de fichiers supportés', property: 'DOAP:file-release' }],
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
};

export const templateConfigRegistry: Record<number, SimplifiedDetailConfig> = {
  127: experimentationConfigSimplified, // Expérimentation
  110: feedbackConfigSimplified, // Retour d'expérience
  114: toolConfigSimplified, // Outil
};

// ========================================
// API Helper : Fetch item et détecte le template
// ========================================

const API_BASE = '/omk/api/';

async function fetchItemAndDetectTemplate(itemId: string): Promise<SimplifiedDetailConfig> {
  const response = await fetch(`${API_BASE}items/${itemId}`);
  if (!response.ok) {
    throw new Error(`Item ${itemId} non trouvé (erreur ${response.status})`);
  }

  const data = await response.json();
  const templateId = data['o:resource_template']?.['o:id'];

  if (!templateId) {
    throw new Error(`L'item ${itemId} n'a pas de resource_template défini`);
  }

  const config = templateConfigRegistry[templateId];
  if (!config) {
    throw new Error(`Aucune configuration disponible pour le template ${templateId}. Templates disponibles: ${Object.keys(templateConfigRegistry).join(', ')}`);
  }

  return config;
}

// ========================================
// Hook : Charge la config selon le mode (avec affichage progressif)
// ========================================

function useConfigLoader(itemId: string | null, templateId: string | null) {
  const [config, setConfig] = useState<SimplifiedDetailConfig | null>(null);
  const [configLoading, setConfigLoading] = useState(true); // Seulement pour la détection de config
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!itemId) {
      setConfigLoading(false);
      return;
    }

    setConfigLoading(true);
    setError(null);
    setConfig(null);

    if (templateId) {
      // MODE OPTIMISÉ : Template ID fourni directement - INSTANTANÉ
      const numericTemplateId = parseInt(templateId, 10);
      const foundConfig = templateConfigRegistry[numericTemplateId];

      if (foundConfig) {
        // Config disponible immédiatement, la page s'affiche avec skeleton
        setConfig(foundConfig);
        setConfigLoading(false);
      } else {
        setError(`Aucune configuration pour le template ${templateId}. Templates disponibles: ${Object.keys(templateConfigRegistry).join(', ')}`);
        setConfigLoading(false);
      }
    } else {
      // MODE AUTOMATIQUE : Fetch UNIQUEMENT pour détecter le template
      // Dès qu'on a le template, on affiche la page (les données chargent après)
      fetchItemAndDetectTemplate(itemId)
        .then((detectedConfig) => {
          setConfig(detectedConfig);
          setConfigLoading(false);
          // GenericDetailPage va maintenant charger les données avec son propre loading state
        })
        .catch((err) => {
          setError(err.message);
          setConfigLoading(false);
        });
    }
  }, [itemId, templateId]);

  return { config, configLoading, error };
}

// ========================================
// Composant principal de la page de test
// ========================================

export default function TestConfigurableView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const itemIdParam = searchParams.get('id');
  const templateIdParam = searchParams.get('template');

  const [testItemId, setTestItemId] = useState('');
  const [testTemplateId, setTestTemplateId] = useState('');

  const { config, configLoading, error } = useConfigLoader(itemIdParam, templateIdParam);

  // Handlers pour Enter
  const handleAutoModeSubmit = () => {
    if (testItemId) {
      setSearchParams({ id: testItemId });
    }
  };

  const handleOptimizedModeSubmit = () => {
    if (testItemId && testTemplateId) {
      setSearchParams({ id: testItemId, template: testTemplateId });
    }
  };

  const handleKeyDownAuto = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAutoModeSubmit();
    }
  };

  const handleKeyDownOptimized = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleOptimizedModeSubmit();
    }
  };

  // Si on n'a pas de paramètres, afficher l'interface de test
  if (!itemIdParam) {
    return (
      <div className='min-h-screen bg-c1 p-8'>
        <div className='max-w-5xl mx-auto'>
          <h1 className='text-4xl font-bold text-c6 mb-2'>Test Vue Configurable Dynamique</h1>
          <p className='text-c5 mb-8'>Détection automatique de configuration basée sur le resource template</p>

          {/* Mode Automatique */}
          <Card className='bg-c2 p-6 mb-6'>
            <div className='flex items-start gap-4 mb-4'>
              <div className='bg-blue-500/20 border border-blue-500 rounded-lg p-3 flex-shrink-0'>
                <p className='text-blue-400 font-bold text-lg'>MODE 1</p>
              </div>
              <div>
                <h2 className='text-2xl font-semibold text-c6 mb-2'>Mode Automatique</h2>
                <p className='text-c5 text-sm'>Charge l'item → Détecte le template automatiquement → Affiche la bonne config</p>
                <p className='text-c4 text-xs mt-1'>⚠️ Plus lent (nécessite un fetch préalable)</p>
              </div>
            </div>

            <div className='flex gap-4 items-end'>
              <Input
                label="ID de l'item"
                placeholder='Ex: 21004'
                value={testItemId}
                onChange={(e) => setTestItemId(e.target.value)}
                onKeyDown={handleKeyDownAuto}
                classNames={{ inputWrapper: 'bg-c1 border-1 border-c3' }}
                className='flex-1'
              />
              <Button color='primary' onPress={handleAutoModeSubmit} className='bg-blue-500 text-white' isDisabled={!testItemId}>
                Charger (Auto)
              </Button>
            </div>

            <div className='mt-4 p-3 bg-c1 rounded-lg'>
              <p className='text-xs text-c5 font-mono'>
                URL: <span className='text-action'>?id={testItemId || '...'}</span>
              </p>
            </div>
          </Card>

          {/* Mode Optimisé */}
          <Card className='bg-c2 p-6 mb-6'>
            <div className='flex items-start gap-4 mb-4'>
              <div className='bg-green-500/20 border border-green-500 rounded-lg p-3 flex-shrink-0'>
                <p className='text-green-400 font-bold text-lg'>MODE 2</p>
              </div>
              <div>
                <h2 className='text-2xl font-semibold text-c6 mb-2'>Mode Optimisé</h2>
                <p className='text-c5 text-sm'>Charge directement avec le template ID fourni → Plus rapide</p>
                <p className='text-green-400 text-xs mt-1'>✓ Idéal quand on clique sur un card (template déjà connu)</p>
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4 mb-4'>
              <Input
                label="ID de l'item"
                placeholder='Ex: 21004'
                value={testItemId}
                onChange={(e) => setTestItemId(e.target.value)}
                onKeyDown={handleKeyDownOptimized}
                classNames={{ inputWrapper: 'bg-c1 border-1 border-c3' }}
              />
              <Input
                label='Template ID'
                placeholder='Ex: 127'
                value={testTemplateId}
                onChange={(e) => setTestTemplateId(e.target.value)}
                onKeyDown={handleKeyDownOptimized}
                classNames={{ inputWrapper: 'bg-c1 border-1 border-c3' }}
              />
            </div>

            <Button color='primary' onPress={handleOptimizedModeSubmit} className='bg-green-500 text-white w-full' isDisabled={!testItemId || !testTemplateId}>
              Charger (Optimisé)
            </Button>

            <div className='mt-4 p-3 bg-c1 rounded-lg'>
              <p className='text-xs text-c5 font-mono'>
                URL:{' '}
                <span className='text-action'>
                  ?id={testItemId || '...'}&template={testTemplateId || '...'}
                </span>
              </p>
            </div>
          </Card>

          {/* Exemples */}
          <Card className='bg-c2 p-6'>
            <h3 className='text-xl font-semibold text-c6 mb-4'>Exemples de liens directs</h3>

            <div className='space-y-2'>
              <Link to='?id=21004' className='block p-3 bg-c1 hover:bg-c3 rounded-lg transition-colors'>
                <p className='text-c6 font-medium'>Mode Auto : Item 21004</p>
                <p className='text-xs text-c5 font-mono'>?id=21004</p>
              </Link>

              <Link to='?id=21004&template=127' className='block p-3 bg-c1 hover:bg-c3 rounded-lg transition-colors'>
                <p className='text-c6 font-medium'>Mode Optimisé : Item 21004 (Template 127)</p>
                <p className='text-xs text-c5 font-mono'>?id=21004&template=127</p>
              </Link>
            </div>

            <div className='mt-6 p-4 bg-purple-500/10 border border-purple-500 rounded-lg'>
              <p className='text-purple-400 font-medium mb-2'>📋 Templates disponibles :</p>
              <ul className='text-sm text-purple-300 space-y-1'>
                {Object.entries(templateConfigRegistry).map(([templateId, config]) => (
                  <li key={templateId}>
                    <code className='text-action'>{templateId}</code> → {config.resourceType}
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Affichage de l'état de chargement de la CONFIG uniquement
  // (les données de l'item chargeront dans GenericDetailPage)
  if (configLoading) {
    return (
      <div className='min-h-screen bg-c1 flex items-center justify-center'>
        <div className='text-center'>
          <Spinner size='lg' className='mb-4' />
          <p className='text-c5 text-lg font-medium mb-2'>{templateIdParam ? 'Chargement de la configuration...' : 'Détection du template...'}</p>
          <p className='text-c4 text-sm'>{templateIdParam ? "La page va s'afficher instantanément" : "La page s'affichera dès que le template sera détecté"}</p>
        </div>
      </div>
    );
  }

  // Affichage des erreurs
  if (error) {
    return (
      <div className='min-h-screen bg-c1 p-8'>
        <div className='max-w-2xl mx-auto'>
          <Card className='bg-c2 p-6 border-2 border-red-500'>
            <h2 className='text-2xl font-bold text-red-500 mb-4'>Erreur</h2>
            <p className='text-c5 mb-4'>{error}</p>
            <Button color='primary' onPress={() => setSearchParams({})} className='bg-action text-white'>
              Retour aux tests
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // Affichage de la page avec la config chargée
  if (!config) {
    return (
      <div className='min-h-screen bg-c1 p-8'>
        <div className='max-w-2xl mx-auto'>
          <Card className='bg-c2 p-6'>
            <p className='text-c5'>Aucune configuration chargée</p>
            <Button color='primary' onPress={() => setSearchParams({})} className='bg-action text-white mt-4'>
              Retour aux tests
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // Afficher la page avec la config simplifiée
  // SimpleDetailPage se charge de la conversion interne
  return (
    <div className='min-h-screen'>
      <SimpleDetailPage config={config} itemId={itemIdParam} />
    </div>
  );
}
