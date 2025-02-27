import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FullCarrousel, MidCarrousel } from '@/components/utils/Carrousels';
import { getSeminaires, getActants } from '../services/Items';
import { getRandomConfs } from '../services/api';
import { EventCard, EventSkeleton } from '@/components/home/EventCards';
import { LgConfCard, LgConfSkeleton } from '@/components/home/ConfCards';
import { ActantCard, ActantSkeleton } from '@/components/home/ActantCards';
import { motion, Variants } from 'framer-motion';
import { Layouts } from '@/components/utils/Layouts';
import { HomeBaner } from '@/components/home/HomeBaner';
import { KeywordHighlight } from '@/components/home/KeywordHighlight';

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: index * 0.15 },
  }),
};

export const Home: React.FC = () => {
  const [seminaires, setSeminaires] = useState<any[]>([]);
  const [actants, setActants] = useState<any[]>([]);
  const [randomConf, setRandomConf] = useState<any[]>([]);
  const [loadingSeminaires, setLoadingSeminaires] = useState(true);
  const [loadingActants, setLoadingActants] = useState(true);
  const [loadingRandomConf, setLoadingRandomConf] = useState(true);

  const dataFetchedRef = useRef(false);

  const fetchSeminaires = useCallback(async () => {
    if (dataFetchedRef.current) return;
    const seminaires = await getSeminaires();
    setSeminaires(seminaires);
    setLoadingSeminaires(false);
  }, []);

  const fetchActants = useCallback(async () => {
    if (dataFetchedRef.current) return;
    const actants = await getActants();
    setActants(actants as any);
    setLoadingActants(false);
  }, []);

  const fetchRandomConf = useCallback(async () => {
    if (dataFetchedRef.current) return;
    const randomConf = await getRandomConfs(8);
    setRandomConf(randomConf as any);
    setLoadingRandomConf(false);
  }, []);

  useEffect(() => {
    if (dataFetchedRef.current) return;

    fetchSeminaires();
    fetchActants();
    fetchRandomConf();

    dataFetchedRef.current = true;
  }, [fetchSeminaires, fetchActants, fetchRandomConf]);

  return (
    <Layouts className='col-span-10 flex flex-col gap-75'>
      <HomeBaner/>
      <FullCarrousel
        title='Derniers séminaires Arcanes'
        perPage={3}
        perMove={1}
        data={loadingSeminaires ? Array.from({ length: 5 }) : seminaires}
        renderSlide={(item) =>
          loadingSeminaires ? (
            <EventSkeleton />
          ) : (
            <motion.div initial='hidden' animate='visible' variants={fadeIn} key={item.id}>
              <EventCard id={item.id} title={`Édition ${item.season} ${item.year}`} numConf={item.confNum} />
            </motion.div>
          )
        }
      />
      <MidCarrousel
        title='Découvrez nos conférenciers'
        description='Rencontrez les experts de nos conférences, explorez leurs contributions aux séminaires et découvrez les institutions qui les accompagnent.'
        perPage={4}
        perMove={1}
        data={loadingActants ? Array.from({ length: 4 }) : actants}
        renderSlide={(item, index) =>
          loadingActants ? (
            <ActantSkeleton />
          ) : (
            <motion.div
              initial='hidden'
              animate='visible'
              className='h-full'
              variants={fadeIn}
              key={item.id}
              custom={index}>
              <ActantCard
                key={item.id}
                id={item.id}
                firstname={item.firstname}
                lastname={item.lastname}
                picture={item.picture}
                interventions={item.interventions}
                universities={item.universities.map((uni: { name: string; logo: string }) => ({
                  name: uni.name,
                  logo: uni.logo,
                }))}
              />
            </motion.div>
          )
        }
      />
      <KeywordHighlight/>
      {/* <div className='gap-25 flex flex-col'>
        <h2 className='text-24 font-medium text-c6'>Sélection de conférences</h2>
        <div className='grid grid-cols-4 grid-rows-2 gap-25'>
          {loadingRandomConf
            ? Array.from({ length: 8 }).map((_, index) => <LgConfSkeleton key={index} />)
            : randomConf.map((item, index) => (
                <motion.div key={item.id} initial='hidden' animate='visible' variants={fadeIn} custom={index}>
                  <LgConfCard
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    actant={item.actant.firstname + ' ' + item.actant.lastname}
                    date={item.date}
                    url={item.url}
                    universite={
                      item.actant.universities && item.actant.universities.length > 0
                        ? item.actant.universities[0].name
                        : ''
                    }
                  />
                </motion.div>
              ))}
        </div>
      </div> */}
    </Layouts>
  );
};
