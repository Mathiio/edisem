import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, Variants } from 'framer-motion';
import { FullCarrousel } from '@/components/ui/Carrousels';

// Animation variants for cards
const cardVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: (index: number) => ({
    opacity: 1,
    transition: {
      duration: 0.8,
      delay: 0.1 + index * 0.2,
      ease: 'easeInOut',
    },
  }),
};

// Corpus cards configuration
const corpusCards = [
  {
    id: 'experimentations',
    title: 'Expérimentations',
    description: 'Expérimentations par les étudiants',
    path: '/espace-etudiant/experimentations',
  },
  {
    id: 'feedbacks',
    title: 'Feedbacks',
    description: 'Feedbacks par les étudiants',
    path: '/espace-etudiant/feedbacks',
  },
  {
    id: 'tools',
    title: 'Outils',
    description: 'Outils par les étudiants',
    path: '/espace-etudiant/tools',
  },
];

export const RessourcesSection: React.FC = () => {
  const navigate = useNavigate();

  // Navigation handler
  const handleNavigation = useCallback(
    (path: string) => {
      navigate(path);
    },
    [navigate],
  );

  // Render animated corpus card
  const renderRessourceCard = (card: (typeof corpusCards)[0], index: number) => {
    return (
      <motion.div
        key={card.id}
        custom={index}
        initial='hidden'
        animate='visible'
        variants={cardVariants}
        onClick={() => handleNavigation(card.path)}
        className='shadow-[inset_0_0px_50px_rgba(255,255,255,0.06)] border-c3 border-2 cursor-pointer p-40 rounded-30 justify-between flex flex-col gap-40 hover:bg-c2 h-full transition-all ease-in-out duration-200'>
        <div className='flex flex-col gap-10'>
          <p className='text-32 font-semibold transition-all ease-in-out duration-200 text-c6'>{card.title}</p>
          <p className='text-16 text-c5 font-extralight transition-all ease-in-out duration-200'>{card.description}</p>
        </div>
      </motion.div>
    );
  };

  return <FullCarrousel title='Ressources' perPage={3} perMove={1} data={corpusCards} renderSlide={(card, index) => renderRessourceCard(card, index)} />;
};
