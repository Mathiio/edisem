import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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

// Dummy data for demonstration purposes
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
  },
  {
    name: 'B L’illusion est un objet. Perspectives néomatérialistes sur les arts trompeurs',
    conferencier: 'Larrue Jean-Marc',
    date: '2021-02-19',
    keyword: ['Régimes performatifs', 'Canular', 'Fiction'],
  },
  {
    name: 'C L’illusion est un objet. Perspectives néomatérialistes sur les arts trompeurs',
    conferencier: 'Larrue Jean-Marc',
    date: '2021-02-19',
    keyword: ['Régimes performatifs', 'Canular', 'Fiction'],
  },
  {
    name: 'D L’illusion est un objet. Perspectives néomatérialistes sur les arts trompeurs',
    conferencier: 'Larrue Jean-Marc',
    date: '2021-02-19',
    keyword: ['Régimes performatifs', 'Canular', 'Fiction'],
  },
];

export const Recherche: React.FC = () => {
  const location = useLocation();
  const [sortOrder, setSortOrder] = useState<'croissant' | 'decroissant'>('croissant');
  const [query, setQuery] = useState('');
  const [filteredConferenciers, setFilteredConferenciers] = useState(conferenciers);
  const [filteredSeminaires, setFilteredSeminaires] = useState(seminaires);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchQuery = params.get('query') || '';
    setQuery(searchQuery);

    if (searchQuery) {
      // Replace with your API call
      const filteredConfs = conferenciers.filter((conf) => conf.name.toLowerCase().includes(searchQuery.toLowerCase()));
      const filteredSems = seminaires.filter((sem) => sem.name.toLowerCase().includes(searchQuery.toLowerCase()));

      setFilteredConferenciers(filteredConfs);
      setFilteredSeminaires(filteredSems);
    }
  }, [location.search]);

  const handleSelectionChange = (keys: Set<string>) => {
    let newSortOrder: 'croissant' | 'decroissant' = 'croissant';

    if (keys.has('croissant')) {
      newSortOrder = 'croissant';
    } else if (keys.has('decroissant')) {
      newSortOrder = 'decroissant';
    }

    setSortOrder(newSortOrder);
  };

  const sortResults = () => {
    let sortedConferenciers = [...filteredConferenciers];
    let sortedSeminaires = [...filteredSeminaires];

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
