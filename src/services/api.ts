const API_URL = 'https://tests.arcanes.ca/omk/api';

export interface Data {
  [x: string]: any;
  length: any;
  'o:id': number;
  '@id': string;
  '@type'?: string[];
  'o:resource_class'?: { '@id': string, 'o:id': number };
  'bibo:uri'?: Array<{ '@id': string,}>;
  'schema:citation'?: Array<{ 'display_title': string, '@id': string, 'value_resource_id': number }>;
  'dcterms:title'?: Array<{ 'display_title': string, '@value'?: string }>;
  'cito:hasCitedEntity'?: Array<{ '@value': string }>;
  'cito:isCitedBy'?: Array<{ 'display_title': string }>;
  'dcterms:bibliographicCitation'?: Array<{ '@id': string, 'display_title': string, 'value_resource_id': number }>;
  'bibo:authorList'?: Array<{ '@value': string }>;
  'dcterms:references'?: Array<{ '@value': string , '@id': string}>;
  'schema:associatedMedia'?: Array<{ '@id': string, 'display_title': string, 'value_resource_id': number }>;
  'dcterms:hasFormat'?: Array<{ '@value': string }>;
  'dcterms:creator'?: Array<{ '@value': string, 'display_title': string }>;
  'bibo:editor'?: Array<{ '@value': string }>;
  'dcterms:publisher'?: Array<{ '@value': string }>;
}




export const getDataByClass = async (resourceClassId: number): Promise<Data[]> => {
  let page = 1;
  const perPage = 100; // Adjust per your API's pagination limit
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




export async function getSeminaires() {
  try {
    const confs = await getConfs();
    const filteredConfs = confs.filter((conf: { event: string; }) => conf.event === "Séminaire Arcanes");
    const editionMap: { [key: string]: { confNum: number; date: string; season: string } } = {};

    filteredConfs.forEach((conf: { edition: any; date: string; season: string; }) => {
      const editionId = conf.edition;
      const season = conf.season.trim();

      if (!editionMap[editionId]) {
        editionMap[editionId] = { confNum: 0, date: conf.date, season };
      }
      editionMap[editionId].confNum++;
    });

    const editions = Object.entries(editionMap).map(([id, { confNum, date, season }]) => ({
      id,
      confNum,
      year: date.split('-')[0],
      date,
      season,
    })).sort((a, b) => {
      const yearDiff = parseInt(b.year) - parseInt(a.year);
      if (yearDiff !== 0) return yearDiff;

      const seasonOrder = ['printemps', 'été', 'automne', 'hiver'];
      return seasonOrder.indexOf(b.season) - seasonOrder.indexOf(a.season);
    });
    return editions;
  } catch (error) {
    console.error('Error fetching seminars:', error);
    throw new Error('Failed to fetch seminars');
  }
}




export async function getRandomConfs(confNum: number){
  try{
    const confs = await getDataByUrl('https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getAllConferences&json=1');
    
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




export async function getConfs() {
  try {
    const storedConfs = localStorage.getItem('confs');
  
    if (storedConfs) {
      return JSON.parse(storedConfs);
    }

    const confs = await getDataByUrl('https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getAllConferences&json=1');
    localStorage.setItem('confs', JSON.stringify(confs));

    return confs;
  }
  catch (error) {
    console.error('Error fetching actants:', error);
    throw new Error('Failed to fetch actants');
  }
}




export async function getConf(confId: number) {
  try {
    const confs = await getConfs();
  
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
    console.error('Error fetching actants:', error);
    throw new Error('Failed to fetch actants');
  }
}




export async function getActants() {
  try {
    const storedActants = localStorage.getItem('actants');
    if (storedActants) {
      return JSON.parse(storedActants);
    }

    const actants = await getDataByUrl('https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getAllConferencier&json=1');
    const confs = await getConfs();

    const updatedActants = actants.map((actant: { id: number }) => {
      const interventionsCount = confs.filter((conf: { actant: string }) => conf.actant === String(actant.id)).length;
      return { ...actant, interventions: interventionsCount };
    });

    localStorage.setItem('actants', JSON.stringify(updatedActants));
    return updatedActants;
  }
  catch (error) {
    console.error('Error fetching actants:', error);
    throw new Error('Failed to fetch actants');
  }
}




export async function getActant(actantId: number) {
  try {
    const actants = await getActants();

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
    const confs = await getConfs();

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
    console.error('Error fetching seminaires:', error);
    throw new Error('Failed to fetch editions');
  }
}




export async function getConfByActant(actantId: number) {
  try{
    const confs = await getConfs();

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
    console.error('Error fetching conferences:', error);
    throw new Error('Failed to fetch conferences');
  }
}




export async function filterActants(searchQuery: string) {
  try{
  const actants = await getActants();

  const normalizedQuery = searchQuery.toLowerCase();

  const filteredActants = actants.filter((actant: { firstname: string; lastname: string; universities: any[]; docotralSchools: any[]; laboritories: any[]; }) => {
    return (
      (actant.firstname && actant.firstname.toLowerCase().includes(normalizedQuery)) ||
      (actant.lastname && actant.lastname.toLowerCase().includes(normalizedQuery)) ||
      (actant.universities && actant.universities.some((university: { name: string; }) => university.name.toLowerCase().includes(normalizedQuery))) ||
      (actant.docotralSchools && actant.docotralSchools.some((school: { name: string; }) => school.name.toLowerCase().includes(normalizedQuery))) ||
      (actant.laboritories && actant.laboritories.some((laboratory: { name: string; }) => laboratory.name.toLowerCase().includes(normalizedQuery)))
    );
  });

  return filteredActants;

  } catch (error) {
    console.error('Error fetching conferences:', error);
    throw new Error('Failed to fetch conferences');
  }
}




export async function filterConfs(searchQuery: string) {
  try{
    const confs = await getConfs();

    const updatedConfs = await Promise.all(confs.map(async (conf: { actant: number; }) => {
      if (conf.actant) {
        const actantDetails = await getActant(conf.actant);
        return { ...conf, actant: actantDetails };
      }
      return conf;
    }));

    const filteredConfs = updatedConfs.filter((conf: any) => {
      const eventMatch = conf.event.toLowerCase().includes(searchQuery.toLowerCase());
      const titleMatch = conf.title.toLowerCase().includes(searchQuery.toLowerCase());
      const actantMatch = conf.actant
        ? (conf.actant.firstname.toLowerCase().includes(searchQuery.toLowerCase()) ||
          conf.actant.lastname.toLowerCase().includes(searchQuery.toLowerCase()))
        : false;
      
      return eventMatch || titleMatch || actantMatch;
    });

    console.log(filteredConfs); 
    return filteredConfs;
  } catch (error) {
    console.error('Error fetching conferences:', error);
    throw new Error('Failed to fetch conferences');
  }
}





export async function getConfKeyWords(confId: number) {
  const fetchedDetails: { id: number, keyword: string }[] = [];

  try {
    const confRep = await fetch(`${API_URL}/items/${confId}`);
    const conf = await confRep.json() as Data;
    
    if(conf["jdc:hasConcept"]){
      for(let word of conf["jdc:hasConcept"]){
        const id = Number(word["value_resource_id"] ? word["value_resource_id"] as number : "");
        const keyword = word["display_title"] ? word["display_title"] as string : "";
        fetchedDetails.push({ id, keyword })
      }
    }
    return fetchedDetails;
  } catch (error) {
    console.error('Error fetching seminaires:', error);
    throw new Error('Failed to fetch seminaires');
  }
}




export async function getConfCitations(confId: number) {
  const fetchedCitations: { citation: string, actant: string, startTime: number, endTime: number }[] = [];

  try {
    const confRep = await fetch(`${API_URL}/items/${confId}`);
    const conf = await confRep.json() as Data;
    
    if(conf["schema:citation"]){
      for(let item of conf["schema:citation"]){
        if(item["@id"]){
          const citationRep = await getDataByUrl(item["@id"])
          const citation = citationRep['cito:hasCitedEntity'] ? citationRep['cito:hasCitedEntity'][0]['@value'] as string : "Non renseignée";
          const actant = citationRep['cito:isCitedBy'] ? citationRep['cito:isCitedBy'][0]['display_title'] as string : "Non renseigné";
          const startTime = Number(citationRep['schema:startTime'] ? citationRep['schema:startTime'][0]['@value'] : "");
          const endTime = Number(citationRep['schema:endTime'] ? citationRep['schema:endTime'][0]['@value'] : "");
          fetchedCitations.push({ citation, actant, startTime, endTime })
        }
      }
    }
    return fetchedCitations;
  } catch (error) {
    console.error('Error fetching seminaires:', error);
    throw new Error('Failed to fetch seminaires');
  }
}




export async function getConfBibliographies(confId: number) {
  const fetchedBibliographies: {author: string, date: string , bibliography_title: string, source?: string,ressource_id: number; thumbnail?: string; url?: string;   }[] = [];

  try {
    const confRep = await fetch(`${API_URL}/items/${confId}`);
    const conf = await confRep.json() as Data;
    
    
    if(conf["dcterms:references"]){
      for(let item of conf["dcterms:references"]){
        if(item["@id"]){
          const bibliographyRep = await getDataByUrl(item["@id"])
          if (bibliographyRep["o:resource_class"]) {
            if ( bibliographyRep["o:resource_class"]["o:id"] == 40) {
              const date = bibliographyRep['dcterms:date'] ? bibliographyRep['dcterms:date'][0]['@value'] as string : "";
              const author = bibliographyRep['dcterms:creator'] ? bibliographyRep['dcterms:creator'][0]['display_title'] as string : "";
              const bibliography_title = bibliographyRep['dcterms:title'] ? bibliographyRep['dcterms:title'][0]['@value'] as string : "";
              const source = bibliographyRep['dcterms:publisher'] ? bibliographyRep['dcterms:publisher'][0]['@value'] as string : "";
              const ressource_id = bibliographyRep["o:resource_class"]["o:id"];
              const url = bibliographyRep['bibo:uri'] ? bibliographyRep['bibo:uri'][0]['@id'] as string : "";
              const thumbnail = bibliographyRep['thumbnail_display_urls'] ? bibliographyRep['thumbnail_display_urls']['large'] as string : "";
              fetchedBibliographies.push({ bibliography_title, author, date,source,ressource_id, url,thumbnail  })
            }

            else if (bibliographyRep["o:resource_class"] && bibliographyRep["o:resource_class"]["o:id"] == 81) {
              const date = bibliographyRep['dcterms:date'] ? bibliographyRep['dcterms:date'][0]['@value'] as string : "";
              const author = bibliographyRep['dcterms:creator'] ? bibliographyRep['dcterms:creator'][0]['display_title'] as string : "";
              const bibliography_title = bibliographyRep['dcterms:references'] ? bibliographyRep['dcterms:references'][0]['@value'] as string : "";
              const ressource_id = bibliographyRep["o:resource_class"]["o:id"];
              const url = bibliographyRep['bibo:uri'] ? bibliographyRep['bibo:uri'][0]['@id'] as string : "";
              const thumbnail = bibliographyRep['thumbnail_display_urls'] ? bibliographyRep['thumbnail_display_urls']['large'] as string : "";
              fetchedBibliographies.push({ bibliography_title, author, date,ressource_id, url,thumbnail  })
            }

            else if (bibliographyRep["o:resource_class"] && bibliographyRep["o:resource_class"]["o:id"] == 36) {
              const date = bibliographyRep['dcterms:date'] ? bibliographyRep['dcterms:date'][0]['@value'] as string : "";
              const author = bibliographyRep['dcterms:creator'] ? bibliographyRep['dcterms:creator'][0]['display_title'] as string : "";
              const bibliography_title = bibliographyRep['dcterms:title'] ? bibliographyRep['dcterms:title'][0]['@value'] as string : "";
              const ressource_id = bibliographyRep["o:resource_class"]["o:id"];
              const url = bibliographyRep['bibo:uri'] ? bibliographyRep['bibo:uri'][0]['@id'] as string : "";
              const thumbnail = bibliographyRep['thumbnail_display_urls'] ? bibliographyRep['thumbnail_display_urls']['large'] as string : "";
              fetchedBibliographies.push({ bibliography_title, author, date,ressource_id, url,thumbnail  })
            }
            else if (bibliographyRep["o:resource_class"] && bibliographyRep["o:resource_class"]["o:id"] == 35) {
              const date = bibliographyRep['dcterms:date'] ? bibliographyRep['dcterms:date'][0]['@value'] as string : "";
              const author = bibliographyRep['dcterms:creator'] ? bibliographyRep['dcterms:creator'][0]['display_title'] as string : "";
              const bibliography_title = bibliographyRep['dcterms:title'] ? bibliographyRep['dcterms:title'][0]['@value'] as string : "";
              const ressource_id = bibliographyRep["o:resource_class"] ? bibliographyRep["o:resource_class"]["o:id"] as number : 0;
              const url = bibliographyRep['bibo:uri'] ? bibliographyRep['bibo:uri'][0]['@id'] as string : "";
              const thumbnail = bibliographyRep['thumbnail_display_urls'] ? bibliographyRep['thumbnail_display_urls']['large'] as string : "";
              //console.log(bibliographyRep)
              fetchedBibliographies.push({ bibliography_title, author, date,ressource_id, url,thumbnail })

            }
            else {
              const date = bibliographyRep['dcterms:date'] ? bibliographyRep['dcterms:date'][0]['@value'] as string : "";
              const author = bibliographyRep['dcterms:creator'] ? bibliographyRep['dcterms:creator'][0]['display_title'] as string : "";
              const bibliography_title = bibliographyRep['dcterms:title'] ? bibliographyRep['dcterms:title'][0]['@value'] as string : "";
              const ressource_id = bibliographyRep["o:resource_class"] ? bibliographyRep["o:resource_class"]["o:id"] as number : 0;
              const url = bibliographyRep['bibo:uri'] ? bibliographyRep['bibo:uri'][0]['@id'] as string : "";
              const thumbnail = bibliographyRep['thumbnail_display_urls'] ? bibliographyRep['thumbnail_display_urls']['large'] as string : "";
              //console.log(bibliographyRep)
              fetchedBibliographies.push({ bibliography_title, author, date,ressource_id, url,thumbnail })

            }

             
            
            }
        }
      }
    }
    return fetchedBibliographies;
  } catch (error) {
    console.error('Error fetching seminaires:', error);
    throw new Error('Failed to fetch seminaires');
  }
}




export async function getConfMediagraphies(confId: number) {
  const fetchedCitations: { mediagraphy: string, author: string, date: string, type: string, url: string }[] = [];

  try {
    const confRep = await fetch(`${API_URL}/items/${confId}`);
    const conf = await confRep.json() as Data;
    
    if(conf["schema:associatedMedia"]){
      for(let item of conf["schema:associatedMedia"]){
        if(item["@id"]){
          const MediagraphyRep = await getDataByUrl(item["@id"])
          const date = MediagraphyRep['dcterms:date'] ? MediagraphyRep['dcterms:date'][0]['@value'] as string : "Non renseignée";
          const author = MediagraphyRep['bibo:authorList'] ? MediagraphyRep['bibo:authorList'][0]['@value'] as string : "Non renseigné";
          const mediagraphy = MediagraphyRep['dcterms:references'] ? MediagraphyRep['dcterms:references'][0]['@value'] as string : "Non renseigné";
          const type = MediagraphyRep['dcterms:hasFormat']? MediagraphyRep['dcterms:hasFormat'][0]['@value'] as string : "Non renseigné";
          const url = MediagraphyRep['schema:url']? MediagraphyRep['schema:url'][0]['@id'] as string : "Non renseigné";
          fetchedCitations.push({ mediagraphy, author, date, type, url })
        }
      }
    }
    return fetchedCitations;
  } catch (error) {
    console.error('Error fetching seminaires:', error);
    throw new Error('Failed to fetch seminaires');
  }
}