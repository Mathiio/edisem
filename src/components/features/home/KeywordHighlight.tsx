import React from 'react';
import { getLinksFromKeywords } from '@/lib/Links';
import { useEffect, useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { LgConfCard, LgConfSkeleton } from '@/components/features/home/ConfCards';
import { FullCarrousel } from '@/components/ui/Carrousels';
import { getConfByCitation } from '@/lib/api';
import * as Items from '@/lib/Items';
import { Button } from '@heroui/react';
import { ArrowIcon, UserIcon } from '@/components/ui/icons';
import { Link } from 'react-router-dom';

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: index * 0.15 },
  }),
};

const CitationSlide = ({ item }: { item: any }) => {
  const [confId, setConfId] = useState<number | null>(null);

  useEffect(() => {
    const fetchConfId = async () => {
      const id = await getConfByCitation(item.id);
      setConfId(id);
    };
    fetchConfId();
  }, [item.id]);

  return (
    <Link
      to={`/conference/${confId}`}
      key={item.id}
      className='shadow-[inset_0_0px_50px_rgba(255,255,255,0.06)] border-c3 border-2 hover:bg-c2 cursor-pointer p-40 rounded-12 justify-between flex flex-col gap-50 transition-all ease-in-out duration-200'>
      <p className='text-14 text-c4 italic leading-[150%] overflow-hidden line-clamp-6'>{item.citation}</p>
      <div className='flex w-full justify-between items-center'>
        <div className='flex flex-row gap-10 item-center justify-between'>
          {item.actant.picture ? (
            <img src={item.actant.picture} alt={`${item.actant.firstname} ${item.actant.lastname}`} className='w-[50px] h-[50px] object-cover rounded-14' />
          ) : (
            <div className='min-w-[50px] h-[50px] rounded-12 object-cover flex items-center justify-center bg-c3'>
              <UserIcon size={22} className='text-c6 hover:opacity-100 transition-all ease-in-out duration-200' />
            </div>
          )}
          <div className='flex-col flex justify-center gap-10'>
            <p className='text-18 text-c6 flex flex-row items-center leading-[70%]'>{`${item.actant.firstname} ${item.actant.lastname}`}</p>
            <div className='text-18 text-c6 flex flex-row items-center leading-[70%]'>
              {item.actant.universities?.map((university: { logo: string; shortName: string }, index: number) => (
                <div key={index} className='flex items-center justify-center gap-5'>
                  <img src={university.logo} alt={university.shortName} className='w-auto h-15 object-cover rounded-full' />
                  <p className='text-12 text-left text-c5 font-extralight'>{university.shortName}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Button key={item.id} size='sm' className='p-0 min-w-[32px] min-h-[32px] text-selected bg-action relative flex'>
          <ArrowIcon size={14} />
        </Button>
      </div>
    </Link>
  );
};

export const KeywordHighlight: React.FC = () => {
  const [selectedKeyword, setSelectedKeyword] = useState<any | null>(null);
  const [filteredConfs, setFilteredConfs] = useState<any[]>([]);
  const [filteredCitations, setFilteredCitations] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAndProcessData = async () => {
      try {
        const keywords = await Items.getKeywords();
        const confs = await Items.getSeminarConfs();
        const citations = await Items.getCitations();

        const keywordLinks = await Promise.all(
          keywords.map(async (keyword: any) => {
            const links = await getLinksFromKeywords(keyword);
            return { ...keyword, linkCount: links.length };
          }),
        );

        const filteredKeywords = keywordLinks.filter((k) => k.linkCount > 60);
        if (filteredKeywords.length > 0) {
          const randomKeyword = filteredKeywords[Math.floor(Math.random() * filteredKeywords.length)];
          setSelectedKeyword(randomKeyword);

          const confsFiltered = confs.filter((conf: { motcles: any[] }) => conf.motcles.some((motcle) => motcle.id === randomKeyword.id));

          const updatedConfs = await Promise.all(
            confsFiltered.slice(0, 8).map(async (conf: { actant: number }) => {
              if (conf.actant) {
                const actantDetails = await Items.getActants(conf.actant);
                return { ...conf, actant: actantDetails };
              }
              return conf;
            }),
          );

          setFilteredConfs(updatedConfs);

          const citationsFiltered = citations.filter((citation: { motcles: string[] }) => citation.motcles.includes(String(randomKeyword.id)));

          const updatedCitations = await Promise.all(
            citationsFiltered.map(async (citation: { actant: number }) => {
              if (citation.actant) {
                const actantDetails = await Items.getActants(citation.actant);
                return { ...citation, actant: actantDetails };
              }
              return citation;
            }),
          );

          setFilteredCitations(updatedCitations);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAndProcessData();
  }, []);

  return (
    <div className='w-full justify-center flex items-center flex-col gap-25 overflow-visible'>
      <div className='py-50 gap-20 justify-between flex items-center flex-col'>
        <h2 className='z-[12] text-64 text-c6 font-medium flex flex-col items-center transition-all ease-in-out duration-200 '>
          <span>Sujets autour de</span>
          <span className='text-center bg-gradient-to-t from-action to-action2 text-transparent bg-clip-text bg-[length:150%] bg-top font-[500]'>
            "{selectedKeyword?.title || ''}"
          </span>
        </h2>
      </div>
      <div className='grid grid-cols-4 w-full gap-25'>
        {loading
          ? Array.from({ length: 8 }).map((_, index) => <LgConfSkeleton key={index} />)
          : filteredConfs.map((item, index) => (
              <motion.div key={item.id} initial='hidden' animate='visible' variants={fadeIn} custom={index}>
                <LgConfCard
                  id={item.id}
                  title={item.title}
                  actant={`${item.actant.firstname} ${item.actant.lastname}`}
                  date={item.date}
                  url={item.url}
                  type={'conference'}
                  universite={item.actant.universities && item.actant.universities.length > 0 ? item.actant.universities[0].name : ''}
                  conferenceType={item.type}
                />
              </motion.div>
            ))}
      </div>
      <div className='mt-50 w-full flex rounded-12 overflow-visible h-auto'>
        <FullCarrousel
          title='Citations sur ce sujet'
          perPage={3}
          perMove={1}
          data={filteredCitations}
          renderSlide={(item, index) => (
            <motion.div initial='hidden' animate='visible' variants={fadeIn} custom={index} key={item.id}>
              <CitationSlide item={item} />
            </motion.div>
          )}
        />
      </div>
    </div>
  );
};
