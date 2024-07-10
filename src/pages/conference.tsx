import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getConfOverview, getConfDetails, getConfKeyWords } from '../services/api';
import { Navbar } from '@/components/navbar/Navbar';
import { ContentTab } from '@/components/conference/ContentTab';
import { Scrollbar } from '@/components/utils/Scrollbar';
import { motion, Variants } from 'framer-motion';
import { ConfOverviewCard, ConfOverviewSkeleton } from '@/components/conference/ConfOverview';
import { ConfDetailsCard, ConfDetailsSkeleton } from '@/components/conference/ConfDetails';
import { LongCarrousel } from '@/components/utils/Carrousels';
import { Skeleton } from "@nextui-org/react";


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
  const [confOverview, setConfOverview] = useState<{ title: string, actant: string, actantId: number, university: string, url: string, fullUrl: string }[]>([]);
  const [confDetails, setConfDetails] = useState<{ edition: string, date: string, description: string }[]>([]);
  const [confKeyWords, setConfKeyWords] = useState<{ id: number, keyword: string }[]>([]);
  const [loadingConfOverview, setLoadingConfOverview] = useState(true);
  const [loadingConfDetails, setLoadingConfDetails] = useState(true);
  const [loadingConfKeyWords, setLoadingConfKeyWords] = useState(true);
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

    if (firstRender.current) {
      firstRender.current = false;
    } else {
      fetchConfOverview();
      fetchConfDetails();
      fetchConfKeyWords();
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
            <LongCarrousel
              perPage={3}
              perMove={1}
              autowidth={true}
              data={loadingConfKeyWords ? Array.from({ length: 8 }) : confKeyWords}
                renderSlide={(item) =>
                  loadingConfKeyWords ? 
                    <Skeleton className="w-[100%] rounded-8">
                        <p className="w-[120px] font-semibold text-16 p-5">_</p>
                    </Skeleton>
                  :
                    <div className="border-2 border-default-300 h-full rounded-8 flex items-center justify-start p-10" key={item.id}>
                      <p className='font-regular text-default-500 text-14'>{item.keyword}</p>
                    </div>
                }
            />
            {loadingConfOverview ? ( <ConfOverviewSkeleton></ConfOverviewSkeleton>) : (
              <ConfOverviewCard title={confOverview[0].title} actant={confOverview[0].actant} actantId={confOverview[0].actantId} university={confOverview[0].university} url={confOverview[0].url} fullUrl={confOverview[0].fullUrl}/>
            )}
            {loadingConfDetails ? ( <ConfDetailsSkeleton></ConfDetailsSkeleton>) : (
              <ConfDetailsCard edition={confDetails[0].edition} date={confDetails[0].date} description={confDetails[0].description}/>
            )}
          </motion.div>
          <motion.div className='col-span-10 lg:col-span-4 flex flex-col gap-50' variants={itemVariants}>
            <ContentTab />
          </motion.div>
        </motion.main>
      </Scrollbar>
    </div>
  );
};
