import React, { useEffect, useState, useCallback } from 'react';

import { useParams } from 'react-router-dom';
import { getActant, getConfByActant } from '../lib/api';
import { LinkIcon, UniversityIcon, SchoolIcon, LaboritoryIcon, ConferenceIcon } from '@/components/ui/icons';
import { InfoCard, InfoSkeleton } from '@/components/features/actants/ActantCards';
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

export const Conferencier: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [actant, setActant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [conf, setConf] = useState<any[]>([]);

  const fetchActantData = useCallback(async () => {
    setLoading(true);
    try {
      const [actant, confs] = await Promise.all([getActant(Number(id)), getConfByActant(Number(id))]);

      setActant(actant);
      setConf(confs);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchActantData();
  }, [id, fetchActantData]);

  return (
    <Layouts className='col-span-10 flex flex-col gap-100'>
      <div className='flex flex-col gap-50'>
        <Link
          isExternal
          className='gap-10 text-c6 w-fit'
          href={!loading ? actant?.url : '#'}
          showAnchorIcon
          anchorIcon={<LinkIcon size={28} />}>
          {actant?.picture ? (
            <img className='w-75 h-75 object-cover rounded-12' src={actant.picture} alt='' />
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

          <p className='text-32 font-medium text-c6'>{loading ? '' : actant?.firstname + ' ' + actant?.lastname}</p>
        </Link>
        <div className='flex gap-20 justify-between items-center'>
          <div className='h-full w-full flex flex-col gap-10'>
            <div className='flex gap-10'>
              <div className='w-[22px]'>
                <UniversityIcon className='transition-transform-colors-opacity text-c6' size={22} />
              </div>
              <h3 className='text-16 text-left text-c6 font-medium'>Université(s)</h3>
            </div>
            <div className='flex flex-col justify-center items-start gap-10'>
              {loading ? (
                Array.from({ length: 2 }).map((_, index) => <InfoSkeleton key={index} />)
              ) : actant?.universities && actant.universities.length > 0 ? (
                actant.universities.map(
                  (item: { url: string; name: string | undefined }, index: React.Key | null | undefined) => (
                    <InfoCard key={index} link={item.url} name={item.name} />
                  ),
                )
              ) : (
                <InfoCard key={0} link={''} name={'Aucune université trouvée'} />
              )}
            </div>
          </div>
          <div className='h-full w-full flex flex-col gap-10'>
            <div className='flex gap-10'>
              <div className='w-[22px]'>
                <SchoolIcon className='transition-transform-colors-opacity text-c6' size={22} />
              </div>
              <h3 className='text-16 text-left text-c6 font-medium'>École(s) doctorale(s)</h3>
            </div>
            <div className='flex flex-col justify-center items-start gap-10'>
              {loading ? (
                Array.from({ length: 2 }).map((_, index) => <InfoSkeleton key={index} />)
              ) : actant?.doctoralSchools && actant.doctoralSchools.length > 0 ? (
                actant.doctoralSchools.map(
                  (item: { url: string; name: string | undefined }, index: React.Key | null | undefined) => (
                    <InfoCard key={index} link={item.url} name={item.name} />
                  ),
                )
              ) : (
                <InfoCard key={0} link={''} name={'Aucune école doctorale trouvée'} />
              )}
            </div>
          </div>
          <div className='h-full w-full flex flex-col gap-10'>
            <div className='flex gap-10'>
              <div className='w-[22px]'>
                <LaboritoryIcon className='transition-transform-colors-opacity text-c6' size={22} />
              </div>
              <h3 className='text-16 text-left text-c6 font-medium'>Laboratoire(s)</h3>
            </div>
            <div className='flex flex-col justify-center items-start gap-10'>
              {loading ? (
                Array.from({ length: 2 }).map((_, index) => <InfoSkeleton key={index} />)
              ) : actant?.laboritories && actant.laboritories.length > 0 ? (
                actant.laboritories.map(
                  (item: { url: string; name: string | undefined }, index: React.Key | null | undefined) => (
                    <InfoCard key={index} link={item.url} name={item.name} />
                  ),
                )
              ) : (
                <InfoCard key={0} link={''} name={'Aucun laboratoire trouvé'} />
              )}
            </div>
          </div>
          <div className='h-full w-full flex flex-col gap-10'>
            <div className='flex gap-10'>
              <div className='w-[22px]'>
                <ConferenceIcon className='transition-transform-colors-opacity text-c6' size={22} />
              </div>
              <h3 className='text-16 text-left text-c6 font-medium'>Participations(s)</h3>
            </div>
            <div className='flex flex-col justify-center items-start gap-10'>
              {loading ? (
                Array.from({ length: 1 }).map((_, index) => <InfoSkeleton key={index} />)
              ) : (
                <InfoCard link={''} name={actant?.interventions} />
              )}
            </div>
          </div>
        </div>
      </div>
      <div className='gap-25 flex flex-col'>
        <h2 className='text-24 font-medium text-c6'>Dernière(s) conférence(s)</h2>
        <div className='grid grid-cols-4 grid-rows-2 gap-25'>
          {loading
            ? Array.from({ length: 8 }).map((_, index) => <LgConfSkeleton key={index} />)
            : conf.map((item, index) => (
                <motion.div initial='hidden' animate='visible' variants={fadeIn} key={item.id} custom={index}>
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
      </div>
    </Layouts>
  );
};
