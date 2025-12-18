const API_URL = 'https://tests.arcanes.ca/omk/api';

// Clés de cache utilisées dans sessionStorage
const CACHE_KEYS = [
  'citations',
  'annotations',
  'bibliographies',
  'mediagraphies',
  'doctoralSchools',
  'laboratories',
  'universities',
  'actants',
  'editions',
  'seminarConfs',
  'colloqueConfs',
  'studyDayConfs',
  'allItems',
  'tools',
  'personnes',
  'recitsArtistiques',
  'keywords',
  'collections',
  'feedbacks',
  'experimentations',
  'student',
  'students',
  'recitIas',
  'elementNarratifs',
  'elementEsthetique',
  'comments',
  'recitsTechnoIndustriels',
  'recitsScientifiques',
  'recitsMediatiques',
];

const CACHE_TIMESTAMP_KEY = 'edisem_cache_timestamp';

/**
 * Vérifie si le cache doit être vidé (si c'est un nouveau jour)
 * et vide tous les caches si nécessaire
 */
function checkAndClearDailyCache(): void {
  try {
    const today = new Date().toDateString(); // Format: "Mon Jan 01 2024"
    const lastCacheDate = sessionStorage.getItem(CACHE_TIMESTAMP_KEY);

    // Si c'est un nouveau jour, vider tous les caches
    if (lastCacheDate !== today) {
      console.log('🗑️ Vidage du cache journalier - Nouveau jour détecté');

      // Vider tous les caches
      CACHE_KEYS.forEach((key) => {
        sessionStorage.removeItem(key);
      });

      // Mettre à jour le timestamp
      sessionStorage.setItem(CACHE_TIMESTAMP_KEY, today);
    }
  } catch (error) {
    console.error('Erreur lors de la vérification du cache:', error);
  }
}

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

    if (!response.ok) {
      console.error(`Erreur ${response.status} ${response.statusText} pour ${url}`);
      throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
    }

    // Check if response has content
    const text = await response.text();

    if (!text || text.trim() === '') {
      console.warn(`Empty response from ${url}`);
      return [];
    }

    // Try to parse JSON
    try {
      const data = JSON.parse(text);
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
    checkAndClearDailyCache();
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

export async function getAnnotations(id?: string | number) {
  try {
    checkAndClearDailyCache();

    const storedAnnotations = sessionStorage.getItem('annotations');

    // 📦 CACHE : Si les données sont en cache
    if (storedAnnotations) {
      const allAnnotations = JSON.parse(storedAnnotations);

      // Si un ID est spécifié, retourner l'annotation spécifique
      if (id) {
        const foundAnnotation = allAnnotations.find((annotation: any) =>
          String(annotation.id) === String(id)
        );

        if (foundAnnotation) {
          return [foundAnnotation];
        } else {
          console.log(`❌ No cached annotation found with ID: "${id}"`);
          return [];
        }
      }

      return allAnnotations;
    }

    // 🌐 FETCH : Récupérer les données depuis l'API
    const [annotations, personnes, actants, students] = await Promise.all([
      getDataByUrl(
        'https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getAnnotations&json=1',
      ),
      getPersonnes(),
      getActants(),
      getStudents()
    ]);





    // 🏗️ CONSTRUCTION : Créer les objets annotations de base
    const annotationsFull = annotations.map((annotation: any) => ({
      ...annotation,
      type: 'annotation',
    }));

    // 👥 ASSOCIATION : Associer les contributeurs (personnes, actants, students)
    annotationsFull.forEach((annotation: any) => {
      const contributorId = annotation.contributor;
      annotation.actant = [
        ...personnes.filter((personne: any) => personne.id === contributorId),
        ...actants.filter((actant: any) => actant.id === contributorId),
        ...students.filter((student: any) => student.id === contributorId)
      ];
    });


    // 💾 CACHE : Mettre en cache les annotations avec targets résolus
    sessionStorage.setItem('annotations', JSON.stringify(annotationsFull));

    // 🎯 FILTRAGE : Si un ID est spécifié, retourner l'annotation spécifique
    if (id) {
      const foundAnnotation = annotationsFull.find((annotation: any) =>
        String(annotation.id) === String(id)
      );
      return foundAnnotation ? [foundAnnotation] : [];
    }

    return annotationsFull;

  } catch (error) {
    console.error('❌ Error fetching annotations:', error);
    throw new Error('Failed to fetch annotations');
  }
}

export async function getAnnotationsWithTargets(annotations: any) {
  if (!annotations) return annotations;

  // Import dynamique pour éviter les imports circulaires
  const { fetchResourceByTemplateId } = await import('./resourceFetchers');

  // Toujours travailler sur un tableau
  const list = Array.isArray(annotations) ? annotations : [annotations];

  async function resolveTarget(target: any): Promise<any> {
    if (!target || !target.id || !target.template_id) return target;

    const id = parseInt(target.id);
    const templateId = parseInt(target.template_id);

    // Utiliser le fetcher centralisé au lieu du switch/case
    const resolved = await fetchResourceByTemplateId(templateId, id);
    return resolved || target;
  }

  return await Promise.all(list.map(async annotation => {
    if (annotation.target && Array.isArray(annotation.target)) {
      annotation.target = await Promise.all(annotation.target.map(resolveTarget));
    }

    if (annotation.related && Array.isArray(annotation.related)) {
      annotation.related = await Promise.all(annotation.related.map(resolveTarget));
    }
    return annotation;
  }));
}




export async function getBibliographies(id?: number) {
  try {
    checkAndClearDailyCache();
    const storedBibliographies = sessionStorage.getItem('bibliographies');

    if (storedBibliographies) {
      const bibliographies = JSON.parse(storedBibliographies);
      // Si un ID est spécifié, retourner la bibliographie spécifique
      return id ? bibliographies.find((b: any) => String(b.id) === String(id)) : bibliographies;
    }

    const bibliographies = await getDataByUrl(
      'https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getBibliographies&json=1',
    );
    const bibliographiesFull = bibliographies.map((bibliographie: any) => ({
      ...bibliographie,
      type: 'bibliographie',
    }));

    sessionStorage.setItem('bibliographies', JSON.stringify(bibliographiesFull));

    // Si un ID est spécifié, retourner la bibliographie spécifique
    return id ? bibliographiesFull.find((b: any) => String(b.id) === String(id)) : bibliographiesFull;
  } catch (error) {
    console.error('Error fetching bibliographies:', error);
    throw new Error('Failed to fetch bibliographies');
  }
}
export async function getMediagraphies(id?: number) {
  try {
    checkAndClearDailyCache();
    const storedMediagraphies = sessionStorage.getItem('mediagraphies');

    if (storedMediagraphies) {
      const mediagraphies = JSON.parse(storedMediagraphies);
      return id ? mediagraphies.find((m: any) => String(m.id) === String(id)) : mediagraphies;
    }

    const mediagraphies = await getDataByUrl(
      'https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getMediagraphies&json=1',
    );
    const mediagraphiesFull = mediagraphies.map((mediagraphie: any) => ({
      ...mediagraphie,
      type: 'mediagraphie',
    }));

    sessionStorage.setItem('mediagraphies', JSON.stringify(mediagraphiesFull));
    return id ? mediagraphiesFull.find((m: any) => String(m.id) === String(id)) : mediagraphiesFull;
  } catch (error) {
    console.error('Error fetching mediagraphies:', error);
    throw new Error('Failed to fetch mediagraphies');
  }
}

export async function getDoctoralSchools() {
  try {
    checkAndClearDailyCache();
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
    checkAndClearDailyCache();
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
    checkAndClearDailyCache();
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
    checkAndClearDailyCache();
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
    checkAndClearDailyCache();
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
    checkAndClearDailyCache();
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
    checkAndClearDailyCache();
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
    checkAndClearDailyCache();
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
    checkAndClearDailyCache();
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
      recitsArtistiques,
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
      getRecitsArtistiques(),
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
      ...recitsArtistiques,
      ...tools,
      ...(Array.isArray(recherches) ? recherches : []),
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
    checkAndClearDailyCache();
    const [seminarConfs, colloqueConfs, studyDayConfs, microResumes] = await Promise.all([
      getSeminarConfs(),
      getColloqueConfs(),
      getStudyDayConfs(),
      getMicroResumes()
    ]);

    // Créer une map des micro-résumés indexée par relatedResource (ID de conférence)
    const microResumesByConfId = new Map<string, any[]>();
    microResumes.forEach((microResume: any) => {
      if (microResume.relatedResource) {
        const confId = String(microResume.relatedResource);
        if (!microResumesByConfId.has(confId)) {
          microResumesByConfId.set(confId, []);
        }
        microResumesByConfId.get(confId)!.push(microResume);
      }
    });

    const allConfs = [...seminarConfs, ...colloqueConfs, ...studyDayConfs];

    // Lier les micro-résumés aux conférences
    const allConfsWithMicroResumes = allConfs.map((conf: any) => {
      const confId = String(conf.id);
      const linkedMicroResumes = microResumesByConfId.get(confId) || [];
      return {
        ...conf,
        micro_resumes: linkedMicroResumes.length > 0 ? linkedMicroResumes : null,
      };
    });

    if (id !== undefined) {
      const conf = allConfsWithMicroResumes.find(conf => String(conf.id) === String(id));
      if (!conf) {
        throw new Error(`Conference with id ${id} not found`);
      }

      if (conf.actant) {
        conf.actant = await getActants(conf.actant);
      }

      return conf;
    }



    return allConfsWithMicroResumes;
  } catch (error) {
    console.error('Error fetching all confs:', error);
    throw new Error('Failed to fetch all confs');
  }
}


export async function getTools(id?: number): Promise<any> {
  try {
    checkAndClearDailyCache();
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
    checkAndClearDailyCache();
    const storedPersonnes = sessionStorage.getItem('personnes');
    if (storedPersonnes) {
      const personnes = JSON.parse(storedPersonnes);
      return id ? personnes.find((p: any) => p.id === String(id)) : personnes;
    }

    const personnes = await getDataByUrl(
      'https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getPersonnes&json=1',
    );

    personnes.forEach((personne: any) => {
      personne.type = 'personne';
    });

    sessionStorage.setItem('personnes', JSON.stringify(personnes));
    return id ? personnes.find((p: any) => p.id === String(id)) : personnes;
  }
  catch (error) {
    console.error('Error fetching personnes:', error);
    throw new Error('Failed to fetch personnes');
  }
}

export async function getRecitsArtistiques(id?: number) {

  try {
    checkAndClearDailyCache();
    const storedRecitsArtistiques = sessionStorage.getItem('recitsArtistiques');
    if (storedRecitsArtistiques) {

      const recitsArtistiques = JSON.parse(storedRecitsArtistiques);


      return id ? recitsArtistiques.find((o: any) => o.id === String(id)) : recitsArtistiques;
    }



    // Use Promise.all to fetch all needed data (can fetch additional data for linking elements)
    const [recitsArtistiques, personnes, elementsNarratifs, elementsEsthetique, annotations, keywords, bibliographies, mediagraphies] = await Promise.all([
      getDataByUrl('https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getOeuvres&json=1'),
      getPersonnes(),
      getElementNarratifs(),
      getElementEsthetiques(),
      getAnnotations(),
      getKeywords(),
      getBibliographies(),
      getMediagraphies()
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
    const keywordsMap = new Map(
      (keywords || []).map((k: any) => [String(k.id), { ...k, type: 'keyword' }])
    );

    // Créer aussi une map indexée par titre pour pouvoir chercher par titre
    const keywordsMapByTitle = new Map(
      (keywords || []).map((k: any) => [String(k.title || k.id), { ...k, type: 'keyword' }])
    );

    const bibliographiesMap = new Map(bibliographies.map((item: any) => [String(item.id), item]));
    const mediagraphiesMap = new Map(mediagraphies.map((item: any) => [String(item.id), item]));



    const oeuvresFull = recitsArtistiques.map((oeuvre: any) => {
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

      // Parse les IDs multiples pour keywords
      let keywordsLinked: any[] = [];
      if (oeuvre.keywords) {
        // Si keywords est déjà un tableau d'objets complets (déjà hydraté), on les garde tels quels
        if (Array.isArray(oeuvre.keywords) && oeuvre.keywords.length > 0 && typeof oeuvre.keywords[0] === 'object' && oeuvre.keywords[0].title) {
          // Keywords déjà hydratés (objets avec title), on les garde
          keywordsLinked = oeuvre.keywords.map((k: any) => ({ ...k, type: 'keyword' }));
        } else {
          // Sinon, on parse les IDs/titres et on les lie
          let keywordsIds: string[] = [];
          if (typeof oeuvre.keywords === 'string') {
            keywordsIds = oeuvre.keywords.split(',').map((id: string) => id.trim());
          } else if (Array.isArray(oeuvre.keywords)) {
            keywordsIds = oeuvre.keywords.map((id: any) => String(id));
          } else if (oeuvre.keywords != null) {
            keywordsIds = [String(oeuvre.keywords)];
          }

          // Relink objects using the maps (chercher d'abord par ID, puis par titre)
          keywordsLinked = keywordsIds.map((idOrTitle: string) => {
            // Essayer d'abord par ID
            let keyword = keywordsMap.get(idOrTitle);
            if (!keyword) {
              // Si pas trouvé par ID, essayer par titre
              keyword = keywordsMapByTitle.get(idOrTitle);
            }
            return keyword;
          }).filter(Boolean);

          // Log pour debug si keywordsIds existe mais keywordsLinked est vide
          if (keywordsIds.length > 0 && keywordsLinked.length === 0) {
            console.log(`⚠️ Oeuvre ${oeuvre.id}: keywordsIds/titres trouvés mais non liés`, { keywordsIds, keywordsMapSize: keywordsMap.size, sampleKeywordId: keywordsIds[0] });
          }
        }
      }

      // Parse les IDs multiples pour referencesScient
      let referencesScientIds: string[] = [];
      if (oeuvre.referencesScient) {
        if (typeof oeuvre.referencesScient === 'string') {
          referencesScientIds = oeuvre.referencesScient.split(',').map((id: string) => id.trim());
        } else if (Array.isArray(oeuvre.referencesScient)) {
          referencesScientIds = oeuvre.referencesScient.map((id: any) => String(id));
        } else if (oeuvre.referencesScient != null) {
          referencesScientIds = [String(oeuvre.referencesScient)];
        }
      }

      // Parse les IDs multiples pour referencesCultu
      let referencesCultuIds: string[] = [];
      if (oeuvre.referencesCultu) {
        if (typeof oeuvre.referencesCultu === 'string') {
          referencesCultuIds = oeuvre.referencesCultu.split(',').map((id: string) => id.trim());
        } else if (Array.isArray(oeuvre.referencesCultu)) {
          referencesCultuIds = oeuvre.referencesCultu.map((id: any) => String(id));
        } else if (oeuvre.referencesCultu != null) {
          referencesCultuIds = [String(oeuvre.referencesCultu)];
        }
      }

      // Relink objects using the maps
      const personnesLinked = personneIds.map((id: string) => personnesMap.get(id)).filter(Boolean);
      const elementsNarratifsLinked = elementsNarratifsIds.map((id: string) => elementsNarratifsMap.get(id)).filter(Boolean);
      const elementsEsthetiqueLinked = elementsEsthetiqueIds.map((id: string) => elementsEsthetiqueMap.get(id)).filter(Boolean);
      const annotationsLinked = annotationsIds.map((id: string) => annotationsMap.get(id)).filter(Boolean);
      const referencesScientLinked = referencesScientIds.map((id: string) => mediagraphiesMap.get(id) || bibliographiesMap.get(id)).filter(Boolean);
      const referencesCultuLinked = referencesCultuIds.map((id: string) => mediagraphiesMap.get(id) || bibliographiesMap.get(id)).filter(Boolean);


      return {
        ...oeuvre,
        type: 'oeuvre',
        personne: personnesLinked.length > 0 ? personnesLinked : null,
        elementsNarratifs: elementsNarratifsLinked.length > 0 ? elementsNarratifsLinked : null,
        elementsEsthetique: elementsEsthetiqueLinked.length > 0 ? elementsEsthetiqueLinked : null,
        annotations: annotationsLinked.length > 0 ? annotationsLinked : null,
        keywords: keywordsLinked.length > 0 ? keywordsLinked : null,
        referencesScient: referencesScientLinked.length > 0 ? referencesScientLinked : null,
        referencesCultu: referencesCultuLinked.length > 0 ? referencesCultuLinked : null,
      };
    });



    sessionStorage.setItem('recitsArtistiques', JSON.stringify(oeuvresFull));
    return id ? oeuvresFull.find((o: any) => o.id === String(id)) : oeuvresFull;
  } catch (error) {
    console.error('Error fetching recitsArtistiques:', error);
    throw new Error('Failed to fetch recitsArtistiques');
  }
}

export async function getKeywords() {
  try {
    checkAndClearDailyCache();
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
    checkAndClearDailyCache();
    const storedCollections = sessionStorage.getItem('collections');
    if (storedCollections) {
      return JSON.parse(storedCollections);
    }

    const collections = await getDataByUrl(
      'https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getCollections&json=1',
    );

    collections.forEach((collection: any) => {
      collection.type = 'collection';
    });

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
    checkAndClearDailyCache();
    const storedFeedbacks = sessionStorage.getItem('feedbacks');
    if (storedFeedbacks) {
      return JSON.parse(storedFeedbacks);
    }

    const feedbacks = await getDataByUrl(
      'https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getFeedbacks&json=1',
    );

    feedbacks.forEach((feedback: any) => {
      feedback.url = '/feedback/' + feedback.id;
      feedback.type = 'feedback';
    });



    sessionStorage.setItem('feedbacks', JSON.stringify(feedbacks));
    return feedbacks;
  }
  catch (error) {
    console.error('Error fetching feedbacks:', error);
    throw new Error('Failed to fetch feedbacks');
  }
}

export async function getExperimentations(id?: number) {
  try {
    checkAndClearDailyCache();
    const storedExperimentations = sessionStorage.getItem('experimentations');

    if (storedExperimentations) {
      const experimentations = JSON.parse(storedExperimentations);
      return id ? experimentations.find((e: any) => String(e.id) || String(e.id) === String(id)) : experimentations;
    }

    // Récupérer les expérimentations et les feedbacks en parallèle
    const [experimentations, feedbacks, bibliographies, mediagraphies] = await Promise.all([
      getDataByUrl(
        'https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getExperimentations&json=1',
      ),
      getFeedbacks(),
      getBibliographies(),
      getMediagraphies()
    ]);
    const bibliographiesMap = new Map(bibliographies.map((item: any) => [String(item.id), item]));
    const mediagraphiesMap = new Map(mediagraphies.map((item: any) => [String(item.id), item]));
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

      // Gérer la relation references (mediagraphies et bibliographies)
      if (experimentation.references) {
        const getReference = (id: string) => mediagraphiesMap.get(id) || bibliographiesMap.get(id);

        if (typeof experimentation.references === 'string' && experimentation.references.includes(',')) {
          const referencesIds = experimentation.references.split(',').map((id: string) => id.trim());
          experimentationWithFeedbacks.references = referencesIds.map((id: string) => getReference(id)).filter(Boolean);
        } else if (Array.isArray(experimentation.references)) {
          experimentationWithFeedbacks.references = experimentation.references.map((id: any) => getReference(String(id))).filter(Boolean);
        } else {
          experimentationWithFeedbacks.references = getReference(String(experimentation.references));
        }
      }

      // Gérer la relation bibliographicCitations (mediagraphies et bibliographies)
      if (experimentation.bibliographicCitations) {
        const getCitation = (id: string) => mediagraphiesMap.get(id) || bibliographiesMap.get(id);

        if (typeof experimentation.bibliographicCitations === 'string' && experimentation.bibliographicCitations.includes(',')) {
          const citationsIds = experimentation.bibliographicCitations.split(',').map((id: string) => id.trim());
          experimentationWithFeedbacks.bibliographicCitations = citationsIds.map((id: string) => getCitation(id)).filter(Boolean);
        } else if (Array.isArray(experimentation.bibliographicCitations)) {
          experimentationWithFeedbacks.bibliographicCitations = experimentation.bibliographicCitations.map((id: any) => getCitation(String(id))).filter(Boolean);
        } else {
          experimentationWithFeedbacks.bibliographicCitations = getCitation(String(experimentation.bibliographicCitations));
        }
      }

      return experimentationWithFeedbacks;
    });

    sessionStorage.setItem('experimentations', JSON.stringify(experimentationsFull));
    return id ? experimentationsFull.find((e: any) => String(e.id) || String(e.id) === String(id)) : experimentationsFull;
  } catch (error) {
    console.error('Error fetching experimentations:', error);
    throw new Error('Failed to fetch experimentations');
  }
}

export async function getStudents() {
  try {
    checkAndClearDailyCache();
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


export async function getElementNarratifs(id?: number): Promise<any> {
  try {
    checkAndClearDailyCache();
    const storedElementNarratifs = sessionStorage.getItem('elementNarratifs');
    if (storedElementNarratifs) {
      const elementNarratifs = JSON.parse(storedElementNarratifs);
      return id ? elementNarratifs.find((e: any) => e.id === String(id)) : elementNarratifs;
    }

    const [elementNarratifs, personnes, mediagraphies, bibliographies] = await Promise.all([
      getDataByUrl('https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getElementNarratifs&json=1'),
      getPersonnes(),
      getMediagraphies(),
      getBibliographies()
    ]);

    const personnesMap = new Map(personnes.map((item: any) => [String(item.id), item]));
    const mediagraphiesMap = new Map(mediagraphies.map((item: any) => [String(item.id), item]));
    const bibliographiesMap = new Map(bibliographies.map((item: any) => [String(item.id), item]));

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
      // Gérer la relation references (mediagraphies et bibliographies)
      let references = null;
      if (element.references) {
        const getReference = (id: string) => mediagraphiesMap.get(id) || bibliographiesMap.get(id);

        if (typeof element.references === 'string' && element.references.includes(',')) {
          const referencesIds = element.references.split(',').map((id: string) => id.trim());
          references = referencesIds.map((id: string) => getReference(id)).filter(Boolean);
        } else if (Array.isArray(element.references)) {
          references = element.references.map((id: any) => getReference(String(id))).filter(Boolean);
        } else {
          references = getReference(String(element.references));
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


export async function getElementEsthetiques(id?: number) {
  try {
    checkAndClearDailyCache();
    const storedElementEsthetiques = sessionStorage.getItem('elementEsthetiques');

    if (storedElementEsthetiques) {
      const elementEsthetiques = JSON.parse(storedElementEsthetiques);
      return id ? elementEsthetiques.find((e: any) => e.id === String(id)) : elementEsthetiques;
    }

    // Récupérer elementEsthetique et les personnes, actants en parallèle
    const [elementEsthetiques, personnes, actants] = await Promise.all([
      getDataByUrl(
        'https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getElementEsthetique&json=1',
      ),
      getPersonnes(),
      getActants()
    ]);

    // Créer des maps pour un accès rapide par ID
    const personnesMap = new Map(personnes.map((personne: any) => [personne.id.toString(), personne]));
    const actantsMap = new Map(actants.map((actant: any) => [actant.id.toString(), actant]));

    // Créer une map des elementEsthetique pour les relations relatedResource
    const elementEsthetiquesMap = new Map(elementEsthetiques.map((element: any) => [element.id.toString(), element]));

    // Fusionner les relations dans chaque elementEsthetique
    const elementEsthetiquesFull = elementEsthetiques.map((elementEsthetique: any) => {
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
            .map((resourceId: string) => elementEsthetiquesMap.get(resourceId))
            .filter(Boolean);
        } else {
          elementWithRelations.relatedResource = elementEsthetiquesMap.get(elementEsthetique.relatedResource);
        }
      }
      return elementWithRelations;
    });

    sessionStorage.setItem('elementEsthetiques', JSON.stringify(elementEsthetiquesFull));
    return elementEsthetiquesFull;
  } catch (error) {
    console.error('Error fetching elementEsthetique:', error);
    throw new Error('Failed to fetch elementEsthetique');
  }
}

export async function getComments(forceRefresh = false) {
  try {
    checkAndClearDailyCache();
    const storedComments = sessionStorage.getItem('comments');
    if (storedComments && !forceRefresh) {
      return JSON.parse(storedComments);
    }

    const [comments, actants] = await Promise.all([
      getDataByUrl(
        'https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getComments&json=1',
      ), getActants()
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
    checkAndClearDailyCache();

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
        return analyseCritique;
      }
    } catch (e) {
      console.log('No cached items found, trying direct fetch...');
    }

    // If not found in cache, try to fetch specific recherches (which might include analyses critiques)
    const recherches = await getRecherches();
    const foundAnalyse = recherches.find((recherche: any) => String(recherche.id) === String(id));

    if (foundAnalyse) {
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

export async function getRecitsTechnoIndustriels(id?: number) {
  try {
    checkAndClearDailyCache();
    // 1. CACHE : Vérifier sessionStorage
    const storedObjets = sessionStorage.getItem('recitsTechnoIndustriels');
    if (storedObjets) {
      const objets = JSON.parse(storedObjets);
      return id ? objets.find((o: any) => o.id === String(id)) : objets;
    }

    // 2. FETCH : Récupérer données + dépendances en Promise.all
    const [rawObjets, annotations, keywords] = await Promise.all([
      getDataByUrl(
        'https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getRecitsTechnoIndustriels&json=1'
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
        type: 'recitTechnoIndustriel',
        descriptions: descriptionsHydrated.length > 0 ? descriptionsHydrated : [],
        keywords: keywordsHydrated.length > 0 ? keywordsHydrated : [],
        // tools, reviews, relatedResources sont déjà hydratés dans PHP
        // associatedMedia est déjà un tableau d'URLs
      };
    });

    // 5. CACHE + RETURN : Stocker et retourner
    sessionStorage.setItem('recitsTechnoIndustriels', JSON.stringify(objetsFull));
    return id ? objetsFull.find((o: any) => o.id === String(id)) : objetsFull;

  } catch (error) {
    console.error('Error fetching objets techno-industriels:', error);
    throw new Error('Failed to fetch objets techno-industriels');
  }
}

export async function getRecitsScientifiques(id?: number) {
  try {
    checkAndClearDailyCache();
    // 1. CACHE : Vérifier sessionStorage
    const storedDocs = sessionStorage.getItem('recitsScientifiques');
    if (storedDocs) {
      const docs = JSON.parse(storedDocs);
      return id ? docs.find((d: any) => d.id === String(id)) : docs;
    }

    // 2. FETCH : Récupérer données + dépendances en Promise.all
    const [rawDocs, keywords, personnes, annotations, bibliographies, mediagraphies] = await Promise.all([
      getDataByUrl(
        'https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getRecitsScientifiques&json=1'
      ),
      getKeywords(),
      getPersonnes(),
      getAnnotations(),
      getBibliographies(),
      getMediagraphies()
    ]);

    // 3. MAPS : Créer maps pour accès rapide
    const keywordsMap = new Map(keywords.map((k: any) => [String(k.id), k]));
    const personnesMap = new Map(personnes.map((p: any) => [String(p.id), p]));
    const annotationsMap = new Map(annotations.map((a: any) => [String(a.id), a]));
    const bibliographiesMap = new Map(bibliographies.map((b: any) => [String(b.id), b]));
    const mediagraphiesMap = new Map(mediagraphies.map((m: any) => [String(m.id), m]));
    // 4. HYDRATATION : Remplacer IDs par objets complets
    const docsFull = rawDocs.map((doc: any) => {
      // Hydrater descriptions (items)
      let descriptionsHydrated = [];
      if (Array.isArray(doc.descriptions)) {
        descriptionsHydrated = doc.descriptions
          .map((id: any) => annotationsMap.get(String(id)))
          .filter(Boolean);
      }

      // Hydrater keywords
      let keywordsHydrated = [];
      if (Array.isArray(doc.keywords)) {
        keywordsHydrated = doc.keywords
          .map((id: any) => keywordsMap.get(String(id)))
          .filter(Boolean);
      }

      // Hydrater creator (personne)
      let creatorHydrated = null;
      if (doc.creator) {
        // Vérifier si creator est un ID numérique ou une chaîne de caractères
        const creatorStr = String(doc.creator).trim();
        // Si c'est un ID numérique (chaîne qui peut être convertie en nombre, ex: "24323")
        if (creatorStr !== '' && !isNaN(Number(creatorStr)) && /^\d+$/.test(creatorStr)) {
          creatorHydrated = personnesMap.get(creatorStr) || null;
        } else {
          // Si c'est une chaîne de caractères (comme "BBC World Service"), garder la chaîne
          creatorHydrated = creatorStr;
        }
      }

      // Hydrater associatedMedia (items)
      let associatedMediaHydrated = [];
      if (Array.isArray(doc.associatedMedia)) {
        associatedMediaHydrated = doc.associatedMedia
          .filter(Boolean);
      }

      // Hydrater isRelatedTo (items)
      let isRelatedToHydrated = [];
      if (Array.isArray(doc.isRelatedTo)) {
        isRelatedToHydrated = doc.isRelatedTo
          .filter(Boolean);
      }

      // Hydrater referencesScient (items)
      let referencesScientHydrated = [];
      if (Array.isArray(doc.referencesScient)) {
        // Vérifier si c'est déjà des objets complets ou des IDs
        if (doc.referencesScient.length > 0 && typeof doc.referencesScient[0] === 'object' && doc.referencesScient[0] !== null) {
          // Déjà des objets complets
          referencesScientHydrated = doc.referencesScient;
        } else {
          // Ce sont des IDs, les hydrater
          referencesScientHydrated = doc.referencesScient
            .map((id: string) => bibliographiesMap.get(id) || mediagraphiesMap.get(id))
            .filter(Boolean);
        }
      }

      // Hydrater referencesCultu (items)
      let referencesCultuHydrated = [];
      if (Array.isArray(doc.referencesCultu)) {
        referencesCultuHydrated = doc.referencesCultu
          .map((id: string) => bibliographiesMap.get(id) || mediagraphiesMap.get(id))
          .filter(Boolean);
      }



      return {
        ...doc,
        type: 'recitScientifique',
        descriptions: descriptionsHydrated.length > 0 ? descriptionsHydrated : [],
        keywords: keywordsHydrated.length > 0 ? keywordsHydrated : [],
        creator: creatorHydrated,
        associatedMedia: associatedMediaHydrated.length > 0 ? associatedMediaHydrated : [],
        isRelatedTo: isRelatedToHydrated.length > 0 ? isRelatedToHydrated : [],
        referencesScient: referencesScientHydrated.length > 0 ? referencesScientHydrated : [],
        referencesCultu: referencesCultuHydrated.length > 0 ? referencesCultuHydrated : [],
      };
    });

    // 5. CACHE + RETURN : Stocker et retourner
    sessionStorage.setItem('recitsScientifiques', JSON.stringify(docsFull));
    return id ? docsFull.find((d: any) => d.id === String(id)) : docsFull;

  } catch (error) {
    console.error('Error fetching documentations scientifiques:', error);
    throw new Error('Failed to fetch documentations scientifiques');
  }
}

export async function getRecitsMediatiques(id?: number) {
  try {
    checkAndClearDailyCache();
    // 1. CACHE : Vérifier sessionStorage
    const storedRecits = sessionStorage.getItem('recitsMediatiques');
    if (storedRecits) {
      const recits = JSON.parse(storedRecits);
      return id ? recits.find((r: any) => r.id === String(id)) : recits;
    }

    // 2. FETCH : Récupérer données + dépendances en Promise.all
    const [rawRecits, keywords, personnes, annotations, bibliographies, mediagraphies, tools] = await Promise.all([
      getDataByUrl(
        'https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getRecitsMediatiques&json=1'
      ),
      getKeywords(),
      getPersonnes(),
      getAnnotations(),
      getBibliographies(),
      getMediagraphies(),
      getTools()
    ]);
    console.log('rawRecits', rawRecits);
    // 3. MAPS : Créer maps pour accès rapide
    const keywordsMap = new Map(keywords.map((k: any) => [String(k.id), k]));
    const personnesMap = new Map(personnes.map((p: any) => [String(p.id), p]));
    const annotationsMap = new Map(annotations.map((a: any) => [String(a.id), a]));
    const bibliographiesMap = new Map(bibliographies.map((b: any) => [String(b.id), b]));
    const mediagraphiesMap = new Map(mediagraphies.map((m: any) => [String(m.id), m]));
    const toolsMap = new Map(tools.map((t: any) => [String(t.id), t]));

    // 4. HYDRATATION : Remplacer IDs par objets complets
    const recitsFull = rawRecits.map((recit: any) => {
      // Hydrater descriptions (annotations)
      let descriptionsHydrated = [];
      if (Array.isArray(recit.descriptions)) {
        descriptionsHydrated = recit.descriptions
          .map((id: any) => annotationsMap.get(String(id)))
          .filter(Boolean);
      }

      // Hydrater keywords
      let keywordsHydrated = [];
      if (Array.isArray(recit.keywords)) {
        keywordsHydrated = recit.keywords
          .map((id: any) => keywordsMap.get(String(id)))
          .filter(Boolean);
      }

      // Hydrater creator (personne)
      let creatorHydrated = null;
      if (recit.creator) {
        // Vérifier si creator est un ID numérique ou une chaîne de caractères
        const creatorStr = String(recit.creator).trim();
        // Si c'est un ID numérique (chaîne qui peut être convertie en nombre, ex: "24323")
        if (creatorStr !== '' && !isNaN(Number(creatorStr)) && /^\d+$/.test(creatorStr)) {
          creatorHydrated = personnesMap.get(creatorStr);
        } else {
          // Si c'est une chaîne de caractères (comme "BBC World Service"), garder la chaîne
          creatorHydrated = creatorStr;
        }
      }


      // Hydrater isRelatedTo (objets avec id, title, thumbnail - déjà complets depuis le PHP)
      let isRelatedToHydrated = [];
      if (Array.isArray(recit.isRelatedTo)) {
        isRelatedToHydrated = recit.isRelatedTo.filter(Boolean);
      }

      // Hydrater tools
      let toolsHydrated = [];
      if (Array.isArray(recit.tools)) {
        toolsHydrated = recit.tools
          .map((id: any) => toolsMap.get(String(id)))
          .filter(Boolean);
      }

      // Hydrater scientificContent (bibliographies/mediagraphies)
      let scientificContentHydrated = [];
      if (Array.isArray(recit.referencesScient)) {
        scientificContentHydrated = recit.referencesScient
          .map((id: string) => {
            const biblio = bibliographiesMap.get(id);
            const media = mediagraphiesMap.get(id);
            const result = biblio || media;
            if (result) {
              console.log(`📖 referencesScient ID ${id} -> type: ${(result as any).type}, title: ${(result as any).title}`);
            }
            return result;
          })
          .filter(Boolean);
      }

      // Hydrater culturalContent (bibliographies/mediagraphies)
      let culturalContentHydrated = [];
      if (Array.isArray(recit.referencesCultu)) {
        culturalContentHydrated = recit.referencesCultu
          .map((id: string) => {
            const biblio = bibliographiesMap.get(id);
            const media = mediagraphiesMap.get(id);
            const result = biblio || media;
            if (result) {
              console.log(`🎨 referencesCultu ID ${id} -> type: ${(result as any).type}, title: ${(result as any).title}`);
            }
            return result;
          })
          .filter(Boolean);
      }



      return {
        ...recit,
        type: 'recitMediatique',
        descriptions: descriptionsHydrated.length > 0 ? descriptionsHydrated : [],
        keywords: keywordsHydrated.length > 0 ? keywordsHydrated : [],
        creator: creatorHydrated,
        isRelatedTo: isRelatedToHydrated.length > 0 ? isRelatedToHydrated : [],
        tools: toolsHydrated.length > 0 ? toolsHydrated : [],
        referencesScient: scientificContentHydrated.length > 0 ? scientificContentHydrated : [],
        referencesCultu: culturalContentHydrated.length > 0 ? culturalContentHydrated : [],

      };
    });

    // 5. CACHE + RETURN : Stocker et retourner
    sessionStorage.setItem('recitsMediatiques', JSON.stringify(recitsFull));
    return id ? recitsFull.find((r: any) => r.id === String(id)) : recitsFull;

  } catch (error) {
    console.error('Error fetching recits mediatiques:', error);
    throw new Error('Failed to fetch recits mediatiques');
  }
}

export async function getRecitsCitoyens(id?: number) {
  try {
    checkAndClearDailyCache();
    // 1. CACHE : Vérifier sessionStorage
    const storedDocs = sessionStorage.getItem('recitsCitoyens');
    if (storedDocs) {
      const docs = JSON.parse(storedDocs);
      return id ? docs.find((d: any) => d.id === String(id)) : docs;
    }

    // 2. FETCH : Récupérer données + dépendances en Promise.all
    const [rawRecitsCitoyens, keywords, personnes, actants, annotations, bibliographies, mediagraphies] = await Promise.all([
      getDataByUrl(
        'https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getRecitsCitoyens&json=1'
      ),
      getKeywords(),
      getPersonnes(),
      getActants(),
      getAnnotations(),
      getBibliographies(),
      getMediagraphies()
    ]);

    // 3. MAPS : Créer maps pour accès rapide
    const keywordsMap = new Map(keywords.map((k: any) => [String(k.id), k]));
    const personnesMap = new Map(personnes.map((p: any) => [String(p.id), p]));
    const actantsMap = new Map(actants.map((a: any) => [String(a.id), a]));

    const annotationsMap = new Map(annotations.map((a: any) => [String(a.id), a]));
    const bibliographiesMap = new Map(bibliographies.map((b: any) => [String(b.id), b]));
    const mediagraphiesMap = new Map(mediagraphies.map((m: any) => [String(m.id), m]));
    // 4. HYDRATATION : Remplacer IDs par objets complets
    const recitsCitoyensFull = rawRecitsCitoyens.map((recitCitoyen: any) => {
      // Hydrater descriptions (items)
      let descriptionsHydrated = [];
      if (Array.isArray(recitCitoyen.descriptions)) {
        descriptionsHydrated = recitCitoyen.descriptions
          .map((id: any) => annotationsMap.get(String(id)))
          .filter(Boolean);
      }

      // Hydrater keywords
      let keywordsHydrated = [];
      if (Array.isArray(recitCitoyen.keywords)) {
        keywordsHydrated = recitCitoyen.keywords
          .map((id: any) => keywordsMap.get(String(id)))
          .filter(Boolean);
      }

      // Hydrater creator - peut être un tableau d'objets (nouveau format), un tableau d'IDs, un ID unique, ou une chaîne avec virgules
      let creatorHydrated = null;
      if (recitCitoyen.creator) {
        // Si c'est un tableau
        if (Array.isArray(recitCitoyen.creator)) {
          // Vérifier si c'est déjà des objets complets (nouveau format PHP avec id, title, thumbnail)
          if (recitCitoyen.creator.length > 0 && typeof recitCitoyen.creator[0] === 'object' && recitCitoyen.creator[0] !== null && 'id' in recitCitoyen.creator[0]) {
            // Déjà des objets complets depuis PHP, essayer de les enrichir avec personnes/actants si disponibles
            const hydratedCreators = recitCitoyen.creator.map((creatorObj: any) => {
              const creatorId = String(creatorObj.id);
              // Essayer de trouver dans personnes ou actants pour enrichir l'objet
              const personneOrActant = personnesMap.get(creatorId) || actantsMap.get(creatorId);
              if (personneOrActant) {
                return personneOrActant;
              }
              // Sinon, retourner l'objet tel quel (avec id, title, thumbnail)
              return creatorObj;
            }).filter(Boolean);

            if (hydratedCreators.length > 0) {
              creatorHydrated = hydratedCreators.length === 1 ? hydratedCreators[0] : hydratedCreators;
            }
          } else {
            // C'est un tableau d'IDs, les hydrater
            const hydratedCreators = recitCitoyen.creator
              .map((id: any) => {
                const creatorId = String(id).trim();
                // Chercher d'abord dans personnes, puis dans actants
                return personnesMap.get(creatorId) || actantsMap.get(creatorId);
              })
              .filter(Boolean);

            if (hydratedCreators.length > 0) {
              creatorHydrated = hydratedCreators.length === 1 ? hydratedCreators[0] : hydratedCreators;
            }
          }
        } else {
          // Format legacy : ID unique ou chaîne avec virgules
          const creatorStr = String(recitCitoyen.creator).trim();
          if (creatorStr.includes(',')) {
            // Plusieurs IDs séparés par des virgules
            const creatorIds = creatorStr.split(',').map((id: string) => id.trim());
            const hydratedCreators = creatorIds
              .map((id: string) => personnesMap.get(id) || actantsMap.get(id))
              .filter(Boolean);
            creatorHydrated = hydratedCreators.length === 1 ? hydratedCreators[0] : hydratedCreators;
          } else if (creatorStr !== '' && !isNaN(Number(creatorStr)) && /^\d+$/.test(creatorStr)) {
            // Si c'est un ID numérique unique
            creatorHydrated = personnesMap.get(creatorStr) || actantsMap.get(creatorStr);
          } else {
            // Si c'est une chaîne de caractères (comme "BBC World Service"), garder la chaîne
            creatorHydrated = creatorStr;
          }
        }
      }

      // Hydrater associatedMedia (items)
      let associatedMediaHydrated = [];
      if (Array.isArray(recitCitoyen.associatedMedia)) {
        associatedMediaHydrated = recitCitoyen.associatedMedia
          .filter(Boolean);
      }

      // Hydrater isRelatedTo (items)
      let isRelatedToHydrated = [];
      if (Array.isArray(recitCitoyen.isRelatedTo)) {
        isRelatedToHydrated = recitCitoyen.isRelatedTo
          .filter(Boolean);
      }

      // Hydrater referencesScient (items)
      let referencesScientHydrated = [];
      if (Array.isArray(recitCitoyen.referencesScient)) {
        // Vérifier si c'est déjà des objets complets ou des IDs
        if (recitCitoyen.referencesScient.length > 0 && typeof recitCitoyen.referencesScient[0] === 'object' && recitCitoyen.referencesScient[0] !== null) {
          // Déjà des objets complets
          referencesScientHydrated = recitCitoyen.referencesScient;
        } else {
          // Ce sont des IDs, les hydrater
          referencesScientHydrated = recitCitoyen.referencesScient
            .map((id: string) => bibliographiesMap.get(id) || mediagraphiesMap.get(id))
            .filter(Boolean);
        }
      }

      // Hydrater referencesCultu (items)
      let referencesCultuHydrated = [];
      if (Array.isArray(recitCitoyen.referencesCultu)) {
        referencesCultuHydrated = recitCitoyen.referencesCultu
          .map((id: string) => bibliographiesMap.get(id) || mediagraphiesMap.get(id))
          .filter(Boolean);
      }



      return {
        ...recitCitoyen,
        type: 'recitCitoyen',
        descriptions: descriptionsHydrated.length > 0 ? descriptionsHydrated : [],
        keywords: keywordsHydrated.length > 0 ? keywordsHydrated : [],
        creator: creatorHydrated,
        associatedMedia: associatedMediaHydrated.length > 0 ? associatedMediaHydrated : [],
        isRelatedTo: isRelatedToHydrated.length > 0 ? isRelatedToHydrated : [],
        referencesScient: referencesScientHydrated.length > 0 ? referencesScientHydrated : [],
        referencesCultu: referencesCultuHydrated.length > 0 ? referencesCultuHydrated : [],
      };
    });

    // 5. CACHE + RETURN : Stocker et retourner
    sessionStorage.setItem('recitsCitoyens', JSON.stringify(recitsCitoyensFull));
    return id ? recitsCitoyensFull.find((d: any) => d.id === String(id)) : recitsCitoyensFull;

  } catch (error) {
    console.error('Error fetching recits citoyens:', error);
    throw new Error('Failed to fetch recits citoyens');
  }
}

export async function getMicroResumes(id?: number) {
  try {
    checkAndClearDailyCache();
    // 1. CACHE : Vérifier sessionStorage
    const storedMicroResumes = sessionStorage.getItem('microResumes');
    if (storedMicroResumes) {
      const microResumes = JSON.parse(storedMicroResumes);
      return id ? microResumes.find((m: any) => m.id === String(id)) : microResumes;
    }

    // 2. FETCH : Récupérer données + dépendances en Promise.all
    const [rawMicroResumes, outil] = await Promise.all([
      getDataByUrl(
        'https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getMicroResumes&json=1'
      ),
      getTools()
    ]);

    const outilMap = new Map(outil.map((o: any) => [String(o.id), o]));
    const microResumesFull = rawMicroResumes.map((microResume: any) => {
      // Hydrater outil
      let outilHydrated = null;
      if (microResume.outil) {
        outilHydrated = outilMap.get(String(microResume.outil)) || null;
      }
      return {
        ...microResume,
        type: 'microResume',
        outil: outilHydrated,
      };
    });

    sessionStorage.setItem('microResumes', JSON.stringify(microResumesFull));
    return id ? microResumesFull.find((m: any) => m.id === String(id)) : microResumesFull;
  } catch (error) {
    console.error('Error fetching micro resumes:', error);
    throw new Error('Failed to fetch micro resumes');
  }
}


export function generateThumbnailUrl(mediaId: string | number): string {
  // Assuming the API endpoint for media thumbnails follows this pattern
  return `https://tests.arcanes.ca/omk/s/edisem/media/${mediaId}`;
}