import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getElementEsthetique } from '@/services/Items';
import { motion, Variants } from 'framer-motion';
import { FullCarrousel, LongCarrousel } from '@/components/ui/Carrousels';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react';
import { KeywordsCard } from '@/components/features/conference/KeywordsCards';
import { Layouts } from '@/components/layout/Layouts';
import { SmConfCard } from '@/components/ui/ConfCards';
import { RecitiaOverviewCard, RecitiaOverviewSkeleton } from '@/components/features/miseEnRecit/RecitiaOverview';
import { RecitiaDetailsCard, RecitiaDetailsSkeleton } from '@/components/features/miseEnRecit/RecitiaDetails';
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

const viewOptions = [{ key: 'Analyse', title: 'Analyse' }];

export const ElementEsthetique: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [currentVideoTime] = useState<number>(0);
  const [elementEsthetiquDetails, setElementEsthetiquDetails] = useState<any>(null);
  const [recommendedConfs, setRecommendedConfs] = useState<any[]>([]);

  const [elementEsthetiqueKeywords, setElementEsthetiquKeywords] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);
  const firstDivRef = useRef<HTMLDivElement>(null);
  const [equalHeight, setEqualHeight] = useState<number | null>(null);
  const searchModalRef = useRef<any>(null);
  const [selected, setSelected] = useState('Analyse');
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

  const fetchRecommendedConfs = async (_recommendationIds: string[]) => {
    setLoadingRecommendations(true);
    try {
      // TODO: Implémenter la récupération des conférences recommandées
      setRecommendedConfs([]);
    } catch (error) {
      console.error('Error fetching recommended conferences:', error);
      setRecommendedConfs([]);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  // Suppress unused function warning
  void fetchRecommendedConfs;

  useEffect(() => {}, [currentVideoTime]);

  const fetchElementEsthetiquData = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    try {
      const data = await getElementEsthetique(Number(id));
      console.log('ElementEsthetique data:', data);

      if (data && (Array.isArray(data) ? data.length > 0 : Object.keys(data).length > 0)) {
        setElementEsthetiquDetails(data);
      } else {
        console.warn('No data received from getElementEsthetique');
        setElementEsthetiquDetails(null);
      }

      // TODO: Récupérer les mots-clés associés si nécessaire
      setElementEsthetiquKeywords([]);
    } catch (error) {
      console.error('Error fetching elementEsthetique:', error);
      setElementEsthetiquDetails(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchElementEsthetiquData();
  }, [fetchElementEsthetiquData]);

  const handleKeywordClick = (keyword: string) => {
    if (searchModalRef.current) {
      searchModalRef.current.openWithSearch(keyword);
    }
  };

  const renderContent = () => {
    if (loading) {
      return <div className='p-20 bg-c2 rounded-12 border-2 border-c3 text-c4'>Chargement...</div>;
    }

    if (!elementEsthetiquDetails) {
      return <div className='p-20 bg-c2 rounded-12 border-2 border-c3 text-c4'>Aucune donnée disponible</div>;
    }

    switch (selected) {
      case 'Analyse':
        return (
          <div className='flex flex-col gap-20'>
            {/* Genre */}
            {elementEsthetiquDetails.genre && (
              <div className='flex flex-col gap-10'>
                <h3 className='text-18 font-medium text-c6'>Genre</h3>
                <div className='w-full flex flex-row justify-between border-2 rounded-12 items-center gap-25 border-c3'>
                  <div className='w-full gap-25 py-25 pl-25 flex flex-row justify-between'>
                    <div className='flex flex-col gap-4 items-start'>
                      <div className='w-full flex flex-col gap-10'>
                        <p className='text-c6 text-16'>{elementEsthetiquDetails.genre}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Form */}
            {elementEsthetiquDetails.form && (
              <div className='flex flex-col gap-10'>
                <h3 className='text-18 font-medium text-c6'>Forme</h3>
                <div className='w-full flex flex-row justify-between border-2 rounded-12 items-center gap-25 border-c3'>
                  <div className='w-full gap-25 py-25 pl-25 flex flex-row justify-between'>
                    <div className='flex flex-col gap-4 items-start'>
                      <div className='w-full flex flex-col gap-10'>
                        <p className='text-c6 text-16'>{elementEsthetiquDetails.form}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Duration */}
            {elementEsthetiquDetails.duration && (
              <div className='flex flex-col gap-10'>
                <h3 className='text-18 font-medium text-c6'>Durée</h3>
                <div className='w-full flex flex-row justify-between border-2 rounded-12 items-center gap-25 border-c3'>
                  <div className='w-full gap-25 py-25 pl-25 flex flex-row justify-between'>
                    <div className='flex flex-col gap-4 items-start'>
                      <div className='w-full flex flex-col gap-10'>
                        <p className='text-c6 text-16'>{elementEsthetiquDetails.duration}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Language */}
            {elementEsthetiquDetails.language && (
              <div className='flex flex-col gap-10'>
                <h3 className='text-18 font-medium text-c6'>Langue</h3>
                <div className='w-full flex flex-row justify-between border-2 rounded-12 items-center gap-25 border-c3'>
                  <div className='w-full gap-25 py-25 pl-25 flex flex-row justify-between'>
                    <div className='flex flex-col gap-4 items-start'>
                      <div className='w-full flex flex-col gap-10'>
                        <p className='text-c6 text-16'>{elementEsthetiquDetails.language}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Audience */}
            {elementEsthetiquDetails.audience && (
              <div className='flex flex-col gap-10'>
                <h3 className='text-18 font-medium text-c6'>Public</h3>
                <div className='w-full flex flex-row justify-between border-2 rounded-12 items-center gap-25 border-c3'>
                  <div className='w-full gap-25 py-25 pl-25 flex flex-row justify-between'>
                    <div className='flex flex-col gap-4 items-start'>
                      <div className='w-full flex flex-col gap-10'>
                        <p className='text-c6 text-16'>{elementEsthetiquDetails.audience}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Temporal */}
            {elementEsthetiquDetails.temporal && (
              <div className='flex flex-col gap-10'>
                <h3 className='text-18 font-medium text-c6'>Temporalité</h3>
                <div className='w-full flex flex-row justify-between border-2 rounded-12 items-center gap-25 border-c3'>
                  <div className='w-full gap-25 py-25 pl-25 flex flex-row justify-between'>
                    <div className='flex flex-col gap-4 items-start'>
                      <div className='w-full flex flex-col gap-10'>
                        <p className='text-c6 text-16'>{elementEsthetiquDetails.temporal}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Image Characteristic */}
            {elementEsthetiquDetails.imageCharacteristic && (
              <div className='flex flex-col gap-10'>
                <h3 className='text-18 font-medium text-c6'>Caractéristiques visuelles</h3>
                <div className='w-full flex flex-row justify-between border-2 rounded-12 items-center gap-25 border-c3'>
                  <div className='w-full gap-25 py-25 pl-25 flex flex-row justify-between'>
                    <div className='flex flex-col gap-4 items-start'>
                      <div className='w-full flex flex-col gap-10'>
                        <p className='text-c6 text-16'>{elementEsthetiquDetails.imageCharacteristic}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Colour Characteristic */}
            {elementEsthetiquDetails.colourCharacteristic && (
              <div className='flex flex-col gap-10'>
                <h3 className='text-18 font-medium text-c6'>Caractéristiques colorimétriques</h3>
                <div className='w-full flex flex-row justify-between border-2 rounded-12 items-center gap-25 border-c3'>
                  <div className='w-full gap-25 py-25 pl-25 flex flex-row justify-between'>
                    <div className='flex flex-col gap-4 items-start'>
                      <div className='w-full flex flex-col gap-10'>
                        <p className='text-c6 text-16'>{elementEsthetiquDetails.colourCharacteristic}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sound Characteristic */}
            {elementEsthetiquDetails.soundCharacteristic && (
              <div className='flex flex-col gap-10'>
                <h3 className='text-18 font-medium text-c6'>Caractéristiques sonores</h3>
                <div className='w-full flex flex-row justify-between border-2 rounded-12 items-center gap-25 border-c3'>
                  <div className='w-full gap-25 py-25 pl-25 flex flex-row justify-between'>
                    <div className='flex flex-col gap-4 items-start'>
                      <div className='w-full flex flex-col gap-10'>
                        <p className='text-c6 text-16'>{elementEsthetiquDetails.soundCharacteristic}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Layouts className='grid grid-cols-10 col-span-10 gap-50'>
      <motion.div ref={firstDivRef} className='col-span-10 lg:col-span-6 flex flex-col gap-25 h-fit' variants={fadeIn}>
        {!loading && elementEsthetiqueKeywords?.length > 0 && (
          <LongCarrousel
            perPage={3}
            perMove={1}
            autowidth={true}
            data={elementEsthetiqueKeywords}
            renderSlide={(item) => <KeywordsCard key={item.title} onSearchClick={handleKeywordClick} word={item.title} />}
          />
        )}
        {loading ? (
          <RecitiaOverviewSkeleton />
        ) : elementEsthetiquDetails ? (
          <RecitiaOverviewCard
            id={elementEsthetiquDetails.id}
            title={elementEsthetiquDetails.title}
            personnes={elementEsthetiquDetails.creator}
            medias={elementEsthetiquDetails.associatedMedia && elementEsthetiquDetails.associatedMedia.length > 0 ? elementEsthetiquDetails.associatedMedia : []}
            credits={elementEsthetiquDetails.contributor}
            fullUrl={elementEsthetiquDetails.relatedResource}
            currentTime={currentVideoTime}
            buttonText='Voir plus'
          />
        ) : (
          <div className='p-20 bg-c2 rounded-12 border-2 border-c3 text-c4'>Aucune donnée disponible</div>
        )}
        {loading ? (
          <RecitiaDetailsSkeleton></RecitiaDetailsSkeleton>
        ) : elementEsthetiquDetails ? (
          <RecitiaDetailsCard date={elementEsthetiquDetails.eventDate} description={elementEsthetiquDetails.description} actants={elementEsthetiquDetails.contributor} />
        ) : (
          <div className='p-20 bg-c2 rounded-12 border-2 border-c3 text-c4'>Aucune donnée disponible</div>
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
              <div className='flex-grow min-h-0 overflow-auto pr-25'>{renderContent()}</div>
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
    associatedMedia?: string[];
  };
}

export const ToolItem: React.FC<ToolItemProps> = ({ tool }) => {
  const [isToolHovered, setIsToolHovered] = useState(false);

  // Generate URL for elementEsthetique items
  const getToolUrl = () => {
    if (tool.url) return tool.url;
    if (tool.id) return `/elementesthetique/${tool.id}`;
    return '#';
  };

  // Get thumbnail from associatedMedia if available
  const getThumbnail = (): string | undefined => {
    if (tool.thumbnail) return tool.thumbnail;
    if (tool.associatedMedia && Array.isArray(tool.associatedMedia) && tool.associatedMedia.length > 0) {
      return tool.associatedMedia[0];
    }
    return undefined;
  };

  return (
    <div
      className={`w-full flex flex-row justify-between border-2 rounded-12 items-center gap-25 transition-transform-colors-opacity ${isToolHovered ? 'border-c6' : 'border-c3'}`}
      onMouseEnter={() => setIsToolHovered(true)}
      onMouseLeave={() => setIsToolHovered(false)}>
      <Link className='w-full gap-25 py-25 pl-25 flex flex-row justify-between' to={getToolUrl()}>
        <div className={`flex flex-row gap-4 items-start`}>
          {getThumbnail() && (
            <div className='flex-shrink-0'>
              <img src={getThumbnail()} alt='thumbnail' className='w-50 object-cover rounded-6' />
            </div>
          )}
          <div className='w-full flex flex-col gap-10'>
            <p className='text-c6 text-16'>{tool.title}</p>
            {tool.description && <p className='text-c4 text-14 leading-[120%] text-overflow-ellipsis line-clamp-3 w-full'>{tool.description}</p>}
          </div>
        </div>
      </Link>
      <div className='flex flex-col h-full py-25 pr-25'>
        <AnnotationDropdown id={Number(tool.id)} content={tool.description} image={getThumbnail()} type='Element Esthetique' />
      </div>
    </div>
  );
};
