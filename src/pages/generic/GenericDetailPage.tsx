import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { motion, Variants } from 'framer-motion';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react';
import { LongCarrousel, FullCarrousel } from '@/components/ui/Carrousels';
import { KeywordsCard } from '@/components/features/conference/KeywordsCards';
import { Layouts } from '@/components/layout/Layouts';
import { SmConfCard } from '@/components/ui/ConfCards';
import { SearchModal, SearchModalRef } from '@/components/features/search/SearchModal';
import { ArrowIcon } from '@/components/ui/icons';
import CommentSection from '@/components/layout/CommentSection';
import { DynamicBreadcrumbs } from '@/components/layout/DynamicBreadcrumbs';
import { GenericDetailPageConfig } from './config';
import { generateSmartRecommendations } from './helpers';

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
export const GenericDetailPage: React.FC<GenericDetailPageProps> = ({ config }) => {
  const { id } = useParams<{ id: string }>();

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
  const [selected, setSelected] = useState(config.defaultView || config.viewOptions[0]?.key || '');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [equalHeight, setEqualHeight] = useState<number | null>(null);

  // Refs
  const firstDivRef = useRef<HTMLDivElement>(null);
  const searchModalRef = useRef<SearchModalRef>(null);

  const handleOptionSelect = (optionKey: string) => {
    setSelected(optionKey);
    setIsDropdownOpen(false);
  };

  // Sync height
  useEffect(() => {
    if (firstDivRef.current) {
      setEqualHeight(firstDivRef.current.clientHeight);
    }
  }, [loading]);

  // Fetch data
  const fetchData = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    try {
      const result = await config.dataFetcher(id);

      setItemDetails(result.itemDetails);
      setKeywords(result.keywords || []);
      setViewData(result.viewData || {});

      // Fetch recommendations - soit via la méthode classique, soit via smart recommendations
      setLoadingRecommendations(true);

      try {
        let recs: any[] = [];

        // 1. Méthode classique avec IDs de recommandations
        if (result.recommendations && result.recommendations.length > 0 && config.fetchRecommendations) {
          recs = await config.fetchRecommendations(result.recommendations);
        }
        // 2. Smart recommendations (nouveau système)
        else if (config.smartRecommendations) {
          recs = await generateSmartRecommendations(result.itemDetails, config.smartRecommendations);
        }

        setRecommendations(recs || []);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        setRecommendations([]);
      } finally {
        setLoadingRecommendations(false);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setItemDetails(null);
    } finally {
      setLoading(false);
    }
  }, [id, config]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Synchronize selected view with config changes
  useEffect(() => {
    setSelected(config.defaultView || config.viewOptions[0]?.key || '');
  }, [config.defaultView, config.viewOptions]);

  const handleKeywordClick = (searchTerm: string) => {
    searchModalRef.current?.openWithSearch(searchTerm);
  };

  // Render content based on selected view
  const renderedContent = useMemo(() => {
    if (!itemDetails) {
      return <div>Loading...</div>;
    }

    const viewOption = config.viewOptions.find((opt) => opt.key === selected);
    if (!viewOption || !viewOption.renderContent) {
      return null;
    }

    const content = viewOption.renderContent({
      itemDetails,
      viewData,
      loading,
      onTimeChange: handleTimeChange,
    });

    // Return null if content is null or undefined
    return content || null || undefined;
  }, [itemDetails, selected, viewData, loading, config.viewOptions]);

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
    if (!viewOption || !viewOption.renderContent) {
      return false;
    }

    const content = viewOption.renderContent({
      itemDetails,
      viewData,
      loading: false,
      onTimeChange: handleTimeChange,
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

    // Filter views to only include those with content
    return config.viewOptions.filter((viewOption) => viewHasContent(viewOption));
  }, [itemDetails, loading, config.viewOptions, viewData]);

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
  const sortedKeywords = useMemo(() => {
    if (!keywords || keywords.length === 0) return [];
    return [...keywords].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  }, [keywords]);

  return (
    <Layouts className='grid grid-cols-10 col-span-10 gap-50'>
      {/* Colonne principale */}
      <motion.div ref={firstDivRef} className={`${leftColumnSpan} flex flex-col gap-25 h-fit`} variants={fadeIn}>
        {/* Breadcrumbs dynamiques */}
        <DynamicBreadcrumbs itemTitle={itemDetails?.titre || itemDetails?.title || itemDetails?.name} underline='hover' />
        {/* Keywords carousel */}
        {!loading && config.showKeywords && sortedKeywords?.length > 0 && (
          <LongCarrousel
            perPage={3}
            perMove={1}
            autowidth={true}
            data={sortedKeywords}
            renderSlide={(item) => <KeywordsCard key={item.id || item.title} onSearchClick={handleKeywordClick} word={item.title} description={item.short_resume} />}
          />
        )}

        {/* Overview Card */}
        {loading ? (
          OverviewSkeleton ? (
            <OverviewSkeleton />
          ) : (
            <div>Loading...</div>
          )
        ) : itemDetails ? (
          <OverviewComponent {...config.mapOverviewProps(itemDetails, currentVideoTime)} type={config.type} />
        ) : null}

        {/* Details Card */}
        {loading ? DetailsSkeleton ? <DetailsSkeleton /> : <div>Loading...</div> : itemDetails ? <DetailsComponent {...config.mapDetailsProps(itemDetails)} /> : null}
      </motion.div>

      {/* Colonne secondaire - Vues multiples */}
      {shouldShowRightColumn && hasRenderedContent && (
        <motion.div style={{ height: equalHeight || 'auto' }} className='col-span-10 lg:col-span-4 flex flex-col gap-50 overflow-hidden' variants={fadeIn}>
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
                      {availableViews.map((option) => (
                        <DropdownItem key={option.key} className={`p-0 ${selected === option.key ? 'bg-action' : ''}`} onClick={() => handleOptionSelect(option.key)}>
                          <div
                            className={`flex items-center w-full px-15 py-10 rounded-8 transition-all ease-in-out duration-200 hover:bg-c3 ${
                              selected === option.key ? 'bg-action text-selected font-medium' : 'text-c6'
                            }`}>
                            <span className='text-16'>{option.title}</span>
                          </div>
                        </DropdownItem>
                      ))}
                    </DropdownMenu>
                  </Dropdown>
                </div>
              )}
            </div>

            {/* Contenu de la vue sélectionnée */}
            <div className='flex-grow min-h-0 overflow-auto'>{renderedContent}</div>
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
    </Layouts>
  );
};
