import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar/Navbar';
import { Scrollbar } from '@/components/Utils/Scrollbar';
import { motion, Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
import { SunIcon } from '@/components/Utils/icons';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  getKeyValue,
  Spinner,
} from '@nextui-org/react';
import { useAsyncList } from '@react-stately/data';
import { fetchData, Data } from '../services/api';

interface Item {
  name: string;
  height: string;
  mass: string;
  birth_year: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2, // Delays the appearance of each child by 0.3 seconds
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

export const Database: React.FC = () => {
  const [isLoading, setIsLoading] = React.useState(true);

  let list = useAsyncList<Item>({
    async load() {
      let res = await fetch('https://tests.arcanes.ca/omk/api');
      let json = await res.json();
      setIsLoading(false);

      return {
        items: json.results,
      };
    },
    async sort({ items, sortDescriptor }) {
      return {
        items: items.sort((a, b) => {
          let first = a[sortDescriptor.column as keyof Item];
          let second = b[sortDescriptor.column as keyof Item];
          let cmp = (parseInt(first) || first) < (parseInt(second) || second) ? -1 : 1;

          if (sortDescriptor.direction === 'descending') {
            cmp *= -1;
          }

          return cmp;
        }),
      };
    },
  });
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const handleCardClick = (title: string) => {
    setSelectedCard(title);
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
          <motion.div className='col-span-10 flex flex-col gap-50' variants={itemVariants}>
            {selectedCard ? (
              <div>
                <button onClick={() => setSelectedCard(null)} className='mr-2'>
                  {/* Ajoutez ici votre icône de flèche retour */}
                  &larr; Retour
                </button>
                <h2>{selectedCard}</h2>
                <Table
                  aria-label='Example table with client side sorting'
                  sortDescriptor={list.sortDescriptor}
                  onSortChange={list.sort}
                  classNames={{
                    table: 'min-h-[400px]',
                  }}>
                  <TableHeader>
                    <TableColumn key='name' allowsSorting>
                      Name
                    </TableColumn>
                    <TableColumn key='height' allowsSorting>
                      Height
                    </TableColumn>
                    <TableColumn key='mass' allowsSorting>
                      Mass
                    </TableColumn>
                    <TableColumn key='birth_year' allowsSorting>
                      Birth year
                    </TableColumn>
                  </TableHeader>
                  <TableBody items={list.items} isLoading={isLoading} loadingContent={<Spinner label='Loading...' />}>
                    {(item: Item) => (
                      <TableRow key={item.name}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.height}</TableCell>
                        <TableCell>{item.mass}</TableCell>
                        <TableCell>{item.birth_year}</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 grid-rows-2 gap-25 font-semibold text-default-600'>
                <Link
                  to='#'
                  onClick={() => handleCardClick('Conférences')}
                  className=' flex  justify-center items-center min-w-[200px] min-h-[300px] border-2 border-default-300 hover:border-default-action transition-colors duration-300 rounded-8 flex-col gap-10'>
                  <SunIcon size={24} className='text-default-action' />
                  Conférences
                </Link>
                <div className=' grid grid-rows-2 min-w-[200px] min-h-[200px] gap-25'>
                  <Link
                    to='#'
                    className='flex justify-center items-center border-2 border-default-300 hover:border-default-action transition-colors duration-300 rounded-8 flex-col gap-10'>
                    <SunIcon size={24} className='text-default-action' />
                    Éditions
                  </Link>
                  <Link
                    to='#'
                    className='flex justify-center items-center border-2 border-default-300 hover:border-default-action transition-colors duration-300 rounded-8 flex-col gap-10'>
                    <SunIcon size={24} className='text-default-action' />
                    Séances
                  </Link>
                </div>
                <Link
                  to='#'
                  className=' flex justify-center items-center min-w-[200px] min-h-[200px] border-2 border-default-300 hover:border-default-action transition-colors duration-300 rounded-8 flex-col gap-10'>
                  <SunIcon size={24} className='text-default-action' />
                  Mots clés
                </Link>
                <Link
                  to='#'
                  className=' flex justify-center items-center min-w-[200px] min-h-[200px] border-2 border-default-300 hover:border-default-action transition-colors duration-300  rounded-8 flex-col gap-10'>
                  <SunIcon size={24} className='text-default-action' />
                  Conférenciers
                </Link>

                <div className=' grid grid-cols-2 grid-rows-2 aspect-w-1 aspect-h-1 min-w-[200px] min-h-[200px] gap-25 '>
                  <Link
                    to='#'
                    className='flex justify-center items-center border-2 border-default-300 hover:border-default-action transition-colors duration-300 rounded-8 flex-col gap-10'>
                    <SunIcon size={24} className='text-default-action' />
                    Saisons
                  </Link>
                  <Link
                    to='#'
                    className='flex justify-center items-center border-2 border-default-300 hover:border-default-action transition-colors duration-300 rounded-8 flex-col gap-10'>
                    <SunIcon size={24} className='text-default-action' />
                    Thèmes
                  </Link>
                  <Link
                    to='#'
                    className='flex justify-center items-center border-2 border-default-300 hover:border-default-action transition-colors duration-300 rounded-8 flex-col gap-10'>
                    <SunIcon size={24} className='text-default-action' />
                    Collections
                  </Link>
                  <Link
                    to='#'
                    className='flex justify-center items-center border-2 border-default-300 hover:border-default-action transition-colors duration-300 rounded-8 flex-col gap-10'>
                    <SunIcon size={24} className='text-default-action' />
                    Événements
                  </Link>
                </div>
                <div className=' grid grid-rows-2 min-w-[200px] min-h-[200px] gap-25'>
                  <Link
                    to='#'
                    className='flex justify-center items-center border-2 border-default-300 hover:border-default-action transition-colors duration-300 rounded-8 flex-col gap-10'>
                    <SunIcon size={24} className='text-default-action' />
                    Citations
                  </Link>
                  <Link
                    to='#'
                    className='flex justify-center items-center border-2 border-default-300 hover:border-default-action transition-colors duration-300 rounded-8 flex-col gap-10'>
                    <SunIcon size={24} className='text-default-action' />
                    Annexes
                  </Link>
                </div>
                <div className=' grid grid-rows-2 min-w-[200px] min-h-[200px] gap-25'>
                  <Link
                    to='#'
                    className='flex justify-center items-center border-2 border-default-300 hover:border-default-action transition-colors duration-300 rounded-8 flex-col gap-10'>
                    <SunIcon size={24} className='text-default-action' />
                    Bibliographies
                  </Link>
                  <Link
                    to='#'
                    className='flex justify-center items-center border-2 border-default-300 hover:border-default-action transition-colors duration-300 rounded-8 flex-col gap-10'>
                    <SunIcon size={24} className='text-default-action' />
                    Médiagrahpies
                  </Link>
                </div>
                <div className=' grid grid-cols-2 grid-rows-2 aspect-w-1 aspect-h-1 min-w-[200px] min-h-[200px] gap-25'>
                  <Link
                    to='#'
                    className='flex justify-center items-center border-2 border-default-300 hover:border-default-action transition-colors duration-300 rounded-8 flex-col gap-10'>
                    <SunIcon size={24} className='text-default-action' />
                    Universités
                  </Link>
                  <Link
                    to='#'
                    className='flex justify-center items-center border-2 border-default-300 hover:border-default-action transition-colors duration-300 rounded-8 flex-col gap-10'>
                    <SunIcon size={24} className='text-default-action' />
                    Pays
                  </Link>
                  <Link
                    to='#'
                    className='flex justify-center items-center border-2 border-default-300 hover:border-default-action transition-colors duration-300 rounded-8 text-center flex-col gap-10'>
                    <SunIcon size={24} className='text-default-action' />
                    Écoles
                    <br /> doctorales
                  </Link>
                  <Link
                    to='#'
                    className='flex justify-center items-center border-2 border-default-300 hover:border-default-action transition-colors duration-300 rounded-8 flex-col gap-10'>
                    <SunIcon size={24} className='text-default-action' />
                    Laboratoires
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </motion.main>
      </Scrollbar>
    </div>
  );
};
