import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, Variants } from 'framer-motion';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Spinner, addToast } from '@heroui/react';
import { LongCarrousel, FullCarrousel } from '@/components/ui/Carrousels';
import { KeywordsCard } from '@/components/features/conference/KeywordsCards';
import { Layouts } from '@/components/layout/Layouts';
import { SmConfCard } from '@/components/features/conference/ConfCards';
import { SearchModal, SearchModalRef } from '@/components/features/search/SearchModal';
import { ArrowIcon, CrossIcon, EditIcon } from '@/components/ui/icons';
import { EditSaveBar } from '@/components/ui/EditSaveBar';
import { PageBanner } from '@/components/ui/PageBanner';
import { getPersonDisplayName, getPersonPicture } from '@/components/features/experimentation/ExpOverview';
import CommentSection from '@/components/layout/CommentSection';
import { DynamicBreadcrumbs } from '@/components/layout/DynamicBreadcrumbs';
import { GenericDetailPageConfig, PageMode, FetchResult } from './config';
import { generateSmartRecommendations } from './helpers';
import { ResourcePicker } from '@/components/features/forms/ResourcePicker';
import { getTemplatePropertiesMap } from '@/services/Items';
import { useFormState } from '@/hooks/useFormState';
import { MediaFile } from '@/components/features/forms/MediaDropzone';

// API Config
const API_BASE = '/omk/api/';
const API_KEY = import.meta.env.VITE_API_KEY;
const API_IDENT = 'NUO2yCjiugeH7XbqwUcKskhE8kXg0rUj';

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: index * 0.15 },
  }),
};

interface GenericDetailPageProps {
  config: GenericDetailPageConfig;
  initialMode?: PageMode;
  itemId?: string; // ID optionnel, sinon utilise useParams
  onSave?: (data: any) => Promise<void>;
  onCancel?: () => void;
  onCreateNewResource?: (viewKey: string, resourceTemplateId?: number) => void;
}

/**
 * Composant générique pour afficher les pages de détails
 *
 * Ce composant unifie la logique commune de toutes les pages de type:
 * - conference, experimentation, miseEnRecit, oeuvre, etc.
 *
 * Il est configurable via le prop `config` qui définit:
 * - Les données à récupérer (dataFetcher)
 * - Les composants à afficher (overviewComponent, detailsComponent)
 * - Les options de vue (viewOptions)
 * - Les sections optionnelles (keywords, recommendations, comments)
 */

export const GenericDetailPage: React.FC<GenericDetailPageProps> = ({ config, initialMode = 'view', itemId: propItemId, onSave, onCancel, onCreateNewResource }) => {
  const { id: paramId } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const id = propItemId || paramId; // Priorité au prop, sinon useParams
  const navigate = useNavigate();

  // Check URL for mode parameter (e.g., ?mode=edit)
  const urlMode = searchParams.get('mode') as PageMode | null;

  // Mode state
  const [mode, setMode] = useState<PageMode>(urlMode === 'edit' ? 'edit' : initialMode);
  const isEditing = mode === 'edit' || mode === 'create';

  // Sync mode with URL parameter when it changes (e.g., navigating with ?mode=edit)
  useEffect(() => {
    if (urlMode === 'edit' && mode !== 'edit') {
      setMode('edit');
    }
  }, [urlMode]);

  // Sync URL parameter with mode state (keep ?mode=edit while editing)
  useEffect(() => {
    const currentUrlMode = searchParams.get('mode');

    if (mode === 'edit' && currentUrlMode !== 'edit') {
      // Add mode=edit to URL when entering edit mode
      searchParams.set('mode', 'edit');
      setSearchParams(searchParams, { replace: true });
    } else if (mode === 'view' && currentUrlMode === 'edit') {
      // Remove mode=edit from URL when exiting edit mode
      searchParams.delete('mode');
      setSearchParams(searchParams, { replace: true });
    }
  }, [mode, searchParams, setSearchParams]);

  // Form state using the hook
  const {
    state: formState,
    actions: formActions,
    setIsSubmitting,
  } = useFormState({
    initialData: {},
    fields: config.formFields || [],
  });

  // Destructure for easier access
  const { data: formData, isDirty, isSubmitting } = formState;
  const { setFieldValue: setValue, setMultipleValues: setFormData, resetForm: reset, validateForm: validate } = formActions;

  // Get changed fields (for save)
  const getChangedFields = useCallback(() => {
    return formData;
  }, [formData]);

  // Resource picker state
  const [pickerState, setPickerState] = useState<{
    isOpen: boolean;
    viewKey: string;
    resourceTemplateId?: number;
    resourceTemplateIds?: number[];
    multiSelect?: boolean;
  }>({
    isOpen: false,
    viewKey: '',
  });

  // Media files state for edit mode
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);

  // Track removed existing media indexes
  const [removedMediaIndexes, setRemovedMediaIndexes] = useState<number[]>([]);

  // Properties map for dynamic property ID lookup (fetched from Omeka S API)
  const [propertiesMap, setPropertiesMap] = useState<Record<string, number>>({});

  // Search state for inline resource search (like in test-omeka-edit.tsx)
  const [searchResultsByProperty, setSearchResultsByProperty] = useState<Record<string, any[]>>({});
  const [, setSearchLoading] = useState(false);
  const [, setActiveSearchProperty] = useState<string | null>(null);
  const [propertyTemplateMap] = useState<Record<string, number>>({});

  // States
  const [currentVideoTime, setCurrentVideoTime] = useState<number>(0);

  // Handle time change for video synchronization
  const handleTimeChange = (newTime: number) => {
    console.log('📺 GenericDetailPage - handleTimeChange appelé:', {
      newTime,
      previousTime: currentVideoTime,
      configType: config.type,
    });
    setCurrentVideoTime(newTime);
    console.log('✅ GenericDetailPage - currentVideoTime mis à jour:', newTime);
  };
  const [itemDetails, setItemDetails] = useState<any>(null);
  const [keywords, setKeywords] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [viewData, setViewData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);

  // États de loading progressif pour chaque zone
  const [loadingMedia, setLoadingMedia] = useState(true);
  const [loadingKeywords, setLoadingKeywords] = useState(true);
  const [loadingViews, setLoadingViews] = useState(true);
  const [selected, setSelected] = useState(config.defaultView || config.viewOptions[0]?.key || '');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [equalHeight, setEqualHeight] = useState<number | null>(null);
  const [isExitingRightColumn, setIsExitingRightColumn] = useState(false); // Pour l'animation de sortie

  // Refs
  const firstDivRef = useRef<HTMLDivElement>(null);
  const searchModalRef = useRef<SearchModalRef>(null);

  const handleOptionSelect = (optionKey: string) => {
    setSelected(optionKey);
    setIsDropdownOpen(false);
  };

  // Callback pour déclencher l'animation de sortie avant navigation
  const handleRightColumnNavigate = useCallback(() => {
    setIsExitingRightColumn(true);
  }, []);

  // Sync height
  useEffect(() => {
    if (firstDivRef.current) {
      setEqualHeight(firstDivRef.current.clientHeight);
    }
  }, [loading]);

  // Load properties map for create mode (fetches template-specific properties)
  useEffect(() => {
    if (mode === 'create' && config.resourceTemplateId) {
      getTemplatePropertiesMap(config.resourceTemplateId).then(setPropertiesMap);
    }
  }, [mode, config.resourceTemplateId]);

  // Fetch data avec support du chargement progressif
  const fetchData = useCallback(async () => {
    // En mode create, pas besoin de fetch - on initialise avec des données vides
    if (mode === 'create') {
      setLoading(false);
      setLoadingMedia(false);
      setLoadingKeywords(false);
      setLoadingViews(false);
      setLoadingRecommendations(false);
      setItemDetails({});
      return;
    }

    if (!id) return;

    setLoading(true);
    setLoadingMedia(true);
    setLoadingKeywords(true);
    setLoadingViews(true);

    try {
      // Si un progressiveDataFetcher est fourni, l'utiliser pour un chargement progressif
      if ((config as any).progressiveDataFetcher) {
        const result = await (config as any).progressiveDataFetcher(id, (partial: Partial<FetchResult>) => {
          // Callback appelé au fur et à mesure que les données arrivent
          if (partial.itemDetails) {
            setItemDetails(partial.itemDetails);
            // Dès qu'on a les données de base, on peut afficher
            setLoading(false);

            // Détecter si les médias sont chargés ou s'il n'y en a pas
            // Si associatedMedia existe (array vide ou rempli), les médias sont chargés
            if (partial.itemDetails.associatedMedia !== undefined) {
              setLoadingMedia(false);
            }
            // Sinon, si l'item n'a pas de o:media dans les données brutes, pas de médias
            else if (!partial.itemDetails['o:media'] || partial.itemDetails['o:media'].length === 0) {
              setLoadingMedia(false);
            }
          }
          if (partial.keywords) {
            setKeywords(partial.keywords);
            setLoadingKeywords(false);
          }
          if (partial.viewData && partial.viewData.resourceCache) {
            setViewData(partial.viewData);
            // Si le resourceCache est rempli, les vues sont chargées
            if (Object.keys(partial.viewData.resourceCache).length > 0) {
              setLoadingViews(false);
            }
          }
        });

        // Mise à jour finale avec toutes les données
        setItemDetails(result.itemDetails);
        // Ne pas écraser les keywords s'ils ont déjà été chargés via onProgress
        if (result.keywords && result.keywords.length > 0) {
          setKeywords(result.keywords);
        }
        setViewData(result.viewData || {});
        setLoading(false);
        setLoadingMedia(false);
        setLoadingKeywords(false);
        setLoadingViews(false);

        // Fetch recommendations après les données de base
        setLoadingRecommendations(true);
        try {
          let recs: any[] = [];
          if (result.recommendations && result.recommendations.length > 0 && config.fetchRecommendations) {
            recs = await config.fetchRecommendations(result.recommendations);
          } else if (config.smartRecommendations) {
            recs = await generateSmartRecommendations(result.itemDetails, config.smartRecommendations);
          }
          setRecommendations(recs || []);
        } catch (error) {
          console.error('Error fetching recommendations:', error);
          setRecommendations([]);
        } finally {
          setLoadingRecommendations(false);
        }
      } else {
        // Ancien système : tout charger d'un coup
        const result = await config.dataFetcher(id);

        setItemDetails(result.itemDetails);
        setKeywords(result.keywords || []);
        setViewData(result.viewData || {});
        setLoadingMedia(false);
        setLoadingKeywords(false);
        setLoadingViews(false);

        // Fetch recommendations
        setLoadingRecommendations(true);
        try {
          let recs: any[] = [];
          if (result.recommendations && result.recommendations.length > 0 && config.fetchRecommendations) {
            recs = await config.fetchRecommendations(result.recommendations);
          } else if (config.smartRecommendations) {
            recs = await generateSmartRecommendations(result.itemDetails, config.smartRecommendations);
          }
          setRecommendations(recs || []);
        } catch (error) {
          console.error('Error fetching recommendations:', error);
          setRecommendations([]);
        } finally {
          setLoadingRecommendations(false);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setItemDetails(null);
    } finally {
      setLoading(false);
    }
  }, [id, config, mode]);

  // Reset all states when ID changes (important for browser back/forward navigation)
  useEffect(() => {
    // Reset states to trigger fresh loading
    setItemDetails(null);
    setKeywords([]);
    setRecommendations([]);
    setViewData({});
    setLoading(true);
    setLoadingMedia(true);
    setLoadingKeywords(true);
    setLoadingViews(true);
    setLoadingRecommendations(true);
    setCurrentVideoTime(0);
    setIsExitingRightColumn(false); // Reset animation state

    // Reset selected view to default
    setSelected(config.defaultView || config.viewOptions[0]?.key || '');
  }, [id, config.defaultView, config.viewOptions]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleKeywordClick = (searchTerm: string) => {
    searchModalRef.current?.openWithSearch(searchTerm);
  };

  // Initialize form data when itemDetails changes or entering edit mode
  useEffect(() => {
    if (itemDetails && mode === 'edit') {
      // Extraire les valeurs depuis itemDetails en utilisant le dataPath de chaque formField
      const extractedData: Record<string, any> = { ...itemDetails };

      // Pour chaque formField, extraire la valeur depuis itemDetails
      config.formFields?.forEach((field) => {
        if (field.dataPath) {
          // Parse le dataPath (ex: "dcterms:title.0.@value")
          const pathParts = field.dataPath.split('.');
          let value: any = itemDetails;

          for (const part of pathParts) {
            if (value === undefined || value === null) break;
            value = value[part];
          }

          // Si on a trouvé une valeur, l'assigner à la clé du champ
          if (value !== undefined && value !== null) {
            extractedData[field.key] = value;
          }
        }

        // Pour les champs de type multiselection (ressources liées comme contributeurs, keywords, etc.),
        // chercher les données dans le resourceCache ou directement dans itemDetails
        if (field.type === 'multiselection' && field.selectionConfig) {
          const property = field.dataPath?.split('.')[0]; // Ex: "schema:agent", "jdc:hasConcept"
          if (property) {
            // Chercher les ressources liées dans itemDetails
            const linkedResources = itemDetails[property];
            if (Array.isArray(linkedResources) && linkedResources.length > 0) {
              // Hydrater les ressources depuis le resourceCache si disponible
              const resourceCache = itemDetails.resourceCache || {};
              const hydratedResources = linkedResources
                .map((ref: any) => {
                  const resourceId = ref.value_resource_id || ref['o:id'] || ref.id;
                  if (resourceId && resourceCache[resourceId]) {
                    return { id: resourceId, ...resourceCache[resourceId] };
                  }
                  return ref;
                })
                .filter(Boolean);

              // Assigner à la clé du champ de formulaire (field.key)
              extractedData[field.key] = hydratedResources;

              // Pour les champs de type contributeur/actant, assigner aussi aux clés legacy
              // (personnes, actants) utilisées par certains composants
              const contributorProperties = ['schema:agent', 'jdc:hasActant', 'dcterms:contributor', 'schema:contributor', 'cito:credits'];
              if (contributorProperties.includes(property)) {
                extractedData.personnes = hydratedResources;
                extractedData.actants = hydratedResources;
              }
            }
          }
        }
      });

      // Copier les keywords existants dans formData pour l'édition
      if (keywords && Array.isArray(keywords) && keywords.length > 0) {
        extractedData.keywords = keywords;
      }

      setFormData(extractedData);
      // Reset media files to empty - existing medias are now handled separately via existingMedias prop
      setMediaFiles([]);
      // Reset removed media indexes
      setRemovedMediaIndexes([]);
    } else if (mode === 'view') {
      // Reset media files when exiting edit mode
      setMediaFiles([]);
      setRemovedMediaIndexes([]);
    }
  }, [itemDetails, mode, setFormData, config.formFields, keywords]);

  // Handle removing an existing media by its index
  const handleRemoveExistingMedia = useCallback((index: number) => {
    setRemovedMediaIndexes((prev) => {
      if (!prev.includes(index)) {
        return [...prev, index];
      }
      return prev;
    });
  }, []);

  // ========================================
  // Edit Mode Handlers
  // ========================================

  // Toggle edit mode (kept for potential future use)
  const _handleToggleEdit = () => {
    if (mode === 'view') {
      setMode('edit');
    } else {
      handleCancelEdit();
    }
  };
  void _handleToggleEdit;

  // Cancel edit and reset to view mode
  const handleCancelEdit = () => {
    reset();
    if (mode === 'create') {
      // En mode create, retourner à la page précédente
      navigate(-1);
    } else {
      setMode('view');
      if (onCancel) {
        onCancel();
      }
    }
  };

  // Save changes
  const handleSave = async () => {
    if (!validate()) {
      addToast({
        title: 'Erreur de validation',
        description: 'Veuillez corriger les erreurs avant de sauvegarder.',
        classNames: { base: 'bg-danger', title: 'text-c6', description: 'text-c5', icon: 'text-c6' },
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const changedData = getChangedFields();
      // Add media files to the data
      changedData.mediaFiles = mediaFiles;

      // Add media IDs to delete based on removedMediaIndexes
      if (removedMediaIndexes.length > 0 && itemDetails?.['o:media']) {
        const mediaToDelete: number[] = [];
        removedMediaIndexes.forEach((index) => {
          const mediaRef = itemDetails['o:media'][index];
          if (mediaRef?.['o:id']) {
            mediaToDelete.push(mediaRef['o:id']);
          }
        });
        changedData.mediaToDelete = mediaToDelete;
        console.log('[handleSave] Media to delete:', mediaToDelete);
      }

      if (mode === 'create') {
        // Créer une nouvelle ressource
        await createInOmekaS(changedData);
        addToast({
          title: 'Ressource créée',
          description: 'La ressource a été créée avec succès.',
          classNames: { base: 'bg-success', title: 'text-c6', description: 'text-c6', icon: 'text-c6' },
        });
        // La redirection est gérée dans createInOmekaS
        return;
      } else if (onSave) {
        await onSave(changedData);
      } else {
        // Sauvegarde par défaut vers Omeka S
        await saveToOmekaS(changedData);
      }

      addToast({
        title: 'Sauvegardé',
        description: 'Les modifications ont été enregistrées.',
        classNames: { base: 'bg-success', title: 'text-c6', description: 'text-c6', icon: 'text-c6' },
      });

      setMode('view');
      // Refresh data
      fetchData();
    } catch (error) {
      console.error('Error saving:', error);
      addToast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la sauvegarde.',
        classNames: { base: 'bg-danger', title: 'text-c6', description: 'text-c6', icon: 'text-c6' },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sauvegarde vers Omeka S API
  const saveToOmekaS = async (data: any) => {
    if (!id) throw new Error('No item ID');

    console.log('[saveToOmekaS] Starting save with data:', data);
    console.log('[saveToOmekaS] data.keywords:', data.keywords);

    // 1. Récupérer les données brutes de l'item
    const rawResponse = await fetch(`${API_BASE}items/${id}`);
    if (!rawResponse.ok) throw new Error('Failed to fetch item');
    const rawItem = await rawResponse.json();
    console.log('[saveToOmekaS] Raw item fetched, id:', rawItem['o:id']);

    // 1b. Charger les propriétés du template (comme en mode création) pour avoir toutes les propriétés disponibles
    const templateId = rawItem['o:resource_template']?.['o:id'] || config.resourceTemplateId;
    const templatePropMap = templateId ? await getTemplatePropertiesMap(templateId) : {};

    // 2. Créer une copie avec les modifications
    const updatedItem = { ...rawItem };

    // 3. Appliquer les modifications de ressources liées (keywords, etc.)
    Object.entries(data).forEach(([key, value]) => {
      // Si c'est un tableau de ressources liées (objets avec id)
      if (Array.isArray(value) && value.length > 0 && (value as any[])[0]?.id !== undefined) {
        // Chercher la propriété Omeka correspondante
        let omekaPropertyKey = findOmekaPropertyKey(updatedItem, key);
        let propertyId: number | null = null;

        // Si la propriété existe dans l'item, récupérer le propertyId
        if (omekaPropertyKey && updatedItem[omekaPropertyKey] && Array.isArray(updatedItem[omekaPropertyKey])) {
          const firstOriginal = updatedItem[omekaPropertyKey][0];
          propertyId = firstOriginal?.property_id;
        }
        // Sinon, chercher dans le template (pour les nouvelles propriétés comme keywords)
        else {
          // Mapping des clés vers les propriétés Omeka
          const keyToOmekaProp: Record<string, string> = {
            keywords: 'jdc:hasConcept',
            personnes: 'schema:agent',
            actants: 'jdc:hasActant',
          };
          const fallbackProp = keyToOmekaProp[key];
          if (fallbackProp && templatePropMap[fallbackProp]) {
            omekaPropertyKey = fallbackProp;
            propertyId = templatePropMap[fallbackProp];
          }
        }

        if (omekaPropertyKey && propertyId) {
          // Remplacer complètement les ressources liées (permet ajouts ET suppressions)
          updatedItem[omekaPropertyKey] = (value as any[]).map((item: any) => ({
            type: 'resource',
            property_id: propertyId,
            value_resource_id: item.id,
            is_public: true,
          }));
        }
      }
      // Si c'est une valeur texte simple
      else if (typeof value === 'string') {
        const omekaPropertyKey = findOmekaPropertyKey(updatedItem, key);
        if (omekaPropertyKey && updatedItem[omekaPropertyKey] && Array.isArray(updatedItem[omekaPropertyKey])) {
          if (updatedItem[omekaPropertyKey].length > 0) {
            updatedItem[omekaPropertyKey][0]['@value'] = value;
          }
        }
      }
      // Si c'est une valeur numérique
      else if (typeof value === 'number') {
        const omekaPropertyKey = findOmekaPropertyKey(updatedItem, key);
        if (omekaPropertyKey) {
          if (updatedItem[omekaPropertyKey] && Array.isArray(updatedItem[omekaPropertyKey]) && updatedItem[omekaPropertyKey].length > 0) {
            // La propriété existe, mettre à jour
            updatedItem[omekaPropertyKey][0]['@value'] = String(value);
          } else {
            // La propriété n'existe pas, la créer
            const propertyId = getPropertyId(omekaPropertyKey);
            if (propertyId) {
              updatedItem[omekaPropertyKey] = [
                {
                  type: 'literal',
                  property_id: propertyId,
                  '@value': String(value),
                  is_public: true,
                },
              ];
            }
          }
        }
      }
    });

    // 4. Envoyer la mise à jour
    console.log('[saveToOmekaS] Sending PUT request...');
    const saveUrl = `${API_BASE}items/${id}?key_identity=${API_IDENT}&key_credential=${API_KEY}`;
    const saveResponse = await fetch(saveUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedItem),
    });

    if (!saveResponse.ok) {
      const errorData = await saveResponse.json();
      console.error('[saveToOmekaS] Save failed:', errorData);
      throw new Error(errorData.errors?.[0]?.message || 'Erreur lors de la sauvegarde');
    }

    const result = await saveResponse.json();
    console.log('[saveToOmekaS] Save successful, response:', result['o:id']);
    return result;
  };

  // Trouver la clé de propriété Omeka correspondante
  const findOmekaPropertyKey = (rawItem: any, simpleKey: string): string | null => {
    // Mapping des clés simples vers les propriétés Omeka
    const keyMappings: Record<string, string[]> = {
      keywords: ['jdc:hasConcept', 'jdc:hasKeyword', 'dcterms:subject'],
      title: ['dcterms:title'],
      description: ['dcterms:description'],
      date: ['dcterms:date'],
      personnes: ['jdc:hasActant', 'dcterms:contributor'],
      actants: ['jdc:hasActant'],
      percentage: ['schema:ratingValue'],
    };

    const possibleKeys = keyMappings[simpleKey] || [simpleKey];

    console.log(`[saveToOmekaS] Looking for property '${simpleKey}', trying:`, possibleKeys);
    console.log(
      `[saveToOmekaS] rawItem keys:`,
      Object.keys(rawItem).filter((k) => k.includes(':')),
    );

    for (const omekaKey of possibleKeys) {
      if (rawItem[omekaKey] !== undefined) {
        console.log(`[saveToOmekaS] Found property: ${omekaKey}`);
        return omekaKey;
      }
    }

    console.log(`[saveToOmekaS] Property not found for '${simpleKey}'`);
    // Si la propriété n'existe pas encore, retourner la première clé possible pour la créer
    return possibleKeys[0] || null;
  };

  // Obtenir le property_id Omeka pour une propriété (utilise le cache dynamique)
  const getPropertyId = (omekaPropertyKey: string, propMap?: Record<string, number>): number | null => {
    const map = propMap || propertiesMap;
    const id = map[omekaPropertyKey];
    if (id) return id;

    // Fallback: essayer sans le préfixe (ex: "title" au lieu de "dcterms:title")
    const localName = omekaPropertyKey.split(':')[1];
    if (localName && map[localName]) {
      return map[localName];
    }

    console.warn(`[getPropertyId] Property not found: ${omekaPropertyKey}`);
    return null;
  };

  // Créer une nouvelle ressource dans Omeka S (mode create)
  const createInOmekaS = async (data: any) => {
    if (!config.resourceTemplateId) {
      throw new Error('resourceTemplateId non défini dans la config');
    }

    console.log('[createInOmekaS] Starting creation with data:', data);

    // Récupérer l'utilisateur connecté pour l'ajouter comme créateur
    // userId = ID de l'item actant/étudiant (pour dcterms:creator)
    // omekaUserId = ID de l'utilisateur Omeka S (table user, pour o:owner)
    const userId = localStorage.getItem('userId');
    const omekaUserId = localStorage.getItem('omekaUserId');
    console.log('[createInOmekaS] Current user (actant/student item) ID:', userId);
    console.log('[createInOmekaS] Omeka S user ID (for o:owner):', omekaUserId);

    // S'assurer que les properties sont chargées (utilise le cache si déjà fetché)
    const propMap = Object.keys(propertiesMap).length > 0 ? propertiesMap : await getTemplatePropertiesMap(config.resourceTemplateId!);

    console.log('[createInOmekaS] Properties map loaded with', Object.keys(propMap).length, 'properties');

    // Construire l'objet de données pour Omeka S
    const itemData: Record<string, any> = {
      'o:resource_template': { 'o:id': config.resourceTemplateId },
    };

    // Définir o:owner avec l'ID utilisateur Omeka S (table user) si disponible
    // Cela permet d'attribuer la ressource au bon utilisateur au lieu de l'API
    if (omekaUserId) {
      itemData['o:owner'] = { 'o:id': parseInt(omekaUserId, 10) };
      console.log('[createInOmekaS] Set o:owner to Omeka S user:', omekaUserId);
    }

    // Lier la ressource au cours via dcterms:isPartOf (property_id: 33)
    // Le courseId est passé via query param depuis Mon Espace
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('courseId');
    if (courseId) {
      const coursePropertyId = propMap['dcterms:isPartOf'] || 33; // Fallback à 33 si pas dans le template
      itemData['dcterms:isPartOf'] = [
        {
          type: 'resource',
          property_id: coursePropertyId,
          value_resource_id: parseInt(courseId, 10),
          is_public: true,
        },
      ];
      console.log('[createInOmekaS] Linked to course:', courseId);
    }

    // Ajouter l'utilisateur connecté comme créateur/contributeur
    if (userId) {
      // Chercher la bonne propriété pour le créateur selon le template
      let creatorProp = 'dcterms:creator';
      if (propMap['schema:agent']) {
        creatorProp = 'schema:agent';
      } else if (propMap['schema:contributor']) {
        creatorProp = 'schema:contributor';
      } else if (propMap['dcterms:contributor']) {
        creatorProp = 'dcterms:contributor';
      } else if (propMap['jdc:hasActant']) {
        creatorProp = 'jdc:hasActant';
      } else if (propMap['dcterms:creator']) {
        creatorProp = 'dcterms:creator';
      }

      const creatorPropertyId = propMap[creatorProp];
      if (creatorPropertyId) {
        itemData[creatorProp] = [
          {
            type: 'resource',
            property_id: creatorPropertyId,
            value_resource_id: parseInt(userId, 10),
            is_public: true,
          },
        ];
        console.log('[createInOmekaS] Added creator:', creatorProp, '=', userId);
      }
    }

    // Mapper les champs du formulaire vers le format Omeka S
    config.formFields?.forEach((field) => {
      const value = data[field.key];
      if (value !== undefined && value !== '' && value !== null) {
        const propertyName = field.dataPath.split('.')[0];
        const propertyId = getPropertyId(propertyName, propMap);

        if (field.type === 'url') {
          // Les URLs sont des ressources URI
          itemData[propertyName] = [
            {
              type: 'uri',
              property_id: propertyId,
              '@id': value,
              is_public: true,
            },
          ];
        } else {
          // Les autres sont des littéraux
          itemData[propertyName] = [
            {
              type: 'literal',
              property_id: propertyId,
              '@value': String(value),
              is_public: true,
            },
          ];
        }
      }
    });

    // Mapper les données stockées avec le format dataPath (ex: dcterms:abstract.0.@value)
    Object.entries(data).forEach(([key, value]) => {
      if (key.includes(':') && key.includes('.') && typeof value === 'string' && value !== '') {
        const propertyName = key.split('.')[0];
        if (!itemData[propertyName]) {
          const propertyId = getPropertyId(propertyName, propMap);
          itemData[propertyName] = [
            {
              type: 'literal',
              property_id: propertyId,
              '@value': value,
              is_public: true,
            },
          ];
        }
      }
    });

    // Mapper fullUrl vers schema:url si présent et pas déjà mappé
    if (data.fullUrl && !itemData['schema:url']) {
      const propertyId = getPropertyId('schema:url', propMap);
      itemData['schema:url'] = [
        {
          type: 'uri',
          property_id: propertyId,
          '@id': data.fullUrl,
          is_public: true,
        },
      ];
    }

    // Mapper les ressources liées (personnes/actants)
    // Chercher la bonne propriété selon le template (schema:contributor, dcterms:contributor, schema:agent, ou jdc:hasActant)
    if (data.personnes && Array.isArray(data.personnes) && data.personnes.length > 0) {
      // Ordre de priorité : schema:contributor, dcterms:contributor, schema:agent, jdc:hasActant
      let agentProp = 'jdc:hasActant';
      if (propMap['schema:contributor']) {
        agentProp = 'schema:contributor';
      } else if (propMap['dcterms:contributor']) {
        agentProp = 'dcterms:contributor';
      } else if (propMap['schema:agent']) {
        agentProp = 'schema:agent';
      }
      const propertyId = getPropertyId(agentProp, propMap);
      if (propertyId) {
        // Récupérer les contributeurs existants (incluant le créateur ajouté automatiquement)
        const existingContributors = itemData[agentProp] || [];
        const existingIds = existingContributors.map((c: any) => c.value_resource_id);

        // Ajouter les nouveaux contributeurs sans doublons
        const newContributors = data.personnes
          .filter((person: any) => !existingIds.includes(person.id || person['o:id']))
          .map((person: any) => ({
            type: 'resource',
            property_id: propertyId,
            value_resource_id: person.id || person['o:id'],
            is_public: true,
          }));

        itemData[agentProp] = [...existingContributors, ...newContributors];
      }
    }

    // Mapper les mots-clés (jdc:hasConcept ou autre) - même logique que les personnes
    if (data.keywords && Array.isArray(data.keywords) && data.keywords.length > 0) {
      // Ordre de priorité : jdc:hasConcept, dcterms:subject
      let conceptProp = 'jdc:hasConcept';
      if (!propMap['jdc:hasConcept'] && propMap['dcterms:subject']) {
        conceptProp = 'dcterms:subject';
      }
      const propertyId = getPropertyId(conceptProp, propMap);
      if (propertyId) {
        // Récupérer les keywords existants
        const existingKeywords = itemData[conceptProp] || [];
        const existingIds = existingKeywords.map((k: any) => k.value_resource_id);

        // Ajouter les nouveaux keywords sans doublons
        const newKeywords = data.keywords
          .filter((keyword: any) => !existingIds.includes(keyword.id || keyword['o:id']))
          .map((keyword: any) => ({
            type: 'resource',
            property_id: propertyId,
            value_resource_id: keyword.id || keyword['o:id'],
            is_public: true,
          }));

        itemData[conceptProp] = [...existingKeywords, ...newKeywords];
      }
    }

    // Mapper les feedbacks (schema:description = 1606)
    if (data.Feedback && Array.isArray(data.Feedback) && data.Feedback.length > 0) {
      const propertyId = getPropertyId('schema:description', propMap);
      if (propertyId) {
        itemData['schema:description'] = data.Feedback.map((fb: any) => ({
          type: 'resource',
          property_id: propertyId,
          value_resource_id: fb.id || fb['o:id'],
          is_public: true,
        }));
      }
    }

    // Mapper les outils (theatre:credit = 2145)
    if (data.Outils && Array.isArray(data.Outils) && data.Outils.length > 0) {
      const propertyId = getPropertyId('theatre:credit', propMap);
      if (propertyId) {
        itemData['theatre:credit'] = data.Outils.map((tool: any) => ({
          type: 'resource',
          property_id: propertyId,
          value_resource_id: tool.id || tool['o:id'],
          is_public: true,
        }));
      }
    }

    // Mapper les contenus scientifiques (dcterms:references = 36)
    if (data.ContentScient && Array.isArray(data.ContentScient) && data.ContentScient.length > 0) {
      const propertyId = getPropertyId('dcterms:references', propMap);
      if (propertyId) {
        itemData['dcterms:references'] = data.ContentScient.map((content: any) => ({
          type: 'resource',
          property_id: propertyId,
          value_resource_id: content.id || content['o:id'],
          is_public: true,
        }));
      }
    }

    // Mapper les contenus culturels (dcterms:bibliographicCitation = 48)
    if (data.ContentCultu && Array.isArray(data.ContentCultu) && data.ContentCultu.length > 0) {
      const propertyId = getPropertyId('dcterms:bibliographicCitation', propMap);
      if (propertyId) {
        itemData['dcterms:bibliographicCitation'] = data.ContentCultu.map((content: any) => ({
          type: 'resource',
          property_id: propertyId,
          value_resource_id: content.id || content['o:id'],
          is_public: true,
        }));
      }
    }

    // Mapper l'hypothèse/abstract (bibo:abstract = 86)
    if (data.Hypothese && typeof data.Hypothese === 'string' && data.Hypothese.trim() !== '') {
      const propertyId = getPropertyId('bibo:abstract', propMap);
      if (propertyId) {
        itemData['bibo:abstract'] = [
          {
            type: 'literal',
            property_id: propertyId,
            '@value': data.Hypothese,
            is_public: true,
          },
        ];
      }
    }

    // Mapper TOUTES les autres propriétés dynamiquement (categories, projets, etc.)
    // Cela capture les propriétés qui ne sont pas dans formFields mais sont dans les vues
    Object.entries(data).forEach(([key, value]) => {
      // Ignorer les clés déjà traitées ou système
      const ignoredKeys = new Set([
        'mediaFiles',
        'mediaToDelete',
        'newMediaFiles',
        'resourceCache',
        'title',
        'description',
        'date',
        'fullUrl',
        'personnes',
        'actants',
        'keywords',
        'Feedback',
        'Outils',
        'ContentScient',
        'ContentCultu',
        'Hypothese',
      ]);

      if (ignoredKeys.has(key) || value === undefined || value === null) {
        return;
      }

      // Si la clé contient ":" c'est probablement une propriété Omeka S directe
      if (key.includes(':') && !itemData[key]) {
        const propertyId = propMap[key];
        if (!propertyId) {
          console.warn(`[createInOmekaS] Property ID non trouvé pour: ${key}`);
          return;
        }

        if (typeof value === 'string' || typeof value === 'number') {
          // Valeur simple
          itemData[key] = [
            {
              type: 'literal',
              property_id: propertyId,
              '@value': String(value),
              is_public: true,
            },
          ];
        } else if (Array.isArray(value) && value.length > 0) {
          if (typeof value[0] === 'string') {
            // Tableau de strings (categories)
            const nonEmptyValues = value.filter((v: string) => v && v.trim() !== '');
            if (nonEmptyValues.length > 0) {
              itemData[key] = nonEmptyValues.map((v: string) => ({
                type: 'literal',
                property_id: propertyId,
                '@value': v,
                is_public: true,
              }));
            }
          } else if (value[0].id || value[0]['o:id']) {
            // Tableau de ressources liées
            itemData[key] = value.map((item: any) => ({
              type: 'resource',
              property_id: propertyId,
              value_resource_id: item.id || item['o:id'],
              is_public: true,
            }));
          }
        }
      }

      // Gérer les clés spéciales qui mappent vers des propriétés Omeka S
      const specialKeyMappings: Record<string, string> = {
        projets: 'dcterms:isPartOf',
        outils: 'schema:tool',
      };

      const mappedProperty = specialKeyMappings[key];
      if (mappedProperty && Array.isArray(value) && value.length > 0 && !itemData[mappedProperty]) {
        const propertyId = propMap[mappedProperty];
        if (propertyId) {
          itemData[mappedProperty] = value.map((item: any) => ({
            type: 'resource',
            property_id: propertyId,
            value_resource_id: item.id || item['o:id'],
            is_public: true,
          }));
        }
      }
    });

    // Nettoyer les propriétés avec property_id null (pas dans le template)
    Object.keys(itemData).forEach((key) => {
      if (key.startsWith('o:')) return; // Garder les métadonnées Omeka
      const values = itemData[key];
      if (Array.isArray(values)) {
        // Filtrer les valeurs sans property_id valide
        const validValues = values.filter((v: any) => v.property_id != null);
        if (validValues.length === 0) {
          delete itemData[key];
        } else {
          itemData[key] = validValues;
        }
      }
    });

    console.log('[createInOmekaS] Item data to send:', itemData);

    const createUrl = `${API_BASE}items?key_identity=${API_IDENT}&key_credential=${API_KEY}`;
    const response = await fetch(createUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[createInOmekaS] Creation failed:', errorData);
      throw new Error(errorData.errors?.[0]?.message || 'Échec de la création');
    }

    const result = await response.json();
    const newItemId = result['o:id'];
    console.log('[createInOmekaS] Creation successful, id:', newItemId);

    // Upload des médias après création de l'item
    const mediaFilesToUpload = data.mediaFiles || [];
    if (Array.isArray(mediaFilesToUpload) && mediaFilesToUpload.length > 0) {
      console.log('[createInOmekaS] Uploading', mediaFilesToUpload.length, 'media files');
      for (const mediaFile of mediaFilesToUpload) {
        const file = mediaFile.file || mediaFile;
        if (file instanceof File) {
          try {
            const formData = new FormData();
            // Format correct pour Omeka S : data avec file_index AVANT file[0]
            formData.append(
              'data',
              JSON.stringify({
                'o:ingester': 'upload',
                'o:item': { 'o:id': newItemId },
                file_index: '0',
              }),
            );
            formData.append('file[0]', file);

            const mediaUrl = `${API_BASE}media?key_identity=${API_IDENT}&key_credential=${API_KEY}`;
            const mediaResponse = await fetch(mediaUrl, {
              method: 'POST',
              body: formData,
            });

            if (!mediaResponse.ok) {
              console.error('[createInOmekaS] Media upload failed:', await mediaResponse.text());
            } else {
              console.log('[createInOmekaS] Media uploaded successfully');
            }
          } catch (err) {
            console.error('[createInOmekaS] Media upload error:', err);
          }
        }
      }
    }

    // Déterminer le chemin de redirection basé sur le type de config
    let redirectPath = `/espace-etudiant/`;
    // if (config.type?.includes('Expérimentation')) {
    //   redirectPath = `/espace-etudiant/experimentation/${newItemId}`;
    // } else if (config.type?.includes('Outil')) {
    //   redirectPath = `/corpus/tool/${newItemId}`;
    // } else if (config.type?.includes('Retour') || config.type?.includes('Feedback')) {
    //   redirectPath = `/feedback/${newItemId}`;
    // }

    navigate(redirectPath);
    return result;
  };

  // Handle opening resource picker for a view
  const handleLinkExisting = (viewKey: string) => {
    console.log('[handleLinkExisting] viewKey:', viewKey);
    console.log(
      '[handleLinkExisting] config.viewOptions:',
      config.viewOptions.map((v) => ({ key: v.key, resourceTemplateId: v.resourceTemplateId, resourceTemplateIds: v.resourceTemplateIds })),
    );

    const viewOption = config.viewOptions.find((v) => v.key === viewKey);
    console.log(
      '[handleLinkExisting] viewOption found:',
      viewOption ? { key: viewOption.key, resourceTemplateId: viewOption.resourceTemplateId, resourceTemplateIds: viewOption.resourceTemplateIds } : 'NOT FOUND',
    );

    // Template IDs par défaut pour les types courants
    const defaultTemplateIds: Record<string, number> = {
      personnes: 96, // Template des actants/personnes (pas 35)
      actants: 96, // Template des actants
      keywords: 34, // Template des mots-clés
    };

    // Vérifier si on a plusieurs template IDs (pour les références bibliographiques/médiagraphiques)
    const resourceTemplateIds = viewOption?.resourceTemplateIds;
    const resourceTemplateId = viewOption?.resourceTemplateId || defaultTemplateIds[viewKey];

    console.log('[handleLinkExisting] resourceTemplateId:', resourceTemplateId);
    console.log('[handleLinkExisting] resourceTemplateIds:', resourceTemplateIds);

    setPickerState({
      isOpen: true,
      viewKey,
      resourceTemplateId,
      resourceTemplateIds,
      multiSelect: true,
    });
  };

  // Handle creating a new resource (opens new tab)
  const handleCreateNew = (viewKey: string) => {
    const viewOption = config.viewOptions.find((v) => v.key === viewKey);
    if (onCreateNewResource) {
      onCreateNewResource(viewKey, viewOption?.resourceTemplateId);
    }
  };

  // Handle removing an item from a view
  const handleRemoveItem = (viewKey: string, itemId: string | number) => {
    // Update the formData to remove the item
    const currentItems = formData[viewKey] || itemDetails?.[viewKey] || [];
    const updatedItems = currentItems.filter((item: any) => item.id !== itemId);
    setValue(viewKey, updatedItems);
  };

  // Handle items change (for text views)
  const handleItemsChange = (viewKey: string, items: any[]) => {
    if (items.length > 0 && items[0].dataPath) {
      // For text views, update both the viewKey and the dataPath
      setValue(viewKey, items[0].value); // Pour que la vue puisse lire la valeur
      setValue(items[0].dataPath, items[0].value); // Pour la sauvegarde Omeka
    } else {
      setValue(viewKey, items);
    }
  };

  // Handle resource selection from picker
  const handleResourceSelect = (resources: any[]) => {
    const { viewKey, resourceTemplateId } = pickerState;
    console.log('[handleResourceSelect] viewKey:', viewKey);
    console.log('[handleResourceSelect] resources:', resources);
    console.log('[handleResourceSelect] resourceTemplateId:', resourceTemplateId);
    const currentItems = formData[viewKey] || itemDetails?.[viewKey] || [];
    console.log('[handleResourceSelect] currentItems:', currentItems);

    // Normaliser les ressources Omeka S vers le format interne attendu par les composants
    const normalizedResources = resources.map((r) => {
      const title = r['o:title'] || r['dcterms:title']?.[0]?.['@value'] || r.title || r.display_title || '';
      const templateId = r['o:resource_template']?.['o:id'] || r.resource_template_id || resourceTemplateId;

      // Déterminer le type basé sur le template ID
      let type = r.type;
      if (!type && templateId) {
        // Templates de médiagraphies: 99, 98
        // Templates de bibliographies: 81, 83
        if ([99, 98].includes(templateId)) {
          type = 'mediagraphie';
        } else if ([81, 83].includes(templateId)) {
          type = 'bibliographie';
        }
      }

      // Récupérer l'image/thumbnail
      const thumbnailUrl = r['thumbnail_display_urls']?.square || r.thumbnailUrl || r.thumbnail || r.picture || null;

      return {
        id: r['o:id'] || r.id,
        title: title,
        name: title, // Pour les personnes/actants
        short_resume: r['dcterms:description']?.[0]?.['@value'] || r.short_resume || '',
        // Image/thumbnail pour l'affichage
        picture: thumbnailUrl,
        thumbnail: thumbnailUrl,
        thumbnailUrl: thumbnailUrl,
        // Conserver les données brutes Omeka S pour la sauvegarde
        '@id': r['@id'],
        'o:id': r['o:id'] || r.id,
        // Conserver le template ID et le type pour les filtres de références
        resource_template_id: templateId,
        type: type,
        template: r.template || (templateId ? { id: templateId } : undefined),
      };
    });

    const updatedItems = [...currentItems, ...normalizedResources];
    console.log('[handleResourceSelect] updatedItems:', updatedItems);
    setValue(viewKey, updatedItems);
    setPickerState({ isOpen: false, viewKey: '' });
  };

  /**
   * Charger les ressources disponibles pour une propriété donnée (inline search)
   * Basé sur test-omeka-edit.tsx - fonction loadResourcesForProperty
   */
  const _loadResourcesForProperty = async (propertyKey: string) => {
    const templateId = propertyTemplateMap[propertyKey];
    if (!templateId) {
      console.warn(`Pas de template ID pour la propriété ${propertyKey}`);
      return;
    }

    setSearchLoading(true);
    setActiveSearchProperty(propertyKey);

    try {
      const API_BASE = '/omk/api/';
      const url = `${API_BASE}items?resource_template_id=${templateId}&per_page=100`;
      const response = await fetch(url);

      if (!response.ok) {
        console.error('Erreur chargement ressources');
        setSearchResultsByProperty((prev) => ({ ...prev, [propertyKey]: [] }));
        return;
      }

      const items = await response.json();

      // Formater les résultats comme dans test-omeka-edit.tsx
      const formattedResults = items.map((item: any) => ({
        id: item['o:id'],
        title: item['o:title'] || `Item #${item['o:id']}`,
        resourceClass: item['o:resource_class']?.['o:label'],
        thumbnailUrl: item['thumbnail_display_urls']?.square,
      }));

      setSearchResultsByProperty((prev) => ({ ...prev, [propertyKey]: formattedResults }));
    } catch (err) {
      console.error('Erreur chargement ressources:', err);
      setSearchResultsByProperty((prev) => ({ ...prev, [propertyKey]: [] }));
    } finally {
      setSearchLoading(false);
    }
  };

  /**
   * Ajouter une ressource liée depuis la recherche inline
   * Basé sur test-omeka-edit.tsx - fonction addLinkedResource
   */
  const _addLinkedResource = (propertyKey: string, resourceId: number) => {
    // Récupérer les IDs actuels pour cette propriété
    const currentValue = formData[propertyKey] || itemDetails?.[propertyKey];
    let currentIds: number[] = [];

    if (Array.isArray(currentValue)) {
      if (currentValue.length > 0 && typeof currentValue[0] === 'object' && 'id' in currentValue[0]) {
        // C'est un tableau d'objets avec des IDs
        currentIds = currentValue.map((item: any) => item.id);
      } else if (typeof currentValue[0] === 'number') {
        // C'est déjà un tableau d'IDs
        currentIds = currentValue;
      }
    }

    // Ajouter le nouvel ID si pas déjà présent
    if (!currentIds.includes(resourceId)) {
      const updatedIds = [...currentIds, resourceId];

      // Convertir en tableau d'objets pour le formulaire
      const searchResults = searchResultsByProperty[propertyKey] || [];
      const resourceObjects = updatedIds.map((id) => {
        const found = searchResults.find((r) => r.id === id);
        return found || { id };
      });

      setValue(propertyKey, resourceObjects);
    }
  };
  void _loadResourcesForProperty;
  void _addLinkedResource;

  // Render content based on selected view
  const renderedContent = useMemo(() => {
    if (!itemDetails) {
      return <div>Loading...</div>;
    }

    const viewOption = config.viewOptions.find((opt) => opt.key === selected);
    if (!viewOption || !viewOption.renderContent) {
      return null;
    }

    // Use form data if editing, otherwise use itemDetails
    const dataSource = isEditing ? { ...itemDetails, ...formData } : itemDetails;

    const content = viewOption.renderContent({
      itemDetails: dataSource,
      viewData,
      loading,
      loadingViews, // Passer le loading spécifique aux vues
      onTimeChange: handleTimeChange,
      // Edit mode context
      isEditing: isEditing && viewOption.editable !== false,
      onLinkExisting: handleLinkExisting,
      onCreateNew: handleCreateNew,
      onRemoveItem: handleRemoveItem,
      onItemsChange: handleItemsChange,
      formData, // Pour que les vues texte puissent lire les valeurs éditées
      onNavigate: handleRightColumnNavigate, // Pour déclencher l'animation de sortie
    });

    // Return null if content is null or undefined
    return content || null || undefined;
  }, [itemDetails, formData, selected, viewData, loading, loadingViews, config.viewOptions, isEditing]);

  // Check if the rendered content is empty
  const hasRenderedContent = renderedContent !== null && renderedContent !== undefined;

  // Helper function to extract text from a React element recursively
  const extractTextFromElement = (element: React.ReactElement | React.ReactNode): string => {
    if (!element) return '';

    if (typeof element === 'string') {
      return element;
    }

    if (typeof element === 'number') {
      return String(element);
    }

    if (React.isValidElement(element)) {
      const props = element.props as any;
      const children = props?.children;

      if (Array.isArray(children)) {
        return children.map((child: any) => extractTextFromElement(child)).join(' ');
      } else if (children) {
        return extractTextFromElement(children);
      }
    }

    return '';
  };

  // Helper function to check if a React element is an empty state message
  const isEmptyStateMessage = (element: React.ReactElement): boolean => {
    const props = element.props as any;
    const componentType = element.type as any;

    // Check component name/displayName for EmptyState
    const componentName = componentType?.displayName || componentType?.name || '';
    if (componentName && (componentName.includes('EmptyState') || componentName === 'EmptyState')) {
      return true;
    }

    // Check for EmptyState component structure: div with text-center, bg-c2, border-c3
    // This matches the EmptyState component structure exactly
    const className = typeof props?.className === 'string' ? props.className : '';
    const hasEmptyStateStructure = className.includes('text-center') && className.includes('bg-c2') && className.includes('border-c3') && className.includes('rounded-12');

    if (hasEmptyStateStructure) {
      // Extract all text from the element recursively
      const allText = extractTextFromElement(element).toLowerCase().trim();

      // Check if text contains empty message keywords
      if (allText) {
        const hasEmptyKeywords =
          allText.includes('aucun') ||
          allText.includes('aucune') ||
          allText.includes('disponible') ||
          allText.includes('référence') ||
          allText.includes('élément') ||
          allText.includes('donnée') ||
          allText.includes('contenu') ||
          allText.includes('analyse') ||
          allText.includes('source') ||
          allText.includes('média') ||
          allText.includes('ressource');

        // If it has empty keywords AND matches a common empty message pattern, it's empty
        if (hasEmptyKeywords) {
          const emptyPatterns = [
            'aucune référence disponible',
            'aucun élément disponible',
            'aucune donnée disponible',
            'aucun contenu disponible',
            'aucune analyse disponible',
            'aucune source disponible',
            'aucun média disponible',
            'aucune ressource disponible',
          ];

          // Check if the text matches any empty pattern (even if there's other text)
          return emptyPatterns.some((pattern) => allText.includes(pattern));
        }
      }

      // If it has the EmptyState structure but we can't read the text, assume it's empty
      // (better safe than sorry - we'd rather hide it if unsure)
      return true;
    }

    // Also check for simpler empty message patterns (text-center with bg-c2)
    if (className.includes('text-center') && className.includes('bg-c2')) {
      const allText = extractTextFromElement(element).toLowerCase().trim();
      if (allText) {
        // Check for empty message patterns
        const emptyPatterns = ['aucune référence disponible', 'aucun élément disponible', 'aucune donnée disponible', 'aucun contenu disponible'];
        return emptyPatterns.some((pattern) => allText.includes(pattern));
      }
    }

    return false;
  };

  // Helper function to check if a single view has content
  const viewHasContent = (viewOption: any): boolean => {
    // In edit mode, always show editable views
    if (isEditing && viewOption.editable !== false) {
      return true;
    }

    if (!viewOption || !viewOption.renderContent) {
      return false;
    }

    const content = viewOption.renderContent({
      itemDetails,
      viewData,
      loading: false,
      onTimeChange: handleTimeChange,
      isEditing: false, // Check content availability in view mode
    });

    if (!content) {
      return false;
    }

    if (React.isValidElement(content)) {
      const props = content.props as any;

      // Check if it's an ItemsList component with empty items (most reliable check)
      if (props?.items !== undefined) {
        const items = Array.isArray(props.items) ? props.items : [];
        return items.length > 0;
      }

      // Check if it's an EmptyState component directly
      if (isEmptyStateMessage(content)) {
        return false;
      }

      // Recursive function to check if the root element or any direct child is an EmptyState
      const checkForEmptyState = (element: React.ReactElement): boolean => {
        if (isEmptyStateMessage(element)) {
          return true;
        }

        const elementProps = element.props as any;
        if (elementProps?.children) {
          const children = elementProps.children;

          if (Array.isArray(children)) {
            if (children.length > 0 && React.isValidElement(children[0])) {
              return isEmptyStateMessage(children[0]);
            }
          } else if (React.isValidElement(children)) {
            return isEmptyStateMessage(children);
          }
        }

        return false;
      };

      if (checkForEmptyState(content)) {
        return false;
      }

      return true;
    }

    if (typeof content === 'string') {
      return content.trim() !== '';
    }

    return true;
  };

  // Filter views to only show those with content
  const availableViews = useMemo(() => {
    if (!itemDetails || loading) {
      return [];
    }

    if (!config.viewOptions || config.viewOptions.length === 0) {
      return [];
    }

    // Filter views to only include those with content (or all editable in edit mode)
    return config.viewOptions.filter((viewOption) => viewHasContent(viewOption));
  }, [itemDetails, loading, config.viewOptions, viewData, isEditing]);

  // Check if right column has content to display
  const hasRightColumnContent = availableViews.length > 0;

  // Ensure selected view is available, if not select the first available view
  useEffect(() => {
    if (!loading && itemDetails && availableViews.length > 0) {
      const isSelectedAvailable = availableViews.some((view) => view.key === selected);
      if (!isSelectedAvailable) {
        // Select the first available view or the default view if available
        const defaultView = config.defaultView && availableViews.find((v) => v.key === config.defaultView);
        setSelected(defaultView ? defaultView.key : availableViews[0].key);
      }
    }
  }, [loading, itemDetails, availableViews, selected, config.defaultView]);

  const OverviewComponent = config.overviewComponent;
  const DetailsComponent = config.detailsComponent;
  const OverviewSkeleton = config.overviewSkeleton;
  const DetailsSkeleton = config.detailsSkeleton;

  const shouldShowRightColumn = hasRightColumnContent;
  const leftColumnSpan = shouldShowRightColumn ? 'col-span-10 lg:col-span-6' : 'col-span-10';

  // Use availableViews instead of config.viewOptions for the selected option
  const selectedOption = availableViews.find((option) => option.key === selected);

  // Sort keywords by popularity (descending order)
  // En mode édition, formData.keywords est la source de vérité (permet ajouts et suppressions)
  const sortedKeywords = useMemo(() => {
    let allKeywords: any[];

    // En mode édition, utiliser formData.keywords comme source de vérité s'il est défini
    if (isEditing && formData.keywords !== undefined) {
      allKeywords = Array.isArray(formData.keywords) ? formData.keywords : [];
    } else {
      allKeywords = keywords || [];
    }

    if (allKeywords.length === 0) return [];
    return [...allKeywords].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  }, [keywords, isEditing, formData.keywords]);

  return (
    <>
      <Layouts className='grid grid-cols-10 col-span-10 gap-50 overflow-visible z-0'>
        {/* Edit Mode Banner */}
        {isEditing && (
          <div className='col-span-10 overflow-visible'>
            <PageBanner title={mode === 'create' ? 'Mode création' : 'Mode édition'} icon={<EditIcon />} description={`${config.type || 'Ressource'}`} edition />
          </div>
        )}

        {/* Colonne principale */}
        <motion.div ref={firstDivRef} className={`${leftColumnSpan} flex flex-col gap-25 h-fit`} variants={fadeIn}>
          {/* Header avec breadcrumbs et boutons d'édition */}
          <div className='flex items-center justify-between'>
            <DynamicBreadcrumbs itemTitle={itemDetails?.titre || itemDetails?.title || itemDetails?.['o:title'] || itemDetails?.name} underline='hover' />
          </div>

          {/* Keywords carousel */}
          {itemDetails &&
            config.showKeywords &&
            (loadingKeywords ? (
              <div className='flex items-center justify-center py-6 bg-c2 rounded-12 border-2 border-c3'>
                <Spinner size='md' />
                <span className='ml-3 text-c5'>Chargement des mots-clés...</span>
              </div>
            ) : (
              (sortedKeywords?.length > 0 || isEditing) && (
                <div className='flex flex-col gap-2'>
                  {isEditing && <label className='text-14 text-c5 font-medium'>Mots-clés</label>}
                  <div className='flex items-center gap-10 overflow-hidden'>
                    <div className='flex-1 min-w-0 overflow-hidden'>
                      {isEditing ? (
                        /* Mode édition: afficher les keywords comme des chips avec bouton de suppression */
                        <div className='flex flex-wrap gap-2 items-center'>
                          {sortedKeywords?.map((keyword: any) => (
                            <div key={keyword.id || keyword.title} className='flex items-center gap-2 px-3 py-1.5 h-[40px] bg-c2 border border-c3 text-c6 rounded-8 text-14'>
                              <span>{keyword.title}</span>
                              {/* Bouton de suppression */}
                              <button
                                type='button'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Supprimer de formData.keywords
                                  const currentKeywords = formData.keywords || [];
                                  const updatedKeywords = currentKeywords.filter((k: any) => k.id !== keyword.id);
                                  setValue('keywords', updatedKeywords);
                                }}
                                className='ml-1 p-0.5 hover:bg-red-500/20 rounded-full transition-colors'>
                                <CrossIcon size={12} className='text-c4 hover:text-red-500' />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        /* Mode lecture: carrousel */
                        sortedKeywords?.length > 0 && (
                          <LongCarrousel
                            perPage={3}
                            perMove={1}
                            autowidth={true}
                            data={sortedKeywords}
                            renderSlide={(item) => (
                              <KeywordsCard key={item.id || item.title} onSearchClick={handleKeywordClick} word={item.title} description={item.short_resume} />
                            )}
                          />
                        )
                      )}
                    </div>
                    {/* Search keyword button in edit mode */}
                    {isEditing && (
                      <button
                        type='button'
                        onClick={() => handleLinkExisting('keywords')}
                        className='px-4 py-2 border-2 border-dashed border-c4 rounded-8 text-c5 text-14 hover:border-action hover:bg-c2 transition-all duration-200'>
                        Ajouter un mot clé
                      </button>
                    )}
                  </div>
                </div>
              )
            ))}

          {/* Mode édition/création: Section unifiée */}
          {isEditing ? (
            <div className='flex flex-col gap-25'>
              {/* Section Médias */}
              <OverviewComponent
                {...config.mapOverviewProps({ ...itemDetails, ...formData }, currentVideoTime)}
                type={config.type}
                isEditing={true}
                loadingMedia={loadingMedia}
                onTitleChange={(value: string) => setValue('title', value)}
                onMediasChange={(files: MediaFile[]) => setMediaFiles(files)}
                onAddPerson={() => handleLinkExisting('personnes')}
                onResourcesSelected={(_property: string, resources: any[]) => {
                  const mappedResources = resources.map((r) => ({
                    id: r.id,
                    title: r.title,
                    name: r.title,
                    type: 'actant',
                  }));
                  const currentPersonnes = formData.personnes || [];
                  setValue('personnes', [...currentPersonnes, ...mappedResources]);
                }}
                onLinkChange={(value: string) => setValue('fullUrl', value)}
                mediaFiles={mediaFiles}
                removedMediaIndexes={removedMediaIndexes}
                onRemoveExistingMedia={handleRemoveExistingMedia}
              />

              {/* Section Formulaire Unifié */}
              <div className='bg-c2 rounded-12 p-25 flex flex-col gap-20'>
                {/* Titre */}
                <div className='flex flex-col gap-2'>
                  <label className='text-14 text-c5 font-medium'>Titre</label>
                  <input
                    type='text'
                    value={formData.title || ''}
                    onChange={(e) => setValue('title', e.target.value)}
                    placeholder='Titre de la ressource'
                    className='bg-c1 border border-c3 rounded-8 px-15 py-10 text-c6 text-16 focus:outline-none focus:border-action'
                  />
                </div>

                {/* Description */}
                {config.formFields?.find((f) => f.key === 'description') && (
                  <div className='flex flex-col gap-2'>
                    <label className='text-14 text-c5 font-medium'>Description</label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => setValue('description', e.target.value)}
                      placeholder='Décrivez votre ressource...'
                      rows={4}
                      className='bg-c1 border border-c3 rounded-8 px-15 py-10 text-c6 text-16 focus:outline-none focus:border-action resize-none'
                    />
                  </div>
                )}

                {/* Date */}
                {config.formFields?.find((f) => f.key === 'date') && (
                  <div className='flex flex-col gap-2'>
                    <label className='text-14 text-c5 font-medium'>Date</label>
                    <input
                      type='date'
                      value={formData.date || ''}
                      onChange={(e) => setValue('date', e.target.value)}
                      className='bg-c1 border border-c3 rounded-8 px-15 py-10 text-c6 text-16 focus:outline-none focus:border-action'
                    />
                  </div>
                )}

                {/* Avancement (Slider) */}
                {config.formFields?.find((f) => f.key === 'percentage') && (
                  <div className='flex flex-col gap-2'>
                    <div className='flex justify-between items-center'>
                      <label className='text-14 text-c5 font-medium'>Avancement</label>
                      <span className='text-14 text-c6 font-semibold'>{formData.percentage || 0}%</span>
                    </div>
                    <input
                      type='range'
                      min='0'
                      max='100'
                      step='5'
                      value={formData.percentage || 0}
                      onChange={(e) => setValue('percentage', parseInt(e.target.value))}
                      className='w-full accent-action'
                    />
                  </div>
                )}

                {/* Statut */}
                {config.formFields?.find((f) => f.key === 'status') && (
                  <div className='flex flex-col gap-2'>
                    <label className='text-14 text-c5 font-medium'>Statut</label>
                    <input
                      type='text'
                      value={formData.status || ''}
                      onChange={(e) => setValue('status', e.target.value)}
                      placeholder='En cours, Terminé...'
                      className='bg-c1 border border-c3 rounded-8 px-15 py-10 text-c6 text-16 focus:outline-none focus:border-action'
                    />
                  </div>
                )}

                {/* Champs spécifiques aux outils */}
                {config.formFields?.find((f) => f.key === 'category') && (
                  <div className='flex flex-col gap-2'>
                    <label className='text-14 text-c5 font-medium'>Type d'outil</label>
                    <input
                      type='text'
                      value={formData.category || ''}
                      onChange={(e) => setValue('category', e.target.value)}
                      placeholder='Logiciel, Bibliothèque, Framework...'
                      className='bg-c1 border border-c3 rounded-8 px-15 py-10 text-c6 text-16 focus:outline-none focus:border-action'
                    />
                  </div>
                )}

                {config.formFields?.find((f) => f.key === 'purpose') && (
                  <div className='flex flex-col gap-2'>
                    <label className='text-14 text-c5 font-medium'>Fonction</label>
                    <textarea
                      value={formData.purpose || ''}
                      onChange={(e) => setValue('purpose', e.target.value)}
                      placeholder="Objectif principal de l'outil..."
                      rows={2}
                      className='bg-c1 border border-c3 rounded-8 px-15 py-10 text-c6 text-16 focus:outline-none focus:border-action resize-none'
                    />
                  </div>
                )}

                {/* Lien externe */}
                <div className='flex flex-col gap-2'>
                  <label className='text-14 text-c5 font-medium'>Lien externe</label>
                  <input
                    type='url'
                    value={formData.fullUrl || formData.url || formData.homepage || ''}
                    onChange={(e) => setValue('fullUrl', e.target.value)}
                    placeholder='https://...'
                    className='bg-c1 border border-c3 rounded-8 px-15 py-10 text-c6 text-16 focus:outline-none focus:border-action'
                  />
                </div>

                {/* Contributeurs */}
                <div className='flex flex-col gap-2'>
                  <label className='text-14 text-c5 font-medium'>Contributeurs</label>
                  <div className='flex flex-wrap gap-2 items-center'>
                    {(formData.personnes || itemDetails?.personnes || itemDetails?.actants || []).map((person: any, index: number) => (
                      <div key={person.id || index} className='flex items-center gap-2 px-6 h-[60px] bg-c3 rounded-8'>
                        {getPersonPicture(person) && <img src={getPersonPicture(person) ?? ''} alt='Avatar' className='w-6 h-6 rounded-full object-cover rounded-[4px]' />}
                        <span className='text-c6 text-14'>{getPersonDisplayName(person)}</span>
                        {/* Bouton de suppression */}
                        <button
                          type='button'
                          onClick={(e) => {
                            e.stopPropagation();
                            const currentPersonnes = formData.personnes || itemDetails?.personnes || itemDetails?.actants || [];
                            const updatedPersonnes = currentPersonnes.filter((p: any) => p.id !== person.id);
                            setValue('personnes', updatedPersonnes);
                          }}
                          className='ml-1 p-0.5 hover:bg-red-500/20 rounded-full transition-colors'>
                          <CrossIcon size={12} className='text-c4 hover:text-red-500' />
                        </button>
                      </div>
                    ))}
                    <button
                      type='button'
                      onClick={() => handleLinkExisting('personnes')}
                      className='px-4 py-2 border-2 border-dashed border-c4 h-[56px] rounded-8 text-c5 text-14 hover:border-action hover:bg-c2 transition-all duration-200'>
                      Ajouter un contributeur
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Mode view: Overview Card */}
              {loading ? (
                OverviewSkeleton ? (
                  <OverviewSkeleton />
                ) : (
                  <div>Loading...</div>
                )
              ) : itemDetails ? (
                <OverviewComponent {...config.mapOverviewProps(itemDetails, currentVideoTime)} type={config.type} isEditing={false} loadingMedia={loadingMedia} />
              ) : null}

              {/* Mode view: Details Card */}
              {loading ? (
                DetailsSkeleton ? (
                  <DetailsSkeleton />
                ) : (
                  <div>Loading...</div>
                )
              ) : itemDetails ? (
                <DetailsComponent {...config.mapDetailsProps(itemDetails)} isEditing={isEditing} type={config.type} />
              ) : null}
            </>
          )}
        </motion.div>

        {/* Colonne secondaire - Vues multiples */}
        {shouldShowRightColumn && hasRenderedContent && (
          <motion.div
            style={{ height: equalHeight || 'auto' }}
            className='col-span-10 lg:col-span-4 flex flex-col gap-50 overflow-hidden'
            initial={{ opacity: 0, x: 30 }}
            animate={
              isExitingRightColumn ? { opacity: 0, x: 60, transition: { duration: 0.35, ease: 'easeIn' } } : { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } }
            }>
            <div className='flex w-full flex-col gap-20 flex-grow min-h-0 overflow-hidden'>
              {/* Header avec titre et dropdown */}
              <div className='flex items-center justify-between w-full'>
                <h2 className='text-24 font-medium text-c6'>{selectedOption?.title}</h2>

                {availableViews.length > 1 && (
                  <div className='relative'>
                    <Dropdown>
                      <DropdownTrigger className='p-0'>
                        <div
                          className='hover:bg-c3 shadow-[inset_0_0px_15px_rgba(255,255,255,0.05)] cursor-pointer bg-c2 flex flex-row rounded-8 border-2 border-c3 items-center justify-center px-15 py-10 text-16 gap-10 text-c6 transition-all ease-in-out duration-200'
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                          <span className='text-16 font-normal text-c6'>Autres choix</span>
                          <ArrowIcon size={12} className='rotate-90 text-c6' />
                        </div>
                      </DropdownTrigger>

                      <DropdownMenu aria-label='View options' className='p-10 bg-c2 rounded-12'>
                        {config.viewOptions.map((option) => {
                          const isAvailable = availableViews.some((v) => v.key === option.key);
                          const isLoading = !isAvailable && loadingViews;

                          return (
                            <DropdownItem
                              key={option.key}
                              className={`p-0 ${selected === option.key ? 'bg-action' : ''}`}
                              onClick={() => (isAvailable ? handleOptionSelect(option.key) : undefined)}
                              isDisabled={isLoading}>
                              <div
                                className={`flex items-center w-full px-15 py-10 rounded-8 transition-all ease-in-out duration-200 ${
                                  isLoading ? 'text-c4 cursor-not-allowed' : selected === option.key ? 'bg-action text-selected font-medium' : 'text-c6 hover:bg-c3'
                                }`}>
                                {isLoading && <Spinner size='sm' className='mr-2' />}
                                <span className='text-16'>{option.title}</span>
                              </div>
                            </DropdownItem>
                          );
                        })}
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                )}
              </div>

              {/* Contenu de la vue sélectionnée */}
              <div className='flex-grow min-h-0 overflow-auto pr-25'>{renderedContent}</div>
            </div>
          </motion.div>
        )}

        {/* Recommendations */}
        {config.showRecommendations && !loadingRecommendations && recommendations.length > 0 && (
          <motion.div className='col-span-10 h-full lg:col-span-6 flex flex-col gap-50 flex-grow' variants={fadeIn}>
            <FullCarrousel
              title={config.recommendationsTitle || 'Recommandations'}
              perPage={2}
              perMove={1}
              data={recommendations}
              renderSlide={(item) => {
                // Mapper les props si nécessaire
                const mappedItem = config.mapRecommendationProps ? config.mapRecommendationProps(item) : item;
                return (
                  <motion.div initial='hidden' animate='visible' variants={fadeIn} key={item.id}>
                    <SmConfCard {...mappedItem} />
                  </motion.div>
                );
              }}
            />
          </motion.div>
        )}

        {/* Comments */}
        {config.showComments && (
          <motion.div className='col-span-4 h-full lg:col-span-4 flex flex-col gap-50 flex-grow' variants={fadeIn}>
            <CommentSection LinkedResourceId={Number(id)} />
          </motion.div>
        )}

        <SearchModal ref={searchModalRef} notrigger={true} />

        {/* Resource Picker Modal - Toujours monté, isOpen gère la visibilité */}
        <ResourcePicker
          isOpen={pickerState.isOpen}
          onClose={() => setPickerState({ isOpen: false, viewKey: '' })}
          onSelect={handleResourceSelect}
          title={`Sélectionner ${pickerState.viewKey === 'keywords' ? 'des mots-clés' : 'des ressources'}`}
          resourceTemplateId={pickerState.resourceTemplateId}
          resourceTemplateIds={pickerState.resourceTemplateIds}
          multiSelect={pickerState.multiSelect}
          selectedIds={[]}
        />
      </Layouts>

      {/* Fixed bottom save bar for edit/create mode - Outside Layouts for proper fixed positioning */}
      <EditSaveBar
        isVisible={isEditing}
        onSave={handleSave}
        onCancel={handleCancelEdit}
        isSubmitting={isSubmitting}
        isDirty={isDirty}
        resourceType={config.type || 'Ressource'}
        mode={mode}
      />
    </>
  );
};
