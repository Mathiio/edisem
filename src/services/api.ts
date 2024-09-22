const API_URL = 'https://tests.arcanes.ca/omk/api';

export interface Data {
  length: any;
  'o:title': string;
  'o:id': number;
  'schema:addressCountry'?: any[];
  'display_name'?: any[];
  '@id': string;
  '@type'?: string[];
  'o:resource_class'?: { '@id': string, 'o:id': number };
  'thumbnail_display_urls'?: { 'large': string, };
  'bibo:uri'?: Array<{ '@id': string,}>;
  'schema:citation'?: Array<{ 'display_title': string, '@id': string, 'value_resource_id': number }>;
  'jdc:hasConcept'?: Array<{ 'display_title': string, '@id': string, 'value_resource_id': number }>;
  'schema:season'?: Array<{ '@value': string }>;
  'schema:isRelatedTo'?: Array<{ '@id': string, 'display_title': string, 'value_resource_id': number }>;
  'schema:agent'?: Array<{ 'display_title': string, 'value_resource_id': number , '@id' : string}>;
  'dcterms:date'?: Array<{ '@value': string }>;
  'dcterms:title'?: Array<{ 'display_title': string, '@value'?: string }>;
  'jdc:hasLaboratoire'?: Array<{ 'value_resource_id': number }>;
  'jdc:hasUniversity'?: Array<{ 'value_resource_id': number, 'display_title': string,  }>;
  'jdc:hasEcoleDoctorale'?: Array<{ 'value_resource_id': number }>;
  'schema:url'?: Array<{ '@id'?: string }>;
  'cito:hasCitedEntity'?: Array<{ '@value': string }>;
  'cito:isCitedBy'?: Array<{ 'display_title': string }>;
  'schema:startTime'?: Array<{ '@value': string }>;
  'schema:endTime'?: Array<{ '@value': string }>;
  'dcterms:abstract'?: Array<{ 'display_title': string, '@value': string }>;
  'dcterms:isPartOf'?: Array<{ '@id': string, 'display_title': string, 'value_resource_id': number }>;
  'dcterms:bibliographicCitation'?: Array<{ '@id': string, 'display_title': string, 'value_resource_id': number }>;
  'bibo:authorList'?: Array<{ '@value': string }>;
  'dcterms:references'?: Array<{ '@value': string , '@id': string}>;
  'schema:associatedMedia'?: Array<{ '@id': string, 'display_title': string, 'value_resource_id': number }>;
  'dcterms:hasFormat'?: Array<{ '@value': string }>;
  'schema:image'?: Array<{ '@id': string }>;
  'o:original_url': string;
  'dcterms:creator'?: Array<{ '@value': string, 'display_title': string }>;
  'bibo:editor'?: Array<{ '@value': string }>;
  'dcterms:publisher'?: Array<{ '@value': string }>;
}
//bibo:creator

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
  console.log('debut du call');

  try {
    console.log('debut du try');
    const response = await fetch(`${API_URL}/items/15086`);
    const seminaires: Data = await response.json();
    

    for (let item of seminaires['schema:isRelatedTo'] || []) {
     
      try {
        const edition: Data = await getDataByUrl(item['@id']) as unknown as Data;
        console.log(edition)
        if (edition && edition['schema:isRelatedTo']) {
          
          const ConfNumb = Number(edition['schema:isRelatedTo'].length);
          const title = edition['dcterms:title'] ? edition['dcterms:title'][0]['@value'] as unknown as string : "Non renseigné";
          const confUrl = edition['schema:isRelatedTo'][0]['@id'] as string;
          const conf = await getDataByUrl(confUrl) as Data;
          const date = conf['dcterms:date'] ? conf['dcterms:date'][0]['@value'] as string : "Non renseigné";
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

    const getSeasonValue = (season: string): number => {
      switch(season.toLowerCase()) {
        case 'hiver': return 0;
        case 'printemps': return 1;
        case 'été': return 2;
        case 'automne': return 3;
        default: return -1;
      }
    };
   
   // Tri modifié
   fetchedEditions.sort((a, b) => {
    // D'abord, comparer les années
    const yearComparison = b.year.localeCompare(a.year);
    if (yearComparison !== 0) return yearComparison;

    // Si les années sont identiques, comparer les saisons
    return getSeasonValue(b.season) - getSeasonValue(a.season);
  });
  
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

    // Filtrer les conférences pour ne garder que celles dont la date est inférieure à 2023
    const filteredConferences = conferences.filter(conference => {
      const dateStr = conference['dcterms:date'] ? conference['dcterms:date'][0]['@value'] as string : null;
      return dateStr && new Date(dateStr).getFullYear() < 2023;
    });

    // S'assurer de prendre confNum conférences aléatoires parmi celles filtrées
    const randomIndexes = getRandomIndexes(filteredConferences.length, confNum);

    // Utiliser Promise.all avec map pour attendre toutes les opérations asynchrones
    const fetchedConf = await Promise.all(randomIndexes.map(async index => {
      const conference = filteredConferences[index];

      let title = conference['o:title'] ? conference['o:title'] as string : "Non renseigné";
      let actant_name = conference['schema:agent'] ? conference['schema:agent'][0]['display_title'] as string : "Non renseigné";
      let date = conference['dcterms:date'] ? conference['dcterms:date'][0]['@value'] as string : "Non renseignée";
      let ytb = conference['schema:url'] ? conference['schema:url'][0]['@id'] as string : "Non renseignée";
      let actant_id = conference['schema:agent'] ? conference['schema:agent'][0]['@id'] as string : "Non renseignée";

      let actant = await getDataByUrl(actant_id);
      
      let universite = actant['jdc:hasUniversity'] ? actant['jdc:hasUniversity'][0]['display_title'] as string : "Non renseignée";

      const formattedUniversityName = universite.replace(/Vincennes-Saint-Denis/g, '').replace(/École Nationale Supérieure/g, 'ENS').replace(/Université Polytechnique des Hauts-de-France/g, 'UPHF').replace(/Université/g, 'U.');


      return {
        id: conference['o:id'],
        title: title,
        actant: actant_name,
        date: date,
        ytb: ytb,
        universite: formattedUniversityName
      };
    }));

    console.log(fetchedConf);
    return fetchedConf.slice(0, confNum); // S'assure de retourner seulement confNum résultats
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
  const fetchedActants: { id: number, name: string; interventions: number, university_img:string,university_name:string }[] = [];

  try {
    const actants = await getDataByRT(72);
    const conferences = await getDataByRT(71);
    const universities = await getDataByRT(73);
    for (let item of actants) {
      let interventions = 0;
      let universityImage = "";
      let universityName = "";
     
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
      for (let university of universities) {
        if (university['schema:image']) {

            
              if (item['jdc:hasUniversity'] && item['jdc:hasUniversity'][0]['value_resource_id'] === university['o:id']) {
                universityName = item['jdc:hasUniversity'][0]['display_title'];
                
                let media_univ = await getDataByUrl(university['schema:image'][0]['@id']);
                
                if (media_univ && media_univ['o:original_url']) {
                  universityImage = media_univ['o:original_url'];
                  //console.log(universityImage)
                 
                }
                 
              }
          
       
          
        }
      }
      fetchedActants.push({ id: item['o:id'], name: item['o:title'], interventions: interventions, university_img : universityImage, university_name : universityName });
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
    const fetchedConferences: { id: number, title: string; actant: string, date: string; ytb: string, universite:string}[] = [];
    const conferences = await getDataByRT(71);

    for (let conference of conferences) {
      if (conference['schema:agent'] && Array.isArray(conference['schema:agent'])) {
        for (let agent of conference['schema:agent']) {
          if (agent && agent['value_resource_id'] && agent['value_resource_id'] === actantId) {

            const title = conference['o:title'] ? conference['o:title'] as string : 'Non renseigné';
            const actant_name = agent['display_title'] ? agent['display_title'] as string : 'Non renseigné';
            const date = conference['dcterms:date'] ? conference['dcterms:date'][0]['@value'] as string : 'Non renseignée';
            const ytb = conference['schema:url'] ? conference['schema:url'][0]['@id'] as string : "Non renseignée";
            let actant_id = conference['schema:agent'] ? conference['schema:agent'][0]['@id'] as string : "Non renseignée";
  
        let actant = await getDataByUrl(actant_id);
        
        let universite = actant['jdc:hasUniversity'] ? actant['jdc:hasUniversity'][0]['display_title'] as string : "Non renseignée";
  
        const formattedUniversityName = universite.replace(/Vincennes-Saint-Denis/g, '').replace(/École Nationale Supérieure/g, 'ENS').replace(/Université Polytechnique des Hauts-de-France/g, 'UPHF').replace(/Université/g, 'U.');

            fetchedConferences.push({
              id: conference['o:id'],
              title: title,
              actant: actant_name,
              date: date,
              ytb: ytb,
              universite:formattedUniversityName
            });
            break; 
          }
        }
      } else if (conference['schema:agent'] && typeof conference['schema:agent'] === 'object' && 'value_resource_id' in conference['schema:agent']) {
        if (conference['schema:agent']['value_resource_id'] === actantId) {

          const title = conference['o:title'] ? conference['o:title'] : 'Non renseigné';
          const actant_name = conference['schema:agent'] ? conference['schema:agent'][0]['display_title'] as string : 'Non renseigné';
          const date = conference['dcterms:date'] ? conference['dcterms:date'][0]['@value'] as string : 'Non renseigné';
          const ytb = conference['schema:url'] ? conference['schema:url'][0]['@id'] as string : "Non renseignée";
          let actant_id = conference['schema:agent'] ? conference['schema:agent'][0]['@id'] as string : "Non renseignée";
  
        let actant = await getDataByUrl(actant_id);
        
        let universite = actant['jdc:hasUniversity'] ? actant['jdc:hasUniversity'][0]['display_title'] as string : "Non renseignée";
  
        const formattedUniversityName = universite.replace(/Vincennes-Saint-Denis/g, '').replace(/École Nationale Supérieure/g, 'ENS').replace(/Université Polytechnique des Hauts-de-France/g, 'UPHF').replace(/Université/g, 'U.');

          fetchedConferences.push({
            id: conference['o:id'],
            title: title,
            actant: actant_name,
            date: date,
            ytb: ytb,
            universite: formattedUniversityName
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
  const fetchedEdition: { id: number, actant: string; title: string; date: string, ytb: string, universite: string }[] = [];

  try {
    const response = await fetch(`${API_URL}/items/${editionId}`);
    const edition = await response.json() as Data;

    const relatedItems = edition['schema:isRelatedTo'] || [];
    const confPromises = relatedItems.map(async (item) => {
      try {
        const conf = await getDataByUrl(item['@id']) as Data;

        const title = conf['o:title'] ? conf['o:title'] as string : 'Non renseigné';
        const actant_name = conf['schema:agent'] ? conf['schema:agent'][0]['display_title'] as string : 'Non renseigné';
        const date = conf['dcterms:date'] ? conf['dcterms:date'][0]['@value'] as string : 'Non renseigné';
        let ytb = conf['schema:url'] ? conf['schema:url'][0]['@id'] as string : "Non renseignée";
        let actant_id = conf['schema:agent'] ? conf['schema:agent'][0]['@id'] as string : "Non renseignée";
  
        let actant = await getDataByUrl(actant_id);
        
        let universite = actant['jdc:hasUniversity'] ? actant['jdc:hasUniversity'][0]['display_title'] as string : "Non renseignée";
  
        const formattedUniversityName = universite.replace(/Vincennes-Saint-Denis/g, '').replace(/École Nationale Supérieure/g, 'ENS').replace(/Université Polytechnique des Hauts-de-France/g, 'UPHF').replace(/Université/g, 'U.');

        

        return {
          id: conf['o:id'],
          title: title,
          actant: actant_name,
          date: date,
          ytb: ytb,
          universite: formattedUniversityName
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
    
    const date = conf["dcterms:date"] ? conf["dcterms:date"][0]["@value"] as string : "Non renseignée";
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
    console.log(conf)
    
    
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
              console.log(bibliographyRep)
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
              console.log(bibliographyRep)
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
              console.log(thumbnail)
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
              console.log(thumbnail)
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