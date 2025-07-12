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
      const response = await fetch(
        `${API_URL}/items?resource_template_id=${resourceClassId}&page=${page}&per_page=${perPage}`,
      );
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
      const response = await fetch(
        `${API_URL}/items?resource_template_id=${resourceTemplateId}&page=${page}&per_page=${perPage}`,
      );
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

export async function getDataByUrl(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = (await response.json()) as Data;
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

export async function getCitations() {
  try {
    const storedCitations = sessionStorage.getItem('citations');

    if (storedCitations) {
      return JSON.parse(storedCitations);
    }

    const citations = await getDataByUrl(
      'https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getCitations&json=1',
    );
    const citationsFull = citations.map((citation: any) => ({
      ...citation,
      title: citation.citation,
      type: 'citation',
    }));

    sessionStorage.setItem('citations', JSON.stringify(citationsFull));
    return citationsFull;
  } catch (error) {
    console.error('Error fetching actants:', error);
    throw new Error('Failed to fetch actants');
  }
}

export async function getAnnotations() {
  try {
    const storedCitations = sessionStorage.getItem('annotations');

    if (storedCitations) {
      return JSON.parse(storedCitations);
    }

    const annotations = await getDataByUrl(
      'https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getAnnotations&json=1',
    );
    const annotationsFull = annotations.map((annotation: any) => ({
      ...annotation,
      type: 'annotation',
    }));

    sessionStorage.setItem('annotation', JSON.stringify(annotationsFull));
    return annotationsFull;
  } catch (error) {
    console.error('Error fetching actants:', error);
    throw new Error('Failed to fetch actants');
  }
}


export async function getBibliographies() {
  try {
    const storedBibliographies = sessionStorage.getItem('bibliographies');

    if (storedBibliographies) {
      return JSON.parse(storedBibliographies);
    }

    const bibliographies = await getDataByUrl(
      'https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getBibliographies&json=1',
    );
    const bibliographiesFull = bibliographies.map((bibliographie: any) => ({
      ...bibliographie,
      type: 'bibliography',
    }));

    sessionStorage.setItem('bibliographies', JSON.stringify(bibliographiesFull));
    return bibliographiesFull;
  } catch (error) {
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

    const mediagraphies = await getDataByUrl(
      'https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getMediagraphies&json=1',
    );
    const mediagraphiesFull = mediagraphies.map((mediagraphie: any) => ({
      ...mediagraphie,
      type: 'mediagraphie',
    }));

    sessionStorage.setItem('mediagraphies', JSON.stringify(mediagraphiesFull));
    return mediagraphiesFull;
  } catch (error) {
    console.error('Error fetching mediagraphies:', error);
    throw new Error('Failed to fetch mediagraphies');
  }
}

export async function getDoctoralSchools() {
  try {
    const storedDoctoralSchools = sessionStorage.getItem('doctoralSchools');

    if (storedDoctoralSchools) {
      return JSON.parse(storedDoctoralSchools);
    }

    const doctoralSchools = await getDataByUrl(
      'https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getDoctoralSchools&json=1',
    );
    const doctoralSchoolsFull = doctoralSchools.map((doctoralSchool: any) => ({
      ...doctoralSchool,
      title: doctoralSchool.name,
      type: 'doctoralchool',
    }));

    sessionStorage.setItem('doctoralSchools', JSON.stringify(doctoralSchoolsFull));
    return doctoralSchoolsFull;
  } catch (error) {
    console.error('Error fetching doctoralSchools:', error);
    throw new Error('Failed to fetch doctoralSchools');
  }
}

export async function getLaboratories() {
  try {
    const storedLaboritories = sessionStorage.getItem('laboritories');

    if (storedLaboritories) {
      return JSON.parse(storedLaboritories);
    }

    const laboritories = await getDataByUrl(
      'https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getLaboratories&json=1',
    );
    const laboritoriesFull = laboritories.map((laboritory: any) => ({
      ...laboritory,
      title: laboritory.name,
      type: 'laboritory',
    }));

    sessionStorage.setItem('laboritories', JSON.stringify(laboritoriesFull));
    return laboritoriesFull;
  } catch (error) {
    console.error('Error fetching laboritories:', error);
    throw new Error('Failed to fetch laboritories');
  }
}

export async function getUniversities() {
  try {
    const storedUniversities = sessionStorage.getItem('universities');

    if (storedUniversities) {
      return JSON.parse(storedUniversities);
    }

    const universities = await getDataByUrl(
      'https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getUniversities&json=1',
    );

    const universitiesFull = universities.map((university: any) => ({
      ...university,
      title: university.name,
      shortName: university.shortName,
      type: 'university',
    }));

    sessionStorage.setItem('universities', JSON.stringify(universitiesFull));
    return universitiesFull;
  } catch (error) {
    console.error('Error fetching universities:', error);
    throw new Error('Failed to fetch universities');
  }
}

export async function getActants() {
  try {
    const storedActants = sessionStorage.getItem('actants');

    if (storedActants) {
      return JSON.parse(storedActants);
    }

    const actants = await getDataByUrl(
      'https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getActants&json=1',
    );
    const confs = await getConfs();
    const universities = await getUniversities();
    const doctoralSchools = await getDoctoralSchools();
    const laboratories = await getLaboratories();

    const universityMap = new Map(universities.map((uni: { id: any }) => [uni.id, uni]));
    const doctoralSchoolMap = new Map(doctoralSchools.map((school: { id: any }) => [school.id, school]));
    const laboratoryMap = new Map(laboratories.map((lab: { id: any }) => [lab.id, lab]));

    const updatedActants = actants.map(
      (actant: {
        firstname: string;
        lastname: string;
        id: number;
        universities: string[];
        doctoralSchools: string[];
        laboritories: string[];
      }) => {
        const interventionsCount = confs.filter((conf: { actant: string }) => conf.actant === String(actant.id)).length;

        return {
          ...actant,
          title: actant.firstname + ' ' + actant.lastname,
          type: 'actant',
          interventions: interventionsCount,
          universities: actant.universities.map((id) => universityMap.get(id)),
          doctoralSchools: actant.doctoralSchools.map((id) => doctoralSchoolMap.get(id)),
          laboritories: actant.laboritories.map((id) => laboratoryMap.get(id)),
        };
      },
    );

    sessionStorage.setItem('actants', JSON.stringify(updatedActants));
    return updatedActants;
  } catch (error) {
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

    const confs = await getDataByUrl(
      'https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getConfs&json=1',
    );
    const keywords = await getKeywords();

    const keywordsMap = new Map(keywords.map((keyword: any) => [keyword.id, keyword]));

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

export async function getAllItems() {
  try {
    const cachedItems = sessionStorage.getItem('allItems');
    if (cachedItems) {
      return JSON.parse(cachedItems);
    }

    const [
      confs,
      actants,
      universities,
      laboratories,
      schools,
      citations,
      bibliographies,
      mediagraphies,
      keywords,
      collections,
      students,
   
    ] = await Promise.all([
      getConfs(),
      getActants(),
      getUniversities(),
      getLaboratories(),
      getDoctoralSchools(),
      getCitations(),
      getBibliographies(),
      getMediagraphies(),
      getKeywords(),
      getCollections(),
      getStudents(),
      getRecherches(),
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
      ...collections,
      ...students,
   
    ];

    sessionStorage.setItem('allItems', JSON.stringify(allItems));

    return allItems;
  } catch (error) {
    console.error('Erreur lors de la récupération des éléments:', error);
    throw new Error('Échec de la récupération des éléments');
  }
}

export async function getKeywords() {
  try {
    const storedKeywords = sessionStorage.getItem('keywords');

    if (storedKeywords) {
      return JSON.parse(storedKeywords);
    }

    const keywords = await getDataByUrl(
      'https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getMotCles&json=1',
    );
    const keywordsFull = keywords.map((keyword: any) => ({
      ...keyword,
      type: 'keyword',
    }));

    sessionStorage.setItem('keywords', JSON.stringify(keywordsFull));
    return keywordsFull;
  } catch (error) {
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
      'https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getCollections&json=1',
    );

    sessionStorage.setItem('collections', JSON.stringify(collections));
    return collections;
  } catch (error) {
    console.error('Error fetching collections:', error);
    throw new Error('Failed to fetch collections');
  }
}

export async function getRecherches() {
  try {
    
    const recherches = await getDataByUrl(
      'https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getRecherches&json=1',
    );

   
    return recherches;
  } catch (error) {
    console.error('Error fetching recherches:', error);
    throw new Error('Failed to fetch recherches');
  }
}

export async function getSeminaires() {
  try {
    const confs = await getConfs();
    const filteredConfs = confs.filter((conf: { event: string }) => conf.event === 'Séminaire Arcanes');
    const editionMap: { [key: string]: { confNum: number; date: string; season: string } } = {};

    

    filteredConfs.forEach((conf: { edition: any; date: string; season: string }) => {
      const editionId = conf.edition;
      const season = conf.season.trim();

      if (!editionMap[editionId]) {
        editionMap[editionId] = { confNum: 0, date: conf.date, season };
      }
      editionMap[editionId].confNum++;
    });

    

    const editions = Object.entries(editionMap)
      .map(([id, { confNum, date, season }]) => ({
        id,
        confNum,
        year: date.split('-')[0],
        date,
        season,
      }))
      .sort((a, b) => {
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


export async function getStudents() {
  try {
    const storedStudents = sessionStorage.getItem('student');

    if (storedStudents) {
      return JSON.parse(storedStudents);
    }

    const students = await getDataByUrl(
      'https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getStudents&json=1',
    );

    const updatedStudents = students.map(
      (student: {
        firstname: string;
        lastname: string;
        id: number;
      }) => {

        return {
          ...student,
          title: student.firstname + ' ' + student.lastname,
          type: 'student',
        };
      },
    );

    sessionStorage.setItem('students', JSON.stringify(updatedStudents));
    return updatedStudents;
  } catch (error) {
    console.error('Error fetching students:', error);
    throw new Error('Failed to fetch students');
  }
}