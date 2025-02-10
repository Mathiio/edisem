import * as Items from "@/services/Items";
const API_URL = 'https://tests.arcanes.ca/omk/api';

export interface Data {
  [x: string]: any;
  length: any;
  'o:id': number;
  '@id': string;
  '@type'?: string[];
}




export const getDataByClass = async (resourceClassId: number): Promise<Data[]> => {
  let page = 1;
  const perPage = 100;
  let allData: Data[] = [];
  let morePages = true;

  while (morePages) {
    try {
      const response = await fetch(`${API_URL}/items?resource_template_id=${resourceClassId}&page=${page}&per_page=${perPage}`);
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




export const getDataByRT = async (resourceTemplateId: number): Promise<Data[]> => {
  let page = 1;
  const perPage = 100;
  let allData: Data[] = [];
  let morePages = true;

  while (morePages) {
    try {
      const response = await fetch(`${API_URL}/items?resource_template_id=${resourceTemplateId}&page=${page}&per_page=${perPage}`);
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




export const getAllProperties = async (): Promise<any[]> => {
  let page = 1;
  const perPage = 100; 
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




export async function getDataByUrl (url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json() as Data;;
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};





export async function getRandomConfs(confNum: number){
  try{
    const confs = await Items.getConfs();
    
    if (Array.isArray(confs)) {
      const randomConfs = confs.sort(() => 0.5 - Math.random());
      const selectedConfs = randomConfs.slice(0, confNum);

      const updatedConfs = await Promise.all(selectedConfs.map(async (conf) => {
        if (conf.actant) {
          const actantDetails = await getActant(conf.actant);
          return { ...conf, actant: actantDetails }; 
        }
        return conf;
      }));
      return updatedConfs;
    }
  }
  catch (error) {
    console.error('Error fetching actants:', error);
    throw new Error('Failed to fetch actants');
  }
}





export async function getConf(confId: number) {
  try {
    const confs = await Items.getConfs();
  
    if (Array.isArray(confs)) {
      const conf = confs.find((a) => a.id === String(confId));

      if (conf) {
        if (conf.url !== "") {
          const videoId = conf.url.substr(-11);
          conf.url = `https://www.youtube.com/embed/${videoId}`;
        }
        if (conf.fullUrl !== "") {
          const videoId = conf.fullUrl.substr(-11);
          conf.fullUrl = `https://www.youtube.com/embed/${videoId}`;
        }
        if (conf.actant) {
          const actant = await getActant(conf.actant);
          conf.actant = actant;
        }
        return conf;
      } else {
        throw new Error(`Actant with id ${confId} not found`);
      }
    } 
  }
  catch (error) {
    console.error('Error fetching conf:', error);
    throw new Error('Failed to fetch conf');
  }
}



export async function getItemByID(id: string): Promise<any | null> {
  try {
    const allItems = await Items.getAllItems();
    const foundItem = allItems.find((item: any) => item.id === id);
    return foundItem || null;
  } catch (error) {
    console.error('Erreur lors de la recherche de l’élément par ID:', error);
    throw new Error('Échec de la recherche de l’élément par ID');
  }
}




export async function getActant(actantId: number) {
  try {
    const actants = await Items.getActants();

    if (Array.isArray(actants)) {
      const actant = actants.find((a) => a.id === String(actantId));

      if (actant) {
        return actant;
      } else {
        throw new Error(`Actant with id ${actantId} not found`);
      }
    } 
  } catch (error) {
    console.error('Error fetching actant:', error);
    throw new Error('Failed to fetch actant');
  }
}





export async function getConfByEdition(editionId: number) {
  try {
    const confs = await Items.getConfs();

    const editionConfs = confs.filter((conf: { event: string; edition: number }) => 
      Number(conf.edition) === editionId
    );

    const updatedConfs = await Promise.all(editionConfs.map(async (conf: { actant: number; }) => {
      if (conf.actant) {
        const actantDetails = await getActant(conf.actant);
        return { ...conf, actant: actantDetails }; 
      }
      return conf;
    }));

    return updatedConfs;
  } catch (error) {
    console.error('Error fetching confByEdition:', error);
    throw new Error('Failed to fetch confByEdition');
  }
}




export async function getConfByActant(actantId: number) {
  try{
    const confs = await Items.getConfs();

    const actantConfs = confs.filter((conf: { event: string; actant: number }) => 
      Number(conf.actant) === actantId
    );

    const updatedConfs = await Promise.all(actantConfs.map(async (conf: { actant: number; }) => {
      if (conf.actant) {
        const actantDetails = await getActant(conf.actant);
        return { ...conf, actant: actantDetails }; 
      }
      return conf;
    }));

    return updatedConfs;
  } catch (error) {
    console.error('Error fetching confByActant:', error);
    throw new Error('Failed to fetch confByActant');
  }
}




export async function filterActants(searchQuery: string) {
  try {
    const actants = await Items.getActants();
    const normalizedQuery = searchQuery.toLowerCase();

    const filteredActants = actants.filter((actant: { firstname: string; lastname: string; universities: any[] | null; doctoralSchools: any[] | null; laboritories: any[] | null; }) => {
      return (
        (actant.firstname && actant.firstname.toLowerCase().includes(normalizedQuery)) ||
        (actant.lastname && actant.lastname.toLowerCase().includes(normalizedQuery)) ||
        (actant.universities?.some((university: { name: string; }) => university && university.name.toLowerCase().includes(normalizedQuery))) ||
        (actant.doctoralSchools?.some((school: { name: string; }) => school && school.name.toLowerCase().includes(normalizedQuery))) ||
        (actant.laboritories?.some((laboratory: { name: string; }) => laboratory && laboratory.name.toLowerCase().includes(normalizedQuery)))
      );
    });

    return filteredActants;

  } catch (error) {
    console.error('Error fetching actants:', error);
    throw new Error('Failed to fetch actants');
  }
}




export async function filterConfs(searchQuery: string) {
  try{
    const confs = await Items.getConfs();

    const updatedConfs = await Promise.all(confs.map(async (conf: { actant: number; }) => {
      if (conf.actant) {
        const actantDetails = await getActant(conf.actant);
        return { ...conf, actant: actantDetails };
      }
      return conf;
    }));


    const filteredConfs = updatedConfs.filter((conf: any) => {
      const lowerSearchQuery = searchQuery.toLowerCase();

      const eventMatch = conf.event.toLowerCase().includes(lowerSearchQuery);
      const titleMatch = conf.title.toLowerCase().includes(lowerSearchQuery);
      const actantMatch = conf.actant
        ? conf.actant.firstname.toLowerCase().includes(lowerSearchQuery) ||
          conf.actant.lastname.toLowerCase().includes(lowerSearchQuery)
        : false;
      const keywordsMatch = conf.motcles
      ? conf.motcles.some((keyword: any) =>
          [keyword.title, ...keyword.english_terms, ...keyword.orthographic_variants]
            .some((term) => term.toLowerCase().includes(lowerSearchQuery))
        )
      : false;

      return eventMatch || titleMatch || actantMatch || keywordsMatch;
    });

    return filteredConfs;
  } catch (error) {
    console.error('Error fetching conferences:', error);
    throw new Error('Failed to fetch conferences');
  }
}






export async function getConfCitations(confId: number){
  try{
    const confs = await Items.getConfs();
    const citations = await Items.getCitations();
    const actants = await Items.getActants();

    const conf = confs.find((conf: { id: string }) => Number(conf.id) === confId);

    if (conf) {
      const confCitations = citations
        .filter((citation: { id: number }) => conf.citations.includes(citation.id))
        .map((citation: { actant: string }) => {
          const actantObj = actants.find((actant: { id: string }) => actant.id === citation.actant);

          return {
            ...citation,
            actant: actantObj ? actantObj : citation.actant
          };
        });

      return confCitations;
    }
 } catch (error) {
    console.error('Error fetching conferences:', error);
    throw new Error('Failed to fetch conferences');
  }
}





export async function getConfBibliographies(confId: number) {
  try {
    const confs = await Items.getConfs();
    const bibliographies = await Items.getBibliographies();

    const conf = confs.find((conf: { id: number }) => Number(conf.id) === confId);
    if (!conf) {
      throw new Error(`No conference found with id: ${confId}`);
    }

    const filteredBibliographies = bibliographies.filter((bib: { id: number }) => 
      conf.bibliographies.includes(String(bib.id)) 
    );

    return filteredBibliographies;
  }
  catch (error) {
    console.error('Error fetching bibliographies:', error);
    throw new Error('Failed to fetch bibliographies');
  }
}




export async function getConfMediagraphies(confId: number) {
  try {
    const confs = await Items.getConfs();
    const mediagraphies = await Items.getMediagraphies();

    const conf = confs.find((conf: { id: number }) => Number(conf.id) === confId);

    if (!conf) {
      throw new Error(`No conference found with id: ${confId}`);
    }

    const filteredMediagraphies = mediagraphies.filter((media: { id: number }) =>
      conf.mediagraphies.includes(String(media.id))
    );

    return filteredMediagraphies;
  } catch (error) {
    console.error('Error fetching mediagraphies:', error);
    throw new Error('Failed to fetch mediagraphies');
  }
}
