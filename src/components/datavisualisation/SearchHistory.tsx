import { useState, useEffect } from 'react';

import { FilterGroup } from './FilterPopup';
import { Button } from '@heroui/button';

interface SearchHistoryItem {
  id: number;
  title: string;
  timestamp: string;
  filters: FilterGroup[];
}

interface SearchHistoryProps {
  onSelectSearch: (filters: FilterGroup[]) => void;
  onClose: () => void;
}

const SearchHistory: React.FC<SearchHistoryProps> = ({ onSelectSearch, onClose }) => {
  const [historyItems, setHistoryItems] = useState<SearchHistoryItem[]>([]);

  // Charger l'historique depuis le localStorage au chargement du composant
  useEffect(() => {
    const loadHistory = () => {
      try {
        const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
        setHistoryItems(history);
      } catch (error) {
        console.error("Erreur lors du chargement de l'historique:", error);
        setHistoryItems([]);
      }
    };

    loadHistory();
  }, []);

  // Supprimer un élément de l'historique
  // const handleRemoveItem = (e: React.MouseEvent, id: number) => {
  //   e.stopPropagation(); // Empêcher le déclenchement du onClick du parent

  //   try {
  //     const updatedHistory = historyItems.filter((item) => item.id !== id);
  //     localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
  //     setHistoryItems(updatedHistory);
  //   } catch (error) {
  //     console.error('Erreur lors de la suppression:', error);
  //   }
  // };

  // Effacer tout l'historique
  const handleClearHistory = () => {
    localStorage.removeItem('searchHistory');
    setHistoryItems([]);
  };

  // Réexécuter une recherche
  const handleRerunSearch = (filters: any[]) => {
    onSelectSearch(filters);
    onClose();
  };

  // Formater la date
  // const formatDate = (dateString: string) => {
  //   try {
  //     const date = new Date(dateString);
  //     return date.toLocaleDateString('fr-FR', {
  //       day: '2-digit',
  //       month: '2-digit',
  //       year: 'numeric',
  //       hour: '2-digit',
  //       minute: '2-digit',
  //     });
  //   } catch {
  //     return 'Date inconnue';
  //   }
  // };

  return (
    <div className='flex flex-col gap-4 w-full'>
      <div className='flex flex-row items-center justify-between mb-4'>
        <h2 className='text-16 font-semibold flex items-center gap-2'>Historique des recherches</h2>
        {historyItems.length > 0 && (
          <Button size='sm' className='bg-c2' onClick={handleClearHistory}>
            Tout effacer
          </Button>
        )}
      </div>

      {historyItems.length === 0 ? (
        <div className=' text-c4'>Aucun historique de recherche disponible</div>
      ) : (
        <ul className='flex flex-col gap-4'>
          {historyItems.map((item) => (
            <li
              key={item.id}
              onClick={() => handleRerunSearch(item.filters)}
              className='p-4 bg-c2 rounded-12 cursor-pointer hover:bg-c3 transition-colors flex justify-between items-center'>
              <div className='flex flex-col gap-2'>
                <span className='font-medium'>{item.title}</span>
                {/* <span className='text-14 text-c5'>{formatDate(item.timestamp)}</span> */}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchHistory;
