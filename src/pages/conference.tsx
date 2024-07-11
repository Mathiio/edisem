import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getConfOverview, getConfDetails, getConfKeyWords, getConfCitations, getConfBibliographies, getConfMediagraphies } from '../services/api';
import { Navbar } from '@/components/navbar/Navbar';
import { Scrollbar } from '@/components/utils/Scrollbar';
import { motion, Variants } from 'framer-motion';
import { ConfOverviewCard, ConfOverviewSkeleton } from '@/components/conference/ConfOverview';
import { Citations } from '@/components/conference/CitationsCards';
import { ConfDetailsCard, ConfDetailsSkeleton } from '@/components/conference/ConfDetails';
import { LongCarrousel } from '@/components/utils/Carrousels';
import { Tabs, Tab } from "@nextui-org/react";
import { KeywordsCard, KeywordsSkeleton } from '@/components/conference/KeywordsCards';
import { Bibliographies } from '@/components/conference/BibliographyCards';
import { Mediagraphies } from '@/components/conference/MediagraphyCards';


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
  const [selected, setSelected] = useState<string>('Bibliographie');
  const [confOverview, setConfOverview] = useState<{ title: string, actant: string, actantId: number, university: string, url: string, fullUrl: string }[]>([]);
  const [confDetails, setConfDetails] = useState<{ edition: string, date: string, description: string }[]>([]);
  const [confKeyWords, setConfKeyWords] = useState<{ id: number, keyword: string }[]>([]);
  const [confCitations, setConfCitations] = useState<{ citation: string, actant: string, startTime: number, endTime: number }[]>([]);
  const [confBibliographies, setConfBibliographies] = useState<{ bibliography: string, author: string, date: string }[]>([]);
  const [confMediagraphies, setConfMediagraphies] = useState<{ mediagraphy: string, author: string, date: string, type: string, url: string }[]>([]);
  const [loadingConfOverview, setLoadingConfOverview] = useState(true);
  const [loadingConfDetails, setLoadingConfDetails] = useState(true);
  const [loadingConfKeyWords, setLoadingConfKeyWords] = useState(true);
  const [loadingConfCitations, setLoadingConfCitations] = useState(true);
  const [loadingConfBibliographies, setLoadingConfBibliographies] = useState(true);
  const [loadingConfMediagraphies, setLoadingConfMediagraphies] = useState(true);
  const firstRender = useRef(true);

  useEffect(() => {
    const fetchConfOverview = async () => {
      const confOverview = await getConfOverview(Number(id));
      setConfOverview(confOverview);
      setLoadingConfOverview(false);
    };

    const fetchConfDetails = async () => {
      const confDetails = await getConfDetails(Number(id));
      setConfDetails(confDetails);
      setLoadingConfDetails(false);
    };

    const fetchConfKeyWords = async () => {
      const confKeyWords = await getConfKeyWords(Number(id));
      setConfKeyWords(confKeyWords);
      setLoadingConfKeyWords(false);
    };

    const fetchConfCitations = async () => {
      const confCitations = await getConfCitations(Number(id));
      setConfCitations(confCitations);
      setLoadingConfCitations(false);
    };

    const fetchConfBibliographies = async () => {
      const confBibliographies = await getConfBibliographies(Number(id));
      setConfBibliographies(confBibliographies);
      setLoadingConfBibliographies(false);
    };

    const fetchConfMediagraphies = async () => {
      const confMediagraphies = await getConfMediagraphies(Number(id));
      setConfMediagraphies(confMediagraphies);
      setLoadingConfMediagraphies(false);
    };

    if (firstRender.current) {
      firstRender.current = false;
    } else {
      fetchConfOverview();
      fetchConfDetails();
      fetchConfKeyWords();
      fetchConfCitations();
      fetchConfBibliographies();
      fetchConfMediagraphies();
    }
  }, []);

  return (
    <div className='relative h-screen overflow-hidden'>
      <Scrollbar>
        <motion.main
          className='mx-auto max-w-screen-2xl w-full max-w-xl grid grid-cols-10 xl:gap-75 gap-50 p-25 transition-all ease-in-out duration-200'
          initial='hidden'
          animate='visible'
          variants={containerVariants}>
          <motion.div className='col-span-10' variants={itemVariants}>
            <Navbar />
          </motion.div>
          <motion.div className='col-span-10 lg:col-span-6 flex flex-col gap-20' variants={itemVariants}>
            <LongCarrousel perPage={3} perMove={1} autowidth={true} data={loadingConfKeyWords ? Array.from({ length: 8 }) : confKeyWords}
              renderSlide={(item) => loadingConfKeyWords ? <KeywordsSkeleton /> : <KeywordsCard key={item.id} id={item.id} word={item.keyword} />} 
            />
            {loadingConfOverview ? (<ConfOverviewSkeleton></ConfOverviewSkeleton>) : (
              <ConfOverviewCard title={confOverview[0].title} actant={confOverview[0].actant} actantId={confOverview[0].actantId} university={confOverview[0].university} url={confOverview[0].url} fullUrl={confOverview[0].fullUrl} />
            )}
            {loadingConfDetails ? (<ConfDetailsSkeleton></ConfDetailsSkeleton>) : (
              <ConfDetailsCard edition={confDetails[0].edition} date={confDetails[0].date} description={confDetails[0].description} />
            )}
          </motion.div>
          <motion.div className='col-span-10 lg:col-span-4 flex flex-col gap-50' variants={itemVariants}>
            <div className='flex w-full flex-col gap-20'>
              <Tabs
                classNames={{
                  tabList: 'w-full gap-10 bg-default-0 rounded-8',
                  cursor: 'w-full',
                  tab: 'w-full bg-default-200 data-[selected=true]:bg-default-action rounded-8 p-10 data-[hover-unselected=true]:opacity-100 data-[hover-unselected=true]:bg-default-300 transition-all ease-in-out duration-200n',
                  tabContent: 'group-data-[selected=true]:text-default-selected group-data-[selected=true]:font-semibold',
                }}
                aria-label='Options'
                selectedKey={selected}
                onSelectionChange={(key: React.Key) => setSelected(key as string)}>
                <Tab key='Bibliographie' title='Bibliographie' className='px-0 py-0 flex'>
                  {selected === 'Bibliographie' && (
                    <Bibliographies bibliographies={confBibliographies} loading={loadingConfBibliographies}/>
                  )}
                </Tab>
                <Tab key='Citations' title='Citations' className='px-0 py-0 flex'>
                  {selected === 'Citations' && (
                    <Citations citations={confCitations} loading={loadingConfCitations}/>
                  )}
                </Tab>
                <Tab key='Medias' title='Médias' className='px-0 py-0 flex'>
                  {selected === 'Medias' && (
                    <Mediagraphies mediagraphies={confMediagraphies} loading={loadingConfMediagraphies}/>
                  )}
                </Tab>
                <Tab key='Annexes' title='Annexes' className='px-0 py-0 flex'>
                  {selected === 'Annexes' && ""}
                </Tab>
              </Tabs>
            </div>
          </motion.div>
        </motion.main>
      </Scrollbar>
    </div>
  );
};
