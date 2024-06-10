import { useEffect, useState } from 'react';
import { fetchData, Data } from '../services/api';

export const useFetchData = (resourceClassId: number) => {
  const [data, setData] = useState<Data[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const getData = async () => {
      try {
        const fetchedData = await fetchData(resourceClassId);
        setData(fetchedData);
      } catch (error) {
        if (error instanceof Error) {
          setError(error);
        } else {
          setError(new Error('An unknown error occurred'));
        }
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, [resourceClassId]);

  return { data, loading, error };
};
