import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, Variants } from 'framer-motion';
import { FullCarrousel } from '@/components/ui/Carrousels';
import { ColloqueIcon, ExperimentationIcon, OeuvreIcon, SeminaireIcon } from '@/components/ui/icons';



// Animation variants for cards
const cardVariants: Variants = {
  hidden: { 
    opacity: 0, 
  },
  visible: (index: number) => ({
    opacity: 1,
    transition: { 
      duration: 0.8, 
      delay: 0.1+ index * 0.2,
      ease: "easeInOut"
    },
  }),
};


// Corpus cards configuration
const corpusCards = [
  {
    id: 'seminaires',
    icon: SeminaireIcon,
    title: 'Séminaires',
    description: 'Toutes les séances du séminaire Arcanes, de 2021 à aujourd\'hui.',
    path: '/corpus/seminaires'
  },
  {
    id: 'oeuvres',
    icon: OeuvreIcon,
    title: 'Œuvres',
    description: 'Collections d\'œuvres artistiques et créatives du projet.',
    path: '/corpus/oeuvres'
  },
  {
    id: 'experimentations',
    icon: ExperimentationIcon,
    title: 'Expérimentations',
    description: 'Projets expérimentaux et recherches innovantes.',
    path: '/corpus/experimentations'
  },
  {
    id: 'colloques',
    icon: ColloqueIcon,
    title: 'Colloques',
    description: 'Événements académiques et rencontres scientifiques.',
    path: '/corpus/colloques'
  }
];


export const CorpusSection: React.FC = () => {
  const navigate = useNavigate();

  // Navigation handler
  const handleNavigation = useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  // Render animated corpus card
  const renderCorpusCard = (card: typeof corpusCards[0], index: number) => {
    const IconComponent = card.icon;
    
    return (
    <motion.div
        key={card.id}
        custom={index}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        onClick={() => handleNavigation(card.path)}
        className="shadow-[inset_0_0px_50px_rgba(255,255,255,0.06)] border-c3 border-2 cursor-pointer p-40 rounded-30 justify-between flex flex-col gap-40 hover:bg-c2 h-full transition-all ease-in-out duration-200"
    >
        <IconComponent size={40} className="text-c6" />
        <div className="flex flex-col gap-10">
        <p className="text-32 font-semibold transition-all ease-in-out duration-200 text-c6">
            {card.title}
        </p>
        <p className="text-16 text-c5 font-extralight transition-all ease-in-out duration-200">
            {card.description}
        </p>
        </div>
    </motion.div>
    );
  };

  return (
    <FullCarrousel
      title="Explorer le corpus"
      perPage={3}
      perMove={1}
      data={corpusCards}
      renderSlide={(card, index) => renderCorpusCard(card, index)}
    />
  );
};