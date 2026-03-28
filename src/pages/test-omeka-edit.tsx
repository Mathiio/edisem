import { useState, useCallback } from 'react';
import { Input, Button, Card, Spinner, Textarea, Chip, Autocomplete, AutocompleteItem } from '@heroui/react';
import { CrossIcon } from '@/components/ui/icons';

/**
 * Page de test pour l'édition de données Omeka S
 * Approche dynamique : génère automatiquement les champs basés sur les propriétés de l'item
 * Pas besoin de configuration manuelle !
 */

interface OmekaProperty {
  property_id: number;
  property_label: string;
  type: string;
  '@value'?: string;
  '@id'?: string;
  value_resource_id?: number;
  is_public: boolean;
}

interface OmekaItem {
  'o:id': number;
  'o:resource_class'?: any;
  'o:resource_template'?: any;
  [key: string]: any;
}

interface ResourceInfo {
  id: number;
  title: string;
  resourceClass?: string;
  thumbnailUrl?: string;
}

interface OmekaMedia {
  'o:id': number;
  'o:source'?: string;
  'o:filename'?: string;
  'o:media_type'?: string;
  'o:original_url'?: string;
  'o:thumbnail_urls'?: {
    large?: string;
    medium?: string;
    square?: string;
  };
}

import { ApiProxy } from '@/services/ApiProxy';

// Utilise le proxy Vite configuré dans vite.config.ts pour éviter les problèmes CORS
const API_BASE = '/omk/api/';

export default function TestOmekaEdit() {
  const [itemId, setItemId] = useState<string>('');
  const [itemData, setItemData] = useState<OmekaItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editedValues, setEditedValues] = useState<{ [key: string]: any }>({});

  // Pour les ressources liées
  const [resourceCache, setResourceCache] = useState<{ [id: number]: ResourceInfo }>({});
  const [searchLoading, setSearchLoading] = useState(false);
  const [editedResources, setEditedResources] = useState<{ [key: string]: number[] }>({});
  // Mapping propriété -> template_id (détecté depuis les ressources existantes)
  const [propertyTemplateMap, setPropertyTemplateMap] = useState<{ [key: string]: number }>({});

  // Pour les médias
  const [mediaList, setMediaList] = useState<OmekaMedia[]>([]);
  const [mediaToDelete, setMediaToDelete] = useState<number[]>([]);
  const [newMediaFiles, setNewMediaFiles] = useState<File[]>([]);

  // Charger un item depuis l'API
  const loadItem = async () => {
    if (!itemId) {
      setError('Veuillez entrer un ID d\'item');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    setEditedValues({});
    setEditedResources({});
    setMediaList([]);
    setMediaToDelete([]);
    setNewMediaFiles([]);

    try {
      const response = await fetch(`${API_BASE}items/${itemId}`);
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: Item non trouvé`);
      }
      const data = await response.json();
      setItemData(data);
      setLoading(false); // Afficher immédiatement l'item

      // Charger les infos des ressources liées en arrière-plan (progressif)
      loadLinkedResourcesInfo(data);

      // Charger les médias de l'item en arrière-plan (progressif)
      if (data['o:media'] && data['o:media'].length > 0) {
        loadMediaInfo(data['o:media']);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
      setItemData(null);
      setLoading(false);
    }
  };

  // Charger les informations des médias (progressif)
  const loadMediaInfo = (mediaRefs: any[]) => {
    mediaRefs.forEach(async (mediaRef: any) => {
      const mediaId = mediaRef['o:id'];
      if (mediaId) {
        try {
          const res = await fetch(`${API_BASE}media/${mediaId}`);
          if (res.ok) {
            const mediaData = await res.json();
            // Ajouter le média au fur et à mesure
            setMediaList((prev) => {
              // Éviter les doublons
              if (prev.some((m) => m['o:id'] === mediaData['o:id'])) return prev;
              return [...prev, mediaData];
            });
          }
        } catch (err) {
          console.error('Erreur chargement média:', err);
        }
      }
    });
  };

  // Charger les infos des ressources liées (titre, classe, template) - progressif
  const loadLinkedResourcesInfo = (data: OmekaItem) => {
    const resourcesByProperty: { [key: string]: number[] } = {};

    // Trouver tous les IDs de ressources liées par propriété
    Object.entries(data).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v: any) => {
          if (v.value_resource_id !== undefined) {
            if (!resourcesByProperty[key]) resourcesByProperty[key] = [];
            resourcesByProperty[key].push(v.value_resource_id);
          }
        });
      }
    });

    const allIds = [...new Set(Object.values(resourcesByProperty).flat())];

    // Charger les infos de chaque ressource progressivement
    allIds.forEach(async (id) => {
      // Vérifier si déjà en cache
      if (resourceCache[id]) return;

      try {
        const res = await fetch(`${API_BASE}items/${id}`);
        if (res.ok) {
          const item = await res.json();

          // Récupérer le thumbnail de l'item
          let thumbnailUrl: string | undefined;
          if (item['thumbnail_display_urls']?.square) {
            thumbnailUrl = item['thumbnail_display_urls'].square;
          } else if (item['o:thumbnail']?.['o:id']) {
            const mediaRes = await fetch(`${API_BASE}media/${item['o:thumbnail']['o:id']}`);
            if (mediaRes.ok) {
              const mediaData = await mediaRes.json();
              thumbnailUrl = mediaData['o:thumbnail_urls']?.square || mediaData['o:original_url'];
            }
          } else if (item['o:media']?.[0]?.['o:id']) {
            const mediaRes = await fetch(`${API_BASE}media/${item['o:media'][0]['o:id']}`);
            if (mediaRes.ok) {
              const mediaData = await mediaRes.json();
              thumbnailUrl = mediaData['o:thumbnail_urls']?.square || mediaData['o:original_url'];
            }
          }

          const resourceInfo = {
            id,
            title: item['o:title'] || `Item #${id}`,
            resourceClass: item['o:resource_class']?.['o:label'],
            templateId: item['o:resource_template']?.['o:id'],
            thumbnailUrl,
          };

          // Mettre à jour le cache progressivement
          setResourceCache((prev) => ({ ...prev, [id]: resourceInfo }));

          // Mettre à jour le template map si c'est le premier de sa propriété
          Object.entries(resourcesByProperty).forEach(([key, ids]) => {
            if (ids[0] === id && resourceInfo.templateId) {
              setPropertyTemplateMap((prev) => ({ ...prev, [key]: resourceInfo.templateId! }));
            }
          });
        }
      } catch {
        setResourceCache((prev) => ({ ...prev, [id]: { id, title: `Item #${id}` } }));
      }
    });
  };

  // État pour stocker les résultats par propriété et la propriété en cours de recherche
  const [searchResultsByProperty, setSearchResultsByProperty] = useState<{ [key: string]: ResourceInfo[] }>({});
  const [activeSearchProperty, setActiveSearchProperty] = useState<string | null>(null);

  // Charger toutes les ressources du bon type pour une propriété
  const loadResourcesForProperty = useCallback(async (propertyKey: string) => {
    const templateId = propertyTemplateMap[propertyKey];
    if (!templateId) {
      setError(`Template non détecté pour ${propertyKey}. Essayez de recharger l'item.`);
      return;
    }

    setSearchLoading(true);
    setActiveSearchProperty(propertyKey);

    try {
      // Charger toutes les ressources avec ce template (max 100)
      const url = `${API_BASE}items?resource_template_id=${templateId}&per_page=100`;
      const response = await fetch(url);

      if (response.ok) {
        const items = await response.json();
        const results: ResourceInfo[] = items.map((item: any) => ({
          id: item['o:id'],
          title: item['o:title'] || `Item #${item['o:id']}`,
          resourceClass: item['o:resource_class']?.['o:label'],
          thumbnailUrl: item['thumbnail_display_urls']?.square,
        }));

        setSearchResultsByProperty(prev => ({
          ...prev,
          [propertyKey]: results
        }));

        // Mettre en cache
        const newCache = { ...resourceCache };
        results.forEach((r) => {
          newCache[r.id] = r;
        });
        setResourceCache(newCache);
      }
    } catch (err) {
      console.error('Erreur chargement ressources:', err);
      setError('Erreur lors du chargement des ressources');
    } finally {
      setSearchLoading(false);
      setActiveSearchProperty(null);
    }
  }, [resourceCache, propertyTemplateMap]);

  // Obtenir les IDs de ressources actuels (édités ou originaux)
  const getCurrentResourceIds = (key: string, originalValue: any[]): number[] => {
    if (editedResources[key] !== undefined) {
      return editedResources[key];
    }
    // Omeka S peut avoir value_resource_id sans type explicite
    return originalValue
      .filter((v: any) => v.value_resource_id !== undefined)
      .map((v: any) => v.value_resource_id);
  };

  // Ajouter une ressource liée
  const addLinkedResource = (key: string, resourceId: number, originalValue: any[]) => {
    const currentIds = getCurrentResourceIds(key, originalValue);
    if (!currentIds.includes(resourceId)) {
      setEditedResources((prev) => ({
        ...prev,
        [key]: [...currentIds, resourceId],
      }));
    }
  };

  // Supprimer une ressource liée
  const removeLinkedResource = (key: string, resourceId: number, originalValue: any[]) => {
    const currentIds = getCurrentResourceIds(key, originalValue);
    setEditedResources((prev) => ({
      ...prev,
      [key]: currentIds.filter((id) => id !== resourceId),
    }));
  };

  // Sauvegarder les modifications
  const saveItem = async () => {
    if (!itemData || !itemId) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Créer une copie de l'item avec les modifications
      const updatedItem = { ...itemData };

      // Appliquer les modifications de texte
      Object.entries(editedValues).forEach(([key, value]) => {
        if (updatedItem[key] && Array.isArray(updatedItem[key])) {
          // Pour les propriétés qui sont des tableaux
          updatedItem[key][0]['@value'] = value;
        }
      });

      // Appliquer les modifications de ressources liées
      Object.entries(editedResources).forEach(([key, resourceIds]) => {
        if (updatedItem[key] && Array.isArray(updatedItem[key])) {
          // Récupérer le property_id depuis la première valeur existante
          const firstOriginal = updatedItem[key][0];
          const propertyId = firstOriginal?.property_id;

          // Reconstruire le tableau avec les nouveaux IDs
          updatedItem[key] = resourceIds.map((id) => ({
            type: 'resource',
            property_id: propertyId,
            value_resource_id: id,
            is_public: true,
          }));
        }
      });

      // Sauvegarder via Proxy
      const result = await ApiProxy.updateItem(itemId, updatedItem);

      if (result.error) {
        throw new Error(result.error || 'Erreur lors de la sauvegarde');
      }

      // Gérer les médias
      let mediaErrors: string[] = [];

      // Supprimer les médias marqués
      for (const mediaId of mediaToDelete) {
        const deleted = await deleteMedia(mediaId);
        if (!deleted) {
          mediaErrors.push(`Erreur suppression média #${mediaId}`);
        }
      }

      // Uploader les nouveaux médias
      for (const file of newMediaFiles) {
        const uploaded = await uploadMedia(file);
        if (!uploaded) {
          mediaErrors.push(`Erreur upload ${file.name}`);
        }
      }

      setItemData(result);
      setEditedValues({});
      setEditedResources({});
      setMediaToDelete([]);
      setNewMediaFiles([]);

      if (mediaErrors.length > 0) {
        setSuccess(`Item sauvegardé. Erreurs médias: ${mediaErrors.join(', ')}`);
      } else {
        setSuccess('Item sauvegardé avec succès !');
      }

      // Recharger les infos des ressources liées et médias (progressif)
      loadLinkedResourcesInfo(result);
      if (result['o:media'] && result['o:media'].length > 0) {
        loadMediaInfo(result['o:media']);
      } else {
        setMediaList([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  // Marquer un média pour suppression
  const markMediaForDeletion = (mediaId: number) => {
    setMediaToDelete((prev) => [...prev, mediaId]);
  };

  // Annuler la suppression d'un média
  const cancelMediaDeletion = (mediaId: number) => {
    setMediaToDelete((prev) => prev.filter((id) => id !== mediaId));
  };

  // Ajouter des fichiers à uploader
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewMediaFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  // Supprimer un fichier de la liste d'upload
  const removeNewFile = (index: number) => {
    setNewMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Uploader un nouveau média via Proxy
  const uploadMedia = async (file: File): Promise<boolean> => {
    try {
      const result = await ApiProxy.uploadMedia(file, itemId);
      return !result.error;
    } catch (err) {
      console.error('Erreur upload média:', err);
      return false;
    }
  };

  // Supprimer un média via Proxy
  const deleteMedia = async (mediaId: number): Promise<boolean> => {
    try {
      const result = await ApiProxy.deleteMedia(mediaId);
      return !result.error;
    } catch (err) {
      console.error('Erreur suppression média:', err);
      return false;
    }
  };

  // Vérifier s'il y a des modifications
  const hasChanges =
    Object.keys(editedValues).length > 0 ||
    Object.keys(editedResources).length > 0 ||
    mediaToDelete.length > 0 ||
    newMediaFiles.length > 0;

  const changesCount =
    Object.keys(editedValues).length +
    Object.keys(editedResources).length +
    mediaToDelete.length +
    newMediaFiles.length;

  // Déterminer le type de champ à afficher basé sur la propriété
  const getFieldType = (property: OmekaProperty[], key: string): 'text' | 'textarea' | 'url' | 'resource' | 'media' => {
    if (!property || property.length === 0) return 'text';

    const firstProp = property[0];

    // Détecter les propriétés de type média (associatedMedia, etc.)
    if (key === 'schema:associatedMedia' || key.toLowerCase().includes('media')) {
      if (firstProp.type === 'resource' || firstProp.value_resource_id !== undefined) {
        return 'media';
      }
    }

    // Détecter les ressources liées (Omeka S utilise value_resource_id ou type: 'resource')
    if (firstProp.type === 'resource' || firstProp.value_resource_id !== undefined) {
      return 'resource';
    }
    if (firstProp.type === 'uri') return 'url';
    if (firstProp['@value'] && firstProp['@value'].length > 100) return 'textarea';

    return 'text';
  };

  // Obtenir la valeur actuelle (éditée ou originale)
  const getCurrentValue = (key: string, originalValue: any): string => {
    if (editedValues[key] !== undefined) {
      return editedValues[key];
    }

    if (Array.isArray(originalValue) && originalValue.length > 0) {
      return originalValue[0]['@value'] || originalValue[0]['@id'] || '';
    }

    return '';
  };

  // Mettre à jour une valeur
  const handleValueChange = (key: string, value: string) => {
    setEditedValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Afficher les propriétés de l'item sous forme de formulaire
  const renderItemProperties = () => {
    if (!itemData) return null;

    const properties: JSX.Element[] = [];

    // Parcourir toutes les propriétés de l'item
    Object.entries(itemData).forEach(([key, value]) => {
      // Ignorer les propriétés système et les propriétés non éditables
      if (key.startsWith('@') || key.startsWith('o:') || !value || key === 'value') {
        return;
      }

      // Traiter uniquement les propriétés qui sont des tableaux (format Omeka S)
      if (Array.isArray(value) && value.length > 0) {
        const fieldType = getFieldType(value, key);
        const currentValue = getCurrentValue(key, value);
        const isModified = editedValues[key] !== undefined;
        // Récupérer le label depuis property_label ou utiliser la clé
        const propertyLabel = value[0]?.property_label || key;

        if (fieldType === 'media') {
          // Afficher les médias associés avec vignettes (comme la section Médias)
          const currentIds = getCurrentResourceIds(key, value);
          const isModified = editedResources[key] !== undefined;

          properties.push(
            <div key={key} className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-c6">{propertyLabel}</span>
                <code className="text-xs text-action bg-c3 px-2 py-px rounded">{key}</code>
                <Chip size="sm" color="secondary" variant="flat">Médias associés</Chip>
                {isModified && <Chip size="sm" color="warning" variant="flat">Modifié</Chip>}
              </div>

              {/* Grille des médias associés */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                {currentIds.map((resourceId: number) => {
                  const resource = resourceCache[resourceId];
                  const thumbnailUrl = resource?.thumbnailUrl;

                  return (
                    <div
                      key={resourceId}
                      className={`relative rounded-lg overflow-hidden border-2 ${isModified ? 'border-action' : 'border-c3'}`}
                    >
                      {thumbnailUrl ? (
                        <img
                          src={thumbnailUrl}
                          alt={resource?.title || 'Média'}
                          className="w-full h-32 object-cover"
                        />
                      ) : (
                        <div className="w-full h-32 bg-c3 flex items-center justify-center text-c5 text-xs">
                          {resource?.title || `#${resourceId}`}
                        </div>
                      )}

                      <div className="absolute top-2 right-2">
                        <Button
                          size="sm"
                          color="danger"
                          variant="solid"
                          isIconOnly
                          onPress={() => removeLinkedResource(key, resourceId, value)}
                        >
                          <CrossIcon size={14} />
                        </Button>
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-px">
                        <p className="text-xs text-white truncate">
                          {resource?.title || `Item #${resourceId}`}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {currentIds.length === 0 && (
                  <div className="col-span-full text-sm text-c5 italic p-3 bg-c1 rounded-lg border border-c3">
                    Aucun média associé
                  </div>
                )}
              </div>

              {/* Bouton pour charger les médias disponibles */}
              <div className="flex gap-2 items-end">
                <Button
                  size="sm"
                  color="primary"
                  variant="flat"
                  onPress={() => loadResourcesForProperty(key)}
                  isLoading={searchLoading && activeSearchProperty === key}
                  isDisabled={!propertyTemplateMap[key]}
                >
                  Rechercher des médias
                </Button>
                {!propertyTemplateMap[key] && currentIds.length === 0 && (
                  <span className="text-xs text-c5">Ajoutez d'abord un média manuellement</span>
                )}
              </div>

              {/* Liste des médias disponibles après recherche */}
              {searchResultsByProperty[key] && searchResultsByProperty[key].length > 0 && (
                <div className="mt-3 grid grid-cols-3 md:grid-cols-6 gap-2">
                  {searchResultsByProperty[key]
                    .filter((r) => !currentIds.includes(r.id))
                    .slice(0, 12)
                    .map((item) => (
                      <div
                        key={item.id}
                        className="relative rounded-lg overflow-hidden border border-c3 cursor-pointer hover:border-action transition-colors"
                        onClick={() => addLinkedResource(key, item.id, value)}
                      >
                        {item.thumbnailUrl ? (
                          <img
                            src={item.thumbnailUrl}
                            alt={item.title}
                            className="w-full h-5 object-cover"
                          />
                        ) : (
                          <div className="w-full h-5 bg-c3 flex items-center justify-center text-c5 text-xs p-px text-center">
                            {item.title}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          );
        } else if (fieldType === 'resource') {
          // Afficher les ressources liées avec possibilité d'édition
          const currentIds = getCurrentResourceIds(key, value);
          const isModified = editedResources[key] !== undefined;

          properties.push(
            <div key={key} className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-c6">{propertyLabel}</span>
                <code className="text-xs text-action bg-c3 px-2 py-px rounded">{key}</code>
                <Chip size="sm" color="primary" variant="flat">Ressources liées</Chip>
                {isModified && <Chip size="sm" color="warning" variant="flat">Modifié</Chip>}
              </div>

              {/* Liste des ressources actuelles */}
              <div className="space-y-2 mb-3">
                {currentIds.map((resourceId: number) => (
                  <div
                    key={resourceId}
                    className={`flex items-center justify-between p-3 rounded-lg border ${isModified ? 'border-action bg-action/5' : 'border-c3 bg-c1'}`}
                  >
                    <div className="flex items-center gap-3">
                      {resourceCache[resourceId]?.thumbnailUrl ? (
                        <img
                          src={resourceCache[resourceId].thumbnailUrl}
                          alt={resourceCache[resourceId]?.title || 'Thumbnail'}
                          className="w-10 h-10 rounded-md object-cover"
                        />
                      ) : (
                        ""
                      )}
                      <div>
                        <div className="text-sm text-c6">
                          {resourceCache[resourceId]?.title || `Item #${resourceId}`}
                        </div>
                        {resourceCache[resourceId]?.resourceClass && (
                          <div className="text-xs text-c5">
                            {resourceCache[resourceId].resourceClass}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="flat"
                      color="danger"
                      isIconOnly
                      onPress={() => removeLinkedResource(key, resourceId, value)}
                    >
                      <CrossIcon size={16} />
                    </Button>
                  </div>
                ))}
                {currentIds.length === 0 && (
                  <div className="text-sm text-c5 italic p-3 bg-c1 rounded-lg border border-c3">
                    Aucune ressource liée
                  </div>
                )}
              </div>

              {/* Bouton pour charger les ressources disponibles */}
              <div className="flex gap-2 items-end">
                <Button
                  size="sm"
                  color="primary"
                  variant="flat"
                  onPress={() => loadResourcesForProperty(key)}
                  isLoading={searchLoading && activeSearchProperty === key}
                  isDisabled={!propertyTemplateMap[key]}
                >
                  Rechercher
                </Button>
                {!propertyTemplateMap[key] && currentIds.length === 0 && (
                  <span className="text-xs text-c5">Ajoutez d'abord une ressource manuellement</span>
                )}
              </div>

              {/* Liste des ressources disponibles après recherche */}
              {searchResultsByProperty[key] && searchResultsByProperty[key].length > 0 && (
                <Autocomplete
                  label="Sélectionner une ressource à ajouter"
                  placeholder="Filtrer par nom..."
                  size="sm"
                  items={searchResultsByProperty[key].filter((r) => !currentIds.includes(r.id))}
                  onSelectionChange={(selectedKey) => {
                    if (selectedKey) {
                      addLinkedResource(key, Number(selectedKey), value);
                    }
                  }}
                  classNames={{
                    base: 'max-w-full mt-2',
                    listboxWrapper: 'max-h-[200px]',
                  }}
                >
                  {(item) => (
                    <AutocompleteItem key={item.id} textValue={item.title}>
                      <div className="flex items-center gap-2">
                        {item.thumbnailUrl ? (
                          <img
                            src={item.thumbnailUrl}
                            alt={item.title}
                            className="w-8 h-8 rounded object-cover"
                          />
                        ) : (
                          ""
                        )}
                        <div>
                          <div className="text-sm">{item.title}</div>
                          {item.resourceClass && (
                            <div className="text-xs text-c5">{item.resourceClass}</div>
                          )}
                        </div>
                      </div>
                    </AutocompleteItem>
                  )}
                </Autocomplete>
              )}
            </div>
          );
        } else if (fieldType === 'textarea') {
          properties.push(
            <div key={key} className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-c6">{propertyLabel}</span>
                <code className="text-xs text-action bg-c3 px-2 py-px rounded">{key}</code>
                {isModified && <Chip size="sm" color="warning" variant="flat">Modifié</Chip>}
              </div>
              <Textarea
                value={currentValue}
                onChange={(e) => handleValueChange(key, e.target.value)}
                classNames={{
                  inputWrapper: `bg-c1 border-1 ${isModified ? 'border-action' : 'border-c3'}`,
                }}
                minRows={3}
              />
            </div>
          );
        } else {
          properties.push(
            <div key={key} className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-c6">{propertyLabel}</span>
                <code className="text-xs text-action bg-c3 px-2 py-px rounded">{key}</code>
                {isModified && <Chip size="sm" color="warning" variant="flat">Modifié</Chip>}
              </div>
              <Input
                type={fieldType === 'url' ? 'url' : 'text'}
                value={currentValue}
                onChange={(e) => handleValueChange(key, e.target.value)}
                classNames={{
                  inputWrapper: `bg-c1 border-1 min-h-[50px] ${isModified ? 'border-action' : 'border-c3'}`,
                }}
              />
            </div>
          );
        }
      }
    });

    return properties;
  };

  return (
    <div className="min-h-screen bg-c1 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-c6 mb-8">🧪 Test Édition Omeka S</h1>

        <Card className="bg-c2 p-6 mb-6">
          <h2 className="text-2xl font-medium text-c6 mb-4">Charger un item</h2>
          <div className="flex gap-4">
            <Input
              label="ID de l'item"
              placeholder="Ex: 123"
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadItem()}
              classNames={{
                inputWrapper: 'bg-c1 border-1 min-h-[50px] border-c3',
              }}
              className="flex-1"
            />
            <Button
              color="primary"
              onPress={loadItem}
              isLoading={loading}
              className="bg-action text-white"
            >
              Charger
            </Button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-4 p-4 bg-green-500/10 border border-green-500 rounded-lg text-green-500">
              {success}
            </div>
          )}
        </Card>

        {loading && (
          <div className="flex justify-center items-center py-12">
            <Spinner size="lg" />
          </div>
        )}

        {itemData && !loading && (
          <Card className="bg-c2 p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-medium text-c6">
                  Édition de l'item #{itemData['o:id']}
                </h2>
                <div className="flex gap-2 mt-2">
                  {itemData['o:resource_class'] && (
                    <Chip size="sm" variant="flat">
                      {itemData['o:resource_class']['o:label']}
                    </Chip>
                  )}
                  {itemData['o:resource_template'] && (
                    <Chip size="sm" variant="flat" color="secondary">
                      {itemData['o:resource_template']['o:label']}
                    </Chip>
                  )}
                </div>
              </div>
              <div className="text-sm text-c5">
                {hasChanges && (
                  <Chip color="warning" variant="flat">
                    {changesCount} modification(s)
                  </Chip>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {renderItemProperties()}
            </div>

            {/* Section Médias */}
            <div className="mt-6 pt-6 border-t border-c3">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-medium text-c6">Médias</h3>
                <Chip size="sm" variant="flat">
                  {mediaList.length - mediaToDelete.length + newMediaFiles.length} fichier(s)
                </Chip>
              </div>

              {/* Médias existants */}
              {mediaList.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {mediaList.map((media) => {
                    const isMarkedForDeletion = mediaToDelete.includes(media['o:id']);
                    const thumbnailUrl =
                      media['o:thumbnail_urls']?.medium ||
                      media['o:thumbnail_urls']?.square ||
                      media['o:original_url'];

                    return (
                      <div
                        key={media['o:id']}
                        className={`relative rounded-lg overflow-hidden border-2 ${
                          isMarkedForDeletion ? 'border-danger opacity-50' : 'border-c3'
                        }`}
                      >
                        {thumbnailUrl ? (
                          <img
                            src={thumbnailUrl}
                            alt={media['o:source'] || 'Média'}
                            className="w-full h-32 object-cover"
                          />
                        ) : (
                          <div className="w-full h-32 bg-c3 flex items-center justify-center text-c5">
                            {media['o:media_type']?.split('/')[0] || 'Fichier'}
                          </div>
                        )}

                        <div className="absolute top-2 right-2">
                          {isMarkedForDeletion ? (
                            <Button
                              size="sm"
                              color="success"
                              variant="solid"
                              isIconOnly
                              onPress={() => cancelMediaDeletion(media['o:id'])}
                            >
                              ↩
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              color="danger"
                              variant="solid"
                              isIconOnly
                              onPress={() => markMediaForDeletion(media['o:id'])}
                            >
                              <CrossIcon size={14} />
                            </Button>
                          )}
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-px">
                          <p className="text-xs text-white truncate">
                            {media['o:source'] || media['o:filename'] || `#${media['o:id']}`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Nouveaux fichiers à uploader */}
              {newMediaFiles.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-c6 mb-2">Nouveaux fichiers à ajouter :</p>
                  <div className="flex flex-wrap gap-2">
                    {newMediaFiles.map((file, index) => (
                      <Chip
                        key={index}
                        color="success"
                        variant="flat"
                        onClose={() => removeNewFile(index)}
                      >
                        {file.name}
                      </Chip>
                    ))}
                  </div>
                </div>
              )}

              {/* Input pour ajouter des fichiers */}
              <div className="flex gap-2 items-center">
                <input
                  type="file"
                  id="media-upload"
                  multiple
                  accept="image/*,video/*,audio/*,.pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <label htmlFor="media-upload">
                  <Button
                    as="span"
                    size="sm"
                    color="primary"
                    variant="flat"
                    className="cursor-pointer"
                  >
                    + Ajouter des médias
                  </Button>
                </label>
              </div>
            </div>

            <div className="flex gap-4 mt-6 pt-6 border-t border-c3">
              <Button
                color="primary"
                onPress={saveItem}
                isLoading={saving}
                isDisabled={!hasChanges}
                className="bg-action text-white"
              >
                Sauvegarder
              </Button>
              <Button
                color="default"
                variant="bordered"
                onPress={() => {
                  setEditedValues({});
                  setEditedResources({});
                  setMediaToDelete([]);
                  setNewMediaFiles([]);
                }}
                isDisabled={!hasChanges}
              >
                Annuler les modifications
              </Button>
            </div>
          </Card>
        )}

        {/* Guide d'utilisation */}
        {!itemData && !loading && (
          <Card className="bg-c2 p-6 mt-6">
            <h3 className="text-xl font-medium text-c6 mb-4">📖 Guide d'utilisation</h3>
            <div className="space-y-3 text-c5">
              <p><strong className="text-c6">1.</strong> Entrez l'ID d'un item Omeka S (ex: 123)</p>
              <p><strong className="text-c6">2.</strong> Cliquez sur "Charger" pour récupérer les données</p>
              <p><strong className="text-c6">3.</strong> Les champs sont générés automatiquement basés sur les propriétés de l'item</p>
              <p><strong className="text-c6">4.</strong> Modifiez les valeurs (les champs modifiés sont surlignés)</p>
              <p><strong className="text-c6">5.</strong> Cliquez sur "Sauvegarder" pour envoyer les modifications</p>
            </div>

            <div className="mt-6 p-4 bg-green-500/10 border border-green-500 rounded-lg">
              <p className="text-green-500 font-medium">✨ Avantages de cette approche :</p>
              <ul className="list-disc list-inside mt-2 text-green-500 space-y-1">
                <li>Aucune configuration manuelle nécessaire</li>
                <li>Fonctionne avec n'importe quel type d'item</li>
                <li>Détection automatique du type de champ</li>
                <li>Indication visuelle des modifications</li>
              </ul>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
