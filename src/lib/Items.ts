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
    const storedLaboritories = sessionStorage.getItem('laboratories');

    if (storedLaboritories) {
      return JSON.parse(storedLaboritories);
    }

    const laboratories = await getDataByUrl(
      'https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getLaboratories&json=1',
    );
    const laboratoriesFull = laboratories.map((laboritory: any) => ({
      ...laboritory,
      title: laboritory.name,
      type: 'laboritory',
    }));

    sessionStorage.setItem('laboratories', JSON.stringify(laboratoriesFull));
    return laboratoriesFull;
  } catch (error) {
    console.error('Error fetching laboratories:', error);
    throw new Error('Failed to fetch laboratories');
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

export async function getActants(actantId?: number) {
  try {
    const actants = sessionStorage.getItem('actants')
      ? JSON.parse(sessionStorage.getItem('actants')!)
      : await (async () => {
          const [rawActants, confs, universities, doctoralSchools, laboratories] = await Promise.all([
            getDataByUrl('https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getActants&json=1'),
            getAllConfs(),
            getUniversities(),
            getDoctoralSchools(),
            getLaboratories()
          ]);

          const universityMap = new Map(universities.map((u: any) => [u.id, u]));
          const doctoralSchoolMap = new Map(doctoralSchools.map((s: any) => [s.id, s]));
          const laboratoryMap = new Map(laboratories.map((l: any) => [l.id, l]));

          return rawActants.map((actant: any) => ({
            ...actant,
            title: `${actant.firstname} ${actant.lastname}`,
            type: 'actant',
            interventions: confs.filter((c: any) => c.actant === String(actant.id)).length,
            universities: actant.universities.map((id: string) => universityMap.get(id)),
            doctoralSchools: actant.doctoralSchools.map((id: string) => doctoralSchoolMap.get(id)),
            laboratories: actant.laboratories.map((id: string) => laboratoryMap.get(id)),
          }));
        })();

    if (!sessionStorage.getItem('actants')) {
      sessionStorage.setItem('actants', JSON.stringify(actants));
    }

    return actantId
      ? (actants.find((a: any) => a.id === String(actantId)) ?? (() => { throw new Error(`Actant with id ${actantId} not found`) })())
      : actants;

  } catch (error) {
    console.error('Error fetching actants:', error);
    throw new Error('Failed to fetch actants');
  }
}

export async function getSeminarConfs(confId?: number) {
  try {
    const confs = sessionStorage.getItem('seminarConfs')
      ? JSON.parse(sessionStorage.getItem('seminarConfs')!)
      : await (async () => {
          const [rawConfs, keywords] = await Promise.all([
            getDataByUrl('https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getSeminarConfs&json=1'),
            getKeywords()
          ]);

          const keywordsMap = new Map(keywords.map((k: any) => [k.id, k]));

          return rawConfs.map((conf: any) => ({
            ...conf,
            type: 'seminar',
            motcles: conf.motcles.map((id: string) => keywordsMap.get(id)).filter(Boolean),
            url: conf.url ? `https://www.youtube.com/embed/${conf.url.substr(-11)}` : conf.url,
            fullUrl: conf.fullUrl ? `https://www.youtube.com/embed/${conf.fullUrl.substr(-11)}` : conf.fullUrl
          }));
        })();

    if (!sessionStorage.getItem('seminarConfs')) {
      sessionStorage.setItem('seminarConfs', JSON.stringify(confs));
    }

    return confId
      ? await (async () => {
          const conf = confs.find((c: any) => c.id === String(confId));
          if (!conf) throw new Error(`Conference with id ${confId} not found`);

          if (conf.actant) conf.actant = await getActants(conf.actant);
          return conf;
        })()
      : confs;

  } catch (error) {
    console.error('Error fetching confs:', error);
    throw new Error('Failed to fetch confs');
  }
}

export async function getColloqueConfs(confId?: number) {
  try {
    const confs = sessionStorage.getItem('colloqueConfs')
      ? JSON.parse(sessionStorage.getItem('colloqueConfs')!)
      : await (async () => {
          const [rawConfs, keywords] = await Promise.all([
            getDataByUrl('https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getColloqueConfs&json=1'),
            getKeywords()
          ]);

          const keywordsMap = new Map(keywords.map((k: any) => [k.id, k]));

          return rawConfs.map((conf: any) => ({
            ...conf,
            type: 'colloque',
            motcles: conf.motcles.map((id: string) => keywordsMap.get(id)).filter(Boolean),
            url: conf.url ? `https://www.youtube.com/embed/${conf.url.substr(-11)}` : conf.url,
            fullUrl: conf.fullUrl ? `https://www.youtube.com/embed/${conf.fullUrl.substr(-11)}` : conf.fullUrl
          }));
        })();

    if (!sessionStorage.getItem('colloqueConfs')) {
      sessionStorage.setItem('colloqueConfs', JSON.stringify(confs));
    }

    return confId
      ? await (async () => {
          const conf = confs.find((c: any) => c.id === String(confId));
          if (!conf) throw new Error(`Conference with id ${confId} not found`);

          if (conf.actant) conf.actant = await getActants(conf.actant);
          return conf;
        })()
      : confs;

  } catch (error) {
    console.error('Error fetching confs:', error);
    throw new Error('Failed to fetch confs');
  }
}

export async function getStudyDayConfs(confId?: number) {
  try {
    const confs = sessionStorage.getItem('studyDayConfs')
      ? JSON.parse(sessionStorage.getItem('studyDayConfs')!)
      : await (async () => {
          const [rawConfs, keywords] = await Promise.all([
            getDataByUrl('https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getStudyDayConfs&json=1'),
            getKeywords()
          ]);

          const keywordsMap = new Map(keywords.map((k: any) => [k.id, k]));

          return (rawConfs || []).map((conf: any) => ({
            ...conf,
            type: 'studyday',
            motcles: (conf.motcles || []).map((id: string) => keywordsMap.get(id)).filter(Boolean),
            url: conf.url ? `https://www.youtube.com/embed/${conf.url.substr(-11)}` : conf.url,
            fullUrl: conf.fullUrl ? `https://www.youtube.com/embed/${conf.fullUrl.substr(-11)}` : conf.fullUrl
          }));
        })();

    if (!sessionStorage.getItem('studyDayConfs')) {
      sessionStorage.setItem('studyDayConfs', JSON.stringify(confs));
    }

    return confId
      ? await (async () => {
          const conf = confs.find((c: any) => c.id === String(confId));
          if (!conf) throw new Error(`Conference with id ${confId} not found`);

          if (conf.actant) conf.actant = await getActants(conf.actant);
          return conf;
        })()
      : confs;

  } catch (error) {
    console.error('Error fetching confs:', error);
    return []; // Return an empty array instead of throwing an error
  }
}

export async function getAllItems() {
  try {
    const cachedItems = sessionStorage.getItem('allItems');
    if (cachedItems) {
      return JSON.parse(cachedItems);
    }

    const [
      studyDayConfs,
      seminarConfs,
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
      experimentations,
      recherches,
      tools,
      feedbacks,
      oeuvres,
      recitIas,
      personnes,
    ] = await Promise.all([
      getStudyDayConfs(),
      getSeminarConfs(),
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
      getExperimentations(),
      getRecherches(),
      getTools(),
      getFeedbacks(),
      getOeuvres(),
      getRecitIas(),
      getPersonnes(),
    ]);

    const allItems = [
      ...studyDayConfs,
      ...seminarConfs,
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
      ...experimentations,
      ...feedbacks,
      ...oeuvres,
      ...tools,
      ...(Array.isArray(recherches) ? recherches : []),
      ...(Array.isArray(recitIas) ? recitIas : []),
      ...(Array.isArray(personnes) ? personnes : []),

    ];
    sessionStorage.setItem('allItems', JSON.stringify(allItems));

    return allItems;
  } catch (error) {
    console.error('Erreur lors de la récupération des éléments:', error);
    throw new Error('Échec de la récupération des éléments');
  }
}

export async function getAllConfs(id?: number) {
  try {
    const seminarConfs = await getSeminarConfs();
    const colloqueConfs = await getColloqueConfs();
    const studyDayConfs = await getStudyDayConfs();

    const allConfs = [...seminarConfs, ...colloqueConfs, ...studyDayConfs];

    if (id !== undefined) {
      const conf = allConfs.find(conf => String(conf.id) === String(id));
      if (!conf) {
        throw new Error(`Conference with id ${id} not found`);
      }
      
      if (conf.actant) {
        conf.actant = await getActants(conf.actant);
      }
      
      return conf; 
    }

    return allConfs;
  } catch (error) {
    console.error('Error fetching all confs:', error);
    throw new Error('Failed to fetch all confs');
  }
}

export async function getTools() {
  try {
    const storedTools = sessionStorage.getItem('tools');
    if (storedTools) {
      return JSON.parse(storedTools);
    }

    const tools = await getDataByUrl(
      'https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getTools&json=1',
    );

    sessionStorage.setItem('tools', JSON.stringify(tools));
    return tools;
  } catch (error) {
    console.error('Error fetching tools:', error);
    throw new Error('Failed to fetch tools');
  }
}

export async function getPersonnes(id?: number) {
  try {
    const storedPersonnes = sessionStorage.getItem('personnes');
    if (storedPersonnes) {
      const personnes = JSON.parse(storedPersonnes);
      return id ? personnes.find((p: any) => p.id === String(id)) : personnes;
    }

    const personnes = await getDataByUrl(
      'https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getPersonnes&json=1',
    );

    sessionStorage.setItem('personnes', JSON.stringify(personnes));
    return id ? personnes.find((p: any) => p.id === String(id)) : personnes;
  }
  catch (error) {
    console.error('Error fetching personnes:', error);
    throw new Error('Failed to fetch personnes');
  }
}

export async function getOeuvres(id?: number) {
  try {
    const storedOeuvres = sessionStorage.getItem('oeuvres');
    if (storedOeuvres) {
      const oeuvres = JSON.parse(storedOeuvres);
      return id ? oeuvres.find((o: any) => o.id === String(id)) : oeuvres;
    }

    const [oeuvres,personnes] = await Promise.all([getDataByUrl(
      'https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getOeuvres&json=1',
    ), getPersonnes()])

    const personnesMap = new Map(personnes.map((p: any) => [String(p.id), p]));
  
    const oeuvresFull = oeuvres.map((oeuvre: any) => {
      // Parse les IDs multiples séparés par des virgules
      let personneIds: string[] = [];
      
      if (oeuvre.personne) {
        if (typeof oeuvre.personne === 'string') {
          personneIds = oeuvre.personne.split(',').map((id: string) => id.trim());
        } else if (Array.isArray(oeuvre.personne)) {
          personneIds = oeuvre.personne.map((id: any) => String(id));
        } else {
          personneIds = [String(oeuvre.personne)];
        }
      }
      
      const personnes = personneIds.map((id: string) => personnesMap.get(id)).filter(Boolean);
      
      return {
        ...oeuvre,
        type: 'oeuvre',
        personne: personnes.length > 0 ? personnes : null,
      };
    });
    sessionStorage.setItem('oeuvres', JSON.stringify(oeuvresFull));
    return id ? oeuvresFull.find((o: any) => o.id === String(id)) : oeuvresFull;

  } catch (error) {
    console.error('Error fetching oeuvres:', error);
    throw new Error('Failed to fetch oeuvres');
  }
}

export async function getKeywords() {
  try {
    const storedKeywords = sessionStorage.getItem('keywords');

    if (storedKeywords) {
      return JSON.parse(storedKeywords);
    }

    const keywords = await getDataByUrl(
      'https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getKeywords&json=1',
    );

    // Add null check and default to empty array if no keywords
    const keywordsFull = (keywords || []).map((keyword: any) => ({
      ...keyword,
      type: 'keyword',
    }));

    sessionStorage.setItem('keywords', JSON.stringify(keywordsFull));
    return keywordsFull;
  } catch (error) {
    console.error('Error fetching keywords:', error);
    // Return an empty array instead of throwing an error
    return [];
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

export async function getFeedbacks() {
  try {
    const storedFeedbacks = sessionStorage.getItem('feedbacks');
    if (storedFeedbacks) {
      return JSON.parse(storedFeedbacks);
    }

    const feedbacks = await getDataByUrl(
      'https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getFeedbacks&json=1',
    );
  
    feedbacks.forEach((feedback: any) => {
      feedback.url = '/feedback/' + feedback.id;
    });

    sessionStorage.setItem('feedbacks', JSON.stringify(feedbacks));
    return feedbacks;
  }
  catch (error) {
    console.error('Error fetching feedbacks:', error);
    throw new Error('Failed to fetch feedbacks');
  }
}

export async function getExperimentations() {
  try {
    const storedExperimentations = sessionStorage.getItem('experimentations');

    if (storedExperimentations) {
      return JSON.parse(storedExperimentations);
    }

    // Récupérer les expérimentations et les feedbacks en parallèle
    const [experimentations, feedbacks] = await Promise.all([
      getDataByUrl(
        'https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getExperimentations&json=1',
      ),
      getFeedbacks()
    ]);

    // Créer un map des feedbacks pour un accès rapide par ID
    const feedbacksMap = new Map(feedbacks.map((feedback: any) => [feedback.id.toString(), feedback]));

    // Fusionner les feedbacks dans chaque expérimentation
    const experimentationsFull = experimentations.map((experimentation: any) => {
      const experimentationWithFeedbacks = {
        ...experimentation,
        type: 'experimentation',
      };

      // Si l'expérimentation a un tableau de feedbacks, remplacer les IDs par les objets complets
      if (experimentation.feedbacks && Array.isArray(experimentation.feedbacks)) {
        experimentationWithFeedbacks.feedbacks = experimentation.feedbacks
          .map((feedbackId: string) => feedbacksMap.get(feedbackId))
          .filter(Boolean); // Enlever les feedbacks non trouvés
      }

      return experimentationWithFeedbacks;
    });

    sessionStorage.setItem('experimentations', JSON.stringify(experimentationsFull));
    return experimentationsFull;
  } catch (error) {
    console.error('Error fetching experimentations:', error);
    throw new Error('Failed to fetch experimentations');
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

export async function getRecitIas() {
  try {
    const storedFeedbacks = sessionStorage.getItem('recitIas');
    if (storedFeedbacks) {
      return JSON.parse(storedFeedbacks);
    }

    const recitIas = await getDataByUrl(
      'https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getFeedbacks&json=1',
    );
  
    recitIas.forEach((feedback: any) => {
      feedback.url = '/recitIas/' + feedback.id;
    });

    sessionStorage.setItem('recitIas', JSON.stringify(recitIas));
    return recitIas;
  }
  catch (error) {
    console.error('Error fetching recitIas:', error);
    throw new Error('Failed to fetch recitIas');
  }
}

export function generateThumbnailUrl(mediaId: string | number): string {
  // Assuming the API endpoint for media thumbnails follows this pattern
  return `https://tests.arcanes.ca/omk/s/edisem/media/${mediaId}`;
}