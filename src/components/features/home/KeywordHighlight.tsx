import React from 'react';
import { getLinksFromKeywords } from '@/services/Links';
import { useEffect, useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { ResourceCard, ResourceCardSkeleton } from '@/components/features/corpus/ResourceCard';
import { FullCarrousel } from '@/components/ui/Carrousels';
import { getConfByCitation } from '@/services/api';
import * as Items from '@/services/Items';
import { Button } from '@heroui/react';
import { ArrowIcon, UserIcon } from '@/components/ui/icons';
import { Link } from 'react-router-dom';
import { Citation, Conference, Keyword } from '@/types/ui';
import { getResourceUrl } from '@/config/resourceConfig';

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: index * 0.15 },
  }),
};

const CitationSlide = ({ item }: { item: Citation }) => {
  const [conf, setConf] = useState<Conference | null>(null);

  useEffect(() => {
    const fetchConf = async () => {
      try {
        const conference = await getConfByCitation(item.id);
        setConf(conference);
      } catch (error) {
        console.error('Erreur lors de la récupération de la conférence:', error);
      }
    };

    if (item.id) {
      fetchConf();
    }
  }, [item.id]);

  const getConfRoute = (): string => {
    if (!conf) {
      return '#';
    }
    return getResourceUrl(conf.type, conf.id) || '#';
  };

  return (
    <Link
      to={getConfRoute()}
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
              {item.actant.universities?.map((university, index) => (
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
  const [selectedKeyword, setSelectedKeyword] = useState<Keyword | null>(null);
  const [filteredConfs, setFilteredConfs] = useState<Conference[]>([]);
  const [filteredCitations, setFilteredCitations] = useState<Citation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAndProcessData = async () => {
      try {
        const keywords = await Items.getKeywords();
        const citations = await Items.getCitations();

        const keywordLinks = await Promise.all(
          keywords.map(async (keyword: Keyword) => {
            try {
              const links = await getLinksFromKeywords(keyword);
              return { ...keyword, linkCount: links.length };
            } catch (error) {
              console.error(`Error getting links for keyword ${keyword.id}:`, error);
              return { ...keyword, linkCount: 0 };
            }
          }),
        );

        const filteredKeywords = keywordLinks.filter((k) => k.linkCount > 60);
        if (filteredKeywords.length > 0) {
          const randomKeyword = filteredKeywords[Math.floor(Math.random() * filteredKeywords.length)];
          setSelectedKeyword(randomKeyword);

          // Use new getCardsByKeyword function (replaces filtering getSeminarConfs)
          const confsFiltered = await Items.getCardsByKeyword(randomKeyword.id, 8);
          setFilteredConfs(confsFiltered as Conference[]);

          // Traitement des citations (actant unique)
          const citationsFiltered = citations.filter((citation: any) => citation.motcles?.includes(String(randomKeyword.id)));

          const updatedCitations = await Promise.all(
            citationsFiltered.map(async (citation: any) => {
              if (citation.actant) {
                try {
                  let actantDetails;
                  if (typeof citation.actant === 'string' || typeof citation.actant === 'number') {
                    actantDetails = await Items.getActants(citation.actant);
                  } else if (typeof citation.actant === 'object' && citation.actant.id) {
                    actantDetails = citation.actant;
                  }

                  return {
                    ...citation,
                    actant: actantDetails,
                  } as Citation;
                } catch (error) {
                  console.error(`Error fetching actant for citation ${citation.id}:`, error);
                  return null;
                }
              }
              return null;
            }),
          );

          const validCitations = updatedCitations.filter((citation): citation is Citation => citation !== null);
          setFilteredCitations(validCitations);
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
          ? Array.from({ length: 8 }).map((_, index) => <ResourceCardSkeleton key={index} />)
          : filteredConfs.map((conference, index) => (
              <motion.div key={conference.id} initial='hidden' animate='visible' variants={fadeIn} custom={index}>
                <ResourceCard item={conference} />
              </motion.div>
            ))}
      </div>
      <div className='mt-50 w-full flex rounded-12 overflow-visible h-auto'>
        <FullCarrousel title='Citations sur ce sujet' perPage={3} perMove={1} data={filteredCitations} renderSlide={(item) => <CitationSlide item={item} />} />
      </div>
    </div>
  );
};
