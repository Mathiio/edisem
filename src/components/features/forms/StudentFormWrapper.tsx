import React, { useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ResourceTabInfo } from './ResourceFormTabs';
import { GenericDetailPage } from '@/pages/generic/GenericDetailPage';
import { GenericDetailPageConfig } from '@/pages/generic/config';

// Import des configs étudiantes
import { toolStudentConfig } from '@/pages/generic/config/toolStudentConfig';
import { feedbackStudentConfig, feedbackStudentConfigSimplified } from '@/pages/generic/config/feedbackStudentConfig';
import { experimentationStudentConfig } from '@/pages/generic/config/experimentationStudentConfig';
import { bibliographyStudentConfig } from '@/pages/generic/config/bibliographyStudentConfig';
import { createHandleSave } from '@/pages/generic/simplifiedConfigAdapter';
import { getRessourceLabel } from '@/config/resourceConfig';

/**
 * Configuration complète d'un onglet (interne au wrapper)
 */
interface InternalTab extends ResourceTabInfo {
  config: GenericDetailPageConfig;
  mode: 'edit' | 'create';
  itemId?: string;
  parentTabId?: string;
  linkedField?: string;
  hasBeenActivated?: boolean; // Track if tab was ever made active
}

/**
 * Mapping viewKey → config pour créer le bon type de ressource
 */
const VIEW_KEY_CONFIG_MAP: Record<string, { config: GenericDetailPageConfig }> = {
  // Depuis experimentationStudentConfig (views)
  'theatre:credit': { config: toolStudentConfig },
  'schema:description': { config: feedbackStudentConfig },
  'dcterms:references': { config: bibliographyStudentConfig },
  'dcterms:bibliographicCitation': { config: bibliographyStudentConfig },

  // Depuis feedbackStudentConfig (views)
  outils: { config: toolStudentConfig },
  'schema:tool': { config: toolStudentConfig },

  // Depuis toolStudentConfig (views)
  projets: { config: experimentationStudentConfig },
  'dcterms:isPartOf': { config: experimentationStudentConfig },
};

const getConfigForViewKey = (viewKey: string) => VIEW_KEY_CONFIG_MAP[viewKey];

interface StudentFormWrapperProps {
  initialConfig: GenericDetailPageConfig;
  initialMode: 'edit' | 'create';
}

/**
 * Wrapper qui gère les onglets pour l'édition/création de ressources étudiantes.
 * Les onglets sont rendus à l'intérieur de GenericDetailPage.
 * Tous les formulaires restent montés pour préserver leur état.
 */
export const StudentFormWrapper: React.FC<StudentFormWrapperProps> = ({ initialConfig, initialMode }) => {
  const { id: paramId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // État des onglets
  const [tabs, setTabs] = useState<InternalTab[]>([
    {
      id: 'main',
      title: getRessourceLabel(initialConfig.type || 'Ressource'),
      config: initialConfig,
      mode: initialMode,
      itemId: paramId,
      isDirty: false,
      hasBeenActivated: true, // Main tab is active from start
    },
  ]);
  const [activeTabId, setActiveTabId] = useState('main');

  const generateTabId = () => `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const handleCreateNewResource = useCallback(
    (viewKey: string, _templateId?: number) => {
      const mapping = getConfigForViewKey(viewKey);
      if (!mapping) {
        console.warn(`No config found for viewKey: ${viewKey}`);
        return;
      }

      const newTab: InternalTab = {
        id: generateTabId(),
        title: getRessourceLabel(mapping.config.type || 'Ressource'),
        config: mapping.config,
        mode: 'create',
        isDirty: false,
        parentTabId: activeTabId,
        linkedField: viewKey,
        hasBeenActivated: true, // Will be activated immediately
      };

      setTabs((prev) => [...prev, newTab]);
      setActiveTabId(newTab.id);
    },
    [activeTabId],
  );

  const handleEditResource = useCallback(
    (viewKey: string, resourceId: string | number) => {
      const mapping = getConfigForViewKey(viewKey);
      if (!mapping) {
        console.warn(`No config found for viewKey: ${viewKey}`);
        return;
      }

      // Check if tab already exists
      const existingTab = tabs.find((t) => t.itemId === String(resourceId) && t.config === mapping.config);
      if (existingTab) {
        setActiveTabId(existingTab.id);
        return;
      }

      const newTab: InternalTab = {
        id: generateTabId(),
        title: getRessourceLabel(mapping.config.type || 'Ressource'), // Ideally we would want the specific item title here
        config: mapping.config,
        mode: 'edit',
        itemId: String(resourceId),
        isDirty: false,
        parentTabId: activeTabId,
        linkedField: viewKey,
        hasBeenActivated: true,
      };

      setTabs((prev) => [...prev, newTab]);
      setActiveTabId(newTab.id);
    },
    [activeTabId, tabs],
  );



  const handleSaveComplete = useCallback((tabId: string, savedItemId: string | number, savedItemTitle?: string) => {
    setTabs((prevTabs) => {
      const tab = prevTabs.find((t) => t.id === tabId);

      if (tab?.parentTabId && tab.linkedField) {
        const parentId = tab.parentTabId;
        const linkedField = tab.linkedField; // Extract to ensure TypeScript knows it's defined

        // Mettre à jour le titre dans updatedResources si disponible
        if (savedItemTitle) {
          setUpdatedResources((prev) => ({
            ...prev,
            [String(savedItemId)]: {
              title: savedItemTitle,
              // On pourrait aussi mettre à jour le thumbnail si on l'avait
            },
          }));
        }

        // Only add to pendingLinks if the tab was in create mode
        // In edit mode, the link already exists, so we don't need to add it again
        if (tab.mode === 'create') {
          // Ajouter le lien aux pendingLinks via setState (pas ref)
          // Cela va déclencher un re-render et passer les liens au parent
          setPendingLinksToPass((prev) => ({
            ...prev,
            [parentId]: [
              ...(prev[parentId] || []),
              {
                linkedField,
                resourceId: savedItemId,
                resourceTitle: savedItemTitle,
              },
            ],
          }));
        }

        // Marquer le parent comme dirty et supprimer l'onglet enfant
        // Even in edit mode, we might want to mark parent as dirty if we want to force a refresh,
        // but for now let's assume parent doesn't need to be dirty if we just edited a child.
        // Actually, if we edited a child, the parent might show outdated info (e.g. title), so maybe keep it dirty?
        // But the user issue is duplication, which comes from pendingLinks.
        // So we just filter tabs and optionally mark parent dirty.
        const newTabs = prevTabs.map((t) => (t.id === parentId ? { ...t, isDirty: true } : t)).filter((t) => t.id !== tabId);

        // Changer vers le parent
        setActiveTabId(parentId);

        return newTabs;
      }

      return prevTabs;
    });
  }, []);

  const handleCloseTab = useCallback(
    (tabId: string) => {
      setTabs((prevTabs) => {
        const tab = prevTabs.find((t) => t.id === tabId);

        if (prevTabs.length === 1) {
          return prevTabs;
        }

        if (tab?.isDirty) {
          const confirmClose = window.confirm('Cette ressource a des modifications non sauvegardées. Voulez-vous vraiment fermer cet onglet ?');
          if (!confirmClose) return prevTabs;
        }

        const currentIndex = prevTabs.findIndex((t) => t.id === tabId);
        const newTabs = prevTabs.filter((t) => t.id !== tabId);

        if (activeTabId === tabId && newTabs.length > 0) {
          const newActiveIndex = Math.min(currentIndex, newTabs.length - 1);
          setActiveTabId(newTabs[newActiveIndex].id);
        }

        return newTabs;
      });
    },
    [activeTabId],
  );

  const handleTabChange = useCallback((tabId: string) => {
    setActiveTabId(tabId);
  }, []);

  const handleDirtyChange = useCallback((tabId: string, isDirty: boolean) => {
    setTabs((prev) => {
      const tab = prev.find((t) => t.id === tabId);
      // Éviter les mises à jour inutiles si la valeur n'a pas changé
      if (tab && tab.isDirty === isDirty) {
        return prev;
      }
      return prev.map((t) => (t.id === tabId ? { ...t, isDirty } : t));
    });
  }, []);

  // État pour passer les pendingLinks de manière contrôlée
  // On ne passe les liens qu'une seule fois quand on switch vers le tab parent
  const [pendingLinksToPass, setPendingLinksToPass] = useState<Record<string, { linkedField: string; resourceId: string | number; resourceTitle?: string }[]>>({});
  
  // État pour passer les mises à jour des ressources (titre, thumbnail)
  const [updatedResources, setUpdatedResources] = useState<Record<string, { title?: string; thumbnail?: string }>>({});

  const clearPendingLinks = useCallback((tabId: string) => {
    setPendingLinksToPass((prev) => {
      if (!prev[tabId]) return prev;
      const newState = { ...prev };
      delete newState[tabId];
      return newState;
    });
  }, []);

  // Mémoriser tabsForDisplay pour éviter les re-renders
  const tabsForDisplay: ResourceTabInfo[] = useMemo(
    () =>
      tabs.map((t) => ({
        id: t.id,
        title: t.title,
        isDirty: t.isDirty,
      })),
    [tabs],
  );

  // Créer des callbacks stables pour chaque tab en utilisant useMemo
  // Cela évite de recréer les callbacks à chaque render
  const tabCallbacksMap = useMemo(() => {
    const map: Record<
      string,
      {
        onSaveComplete: (savedId: string | number, savedTitle?: string) => void;
        onDirtyChange: (isDirty: boolean) => void;
        onPendingLinksProcessed: () => void;
        onSave?: (data: any) => Promise<void>;
        onCancel?: () => void;
      }
    > = {};
    
    tabs.forEach((tab) => {
      // Déterminer la config simplifiée correspondante pour générer le handleSave
      let simplifiedConfig: any = null;
      
      // Essayer de trouver la config simplifiée source
      if (tab.config === feedbackStudentConfig) simplifiedConfig = feedbackStudentConfigSimplified;
      // Il faudrait importer les autres configs simplifiées ici si nécessaire (toolStudentConfigSimplified, etc.)
      
      let onSaveHandler: ((data: any) => Promise<void>) | undefined = undefined;
      
      if (simplifiedConfig) {
        // Créer le handler de sauvegarde
        const saveHandler = createHandleSave(simplifiedConfig);
        onSaveHandler = async (data: any) => {
          if (tab.itemId) {
            await saveHandler(data, tab.itemId);
          }
        };
      }

      // Déterminer le comportement d'annulation
      let onCancelHandler: (() => void) | undefined = undefined;
      
      if (tab.parentTabId) {
        // Cas 1: Onglet enfant -> Fermer l'onglet
        onCancelHandler = () => handleCloseTab(tab.id);
      } else if (tab.mode === 'create') {
        // Cas 2: Onglet principal en création -> Retour arrière navigation
        onCancelHandler = () => navigate(-1);
      }
      // Cas 3: Onglet principal en édition -> undefined (laisser GenericDetailPage passer en mode view)

      map[tab.id] = {
        onSaveComplete: (savedId: string | number, savedTitle?: string) => handleSaveComplete(tab.id, savedId, savedTitle),
        onDirtyChange: (isDirty: boolean) => handleDirtyChange(tab.id, isDirty),
        onPendingLinksProcessed: () => clearPendingLinks(tab.id),
        onSave: onSaveHandler,
        onCancel: onCancelHandler,
      };
    });
    return map;
  }, [tabs, handleSaveComplete, handleDirtyChange, clearPendingLinks, handleCloseTab, navigate]);

  return (
    <>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        const callbacks = tabCallbacksMap[tab.id];

        // Ne rendre que les tabs qui ont été activés au moins une fois
        if (!tab.hasBeenActivated) {
          return null;
        }

        return (
          <div key={tab.id} style={{ display: isActive ? 'contents' : 'none' }}>
            <GenericDetailPage
              config={tab.config}
              initialMode={tab.mode}
              itemId={tab.itemId}
              onCreateNewResource={handleCreateNewResource}
              onEditResource={handleEditResource}
              onSave={callbacks?.onSave}
              onCancel={callbacks?.onCancel}
              onSaveComplete={callbacks?.onSaveComplete}
              onDirtyChange={callbacks?.onDirtyChange}
              pendingLinks={isActive ? pendingLinksToPass[tab.id] : undefined}
              updatedResources={isActive ? updatedResources : undefined}
              onPendingLinksProcessed={callbacks?.onPendingLinksProcessed}
              tabs={tabsForDisplay}
              activeTabId={activeTabId}
              onTabChange={handleTabChange}
              onTabClose={handleCloseTab}
            />
          </div>
        );
      })}
    </>
  );
};

export default StudentFormWrapper;
