import { useState, useEffect, useMemo } from 'react';
import { Navbar } from '@/components/Navbar/Navbar';
import { Scrollbar } from '@/components/Utils/Scrollbar';
import { motion, Variants } from 'framer-motion';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
  Pagination,
  useDisclosure,
  Input,
} from '@nextui-org/react';
import { useFetchData } from '../hooks/useFetchData';
import GridComponent from './GridComponent';
import { EditModal } from '@/components/database/EditModal';
import { CreateModal } from '@/components/database/CreateModal';

import { BackIcon, EditIcon, PlusIcon, SearchIcon } from '@/components/Utils/icons';
import { useFetchProperties } from '@/hooks/useFetchData';

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

// Reducer function to slice the result and append '...'
const reducer = (text: any, maxLength = 100) => {
  const str = String(text); // Convert text to a string
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
};

const useLocalStorageProperties = () => {
  // Changez le type ici pour accepter null ou un tableau
  const [itemPropertiesData, setItemPropertiesData] = useState<any[] | null>(null);
  const [propertiesLoading, setPropertiesLoading] = useState(true);

  const { data, loading } = useFetchProperties(); // Assurez-vous que ce hook existe

  useEffect(() => {
    if (!loading && data) {
      localStorage.setItem('itemProperties', JSON.stringify(data));
      setItemPropertiesData(data);
      setPropertiesLoading(false);
    }
  }, [data, loading]);

  useEffect(() => {
    const storedProperties = localStorage.getItem('itemProperties');
    if (storedProperties) {
      setItemPropertiesData(JSON.parse(storedProperties));
      setPropertiesLoading(false);
    }
  }, []);

  return { itemPropertiesData, propertiesLoading };
};

export const Database = () => {
  const { itemPropertiesData, propertiesLoading } = useLocalStorageProperties();

  const initializePropertiesLoading = () => {
    // Vide car useFetchProperties est appelé au niveau du composant via le hook
  };

  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [selectedRTId, setSelectedRTId] = useState<number | null>(null);
  const [selectedConfigKey, setSelectedConfigKey] = useState<string | null>(null);
  const [speakers, setSpeakers] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([]);
  const { isOpen: isOpenEdit, onOpen: onOpenEdit, onClose: onCloseEdit } = useDisclosure();
  const { isOpen: isOpenCreate, onOpen: onOpenCreate, onClose: onCloseCreate } = useDisclosure();

  const [currentItemUrl, setCurrentItemUrl] = useState<string | null>(null);

  const handleCellClick = (item: any) => {
    setCurrentItemUrl(item['@id']);
    onOpenEdit();
  };

  const handleCreateClick = () => {
    onOpenCreate();
  };

  const [currentView, setCurrentView] = useState<'grid' | 'table' | 'element'>('grid');
  const [previousTableState, setPreviousTableState] = useState<any[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const {
    data: speakersData,
    loading: speakersLoading,
    error: speakersError,
  } = useFetchData(selectedCardId, refreshTrigger);

  const handleModalClose = () => {
    setRefreshTrigger((prev) => prev + 1);
    onCloseEdit();
    onCloseCreate();
  };

  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const pages = useMemo(() => (speakersData ? Math.ceil(speakersData.length / rowsPerPage) : 0), [speakersData]);

  const items = useMemo(() => {
    if (!speakersData) return [];
    const start = (page - 1) * rowsPerPage;
    return speakersData.slice(start, start + rowsPerPage);
  }, [page, speakersData]);

  const handleCardClick = (cardName: string, cardId: number, RTId: number, configKey: string, columnsConfig: any[]) => {
    setSelectedCard(cardName);
    setSelectedCardId(cardId);
    setSelectedRTId(RTId);
    setSelectedConfigKey(configKey);
    setColumns(columnsConfig);
    setCurrentItemUrl(null);
    setCurrentView('table'); // Changer la vue actuelle pour afficher le tableau
    setPreviousTableState([...speakers]);
  };

  // const handleCellClick = (item: any) => {
  //   console.log(item);
  //   setSelectedItemForEdit(item);
  //   setCurrentView('element'); // Changer la vue actuelle pour afficher l'élément
  // };

  const handleReturn = () => {
    if (currentView === 'element') {
      setCurrentView('table'); // Revenir à la vue du tableau si vous étiez sur l'élément
    } else if (currentView === 'table') {
      setSelectedCard(null);
      setSpeakers([...previousTableState]); // Revenir à l'état précédent du tableau
      setSelectedCardId(null);
      setSelectedRTId(null);
      setColumns([]);
      setCurrentItemUrl(null);
      setCurrentView('grid'); // Revenir à la vue de la grille si vous étiez sur le tableau
    }
  };

  useEffect(() => {
    if (speakersData) {
      setSpeakers(speakersData);
      setPage(1);
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
            <div>
              {currentView === 'grid' && (
                <GridComponent
                  handleCardClick={handleCardClick}
                  initializePropertiesLoading={initializePropertiesLoading}
                />
              )}
              {currentView === 'table' && (
                <>
                  <div className='flex flex-col gap-50'>
                    <div className='flex flex-row justify-between'>
                      <div>
                        {selectedCard && (
                          <>
                            <button
                              onClick={handleReturn}
                              className=' min-w-fit border-2 border-default-300 hover:border-default-action transition-colors duration-300 text-default-600 font-semibold px-20 py-10 flex flex-row items-center justify-center gap-10 rounded-8 '>
                              <BackIcon
                                className='text-default-action flex flex-col items-center justify-center'
                                size={14}
                              />
                              <div className='text-default-600'>Retour</div>
                            </button>
                          </>
                        )}
                      </div>
                      <div className='flex flex-row gap-20'>
                        <Input
                          classNames={{
                            base: '',
                            clearButton: 'bg-default-600',
                            mainWrapper: ' h-[48px] ',
                            input: 'text-default-400  Inter  text-16 nav_searchbar h-[48px] px-[10px]',
                            inputWrapper:
                              ' shadow-none border-1 border-default-200 group-data-[focus=true]:bg-default-200 rounded-8 font-normal text-default-600 bg-default-50 dark:bg-default-200 px-[15px] py-[10px] h-full ',
                          }}
                          placeholder='Recherche avancée...'
                          startContent={<SearchIcon size={16} />}
                          type='search'
                          fullWidth
                        />
                        <button
                          className=' min-w-fit bg-default-action text-default-100 px-20 py-10 flex flex-row items-center justify-center gap-10 rounded-8 '
                          onClick={() => handleCreateClick()}>
                          <div className='text-default-selected'>Créer un item</div>
                          <PlusIcon size={14} className='text-default-selected ' />
                        </button>
                      </div>
                    </div>
                    <div className='flex flex-col gap-20'>
                      <div>
                        <h2 className='text-24 font-semibold text-default-600'>{selectedCard}</h2>
                      </div>
                      <Table
                        aria-label='Speakers Table'
                        bottomContent={
                          <div className='flex w-full justify-start'>
                            <Pagination
                              classNames={{
                                item: 'rounded-none border-0',
                                prev: 'rounded-none rounded-l-[8px] ',
                                next: 'rounded-none rounded-r-[8px]',
                              }}
                              isCompact
                              showControls
                              color='secondary'
                              page={page}
                              total={pages}
                              initialPage={1}
                              onChange={(page) => setPage(page)}
                            />
                          </div>
                        }
                        classNames={{
                          wrapper: 'shadow-none shadow-none border-1 border-default-200 ',
                          table: 'min-h-[400px] rounded-8 shadow-none',
                          thead: 'min-h-[80px] rounded-8 ',
                          th: ['bg-transparent', 'text-default-500', 'border-b', 'border-divider'],
                          tr: ['rounded-8'],
                          td: [
                            'group-data-[first=true]:first:before:rounded-8',
                            'group-data-[first=true]:last:before:rounded-8',
                            // middle
                            'group-data-[middle=true]:before:rounded-8',
                            // last
                            'group-data-[last=true]:first:before:rounded-8',
                            'group-data-[last=true]:last:before:rounded-8',
                          ],
                        }}>
                        <TableHeader className='min-h-[40px]'>
                          {columns.map((col) => (
                            <TableColumn key={col.key} className={`${col.isAction ? 'flex justify-end' : ''}`}>
                              {col.label}
                            </TableColumn>
                          ))}
                        </TableHeader>
                        <TableBody
                          items={(!speakersLoading && items) || []}
                          emptyContent={<Spinner label='Chargement des données Omeka S' color='secondary' size='md' />}>
                          {(item) => (
                            <TableRow key={item['o:id']} className='rounded-8 hover:bg-default-100'>
                              {columns.map((col, colIndex) => (
                                <TableCell
                                  key={col.key}
                                  className={`
            ${colIndex === 0 ? 'rounded-tl-8 rounded-bl-8' : ''} 
            ${colIndex === columns.length - 1 ? 'rounded-tr-8 rounded-br-8' : ''}
          `}>
                                  {col.isAction ? (
                                    <div className='flex justify-end'>
                                      <button onClick={() => handleCellClick(item)} className='pl-[10px]'>
                                        <EditIcon
                                          size={22}
                                          className='mr-[10px] text-default-400 hover:text-default-action transition-all ease-in-out duration-200'
                                        />
                                      </button>
                                    </div>
                                  ) : (
                                    <div>{reducer(getValueByPath(item, col.dataPath))}</div>
                                  )}
                                </TableCell>
                              ))}
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                    {currentItemUrl && (
                      <EditModal
                        isOpen={isOpenEdit}
                        onClose={handleModalClose}
                        itemUrl={currentItemUrl}
                        activeConfig={selectedConfigKey}
                        itemPropertiesData={itemPropertiesData}
                        propertiesLoading={propertiesLoading}
                      />
                    )}
                    {selectedRTId && (
                      <CreateModal
                        isOpen={isOpenCreate}
                        onClose={handleModalClose}
                        itemId={selectedRTId}
                        activeConfig={selectedConfigKey}
                        itemPropertiesData={itemPropertiesData}
                        propertiesLoading={propertiesLoading}
                      />
                    )}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.main>
      </Scrollbar>
    </div>
  );
};

// Configuration des colonnes pour chaque catégorie
export const columnConfigs = {
  conferences: [
    { key: 'o:title', label: 'Titre', dataPath: 'o:title' },
    { key: 'schema:agent', label: 'Conférenciers', dataPath: 'schema:agent.0.display_title' },
    { key: 'actions', label: 'Actions', isAction: true },
  ],
  conferenciers: [
    { key: 'o:title', label: 'Titre', dataPath: 'o:title' },
    { key: 'jdc:hasUniversity', label: 'Université', dataPath: 'jdc:hasUniversity.0.display_title' },
    { key: 'actions', label: 'Actions', isAction: true },
  ],
  citations: [
    { key: 'o:title', label: 'Titre', dataPath: 'o:title' },
    { key: 'schema:startTime', label: 'schema:startTime', dataPath: 'schema:startTime.0.@value' },
    { key: 'schema:endTime', label: 'schema:endTime', dataPath: 'schema:endTime.0.@value' },
    { key: 'actions', label: 'Actions', isAction: true },
  ],
  pays: [
    { key: 'o:title', label: 'Titre', dataPath: 'o:title' },
    { key: 'actions', label: 'Actions', isAction: true },
  ],
  laboratoire: [
    { key: 'o:title', label: 'Titre', dataPath: 'o:title' },
    { key: 'schema:url', label: 'Url', dataPath: 'schema:url.0.@value' },
    { key: 'actions', label: 'Actions', isAction: true },
  ],
  ecolesdoctorales: [
    { key: 'o:title', label: 'Titre', dataPath: 'o:title' },
    { key: 'schema:url', label: 'Url', dataPath: 'schema:url.0.@value' },
    { key: 'actions', label: 'Actions', isAction: true },
  ],
  universites: [
    { key: 'o:title', label: 'Titre', dataPath: 'o:title' },
    { key: 'schema:url', label: 'Url', dataPath: 'schema:url.0.@id' },
    { key: 'actions', label: 'Actions', isAction: true },
  ],
  // Ajoutez d'autres configurations selon vos besoins
};

// Fonction utilitaire pour accéder à une propriété dans un objet par chemin d'accès
function getValueByPath<T>(object: T, path: string): any {
  if (!path) return undefined;
  const keys = path.split('.');
  let value: any = object;
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return undefined;
    }
  }
  return value;
}
