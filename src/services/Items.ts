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
    //console.log(`Fetching data from: ${url}`);

    // Check if this is an AJAX call that should use POST
    const isAjaxCall = url.includes('/ajax?') && url.includes('helper=Query');

    let response;
    if (isAjaxCall) {
      // For AJAX calls, use GET with parameters in URL (the API expects this format)
      response = await fetch(url);
    } else {
      // Regular GET request
      response = await fetch(url);
    }

    //console.log(`Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
    }

    // Check if response has content
    const text = await response.text();
    //console.log(`Response text length: ${text.length}`);
    //console.log(`Response text preview: ${text.substring(0, 200)}...`);

    if (!text || text.trim() === '') {
      console.warn(`Empty response from ${url}`);
      return [];
    }

    // Try to parse JSON
    try {
      const data = JSON.parse(text);
      //console.log(`Parsed data type: ${Array.isArray(data) ? 'array' : typeof data}`);
      //console.log(`Parsed data length: ${Array.isArray(data) ? data.length : 'N/A'}`);
      return data;
    } catch (jsonError) {
      console.error(`JSON parsing error for ${url}:`, jsonError);
      console.error('Response text:', text);
      return [];
    }
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

export async function getAnnotations( id?: string | number   ) {
  try {
    console.log('🚀 getAnnotations() called', id ? `for ID: ${id}` : '(all annotations)');
    const storedCitations = sessionStorage.getItem('annotations');

    if (storedCitations) {
      console.log('📦 Using cached annotations from sessionStorage');
      const allAnnotations = JSON.parse(storedCitations);

    // Si un ID est spécifié, chercher l'annotation avec cet ID
    if (id) {
      console.log(`🎯 Looking for annotation with ID: "${id}" (cached)`);

      // Chercher directement l'annotation avec cet ID
      const foundAnnotation = allAnnotations.find((annotation: any) =>
        String(annotation.id) === String(id)
      );

      if (foundAnnotation) {
        console.log(`✅ Found annotation with ID: ${id} (cached)`);
        return [foundAnnotation]; // Retourner un tableau avec l'annotation trouvée
      } else {
        console.log(`❌ No cached annotation found with ID: "${id}"`);
        return [];
      }
    }

      return allAnnotations;
    }

    console.log('📡 Fetching fresh annotations data...');
    const [annotations, personnes, actants, students] = await Promise.all([
      getDataByUrl(
      'https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getAnnotations&json=1',
    ),
    getPersonnes(),
    getActants(),
    getStudents()
  ]);

    console.log('📋 Raw annotations structure:', annotations.slice(0, 3)); // Show first 3 annotations
    console.log('🔍 Sample annotation keys:', annotations.length > 0 ? Object.keys(annotations[0]) : 'No annotations');

    const annotationsFull = annotations.map((annotation: any) => ({
      ...annotation,
      type: 'annotation',
    }));

    console.log('🔄 Processing annotations, count:', annotationsFull.length);
    console.log('👥 Available personnes:', personnes.length, 'actants:', actants.length, 'students:', students.length);

    annotationsFull.forEach((annotation: any) => {
      const contributorId = annotation.contributor;

      // Chercher dans toutes les catégories: personnes, actants, students
      annotation.actant = [
        ...personnes.filter((personne: any) => personne.id === contributorId),
        ...actants.filter((actant: any) => actant.id === contributorId),
        ...students.filter((student: any) => student.id === contributorId)
      ];

     
    });

    // Si un ID est spécifié, chercher l'annotation avec cet ID
    let resultAnnotations = annotationsFull;
    if (id) {
      console.log(`🎯 Looking for annotation with ID: "${id}" (fresh data)`);

      // Chercher directement l'annotation avec cet ID
      const foundAnnotation = annotationsFull.find((annotation: any) =>
        String(annotation.id) === String(id)
      );

      if (foundAnnotation) {
        console.log(`✅ Found annotation with ID: ${id} (fresh data)`);
        resultAnnotations = [foundAnnotation]; // Retourner un tableau avec l'annotation trouvée
      } else {
        console.log(`❌ No fresh annotation found with ID: "${id}"`);
        resultAnnotations = [];
      }
    }

    console.log('✅ Annotations processed successfully:', resultAnnotations.length);
    console.log(resultAnnotations);



    sessionStorage.setItem('annotations', JSON.stringify(annotationsFull));

    return resultAnnotations;

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

export async function getActants(actantIds?: string | string[]) {
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

          return rawActants.map((actant: any) => {
            const interventions = confs.filter((c: any) => {
              if (typeof c.actant === 'string' && c.actant.includes(',')) {
                const actantIds = c.actant.split(',').map((id: string) => id.trim());
                return actantIds.includes(String(actant.id));
              }
              else if (Array.isArray(c.actant)) {
                return c.actant.map(String).includes(String(actant.id));
              }
              else {
                return String(c.actant) === String(actant.id);
              }
            }).length;

            return {
              ...actant,
              title: `${actant.firstname} ${actant.lastname}`,
              type: 'actant',
              interventions,
              universities: actant.universities.map((id: string) => universityMap.get(id)),
              doctoralSchools: actant.doctoralSchools.map((id: string) => doctoralSchoolMap.get(id)),
              laboratories: actant.laboratories.map((id: string) => laboratoryMap.get(id)),
            };
          });
        })();

    if (!sessionStorage.getItem('actants')) {
      sessionStorage.setItem('actants', JSON.stringify(actants));
    }

    // Si aucun ID spécifié, retourner tous les actants
    if (!actantIds) {
      return actants;
    }

    // Normaliser les IDs en tableau de strings
    const normalizedIds = Array.isArray(actantIds) 
      ? actantIds.map(id => String(id))
      : [String(actantIds)];

    // Filtrer les actants correspondants
    const foundActants = actants.filter((a: any) => 
      normalizedIds.includes(String(a.id))
    );

    // Si un seul ID était demandé (pas un tableau), retourner l'objet unique
    if (!Array.isArray(actantIds) && foundActants.length > 0) {
      return foundActants[0];
    }

    // Sinon retourner le tableau (même si vide)
    return foundActants;

  } catch (error) {
    console.error('Error fetching actants:', error);
    throw new Error('Failed to fetch actants');
  }
}

export async function getEditions(editionIds?: string | string[]) {
  try {
    let editions: any[];
    const storedEditions = sessionStorage.getItem('editions');

    if (!storedEditions) {
      const rawEditions = await getDataByUrl(
        'https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getEditions&json=1',
      );

      editions = rawEditions.map((edition: any) => ({
        ...edition,
        type: 'edition',
      }));

      sessionStorage.setItem('editions', JSON.stringify(editions));
    } else {
      editions = JSON.parse(storedEditions);
    }

    if (!editionIds) {
      return editions;
    }

    const normalizedIds = Array.isArray(editionIds) 
      ? editionIds.map(id => String(id))
      : [String(editionIds)];

    const foundEditions = editions.filter((e: any) => 
      normalizedIds.includes(String(e.id))
    );

    return !Array.isArray(editionIds) && foundEditions.length > 0 
      ? foundEditions[0] 
      : foundEditions;

  } catch (error) {
    console.error('Error fetching editions:', error);
    throw new Error('Failed to fetch editions');
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
      colloqueConfs,
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
      comments,
    ] = await Promise.all([
      getStudyDayConfs(),
      getSeminarConfs(),
      getColloqueConfs(),
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
      getComments(),
    ]);

    const allItems = [
      ...studyDayConfs,
      ...seminarConfs,
      ...colloqueConfs,
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
      ...(Array.isArray(comments) ? comments : []),
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


export async function getTools(id?: number) {
  try {
    // 1. CACHE : Vérifier sessionStorage
    const storedTools = sessionStorage.getItem('tools');
    if (storedTools) {
      const tools = JSON.parse(storedTools);
      return id ? tools.find((t: any) => t.id === String(id) || t.id === id) : tools;
    }

    // 2. FETCH : Récupérer les données (pas d'hydratation nécessaire car PHP fait déjà les maps)
    const rawTools = await getDataByUrl(
      'https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getTools&json=1',
    );

    // 3. TRANSFORMATION : Ajouter le type et s'assurer que tout est correct
    const toolsFull = rawTools.map((tool: any) => ({
      ...tool,
      type: 'tool',
      // programmingLanguages, contributors, isPartOf sont déjà hydratés dans PHP
      // associatedMedia est déjà un tableau d'URLs
    }));

    // 4. CACHE + RETURN : Stocker et retourner
    sessionStorage.setItem('tools', JSON.stringify(toolsFull));
    return id ? toolsFull.find((t: any) => t.id === String(id) || t.id === id) : toolsFull;
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

    // Use Promise.all to fetch all needed data (can fetch additional data for linking elements)
    const [oeuvres, personnes, elementsNarratifs, elementsEsthetique, annotations] = await Promise.all([
      getDataByUrl('https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getOeuvres&json=1'),
      getPersonnes(),
      getElementNarratifs(),
      getElementEsthetique(),
      getAnnotations()
    ]);

    // Build maps for fast lookups
    const personnesMap = new Map(personnes.map((p: any) => [String(p.id), p]));
    const elementsNarratifsMap = new Map(
      (elementsNarratifs || []).map((e: any) => [String(e.id), { ...e, type: 'elementNarratif' }])
    );
    const elementsEsthetiqueMap = new Map(
      (elementsEsthetique || []).map((e: any) => [String(e.id), { ...e, type: 'elementEsthetique' }])
    );
    const annotationsMap = new Map(
      (annotations || []).map((a: any) => [String(a.id), { ...a, type: 'annotation' }])
    );
   

    const oeuvresFull = oeuvres.map((oeuvre: any) => {
      // Parse les IDs multiples séparés par des virgules pour personne
      let personneIds: string[] = [];
      if (oeuvre.personne) {
        if (typeof oeuvre.personne === 'string') {
          personneIds = oeuvre.personne.split(',').map((id: string) => id.trim());
        } else if (Array.isArray(oeuvre.personne)) {
          personneIds = oeuvre.personne.map((id: any) => String(id));
        } else if (oeuvre.personne != null) {
          personneIds = [String(oeuvre.personne)];
        }
      }

      // Parse les IDs multiples pour elementsNarratifs
      let elementsNarratifsIds: string[] = [];
      if (oeuvre.elementsNarratifs) {
        if (typeof oeuvre.elementsNarratifs === 'string') {
          elementsNarratifsIds = oeuvre.elementsNarratifs.split(',').map((id: string) => id.trim());
        } else if (Array.isArray(oeuvre.elementsNarratifs)) {
          elementsNarratifsIds = oeuvre.elementsNarratifs.map((id: any) => String(id));
        } else if (oeuvre.elementsNarratifs != null) {
          elementsNarratifsIds = [String(oeuvre.elementsNarratifs)];
        }
      }

      // Parse les IDs multiples pour elementsEsthetique
      let elementsEsthetiqueIds: string[] = [];
      if (oeuvre.elementsEsthetique) {
        if (typeof oeuvre.elementsEsthetique === 'string') {
          elementsEsthetiqueIds = oeuvre.elementsEsthetique.split(',').map((id: string) => id.trim());
        } else if (Array.isArray(oeuvre.elementsEsthetique)) {
          elementsEsthetiqueIds = oeuvre.elementsEsthetique.map((id: any) => String(id));
        } else if (oeuvre.elementsEsthetique != null) {
          elementsEsthetiqueIds = [String(oeuvre.elementsEsthetique)];
        }
      }

      // Parse les IDs multiples pour annotations
      let annotationsIds: string[] = [];
      if (oeuvre.annotations) {
        if (typeof oeuvre.annotations === 'string') {
          annotationsIds = oeuvre.annotations.split(',').map((id: string) => id.trim());
        } else if (Array.isArray(oeuvre.annotations)) {
          annotationsIds = oeuvre.annotations.map((id: any) => String(id));
        } else if (oeuvre.annotations != null) {  
          annotationsIds = [String(oeuvre.annotations)];
        }
      }

      // Relink objects using the maps
      const personnesLinked = personneIds.map((id: string) => personnesMap.get(id)).filter(Boolean);
      const elementsNarratifsLinked = elementsNarratifsIds.map((id: string) => elementsNarratifsMap.get(id)).filter(Boolean);
      const elementsEsthetiqueLinked = elementsEsthetiqueIds.map((id: string) => elementsEsthetiqueMap.get(id)).filter(Boolean);
      const annotationsLinked = annotationsIds.map((id: string) => annotationsMap.get(id)).filter(Boolean);


      return {
        ...oeuvre,
        type: 'oeuvre',
        personne: personnesLinked.length > 0 ? personnesLinked : null,
        elementsNarratifs: elementsNarratifsLinked.length > 0 ? elementsNarratifsLinked : null,
        elementsEsthetique: elementsEsthetiqueLinked.length > 0 ? elementsEsthetiqueLinked : null,
        annotations: annotationsLinked.length > 0 ? annotationsLinked : null,
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

export async function getElementNarratifs(id?: number): Promise<any> {
  try {
    const storedElementNarratifs = sessionStorage.getItem('elementNarratifs');
    if (storedElementNarratifs) {
      const elementNarratifs = JSON.parse(storedElementNarratifs);
      return id ? elementNarratifs.find((e: any) => e.id === String(id)) : elementNarratifs;
    }

    const [elementNarratifs, personnes, mediagraphies] = await Promise.all([
      getDataByUrl('https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getElementNarratifs&json=1'),
      getPersonnes(),
      getMediagraphies()
    ]);

    const personnesMap = new Map(personnes.map((item: any) => [String(item.id), item]));
    const mediagraphiesMap = new Map(mediagraphies.map((item: any) => [String(item.id), item]));

    const elementNarratifsFull = elementNarratifs.map((element: any) => {
      // Gérer la relation creator (personnes)
      let creator = [];
      if (element.creator) {
        if (typeof element.creator === 'string' && element.creator.includes(',')) {
          const creatorIds = element.creator.split(',').map((id: string) => id.trim());
          creator = creatorIds.map((id: string) => personnesMap.get(id)).filter(Boolean);
        } else if (Array.isArray(element.creator)) {
          creator = element.creator.map((id: any) => personnesMap.get(String(id))).filter(Boolean);
        } else {
          const creatorObj = personnesMap.get(String(element.creator));
          creator = creatorObj ? [creatorObj] : [];
        }
      }
      // Gérer la relation references (mediagraphies)
      let references = null;
      if (element.references) {
        if (typeof element.references === 'string' && element.references.includes(',')) {
          const referencesIds = element.references.split(',').map((id: string) => id.trim());
          references = referencesIds.map((id: string) => mediagraphiesMap.get(id)).filter(Boolean);
        } else if (Array.isArray(element.references)) {
          references = element.references.map((id: any) => mediagraphiesMap.get(String(id))).filter(Boolean);
        } else {
          references = mediagraphiesMap.get(String(element.references));
        }
      }

      return {
        ...element,
        type: 'elementNarratifs',
        creator,
        references,
        // Gérer associatedMedia comme tableau
        associatedMedia: Array.isArray(element.associatedMedia) 
          ? element.associatedMedia 
          : element.associatedMedia 
            ? [element.associatedMedia] 
            : []
      };
    });

    sessionStorage.setItem('elementNarratifs', JSON.stringify(elementNarratifsFull));
    return id ? elementNarratifsFull.find((e: any) => e.id === String(id)) : elementNarratifsFull;

  } catch (error) {
    console.error('Error fetching elementNarratifs:', error);
    throw new Error('Failed to fetch elementNarratifs');
  }
}


export async function getElementEsthetique( id?: number) {
  try {
    const storedElementEsthetique = sessionStorage.getItem('elementEsthetique');

    if (storedElementEsthetique) {
      const elementEsthetique = JSON.parse(storedElementEsthetique);
      return id ? elementEsthetique.find((e: any) => e.id === String(id)) : elementEsthetique;
    }

    // Récupérer elementEsthetique et les personnes, actants en parallèle
    const [elementEsthetique, personnes, actants] = await Promise.all([
      getDataByUrl(
        'https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getElementEsthetique&json=1',
      ),
      getPersonnes(),
      getActants()
    ]);

   
    console.log('personnes', personnes);

    // Créer des maps pour un accès rapide par ID
    const personnesMap = new Map(personnes.map((personne: any) => [personne.id.toString(), personne]));
    const actantsMap = new Map(actants.map((actant: any) => [actant.id.toString(), actant]));

    // Créer une map des elementEsthetique pour les relations relatedResource
    const elementEsthetiqueMap = new Map(elementEsthetique.map((element: any) => [element.id.toString(), element]));

    // Fusionner les relations dans chaque elementEsthetique
    const elementEsthetiqueFull = elementEsthetique.map((elementEsthetique: any) => {
      const elementWithRelations = {
        ...elementEsthetique,
        type: 'elementEsthetique',
      };

      // Si elementEsthetique a des creator, remplacer les IDs par les objets complets
      if (elementEsthetique.creator) {
        if (Array.isArray(elementEsthetique.creator)) {
          elementWithRelations.creator = elementEsthetique.creator
            .map((creatoId: string) => personnesMap.get(creatoId))
            .filter(Boolean);
        } else {
          const creatorObj = personnesMap.get(elementEsthetique.creator);
          elementWithRelations.creator = creatorObj ? [creatorObj] : [];
        }
      } else {
        elementWithRelations.creator = [];
      }
      // Si elementEsthetique a des contributor, remplacer les IDs par les objets complets
      if (elementEsthetique.contributor) {
        if (Array.isArray(elementEsthetique.contributor)) {
          elementWithRelations.contributor = elementEsthetique.contributor
            .map((contributoId: string) => actantsMap.get(contributoId))
            .filter(Boolean);
        } else {
          elementWithRelations.contributor = actantsMap.get(elementEsthetique.contributor);
        }
      }
      // Si elementEsthetique a des relatedResource, remplacer les IDs par les objets complets
      if (elementEsthetique.relatedResource) {
        if (Array.isArray(elementEsthetique.relatedResource)) {
          elementWithRelations.relatedResource = elementEsthetique.relatedResource
            .map((resourceId: string) => elementEsthetiqueMap.get(resourceId))
            .filter(Boolean);
        } else {
          elementWithRelations.relatedResource = elementEsthetiqueMap.get(elementEsthetique.relatedResource);
        }
      }
      return elementWithRelations;
    });

    sessionStorage.setItem('elementEsthetique', JSON.stringify(elementEsthetiqueFull));
    return elementEsthetiqueFull;
  } catch (error) {
    console.error('Error fetching elementEsthetique:', error);
    throw new Error('Failed to fetch elementEsthetique');
  }
}

export async function getComments(forceRefresh = false) {
  try {
    const storedComments = sessionStorage.getItem('comments');
    if (storedComments && !forceRefresh) {
      return JSON.parse(storedComments);
    }

      const [comments, actants] = await Promise.all([
      getDataByUrl(
      'https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getComments&json=1',
    ),getActants()
    ]);

    const actantsMap = new Map(actants.map((actant: any) => [actant.id.toString(), actant]));
    comments.forEach((comment: any) => {
      comment.actant = actantsMap.get(comment.actant);
    });


    sessionStorage.setItem('comments', JSON.stringify(comments));
    return comments;
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw new Error('Failed to fetch comments');
  }
}

export async function getAnalyseCritiqueById(id: string | number) {
  try {
    console.log('🔍 Searching for analyse critique with ID:', id);

    // Try to fetch directly from the API endpoint that might return this specific item
    // Based on the structure shown by the user, it seems like this might be a specific content type
    try {
      // Try to get it from all items if cached first
      const allItems = await getAllItems();
      const analyseCritique = allItems.find((item: any) =>
        item.id === String(id) && (
          item.type === 'analyse-critique' ||
          item.type === 'analyse_critique' ||
          item.type === 'recherche' ||
          item.title?.toLowerCase().includes('analyse') ||
          item.description?.toLowerCase().includes('analyse') ||
          item.id === String(id) // Also try to find by ID alone
        )
      );

      if (analyseCritique) {
        console.log('✅ Found analyse critique in all items:', analyseCritique);
        return analyseCritique;
      }
    } catch (e) {
      console.log('No cached items found, trying direct fetch...');
    }

    // If not found in cache, try to fetch specific recherches (which might include analyses critiques)
    const recherches = await getRecherches();
    const foundAnalyse = recherches.find((recherche: any) => String(recherche.id) === String(id));

    if (foundAnalyse) {
      console.log('✅ Found analyse critique in recherches:', foundAnalyse);
      return {
        ...foundAnalyse,
        type: 'analyse-critique'
      };
    }

    // Try to fetch directly from API if it's a specific content type
    try {
      const directItem = await getDataByUrl(
        `https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getItem&id=${id}&json=1`
      );

      if (directItem && (directItem.id === String(id) || directItem['o:id'] === String(id))) {
        console.log('✅ Found analyse critique via direct API call:', directItem);
        return {
          ...directItem,
          type: 'analyse-critique'
        };
      }
    } catch (e) {
      console.log('Direct API call failed, trying alternative endpoints...');
    }

    console.log('❌ Analyse critique not found with ID:', id);
    return null;

  } catch (error) {
    console.error('Error fetching analyse critique:', error);
    throw new Error('Failed to fetch analyse critique');
  }
}

export async function getObjetsTechnoIndustriels(id?: number) {
  try {
    // 1. CACHE : Vérifier sessionStorage
    const storedObjets = sessionStorage.getItem('objetsTechnoIndustriels');
    if (storedObjets) {
      const objets = JSON.parse(storedObjets);
      return id ? objets.find((o: any) => o.id === String(id)) : objets;
    }

    // 2. FETCH : Récupérer données + dépendances en Promise.all
    const [rawObjets, annotations, keywords] = await Promise.all([
      getDataByUrl(
        'https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getObjetsTechnoIndustriels&json=1'
      ),
      getAnnotations(),
      getKeywords()
    ]);

    // 3. MAPS : Créer maps pour accès rapide
    const annotationsMap = new Map(annotations.map((a: any) => [String(a.id), a]));
    const keywordsMap = new Map(keywords.map((k: any) => [String(k.id), k]));

    // 4. HYDRATATION : Remplacer IDs par objets complets
    const objetsFull = rawObjets.map((objet: any) => {
      // Hydrater descriptions (annotations)
      let descriptionsHydrated = [];
      if (Array.isArray(objet.descriptions)) {
        descriptionsHydrated = objet.descriptions
          .map((id: any) => annotationsMap.get(String(id)))
          .filter(Boolean);
      }

      // Hydrater keywords
      let keywordsHydrated = [];
      if (Array.isArray(objet.keywords)) {
        keywordsHydrated = objet.keywords
          .map((id: any) => keywordsMap.get(String(id)))
          .filter(Boolean);
      }

      return {
        ...objet,
        type: 'objetTechnoIndustriel',
        descriptions: descriptionsHydrated.length > 0 ? descriptionsHydrated : [],
        keywords: keywordsHydrated.length > 0 ? keywordsHydrated : [],
        // tools, reviews, relatedResources sont déjà hydratés dans PHP
        // associatedMedia est déjà un tableau d'URLs
      };
    });

    // 5. CACHE + RETURN : Stocker et retourner
    sessionStorage.setItem('objetsTechnoIndustriels', JSON.stringify(objetsFull));
    return id ? objetsFull.find((o: any) => o.id === String(id)) : objetsFull;

  } catch (error) {
    console.error('Error fetching objets techno-industriels:', error);
    throw new Error('Failed to fetch objets techno-industriels');
  }
}

export function generateThumbnailUrl(mediaId: string | number): string {
  // Assuming the API endpoint for media thumbnails follows this pattern
  return `https://tests.arcanes.ca/omk/s/edisem/media/${mediaId}`;
}