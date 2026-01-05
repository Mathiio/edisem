import { useState } from 'react';
import {
  Pencil,
  Plus,
  MessageSquare,
  Eye,
  PenTool,
  ChevronDown,
  ChevronRight,
  LibraryBig,
  Network,
  Palette,
  Grid3X3,
  Calendar,
  LayoutDashboard,
  Maximize,
  Minimize,
} from 'lucide-react';
import { SearchIcon } from '@/components/ui/icons';
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarSeparator, useSidebar } from '@/components/ui/AppSidebar';
import { useAuth } from '@/hooks/useAuth';

interface DatavisSidebarProps {
  activeView: 'datavis' | 'cahiers' | 'create' | 'radialTree' | 'oeuvres' | 'coverageMatrix' | 'activityHeatmap' | 'dashboard';
  onShowDatavis: () => void;
  onShowCahiers: () => void;
  onShowCreate: () => void;
  onShowRadialTree: () => void;
  onShowOeuvres: () => void;
  onShowCoverageMatrix?: () => void;
  onShowActivityHeatmap?: () => void;
  onShowDashboard?: () => void;
  // Modes outils
  isEditMode: boolean;
  isLinkMode: boolean;
  isAnnoteMode: boolean;
  annotationViewMode: boolean; // true = écrire, false = voir
  onEditToggle: (active: boolean) => void;
  onLinkToggle: (active: boolean) => void;
  onAnnoteToggle: (active: boolean, viewMode: boolean) => void;
  // Disponibilité des outils (désactivés si pas de visualisation)
  toolsEnabled: boolean;
  // Fullwidth
  isFullWidth?: boolean;
  onFullWidthToggle?: (value: boolean) => void;
}

export const DatavisSidebar = ({
  activeView,
  onShowDatavis,
  onShowCahiers,
  onShowCreate,
  onShowRadialTree,
  onShowOeuvres,
  onShowCoverageMatrix,
  onShowActivityHeatmap,
  onShowDashboard,
  isEditMode,
  isLinkMode,
  isAnnoteMode,
  annotationViewMode,
  onEditToggle,
  onLinkToggle,
  onAnnoteToggle,
  toolsEnabled,
  isFullWidth = false,
  onFullWidthToggle,
}: DatavisSidebarProps) => {
  const [annotationMenuOpen, setAnnotationMenuOpen] = useState(false);
  const { isCollapsed } = useSidebar();
  const { userData } = useAuth();

  const isActant = userData?.type === 'actant';

  const handleModeToggle = (mode: 'edit' | 'link') => {
    // Désactiver tous les autres modes quand on en active un
    if (mode === 'edit') {
      onEditToggle(!isEditMode);
      if (!isEditMode) {
        onLinkToggle(false);
        onAnnoteToggle(false, false);
      }
    } else if (mode === 'link') {
      onLinkToggle(!isLinkMode);
      if (!isLinkMode) {
        onEditToggle(false);
        onAnnoteToggle(false, false);
      }
    }
  };

  const handleAnnotationMode = (viewMode: boolean) => {
    // viewMode: true = écrire, false = voir
    onEditToggle(false);
    onLinkToggle(false);
    onAnnoteToggle(true, viewMode);
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Exploration</SidebarGroupLabel>
          <SidebarMenu>
            {/* Recherche avec sous-menu */}
            <div className='flex flex-col'>
              <SidebarMenuItem icon={<SearchIcon size={15} />} label='Recherche' onClick={onShowDatavis} isActive={activeView === 'datavis'} />
              {!isCollapsed && (
                <div
                  className={`ml-20 flex flex-col gap-2 overflow-hidden transition-all duration-300 ease-in-out ${
                    activeView === 'datavis' || activeView === 'create' ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0'
                  }`}>
                  <SidebarMenuItem
                    icon={<Plus size={14} className={activeView === 'create' ? 'text-datavisGreen' : ''} />}
                    label='Créer un élément'
                    onClick={onShowCreate}
                    isActive={activeView === 'create'}
                  />
                  {isActant && (
                    <SidebarMenuItem
                      icon={<Pencil size={14} className={isEditMode ? 'text-datavisOrange' : ''} />}
                      label='Mode édition'
                      onClick={() => handleModeToggle('edit')}
                      isActive={isEditMode}
                      disabled={!toolsEnabled}
                    />
                  )}
                  {/* Sous-menu Annotations */}
                  <div className='flex flex-col'>
                    <SidebarMenuItem
                      icon={<MessageSquare size={14} className={isAnnoteMode ? 'text-datavisYellow' : ''} />}
                      label='Annotations'
                      onClick={() => setAnnotationMenuOpen(!annotationMenuOpen)}
                      isActive={isAnnoteMode}
                      disabled={!toolsEnabled}
                      suffix={annotationMenuOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    />
                    {annotationMenuOpen && toolsEnabled && (
                      <div className='ml-16 flex flex-col gap-2 mt-2'>
                        <SidebarMenuItem
                          icon={<Eye size={12} className={isAnnoteMode && !annotationViewMode ? 'text-datavisYellow' : ''} />}
                          label='Voir'
                          onClick={() => handleAnnotationMode(false)}
                          isActive={isAnnoteMode && !annotationViewMode}
                        />
                        <SidebarMenuItem
                          icon={<PenTool size={12} className={isAnnoteMode && annotationViewMode ? 'text-datavisYellow' : ''} />}
                          label='Écrire'
                          onClick={() => handleAnnotationMode(true)}
                          isActive={isAnnoteMode && annotationViewMode}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <SidebarMenuItem icon={<LibraryBig size={20} />} label='Cahier de recherche' onClick={onShowCahiers} isActive={activeView === 'cahiers'} />
          </SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Visualisations</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem icon={<Network size={18} />} label='Vue hiérarchique' onClick={onShowRadialTree} isActive={activeView === 'radialTree'} />
            <SidebarMenuItem icon={<Palette size={18} />} label='Mises en récits' onClick={onShowOeuvres} isActive={activeView === 'oeuvres'} />
          </SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Analytics</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem icon={<LayoutDashboard size={18} />} label='Tableau de bord' onClick={onShowDashboard} isActive={activeView === 'dashboard'} />
            <SidebarMenuItem icon={<Grid3X3 size={18} />} label='Matrice de couverture' onClick={onShowCoverageMatrix} isActive={activeView === 'coverageMatrix'} />
            <SidebarMenuItem icon={<Calendar size={18} />} label='Calendrier activité' onClick={onShowActivityHeatmap} isActive={activeView === 'activityHeatmap'} />
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem
            icon={isFullWidth ? <Minimize size={18} /> : <Maximize size={18} />}
            label={isFullWidth ? 'Réduire' : 'Pleine largeur'}
            onClick={() => onFullWidthToggle?.(!isFullWidth)}
          />
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};
