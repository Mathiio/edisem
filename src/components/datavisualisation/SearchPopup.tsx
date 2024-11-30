import React, { useState, useEffect } from 'react';
import { FiSearch } from 'react-icons/fi';
import { Scrollbar } from '../utils/Scrollbar';
import { LongCarrouselFilter } from '../utils/Carrousels';

interface SearchPopupProps {
  itemsDataviz: any[];
  onSearch: (results: any[]) => void;
  onItemSelect: (item: any) => void;
}

const SearchPopup: React.FC<SearchPopupProps> = ({ itemsDataviz, onSearch, onItemSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<Set<string>>(new Set(['Tout']));

  // Utiliser useEffect pour appliquer les filtres à chaque changement
  useEffect(() => {
    performSearch(searchTerm);
  }, [selectedFilters, searchTerm, itemsDataviz]);

  const performSearch = (term: string) => {
    if (!term) {
      const allFilteredItems = itemsDataviz.filter(
        (item) => selectedFilters.has('Tout') || selectedFilters.has(item.type.toLowerCase()),
      );
      setSearchResults(allFilteredItems);
      return;
    }

    const filteredItems = itemsDataviz.filter((item) => {
      const matchesSearchTerm = item.title.toLowerCase().includes(term.toLowerCase());
      const matchesFilters = selectedFilters.has('Tout') || selectedFilters.has(item.type.toLowerCase());
      return matchesSearchTerm && matchesFilters;
    });

    setSearchResults(filteredItems);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
  };

  const handleItemSelect = (item: any) => {
    onItemSelect(item);
    onSearch([item]); // Envoie uniquement l'élément cliqué
  };

  const toggleFilter = (filter: string) => {
    const newFilters = new Set(selectedFilters);

    if (filter === 'Tout') {
      if (newFilters.has('Tout')) return;
      newFilters.clear();
      newFilters.add('Tout');
    } else {
      if (newFilters.has('Tout')) {
        newFilters.delete('Tout');
      }

      if (newFilters.has(filter)) {
        newFilters.delete(filter);
      } else {
        newFilters.add(filter);
      }

      if (newFilters.size === 0) {
        newFilters.add('Tout');
      }
    }

    setSelectedFilters(newFilters);
  };

  const availableFilters = [
    'Tout',
    'keyword',
    'conf',
    'actant',
    'citation',
    'bibliography',
    'mediagraphie',
    'university',
    'laboratory',
    'school',
  ];

  const filterLabels: Record<string, string> = {
    Tout: 'Tout',
    conf: 'Conférence',
    keyword: 'Mot clé',
    actant: 'Actant',
    university: 'Université',
    laboratory: 'Laboratoire',
    school: 'École doctoral',
    citation: 'Citation',
    bibliography: 'Bibliographie',
    mediagraphie: 'Médiagraphie',
  };

  return (
    <div className='rounded-12'>
      <div className='flex flex-col items-start'>
        <div className='flex items-center bg-default-300 rounded-8 p-10 h-[40px] w-full mb-4'>
          <FiSearch className='text-gray-400' size={20} />
          <input
            type='text'
            placeholder='Rechercher...'
            value={searchTerm}
            onChange={handleInputChange}
            className='ml-2 bg-transparent border-none text-sm w-full placeholder-gray-500 focus:outline-none'
          />
        </div>

        <LongCarrouselFilter
          perPage={3}
          perMove={1}
          autowidth={true}
          data={availableFilters}
          renderSlide={(filter) => (
            <button
              key={filter}
              onClick={() => toggleFilter(filter)}
              className={`text-14 px-10 py-5 rounded-8
              ${selectedFilters.has(filter) ? 'bg-default-action text-white' : 'bg-default-100 text-black'}
              hover:bg-default-hover transition-all`}>
              {filterLabels[filter] || filter}
            </button>
          )}
        />
      </div>

      <div className='mt-20 h-[210px] overflow-y-auto'>
        <Scrollbar withGap>
          {searchTerm.trim() === '' ? (
            <p className='text-gray-400 text-center'>Tapez quelque chose pour commencer</p>
          ) : searchResults.length > 0 ? (
            <ul className='flex flex-col gap-5'>
              {searchResults.map((item, index) => (
                <li
                  key={index}
                  className='w-full flex justify-between gap-10 items-center rounded-8 hover:bg-default-300 cursor-pointer p-5'
                  onClick={() => handleItemSelect(item)}>
                  <span className='text-14'>{truncateText(item.title, 2, 40)}</span>
                  <span className='text-[10px]'>{item.type}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className='text-gray-400 text-center'>Aucun résultat</p>
          )}
        </Scrollbar>
      </div>
    </div>
  );
};

const truncateText = (text: string, maxLines: number, maxLength: number) => {
  const lines = text.split(' ').reduce(
    (acc, word) => {
      const currentLine = acc[acc.length - 1];
      if ((currentLine + word).length > maxLength) {
        acc.push(word);
      } else {
        acc[acc.length - 1] = `${currentLine} ${word}`.trim();
      }
      return acc;
    },
    [''],
  );

  if (lines.length > maxLines) {
    return lines.slice(0, maxLines).join(' ') + '...';
  }
  return text;
};

export default SearchPopup;
