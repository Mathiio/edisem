import { useEffect, useState } from 'react';
import { useGetAllProperties } from './useFetchData';

export const useLocalStorageProperties = () => {
  const [itemPropertiesData, setItemPropertiesData] = useState<any[] | null>(null);
  const [propertiesLoading, setPropertiesLoading] = useState(true);

  const { data, loading } = useGetAllProperties();

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
      try {
        setItemPropertiesData(JSON.parse(storedProperties));
        setPropertiesLoading(false);
      } catch (error) {
        console.error('Error parsing stored properties:', error);
      }
    }
  }, []);

  return { itemPropertiesData, propertiesLoading };
};
