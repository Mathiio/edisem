import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getElementNarratifs } from '@/services/Items';
import { motion, Variants } from 'framer-motion';
import { FullCarrousel, LongCarrousel } from '@/components/ui/Carrousels';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react';
import { KeywordsCard } from '@/components/features/conference/KeywordsCards';
import { Layouts } from '@/components/layout/Layouts';
import { SmConfCard } from '@/components/features/conference/ConfCards';
import { SearchModal, SearchModalRef } from '@/components/features/search/SearchModal';
import { RecitiaOverviewCard, RecitiaOverviewSkeleton } from '@/components/features/misesEnRecits/RecitiaOverview';
import { RecitiaDetailsCard, RecitiaDetailsSkeleton } from '@/components/features/misesEnRecits/RecitiaDetails';
import { AnnotationDropdown } from '@/components/features/conference/AnnotationDropdown';
import { ArrowIcon } from '@/components/ui/icons';
import CommentSection from '@/components/layout/CommentSection';

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: index * 0.15 },
  }),
};

const viewOptions = [{ key: 'References', title: 'Références' }];

export const ElementNarratif: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [currentVideoTime] = useState<number>(0);
  const [elementNarratifDetails, setElementNarratifDetails] = useState<any>(null);
  const [recommendedConfs] = useState<any[]>([]);

  const [elementNarratifsKeywords, setElementNarratifKeywords] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingRecommendations] = useState(true);
  const firstDivRef = useRef<HTMLDivElement>(null);
  const [equalHeight, setEqualHeight] = useState<number | null>(null);
  const searchModalRef = useRef<SearchModalRef>(null);
  const [selected, setSelected] = useState('References');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Trouve l'option sélectionnée actuelle
  const selectedOption = viewOptions.find((option) => option.key === selected);

  const handleOptionSelect = (optionKey: string) => {
    setSelected(optionKey);
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    if (firstDivRef.current) {
      setEqualHeight(firstDivRef.current.clientHeight);
    }
  }, [loading]);

  useEffect(() => {}, [currentVideoTime]);

  const fetchElementNarratifData = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    try {
      const data = await getElementNarratifs(Number(id));
      console.log(data);

      setElementNarratifDetails(data);

      // TODO: Récupérer les mots-clés associés si nécessaire
      setElementNarratifKeywords([]);
    } catch (error) {
      console.error('Error fetching elementNarratifs:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchElementNarratifData();
  }, [fetchElementNarratifData]);

  const handleKeywordClick = (keyword: string) => {
    if (searchModalRef.current) {
      searchModalRef.current.openWithSearch(keyword);
    }
  };

  const renderContent = () => {
    if (!elementNarratifDetails) {
      return <div>Loading...</div>;
    }

    switch (selected) {
      case 'References':
        return (
          <div className='flex flex-col gap-10'>
            {(elementNarratifDetails.references || []).map((reference: any) => (
              <ToolItem key={reference.id} tool={reference} />
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Layouts className='grid grid-cols-10 col-span-10 gap-50'>
      <motion.div ref={firstDivRef} className='col-span-10 lg:col-span-6 flex flex-col gap-25 h-fit' variants={fadeIn}>
        {!loading && elementNarratifsKeywords?.length > 0 && (
          <LongCarrousel
            perPage={3}
            perMove={1}
            autowidth={true}
            data={elementNarratifsKeywords}
            renderSlide={(item) => <KeywordsCard key={item.title} onSearchClick={handleKeywordClick} word={item.title} />}
          />
        )}
        {loading ? (
          <RecitiaOverviewSkeleton />
        ) : (
          <RecitiaOverviewCard
            id={elementNarratifDetails.id}
            title={elementNarratifDetails.title}
            personnes={elementNarratifDetails.creator}
            medias={
              elementNarratifDetails.associatedMedia && elementNarratifDetails.associatedMedia.length > 0
                ? elementNarratifDetails.associatedMedia
                : elementNarratifDetails.associatedMedia
                  ? [elementNarratifDetails.associatedMedia]
                  : []
            }
            fullUrl={elementNarratifDetails.transcript}
            currentTime={currentVideoTime}
            buttonText='Voir plus'
          />
        )}
        {loading ? (
          <RecitiaDetailsSkeleton></RecitiaDetailsSkeleton>
        ) : (
          <RecitiaDetailsCard
            date={elementNarratifDetails.eventDate}
            description={elementNarratifDetails.description}
            genre={elementNarratifDetails.genre}
            medium={elementNarratifDetails.duration}
          />
        )}
      </motion.div>
      <motion.div style={{ height: equalHeight || 'auto' }} className='col-span-10 lg:col-span-4 flex flex-col gap-50 overflow-hidden' variants={fadeIn}>
        <div className='flex w-full flex-col gap-20 flex-grow min-h-0 overflow-hidden'>
          <motion.div style={{ height: equalHeight || 'auto' }} className='col-span-10 lg:col-span-4 flex flex-col gap-50 overflow-hidden' variants={fadeIn}>
            <div className='flex w-full flex-col gap-20 flex-grow min-h-0 overflow-hidden'>
              {/* Header avec titre à gauche et dropdown à droite */}
              <div className='flex items-center justify-between w-full'>
                {/* Titre à gauche */}
                <h2 className='text-24 font-medium text-c6'>{selectedOption?.title}</h2>

                {/* Dropdown à droite - Version custom */}
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
                      {viewOptions.map((option) => (
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
              </div>

              {/* Contenu principal */}
              <div className='flex-grow min-h-0 overflow-auto'>{renderContent()}</div>
            </div>
          </motion.div>
        </div>
      </motion.div>
      {!loadingRecommendations && recommendedConfs.length > 0 && (
        <motion.div className='col-span-10 h-full lg:col-span-4 flex flex-col gap-50 flex-grow' variants={fadeIn}>
          <FullCarrousel
            title='Conférences associées'
            perPage={2}
            perMove={1}
            data={recommendedConfs}
            renderSlide={(item) => (
              <motion.div initial='hidden' animate='visible' variants={fadeIn} key={item.id}>
                <SmConfCard {...item} />
              </motion.div>
            )}
          />
        </motion.div>
      )}
      <motion.div className='col-span-4 h-full lg:col-span-4 flex flex-col gap-50 flex-grow' variants={fadeIn}>
        <CommentSection LinkedResourceId={Number(id)} />
      </motion.div>
      <SearchModal ref={searchModalRef} notrigger={true} />
    </Layouts>
  );
};

// Les composants ToolItem et ActeurItem restent inchangés
interface ToolItemProps {
  tool: {
    id: string | number;
    title: string;
    url?: string;
    thumbnail?: string;
    description?: string;
    uri?: string;
  };
}

export const ToolItem: React.FC<ToolItemProps> = ({ tool }) => {
  const [isToolHovered, setIsToolHovered] = useState(false);

  return (
    <div
      className={`w-full flex flex-row justify-between border-2 rounded-12 items-center gap-25 transition-transform-colors-opacity ${isToolHovered ? 'border-c6' : 'border-c3'}`}
      onMouseEnter={() => setIsToolHovered(true)}
      onMouseLeave={() => setIsToolHovered(false)}>
      <Link className='w-full gap-25 py-25 pl-25 flex flex-row justify-between' to={tool.url ?? tool.uri ?? '#'} target='_blank'>
        <div className={`flex flex-row gap-4 items-start`}>
          {tool.thumbnail && (
            <div className='flex-shrink-0'>
              <img src={tool.thumbnail} alt='thumbnail' className='w-50 object-cover rounded-6' />
            </div>
          )}
          <div className='w-full flex flex-col gap-10'>
            <p className='text-c6 text-16'>{tool.title}</p>
            {tool.description && <p className='text-c4 text-14 leading-[120%] text-overflow-ellipsis line-clamp-3 w-full'>{tool.description}</p>}
          </div>
        </div>
      </Link>
      <div className='flex flex-col h-full py-25 pr-25'>
        <AnnotationDropdown id={Number(tool.id)} content={tool.description} image={tool.thumbnail} type='Bibliographie' />
      </div>
    </div>
  );
};
