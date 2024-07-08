const API_URL = 'https://tests.arcanes.ca/omk/api';

export interface Data {
  length: any;
  'o:title': string;
  'o:id': number;
  'schema:addressCountry'?: any[];
  'display_name'?: any[];
  '@id': string;
  '@type'?: string[];
  'schema:isRelatedTo'?: Array<{ '@id': string, display_title?: string }>;
  'schema:agent'?: Array<{ display_title?: string, value_resource_id?: number }>;
  'dcterms:date'?: Array<{ display_title?: string }>;
  'jdc:hasLaboratoire'?: Array<{ value_resource_id: number }>;
  'jdc:hasUniversity'?: Array<{ value_resource_id: number }>;
  'jdc:hasEcoleDoctorale'?: Array<{ value_resource_id: number }>;
  'schema:url'?: Array<{ '@id': string }>;
  'cito:hasCitedEntity'?: Array<{ '@value': string }>;
  // Autres propriétés que vous utilisez
}

export const fetchData = async (resourceClassId: number): Promise<Data[]> => {
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




export const fetchDetails = async (Url: string): Promise<Data[]> => {
  try {
    const response = await fetch(`${API_URL}${Url}`);
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




export async function getSeminaires() {
  const fetchedEditions: { id: number, title: string; numConf: number }[] = [];

  try {
    const response = await fetch(`${API_URL}/items/15086`);
    const seminaires: Data = await response.json();

    for (let item of seminaires['schema:isRelatedTo'] || []) {
      try {
        const edition = await fetchSpeakerDetails(item['@id']);

        if (edition && edition['schema:isRelatedTo' as any]) {
          const countConf = edition['schema:isRelatedTo' as any].length;
          fetchedEditions.push({ id: Number(edition['o:id' as any]), title: item.display_title || 'Non renseigné', numConf: Number(countConf) });
        }
      } catch (error) {
        console.error(`Error fetching edition details for ${item['@id']}:`, error);
      }
    }
    return fetchedEditions;
  } catch (error) {
    console.error('Error fetching seminaires:', error);
    throw new Error('Failed to fetch editions');
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
          const editionDetails = await fetchSpeakerDetails(item['@id']);
      
          if (editionDetails && editionDetails['schema:isRelatedTo' as any]) {
            const countConf = editionDetails['schema:isRelatedTo' as any].length;
            fetchedEditions.push({
              id: Number(editionDetails['o:id' as any]),
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
    const conferences = await getDataByRT(71); // Assuming 71 is the resource template ID for conferences

    const fetchedConf: { id: number, title: string; actant: string, date: string}[] = [];

    const randomIndexes = getRandomIndexes(conferences.length, confNum);

    randomIndexes.forEach(index => {
      const conference = conferences[index];

      let title = 'Non renseigné';
      let actant = 'Non renseigné';
      let date = 'Non renseigné';

      if (conference['o:title']) {
        title = conference['o:title'] 
      }
      if (conference['schema:agent'] && conference['schema:agent'][0]?.display_title) {
        actant = conference['schema:agent'][0].display_title;
      }
      if (conference['dcterms:date'] && conference['dcterms:date'][0]?.display_title) {
        date = conference['dcterms:date'][0].display_title;
      }
      fetchedConf.push({
        id: conference['o:id'],
        title: title,
        actant: actant,
        date: date
      });
    });
    console.log(fetchedConf)
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

    console.log(fetchedActant);
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
            const title = conference['o:title'] || 'Non renseigné';
            const actant = agent.display_title || 'Non renseigné';
            const date = conference['dcterms:date']?.[0]?.display_title || 'Non renseigné';

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
          const title = conference['o:title'] || 'Non renseigné';
          const actant = (conference['schema:agent'] as { display_title?: string }).display_title || 'Non renseigné';
          const date = conference['dcterms:date']?.[0]?.display_title || 'Non renseigné';

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
    const edition = await response.json() as unknown as Data;

    for (let item of edition['schema:isRelatedTo'] || []) {
      try {
        const conf  = await fetchSpeakerDetails(item['@id']) as unknown as Data;

        let title = 'Non renseigné';
        let actant = 'Non renseigné';
        let date = 'Non renseigné';
  
        if (conf['o:title']) {
          title = conf['o:title'] 
        }
        if (conf['schema:agent'] && conf['schema:agent'][0]?.display_title) {
          actant = conf['schema:agent'][0].display_title;
        }
        if (conf['dcterms:date'] && conf['dcterms:date'][0]?.display_title) {
          date = conf['dcterms:date'][0].display_title;
        }
        fetchedEdition.push({
          id: conf['o:id'],
          title: title,
          actant: actant,
          date: date
        });

      } catch (error) {
        console.error(`Error fetching edition details for ${item['@id']}:`, error);
      }
    }
    console.log(fetchedEdition)
    return fetchedEdition;
  } catch (error) {
    console.error('Error fetching seminaires:', error);
    throw new Error('Failed to fetch editions');
  }
}