import React, { useEffect, useState, useMemo } from 'react';
import { Progress } from '@heroui/react';
import { Database, CheckCircle, AlertTriangle, LayoutDashboard, ArrowRight, ExternalLink, Tag } from 'lucide-react';
import { ViewLoader } from './ViewLoader';
import {
  getOverview,
  getCompletenessStats,
  getOrphanResources,
  getCoverageMatrix,
  type OverviewData,
  type CompletenessStatsData,
  type OrphanResourcesData,
  type CoverageMatrixData,
  type TypeCount,
  type TypeCompleteness,
} from '@/services/Analytics';
import { calculateOverallCompleteness, getMostActiveType, getCompletenessColor, formatNumber, calculatePercentage } from '../../utils/dashboardHelpers';

// ========================================
// INTERFACES
// ========================================

interface DashboardData {
  overview: OverviewData;
  completeness: CompletenessStatsData;
  orphans: OrphanResourcesData;
  keywords: CoverageMatrixData;
}

export type DashboardView = 'overview' | 'distribution' | 'completeness' | 'orphans';

interface DashboardProps {
  currentView?: DashboardView;
  onViewChange?: (view: DashboardView) => void;
}

// ========================================
// SOUS-COMPOSANTS
// ========================================

/**
 * Vue d'ensemble - Cartes de statistiques + navigation vers autres vues
 */
const OverviewView: React.FC<{
  data: DashboardData;
  onNavigate: (view: DashboardView) => void;
}> = ({ data, onNavigate }) => {
  const stats = useMemo(() => {
    const mostActive = getMostActiveType(data.overview);
    const activeTypes = data.overview.types.filter((t) => t.count > 0);

    return {
      total: data.overview.total,
      typeCount: data.overview.types.length,
      activeTypeCount: activeTypes.length,
      mostActive,
      mostActivePercent: mostActive ? calculatePercentage(mostActive.count, data.overview.total) : 0,
      completeness: calculateOverallCompleteness(data.completeness),
      orphans: data.orphans.totalOrphans,
      orphansPercent: calculatePercentage(data.orphans.totalOrphans, data.overview.total),
    };
  }, [data]);

  return (
    <div className='flex-1 w-full bg-c1 overflow-auto p-6'>
      {/* Navigation Cards - Cliquables */}
      <div className='grid grid-cols-3 gap-5 mb-5'>
        {/* Card Total ressources → Distribution */}
        <button onClick={() => onNavigate('distribution')} className='bg-c2 rounded-xl p-5 border border-c3 hover:border-datavisBlue/50 transition-all text-left group'>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-2.5'>
              <div className='w-10 h-10 rounded-lg bg-datavisBlue/15 flex items-center justify-center'>
                <Database size={20} className='text-datavisBlue' />
              </div>
              <span className='text-c5 text-sm'>Total ressources</span>
            </div>
            <ArrowRight size={16} className='text-c4 group-hover:text-datavisBlue group-hover:translate-x-px transition-all' />
          </div>
          <p className='text-c6 text-3xl font-bold tracking-tight'>{formatNumber(stats.total)}</p>
          <p className='text-c4 text-xs mt-8'>
            {stats.typeCount} types · {stats.activeTypeCount} actifs
          </p>
          {stats.mostActive && (
            <div className='mt-2.5 pt-2.5 border-t border-c3'>
              <p className='text-c5 text-xs'>
                Top: <span className='text-datavisBlue font-medium'>{stats.mostActive.label}</span> ({stats.mostActivePercent}%)
              </p>
            </div>
          )}
        </button>

        {/* Card Complétude */}
        <button onClick={() => onNavigate('completeness')} className='bg-c2 rounded-xl p-5 border border-c3 hover:border-datavisGreen/50 transition-all text-left group'>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-2.5'>
              <div className='w-10 h-10 rounded-lg bg-datavisGreen/15 flex items-center justify-center'>
                <CheckCircle size={20} className='text-datavisGreen' />
              </div>
              <span className='text-c5 text-sm'>Complétude</span>
            </div>
            <ArrowRight size={16} className='text-c4 group-hover:text-datavisGreen group-hover:translate-x-px transition-all' />
          </div>
          <p className='text-c6 text-3xl font-bold tracking-tight'>{stats.completeness}%</p>
          <p className='text-c4 text-xs mt-8'>Qualité des métadonnées</p>
          <div className='mt-2.5 pt-2.5 border-t border-c3'>
            <Progress value={stats.completeness} color='success' size='md' radius='full' />
          </div>
        </button>

        {/* Card Ressources isolées */}
        <button onClick={() => onNavigate('orphans')} className='bg-c2 rounded-xl p-5 border border-c3 hover:border-datavisOrange/50 transition-all text-left group'>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-2.5'>
              <div className='w-10 h-10 rounded-lg bg-datavisOrange/15 flex items-center justify-center'>
                <AlertTriangle size={20} className='text-datavisOrange' />
              </div>
              <span className='text-c5 text-sm'>Ressources isolées</span>
            </div>
            <ArrowRight size={16} className='text-c4 group-hover:text-datavisOrange group-hover:translate-x-px transition-all' />
          </div>
          <p className='text-c6 text-3xl font-bold tracking-tight'>{stats.orphans}</p>
          <p className='text-c4 text-xs mt-8'>{stats.orphansPercent}% peu connectées</p>
          <div className='mt-2.5 pt-2.5 border-t border-c3'>
            <span className='text-datavisOrange text-xs font-medium'>≤2 connexions</span>
          </div>
        </button>
      </div>

      {/* Carte Thématiques - Non cliquable */}
      <div className='bg-c2 rounded-xl p-5 border border-c3'>
        <div className='flex items-center gap-2.5 mb-5'>
          <div className='w-10 h-10 rounded-lg bg-datavisYellow/15 flex items-center justify-center'>
            <Tag size={20} className='text-datavisYellow' />
          </div>
          <div>
            <span className='text-c6 text-sm font-medium'>Thématiques principales</span>
            <p className='text-c4 text-xs'>{data.keywords.keywords.length} mots-clés dans la base</p>
          </div>
        </div>
        <div className='grid grid-cols-2 gap-x-5 gap-y-2.5'>
          {data.keywords.keywords.slice(0, 10).map((kw, index) => (
            <div key={kw.keyword_id} className='flex items-center gap-2.5 bg-c3/50 rounded-lg px-6 py-8'>
              <span className='text-c4 text-xs font-medium w-5'>{index + 1}.</span>
              <span className='text-c6 text-base flex-1 font-medium truncate'>{kw.keyword_title}</span>
              <span className='text-datavisYellow text-xs font-bold'>{kw.usage_count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Vue Distribution - Liste des types avec leurs counts
 */
type SortMode = 'count' | 'name';

const DistributionView: React.FC<{ types: TypeCount[] }> = ({ types }) => {
  const [sortMode, setSortMode] = useState<SortMode>('count');
  const total = useMemo(() => types.reduce((sum, t) => sum + t.count, 0), [types]);

  const sortedTypes = useMemo(() => {
    const sorted = [...types];
    if (sortMode === 'count') {
      sorted.sort((a, b) => b.count - a.count);
    } else {
      sorted.sort((a, b) => a.label.localeCompare(b.label, 'fr'));
    }
    return sorted;
  }, [types, sortMode]);

  return (
    <div className='flex-1 w-full bg-c1 overflow-auto p-6'>
      {/* Sort controls */}
      <div className='flex items-center gap-2.5 mb-4'>
        <span className='text-c4 text-xs'>Trier par:</span>
        <button
          onClick={() => setSortMode('count')}
          className={`px-2.5 py-1.5 rounded-md text-xs transition-colors ${sortMode === 'count' ? 'bg-datavisBlue text-selected' : 'bg-c2 text-c5 hover:bg-c3'}`}>
          Quantité
        </button>
        <button
          onClick={() => setSortMode('name')}
          className={`px-2.5 py-1.5 rounded-md text-xs transition-colors ${sortMode === 'name' ? 'bg-datavisBlue text-selected' : 'bg-c2 text-c5 hover:bg-c3'}`}>
          Nom
        </button>
      </div>

      <div className='flex flex-col gap-4'>
        {sortedTypes.map((type) => {
          const percentage = calculatePercentage(type.count, total);
          return (
            <div key={type.type} className='bg-c2 rounded-lg p-4 border border-c3 hover:bg-c3 transition-colors flex items-center gap-4'>
              <div className='flex-1 min-w-0'>
                <p className='text-c6 text-sm font-medium truncate'>{type.label}</p>
              </div>
              <div className='w-48'>
                <Progress value={percentage} color='primary' size='lg' radius='md' />
              </div>
              <div className='w-20 text-right'>
                <p className='text-c6 text-sm font-bold'>{formatNumber(type.count)}</p>
                <p className='text-c4 text-xs'>{percentage.toFixed(1)}%</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Vue Complétude - Affichage par type avec propriétés dynamiques du Resource Template
 */
type CompletenessSortMode = 'completeness' | 'name';

const CompletenessView: React.FC<{ stats: TypeCompleteness[] }> = ({ stats }) => {
  const [expandedType, setExpandedType] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<CompletenessSortMode>('completeness');

  const activeStats = useMemo(() => {
    const filtered = stats.filter((type) => type.total > 0);
    if (sortMode === 'completeness') {
      filtered.sort((a, b) => b.overallCompleteness - a.overallCompleteness);
    } else {
      filtered.sort((a, b) => a.label.localeCompare(b.label, 'fr'));
    }
    return filtered;
  }, [stats, sortMode]);

  return (
    <div className='flex-1 w-full bg-c1 overflow-auto p-6'>
      {/* Sort controls */}
      <div className='flex items-center gap-2.5 mb-4'>
        <span className='text-c4 text-xs'>Trier par:</span>
        <button
          onClick={() => setSortMode('completeness')}
          className={`px-2.5 py-1.5 rounded-md text-xs transition-colors ${sortMode === 'completeness' ? 'bg-datavisBlue text-selected' : 'bg-c2 text-c5 hover:bg-c3'}`}>
          Complétude
        </button>
        <button
          onClick={() => setSortMode('name')}
          className={`px-2.5 py-1.5 rounded-md text-xs transition-colors ${sortMode === 'name' ? 'bg-datavisBlue text-selected' : 'bg-c2 text-c5 hover:bg-c3'}`}>
          Nom
        </button>
      </div>

      <div className='flex flex-col gap-4'>
        {activeStats.map((type) => {
          const isExpanded = expandedType === type.type;
          const properties = Object.entries(type.properties);

          return (
            <div key={type.type} className='bg-c2 rounded-lg border border-c3 overflow-hidden'>
              {/* Type Header - Clickable */}
              <button onClick={() => setExpandedType(isExpanded ? null : type.type)} className='w-full p-4 flex items-center gap-2.5 hover:bg-c3 transition-colors text-left'>
                <span className='text-c4 text-xs'>{isExpanded ? '▼' : '▶'}</span>
                <div className='flex-1 min-w-0'>
                  <p className='text-c6 text-sm font-medium truncate'>{type.label}</p>
                  <p className='text-c4 text-xs'>
                    {type.total} ressources · {type.templatePropertyCount} propriétés
                  </p>
                </div>
                <div className='w-36 flex items-center gap-8'>
                  <Progress
                    value={type.overallCompleteness}
                    color={type.overallCompleteness >= 70 ? 'success' : type.overallCompleteness >= 40 ? 'warning' : 'danger'}
                    size='lg'
                    radius='md'
                    className='flex-1'
                  />
                  <span className='text-c6 text-xs font-bold w-10 text-right'>{type.overallCompleteness.toFixed(0)}%</span>
                </div>
              </button>

              {/* Expanded Properties */}
              {isExpanded && (
                <div className='border-t border-c3'>
                  <table className='w-full'>
                    <thead>
                      <tr className='border-b border-c3'>
                        <th className='text-c4 text-xs font-normal text-left p-4 pl-10'>Propriété</th>
                        <th className='text-c4 text-xs font-normal text-center p-4 w-80'>Rempli</th>
                        <th className='text-c4 text-xs font-normal text-center p-4 w-80'>Manquant</th>
                        <th className='text-c4 text-xs font-normal p-4 w-48'>Complétude</th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-c3'>
                      {properties.map(([propName, propData]) => {
                        const color = getCompletenessColor(propData.percentage);
                        return (
                          <tr key={propName} className='hover:bg-c3 transition-colors'>
                            <td className='text-c6 text-xs p-4 pl-10'>
                              {propData.label}
                              <span className='text-c4 text-xs ml-1.5'>({propName})</span>
                            </td>
                            <td className='text-datavisGreen text-xs text-center p-4 font-bold'>{propData.filled}</td>
                            <td className='text-c4 text-xs text-center p-4'>{propData.missing}</td>
                            <td className='p-4'>
                              <div className='flex items-center gap-1.5'>
                                <Progress value={propData.percentage} style={{ '--heroui-primary': color } as React.CSSProperties} size='lg' radius='md' className='flex-1' />
                                <span className='text-c6 text-xs w-10 text-right'>{propData.percentage.toFixed(0)}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Vue Ressources isolées
 */
const OrphansView: React.FC<{ orphans: OrphanResourcesData }> = ({ orphans }) => {
  // Fonction pour afficher le label du type (gère "unknown" → "Type inconnu")
  const getTypeLabel = (label: string, type: string) => {
    if (type === 'unknown' || label === 'unknown') return 'Type inconnu';
    return label;
  };

  return (
    <div className='flex-1 w-full bg-c1 overflow-auto p-6'>
      {orphans.byType.length > 0 ? (
        <div className='flex flex-col gap-4'>
          {orphans.byType.map((typeGroup) => (
            <div key={typeGroup.type} className='bg-c2 rounded-lg p-4 border border-c3'>
              <div className='flex items-center justify-between mb-2.5'>
                <span className='text-c6 text-sm font-medium'>{getTypeLabel(typeGroup.label, typeGroup.type)}</span>
                <span className='text-c4 text-xs'>{typeGroup.count} isolées</span>
              </div>
              <div className='flex flex-col gap-8'>
                {typeGroup.items.map((item) => (
                  <div key={item.id} className='bg-c3 rounded-md p-2.5 flex items-center justify-between hover:bg-c4/20 transition-colors'>
                    <div className='flex-1 min-w-0'>
                      <p className='text-c6 text-xs truncate'>{item.title}</p>
                      <p className='text-c4 text-xs'>ID: {item.id}</p>
                    </div>
                    <div className='flex items-center gap-2.5'>
                      <span className='text-orange-500 text-xs'>{item.link_count} conn.</span>
                      <a
                        href={`https://tests.arcanes.ca/omk/admin/item/${item.id}`}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-c4 hover:text-datavisBlue transition-colors'
                        title='Ouvrir dans Omeka S'>
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className='p-5 text-center'>
          <CheckCircle size={32} className='text-datavisGreen mx-auto mb-2.5' />
          <p className='text-c6 font-medium text-sm'>Aucune ressource isolée</p>
        </div>
      )}
    </div>
  );
};

// ========================================
// COMPOSANT PRINCIPAL
// ========================================

export const Dashboard: React.FC<DashboardProps> = ({ currentView: externalView, onViewChange }) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [internalView, setInternalView] = useState<DashboardView>('overview');

  // Utiliser la vue externe si fournie, sinon la vue interne
  const currentView = externalView ?? internalView;
  const setCurrentView = (view: DashboardView) => {
    if (onViewChange) {
      onViewChange(view);
    } else {
      setInternalView(view);
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [overview, completeness, orphans, keywords] = await Promise.all([getOverview(), getCompletenessStats(), getOrphanResources(2), getCoverageMatrix(10)]);
        setData({ overview, completeness, orphans, keywords });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllData();
  }, []);

  return (
    <ViewLoader
      isLoading={isLoading}
      error={error}
      isEmpty={!data || data.overview.total === 0}
      icon={<LayoutDashboard />}
      title='Aucune donnée'
      emptyMessage='Aucune donnée disponible dans le tableau de bord.'
      loadingMessage='Chargement du tableau de bord...'>
      <div className='flex-1 w-full h-full bg-c1 flex flex-col overflow-hidden'>
        {currentView === 'overview' && data && <OverviewView data={data} onNavigate={setCurrentView} />}
        {currentView === 'distribution' && data && <DistributionView types={data.overview.types} />}
        {currentView === 'completeness' && data && <CompletenessView stats={data.completeness.stats} />}
        {currentView === 'orphans' && data && <OrphansView orphans={data.orphans} />}
      </div>
    </ViewLoader>
  );
};

export default Dashboard;
