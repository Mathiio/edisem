const API_URL = 'https://tests.arcanes.ca/omk/api';

export interface Data {
  length: any;
  'o:title': string;
  'o:id': number;
  'schema:addressCountry'?: any[];
  'display_name'?: any[];
  '@id': string;
  '@type'?: string[];
  'jdc:hasConcept'?: Array<{ 'display_title': string, '@id': string, 'value_resource_id': number }>;
  'schema:season'?: Array<{ '@value': string }>;
  'schema:isRelatedTo'?: Array<{ '@id': string, 'display_title': string, 'value_resource_id': number }>;
  'schema:agent'?: Array<{ 'display_title': string, 'value_resource_id': number }>;
  'dcterms:date'?: Array<{ 'display_title': string }>;
  'dcterms:title'?: Array<{ 'display_title': string, '@value'?: string }>;
  'jdc:hasLaboratoire'?: Array<{ 'value_resource_id': number }>;
  'jdc:hasUniversity'?: Array<{ 'value_resource_id': number }>;
  'jdc:hasEcoleDoctorale'?: Array<{ 'value_resource_id': number }>;
  'schema:url'?: Array<{ '@id'?: string }>;
  'cito:hasCitedEntity'?: Array<{ '@value': string }>;
  'dcterms:abstract'?: Array<{ 'display_title': string, '@value': string }>;
  'dcterms:isPartOf'?: Array<{ '@id': string, 'display_title': string, 'value_resource_id': number }>;
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
  const fetchedEditions: { id: number, title: string; ConfNumb: number, year: string, season: string }[] = [];

  try {
    const response = await fetch(`${API_URL}/items/15086`);
    const seminaires: Data = await response.json();

    for (let item of seminaires['schema:isRelatedTo'] || []) {
      try {
        const edition: Data = await getDataByUrl(item['@id']) as unknown as Data;

        if (edition && edition['schema:isRelatedTo']) {

          const ConfNumb = Number(edition['schema:isRelatedTo'].length);
          const title = edition['dcterms:title'] ? edition['dcterms:title'][0]['@value'] as unknown as string : "Non renseigné";
          const confUrl = edition['schema:isRelatedTo'][0]['@id'] as string;
          const conf = await getDataByUrl(confUrl) as Data;
          const date = conf['dcterms:date'] ? conf['dcterms:date'][0]['display_title'] as string : "Non renseigné";
          const dateFormated = new Date(date)
          const year = dateFormated.getFullYear().toString();
          const season = edition['schema:season'] ? edition['schema:season'][0]['@value'] as string : "Non renseigné";
          const id = Number(edition['o:id']);
          
          fetchedEditions.push({ id, title, ConfNumb, year, season });
        }
      } catch (error) {
        console.error(`Error fetching seminaires details for ${item['@id']}:`, error);
      }
    }
    fetchedEditions.sort((a, b) => b.year.localeCompare(a.year) || (a.season > b.season ? -1 : 1));
    return fetchedEditions;
  } catch (error) {
    console.error('Error fetching seminaires:', error);
    throw new Error('Failed to fetch seminaires');
  }
}




export async function getEdition(editionId: number) {
  const fetchedEditions: { id: number, title: string; numConf: number }[] = [];

  try {
    const response = await fetch(`${API_URL}/items/${editionId}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const edition = response.json() as unknown as Data;

    if (edition['schema:isRelatedTo']) {
      for (let item of edition['schema:isRelatedTo'] as Array<{ '@id': string, display_title?: string }>) {
        try {
          const editionDetails = await getDataByUrl(item['@id']);
      
          if (editionDetails && editionDetails['schema:isRelatedTo']) {
            const countConf = editionDetails['schema:isRelatedTo'].length;
            fetchedEditions.push({
              id: Number(editionDetails['o:id']),
              title: item.display_title || 'Unknown Title',
              numConf: Number(countConf),
            });
          }
        } catch (error) {
          console.error(`Error fetching edition details for ${item['@id']}:`, error);
        }
      }
    }
    return fetchedEditions;
  } catch (error) {
    console.error('Error fetching seminaires:', error);
    throw new Error('Failed to fetch editions');
  }
}




export async function getRandomConferences(confNum: number) {
  try {
    const conferences = await getDataByRT(71); 

    const fetchedConf: { id: number, title: string; actant: string, date: string}[] = [];

    const randomIndexes = getRandomIndexes(conferences.length, confNum);

    randomIndexes.forEach(index => {
      const conference = conferences[index];

      let title = conference['o:title'] ? conference['o:title'] as string : "Non renseigné" ;
      let actant = conference['schema:agent'] ? conference['schema:agent'][0]['display_title'] as string : "Non renseigné" ;
      let date = conference['dcterms:date'] ? conference['dcterms:date'][0]['display_title'] as string : "Non renseignée" ;

      fetchedConf.push({
        id: conference['o:id'],
        title: title,
        actant: actant,
        date: date
      });
    });
    return fetchedConf;
  } catch (error) {
    console.error('Error fetching conferences:', error);
    throw new Error('Failed to fetch conferences');
  }
}




function getRandomIndexes(max: number, num: number): number[] {
  const indexes: number[] = [];
  while (indexes.length < num) {
    const randomIndex = Math.floor(Math.random() * max);
    if (!indexes.includes(randomIndex)) {
      indexes.push(randomIndex);
    }
  }
  return indexes;
}




export async function getActants() {
  const fetchedActants: { id: number, name: string; interventions: number }[] = [];

  try {
    const actants = await getDataByRT(72);
    const conferences = await getDataByRT(71);
    for (let item of actants) {
      let interventions = 0;
      for (let conference of conferences) {
        if (conference['schema:agent']) {
          if (Array.isArray(conference['schema:agent'])) {
            for (let actant of conference['schema:agent']) {
              if (actant['value_resource_id'] && actant['value_resource_id'] === item['o:id']) {
                interventions++;
              }
            }
          } else {
            if (conference['schema:agent']['value_resource_id'] && conference['schema:agent']['value_resource_id'] === item['o:id']) {
              interventions++;
            }
          }
        }
      }
      fetchedActants.push({ id: item['o:id'], name: item['o:title'], interventions: interventions });
    }
    return fetchedActants;
  } catch (error) {
    console.error('Error fetching actants:', error);
    throw new Error('Failed to fetch actants');
  }
}




export async function getLaboritory(id: number): Promise<{ name: string; link: string }> {
  try {
    const response = await fetch(`${API_URL}/items/${id}`);
    const laboritory = await response.json();
    const fetchedLaboritory = { name: laboritory['o:title'] || 'non renseigné', link: (laboritory['schema:url'][0]?.['@value']) || 'non renseigné'};
    return fetchedLaboritory;
  } catch (error) {
    console.error('Error fetching laboritory:', error);
    throw new Error('Failed to fetch laboritory');
  }
}




export async function getUniveristy(id: number): Promise<{ name: string; link: string }> {
  try {
    const response = await fetch(`${API_URL}/items/${id}`);
    const university = await response.json();
    const fetchedUniveristy = {name: university['o:title'] || 'non renseigné', link: (university['schema:url'][0]?.['@id']) || 'non renseigné'};
    return fetchedUniveristy;
  } catch (error) {
    console.error('Error fetching university:', error);
    throw new Error('Failed to fetch university');
  }
}




export async function getSchool(id: number): Promise<{ name: string; link: string }> {
  try {
    const response = await fetch(`${API_URL}/items/${id}`);
    const school = await response.json();
    const fetchedSchool = {name: school['o:title'] || 'non renseigné', link: (school['schema:url'][0]?.['@id']) || 'non renseigné'};
    return fetchedSchool;
  } catch (error) {
    console.error('Error fetching school:', error);
    throw new Error('Failed to fetch school');
  }
}




export async function getActant(actantId: number) {
  try {
    const response = await fetch(`${API_URL}/items/${actantId}`);
    const actant = await response.json();
    const conferences = await getDataByRT(71);

    let interventions = 0;
    const title = actant['o:title'] || 'non renseigné';
    const link = (actant['schema:url'] && actant['schema:url'][0]?.['@id']) || 'non renseigné';

    const laboratoryPromises = actant['jdc:hasLaboratoire']
      ? actant['jdc:hasLaboratoire'].map((lab: any) => getLaboritory(lab['value_resource_id']))
      : [ { name: "Non renseigné", link: ""} ];
    const universityPromises = actant['jdc:hasUniversity']
      ? actant['jdc:hasUniversity'].map((uni: any) => getUniveristy(uni['value_resource_id']))
      : [ { name: "Non renseigné", link: ""} ];
    const schoolPromises = actant['jdc:hasEcoleDoctorale']
      ? actant['jdc:hasEcoleDoctorale'].map((school: any) => getSchool(school['value_resource_id']))
      : [ { name: "Non renseigné", link: ""} ];

    const laboratories = await Promise.all(laboratoryPromises);
    const universities = await Promise.all(universityPromises);
    const schools = await Promise.all(schoolPromises);

    for (let conference of conferences) {
      if (conference['schema:agent']) {
        if (Array.isArray(conference['schema:agent'])) {
          for (let agent of conference['schema:agent']) {
            if (agent['value_resource_id'] && agent['value_resource_id'] === actant['o:id']) {
              interventions++;
            }
          }
        } else {
          if (conference['schema:agent']['value_resource_id'] && conference['schema:agent']['value_resource_id'] === actant['o:id']) {
            interventions++;
          }
        }
      }
    }
    const fetchedActant = {
      id: actantId,
      name: title,
      link: link,
      interventions: interventions + " conférence" + (interventions > 1 ? 's' : ""),
      laboratories: laboratories,
      universities: universities,
      schools: schools,
    };

    return fetchedActant;
  } catch (error) {
    console.error('Error fetching actants:', error);
    throw new Error('Failed to fetch actants');
  }
}




export async function getConfByActant(actantId: number) {
  try {
    const fetchedConferences: { id: number, title: string; actant: string, date: string}[] = [];
    const conferences = await getDataByRT(71);

    for (let conference of conferences) {
      if (conference['schema:agent'] && Array.isArray(conference['schema:agent'])) {
        for (let agent of conference['schema:agent']) {
          if (agent && agent['value_resource_id'] && agent['value_resource_id'] === actantId) {

            const title = conference['o:title'] ? conference['o:title'] as string : 'Non renseigné';
            const actant = agent['display_title'] ? agent['display_title'] as string : 'Non renseigné';
            const date = conference['dcterms:date'] ? conference['dcterms:date'][0]['display_title'] as string : 'Non renseignée';

            fetchedConferences.push({
              id: conference['o:id'],
              title: title,
              actant: actant,
              date: date
            });
            break; 
          }
        }
      } else if (conference['schema:agent'] && typeof conference['schema:agent'] === 'object' && 'value_resource_id' in conference['schema:agent']) {
        if (conference['schema:agent']['value_resource_id'] === actantId) {

          const title = conference['o:title'] ? conference['o:title'] : 'Non renseigné';
          const actant = conference['schema:agent'] ? conference['schema:agent'][0]['display_title'] as string : 'Non renseigné';
          const date = conference['dcterms:date'] ? conference['dcterms:date'][0]['display_title'] as string : 'Non renseigné';

          fetchedConferences.push({
            id: conference['o:id'],
            title: title,
            actant: actant,
            date: date
          });
        }
      }
    }
    return fetchedConferences;
  } catch (error) {
    console.error('Error fetching conferences:', error);
    throw new Error('Failed to fetch conferences');
  }
}




export async function getConfByEdition(editionId: number) {
  const fetchedEdition: { id: number, actant: string; title: string; date: string }[] = [];

  try {
    const response = await fetch(`${API_URL}/items/${editionId}`);
    const edition = await response.json() as Data;

    const relatedItems = edition['schema:isRelatedTo'] || [];
    const confPromises = relatedItems.map(async (item) => {
      try {
        const conf = await getDataByUrl(item['@id']) as Data;

        const title = conf['o:title'] ? conf['o:title'] as string : 'Non renseigné';
        const actant = conf['schema:agent'] ? conf['schema:agent'][0]['display_title'] as string : 'Non renseigné';
        const date = conf['dcterms:date'] ? conf['dcterms:date'][0]['display_title'] as string : 'Non renseigné';

        return {
          id: conf['o:id'],
          title: title,
          actant: actant,
          date: date
        };
      } catch (error) {
        console.error(`Error fetching edition details for ${item['@id']}:`, error);
        return null;
      }
    });

    const confs = await Promise.all(confPromises);
    confs.forEach((conf) => {
      if (conf) fetchedEdition.push(conf);
    });

    return fetchedEdition;
  } catch (error) {
    console.error('Error fetching seminaires:', error);
    throw new Error('Failed to fetch editions');
  }
}




export async function getConfOverview(confId: number) {
  const fetchedOverview: { title: string, actant: string, actantId: number, university: string, url: string, fullUrl: string }[] = [];

  try {
    const response = await fetch(`${API_URL}/items/${confId}`);
    const conf = await response.json() as Data;
    
    const title = conf["dcterms:title"] ? conf["dcterms:title"][0]["@value"] as string : "Non renseigné";
    const actant = conf["schema:agent"] ? conf["schema:agent"][0]["display_title"] as string : "Non renseigné";
    const actantId = conf["schema:agent"] ? conf["schema:agent"][0]["value_resource_id"] as number : {} as number;
    const universityRep = await getActant(actantId);
    const university = universityRep['universities'] ? universityRep['universities'][0]['name'] as string : "";
    const fullUrlId = conf["dcterms:isPartOf"] ? conf["dcterms:isPartOf"][0]["@id"] as string : "";
    let url = conf["schema:url"] ? conf["schema:url"][0]["@id"] as string : "";
    if(url != ""){
      const videoId = url.substr(-11);
      url = `https://www.youtube.com/embed/${videoId}`;
    }

    const seance = await getDataByUrl(fullUrlId);
    let fullUrl = seance["schema:url"] ? seance["schema:url"][0]["@id"] as string : "";
    if(fullUrl != ""){
      const videoId = fullUrl.substr(-11);
      fullUrl = `https://www.youtube.com/embed/${videoId}`;
    }
    

    fetchedOverview.push({ title, actant, actantId, university, url, fullUrl})
   
    return fetchedOverview;
  } catch (error) {
    console.error('Error fetching seminaires:', error);
    throw new Error('Failed to fetch seminaires');
  }
}




export async function getConfDetails(confId: number) {
  const fetchedDetails: { edition: string, date: string, description: string }[] = [];

  try {
    const confRep = await fetch(`${API_URL}/items/${confId}`);
    const conf = await confRep.json() as Data;
    
    const date = conf["dcterms:date"] ? conf["dcterms:date"][0]["display_title"] as string : "Non renseignée";
    const description = conf["dcterms:abstract"] ? conf["dcterms:abstract"][0]["@value"] as string : "Non renseignée";
    const id = conf['o:id'];
    const editions = await getDataByRT(77);
    let edition = '';

    for(let item of editions || []){
      for(let conference of item['schema:isRelatedTo'] || []){
        if(conference['value_resource_id']===id){
          edition= item['dcterms:title'] ? item['dcterms:title'][0]['@value'] as string : "Non renseigné";
        }
      }
    }

    fetchedDetails.push({ edition, date, description})
   
    return fetchedDetails;
  } catch (error) {
    console.error('Error fetching seminaires:', error);
    throw new Error('Failed to fetch seminaires');
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
        console.log(word["display_title"])
        fetchedDetails.push({ id, keyword })
      }
    }
    // const edition = "";
    // const date = "";
    // const description = "";

    // fetchedDetails.push({ date, description })
    console.log(fetchedDetails)
    return fetchedDetails;
  } catch (error) {
    console.error('Error fetching seminaires:', error);
    throw new Error('Failed to fetch seminaires');
  }
}