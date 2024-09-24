import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar } from '@/components/Navbar/Navbar';
import { Scrollbar } from '@/components/Utils/Scrollbar';
import { motion, Variants } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { filterBySearch } from '../services/api';
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




export const Recherche: React.FC = () => {
  const location = useLocation();
  const [sortOrder, setSortOrder] = useState<'croissant' | 'decroissant'>('croissant');
  const [searchQuery, setQuery] = useState('');
  const [filteredActants, setFilteredActants] = useState<any>(null);
  const [filteredConferences, setFilteredConferences] = useState<any>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchQuery = params.get('query') || '';
    setQuery(searchQuery);
  }, [location.search]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchQuery = params.get('query') || '';
    setQuery(searchQuery);

    const fetchAndFilterData = async () => {
      const filteredActants = await filterBySearch(searchQuery);
      console.log(filteredActants)
      setFilteredActants(filteredActants);
      setFilteredConferences(filteredConferences);
    };

    fetchAndFilterData();
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
              <SearchBar Nombre={90} onSelectionChange={handleSelectionChange} />
              {/* <SearchResults conferenciers={sortedConferenciers} seminaires={sortedSeminaires} /> */}
            </div>
          </motion.div>
        </motion.main>
      </Scrollbar>
    </div>
  );
};
