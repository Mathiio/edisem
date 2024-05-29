import React from 'react';
import { Navbar } from '@/components/Navbar/Navbar';
import { Scrollbar } from '@/components/Utils/Scrollbar';
import { motion, Variants } from 'framer-motion';
import { RechercheBar } from '@/components/Recherche/RechercheBar';
import { RechercheResultat } from '@/components/Recherche/RechercheResultat';

const containerVariants: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 80, damping: 15 },
  },
};

const conferenciers = [
  {
    name: 'Samuel Szoniecky',
    universite: 'Université Paris 8 Vincennes-Saint-Denis',
    keyword: ['Régimes performatifs', 'Canular', 'Fiction'],
    intervention: '3 interventions',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Sunflower_from_Silesia2.jpg/1200px-Sunflower_from_Silesia2.jpg',
  },
  {
    name: 'Orélie Desfriches Doria',
    universite: 'Université Paris 8 Vincennes-Saint-Denis',
    keyword: ['Régimes performatifs', 'Canular', 'Fiction'],
    intervention: '2 interventions',
  },
];

const seminaires = [
  {
    name: 'L’étude des controverses : littéracie des fake news et formation à l’esprit',
    conferencier: 'Larrue Jean-Marc',
    date: '2021-02-19',
    keyword: ['Régimes performatifs', 'Canular', 'Fiction'],
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Sunflower_from_Silesia2.jpg/1200px-Sunflower_from_Silesia2.jpg',
  },
  {
    name: 'L’illusion est un objet. Perspectives néomatérialistes sur les arts trompeurs',
    conferencier: 'Larrue Jean-Marc',
    date: '2021-02-19',
    keyword: ['Régimes performatifs', 'Canular', 'Fiction'],
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Sunflower_from_Silesia2.jpg/1200px-Sunflower_from_Silesia2.jpg',
  },
  {
    name: 'L’illusion est un objet. Perspectives néomatérialistes sur les arts trompeurs',
    conferencier: 'Larrue Jean-Marc',
    date: '2021-02-19',
    keyword: ['Régimes performatifs', 'Canular', 'Fiction'],
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Sunflower_from_Silesia2.jpg/1200px-Sunflower_from_Silesia2.jpg',
  },
  {
    name: 'L’illusion est un objet. Perspectives néomatérialistes sur les arts trompeurs',
    conferencier: 'Larrue Jean-Marc',
    date: '2021-02-19',
    keyword: ['Régimes performatifs', 'Canular', 'Fiction'],
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Sunflower_from_Silesia2.jpg/1200px-Sunflower_from_Silesia2.jpg',
  },
];

export const Recherche: React.FC = () => {
  const totalConferenciers = conferenciers.length;
  const totalSeminaires = seminaires.length;
  const totalResultats = totalConferenciers + totalSeminaires;

  return (
    <div className='relative h-screen overflow-hidden'>
      <Scrollbar>
        <motion.main
          className='mx-auto max-w-screen-2xl w-full max-w-xl grid grid-cols-10 xl:gap-75 gap-50 p-25 transition-all ease-in-out duration-200'
          initial='hidden'
          animate='visible'
          variants={containerVariants}>
          <motion.div className='col-span-10' variants={itemVariants}>
            <Navbar />
          </motion.div>
          <motion.div className='col-span-10 flex flex-col items-center' variants={itemVariants}>
            <div className='w-2/3 flex flex-col gap-50'>
              <RechercheBar Nombre={totalResultats} />
              <RechercheResultat conferenciers={conferenciers} seminaires={seminaires} />
            </div>
          </motion.div>
        </motion.main>
      </Scrollbar>
    </div>
  );
};
