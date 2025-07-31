import { ExpDetailsCard, ExpDetailsSkeleton } from '@/components/features/conference/ExpDetails';
import { ConfOverviewSkeleton, ExpOverviewCard } from '@/components/features/conference/ExpOverview';
import { Layouts } from '@/components/layout/Layouts';
import { getActants, getExperimentations } from '@/lib/Items';
import { motion, Variants } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Tabs, Tab } from '@heroui/react';
import { ToolItem } from './experimentation';
import { AnnotationDropdown } from '@/components/features/conference/AnnotationDropdown';

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: index * 0.15 },
  }),
};

// Configuration des catégories avec leurs propriétés correspondantes
const FEEDBACK_CATEGORIES = [
  {
    key: 'Experimentation',
    title: 'Expérimentation',
    subcategories: [
      { key: 'achievements', label: 'Succès / Avancées notables' },
      { key: 'issues', label: 'Problèmes rencontrés' },
      { key: 'methodsUsed', label: 'Solutions apportées' },
    ],
  },
  {
    key: 'Reactions',
    title: 'Réactions',
    subcategories: [
      { key: 'reviews', label: 'Réactions du public ou des pairs' },
      { key: 'instructionalMethod', label: "Suggestions pour d'autres expérimentateur·ices" },
    ],
  },
  {
    key: 'Perspectives',
    title: 'Perspectives',
    subcategories: [
      { key: 'potentialActions', label: 'Prolongements possibles' },
      { key: 'coverage', label: "Autres contextes d'application" },
      { key: 'workExamples', label: 'Modifications envisagées' },
    ],
  },
];

// Composant pour afficher le contenu d'une catégorie
const CategoryContent: React.FC<{
  category: (typeof FEEDBACK_CATEGORIES)[0];
  feedbackDetails: any;
}> = ({ category, feedbackDetails }) => {
  // Vérifier si au moins une propriété de la catégorie existe
  const hasData = category.subcategories.some((subcategory) => feedbackDetails[subcategory.key] && feedbackDetails[subcategory.key].trim() !== '');

  if (!hasData) {
    // Fallback vers l'ancien comportement avec ToolItem
    return <ToolItem tool={feedbackDetails} />;
  }

  return (
    <div className='flex flex-col gap-10'>
      {category.subcategories.map((subcategory) => {
        const content = feedbackDetails[subcategory.key];

        if (!content || content.trim() === '') return null;

        return (
          <div key={subcategory.key} className='flex flex-col gap-10 '>
            <h3 className='text-c6 font-semibold text-16 '>{subcategory.label}</h3>
            <div className='bg-c1 rounded-8 p-25 border-2 border-c3'>
              <p className='text-c5 text-14 leading-[125%] '>{content}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const Feedback: React.FC = () => {
  const firstDivRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [equalHeight] = useState<number | null>(null);
  const { id } = useParams<{ id: string }>();
  const [feedbackDetails, setFeedbackDetails] = useState<any>(null);
  const [selected, setSelected] = useState<string>('Experimentation');

  const fetchFeedbackData = async () => {
    setLoading(true);
    try {
      const [experimentations, actantsData] = await Promise.all([getExperimentations(), getActants()]);

      // Vérification que experimentations est un tableau
      if (!Array.isArray(experimentations)) {
        console.warn('Les expérimentations ne sont pas dans le format attendu');
        setFeedbackDetails(null);
        return;
      }

      // Recherche du feedback dans toutes les expérimentations
      let feedbackFound = null;
      for (const exp of experimentations) {
        if (exp.feedbacks && Array.isArray(exp.feedbacks)) {
          feedbackFound = exp.feedbacks.find((feedback: any) => String(feedback.id) === String(id));
          if (feedbackFound) {
            // Ajouter les informations de l'expérimentation parente
            feedbackFound.experimentation = {
              id: exp.id,
              title: exp.title,
              url: exp.url,
              date: exp.date,
            };
            break;
          }
        }
      }

      if (feedbackFound) {
        // Ajoute l'URL de l'expérimentation dans le feedback
        const feedbackWithUrl = {
          ...feedbackFound,
          url: `/experimentation/${feedbackFound.experimentation?.id}`,
          date: feedbackFound.experimentation?.date ?? null,
        };

        // Enrichir les contributeurs avec les données des actants
        const enrichedContributors = feedbackWithUrl.contributors.map((contributor: any) => {
          const actant = actantsData.find((a: any) => String(a.id) === String(contributor.id));
          return {
            ...contributor,
            actant: actant,
          };
        });

        feedbackWithUrl.actant = enrichedContributors[0].actant;

        setFeedbackDetails(feedbackWithUrl);
        console.log(feedbackWithUrl);
      } else {
        console.warn(`Aucun feedback trouvé avec l'ID: ${id}`);
        setFeedbackDetails(null);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données de feedback:', error);
      setFeedbackDetails(null);
      // Optionnel : vous pourriez aussi setter un état d'erreur
      // setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour déterminer les catégories disponibles
  const getAvailableCategories = () => {
    if (!feedbackDetails) return [];

    return FEEDBACK_CATEGORIES.filter((category) => {
      // Vérifier si au moins une sous-catégorie a du contenu
      return category.subcategories.some((subcategory) => {
        const content = feedbackDetails[subcategory.key];
        return content && content.trim() !== '';
      });
    });
  };

  // Mise à jour de l'onglet sélectionné quand les données changent
  useEffect(() => {
    if (feedbackDetails) {
      const availableCategories = getAvailableCategories();
      if (availableCategories.length > 0 && !availableCategories.find((cat) => cat.key === selected)) {
        setSelected(availableCategories[0].key);
      }
    }
  }, [feedbackDetails]);

  useEffect(() => {
    fetchFeedbackData();
  }, [id]);

  const availableCategories = getAvailableCategories();

  return (
    <Layouts className='grid grid-cols-10 col-span-10 gap-50'>
      <motion.div ref={firstDivRef} className='col-span-10 lg:col-span-6 flex flex-col gap-25 h-fit' variants={fadeIn}>
        {loading ? (
          <ConfOverviewSkeleton />
        ) : (
          feedbackDetails && (
            <ExpOverviewCard
              id={feedbackDetails.id}
              title={feedbackDetails.title}
              actant={feedbackDetails.actant?.firstname + ' ' + feedbackDetails.actant?.lastname}
              actantId={feedbackDetails.actant?.id}
              university={feedbackDetails.actant?.universities?.[0]?.name || ''}
              picture={feedbackDetails.actant?.picture || ''}
              fullUrl={feedbackDetails.url}
              medias={feedbackDetails.associatedMedia}
              currentTime={0}
              buttonText='Expérience associée'
            />
          )
        )}
        {loading ? <ExpDetailsSkeleton /> : feedbackDetails && <ExpDetailsCard date={feedbackDetails.date} description={feedbackDetails.description} />}
      </motion.div>

      <motion.div style={{ height: equalHeight || 'auto' }} className='col-span-10 lg:col-span-4 flex flex-col gap-50 overflow-hidden' variants={fadeIn}>
        <div className='flex w-full flex-col gap-20 flex-grow min-h-0 overflow-hidden'>
          <Tabs
            classNames={{
              tabList: 'w-full h-fit gap-10 bg-c0 rounded-8',
              cursor: 'w-full',
              tab: 'w-full bg-c2 data-[selected=true]:bg-action rounded-8 p-10 data-[hover-unselected=true]:opacity-100 data-[hover-unselected=true]:bg-c3 transition-all ease-in-out duration-200',
              tabContent: 'group-data-[selected=true]:text-selected group-data-[selected=true]:font-medium text-c6',
              panel: 'flex-grow min-h-0 overflow-auto',
            }}
            aria-label='Options'
            selectedKey={selected}
            onSelectionChange={(key: React.Key) => setSelected(key as string)}>
            {availableCategories.map((category) => (
              <Tab key={category.key} title={category.title} className='px-0 py-0 flex'>
                {selected === category.key && <CategoryContent category={category} feedbackDetails={feedbackDetails} />}
              </Tab>
            ))}
          </Tabs>
        </div>
      </motion.div>
    </Layouts>
  );
};

interface FeedbackItemProps {
  item: {
    id: string | number;
    title: string;
    category: string;
    url?: string;
    thumbnail?: string;
    description?: string;
  };
}

export const FeedbackItem: React.FC<FeedbackItemProps> = ({ item }) => {
  const [isToolHovered, setIsToolHovered] = useState(false);

  return (
    <div>
      <div className='flex flex-row gap-10'>
        <p className='text-c6 text-16'>{item.category}</p>
      </div>
      <div
        className={`w-full flex flex-row justify-between border-2 rounded-12 items-center gap-25 transition-transform-colors-opacity ${isToolHovered ? 'border-c6' : 'border-c3'}`}
        onMouseEnter={() => setIsToolHovered(true)}
        onMouseLeave={() => setIsToolHovered(false)}>
        <Link className='w-full gap-25 py-25 pl-25 flex flex-row justify-between' to={item.url ?? '#'} target='_blank'>
          <div className={`flex flex-row gap-4 items-start`}>
            {item.thumbnail && (
              <div className='flex-shrink-0'>
                <img src={item.thumbnail} alt='thumbnail' className='w-50 object-cover rounded-6' />
              </div>
            )}
            <div className='w-full flex flex-col gap-10'>
              <p className='text-c6 text-16'>{item.title}</p>
              {item.description && <p className='text-c4 text-14 leading-[120%] text-overflow-ellipsis line-clamp-3 w-full'>{item.description}</p>}
            </div>
          </div>
        </Link>
        <div className='flex flex-col h-full py-25 pr-25'>
          <AnnotationDropdown id={Number(item.id)} content={item.description} image={item.thumbnail} type='Bibliographie' />
        </div>
      </div>
    </div>
  );
};
