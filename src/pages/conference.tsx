import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getConf, getConfCitations, getConfBibliographies, getConfMediagraphies } from '../services/api';
import { Navbar } from '@/components/navbar/Navbar';
import { motion, Variants } from 'framer-motion';
import { ConfOverviewCard, ConfOverviewSkeleton } from '@/components/conference/ConfOverview';
import { Citations } from '@/components/conference/CitationsCards';
import { ConfDetailsCard, ConfDetailsSkeleton } from '@/components/conference/ConfDetails';
import { LongCarrousel } from '@/components/utils/Carrousels';
import { Tabs, Tab } from '@nextui-org/react';
import { KeywordsCard, KeywordsSkeleton } from '@/components/conference/KeywordsCards';
import { Bibliographies, BibliographyItem } from '@/components/conference/BibliographyCards';
import { Mediagraphies, MediagraphyItem } from '@/components/conference/MediagraphyCards';
import { Layouts } from '@/components/utils/Layouts';

const containerVariants: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 80, damping: 15 },
  },
};

export const Conference: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [selected, setSelected] = useState<string>('Citations');
  const [currentVideoTime, setCurrentVideoTime] = useState<number>(0);
  const [confDetails, setConfDetails] = useState<any>(null);
  const [confCitations, setConfCitations] = useState<
    { citation: string; actant: string; startTime: number; endTime: number }[]
  >([]);
  const [confBibliographies, setConfBibliographies] = useState<BibliographyItem[]>([]);

  const [confMediagraphies, setConfMediagraphies] = useState<MediagraphyItem[]>([]);
  const [loading, setLoading] = useState(true);

  const handleTimeChange = (newTime: number) => {
    setCurrentVideoTime(newTime);
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
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchConfData();
  }, [id, fetchConfData]);

  return (
      <Layouts className='grid grid-cols-10 col-span-10 gap-50'>
        <motion.div className='col-span-10 lg:col-span-6 flex flex-col gap-20' variants={itemVariants}>
          <LongCarrousel
            perPage={3}
            perMove={1}
            autowidth={true}
            data={loading ? Array.from({ length: 8 }) : confDetails.motcles}
            renderSlide={(item) =>
              loading ? <KeywordsSkeleton /> : <KeywordsCard key={item.id} id={item.id} word={item.title} />
            }
          />
          {loading ? (
            <ConfOverviewSkeleton />
          ) : (
            <ConfOverviewCard
              title={confDetails.title}
              actant={confDetails.actant?.firstname + ' ' + confDetails.actant?.lastname}
              actantId={confDetails.actant?.id}
              university={confDetails.actant?.universities?.[0]?.name || ''}
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
        <motion.div className='col-span-10 h-full lg:col-span-4 flex flex-col gap-50 flex-grow' variants={itemVariants}>
          <div className='flex w-full flex-col gap-20 flex-grow'>
            <Tabs
              classNames={{
                tabList: 'w-full gap-10 bg-0 rounded-8',
                cursor: 'w-full',
                tab: 'w-full bg-100 data-[selected=true]:bg-action rounded-8 p-10 data-[hover-unselected=true]:opacity-100 data-[hover-unselected=true]:bg-200 transition-all ease-in-out duration-200',
                tabContent: 'group-data-[selected=true]:text-500 group-data-[selected=true]:font-medium text-500',
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
                {selected === 'Bibliographie' && (
                  <Bibliographies bibliographies={confBibliographies} loading={loading} />
                )}
              </Tab>
              <Tab key='Medias' title='Médias' className='px-0 py-0 flex'>
                {selected === 'Medias' && <Mediagraphies items={confMediagraphies} loading={loading} />}
              </Tab>
            </Tabs>
          </div>
        </motion.div>
      </Layouts>
  );
};
