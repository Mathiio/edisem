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
    const confs = await getConfs();
    
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
    const storedConfs = sessionStorage.getItem('confs');
    if (storedConfs) {
      return JSON.parse(storedConfs);
    }

    const confs = await getDataByUrl('https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getConfs&json=1');
    const keywords = await getKeywords();

    const keywordsMap = new Map(
      keywords.map((keyword: any) => [keyword.id, keyword])
    );

    const confsFull = confs.map((conf: any) => ({
      ...conf,
      type: 'conference',
      motcles: conf.motcles
        .map((keywordId: string) => {
          const keyword = keywordsMap.get(keywordId);
          if (!keyword) {
            return null;
          }
          return keyword;
        })
        .filter(Boolean),
    }));


    sessionStorage.setItem('confs', JSON.stringify(confsFull));
    return confsFull;
  } catch (error) {
    console.error('Error fetching confs:', error);
    throw new Error('Failed to fetch confs');
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
    console.error('Error fetching conf:', error);
    throw new Error('Failed to fetch conf');
  }
}




export async function getKeywords() {
  try {
    const storedKeywords = sessionStorage.getItem('keywords');
  
    if (storedKeywords) {
      return JSON.parse(storedKeywords);
    }

    const keywords = await getDataByUrl('https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getMotCles&json=1');
    const keywordsFull = keywords.map((keyword: any) => ({
      ...keyword,
      type: 'keyword'
    }));

    sessionStorage.setItem('keywords', JSON.stringify(keywordsFull));
    return keywordsFull;
  }
  catch (error) {
    console.error('Error fetching keywords:', error);
    throw new Error('Failed to fetch keywords');
  }
}




export async function getCollections() {
  try {
    const storedCollections = sessionStorage.getItem('collections');
    if (storedCollections) {
      return JSON.parse(storedCollections);
    }

    const collections = await getDataByUrl(
      'https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getCollections&json=1'
    );

    
    sessionStorage.setItem('collections', JSON.stringify(collections));
    return collections;
  } catch (error) {
    console.error('Error fetching collections:', error);
    throw new Error('Failed to fetch collections');
  }
 }




export async function getAllItems(): Promise<any[]> {
  try {
    const cachedItems = sessionStorage.getItem('allItems');
    if (cachedItems) {
      return JSON.parse(cachedItems);
    }

    const [
      confs, actants, universities, 
      laboratories, schools, 
      citations, bibliographies, 
      mediagraphies, keywords, collections
    ] = await Promise.all([
      getConfs(), getActants(), getUniversities(), 
      getLaboratories(), getDoctoralSchools(), 
      getCitations(), getBibliographies(), 
      getMediagraphies(), getKeywords(), getCollections()
    ]);

    const allItems = [
      ...confs,
      ...actants,
      ...universities,
      ...laboratories,
      ...schools,
      ...citations,
      ...bibliographies,
      ...mediagraphies,
      ...keywords,
      ...collections
    ];

    sessionStorage.setItem('allItems', JSON.stringify(allItems));

    return allItems;
  } catch (error) {
    console.error('Erreur lors de la récupération des éléments:', error);
    throw new Error('Échec de la récupération des éléments');
  }
}





export async function getItemByID(id: string): Promise<any | null> {
  try {
    const allItems = await getAllItems();
    const foundItem = allItems.find((item: any) => item.id === id);
    return foundItem || null;
  } catch (error) {
    console.error('Erreur lors de la recherche de l’élément par ID:', error);
    throw new Error('Échec de la recherche de l’élément par ID');
  }
}




export const getLinksFromType = async (item: any, type: string): Promise<string[]> => {
  if (!item) return [];

  switch (type) {
    case 'conference':
      return await getLinksFromConf(item);
    case 'citation':
      return await getLinksFromCitation(item);
    case 'actant':
      return await getLinksFromActant(item);
    case 'keyword':
      return await getLinksFromKeywords(item);
    case 'bibliography':
      return await getLinksFromBibliographies(item);
    case 'mediagraphie':
      return await getLinksFromMediagraphies(item);
    case 'collection': {
      const result = await getLinksFromCollections([item]);
      return result[0]?.links || [];
    }
    case 'university':
      return await getLinksFromUniv(item);
    case 'laboratory':
      return await getLinksFromLab(item);
    case 'doctoralschool':
      return await getLinksFromSchool(item);
    default:
      return [];
  }
};




export async function getLinksFromConf(conf: { actant?: string; collection?: string; [key: string]: any }): Promise<string[]> {
  if (!conf) return [];
  
  const links: string[] = [];
  
  if (conf.actant) links.push(conf.actant);
  
  ['bibliographies', 'citations', 'mediagraphies', 'recommendation', 'motcles']
    .forEach(key => {
      if (Array.isArray(conf[key])) {
        links.push(...(key === 'motcles' 
          ? conf[key].map((motcle: { id: string }) => motcle.id) 
          : conf[key]
        ));
      }
    });
  
  if (conf.collection) {
    links.push(conf.collection);
  }
  
  return links;
}




export async function getLinksFromCollections( collections: { id: string }[]): Promise<{ id: string; links: string[] }[]> {
  if (!Array.isArray(collections)) return [];

  const confs = await getConfs();
  
  return collections.map(collection => {
    const links: string[] = [];
    
    confs
      .filter((conf :any) => conf.collection === collection.id)
      .forEach((conf :any) => {
        links.push(conf.id);
      });
    
    return {
      id: collection.id,
      links
    };
  });
}




export async function getLinksFromUniv(university: any): Promise<string[]> {
  if (!university || !university.id) return [];

  const actants = await getActants();
  
  return actants
    .filter((actant: any) => 
      actant && 
      Array.isArray(actant.universities) && 
      actant.universities.some((univ: any) => univ && univ.id === university.id)
    )
    .map((actant: any) => actant.id);
}




export async function getLinksFromSchool(school: any): Promise<string[]> {
  if (!school || !school.id) return [];

  const actants = await getActants();
  
  return actants
    .filter((actant: any) => 
      actant && 
      Array.isArray(actant.doctoralSchools) && 
      actant.doctoralSchools.some((docSchool: any) => docSchool && docSchool.id === school.id)
    )
    .map((actant: any) => actant.id);
}




export async function getLinksFromLab(laboratory: any): Promise<string[]> {
  if (!laboratory || !laboratory.id) return [];

  const actants = await getActants();
  
  return actants
    .filter((actant: any) => 
      actant && 
      Array.isArray(actant.laboritories) && 
      actant.laboritories.some((lab: any) => lab && lab.id === laboratory.id)
    )
    .map((actant: any) => actant.id);
}




export async function getLinksFromCitation(identifiant: any): Promise<string[]> {
  if (!identifiant || !identifiant.id) return [];
  
  const links: string[] = [];
  const confs = await getConfs();
  const citations = await getCitations();
  
  const citation = citations.find((c :any) => c.id === identifiant.id);
  
  if (citation && Array.isArray(citation.motcles)) {
    links.push(...citation.motcles.filter(Boolean));
  }
  
  confs.forEach((conf: any) => {
    if (conf && Array.isArray(conf.citations) && conf.citations.includes(identifiant.id)) {
      if (conf.actant) {
        links.push(conf.actant);
      }
    }
  });
  
  return links;
}




export async function getLinksFromActant(actant: any): Promise<string[]> {
  if (!actant || !actant.id) return [];

  const links: string[] = [];

  ['laboritories', 'universities', 'doctoralSchools'].forEach(key => {
    if (Array.isArray(actant[key])) {
      links.push(
        ...actant[key]
          .filter((item: any) => item && item.id)
          .map((item: any) => item.id)
      );
    }
  });

  const confs = await getConfs();
  confs.forEach((conf: any) => {
    if (conf && conf.id && conf.actant === actant.id) {
      if (Array.isArray(conf.citations)) {
        links.push(...conf.citations.filter(Boolean));
      }
      if (Array.isArray(conf.motcles)) {
        links.push(
          ...conf.motcles
            .filter((motcle: any) => motcle && motcle.id)
            .map((motcle: any) => motcle.id)
        );
      }
    }
  });
  console.log(links);
  return links;
}

export async function getLinksFromBibliographies(bibliography: any): Promise<string[]> {
  if (!bibliography || !bibliography.id) return [];
  const links: string[] = [];
  const confs = await getConfs();
  confs.forEach((conf: any) => {
    if (conf && Array.isArray(conf.bibliographies) && conf.bibliographies.includes(bibliography.id)) {
      links.push(conf.id);  
      if (Array.isArray(conf.motcles)) {
        links.push(...conf.motcles
          .filter((motcle: any) => motcle && motcle.id)
          .map((motcle: any) => motcle.id)
        );
      }
    }
  });
  
  return links;
}

export async function getLinksFromMediagraphies(mediagraphie: any, ): Promise<string[]> {
  if (!mediagraphie || !mediagraphie.id) return [];
  
  const links: string[] = [];
  const confs = await getConfs();
  confs.forEach((conf : any) => {
    if (conf && Array.isArray(conf.mediagraphies) && conf.mediagraphies.includes(mediagraphie.id)) {
      links.push(conf.id);  
      if (Array.isArray(conf.motcles)) {
        links.push(...conf.motcles
          .filter((motcle: any) => motcle && motcle.id)
          .map((motcle: any) => motcle.id)
        );
      }
    }
  });
  
  return links;
}

export async function getLinksFromKeywords(keyword: any): Promise<string[]> {
  if (!keyword || !keyword.id) return [];
  
  const links: string[] = [];
  const confs = await getConfs();
  confs.forEach((conf:any) => {
    if (conf && 
        Array.isArray(conf.motcles) && 
        conf.motcles.some((motcle: any) => motcle && motcle.id === keyword.id)) {
      links.push(conf.id);
      if (conf.actant) {
        links.push(conf.actant);
      }
      if (Array.isArray(conf.citations)) {
        links.push(...conf.citations.filter(Boolean));
      }
      if (Array.isArray(conf.bibliographies)) {
        links.push(...conf.bibliographies.filter(Boolean));
      }
      if (Array.isArray(conf.mediagraphies)) {
        links.push(...conf.mediagraphies.filter(Boolean));
      }
    }
  });
  
  return links;
}




export async function getActants() {
  try {
    const storedActants = sessionStorage.getItem('actants');

    if (storedActants) {
      return JSON.parse(storedActants);
    }

    const actants = await getDataByUrl('https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getActants&json=1');
    const confs = await getConfs();
    const universities = await getUniversities();
    const doctoralSchools = await getDoctoralSchools();
    const laboratories = await getLaboratories();

    const universityMap = new Map(universities.map((uni: { id: any; }) => [uni.id, uni]));
    const doctoralSchoolMap = new Map(doctoralSchools.map((school: { id: any; }) => [school.id, school]));
    const laboratoryMap = new Map(laboratories.map((lab: { id: any; }) => [lab.id, lab]));

    const updatedActants = actants.map((actant: {
      firstname: string;
      lastname: string; id: number; universities: string[]; doctoralSchools: string[]; laboritories: string[]; 
      }) => {
      const interventionsCount = confs.filter((conf: { actant: string }) => conf.actant === String(actant.id)).length;

      return {
        ...actant,
        title: actant.firstname + ' ' + actant.lastname,
        type: 'actant',
        interventions: interventionsCount,
        universities: actant.universities.map(id => universityMap.get(id)),
        doctoralSchools: actant.doctoralSchools.map(id => doctoralSchoolMap.get(id)),
        laboritories: actant.laboritories.map(id => laboratoryMap.get(id)),
      };
    });

    console.log(updatedActants);
    sessionStorage.setItem('actants', JSON.stringify(updatedActants));
    return updatedActants;
  }
  catch (error) {
    console.error('Error fetching actants:', error);
    throw new Error('Failed to fetch actants');
  }
}




export async function getUniversities() {
  try {
    const storedUniversities = sessionStorage.getItem('universities');
  
    if (storedUniversities) {
      return JSON.parse(storedUniversities);
    }

    const universities = await getDataByUrl('https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getUniversities&json=1');

    const universitiesFull = universities.map((university: any) => ({
      ...university,
      title: university.name,
      type: 'university'
    }));

    sessionStorage.setItem('universities', JSON.stringify(universitiesFull));
    return universitiesFull;
  }
  catch (error) {
    console.error('Error fetching universities:', error);
    throw new Error('Failed to fetch universities');
  }
}




export async function getLaboratories() {
  try {
    const storedLaboritories = sessionStorage.getItem('laboritories');
  
    if (storedLaboritories) {
      return JSON.parse(storedLaboritories);
    }

    const laboritories = await getDataByUrl('https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getLaboratories&json=1');
    const laboritoriesFull = laboritories.map((laboritory: any) => ({
      ...laboritory,
      title: laboritory.name,
      type: 'laboritory'
    }));

    sessionStorage.setItem('laboritories', JSON.stringify(laboritoriesFull));
    return laboritoriesFull;
  }
  catch (error) {
    console.error('Error fetching laboritories:', error);
    throw new Error('Failed to fetch laboritories');
  }
}




export async function getDoctoralSchools() {
  try {
    const storedDoctoralSchools = sessionStorage.getItem('doctoralSchools');
  
    if (storedDoctoralSchools) {
      return JSON.parse(storedDoctoralSchools);
    }

    const doctoralSchools = await getDataByUrl('https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getDoctoralSchools&json=1');
    const doctoralSchoolsFull = doctoralSchools.map((doctoralSchool: any) => ({
      ...doctoralSchool,
      title: doctoralSchool.name,
      type: 'doctoralchool'
    }));

    sessionStorage.setItem('doctoralSchools', JSON.stringify(doctoralSchoolsFull));
    return doctoralSchoolsFull;
  }
  catch (error) {
    console.error('Error fetching doctoralSchools:', error);
    throw new Error('Failed to fetch doctoralSchools');
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
    console.error('Error fetching confByEdition:', error);
    throw new Error('Failed to fetch confByEdition');
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
    console.error('Error fetching confByActant:', error);
    throw new Error('Failed to fetch confByActant');
  }
}




export async function filterActants(searchQuery: string) {
  try {
    const actants = await getActants();
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

    return filteredConfs;
  } catch (error) {
    console.error('Error fetching conferences:', error);
    throw new Error('Failed to fetch conferences');
  }
}




export async function getCitations() {
  try {
    const storedCitations = sessionStorage.getItem('citations');
  
    if (storedCitations) {
      return JSON.parse(storedCitations);
    }

    const citations = await getDataByUrl('https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getCitations&json=1');
    const citationsFull = citations.map((citation: any) => ({
      ...citation,
      title: citation.citation,
      type: 'citation'
    }));

    sessionStorage.setItem('citations', JSON.stringify(citationsFull));
    return citationsFull;
  }
  catch (error) {
    console.error('Error fetching actants:', error);
    throw new Error('Failed to fetch actants');
  }
}




export async function getConfCitations(confId: number){
  try{
    const confs = await getConfs();
    const citations = await getCitations();
    const actants = await getActants();

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




export async function getBibliographies() {
  try {
    const storedBibliographies = sessionStorage.getItem('bibliographies');
  
    if (storedBibliographies) {
      return JSON.parse(storedBibliographies);
    }

    const bibliographies = await getDataByUrl('https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getBibliographies&json=1');
    const bibliographiesFull = bibliographies.map((bibliographie: any) => ({
      ...bibliographie,
      type: 'bibliography'
    }));

    sessionStorage.setItem('bibliographies', JSON.stringify(bibliographiesFull));
    return bibliographiesFull;
  }
  catch (error) {
    console.error('Error fetching bibliographies:', error);
    throw new Error('Failed to fetch bibliographies');
  }
}



export async function getConfBibliographies(confId: number) {
  try {
    const confs = await getConfs();
    const bibliographies = await getBibliographies();

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



export async function getMediagraphies() {
  try {
    const storedMediagraphies = sessionStorage.getItem('mediagraphies');

    if (storedMediagraphies) {
      return JSON.parse(storedMediagraphies);
    }

    const mediagraphies = await getDataByUrl('https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getMediagraphies&json=1');
    const mediagraphiesFull = mediagraphies.map((mediagraphie: any) => ({
      ...mediagraphie,
      type: 'mediagraphie'
    }));

    sessionStorage.setItem('mediagraphies', JSON.stringify(mediagraphiesFull));
    return mediagraphiesFull;
  } catch (error) {
    console.error('Error fetching mediagraphies:', error);
    throw new Error('Failed to fetch mediagraphies');
  }
}


export async function getConfMediagraphies(confId: number) {
  try {
    const confs = await getConfs();
    const mediagraphies = await getMediagraphies();

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
