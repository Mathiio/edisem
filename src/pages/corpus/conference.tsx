import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getConfCitations, getConfBibliographies, getConfMediagraphies } from '@/services/api';
import * as Items from '@/services/Items';
import { motion, Variants } from 'framer-motion';
import { ConfOverviewCard, ConfOverviewSkeleton } from '@/components/features/conference/ConfOverview';
import { Citations } from '@/components/features/conference/CitationsCards';
import { ConfDetailsCard, ConfDetailsSkeleton } from '@/components/features/conference/ConfDetails';
import { FullCarrousel, LongCarrousel } from '@/components/ui/Carrousels';
import { DropdownItem, Dropdown, DropdownMenu, DropdownTrigger } from '@heroui/react';
import { KeywordsCard } from '@/components/features/conference/KeywordsCards';
import { Bibliographies } from '@/components/features/conference/BibliographyCards';
import { Mediagraphies } from '@/components/features/conference/MediagraphyCards';
import { Layouts } from '@/components/layout/Layouts';
import { SmConfCard } from '@/components/ui/ConfCards';
import { SearchModal, SearchModalRef } from '@/components/features/search/SearchModal';
import { ArrowIcon } from '@/components/ui/icons';
import { Conference as ConferenceType, Bibliography, Mediagraphy } from '@/types/ui';
import CommentSection from '@/components/layout/CommentSection';

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: index * 0.15 },
  }),
};

const viewOptions = [
  { key: 'Citations', title: 'Citations' },
  { key: 'Bibliographie', title: 'Bibliographie' },
  { key: 'Medias', title: 'Médias' },
];

export const Conference: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [selected, setSelected] = useState<string>('Citations');
  const [currentVideoTime, setCurrentVideoTime] = useState<number>(0);
  const [conf, setConf] = useState<ConferenceType | null>(null);
  const [recommendedConfs, setRecommendedConfs] = useState<ConferenceType[]>([]);
  const [confCitations, setConfCitations] = useState<any>([]);
  const [confBibliographies, setConfBibliographies] = useState<Bibliography[]>([]);
  const [confMediagraphies, setConfMediagraphies] = useState<Mediagraphy[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);
  const firstDivRef = useRef<HTMLDivElement>(null);
  const [equalHeight, setEqualHeight] = useState<number | null>(null);
  const searchModalRef = useRef<SearchModalRef>(null);
  const selectedOption = viewOptions.find((option) => option.key === selected);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleOptionSelect = (optionKey: string) => {
    setSelected(optionKey);
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    if (firstDivRef.current) {
      setEqualHeight(firstDivRef.current.clientHeight);
    }
  }, [loading]);

  const handleTimeChange = (newTime: number) => {
    setCurrentVideoTime(newTime);
  };

  const fetchRecommendedConfs = async (recommendationIds: string[]) => {
    setLoadingRecommendations(true);
    try {
      const allConfs: ConferenceType[] = await Items.getAllConfs();
      const recommendedConfs = allConfs.filter((conf) => recommendationIds.includes(String(conf.id)) || recommendationIds.includes(conf.id));
      setRecommendedConfs(recommendedConfs);
    } catch (error) {
      console.error('Error fetching recommended conferences:', error);
      setRecommendedConfs([]);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  useEffect(() => {}, [currentVideoTime]);

  const fetchConfData = useCallback(async () => {
    setLoading(true);
    try {
      const [conf, citations, bibliographies, mediagraphies] = await Promise.all([
        Items.getAllConfs(Number(id)),
        getConfCitations(Number(id)),
        getConfBibliographies(Number(id)),
        getConfMediagraphies(Number(id)),
      ]);

      setConf(conf);
      setConfCitations(citations);
      setConfBibliographies(bibliographies);
      setConfMediagraphies(mediagraphies);

      if (conf?.recommendation && conf.recommendation.length > 0) {
        await fetchRecommendedConfs(conf.recommendation);
      }
    } catch (error) {
      console.error('Error fetching conference data:', error);
      setConf(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchConfData();
  }, [id, fetchConfData]);

  const handleKeywordClick = (searchTerm: string) => {
    searchModalRef.current?.openWithSearch(searchTerm);
  };

  const renderContent = () => {
    switch (selected) {
      case 'Citations':
        return <Citations citations={confCitations} loading={loading} onTimeChange={handleTimeChange} />;
      case 'Bibliographie':
        return (
          <Bibliographies
            bibliographies={confBibliographies}
            loading={loading}
            legacyConfig={{
              normalTitle: 'Bibliographies de Conférence',
              complementaryTitle: 'Bibliographies Complémentaires',
              complementaryTemplateId: '83',
            }}
          />
        );
      case 'Medias':
        return <Mediagraphies items={confMediagraphies} loading={loading} />;
      default:
        return null;
    }
  };

  return (
    <Layouts className='grid grid-cols-10 col-span-10 gap-50'>
      <motion.div ref={firstDivRef} className='col-span-10 lg:col-span-6 flex flex-col gap-25 h-fit' variants={fadeIn}>
        {!loading && conf?.motcles && conf.motcles.length > 0 && (
          <LongCarrousel
            perPage={3}
            perMove={1}
            autowidth={true}
            data={conf.motcles}
            renderSlide={(item) => <KeywordsCard key={item.id} onSearchClick={handleKeywordClick} word={item.title} />}
          />
        )}
        {loading ? (
          <>
            <ConfOverviewSkeleton />
            <ConfDetailsSkeleton />
          </>
        ) : conf ? (
          <>
            <ConfOverviewCard conf={conf} currentTime={currentVideoTime} />
            <ConfDetailsCard conf={conf} />
          </>
        ) : null}
      </motion.div>
      <motion.div style={{ height: equalHeight || 'auto' }} className='col-span-10 lg:col-span-4 flex flex-col gap-50 overflow-hidden' variants={fadeIn}>
        <div className='flex w-full flex-col gap-20 flex-grow min-h-0 overflow-hidden'>
          <div className='flex items-center justify-between w-full'>
            <h2 className='text-24 font-medium text-c6'>{selectedOption?.title}</h2>
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
      {!loadingRecommendations && recommendedConfs.length > 0 && (
        <motion.div className='col-span-10 h-full lg:col-span-6 flex flex-col gap-50 flex-grow' variants={fadeIn}>
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
      <SearchModal ref={searchModalRef} notrigger />
    </Layouts>
  );
};
