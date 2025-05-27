import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getConf, getConfCitations, getConfBibliographies, getConfMediagraphies } from '../services/api';
import { motion, Variants } from 'framer-motion';
import { ConfOverviewCard, ConfOverviewSkeleton } from '@/components/conference/ConfOverview';
import { Citations } from '@/components/conference/CitationsCards';
import { ConfDetailsCard, ConfDetailsSkeleton } from '@/components/conference/ConfDetails';
import { FullCarrousel, LongCarrousel } from '@/components/Utils/Carrousels';
import { Tabs, Tab } from '@heroui/react';
import { KeywordsCard } from '@/components/conference/KeywordsCards';
import { Bibliographies, BibliographyItem } from '@/components/conference/BibliographyCards';
import { Mediagraphies, MediagraphyItem } from '@/components/conference/MediagraphyCards';
import { Layouts } from '@/components/Utils/Layouts';
import { SmConfCard } from '@/components/home/ConfCards';
import SearchModal, { SearchModalRef } from '@/components/Navbar/SearchModal';

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: index * 0.15 },
  }),
};

export const Conference: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [selected, setSelected] = useState<string>('Citations');
  const [currentVideoTime, setCurrentVideoTime] = useState<number>(0);
  const [confDetails, setConfDetails] = useState<any>(null);
  const [recommendedConfs, setRecommendedConfs] = useState<any[]>([]);
  const [confCitations, setConfCitations] = useState<any>([]);
  const [confBibliographies, setConfBibliographies] = useState<BibliographyItem[]>([]);
  const [confMediagraphies, setConfMediagraphies] = useState<MediagraphyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);
  const firstDivRef = useRef<HTMLDivElement>(null);
  const [equalHeight, setEqualHeight] = useState<number | null>(null);
  const searchModalRef = useRef<SearchModalRef>(null);

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
      const recommendationsPromises = recommendationIds.map((recId) => getConf(Number(recId)));
      const recommendations = await Promise.all(recommendationsPromises);
      setRecommendedConfs(recommendations);
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
      const [details, citations, bibliographies, mediagraphies] = await Promise.all([
        getConf(Number(id)),
        getConfCitations(Number(id)),
        getConfBibliographies(Number(id)),
        getConfMediagraphies(Number(id)),
      ]);

      setConfDetails(details);
      setConfCitations(citations);
      setConfBibliographies(bibliographies);
      setConfMediagraphies(mediagraphies);

      if (details.recommendation && details.recommendation.length > 0) {
        await fetchRecommendedConfs(details.recommendation);
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchConfData();
  }, [id, fetchConfData]);

  const handleKeywordClick = (searchTerm: string) => {
    // Ouvrir la modal de recherche avec le terme pré-rempli
    searchModalRef.current?.openWithSearch(searchTerm);
  };

  return (
    <Layouts className='grid grid-cols-10 col-span-10 gap-50'>
      <motion.div ref={firstDivRef} className='col-span-10 lg:col-span-6 flex flex-col gap-25 h-fit' variants={fadeIn}>
        {!loading && confDetails.motcles.length > 0 && (
          <LongCarrousel
            perPage={3}
            perMove={1}
            autowidth={true}
            data={confDetails.motcles}
            renderSlide={(item) => (
              <KeywordsCard key={item.id} onSearchClick={handleKeywordClick} id={item.id} word={item.title} />
            )}
          />
        )}
        {loading ? (
          <ConfOverviewSkeleton />
        ) : (
          <ConfOverviewCard
            id={confDetails.id}
            title={confDetails.title}
            actant={confDetails.actant?.firstname + ' ' + confDetails.actant?.lastname}
            actantId={confDetails.actant?.id}
            university={confDetails.actant?.universities?.[0]?.name || ''}
            picture={confDetails.actant?.picture || ''}
            url={confDetails.url}
            fullUrl={confDetails.fullUrl}
            currentTime={currentVideoTime}
          />
        )}
        {loading ? (
          <ConfDetailsSkeleton></ConfDetailsSkeleton>
        ) : (
          <ConfDetailsCard
            edition={'Édition ' + confDetails.season + ' ' + confDetails.date.split('-')[0]}
            date={confDetails.date}
            description={confDetails.description}
          />
        )}
      </motion.div>
      <motion.div
        style={{ height: equalHeight || 'auto' }}
        className='col-span-10 lg:col-span-4 flex flex-col gap-50 overflow-hidden'
        variants={fadeIn}>
        <div className='flex w-full flex-col gap-20 flex-grow min-h-0 overflow-hidden'>
          <Tabs
            classNames={{
              tabList: 'w-full h-fit gap-10 bg-c0 rounded-8',
              cursor: 'w-full',
              tab: 'w-full bg-c2 data-[selected=true]:bg-action rounded-8 p-10 data-[hover-unselected=true]:opacity-100 data-[hover-unselected=true]:bg-c3 transition-all ease-in-out duration-200',
              tabContent: 'group-data-[selected=true]:text-selected group-data-[selected=true]:font-medium text-c6',
              panel: 'flex-grow min-h-0 overflow-auto',
            }}
            aria-label='Options'
            selectedKey={selected}
            onSelectionChange={(key: React.Key) => setSelected(key as string)}>
            <Tab key='Citations' title='Citations' className='px-0 py-0 flex'>
              {selected === 'Citations' && (
                <Citations citations={confCitations} loading={loading} onTimeChange={handleTimeChange} />
              )}
            </Tab>
            <Tab key='Bibliographie' title='Bibliographie' className='px-0 py-0 flex flex-grow'>
              {selected === 'Bibliographie' && <Bibliographies bibliographies={confBibliographies} loading={loading} />}
            </Tab>
            <Tab key='Medias' title='Médias' className='px-0 py-0 flex'>
              {selected === 'Medias' && <Mediagraphies items={confMediagraphies} loading={loading} />}
            </Tab>
          </Tabs>
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
                <SmConfCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  actant={item.actant.firstname + ' ' + item.actant.lastname}
                  url={item.url}
                />
              </motion.div>
            )}
          />
        </motion.div>
      )}
      <SearchModal ref={searchModalRef} />
    </Layouts>
  );
};
