import React, { useEffect, useState, useRef } from 'react';
import { Navbar } from '@/components/Navbar/Navbar';
import { useParams } from 'react-router-dom';
import { Scrollbar } from '@/components/utils/Scrollbar';
import { getActant, getConfByActant } from '../services/api';
import { LinkIcon, UniversityIcon, SchoolIcon, LaboritoryIcon, ConferenceIcon } from '@/components/utils/icons';
import { InfoCard, InfoSkeleton } from '@/components/home/ActantCards';
import { Link } from '@nextui-org/react';
import { LgConfCard, LgConfSkeleton } from '@/components/home/ConfCards';

export const Conferencier: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [actant, setActant] = useState<{
    id: number;
    name: string;
    link: string;
    interventions: string;
    laboratories: { name: string; link: string }[];
    universities: { name: string; link: string }[];
    schools: { name: string; link: string }[];
  } | null>(null);
  const [loadingActant, setLoadingActant] = useState(true);
  const [conf, setConf] = useState<{ id: number; title: string; actant: string; date: string }[]>([]);
  const [loadingConf, setLoadingConf] = useState(true);
  const firstRender = useRef(true);

  useEffect(() => {
    const fetchActant = async () => {
      const actant = await getActant(Number(id));
      setActant(actant);
      setLoadingActant(false);
    };

    const fetchConf = async () => {
      const conf = await getConfByActant(Number(id));
      setConf(conf);
      setLoadingConf(false);
    };

    if (firstRender.current) {
      firstRender.current = false;
    } else {
      fetchConf();
      fetchActant();
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
            <div className='flex flex-col gap-50'>
              <Link
                isExternal
                className='gap-10 text-default-600'
                href={!loadingActant ? actant?.link : '#'}
                showAnchorIcon
                anchorIcon={<LinkIcon size={28} />}>
                <p className='text-32 font-semibold text-default-600'>{!loadingActant ? actant?.name : ' '}</p>
              </Link>
              <div className='flex gap-20 justify-between items-center'>
                <div className='h-full w-full flex flex-col gap-10'>
                  <div className='flex gap-10'>
                    <div className='w-[22px]'>
                      <UniversityIcon className='transition-transform-colors-opacity' size={22} />
                    </div>
                    <h3 className='text-16 text-center text-default-600 font-semibold'>Université(s)</h3>
                  </div>
                  <div className='flex flex-col justify-center items-start gap-10'>
                    {loadingActant
                      ? Array.from({ length: 2 }).map((_, index) => <InfoSkeleton key={index} />)
                      : actant?.universities.map((item, index) => (
                          <InfoCard key={index} link={item.link} name={item.name} />
                        ))}
                  </div>
                </div>
                <div className='h-full w-full flex flex-col gap-10'>
                  <div className='flex gap-10'>
                    <div className='w-[22px]'>
                      <SchoolIcon className='transition-transform-colors-opacity' size={22} />
                    </div>
                    <h3 className='text-16 text-center text-default-600 font-semibold'>École(s) doctorale(s)</h3>
                  </div>
                  <div className='flex flex-col justify-center items-start gap-10'>
                    {loadingActant
                      ? Array.from({ length: 2 }).map((_, index) => <InfoSkeleton key={index} />)
                      : actant?.schools.map((item, index) => (
                          <InfoCard key={index} link={item.link} name={item.name} />
                        ))}
                  </div>
                </div>
                <div className='h-full w-full flex flex-col gap-10'>
                  <div className='flex gap-10'>
                    <div className='w-[22px]'>
                      <LaboritoryIcon className='transition-transform-colors-opacity' size={22} />
                    </div>
                    <h3 className='text-16 text-center text-default-600 font-semibold'>Laboratoire(s)</h3>
                  </div>
                  <div className='flex flex-col justify-center items-start gap-10'>
                    {loadingActant
                      ? Array.from({ length: 2 }).map((_, index) => <InfoSkeleton key={index} />)
                      : actant?.laboratories.map((item, index) => (
                          <InfoCard key={index} link={item.link} name={item.name} />
                        ))}
                  </div>
                </div>
                <div className='h-full w-full flex flex-col gap-10'>
                  <div className='flex gap-10'>
                    <div className='w-[22px]'>
                      <ConferenceIcon className='transition-transform-colors-opacity' size={22} />
                    </div>
                    <h3 className='text-16 text-center text-default-600 font-semibold'>Participations(s)</h3>
                  </div>
                  <div className='flex flex-col justify-center items-start gap-10'>
                    {loadingActant ? (
                      Array.from({ length: 1 }).map((_, index) => <InfoSkeleton key={index} />)
                    ) : (
                      <InfoCard link={''} name={actant?.interventions} />
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className='gap-25 flex flex-col'>
              <h2 className='text-24 font-bold text-default-600'>Dernière(s) conférence(s)</h2>
              <div className='grid grid-cols-4 grid-rows-2 gap-25'>
                {loadingConf
                  ? Array.from({ length: 8 }).map((_, index) => <LgConfSkeleton key={index} />)
                  : conf.map((item) => (
                      <LgConfCard key={item.id} id={item.id} title={item.title} actant={item.actant} date={item.date} />
                    ))}
              </div>
            </div>
          </div>
        </main>
      </Scrollbar>
    </div>
  );
};
