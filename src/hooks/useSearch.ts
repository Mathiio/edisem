import { useState, useCallback } from 'react';
import { SearchService, SearchFilters } from '@/services/search.ts';

export interface UseSearchReturn {
  searchResults: SearchFilters;
  loading: {
    actants: boolean;
    conferences: boolean;
    oeuvres: boolean;
  };
  hasSearched: boolean;
  totalResults: number;
  performSearch: (query: string) => Promise<void>;
  clearSearch: () => void;
}

export const useSearch = (): UseSearchReturn => {
  const [searchResults, setSearchResults] = useState<SearchFilters>({
    actants: [],
    conferences: { seminars: [], colloques: [], studyDays: [] },
    oeuvres: [],
  });

  const [loading, setLoading] = useState({
    actants: false,
    conferences: false,
    oeuvres: false,
  });

  const [hasSearched, setHasSearched] = useState(false);

  const performSearch = useCallback(async (query: string) => {
    if (!query) {
      clearSearch();
      return;
    }

    setHasSearched(true);
    setLoading({ actants: true, conferences: true, oeuvres: true });

    try {
      const [actants, conferences, oeuvres] = await Promise.all([
        SearchService.searchActants(query).finally(() => 
          setLoading(prev => ({ ...prev, actants: false }))
        ),
        SearchService.searchConferences(query).finally(() =>
          setLoading(prev => ({ ...prev, conferences: false }))
        ),
        SearchService.searchOeuvres(query).finally(() =>
          setLoading(prev => ({ ...prev, oeuvres: false }))
        ),
      ]);

      setSearchResults({
        actants,
        conferences,
        oeuvres,
      });
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      setLoading({ actants: false, conferences: false, oeuvres: false });
    }
  }, []);

  const clearSearch = useCallback(() => {
    setSearchResults({
      actants: [],
      conferences: { seminars: [], colloques: [], studyDays: [] },
      oeuvres: [],
    });
    setHasSearched(false);
    setLoading({ actants: false, conferences: false, oeuvres: false });
  }, []);

  const totalResults = 
    searchResults.actants.length +
    searchResults.conferences.seminars.length +
    searchResults.conferences.colloques.length +
    searchResults.conferences.studyDays.length +
    searchResults.oeuvres.length;

  return {
    searchResults,
    loading,
    hasSearched,
    totalResults,
    performSearch,
    clearSearch
  };
};
