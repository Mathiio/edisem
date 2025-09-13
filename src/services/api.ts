import * as Items from "@/services/Items";


export async function getItemByID(id: string): Promise<any | null> {
  try {
    const allItems = await Items.getAllItems();
    const foundItem = allItems.find((item: any) => item.id === id);
    return foundItem || null;
  } catch (error) {
    console.error('Erreur lors de la recherche de l’élément par ID:', error);
    throw new Error('Échec de la recherche de l’élément par ID');
  }
}




export async function getConfByEdition(editionId: number) {
  try {
    const seminarConfs = await Items.getSeminarConfs();
    const colloqueConfs = await Items.getColloqueConfs();
    const studyDayConfs = await Items.getStudyDayConfs();

    const allConfs = [...seminarConfs, ...colloqueConfs, ...studyDayConfs];

    const editionConfs = allConfs.filter((conf: { event: string; edition: number }) => 
      Number(conf.edition) === editionId
    );

    const updatedConfs = await Promise.all(editionConfs.map(async (conf: { actant: number; }) => {
      if (conf.actant) {
        const actantDetails = await Items.getActants(conf.actant);
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
    const confs = await Items.getAllConfs();

    const actantConfs = confs.filter((conf: { event: string; actant: number }) => 
      Number(conf.actant) === actantId
    );

    const updatedConfs = await Promise.all(actantConfs.map(async (conf: { actant: number; }) => {
      if (conf.actant) {
        const actantDetails = await Items.getActants(conf.actant);
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


export async function getResearchByActant(actantId: string) {
  try {
    const recherches = await Items.getRecherches();
    

    // Filtrer les recherches en fonction du champ creator
    const recherchesFiltrees = recherches.filter((recherche: { creator: string }) => 
      recherche.creator === actantId
    );

    return recherchesFiltrees;
  } catch (error) {
    console.error('Erreur lors de la récupération des recherches par actant :', error);
    throw new Error('Impossible de récupérer les recherches');
  }
}




export async function filterActants(searchQuery: string) {
  try {
    const actants = await Items.getActants();
    const normalizedQuery = searchQuery.toLowerCase();

    const filteredActants = actants.filter((actant: { firstname: string; lastname: string; universities: any[] | null; doctoralSchools: any[] | null; laboratories: any[] | null; }) => {
      return (
        (actant.firstname && actant.firstname.toLowerCase().includes(normalizedQuery)) ||
        (actant.lastname && actant.lastname.toLowerCase().includes(normalizedQuery)) ||
        (actant.universities?.some((university: { name: string; }) => university && university.name.toLowerCase().includes(normalizedQuery))) ||
        (actant.doctoralSchools?.some((school: { name: string; }) => school && school.name.toLowerCase().includes(normalizedQuery))) ||
        (actant.laboratories?.some((laboratory: { name: string; }) => laboratory && laboratory.name.toLowerCase().includes(normalizedQuery)))
      );
    });

    return filteredActants;

  } catch (error) {
    console.error('Error fetching actants:', error);
    throw new Error('Failed to fetch actants');
  }
}




export async function filterConfs(searchQuery: string) {
  try {
    const confs = await Items.getAllConfs();

    const updatedConfs = await Promise.all(
      confs.map(async (conf: { actant: number }) => {
        if (conf.actant) {
          try {
            const actantDetails = await Items.getActants(conf.actant);
            return { 
              ...conf, 
              actant: actantDetails || { firstname: "", lastname: "" } // Fallback sécurisé
            };
          } catch (error) {
            console.error(`Error fetching actant ${conf.actant}:`, error);
            return { 
              ...conf, 
              actant: { firstname: "", lastname: "" } // Objet vide sécurisé
            };
          }
        }
        return conf;
      })
    );

    const filteredConfs = updatedConfs.filter((conf: any) => {
      const lowerSearchQuery = searchQuery.toLowerCase();

      // Vérifications avec gestion des valeurs manquantes
      const eventMatch = conf.event?.toLowerCase().includes(lowerSearchQuery);
      const titleMatch = conf.title?.toLowerCase().includes(lowerSearchQuery);
      const actantMatch = conf.actant?.firstname?.toLowerCase().includes(lowerSearchQuery) 
                       || conf.actant?.lastname?.toLowerCase().includes(lowerSearchQuery);
      const keywordsMatch = conf.motcles?.some((keyword: any) =>
        [keyword.title, ...keyword.english_terms, ...keyword.orthographic_variants]
          .some(term => term?.toLowerCase().includes(lowerSearchQuery))
      );

      return eventMatch || titleMatch || actantMatch || keywordsMatch;
    });

    return filteredConfs;
  } catch (error) {
    console.error('Error fetching conferences:', error);
    throw new Error('Failed to fetch conferences');
  }
}






export async function getConfCitations(confId: number){
  try{
    const confs = await Items.getAllConfs();
    const citations = await Items.getCitations();
    const actants = await Items.getActants();

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


export async function getConfByCitation(citationId: number) {
  try {
    const confs = await Items.getAllConfs();
    const citations = await Items.getCitations();
    
    // Vérifie si la citation existe
    const citation = citations.find((citation: { id: number }) => citation.id === citationId);
    
    if (!citation) {
      return null; // Retourne null si la citation n'existe pas
    }
    
    // Recherche la conférence qui contient cet ID de citation
    const conf = confs.find((conf: { citations: number[] }) => 
      conf.citations.includes(citationId)
    );
    
    return conf ? Number(conf.id) : null; // Retourne l'ID de la conférence en tant que nombre
  } catch (error) {
    console.error('Error fetching conference by citation:', error);
    throw new Error('Failed to fetch conference by citation');
  }
}






export async function getConfBibliographies(confId: number) {
  try {
    const confs = await Items.getAllConfs();
    const bibliographies = await Items.getBibliographies();

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




export async function getConfMediagraphies(confId: number) {
  try {
    const confs = await Items.getAllConfs();
    const mediagraphies = await Items.getMediagraphies();

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


export async function getOeuvresByPersonne(personneId: number) {
  const oeuvres = await Items.getOeuvres();
  return oeuvres.filter((oeuvre: any) => {
    if (!oeuvre.personne) return false;
    
    // Si personne est un tableau d'objets (nouvelle structure)
    if (Array.isArray(oeuvre.personne)) {
      return oeuvre.personne.some((p: any) => p.id === String(personneId));
    }
    
    // Si personne est une chaîne (ancienne structure)
    if (typeof oeuvre.personne === 'string') {
      return oeuvre.personne.includes(String(personneId));
    }
    
    return false;
  });
}
