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
  let page = 1;
  const perPage = 100; // Adjust per your API's pagination limit
  let allData: Data[] = [];
  let morePages = true;

  while (morePages) {
    try {
      const response = await fetch(`${API_URL}/items?resource_class_id=${resourceClassId}&page=${page}&per_page=${perPage}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data: Data[] = await response.json();
      if (data.length > 0) {
        allData = allData.concat(data);
        page++;
      } else {
        morePages = false;
      }
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  }

  return allData;
};


export const fetchRT = async (resourceTemplateId: number): Promise<Data[]> => {
  let page = 1;
  const perPage = 100; // Adjust per your API's pagination limit
  let allData: Data[] = [];
  let morePages = true;

  while (morePages) {
    try {
      const response = await fetch(`${API_URL}/resource_templates/${resourceTemplateId}?page=${page}&per_page=${perPage}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data: Data[] = await response.json();
      if (data.length > 0) {
        allData = allData.concat(data);
        page++;
      } else {
        morePages = false;
      }
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  }

  return allData;
};


export const fetchProperties = async (): Promise<any[]> => {
  let page = 1;
  const perPage = 100; // Number of items per page, change if different
  let allProperties: any[] = [];
  let morePages = true;

  while (morePages) {
    try {
      const response = await fetch(`${API_URL}/properties?page=${page}&per_page=${perPage}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data: any[] = await response.json();
      if (data.length > 0) {
        allProperties = allProperties.concat(data);
        page++;
      } else {
        morePages = false;
      }
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  }

  return allProperties;
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


