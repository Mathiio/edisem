import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getExperimentations, getActants, getTools, getKeywords, getStudents } from '@/services/Items';
import { motion, Variants } from 'framer-motion';
import { ConfOverviewSkeleton } from '@/components/features/conference/ConfOverview';
import { FullCarrousel, LongCarrousel } from '@/components/ui/Carrousels';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react';
import { KeywordsCard } from '@/components/features/conference/KeywordsCards';
import { Layouts } from '@/components/layout/Layouts';
import { SmConfCard } from '@/components/ui/ConfCards';
import { SearchModal, SearchModalRef } from '@/components/features/search/SearchModal';
import { ExpOverviewCard } from '@/components/features/experimentation/ExpOverview';
import { ExpDetailsCard, ExpDetailsSkeleton } from '@/components/features/experimentation/ExpDetails';
import { AnnotationDropdown } from '@/components/features/conference/AnnotationDropdown';

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: index * 0.15 },
  }),
};

const viewOptions = [
  { key: 'Feedback', title: "Retours d'expérience" },
  { key: 'Hypothese', title: 'Hypothèse à expérimenter' },
  { key: 'Outils', title: 'Outils' },
  { key: 'ScientContent', title: 'Contenus scientifiques' },
  { key: 'CultuContent', title: 'Contenus culturels' },
];

export const Experimentation: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [currentVideoTime] = useState<number>(0);
  const [confDetails, setConfDetails] = useState<any>(null);

  const [confTools, setConfTools] = useState<any[]>([]);
  const [confConcepts, setConfConcepts] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const firstDivRef = useRef<HTMLDivElement>(null);
  const [equalHeight, setEqualHeight] = useState<number | null>(null);
  const searchModalRef = useRef<SearchModalRef>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [selected, setSelected] = useState('Feedback');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Trouve l'option sélectionnée actuelle
  const selectedOption = viewOptions.find((option) => option.key === selected);

  const handleOptionSelect = (optionKey: string) => {
    setSelected(optionKey);
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    if (firstDivRef.current) {
      setEqualHeight(firstDivRef.current.clientHeight);
    }
  }, [loading]);

  useEffect(() => {}, [currentVideoTime]);

  const fetchConfData = useCallback(async () => {
    setLoading(true);
    try {
      const [experimentations, actants, students, tools, concepts] = await Promise.all([getExperimentations(), getActants(), getStudents(), getTools(), getKeywords()]);

      // Créer un map des actants
      const actantMap = new Map();
      actants.forEach((a: any) => {
        actantMap.set(a.id, a);
        actantMap.set(String(a.id), a);
        actantMap.set(Number(a.id), a);
      });

      const studentMap = new Map();
      students.forEach((s: any) => {
        studentMap.set(s.id, s);
        studentMap.set(String(s.id), s);
        studentMap.set(Number(s.id), s);
      });

      const toolMap = new Map();
      tools.forEach((t: any) => {
        toolMap.set(t.id, t);
        toolMap.set(String(t.id), t);
        toolMap.set(Number(t.id), t);
      });

      const conceptMap = new Map();
      concepts.forEach((c: any) => {
        conceptMap.set(c.id, c);
        conceptMap.set(String(c.id), c);
        conceptMap.set(Number(c.id), c);
      });

      const experimentation = experimentations.find((e: any) => String(e.id) === String(id));

      if (experimentation) {
        // ✅ NOUVEAU: Traiter le tableau actants
        if (experimentation.actants && Array.isArray(experimentation.actants)) {
          // Enrichir tous les actants
          experimentation.enrichedActants = experimentation.actants
            .map((actantId: any) => {
              return (
                actantMap.get(actantId) ||
                actantMap.get(Number(actantId)) ||
                actantMap.get(String(actantId)) ||
                studentMap.get(actantId) ||
                studentMap.get(Number(actantId)) ||
                studentMap.get(String(actantId)) ||
                null
              );
            })
            .filter(Boolean);

          // Définir le premier actant comme actant principal pour compatibilité
          experimentation.primaryActant = experimentation.enrichedActants.length > 0 ? experimentation.enrichedActants[0] : null;
        }

        // ✅ LEGACY: Gérer l'ancien système actant (au cas où)
        if (experimentation.actant && !experimentation.primaryActant) {
          // Si actant est déjà un objet complet, on le garde
          if (typeof experimentation.actant === 'object' && experimentation.actant.id) {
            experimentation.primaryActant = experimentation.actant;
          } else {
            // Si actant est juste un ID, on le cherche dans les maps
            const actantId = experimentation.actant;
            experimentation.primaryActant =
              actantMap.get(actantId) ||
              actantMap.get(Number(actantId)) ||
              actantMap.get(String(actantId)) ||
              studentMap.get(actantId) ||
              studentMap.get(Number(actantId)) ||
              studentMap.get(String(actantId));
          }
        }

        // Enrichir les feedbacks et leurs contributors
        if (experimentation.feedbacks) {
          experimentation.feedbacks.forEach((feedback: any) => {
            if (feedback.contributors) {
              feedback.contributors = feedback.contributors.map((contributor: any) => {
                const contributorId = contributor.id;

                // Chercher dans actants
                let enrichedContributor = actantMap.get(contributorId) || actantMap.get(String(contributorId)) || actantMap.get(Number(contributorId));

                // Si pas trouvé dans actants, chercher dans students
                if (!enrichedContributor) {
                  enrichedContributor = studentMap.get(contributorId) || studentMap.get(String(contributorId)) || studentMap.get(Number(contributorId));
                }

                // Retourner l'objet enrichi ou garder l'original
                return enrichedContributor || contributor;
              });
            }
          });
        }

        // Mapper les students si la propriété existe
        if (experimentation.students) {
          experimentation.students = experimentation.students.map((s: any) => studentMap.get(s) || studentMap.get(Number(s)) || studentMap.get(String(s))).filter(Boolean);
        }

        setConfTools(tools.filter((t: any) => experimentation.technicalCredits?.includes(String(t.id))));
        setConfConcepts(concepts.filter((c: any) => experimentation.concepts?.includes(String(c.id))));
        setConfDetails(experimentation);
        setRecommendations(experimentations);

        console.log(experimentation);
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchConfData();
  }, [id, fetchConfData]);

  const handleKeywordClick = (searchTerm: string) => {
    // Ouvrir la modal de recherche avec le terme pré-rempli
    searchModalRef.current?.openWithSearch(searchTerm);
  };

  const renderContent = () => {
    if (!confDetails) {
      return <div>Loading...</div>; // or return null, or a loading skeleton
    }

    switch (selected) {
      case 'Hypothese':
        return (
          <div
            className={`w-full flex flex-row justify-between border-2 rounded-12 items-center gap-25  transition-transform-colors-opacity ${isHovered ? 'border-c6' : 'border-c3'}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}>
            <div className='w-full gap-25 py-25 pl-25 flex flex-row justify-between'>
              <div className={`flex  flex-col gap-4 items-start`}>
                <div className='w-full flex flex-col gap-10'>
                  <p className='text-c6 text-16'>{confDetails.abstract}</p>
                </div>
              </div>
            </div>
            <div className='flex flex-col h-full py-25 pr-25'>{/* <AnnotationDropdown id={props.id} content={formatBibliography(props)} type='Bibliographie' /> */}</div>
          </div>
        );
      case 'Outils':
        return (
          <div className='flex flex-col gap-10'>
            {confTools.map((tool: any) => (
              <ToolItem key={tool.id} tool={tool} />
            ))}
          </div>
        );
      case 'ScientContent':
        return (
          <div className='flex flex-col gap-10'>
            {confDetails.references.map((reference: any) => (
              <ToolItem key={reference.id} tool={reference} />
            ))}
          </div>
        );
      case 'CultuContent':
        return (
          <div className='flex flex-col gap-10'>
            {confDetails.bibliographicCitations.map((citation: any) => (
              <ToolItem key={citation.id} tool={citation} />
            ))}
          </div>
        );
      case 'Feedback':
        console.log(confDetails.feedbacks);
        return (
          <div className='flex flex-col gap-10'>
            {confDetails.feedbacks.map((feedback: any) => (
              <ToolItem key={feedback.id} tool={feedback} />
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Layouts className='grid grid-cols-10 col-span-10 gap-50'>
      <motion.div ref={firstDivRef} className='col-span-10 lg:col-span-6 flex flex-col gap-25 h-fit' variants={fadeIn}>
        {!loading && confConcepts?.length > 0 && (
          <LongCarrousel
            perPage={3}
            perMove={1}
            autowidth={true}
            data={confConcepts}
            renderSlide={(item) => <KeywordsCard key={item.id} onSearchClick={handleKeywordClick} word={item.title} />}
          />
        )}
        {loading ? (
          <ConfOverviewSkeleton />
        ) : (
          <ExpOverviewCard
            id={confDetails.id}
            title={confDetails.title}
            personnes={confDetails.acteurs}
            medias={confDetails.associatedMedia}
            fullUrl={confDetails.url}
            currentTime={currentVideoTime}
            buttonText='Voir plus'
            percentage={confDetails.percentage}
            status={confDetails.status}
          />
        )}
        {loading ? <ExpDetailsSkeleton></ExpDetailsSkeleton> : <ExpDetailsCard date={confDetails.date} actants={confDetails.actants} description={confDetails.description} />}
      </motion.div>
      <motion.div style={{ height: equalHeight || 'auto' }} className='col-span-10 lg:col-span-4 flex flex-col gap-50 overflow-hidden' variants={fadeIn}>
        <div className='flex w-full flex-col gap-20 flex-grow min-h-0 overflow-hidden'>
          <motion.div style={{ height: equalHeight || 'auto' }} className='col-span-10 lg:col-span-4 flex flex-col gap-50 overflow-hidden' variants={fadeIn}>
            <div className='flex w-full flex-col gap-20 flex-grow min-h-0 overflow-hidden'>
              {/* Header avec titre à gauche et dropdown à droite */}
              <div className='flex items-center justify-between w-full'>
                {/* Titre à gauche */}
                <h2 className='text-24 font-medium text-c6'>{selectedOption?.title}</h2>

                {/* Dropdown à droite - Version custom */}
                <div className='relative'>
                  <Dropdown>
                    <DropdownTrigger className='p-0'>
                      <div
                        className='hover:bg-c3 shadow-[inset_0_0px_15px_rgba(255,255,255,0.05)] cursor-pointer bg-c2 flex flex-row rounded-8 border-2 border-c3 items-center justify-center px-15 py-10 text-16 gap-10 text-c6 transition-all ease-in-out duration-200'
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                        <span className='text-16 font-normal text-c6'>Autres choix</span>
                      </div>
                    </DropdownTrigger>

                    <DropdownMenu aria-label='View options' className='p-10 bg-c2 rounded-12'>
                      {viewOptions.map((option) => (
                        <DropdownItem key={option.key} className={`p-0 ${selected === option.key ? 'bg-action' : ''}`} onClick={() => handleOptionSelect(option.key)}>
                          <div
                            className={`flex items-center w-full px-15 py-10 rounded-8 transition-all ease-in-out duration-200 hover:bg-c3 ${
                              selected === option.key ? 'bg-action text-selected font-medium' : 'text-c6'
                            }`}>
                            <span className='text-16'>{option.title}</span>
                          </div>
                        </DropdownItem>
                      ))}
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </div>

              {/* Contenu principal */}
              <div className='flex-grow min-h-0 overflow-auto'>{renderContent()}</div>
            </div>
          </motion.div>
        </div>
      </motion.div>
      {recommendations.length > 0 && (
        <motion.div className='col-span-10 h-full lg:col-span-4 flex flex-col gap-50 flex-grow' variants={fadeIn}>
          <FullCarrousel
            title='Autres expérimentations'
            perPage={2}
            perMove={1}
            data={recommendations}
            renderSlide={(item) => (
              <motion.div initial='hidden' animate='visible' variants={fadeIn} key={item.id}>
                <SmConfCard {...item} />
              </motion.div>
            )}
          />
        </motion.div>
      )}

      <SearchModal ref={searchModalRef} notrigger={true} />
    </Layouts>
  );
};

interface ToolItemProps {
  tool: {
    id: string | number;
    title: string;
    url?: string;
    thumbnail?: string;
    description?: string;
  };
}

export const ToolItem: React.FC<ToolItemProps> = ({ tool }) => {
  const [isToolHovered, setIsToolHovered] = useState(false);

  return (
    <div
      className={`w-full flex flex-row justify-between border-2 rounded-12 items-center gap-25 transition-transform-colors-opacity ${isToolHovered ? 'border-c6' : 'border-c3'}`}
      onMouseEnter={() => setIsToolHovered(true)}
      onMouseLeave={() => setIsToolHovered(false)}>
      <Link className='w-full gap-25 py-25 pl-25 flex flex-row justify-between' to={tool.url ?? '#'} target='_blank'>
        <div className={`flex flex-row gap-4 items-start`}>
          {tool.thumbnail && (
            <div className='flex-shrink-0'>
              <img src={tool.thumbnail} alt='thumbnail' className='w-50 object-cover rounded-6' />
            </div>
          )}
          <div className='w-full flex flex-col gap-10'>
            <p className='text-c6 text-16'>{tool.title}</p>
            {tool.description && <p className='text-c4 text-14 leading-[120%] text-overflow-ellipsis line-clamp-3 w-full'>{tool.description}</p>}
          </div>
        </div>
      </Link>
      <div className='flex flex-col h-full py-25 pr-25'>
        <AnnotationDropdown id={Number(tool.id)} content={tool.description} image={tool.thumbnail} type='Bibliographie' />
      </div>
    </div>
  );
};
