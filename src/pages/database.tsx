import { useState, useEffect } from 'react';
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
  useDisclosure,
} from '@nextui-org/react';
import { useFetchData } from '../hooks/useFetchData';
import GridComponent from './GridComponent';
import { EditModal } from '@/components/database/EditModal';
import { CreateModal } from '@/components/database/CreateModal';

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

  const { data: speakersData, loading: speakersLoading, error: speakersError } = useFetchData(selectedCardId);

  const handleCardClick = (cardName: string, cardId: number, configKey: string, columnsConfig: any[]) => {
    setSelectedCard(cardName);
    setSelectedCardId(cardId);
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
      setColumns([]);
      setCurrentItemUrl(null);
      setCurrentView('grid'); // Revenir à la vue de la grille si vous étiez sur le tableau
    }
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
            <div>
              {currentView === 'grid' && <GridComponent handleCardClick={handleCardClick} />}
              {currentView === 'table' && (
                <>
                  {selectedCard && (
                    <>
                      <button onClick={handleReturn} className='mr-2'>
                        &larr; Retour
                      </button>
                      <h2>{selectedCard}</h2>
                    </>
                  )}
                  {speakersLoading ? (
                    <Spinner color='secondary' size='md' />
                  ) : speakersError ? (
                    <div>Error: {speakersError.message}</div>
                  ) : (
                    <div>
                      <button onClick={() => handleCreateClick()}>Nouvel item</button>
                      <Table
                        aria-label='Speakers Table'
                        classNames={{
                          table: 'min-h-[400px] rounded-8',
                          thead: 'min-h-[40px]',
                          th: ['bg-transparent', 'text-default-500', 'border-b', 'border-divider'],
                        }}>
                        <TableHeader className='min-h-[40px]'>
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
                                      <button onClick={() => handleCellClick(item)}>Edit</button>
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
                      {currentItemUrl && (
                        <EditModal
                          isOpen={isOpenEdit}
                          onClose={onCloseEdit}
                          itemUrl={currentItemUrl}
                          activeConfig={selectedConfigKey}
                        />
                      )}
                      {selectedCardId && (
                        <CreateModal
                          isOpen={isOpenCreate}
                          onClose={onCloseCreate}
                          itemId={selectedCardId}
                          activeConfig={selectedConfigKey}
                        />
                      )}
                    </div>
                  )}
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
    { key: 'Conceptes', label: 'Conceptes', dataPath: 'skos:hasTopConcept.0.display_title' },
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
