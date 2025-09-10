import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getOeuvresByPersonne } from '@/lib/api';
import * as Items from '@/lib/Items';
import { LinkIcon, UniversityIcon, SchoolIcon, LaboritoryIcon, ConferenceIcon } from '@/components/ui/icons';
import { InfoCard, InfoSkeleton } from '@/components/features/intervenants/IntervenantCards';
import { Link } from '@heroui/react';
import { LgConfCard, LgConfSkeleton } from '@/components/features/home/ConfCards';
import { motion, Variants } from 'framer-motion';
import { Layouts } from '@/components/layout/Layouts';

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: index * 0.1 },
  }),
};

export const Personne: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [personne, setPersonne] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [oeuvres, setOeuvres] = useState<any[]>([]);

  const fetchPersonneData = useCallback(async () => {
    setLoading(true);
    try {
      const [personne, oeuvres] = await Promise.all([Items.getPersonnes(Number(id)), getOeuvresByPersonne(Number(id))]);

      setPersonne(personne);
      setOeuvres(oeuvres);
      console.log(oeuvres);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPersonneData();
  }, [id, fetchPersonneData]);

  return (
    <Layouts className='col-span-10 flex flex-col gap-100'>
      <div className='flex flex-col gap-50'>
        <Link isExternal className='gap-20 text-c6 w-fit' href={!loading ? personne?.url : '#'} showAnchorIcon anchorIcon={<LinkIcon size={28} />}>
          {personne?.picture ? (
            <img className='w-75 h-75 object-cover rounded-12' src={personne.picture} alt='' />
          ) : (
            <div className='w-75 h-75 rounded-12 object-cover flex items-center justify-center bg-c3'>
              <svg width='26' height='38' viewBox='0 0 32 44' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <path
                  d='M15.999 0C10.397 0 5.8427 4.6862 5.8427 10.4504C5.8427 16.1047 10.1404 20.6809 15.7424 20.8789C15.9135 20.8569 16.0845 20.8569 16.2128 20.8789C16.2556 20.8789 16.2769 20.8789 16.3197 20.8789C16.3411 20.8789 16.3411 20.8789 16.3625 20.8789C21.8362 20.6809 26.1339 16.1047 26.1553 10.4504C26.1553 4.6862 21.601 0 15.999 0Z'
                  fill='#A1A1AA'
                />
                <path
                  d='M26.8617 26.7293C20.8962 22.6371 11.1677 22.6371 5.15945 26.7293C2.44398 28.5993 0.947266 31.1295 0.947266 33.8356C0.947266 36.5417 2.44398 39.0498 5.13807 40.8979C8.1315 42.966 12.0656 44 15.9999 44C19.9341 44 23.8683 42.966 26.8617 40.8979C29.5558 39.0278 31.0525 36.5197 31.0525 33.7916C31.0311 31.0854 29.5558 28.5773 26.8617 26.7293Z'
                  fill='#A1A1AA'
                />
              </svg>
            </div>
          )}
          <div className='flex flex-col gap-5'>
            <p className='text-32 font-medium text-c6'>{loading ? '' : personne?.name}</p>
            <p className='text-16 text-c4 font-regular'>{loading ? '' : personne?.birthDate}</p>
          </div>
        </Link>
        <div className='flex gap-20 justify-between items-center'>
          <div className='h-full w-full flex flex-col gap-10'>
            <div className='flex gap-10'>
              <div className='w-[22px]'>
                <UniversityIcon className='transition-transform-colors-opacity text-c6' size={22} />
              </div>
              <h3 className='text-16 text-left text-c6 font-medium'>Statut(s)</h3>
            </div>
            <div className='flex flex-col justify-center items-start gap-10'>
              {loading ? (
                Array.from({ length: 2 }).map((_, index) => <InfoSkeleton key={index} />)
              ) : personne?.status && personne.status.length > 0 ? (
                personne.status.map((item: string, index: React.Key | null | undefined) => <InfoCard key={index} link={''} name={item} />)
              ) : (
                <InfoCard key={0} link={''} name={'Aucun statut trouvé'} />
              )}
            </div>
          </div>
          <div className='h-full w-full flex flex-col gap-10'>
            <div className='flex gap-10'>
              <div className='w-[22px]'>
                <SchoolIcon className='transition-transform-colors-opacity text-c6' size={22} />
              </div>
              <h3 className='text-16 text-left text-c6 font-medium'>Projet(s) passé(s)</h3>
            </div>
            <div className='flex flex-col justify-center items-start gap-10'>
              {loading ? (
                Array.from({ length: 2 }).map((_, index) => <InfoSkeleton key={index} />)
              ) : personne?.pastProject ? (
                <InfoCard key={0} link={''} name={personne.pastProject} />
              ) : (
                <InfoCard key={0} link={''} name={'Aucun projet passé trouvé'} />
              )}
            </div>
          </div>
          <div className='h-full w-full flex flex-col gap-10'>
            <div className='flex gap-10'>
              <div className='w-[22px]'>
                <LaboritoryIcon className='transition-transform-colors-opacity text-c6' size={22} />
              </div>
              <h3 className='text-16 text-left text-c6 font-medium'>Localisation(s)</h3>
            </div>
            <div className='flex flex-col justify-center items-start gap-10'>
              {loading ? (
                Array.from({ length: 2 }).map((_, index) => <InfoSkeleton key={index} />)
              ) : personne?.basedNear && personne.basedNear.length > 0 ? (
                <InfoCard key={0} link={''} name={personne.basedNear} />
              ) : (
                <InfoCard key={0} link={''} name={'Aucune localisation trouvée'} />
              )}
            </div>
          </div>
        </div>
      </div>
      <div className='gap-25 flex flex-col'>
        <h2 className='text-24 font-medium text-c6'>Dernière(s) oeuvre(s)</h2>
        <div className='grid grid-cols-4 grid-rows-2 gap-25'>
          {loading
            ? Array.from({ length: 8 }).map((_, index) => <LgConfSkeleton key={index} />)
            : oeuvres.map((item, index) => (
                <motion.div initial='hidden' animate='visible' variants={fadeIn} key={item.id} custom={index}>
                  <LgConfCard
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    actant={Array.isArray(item.personne) && item.personne.length > 0 ? item.personne[0].name : item.personne?.name || ''}
                    date={item.date}
                    url={''}
                    thumbnail={item.thumbnail}
                    universite={item.primaryActant?.universities?.[0]?.name || ''}
                    type='oeuvre'
                  />
                </motion.div>
              ))}
        </div>
      </div>
    </Layouts>
  );
};
