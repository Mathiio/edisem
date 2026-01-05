import { useState, useCallback, useMemo } from 'react';
import { GenericDetailPageConfig, PageMode } from '@/pages/generic/config';

/**
 * État d'un onglet
 */
export interface TabState {
  id: string;
  title: string;
  resourceType: string;
  config: GenericDetailPageConfig;
  mode: PageMode;
  itemId?: string;
  isDirty: boolean;
  parentTabId?: string;
  linkedField?: string;
  data?: Record<string, any>;
}

/**
 * Actions pour gérer les onglets
 */
export interface TabActions {
  addTab: (tab: Omit<TabState, 'isDirty'>) => string;
  removeTab: (tabId: string) => boolean;
  setActiveTab: (tabId: string) => void;
  updateTabData: (tabId: string, data: Record<string, any>) => void;
  setTabDirty: (tabId: string, isDirty: boolean) => void;
  updateTabTitle: (tabId: string, title: string) => void;
  getTab: (tabId: string) => TabState | undefined;
  hasUnsavedChanges: () => boolean;
  closeTabWithConfirm: (tabId: string) => Promise<boolean>;
}

interface UseFormTabsOptions {
  initialTabs?: TabState[];
  onTabClose?: (tabId: string, tab: TabState) => void;
  onTabCreated?: (tabId: string, parentTabId?: string, linkedField?: string) => void;
}

let tabIdCounter = 0;

/**
 * Génère un ID unique pour un onglet
 */
function generateTabId(): string {
  return `tab-${Date.now()}-${++tabIdCounter}`;
}

/**
 * Hook de gestion des onglets de formulaire
 */
export function useFormTabs(options: UseFormTabsOptions = {}) {
  const { initialTabs = [], onTabClose, onTabCreated } = options;

  const [tabs, setTabs] = useState<TabState[]>(initialTabs);
  const [activeTabId, setActiveTabId] = useState<string | null>(initialTabs.length > 0 ? initialTabs[0].id : null);

  // Onglet actif
  const activeTab = useMemo(() => {
    return tabs.find((t) => t.id === activeTabId);
  }, [tabs, activeTabId]);

  // Ajouter un onglet
  const addTab = useCallback(
    (tab: Omit<TabState, 'isDirty'>): string => {
      const newTab: TabState = {
        ...tab,
        id: tab.id || generateTabId(),
        isDirty: false,
      };

      setTabs((prev) => [...prev, newTab]);
      setActiveTabId(newTab.id);

      if (onTabCreated) {
        onTabCreated(newTab.id, newTab.parentTabId, newTab.linkedField);
      }

      return newTab.id;
    },
    [onTabCreated],
  );

  // Supprimer un onglet
  const removeTab = useCallback(
    (tabId: string): boolean => {
      const tabToRemove = tabs.find((t) => t.id === tabId);
      if (!tabToRemove) return false;

      // Notifier avant la suppression
      if (onTabClose) {
        onTabClose(tabId, tabToRemove);
      }

      setTabs((prev) => {
        const newTabs = prev.filter((t) => t.id !== tabId);

        // Si on supprime l'onglet actif, activer le précédent ou le premier
        if (activeTabId === tabId && newTabs.length > 0) {
          const removedIndex = prev.findIndex((t) => t.id === tabId);
          const newActiveIndex = Math.max(0, removedIndex - 1);
          setActiveTabId(newTabs[newActiveIndex]?.id || null);
        } else if (newTabs.length === 0) {
          setActiveTabId(null);
        }

        return newTabs;
      });

      return true;
    },
    [tabs, activeTabId, onTabClose],
  );

  // Définir l'onglet actif
  const setActiveTab = useCallback((tabId: string) => {
    setActiveTabId(tabId);
  }, []);

  // Mettre à jour les données d'un onglet
  const updateTabData = useCallback((tabId: string, data: Record<string, any>) => {
    setTabs((prev) => prev.map((t) => (t.id === tabId ? { ...t, data, isDirty: true } : t)));
  }, []);

  // Marquer un onglet comme dirty ou non
  const setTabDirty = useCallback((tabId: string, isDirty: boolean) => {
    setTabs((prev) => prev.map((t) => (t.id === tabId ? { ...t, isDirty } : t)));
  }, []);

  // Mettre à jour le titre d'un onglet
  const updateTabTitle = useCallback((tabId: string, title: string) => {
    setTabs((prev) => prev.map((t) => (t.id === tabId ? { ...t, title } : t)));
  }, []);

  // Obtenir un onglet par son ID
  const getTab = useCallback(
    (tabId: string): TabState | undefined => {
      return tabs.find((t) => t.id === tabId);
    },
    [tabs],
  );

  // Vérifier s'il y a des changements non sauvegardés
  const hasUnsavedChanges = useCallback((): boolean => {
    return tabs.some((t) => t.isDirty);
  }, [tabs]);

  // Fermer un onglet avec confirmation si dirty
  const closeTabWithConfirm = useCallback(
    async (tabId: string): Promise<boolean> => {
      const tab = tabs.find((t) => t.id === tabId);
      if (!tab) return false;

      if (tab.isDirty) {
        const confirmed = window.confirm('Vous avez des modifications non sauvegardées. Voulez-vous vraiment fermer cet onglet ?');
        if (!confirmed) return false;
      }

      return removeTab(tabId);
    },
    [tabs, removeTab],
  );

  // Actions
  const actions: TabActions = {
    addTab,
    removeTab,
    setActiveTab,
    updateTabData,
    setTabDirty,
    updateTabTitle,
    getTab,
    hasUnsavedChanges,
    closeTabWithConfirm,
  };

  return {
    tabs,
    activeTab,
    activeTabId,
    actions,
  };
}

export default useFormTabs;
