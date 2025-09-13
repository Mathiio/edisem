import { useEffect, useState } from 'react';
import { getDataByClass, getDataByUrl, fetchRT, Data, getAllProperties } from '../services/Items';

export const usegetDataByClass = (resourceClassId: number | null, refreshTrigger: number = 0) => {
  const [data, setData] = useState<Data[]>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const getData = async () => {
      if (resourceClassId !== null) {
        setLoading(true);
        try {
          const fetchedData = await getDataByClass(resourceClassId);
          setData(Array.isArray(fetchedData) ? fetchedData : [fetchedData]);
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
        setData(undefined);
        setLoading(false);
      }
    };

    getData();
   
  }, [resourceClassId, refreshTrigger]);

  return { data, loading, error };
};

export const usegetDataByClassDetails = (ItemUrl: string | null) => {
  const [data, setData] = useState<Data[] | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const getDataByClass = async () => {
    setLoading(true);
    setError(null);
    try {
      if (ItemUrl !== null) {
        const fetchedData = await getDataByUrl(ItemUrl); // Replace with your actual fetching function
        setData(Array.isArray(fetchedData) ? fetchedData : [fetchedData]);
      } else {
        setData(undefined);
      }
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
  };

  useEffect(() => {
    getDataByClass();
  }, [ItemUrl]);

  const refetch = () => {
    getDataByClass(); // Call getDataByClass function again to refetch data
  };

  return { data, loading, error, refetch };
};



export const useFetchRT = (resourceTemplateId: number | null) => {
  const [data, setData] = useState<Data[]>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const getData = async () => {
    setLoading(true);
    setError(null);
    if (resourceTemplateId !== null) {
      try {
        const fetchedData = await fetchRT(resourceTemplateId);
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

  useEffect(() => {
    getData();
  }, [resourceTemplateId]);

  const refetch = () => {
    getData();
  };

  return { data, loading, error, refetch };
};

export const usegetAllProperties = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const getData = async () => {  
      try {
        const fetchedData = await getAllProperties();
       
        setData(fetchedData);
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
    };

    getData();
  }, []);

  return { data, loading, error };
};