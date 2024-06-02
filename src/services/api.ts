const API_URL = 'https://tests.arcanes.ca/omk/api';

export interface Data {
  'o:title': any;
  'schema:addressCountry': any[];
  'display_name': any[];
  // Autres propriétés que vous utilisez
}

export const fetchData = async (): Promise<Data[]> => {
  try {
    const response = await fetch(`${API_URL}/items?resource_class_id=1563`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data: Data[] = await response.json();
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};
