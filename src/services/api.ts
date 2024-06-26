const API_URL = 'https://tests.arcanes.ca/omk/api';

export interface Data {
  'o:title': string;
  'o:id': number;
  'schema:addressCountry'?: any[];
  'display_name'?: any[];
  '@id': string;
  // Autres propriétés que vous utilisez
}

export const fetchData = async (resourceClassId: number): Promise<Data[]> => {
  try {
    const response = await fetch(`${API_URL}/items?resource_class_id=${resourceClassId}`);
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

export const fetchRT = async (resourceTemplateId: number): Promise<Data[]> => {
  try {
    const response = await fetch(`${API_URL}/resource_templates/${resourceTemplateId}`);
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

export const fetchSpeakerDetails = async (speakerUrl: string): Promise<Data[]> => {
  try {
    const response = await fetch(speakerUrl);
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


