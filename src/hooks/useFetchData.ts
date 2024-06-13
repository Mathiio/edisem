import { useEffect, useState } from 'react';
import { fetchData,fetchSpeakerDetails, Data } from '../services/api';

export const useFetchData = (resourceClassId: number | null) => {
  const [data, setData] = useState<Data[]>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const getData = async () => {
      if (resourceClassId !== null) {
        try {
          const fetchedData = await fetchData(resourceClassId);
          setData(Array.isArray(fetchedData) ? fetchedData : [fetchedData]); // Convertir en tableau si ce n'est pas déjà le cas
        } catch (error) {
          if (error instanceof Error) {
            setError(error);
          } else {
            setError(new Error('An unknown error occurred'));
          }
        } finally {
          setLoading(false);
        }
      } else {
        setData(undefined); // Réinitialiser les données à null si resourceClassId est null
        setLoading(false);
      }
    };

    getData();
   
  }, [resourceClassId]);

  return { data, loading, error };
};

export const useFetchDataDetails = (ItemUrl: string | null) => {
  const [data, setData] = useState<Data[]>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const getData = async () => {
      if (ItemUrl !== null) {
        try {
          const fetchedData = await fetchSpeakerDetails(ItemUrl);
          setData(Array.isArray(fetchedData) ? fetchedData : [fetchedData]);
        } catch (error) {
          if (error instanceof Error) {
            setError(error);
            console.error('Error fetching data:', error);
          } else {
            setError(new Error('An unknown error occurred'));
            console.error('Unknown error fetching data');
          }
        } finally {
          setLoading(false);
        }
      } else {
        setData(undefined);
        setLoading(false);
      }
    };
  
    getData();
  }, [ItemUrl]);
  

  return { data, loading, error };
};

