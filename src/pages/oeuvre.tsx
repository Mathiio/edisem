import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getOeuvres, getActants, getTools, getKeywords, getStudents } from '@/lib/Items';
import { motion, Variants } from 'framer-motion';
import { FullCarrousel, LongCarrousel } from '@/components/ui/Carrousels';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react';
import { KeywordsCard } from '@/components/features/conference/KeywordsCards';
import { Layouts } from '@/components/layout/Layouts';
import { SmConfCard } from '@/components/features/home/ConfCards';
import SearchModal, { SearchModalRef } from '@/components/layout/SearchModal';
import * as Items from '@/lib/Items';
import { RecitiaOverviewCard, RecitiaOverviewSkeleton } from '@/components/features/miseEnRecit/RecitiaOverview';
import { RecitiaDetailsCard, RecitiaDetailsSkeleton } from '@/components/features/miseEnRecit/RecitiaDetails';
import { AnnotationDropdown } from '@/components/features/conference/AnnotationDropdown';
import { ArrowIcon } from '@/components/ui/icons';

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: index * 0.15 },
  }),
};

const viewOptions = [
  { key: 'ContentScient', title: 'Contenus scientifiques' },
  { key: 'ContentCultu', title: 'Contenus culturels' },
];

export const Oeuvre: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [currentVideoTime] = useState<number>(0);
  const [oeuvreDetails, setOeuvreDetails] = useState<any>(null);
  const [recommendedConfs, setRecommendedConfs] = useState<any[]>([]);

  const [, setOeuvreTools] = useState<any[]>([]);
  const [oeuvreKeywords, setOeuvreKeywords] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);
  const firstDivRef = useRef<HTMLDivElement>(null);
  const [equalHeight, setEqualHeight] = useState<number | null>(null);
  const searchModalRef = useRef<SearchModalRef>(null);
  const [selected, setSelected] = useState('ContentScient');
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

  const fetchRecommendedConfs = async (recommendationIds: string[]) => {
    setLoadingRecommendations(true);
    try {
      const recommendationsPromises = recommendationIds.map((recId) => Items.getSeminarConfs(Number(recId)));
      const recommendations = await Promise.all(recommendationsPromises);
      setRecommendedConfs(recommendations);
    } catch (error) {
      console.error('Error fetching recommended conferences:', error);
      setRecommendedConfs([]);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  useEffect(() => {}, [currentVideoTime]);

  const fetchOeuvreData = useCallback(async () => {
    setLoading(true);
    try {
      const [recitIas, actants, students, tools, keywords] = await Promise.all([getOeuvres(), getActants(), getStudents(), getTools(), getKeywords()]);
      console.log(recitIas);
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

      const keywordMap = new Map();
      keywords.forEach((k: any) => {
        keywordMap.set(k.id, k);
        keywordMap.set(String(k.id), k);
        keywordMap.set(Number(k.id), k);
      });

      const oeuvre = recitIas.find((r: any) => String(r.id) === String(id));

      if (oeuvre) {
        // ✅ NOUVEAU: Traiter le tableau actants
        if (oeuvre.actants && Array.isArray(oeuvre.actants)) {
          // Enrichir tous les actants
          oeuvre.enrichedActants = oeuvre.actants
            .map((actant: any) => {
              // Si l'actant est déjà une chaîne (nom + organisation), on la garde telle quelle
              if (typeof actant === 'string' && !/^\d{5}$/.test(actant)) {
                return { displayName: actant };
              }

              // Sinon, c'est un ID numérique, on cherche dans les maps
              const actantId = actant;
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
          oeuvre.primaryActant = oeuvre.enrichedActants.length > 0 ? oeuvre.enrichedActants[0] : null;
        }

        // ✅ LEGACY: Gérer l'ancien système actant (au cas où)
        if (oeuvre.actant && !oeuvre.primaryActant) {
          // Si actant est déjà un objet complet, on le garde
          if (typeof oeuvre.actant === 'object' && oeuvre.actant.id) {
            oeuvre.primaryActant = oeuvre.actant;
          } else {
            // Si actant est juste un ID, on le cherche dans les maps
            const actantId = oeuvre.actant;
            oeuvre.primaryActant =
              actantMap.get(actantId) ||
              actantMap.get(Number(actantId)) ||
              actantMap.get(String(actantId)) ||
              studentMap.get(actantId) ||
              studentMap.get(Number(actantId)) ||
              studentMap.get(String(actantId)) ||
              null;
          }
        }

        // Enrichir les feedbacks et leurs contributors
        if (oeuvre.feedbacks) {
          oeuvre.feedbacks.forEach((feedback: any) => {
            if (feedback.contributors) {
              feedback.contributors = feedback.contributors.map((contributor: any) => {
                const contributorId = contributor.id;

                // Chercher dans actants
                let enrichedContributor = actantMap.get(contributorId) || actantMap.get(String(contributorId)) || actantMap.get(Number(contributorId)) || null;

                // Si pas trouvé dans actants, chercher dans students
                if (!enrichedContributor) {
                  enrichedContributor =
                    studentMap.get(contributorId) ||
                    studentMap.get(String(contributorId)) ||
                    studentMap.get(Number(contributorId)) ||
                    studentMap.get(String(contributorId)) ||
                    null;
                }

                // Retourner l'objet enrichi ou garder l'original
                return enrichedContributor || contributor;
              });
            }
          });
        }

        // Mapper les students si la propriété existe
        if (oeuvre.students) {
          oeuvre.students = oeuvre.students.map((s: any) => studentMap.get(s) || studentMap.get(Number(s)) || studentMap.get(String(s))).filter(Boolean);
        }

        setOeuvreTools(tools.filter((t: any) => oeuvre.technicalCredits?.includes(String(t.id))));

        setOeuvreKeywords(
          [
            ...(oeuvre.keywords || []),
            ...(oeuvre.risks || []),
            ...(oeuvre.roles || []),
            ...(oeuvre.scenarios || []),
            ...(oeuvre.themes || []),
            ...(oeuvre.processes || []),
            ...(oeuvre.affects || []),
          ]
            .map((word: any) => {
              // Si c'est déjà un objet avec un id, on le garde
              if (typeof word === 'object' && word !== null && 'id' in word) {
                return word;
              }

              // Sinon, on cherche dans la keywordMap pour enrichir
              const enrichedKeyword = keywordMap.get(word) || keywordMap.get(Number(word)) || keywordMap.get(String(word));

              // Retourner le keyword enrichi ou créer un objet avec le titre
              return enrichedKeyword || { title: word };
            })
            .filter(Boolean),
        );

        console.log(oeuvreKeywords);
        setOeuvreDetails(oeuvre);

        if (oeuvre.recommendations?.length) {
          fetchRecommendedConfs(oeuvre.recommendations);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOeuvreData();
  }, [id, fetchOeuvreData]);

  const handleKeywordClick = (searchTerm: string) => {
    // Ouvrir la modal de recherche avec le terme pré-rempli
    searchModalRef.current?.openWithSearch(searchTerm);
  };

  const renderContent = () => {
    if (!oeuvreDetails) {
      return <div>Loading...</div>; // or return null, or a loading skeleton
    }

    switch (selected) {
      case 'ContentScient':
        return (
          <div className='flex flex-col gap-10'>
            {(oeuvreDetails.referencesScient || []).map((reference: any) => (
              <ToolItem key={reference.id} tool={reference} />
            ))}
          </div>
        );
      case 'ContentCultu':
        return (
          <div className='flex flex-col gap-10'>
            {(oeuvreDetails.referencesCultu || []).map((reference: any) => (
              <ToolItem key={reference.id} tool={reference} />
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
        {!loading && oeuvreKeywords?.length > 0 && (
          <LongCarrousel
            perPage={3}
            perMove={1}
            autowidth={true}
            data={oeuvreKeywords}
            renderSlide={(item) => <KeywordsCard key={item.title} onSearchClick={handleKeywordClick} word={item.title} />}
          />
        )}
        {loading ? (
          <RecitiaOverviewSkeleton />
        ) : (
          <RecitiaOverviewCard
            id={oeuvreDetails.id}
            title={oeuvreDetails.title}
            personnes={oeuvreDetails.personne}
            medias={
              oeuvreDetails.associatedMedia && oeuvreDetails.associatedMedia.length > 0 ? oeuvreDetails.associatedMedia : oeuvreDetails.thumbnail ? [oeuvreDetails.thumbnail] : []
            }
            credits={oeuvreDetails.credits}
            fullUrl={oeuvreDetails.url}
            currentTime={currentVideoTime}
            buttonText='Voir plus'
          />
        )}
        {loading ? (
          <RecitiaDetailsSkeleton></RecitiaDetailsSkeleton>
        ) : (
          <RecitiaDetailsCard
            date={oeuvreDetails.date}
            description={oeuvreDetails.abstract}
            genre={oeuvreDetails.genre}
            medium={oeuvreDetails.medium}
            actants={oeuvreDetails.actants}
          />
        )}
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
                        <ArrowIcon size={12} className='rotate-90 text-c6' />
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
      {!loadingRecommendations && recommendedConfs.length > 0 && (
        <motion.div className='col-span-10 h-full lg:col-span-4 flex flex-col gap-50 flex-grow' variants={fadeIn}>
          <FullCarrousel
            title='Conférences associées'
            perPage={2}
            perMove={1}
            data={recommendedConfs}
            renderSlide={(item) => (
              <motion.div initial='hidden' animate='visible' variants={fadeIn} key={item.id}>
                {/* ✅ CORRIGÉ: Utiliser primaryActant au lieu de actant */}
                <SmConfCard key={item.id} id={item.id} title={item.title} actant={item.primaryActant?.firstname + ' ' + item.primaryActant?.lastname} url={item.url} />
              </motion.div>
            )}
          />
        </motion.div>
      )}
      <SearchModal ref={searchModalRef} notrigger={true} />
    </Layouts>
  );
};

// Les composants ToolItem et ActeurItem restent inchangés
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
