import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { GenericDetailPageConfig } from './config';

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
  const [currentVideoTime] = useState<number>(0);
  const [itemDetails, setItemDetails] = useState<any>(null);
  const [keywords, setKeywords] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [viewData, setViewData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);
  const [selected, setSelected] = useState(config.viewOptions[0]?.key || '');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [equalHeight, setEqualHeight] = useState<number | null>(null);

  // Refs
  const firstDivRef = useRef<HTMLDivElement>(null);
  const searchModalRef = useRef<SearchModalRef>(null);

  // Selected option
  const selectedOption = config.viewOptions.find((option) => option.key === selected);

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

      // Fetch recommendations si disponibles
      if (result.recommendations && result.recommendations.length > 0) {
        setLoadingRecommendations(true);
        try {
          const recs = await config.fetchRecommendations?.(result.recommendations);
          setRecommendations(recs || []);
        } catch (error) {
          console.error('Error fetching recommendations:', error);
          setRecommendations([]);
        } finally {
          setLoadingRecommendations(false);
        }
      } else {
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

  const handleKeywordClick = (searchTerm: string) => {
    searchModalRef.current?.openWithSearch(searchTerm);
  };

  // Render content based on selected view
  const renderContent = () => {
    if (!itemDetails) {
      return <div>Loading...</div>;
    }

    const viewOption = config.viewOptions.find((opt) => opt.key === selected);
    if (!viewOption || !viewOption.renderContent) {
      return null;
    }

    return viewOption.renderContent({
      itemDetails,
      viewData,
      loading,
    });
  };

  const OverviewComponent = config.overviewComponent;
  const DetailsComponent = config.detailsComponent;
  const OverviewSkeleton = config.overviewSkeleton;
  const DetailsSkeleton = config.detailsSkeleton;

  return (
    <Layouts className='grid grid-cols-10 col-span-10 gap-50'>
      {/* Colonne principale */}
      <motion.div ref={firstDivRef} className='col-span-10 lg:col-span-6 flex flex-col gap-25 h-fit' variants={fadeIn}>
        {/* Keywords carousel */}
        {!loading && config.showKeywords && keywords?.length > 0 && (
          <LongCarrousel
            perPage={3}
            perMove={1}
            autowidth={true}
            data={keywords}
            renderSlide={(item) => <KeywordsCard key={item.id || item.title} onSearchClick={handleKeywordClick} word={item.title} />}
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
          <OverviewComponent {...config.mapOverviewProps(itemDetails, currentVideoTime)} />
        ) : null}

        {/* Details Card */}
        {loading ? DetailsSkeleton ? <DetailsSkeleton /> : <div>Loading...</div> : itemDetails ? <DetailsComponent {...config.mapDetailsProps(itemDetails)} /> : null}
      </motion.div>

      {/* Colonne secondaire - Vues multiples */}
      <motion.div style={{ height: equalHeight || 'auto' }} className='col-span-10 lg:col-span-4 flex flex-col gap-50 overflow-hidden' variants={fadeIn}>
        <div className='flex w-full flex-col gap-20 flex-grow min-h-0 overflow-hidden'>
          {/* Header avec titre et dropdown */}
          <div className='flex items-center justify-between w-full'>
            <h2 className='text-24 font-medium text-c6'>{selectedOption?.title}</h2>

            {config.viewOptions.length > 1 && (
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
                    {config.viewOptions.map((option) => (
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
          <div className='flex-grow min-h-0 overflow-auto'>{renderContent()}</div>
        </div>
      </motion.div>

      {/* Recommendations */}
      {config.showRecommendations && !loadingRecommendations && recommendations.length > 0 && (
        <motion.div className='col-span-10 h-full lg:col-span-6 flex flex-col gap-50 flex-grow' variants={fadeIn}>
          <FullCarrousel
            title={config.recommendationsTitle || 'Recommandations'}
            perPage={2}
            perMove={1}
            data={recommendations}
            renderSlide={(item) => (
              <motion.div initial='hidden' animate='visible' variants={fadeIn} key={item.id}>
                <SmConfCard {...item} />
              </motion.div>
            )}
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
