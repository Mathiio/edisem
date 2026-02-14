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

/**
 * Récupère le mapping term → id pour un template spécifique
 * Utilise l'endpoint PHP custom pour une seule requête SQL rapide
 * Cache par template dans sessionStorage
 */
export const getTemplatePropertiesMap = async (templateId: number): Promise<Record<string, number>> => {
  const cacheKey = `template_properties_${templateId}`;
  const cached = sessionStorage.getItem(cacheKey);

  if (cached) {
    return JSON.parse(cached);
  }

  const response = await fetch(`${API_URL.replace('/api', '')}/s/edisem/page/ajax?helper=Query&action=getTemplateProperties&template_id=${templateId}&json=1`);
  const map = await response.json();

  if (map.error) {
    console.error('[getTemplatePropertiesMap] Error:', map.error);
    return {};
  }

  sessionStorage.setItem(cacheKey, JSON.stringify(map));
  console.log(`[getTemplatePropertiesMap] Template ${templateId}: ${Object.keys(map).length} properties`);
  return map;
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

    const citations = await getDataByUrl('https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getCitations&json=1');
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
        const foundAnnotation = allAnnotations.find((annotation: any) => String(annotation.id) === String(id));

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
      getDataByUrl('https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getAnnotations&json=1'),
      getPersonnes(),
      getActants(),
      getStudents(),
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
        ...students.filter((student: any) => student.id === contributorId),
      ];
    });

    // 💾 CACHE : Mettre en cache les annotations avec targets résolus
    sessionStorage.setItem('annotations', JSON.stringify(annotationsFull));

    // 🎯 FILTRAGE : Si un ID est spécifié, retourner l'annotation spécifique
    if (id) {
      const foundAnnotation = annotationsFull.find((annotation: any) => String(annotation.id) === String(id));
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

  return await Promise.all(
    list.map(async (annotation) => {
      if (annotation.target && Array.isArray(annotation.target)) {
        annotation.target = await Promise.all(annotation.target.map(resolveTarget));
      }

      if (annotation.related && Array.isArray(annotation.related)) {
        annotation.related = await Promise.all(annotation.related.map(resolveTarget));
      }
      return annotation;
    }),
  );
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

    const bibliographies = await getDataByUrl('https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getBibliographies&json=1');
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

    const mediagraphies = await getDataByUrl('https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getMediagraphies&json=1');
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

    const doctoralSchools = await getDataByUrl('https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getDoctoralSchools&json=1');
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

    const laboratories = await getDataByUrl('https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getLaboratories&json=1');
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

    const universities = await getDataByUrl('https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getUniversities&json=1');

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
          getLaboratories(),
        ]);

        const universityMap = new Map(universities.map((u: any) => [u.id, u]));
        const doctoralSchoolMap = new Map(doctoralSchools.map((s: any) => [s.id, s]));
        const laboratoryMap = new Map(laboratories.map((l: any) => [l.id, l]));

        return rawActants.map((actant: any) => {
          const interventions = confs.filter((c: any) => {
            if (typeof c.actant === 'string' && c.actant.includes(',')) {
              const actantIds = c.actant.split(',').map((id: string) => id.trim());
              return actantIds.includes(String(actant.id));
            } else if (Array.isArray(c.actant)) {
              return c.actant.map(String).includes(String(actant.id));
            } else {
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
    const normalizedIds = Array.isArray(actantIds) ? actantIds.map((id) => String(id)) : [String(actantIds)];

    // Filtrer les actants correspondants
    const foundActants = actants.filter((a: any) => normalizedIds.includes(String(a.id)));

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

export async function getActantsGlobalStats() {
  try {
    return await getDataByUrl('https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getActantsGlobalStats&json=1');
  } catch (error) {
    console.error('Error fetching global stats:', error);
    return null;
  }
}

export async function getRandomActants(limit = 12) {
  try {
    return await getDataByUrl(`https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getRandomActants&limit=${limit}&json=1`);
  } catch (error) {
    console.error('Error fetching random actants:', error);
    return [];
  }
}

export async function getActantDetails(id: string | number) {
  try {
    return await getDataByUrl(`https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getActantDetails&id=${id}&json=1`);
  } catch (error) {
    console.error(`Error fetching actant details for ${id}:`, error);
    return null;
  }
}

export async function getActantNetwork(id: string | number) {
  try {
    return await getDataByUrl(`https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getActantNetwork&id=${id}&json=1`);
  } catch (error) {
    console.error(`Error fetching actant network for ${id}:`, error);
    return { nodes: [], links: [] };
  }
}

export async function getActantsByCountry() {
  try {
    return await getDataByUrl('https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getActantsByCountry&json=1');
  } catch (error) {
    console.error('Error fetching actants by country:', error);
    return [];
  }
}

export async function getEditionDetails(id: string | number) {
  try {
    return await getDataByUrl(`https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getEditionDetails&id=${id}&json=1`);
  } catch (error) {
    console.error(`Error fetching edition details for ${id}:`, error);
    return null;
  }
}

export async function getEditionsByType(type: string) {
  try {
    return await getDataByUrl(`https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getEditionsByType&type=${type}&json=1`);
  } catch (error) {
    console.error(`Error fetching editions by type ${type}:`, error);
    return [];
  }
}

export async function getNavbarEditions() {
  try {
    // We don't necessarily cache this heavily in session storage as it's lightweight and critical for nav
    // But we could if we wanted to.
    const editions = await getDataByUrl('https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getNavbarEditions&json=1');
    return editions;
  } catch (error) {
    console.error('Error fetching navbar editions:', error);
    return [];
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
      allConfs,
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
      recherches,
      tools,
      feedbacks,
      personnes,
      comments,
    ] = await Promise.all([
      getAllConfs(),
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
      getTools(),
      getFeedbacks(),
      getPersonnes(),
      getComments(),
    ]);

    const allItems = [
      ...allConfs,
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
      ...feedbacks,
      ...tools,
      ...(Array.isArray(recherches) ? recherches : []),
      ...(Array.isArray(personnes) ? personnes : []),
      ...(Array.isArray(comments) ? comments : []),
    ];
    // Essayer de mettre en cache, mais ne pas bloquer si quota dépassé
    try {
      sessionStorage.setItem('allItems', JSON.stringify(allItems));
    } catch (e) {
      console.warn('Cache allItems ignoré (quota dépassé):', e);
    }

    return allItems;
  } catch (error) {
    console.error('Erreur lors de la récupération des éléments:', error);
    throw new Error('Échec de la récupération des éléments');
  }
}

export async function getAllConfs(id?: number) {
  try {
    checkAndClearDailyCache();

    // Fetch all conference types, keywords, and microResumes in parallel
    const [rawSeminarConfs, rawColloqueConfs, rawStudyDayConfs, keywords] = await Promise.all([
      getDataByUrl('https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getSeminarConfs&json=1'),
      getDataByUrl('https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getColloqueConfs&json=1'),
      getDataByUrl('https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getStudyDayConfs&json=1'),
      getKeywords(),
    ]);

    // Create keyword map for lookups
    const keywordsMap = new Map(keywords.map((k: any) => [k.id, k]));

    // Process each conference type
    const seminarConfs = rawSeminarConfs.map((conf: any) => ({
      ...conf,
      type: 'seminaire',
      motcles: conf.motcles.map((id: string) => keywordsMap.get(id)).filter(Boolean),
      url: conf.url ? `https://www.youtube.com/embed/${conf.url.substr(-11)}` : conf.url,
      fullUrl: conf.fullUrl ? `https://www.youtube.com/embed/${conf.fullUrl.substr(-11)}` : conf.fullUrl,
    }));

    const colloqueConfs = rawColloqueConfs.map((conf: any) => ({
      ...conf,
      type: 'colloque',
      motcles: conf.motcles.map((id: string) => keywordsMap.get(id)).filter(Boolean),
      url: conf.url ? `https://www.youtube.com/embed/${conf.url.substr(-11)}` : conf.url,
      fullUrl: conf.fullUrl ? `https://www.youtube.com/embed/${conf.fullUrl.substr(-11)}` : conf.fullUrl,
    }));

    const studyDayConfs = (rawStudyDayConfs || []).map((conf: any) => ({
      ...conf,
      type: 'journee_etudes',
      motcles: (conf.motcles || []).map((id: string) => keywordsMap.get(id)).filter(Boolean),
      url: conf.url ? `https://www.youtube.com/embed/${conf.url.substr(-11)}` : conf.url,
      fullUrl: conf.fullUrl ? `https://www.youtube.com/embed/${conf.fullUrl.substr(-11)}` : conf.fullUrl,
    }));


    const allConfs = [...seminarConfs, ...colloqueConfs, ...studyDayConfs];

    return allConfs;
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
    const rawTools = await getDataByUrl('https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getTools&json=1');

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

    const personnes = await getDataByUrl('https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getPersonnes&json=1');

    personnes.forEach((personne: any) => {
      personne.type = 'personne';
    });

    sessionStorage.setItem('personnes', JSON.stringify(personnes));
    return id ? personnes.find((p: any) => p.id === String(id)) : personnes;
  } catch (error) {
    console.error('Error fetching personnes:', error);
    throw new Error('Failed to fetch personnes');
  }
}

export async function getKeywords() {
  try {
    checkAndClearDailyCache();
    const storedKeywords = sessionStorage.getItem('keywords');

    if (storedKeywords) {
      return JSON.parse(storedKeywords);
    }

    const keywords = await getDataByUrl('https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getKeywords&json=1');

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

    const collections = await getDataByUrl('https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getCollections&json=1');

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
    const recherches = await getDataByUrl('https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getRecherches&json=1');

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

    const feedbacks = await getDataByUrl('https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getFeedbacks&json=1');

    feedbacks.forEach((feedback: any) => {
      feedback.url = '/feedback/' + feedback.id;
      feedback.type = 'feedback';
    });

    sessionStorage.setItem('feedbacks', JSON.stringify(feedbacks));
    return feedbacks;
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    throw new Error('Failed to fetch feedbacks');
  }
}

export async function getExperimentationsStudents(id?: number) {
  try {
    // Pas de cache pour les expérimentations étudiantes - toujours récupérer les données fraîches
    // Récupérer les expérimentations et les feedbacks en parallèle
    const [experimentationsStudents, feedbacks, bibliographies, mediagraphies, students, actants, tools, keywords] = await Promise.all([
      getDataByUrl('https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getExperimentationsStudents&json=1'),
      getFeedbacks(),
      getBibliographies(),
      getMediagraphies(),
      getStudents(),
      getActants(),
      getTools(),
      getKeywords(),
    ]);
    const keywordsMap = new Map(keywords.map((item: any) => [String(item.id), item]));
    const toolsMap = new Map(tools.map((item: any) => [String(item.id), item]));
    const bibliographiesMap = new Map(bibliographies.map((item: any) => [String(item.id), item]));
    const mediagraphiesMap = new Map(mediagraphies.map((item: any) => [String(item.id), item]));
    const studentsMap = new Map(students.map((item: any) => [String(item.id), item]));
    const actantsMap = new Map(actants.map((item: any) => [String(item.id), item]));

    // Créer un map des feedbacks pour un accès rapide par ID
    const feedbacksMap = new Map(feedbacks.map((feedback: any) => [feedback.id.toString(), feedback]));

    // Fusionner les feedbacks dans chaque expérimentation
    const experimentationsStudentsFull = experimentationsStudents.map((experimentationStudents: any) => {
      // Traiter les actants (maintenant tous les crédits sont déjà dans actants comme IDs de strings)
      const actantsMapped = experimentationStudents.actants
        ? experimentationStudents.actants
          .map((actantId: string) => {
            // Chercher d'abord dans actants, puis dans students pour les crédits techniques
            let mappedActant = actantsMap.get(actantId);
            if (!mappedActant) {
              mappedActant = studentsMap.get(actantId);
            }
            return mappedActant;
          })
          .filter(Boolean)
        : [];

      const experimentationWithFeedbacks = {
        ...experimentationStudents,
        type: 'experimentationStudents',
        actants: actantsMapped, // Tous les crédits mappés
        keywords: experimentationStudents.keywords ? experimentationStudents.keywords.map((keywordId: string) => keywordsMap.get(keywordId)).filter(Boolean) : [],
        tools: experimentationStudents.technicalCredits ? experimentationStudents.technicalCredits.map((toolId: string) => toolsMap.get(toolId)).filter(Boolean) : [],
      };

      // Si l'expérimentation a un tableau de feedbacks, remplacer les IDs par les objets complets
      if (experimentationStudents.feedbacks && Array.isArray(experimentationStudents.feedbacks)) {
        experimentationWithFeedbacks.feedbacks = experimentationStudents.feedbacks.map((feedbackId: string) => feedbacksMap.get(feedbackId)).filter(Boolean); // Enlever les feedbacks non trouvés
      }

      // Gérer la relation references (mediagraphies et bibliographies)
      if (experimentationStudents.references) {
        const getReference = (id: string) => mediagraphiesMap.get(id) || bibliographiesMap.get(id);

        if (typeof experimentationStudents.references === 'string' && experimentationStudents.references.includes(',')) {
          const referencesIds = experimentationStudents.references.split(',').map((id: string) => id.trim());
          experimentationWithFeedbacks.references = referencesIds.map((id: string) => getReference(id)).filter(Boolean);
        } else if (Array.isArray(experimentationStudents.references)) {
          experimentationWithFeedbacks.references = experimentationStudents.references.map((id: any) => getReference(String(id))).filter(Boolean);
        } else {
          experimentationWithFeedbacks.references = getReference(String(experimentationStudents.references));
        }
      }

      // Gérer la relation bibliographicCitations (mediagraphies et bibliographies)
      if (experimentationStudents.bibliographicCitations) {
        const getCitation = (id: string) => mediagraphiesMap.get(id) || bibliographiesMap.get(id);

        if (typeof experimentationStudents.bibliographicCitations === 'string' && experimentationStudents.bibliographicCitations.includes(',')) {
          const citationsIds = experimentationStudents.bibliographicCitations.split(',').map((id: string) => id.trim());
          experimentationWithFeedbacks.bibliographicCitations = citationsIds.map((id: string) => getCitation(id)).filter(Boolean);
        } else if (Array.isArray(experimentationStudents.bibliographicCitations)) {
          experimentationWithFeedbacks.bibliographicCitations = experimentationStudents.bibliographicCitations.map((id: any) => getCitation(String(id))).filter(Boolean);
        } else {
          experimentationWithFeedbacks.bibliographicCitations = getCitation(String(experimentationStudents.bibliographicCitations));
        }
      }

      return experimentationWithFeedbacks;
    });

    console.log('experimentationsStudentsFull', experimentationsStudentsFull);

    return id ? experimentationsStudentsFull.find((e: any) => String(e.id) === String(id)) : experimentationsStudentsFull;
  } catch (error) {
    console.error('Error fetching experimentationsStudents:', error);
    throw new Error('Failed to fetch experimentationsStudents');
  }
}
export async function getStudents(id?: number) {
  try {
    checkAndClearDailyCache();
    const storedStudents = sessionStorage.getItem('student');

    if (storedStudents) {
      const parsedStudents = JSON.parse(storedStudents);
      return id ? parsedStudents.find((e: any) => String(e.id) === String(id)) : parsedStudents;
    }

    const students = await getDataByUrl('https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getStudents&json=1');

    const updatedStudents = students.map((student: { firstname: string; lastname: string; id: number }) => {
      return {
        ...student,
        title: student.firstname + ' ' + student.lastname,
        type: 'student',
      };
    });

    sessionStorage.setItem('students', JSON.stringify(updatedStudents));
    return id ? updatedStudents.find((e: any) => String(e.id) === String(id)) : updatedStudents;
  } catch (error) {
    console.error('Error fetching students:', error);
    throw new Error('Failed to fetch students');
  }
}

export async function getComments(forceRefresh = false) {
  try {
    checkAndClearDailyCache();
    const storedComments = sessionStorage.getItem('comments');
    if (storedComments && !forceRefresh) {
      return JSON.parse(storedComments);
    }

    const [comments, actants] = await Promise.all([getDataByUrl('https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getComments&json=1'), getActants()]);

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

export async function getRecitsCitoyensCards() {
  try {
    const data = await getDataByUrl('https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getRecitsCitoyensCards&json=1');
    return data;
  } catch (error) {
    console.error('Error fetching recits citoyens cards:', error);
    return [];
  }
}


export async function getRecitsMediatiquesCards() {
  try {
    const data = await getDataByUrl('https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getRecitsMediatiquesCards&json=1');
    return data;
  } catch (error) {
    console.error('Error fetching recits mediatiques cards:', error);
    return [];
  }
}

export async function getRecitsScientifiquesCards() {
  try {
    const data = await getDataByUrl('https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getRecitsScientifiquesCards&json=1');
    return data;
  } catch (error) {
    console.error('Error fetching recits scientifiques cards:', error);
    return [];
  }
}

export async function getRecitsTechnoCards() {
  try {
    const data = await getDataByUrl('https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getRecitsTechnoCards&json=1');
    return data;
  } catch (error) {
    console.error('Error fetching recits techno cards:', error);
    return [];
  }
}

export async function getRecitsArtistiquesCards() {
  try {
    const data = await getDataByUrl('https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getRecitsArtistiquesCards&json=1');
    return data;
  } catch (error) {
    console.error('Error fetching recits artistiques cards:', error);
    return [];
  }
}

export async function getExperimentationCards() {
  try {
    return await getDataByUrl('https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getExperimentationCards&json=1');
  } catch (error) {
    console.error('Error fetching experimentation cards:', error);
    throw new Error('Failed to fetch experimentation cards');
  }
}

/**
 * Get cards filtered by Edition ID
 * @param editionId - Edition resource ID
 * @returns Array of standardized card data
 */
export async function getCardsByEdition(editionId: string | number) {
  try {
    return await getDataByUrl(`https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getCardsByEdition&editionId=${editionId}&json=1`);
  } catch (error) {
    console.error('Error fetching cards by edition:', error);
    return [];
  }
}

/**
 * Get cards filtered by Actant (Intervenant) ID
 * @param actantId - Actant resource ID
 * @param types - Optional filter by resource types (e.g., ['seminaire', 'experimentation'])
 * @returns Array of standardized card data
 */
export async function getCardsByActant(actantId: string | number, types: string[] = []) {
  try {
    const typesParam = types.length > 0 ? `&types=${types.join(',')}` : '';
    return await getDataByUrl(`https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getCardsByActant&actantId=${actantId}${typesParam}&json=1`);
  } catch (error) {
    console.error('Error fetching cards by actant:', error);
    return [];
  }
}

/**
 * Get cards filtered by Keyword (Concept) ID
 * @param keywordId - Keyword resource ID
 * @param limit - Maximum number of cards to return (default: 8)
 * @returns Array of standardized card data
 */

export async function getResourceCardsByKeyword(keywordId: string | number, limit: number = 12) {
  try {
    return await getDataByUrl(`https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getResourceCardsByKeyword&keywordId=${keywordId}&limit=${limit}&json=1`);
  } catch (error) {
    console.error('Error fetching resource cards by keyword:', error);
    return [];
  }
}

// ========================================
// Stats & Metrics Functions
// ========================================

/**
 * Get comprehensive stats for narrative practices page
 * @returns {Promise<{recits: number, experimentations: number, recitsByType: object}>}
 */
export async function getNarrativePracticesStats() {
  try {
    return await getDataByUrl('https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getNarrativePracticesStats&json=1');
  } catch (error) {
    console.error('Error fetching narrative practices stats:', error);
    return { recits: 0, experimentations: 0, recitsByType: {} };
  }
}

/**
 * Get top keywords for narrative practices
 * @param limit - Maximum number of keywords to return
 * @returns {Promise<Array<{label: string, value: number}>>}
 */
export async function getNarrativeTopKeywords(limit: number = 8) {
  try {
    return await getDataByUrl(`https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getNarrativeTopKeywords&limit=${limit}&json=1`);
  } catch (error) {
    console.error('Error fetching narrative top keywords:', error);
    return [];
  }
}

/**
 * Get detailed breakdown of recits by type with counts
 * @returns {Promise<Array<{type: string, count: number}>>}
 */
export async function getRecitTypeBreakdown() {
  try {
    return await getDataByUrl('https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getRecitTypeBreakdown&json=1');
  } catch (error) {
    console.error('Error fetching recit type breakdown:', error);
    return [];
  }
}

export * from './resourceDetails';
