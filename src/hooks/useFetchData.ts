import { useState, useEffect } from 'react';
import { fetchData, Data } from '../services/api';

export const useFetchData = () => {
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const getData = async () => {
      try {
        const result = await fetchData();
        setData(result);
      } catch (error) {
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, []);

  return { data, loading, error };
};
