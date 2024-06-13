import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar/Navbar';
import { Scrollbar } from '@/components/Utils/Scrollbar';
import { motion, Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
import { SunIcon, UserIcon, ThemeIcon, SeanceIcon, SchoolIcon, LaboritoryIcon, EditionIcon, CollectionIcon, CountryIcon, CitationIcon, ConferenceIcon, KeywordIcon } from '@/components/Utils/icons';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Spinner } from '@nextui-org/react';
import { useFetchData } from '../hooks/useFetchData';
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

// Configuration des colonnes pour chaque catégorie
const columnConfigs = {
  conferences: [
    { key: 'o:id', label: 'ID', dataPath: 'o:id' }, // Exemple simple
    { key: 'o:title', label: 'Titre', dataPath: 'o:title' }, // Exemple simple
    { key: 'schema:agent', label: 'Conférenciers', dataPath: 'schema:agent.0.display_title' }, // Utilisation de dataPath pour un chemin d'accès
    { key: 'actions', label: 'Actions', isAction: true },
  ],
  // Ajoutez d'autres configurations selon vos besoins
};

// Fonction utilitaire pour accéder à une propriété dans un objet par chemin d'accès
function getValueByPath<T>(object: T, path: string): any {
  if (!path) return undefined; // Vérifier si path est défini

  // Séparer le chemin d'accès en tableau de clés
  const keys = path.split('.');
  let value: any = object;

  // Parcourir chaque clé dans le chemin
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return undefined; // Si une clé est manquante, renvoyer undefined
    }
  }

  return value;
}

export const Database = () => {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [speakers, setSpeakers] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([]); // État pour stocker les colonnes

  const { data: speakersData, loading: speakersLoading, error: speakersError } = useFetchData(selectedCardId);

  const handleCardClick = (cardName: string, cardId: number, columnsConfig: any[]) => {
    setSelectedCard(cardName);
    setSelectedCardId(cardId);
    setColumns(columnsConfig); // Définir les colonnes en fonction de la configuration
  };

  useEffect(() => {
    if (speakersData) {
      setSpeakers(speakersData);
    }
  }, [speakersData]);

  console.log(speakers);

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
                    setColumns([]);
                  }}
                  className='mr-2'>
                  &larr; Retour
                </button>
                <h2>{selectedCard}</h2>
                {speakersLoading ? (
                  <Spinner color='secondary' size='md' />
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
                        {columns.map((col) => (
                          <TableColumn key={col.key}>{col.label}</TableColumn>
                        ))}
                      </TableHeader>
                      <TableBody
                        items={speakers || []}
                        emptyContent={<Spinner label='Chargement des données Omeka S' color='secondary' size='md' />}>
                        {(item) => (
                          <TableRow key={item['o:id']}>
                            {columns.map((col) => (
                              <TableCell key={col.key}>
                                {col.isAction ? (
                                  <div>
                                    <EditModal itemUrl={item['@id']} />
                                  </div>
                                ) : (
                                  <div>{getValueByPath(item, col.dataPath)}</div>
                                )}
                              </TableCell>
                            ))}
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
                  onClick={() => handleCardClick('Conférences', 47, columnConfigs.conferences)}
                  className='flex justify-center items-center min-w-[200px] min-h-[300px] border-2 border-default-300 hover:border-default-action transition-colors duration-300 rounded-8 flex-col gap-10'>
                  <ConferenceIcon size={24} className='text-default-action' />
                  Conférences
                </Link>
                <div className='grid grid-rows-2 min-w-[200px] min-h-[200px] gap-25'>
                  <Link
                    to='#'
                    className='flex justify-center items-center border-2 border-default-300 hover:border-default-action transition-colors duration-300 rounded-8 flex-col gap-10'>
                    <EditionIcon size={24} className='text-default-action' />
                    Éditions
                  </Link>
                  <Link
                    to='#'
                    className='flex justify-center items-center border-2 border-default-300 hover:border-default-action transition-colors duration-300 rounded-8 flex-col gap-10'>
                    <SeanceIcon size={24} className='text-default-action' />
                    Séances
                  </Link>
                </div>
                <Link
                  to='#'
                  className='flex justify-center items-center min-w-[200px] min-h-[200px] border-2 border-default-300 hover:border-default-action transition-colors duration-300 rounded-8 flex-col gap-10'>
                  <KeywordIcon size={24} className='text-default-action' />
                  Mots clés
                </Link>
                <Link
                  to='#'
                  onClick={() => handleCardClick('Conférences', 1375, columnConfigs.conferences)}
                  className='flex justify-center items-center min-w-[200px] min-h-[200px] border-2 border-default-300 hover:border-default-action transition-colors duration-300 rounded-8 flex-col gap-10'>
                  <UserIcon size={24} className='text-default-action' />
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
                    <ThemeIcon size={24} className='text-default-action' />
                    Thèmes
                  </Link>
                  <Link
                    to='#'
                    className='flex justify-center items-center border-2 border-default-300 hover:border-default-action transition-colors duration-300 rounded-8 flex-col gap-10'>
                    <CollectionIcon size={24} className='text-default-action' />
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
                    <CitationIcon size={24} className='text-default-action' />
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
