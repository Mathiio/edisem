import { getKeywords, getConfs, getCitations } from '@/services/Items';
import { getLinksFromKeywords } from '@/services/Links';
import { useEffect, useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { LgConfCard, LgConfSkeleton } from "@/components/home/ConfCards";
import { FullCarrousel } from "@/components/utils/Carrousels";
import { getActant } from "@/services/api";

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: index * 0.15 },
  }),
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

                    const confsFiltered = confs.filter((conf: { motcles: any[]; }) =>
                        conf.motcles.some(motcle => motcle.id === randomKeyword.id)
                    );
                    
                    const updatedConfs = await Promise.all(confsFiltered.slice(0, 8).map(async (conf: { actant: number; }) => {
                        if (conf.actant) {
                            const actantDetails = await getActant(conf.actant);
                            return { ...conf, actant: actantDetails };
                        }
                        return conf;
                    }));

                    setFilteredConfs(updatedConfs);
                    

                    const citationsFiltered = citations.filter((citation: { motcles: string[] }) =>
                        citation.motcles.includes(String(randomKeyword.id))
                    );

                    const updatedCitations = await Promise.all(citationsFiltered.map(async (citation: { actant: number; }) => {
                        if (citation.actant) {
                            const actantDetails = await getActant(citation.actant);
                            return { ...citation, actant: actantDetails };
                        }
                        return citation;
                    }));

                    setFilteredCitations(updatedCitations);
                }
            } catch (error) {
                console.error("Erreur lors de la récupération des données:", error);
            } finally {
                setLoading(false);
            }
        };

    fetchAndProcessData();
  }, []);

  return (
    <div className='py-50 w-full justify-center flex items-center flex-col gap-50'>
      <div className='py-50 gap-20 justify-between flex items-center flex-col'>
        <h1 className='text-64 font-medium flex flex-col items-center transition-all ease-in-out duration-200'>
          <span className='text-c5'>Découvrez les sujets autour de</span>
          <span className='text-center bg-gradient-to-r from-action to-action2 text-transparent bg-clip-text bg-[length:150%] bg-left'>
            “{selectedKeyword?.title || 'intelligence artificielle'}”
          </span>
        </h1>
        <p className='text-c4 text-16'>Une exploration plus immersive par thématique.</p>
      </div>
      <div className='grid grid-cols-4 grid-rows-[1fr, auto] gap-25'>
        {loading
          ? Array.from({ length: 8 }).map((_, index) => <LgConfSkeleton key={index} />)
          : filteredConfs.map((item, index) => (
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
      <div className='mt-50 w-full flex bg-c2 rounded-12 p-50 h-auto'>
        <FullCarrousel
                title="Citations sur le sujet"
                perPage={1}
                perMove={1}
                data={filteredCitations}
                renderSlide={(item) => (
                    <motion.div initial="hidden" animate="visible" variants={fadeIn} key={item.id} className="p-4 bg-gray-100 rounded-lg">
                        <p className="text-18 text-c6 mt-2">{item.actant.firstname + ' ' + item.actant.lastname}</p>
                        <p className="text-16 text-c4 italic">{item.citation}</p>
                    </motion.div>
                )}
            />
        </div>
