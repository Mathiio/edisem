import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from '@/components/navbar/Navbar';
import { Scrollbar } from '@/components/utils/Scrollbar';
import { FullCarrousel, MidCarrousel } from '@/components/utils/Carrousels';
import { getSeminaires, getRandomConferences, getActants } from '../services/api';
import { EventCard, EventSkeleton } from '@/components/home/EventCards';
import { LgConfCard, LgConfSkeleton } from '@/components/home/ConfCards';
import { ActantCard, ActantSkeleton } from '@/components/home/ActantCards';
import { motion, Variants } from 'framer-motion';

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } 
};


export const Home: React.FC = () => {
  const [seminaires, setSeminaires] = useState<{ id: number; title: string; ConfNumb: number; year: string; season: string }[]>([]);
  const [actants, setActants] = useState<{ id: number; name: string; interventions: number }[]>([]);
  const [randomConf, setRandomConf] = useState<{ id: number; title: string; actant: string; date: string }[]>([]);
  const [loadingSeminaires, setLoadingSeminaires] = useState(true);
  const [loadingActants, setLoadingActants] = useState(true);
  const [loadingRandomConf, setLoadingRandomConf] = useState(true);
  const firstRender = useRef(true);

  useEffect(() => {
    const fetchSeminaires = async () => {
      const seminaires = await getSeminaires();
      setSeminaires(seminaires);
      setLoadingSeminaires(false);
    };

    const fetchActants = async () => {
      const actants = await getActants();
      setActants(actants);
      setLoadingActants(false);
    };

    const fetchRandomConf = async () => {
      const randomConf = await getRandomConferences(8);
      setRandomConf(randomConf);
      setLoadingRandomConf(false);
    };

    if (firstRender.current) {
      firstRender.current = false;
    } else {
      fetchSeminaires();
      fetchActants();
      fetchRandomConf();
    }
  }, []);

  return (
    <div className='relative h-screen overflow-hidden'>
      <Scrollbar>
        <main className='mx-auto max-w-screen-2xl w-full max-w-xl grid grid-cols-10 xl:gap-75 gap-50 p-25 transition-all ease-in-out duration-200'>
          <div className='col-span-10'>
            <Navbar />
          </div>
          <div className='col-span-10 flex flex-col gap-100'>
            <FullCarrousel
              title='Derniers séminaires Arcanes'
              perPage={2}
              perMove={1}
              data={loadingSeminaires ? Array.from({ length: 4 }) : seminaires}
              renderSlide={(item) =>
                loadingSeminaires ? 
                  <EventSkeleton />
                : 
                  <motion.div initial="hidden" animate="visible" variants={fadeIn} key={item.id}>
                    <EventCard id={item.id} title={`Édition ${item.season} ${item.year}`} numConf={item.ConfNumb}/>
                  </motion.div>   
              }
            />
            <MidCarrousel
              title='Découvrez Nos Conférenciers'
              description='Rencontrez les experts et visionnaires qui interviennent lors de nos conférences. Cliquez pour découvrir leur profil complet, incluant leur participation à divers séminaires, les thématiques qui leur sont chères, et bien plus encore.'
              perPage={3}
              perMove={1}
              data={loadingActants ? Array.from({ length: 4 }) : actants}
              renderSlide={(item) =>
                loadingActants ? 
                  <ActantSkeleton />
                :  
                  <motion.div initial="hidden" animate="visible" variants={fadeIn} key={item.id}>
                    <ActantCard key={item.id} id={item.id} name={item.name} interventions={item.interventions} />
                  </motion.div>
              }
            />
            <div className='gap-25 flex flex-col'>
              <h2 className='text-24 font-bold text-default-600'>Séléction de conférences</h2>
              <div className='grid grid-cols-4 grid-rows-2 gap-25'>
                {loadingRandomConf ? 
                    Array.from({ length: 8 }).map((_) => (
                      <LgConfSkeleton />
                    ))
                  : 
                  randomConf.map((item) => (
                    <motion.div initial="hidden" animate="visible" variants={fadeIn} key={item.id}>
                      <LgConfCard key={item.id} id={item.id} title={item.title} actant={item.actant} date={item.date} />
                    </motion.div>
                  ))}
              </div>
            </div>
            <div className='flex gap-75 w-full'></div>
          </div>
        </main>
      </Scrollbar>
    </div>
  );
};
