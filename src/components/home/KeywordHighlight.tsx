import React from 'react';
import { getKeywords, getConfs, getCitations } from '@/services/Items';
import { getLinksFromKeywords } from '@/services/Links';
import { useEffect, useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { LgConfCard, LgConfSkeleton } from '@/components/home/ConfCards';
import { CitationCarrousel } from '@/components/utils/Carrousels';
import { getActant, getConfByCitation } from '@/services/api';
import { Button, Card } from '@heroui/react';
import { LinkIcon, UserIcon } from '@/components/utils/icons';
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
    <motion.div
      initial='hidden'
      animate='visible'
      variants={fadeIn}
      key={item.id}
      className='py-4 px-2 bg-c1 rounded-14 flex flex-col overflow-visible'>
      <Card className='p-25 flex flex-col gap-15' shadow='sm'>
        <p
          className='text-14 text-c4 italic leading-[150%] flex-grow overflow-hidden'
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 10,
            WebkitBoxOrient: 'vertical',
            textOverflow: 'ellipsis',
          }}>
          {item.citation}
        </p>
        <div className='flex flex-row gap-15 items-center'>
          {item.actant.picture ? (
            <img
              src={item.actant.picture}
              alt={`${item.actant.firstname} ${item.actant.lastname}`}
              className='w-[30px] h-[30px] object-cover rounded-12'
            />
          ) : (
            <div className='min-w-[30px] h-[30px] rounded-12 object-cover flex items-center justify-center bg-c3'>
              <UserIcon size={16} className='text-c6 hover:opacity-100 transition-all ease-in-out duration-200' />
            </div>
          )}
          <div className='flex flex-row w-full justify-between'>
            <p className='text-18 text-c6 flex flex-row items-center leading-[70%]'>{`${item.actant.firstname} ${item.actant.lastname}`}</p>
            {confId ? (
              <Link to={`/conference/${confId}`}>
                <Button
                  key={item.id}
                  endContent={<LinkIcon size={16} />}
                  radius='none'
                  className='h-[32px] px-10 text-14 rounded-8 text-selected bg-action transition-all ease-in-out duration-200 navfilter flex items-center'>
                  Voir plus
                </Button>
              </Link>
            ) : (
              <Button
                key={item.id}
                endContent={<LinkIcon size={16} />}
                radius='none'
                disabled
                className='h-[32px] px-10 text-14 rounded-8 opacity-50 bg-action transition-all ease-in-out duration-200 navfilter flex items-center'>
                Chargement...
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
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
        const keywords = await getKeywords();
        const confs = await getConfs();
        const citations = await getCitations();

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

          const confsFiltered = confs.filter((conf: { motcles: any[] }) =>
            conf.motcles.some((motcle) => motcle.id === randomKeyword.id),
          );

          const updatedConfs = await Promise.all(
            confsFiltered.slice(0, 8).map(async (conf: { actant: number }) => {
              if (conf.actant) {
                const actantDetails = await getActant(conf.actant);
                return { ...conf, actant: actantDetails };
              }
              return conf;
            }),
          );

          setFilteredConfs(updatedConfs);

          const citationsFiltered = citations.filter((citation: { motcles: string[] }) =>
            citation.motcles.includes(String(randomKeyword.id)),
          );

          const updatedCitations = await Promise.all(
            citationsFiltered.map(async (citation: { actant: number }) => {
              if (citation.actant) {
                const actantDetails = await getActant(citation.actant);
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
    <div className='py-[70px] w-full justify-center flex items-center flex-col gap-25 overflow-visible'>
      <div className='py-50 gap-20 justify-between flex items-center flex-col'>
        <h1 className='text-64 font-medium flex flex-col items-center transition-all ease-in-out duration-200 font-[600]'>
          <span className='text-c5'>Découvrez les sujets autour de</span>
          <span className='text-center bg-gradient-to-r from-action to-action2 text-transparent bg-clip-text bg-[length:150%] bg-left'>
            "{selectedKeyword?.title || 'intelligence artificielle'}"
          </span>
        </h1>
        <p className='text-c4 text-16'>Une exploration plus immersive par thématique.</p>
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
                  universite={
                    item.actant.universities && item.actant.universities.length > 0
                      ? item.actant.universities[0].name
                      : ''
                  }
                />
              </motion.div>
            ))}
      </div>
      <div className='mt-50 w-full flex rounded-12 overflow-visible h-auto'>
        <CitationCarrousel
          perPage={3}
          perMove={1}
          data={filteredCitations}
          renderSlide={(item, index) => <CitationSlide item={item} key={index} />}
          title={'Citations sur ce sujet'}
        />
      </div>
    </div>
  );
};
