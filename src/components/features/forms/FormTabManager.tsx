import React, { useState, useCallback } from 'react';
import { Button, Tooltip } from '@heroui/react';
import { CrossIcon, PlusIcon } from '@/components/ui/icons';
import { GenericDetailPage } from '@/pages/generic/GenericDetailPage';
import { FormTabConfig, GenericDetailPageConfig } from '@/pages/generic/config';

interface FormTabManagerProps {
  initialTabs?: FormTabConfig[];
  onTabClose?: (tabId: string) => void;
  onTabChange?: (tabId: string) => void;
  onSave?: (tabId: string, data: any) => Promise<void>;
  configs: Record<string, GenericDetailPageConfig>; // Map of resourceType to config
}

/**
 * Gestionnaire d'onglets pour l'édition/création de ressources
 * Permet d'ouvrir plusieurs ressources en édition simultanément
 */
export const FormTabManager: React.FC<FormTabManagerProps> = ({ initialTabs = [], onTabClose, onTabChange, onSave, configs }) => {
  const [tabs, setTabs] = useState<FormTabConfig[]>(initialTabs);
  const [activeTabId, setActiveTabId] = useState<string>(initialTabs[0]?.id || '');

  // Generate unique tab ID
  const generateTabId = () => `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Add a new tab
  const addTab = useCallback((config: Omit<FormTabConfig, 'id'>) => {
    const newTab: FormTabConfig = {
      ...config,
      id: generateTabId(),
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
    return newTab.id;
  }, []);

  // Close a tab
  const closeTab = useCallback(
    (tabId: string) => {
      const tab = tabs.find((t) => t.id === tabId);

      // Check if tab has unsaved changes
      if (tab?.isDirty) {
        const confirmClose = window.confirm('Cette ressource a des modifications non sauvegardées. Voulez-vous vraiment fermer cet onglet ?');
        if (!confirmClose) return;
      }

      setTabs((prev) => {
        const newTabs = prev.filter((t) => t.id !== tabId);

        // If we closed the active tab, activate another one
        if (activeTabId === tabId && newTabs.length > 0) {
          const closedIndex = prev.findIndex((t) => t.id === tabId);
          const newActiveIndex = Math.min(closedIndex, newTabs.length - 1);
          setActiveTabId(newTabs[newActiveIndex].id);
        }

        return newTabs;
      });

      onTabClose?.(tabId);
    },
    [tabs, activeTabId, onTabClose],
  );

  // Switch to a tab
  const switchTab = useCallback(
    (tabId: string) => {
      setActiveTabId(tabId);
      onTabChange?.(tabId);
    },
    [onTabChange],
  );

  // Mark tab as dirty
  const markTabDirty = useCallback((tabId: string, isDirty: boolean) => {
    setTabs((prev) => prev.map((t) => (t.id === tabId ? { ...t, isDirty } : t)));
  }, []);

  // Handle save for a tab
  const handleSave = useCallback(
    async (tabId: string, data: any) => {
      if (onSave) {
        await onSave(tabId, data);
      }

      // Get the tab to check if it has a parent
      const tab = tabs.find((t) => t.id === tabId);
      if (tab?.parentTabId && tab.linkedField) {
        // Update the parent tab with the new linked resource
        setTabs((prev) =>
          prev.map((t) => {
            if (t.id === tab.parentTabId) {
              // Mark parent as dirty since we added a linked resource
              return { ...t, isDirty: true };
            }
            return t;
          }),
        );
      }

      // Mark as not dirty after successful save
      markTabDirty(tabId, false);
    },
    [onSave, tabs, markTabDirty],
  );

  // Handle creating a new resource from within a tab
  const handleCreateNewResource = useCallback(
    (viewKey: string, _resourceTemplateId?: number) => {
      // Find the config for this resource type
      // For now, we'll use a simple mapping based on viewKey
      const resourceTypeMap: Record<string, string> = {
        Feedback: 'feedback',
        Outils: 'tool',
        personnes: 'actant',
        actants: 'actant',
        keywords: 'keyword',
      };

      const resourceType = resourceTypeMap[viewKey];
      if (!resourceType || !configs[resourceType]) {
        console.warn(`No config found for resource type: ${viewKey}`);
        return;
      }

      // Add new tab for creating the resource
      const newTabId = addTab({
        title: `Nouveau: ${viewKey}`,
        resourceType,
        config: configs[resourceType],
        mode: 'create',
        parentTabId: activeTabId,
        linkedField: viewKey,
      });

      return newTabId;
    },
    [configs, activeTabId, addTab],
  );

  // Get truncated title for tab
  const getTruncatedTitle = (title: string, maxLength = 20) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + '...';
  };

  // Get the active tab's config
  const activeTab = tabs.find((t) => t.id === activeTabId);

  if (tabs.length === 0) {
    return (
      <div className='flex items-center justify-center h-64 bg-c2 rounded-12'>
        <p className='text-c4'>Aucun onglet ouvert</p>
      </div>
    );
  }

  return (
    <div className='flex flex-col h-full'>
      {/* Tab bar */}
      <div className='flex items-center gap-1 bg-c2 border-b border-c3 px-4 py-2 overflow-x-auto'>
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-t-8
              cursor-pointer transition-all duration-200
              ${activeTabId === tab.id ? 'bg-c1 text-c6 border-t border-l border-r border-c3' : 'bg-c3 text-c5 hover:bg-c4'}
            `}
            onClick={() => switchTab(tab.id)}>
            <Tooltip content={tab.title}>
              <span className='text-14 font-medium whitespace-nowrap'>
                {getTruncatedTitle(tab.title)}
                {tab.isDirty && <span className='text-action ml-1'>*</span>}
              </span>
            </Tooltip>
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
              className='p-1 rounded-full hover:bg-c5 hover:text-c1 transition-colors'>
              <CrossIcon size={12} />
            </button>
          </div>
        ))}

        {/* Add new tab button */}
        <Button
          isIconOnly
          size='sm'
          className='bg-transparent text-c5 hover:bg-c3 rounded-full ml-2'
          onPress={() => {
            // This could open a modal to select which resource type to create
            console.log('Add new tab clicked');
          }}>
          <PlusIcon size={14} />
        </Button>
      </div>

      {/* Tab content */}
      <div className='flex-1 overflow-auto'>
        {activeTab && (
          <GenericDetailPage
            key={activeTab.id}
            config={activeTab.config}
            initialMode={activeTab.mode}
            onSave={(data) => handleSave(activeTab.id, data)}
            onCancel={() => closeTab(activeTab.id)}
            onCreateNewResource={handleCreateNewResource}
          />
        )}
      </div>
    </div>
  );
};

export default FormTabManager;
