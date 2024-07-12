import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar/Navbar';
import { Scrollbar } from '@/components/Utils/Scrollbar';
import { motion, Variants } from 'framer-motion';
import { SearchBar } from '@/components/search/SearchBar';
import { SearchResults } from '@/components/search/SearchResults';

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
    name: 'A L’étude des controverses : littéracie des fake news et formation à l’esprit',
    conferencier: 'Larrue Jean-Marc',
    date: '2021-02-19',
    keyword: ['Régimes performatifs', 'Canular', 'Fiction'],
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Sunflower_from_Silesia2.jpg/1200px-Sunflower_from_Silesia2.jpg',
  },
  {
    name: 'B L’illusion est un objet. Perspectives néomatérialistes sur les arts trompeurs',
    conferencier: 'Larrue Jean-Marc',
    date: '2021-02-19',
    keyword: ['Régimes performatifs', 'Canular', 'Fiction'],
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Sunflower_from_Silesia2.jpg/1200px-Sunflower_from_Silesia2.jpg',
  },
  {
    name: 'C L’illusion est un objet. Perspectives néomatérialistes sur les arts trompeurs',
    conferencier: 'Larrue Jean-Marc',
    date: '2021-02-19',
    keyword: ['Régimes performatifs', 'Canular', 'Fiction'],
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Sunflower_from_Silesia2.jpg/1200px-Sunflower_from_Silesia2.jpg',
  },
  {
    name: 'D L’illusion est un objet. Perspectives néomatérialistes sur les arts trompeurs',
    conferencier: 'Larrue Jean-Marc',
    date: '2021-02-19',
    keyword: ['Régimes performatifs', 'Canular', 'Fiction'],
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Sunflower_from_Silesia2.jpg/1200px-Sunflower_from_Silesia2.jpg',
  },
];

export const Recherche: React.FC = () => {
  const [sortOrder, setSortOrder] = useState<'croissant' | 'decroissant'>('croissant');

  const handleSelectionChange = (keys: Set<string>) => {
    let newSortOrder: 'croissant' | 'decroissant' = 'croissant';

    // Votre logique de tri en fonction des clés sélectionnées
    if (keys.has('croissant')) {
      newSortOrder = 'croissant';
    } else if (keys.has('decroissant')) {
      newSortOrder = 'decroissant';
    }

    // Mettre à jour l'état sortOrder
    setSortOrder(newSortOrder);
  };
  const sortResults = () => {
    let sortedConferenciers = [...conferenciers];
    let sortedSeminaires = [...seminaires];

    switch (sortOrder) {
      case 'croissant':
        sortedConferenciers.sort((a, b) => a.name.localeCompare(b.name));
        sortedSeminaires.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'decroissant':
        sortedConferenciers.sort((a, b) => b.name.localeCompare(a.name));
        sortedSeminaires.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        // Pas de tri
        break;
    }

    return { conferenciers: sortedConferenciers, seminaires: sortedSeminaires };
  };

  const { conferenciers: sortedConferenciers, seminaires: sortedSeminaires } = sortResults();
  const totalResultats = sortedConferenciers.length + sortedSeminaires.length;

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
              <SearchBar Nombre={totalResultats} onSelectionChange={handleSelectionChange} />
              <SearchResults conferenciers={sortedConferenciers} seminaires={sortedSeminaires} />
            </div>
          </motion.div>
        </motion.main>
      </Scrollbar>
    </div>
  );
};
