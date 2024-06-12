import { useState, useEffect } from 'react'; // Importez useEffect depuis React
import { Navbar } from '@/components/Navbar/Navbar';
import { Scrollbar } from '@/components/Utils/Scrollbar';
import { motion, Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
import { SunIcon } from '@/components/Utils/icons';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Spinner } from '@nextui-org/react';
import { useFetchData } from '../hooks/useFetchData'; // Assurez-vous d'importer depuis le bon chemin
import { EditModal } from '@/components/database/EditModal';
import { Data } from '@/services/api';

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

export const Database = () => {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [speakers, setSpeakers] = useState<any[]>([]);

  console.log(speakers);

  const { data: speakersData, loading: speakersLoading, error: speakersError } = useFetchData(selectedCardId);

  const handleCardClick = (cardName: string, cardId: number) => {
    setSelectedCard(cardName);
    setSelectedCardId(cardId);
  };

  useEffect(() => {
    if (speakersData) {
      setSpeakers(speakersData);
    }
  }, [speakersData]);

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
                <button
                  onClick={() => {
                    setSelectedCard(null);
                    setSpeakers([]);
                    setSelectedCardId(null);
                  }}
                  className='mr-2'>
                  &larr; Retour
                </button>
                <h2>{selectedCard}</h2>
                {speakersLoading ? (
                  <Spinner color='secondary' size='md' /> // Afficher le spinner en dehors du bloc de rendu de la table
                ) : speakersError ? (
                  <div>Error: {speakersError.message}</div>
                ) : (
                  <div>
                    <Table
                      aria-label='Speakers Table'
                      classNames={{
                        table: 'min-h-[400px]',
                      }}>
                      <TableHeader>
                        <TableColumn key='name'>Name</TableColumn>
                        <TableColumn key='Actions'>Actions</TableColumn>
                      </TableHeader>
                      <TableBody
                        items={speakers || []}
                        emptyContent={<Spinner label='Chargement des données Omeka S' color='secondary' size='md' />}>
                        {(item) => (
                          <TableRow key={item['o:id']}>
                            <TableCell>{item['o:title']}</TableCell>
                            <TableCell>
                              <div>
                                <EditModal itemUrl={item['@id']} />
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 grid-rows-2 gap-25 font-semibold text-default-600'>
                <Link
                  to='#'
                  onClick={() => handleCardClick('Conférences', 47)}
                  className='flex justify-center items-center min-w-[200px] min-h-[300px] border-2 border-default-300 hover:border-default-action transition-colors duration-300 rounded-8 flex-col gap-10'>
                  <SunIcon size={24} className='text-default-action' />
                  Conférences
                </Link>
                <div className='grid grid-rows-2 min-w-[200px] min-h-[200px] gap-25'>
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
                  className='flex justify-center items-center min-w-[200px] min-h-[200px] border-2 border-default-300 hover:border-default-action transition-colors duration-300 rounded-8 flex-col gap-10'>
                  <SunIcon size={24} className='text-default-action' />
                  Mots clés
                </Link>
                <Link
                  to='#'
                  onClick={() => handleCardClick('Conférences', 1375)}
                  className='flex justify-center items-center min-w-[200px] min-h-[200px] border-2 border-default-300 hover:border-default-action transition-colors duration-300 rounded-8 flex-col gap-10'>
                  <SunIcon size={24} className='text-default-action' />
                  Conférenciers
                </Link>
                <div className='grid grid-cols-2 grid-rows-2 aspect-w-1 aspect-h-1 min-w-[200px] min-h-[200px] gap-25'>
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
                <div className='grid grid-rows-2 min-w-[200px] min-h-[200px] gap-25'>
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
                <div className='grid grid-rows-2 min-w-[200px] min-h-[200px] gap-25'>
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
                    Personnes
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
