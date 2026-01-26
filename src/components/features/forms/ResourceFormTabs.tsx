import React from 'react';
import { Tabs, Tab } from '@heroui/react';
import { CrossIcon, ExperimentationIcon, SettingsIcon, CitationIcon, BookIcon } from '@/components/ui/icons';

/**
 * Info minimale d'un onglet pour l'affichage
 */
export interface ResourceTabInfo {
  id: string;
  title: string; // "Expérimentation", "Outil", etc.
  isDirty: boolean;
}

interface ResourceFormTabsProps {
  tabs: ResourceTabInfo[];
  activeTabId: string;
  onTabChange: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
}

// Icônes par type de ressource
const RESOURCE_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Expérimentation: ExperimentationIcon,
  Outil: SettingsIcon,
  "Retour d'expérience": CitationIcon,
  Bibliographie: BookIcon,
};

/**
 * Barre d'onglets pour la navigation entre ressources en cours d'édition/création
 * Style copié de AdminDashboard.tsx
 */
export const ResourceFormTabs: React.FC<ResourceFormTabsProps> = ({ tabs, activeTabId, onTabChange, onTabClose }) => {
  return (
    <div className='col-span-10'>
      <Tabs
        aria-label='Navigation ressources'
        selectedKey={activeTabId}
        onSelectionChange={(key) => onTabChange(String(key))}
        classNames={{
          tabList: 'bg-c2 p-1 rounded-12',
          cursor: 'bg-c4',
          tab: 'h-10 px-6 min-h-[40px]',
          tabContent: 'group-data-[selected=true]:text-selected text-c5 min-h-[40px] flex items-center',
        }}>
        {tabs.map((tab) => {
          const Icon = RESOURCE_ICONS[tab.title] || ExperimentationIcon;
          return (
            <Tab
              key={tab.id}
              title={
                <div className='flex items-center gap-2'>
                  <Icon size={18} />
                  <span>
                    {tab.title}
                    {tab.isDirty && ' *'}
                  </span>
                  {tabs.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTabClose(tab.id);
                      }}
                      className='ml-2 p-1 rounded-full hover:bg-c3 transition-colors'>
                      <CrossIcon size={12} />
                    </button>
                  )}
                </div>
              }
            />
          );
        })}
      </Tabs>
    </div>
  );
};

export default ResourceFormTabs;
