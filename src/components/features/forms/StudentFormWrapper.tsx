import React, { useState, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { ResourceTabInfo } from './ResourceFormTabs';
import { GenericDetailPage } from '@/pages/generic/GenericDetailPage';
import { GenericDetailPageConfig } from '@/pages/generic/config';

// Import des configs étudiantes
import { toolStudentConfig } from '@/pages/generic/config/toolStudentConfig';
import { feedbackStudentConfig } from '@/pages/generic/config/feedbackStudentConfig';
import { experimentationStudentConfig } from '@/pages/generic/config/experimentationStudentConfig';
import { bibliographyStudentConfig } from '@/pages/generic/config/bibliographyStudentConfig';

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
const VIEW_KEY_CONFIG_MAP: Record<string, { config: GenericDetailPageConfig; label: string }> = {
  // Depuis experimentationStudentConfig (views)
  'theatre:credit': { config: toolStudentConfig, label: 'Outil' },
  'schema:description': { config: feedbackStudentConfig, label: "Retour d'expérience" },
  'dcterms:references': { config: bibliographyStudentConfig, label: 'Bibliographie' },
  'dcterms:bibliographicCitation': { config: bibliographyStudentConfig, label: 'Bibliographie' },

  // Depuis feedbackStudentConfig (views)
  outils: { config: toolStudentConfig, label: 'Outil' },
  'schema:tool': { config: toolStudentConfig, label: 'Outil' },

  // Depuis toolStudentConfig (views)
  projets: { config: experimentationStudentConfig, label: 'Expérimentation' },
  'dcterms:isPartOf': { config: experimentationStudentConfig, label: 'Expérimentation' },
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

  // État des onglets
  const [tabs, setTabs] = useState<InternalTab[]>([
    {
      id: 'main',
      title: initialConfig.type || 'Ressource',
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
        title: mapping.label,
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

  const handleSaveComplete = useCallback((tabId: string, savedItemId: string | number, savedItemTitle?: string) => {
    setTabs((prevTabs) => {
      const tab = prevTabs.find((t) => t.id === tabId);

      if (tab?.parentTabId && tab.linkedField) {
        const parentId = tab.parentTabId;
        const linkedField = tab.linkedField; // Extract to ensure TypeScript knows it's defined

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

        // Marquer le parent comme dirty et supprimer l'onglet enfant
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

  // Liste des IDs de tabs pour les dépendances (mémorisée)
  const tabIds = useMemo(() => tabs.map((t) => t.id), [tabs]);

  // Créer des callbacks stables pour chaque tab en utilisant useMemo
  // Cela évite de recréer les callbacks à chaque render
  const tabCallbacksMap = useMemo(() => {
    const map: Record<
      string,
      {
        onSaveComplete: (savedId: string | number, savedTitle?: string) => void;
        onDirtyChange: (isDirty: boolean) => void;
        onPendingLinksProcessed: () => void;
      }
    > = {};
    tabIds.forEach((tabId) => {
      map[tabId] = {
        onSaveComplete: (savedId: string | number, savedTitle?: string) => handleSaveComplete(tabId, savedId, savedTitle),
        onDirtyChange: (isDirty: boolean) => handleDirtyChange(tabId, isDirty),
        onPendingLinksProcessed: () => clearPendingLinks(tabId),
      };
    });
    return map;
  }, [tabIds, handleSaveComplete, handleDirtyChange, clearPendingLinks]);

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
              onSaveComplete={callbacks?.onSaveComplete}
              onDirtyChange={callbacks?.onDirtyChange}
              pendingLinks={isActive ? pendingLinksToPass[tab.id] : undefined}
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
