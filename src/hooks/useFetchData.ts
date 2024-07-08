import { useEffect, useState } from 'react';
import { fetchData, fetchSpeakerDetails, fetchRT, Data, fetchProperties, fetchDetails } from '../services/api';

export const useFetchData = (resourceClassId: number | null, refreshTrigger: number = 0) => {
  const [data, setData] = useState<Data[]>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const getData = async () => {
      if (resourceClassId !== null) {
        setLoading(true);
        try {
          const fetchedData = await fetchData(resourceClassId);
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

export const useFetchDataDetails = (ItemUrl: string | null) => {
  const [data, setData] = useState<Data[] | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (ItemUrl !== null) {
        const fetchedData = await fetchSpeakerDetails(ItemUrl); // Replace with your actual fetching function
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
    fetchData();
  }, [ItemUrl]);

  const refetch = () => {
    fetchData(); // Call fetchData function again to refetch data
  };

  return { data, loading, error, refetch };
};

export const useFetchDetails = (ItemUrl: string | null) => {
  const [data, setData] = useState<Data[]>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const getData = async () => {
      if (ItemUrl !== null) {
        try {
          const fetchedData = await fetchDetails(ItemUrl);
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

export const useFetchRT = (resourceTemplateId: number | null) => {
  const [data, setData] = useState<Data[]>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const getData = async () => {
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

    getData();
  }, [resourceTemplateId]);

  return { data, loading, error };
};


export const useFetchProperties = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const getData = async () => {  
      try {
        const fetchedData = await fetchProperties();
       
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