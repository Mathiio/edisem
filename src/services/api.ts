import * as Items from '@/services/Items';
// import { Actant } from "@/types/ui";

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

export async function getConfByEdition(editionId: string) {
  try {
    const seminarConfs = await Items.getSeminarConfs();
    const colloqueConfs = await Items.getColloqueConfs();
    const studyDayConfs = await Items.getStudyDayConfs();

    const allConfs = [...seminarConfs, ...colloqueConfs, ...studyDayConfs];

    const editionConfs = allConfs.filter((conf: any) => conf.edition === editionId);

    const updatedConfs = await Promise.all(
      editionConfs.map(async (conf: any) => {
        if (!conf.actant) return conf;

        try {
          if (typeof conf.actant === 'string' && conf.actant.includes(',')) {
            const actantIds = conf.actant.split(',').map((id: string) => parseInt(id.trim()));
            const actantDetails = await Promise.all(actantIds.map((id: string) => Items.getActants(id)));
            return { ...conf, actant: actantDetails };
          }

          if (typeof conf.actant === 'string' || typeof conf.actant === 'number') {
            const actantDetails = await Items.getActants(conf.actant);
            return { ...conf, actant: [actantDetails] };
          }
          return conf;
        } catch (error) {
          console.error(`Error fetching actant for conf ${conf.id}:`, error);
          return { ...conf, actant: [] };
        }
      }),
    );

    return updatedConfs;
  } catch (error) {
    console.error('Error fetching confByEdition:', error);
    throw new Error('Failed to fetch confByEdition');
  }
}

export async function getConfByActant(actantId: string) {
  try {
    const confs = await Items.getAllConfs();

    const actantConfs = confs.filter((conf: { actant: string | string[] }) => {
      if (typeof conf.actant === 'string') {
        return conf.actant.includes(',')
          ? conf.actant
            .split(',')
            .map((id) => id.trim())
            .includes(actantId)
          : conf.actant === actantId;
      }
      return Array.isArray(conf.actant) && conf.actant.includes(actantId);
    });

    const updatedConfs = await Promise.all(
      actantConfs.map(async (conf: { actant: string | string[] }) => {
        if (conf.actant) {
          const actantIds = typeof conf.actant === 'string' ? (conf.actant.includes(',') ? conf.actant.split(',').map((id) => id.trim()) : [conf.actant]) : conf.actant;

          const actantDetails = await Promise.all(actantIds.map((id) => Items.getActants(id)));

          return { ...conf, actant: actantDetails.flat() };
        }
        return conf;
      }),
    );

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
    const recherchesFiltrees = recherches.filter((recherche: { creator: string }) => recherche.creator === actantId);

    // Enrichir avec les URLs des médias via l'API Omeka S
    const enrichedRecherches = await Promise.all(
      recherchesFiltrees.map(async (recherche: any) => {
        try {
          // Récupérer les médias de l'item
          const mediaResponse = await fetch(`https://tests.arcanes.ca/omk/api/media?item_id=${recherche.id}`);
          if (mediaResponse.ok) {
            const mediaData = await mediaResponse.json();
            if (mediaData && mediaData.length > 0) {
              // Prendre le premier média (l'image de la visualisation)
              const firstMedia = mediaData[0];
              const thumbnailUrl = firstMedia['o:thumbnail_urls']?.square || firstMedia['o:thumbnail_urls']?.medium || firstMedia['o:original_url'];
              return {
                ...recherche,
                imageUrl: thumbnailUrl || null,
              };
            }
          }
        } catch (e) {
          console.warn(`Erreur récupération média pour recherche ${recherche.id}:`, e);
        }
        return { ...recherche, imageUrl: null };
      }),
    );

    return enrichedRecherches;
  } catch (error) {
    console.error('Erreur lors de la récupération des recherches par actant :', error);
    throw new Error('Impossible de récupérer les recherches');
  }
}

export async function filterActants(searchQuery: string) {
  try {
    const actants = await Items.getActants();
    const normalizedQuery = searchQuery.toLowerCase();

    const filteredActants = actants.filter(
      (actant: { firstname: string; lastname: string; universities: any[] | null; doctoralSchools: any[] | null; laboratories: any[] | null }) => {
        return (
          (actant.firstname && actant.firstname.toLowerCase().includes(normalizedQuery)) ||
          (actant.lastname && actant.lastname.toLowerCase().includes(normalizedQuery)) ||
          actant.universities?.some((university: { name: string }) => university && university.name.toLowerCase().includes(normalizedQuery)) ||
          actant.doctoralSchools?.some((school: { name: string }) => school && school.name.toLowerCase().includes(normalizedQuery)) ||
          actant.laboratories?.some((laboratory: { name: string }) => laboratory && laboratory.name.toLowerCase().includes(normalizedQuery))
        );
      },
    );

    return filteredActants;
  } catch (error) {
    console.error('Error fetching actants:', error);
    throw new Error('Failed to fetch actants');
  }
}

export async function getConfCitations(confId: number) {
  try {
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
            actant: actantObj ? actantObj : citation.actant,
          };
        });

      return confCitations;
    }
  } catch (error) {
    console.error('Error fetching conferences:', error);
    throw new Error('Failed to fetch conferences');
  }
}

export async function getConfByCitation(citationId: string) {
  try {
    const confs = await Items.getAllConfs();
    const citations = await Items.getCitations();

    // Vérifie si la citation existe
    const citation = citations.find((citation: { id: string }) => citation.id === citationId);

    if (!citation) {
      return null; // Retourne null si la citation n'existe pas
    }

    // Recherche la conférence qui contient cet ID de citation
    const conf = confs.find((conf: { citations: string[] }) => conf.citations.includes(citationId));

    return conf;
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

    const filteredBibliographies = bibliographies.filter((bib: { id: number }) => conf.bibliographies.includes(String(bib.id)));

    return filteredBibliographies;
  } catch (error) {
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

    const filteredMediagraphies = mediagraphies.filter((media: { id: number }) => conf.mediagraphies.includes(String(media.id)));

    return filteredMediagraphies;
  } catch (error) {
    console.error('Error fetching mediagraphies:', error);
    throw new Error('Failed to fetch mediagraphies');
  }
}

export async function getOeuvresByPersonne(personneId: number) {
  const recitsArtistiques = await Items.getRecitsArtistiques();

  const filteredOeuvres = recitsArtistiques.filter((recit_artistique: any) => {
    console.log('Checking recit_artistique:', recit_artistique.id, 'personne:', recit_artistique.personne);

    if (!recit_artistique.personne) return false;

    // Si personne est un tableau d'objets (nouvelle structure)
    if (Array.isArray(recit_artistique.personne)) {
      const found = recit_artistique.personne.some((p: any) => p.id === String(personneId));
      console.log('Array check result:', found);
      return found;
    }

    // Si personne est une chaîne (ancienne structure)
    if (typeof recit_artistique.personne === 'string') {
      const found = recit_artistique.personne.includes(String(personneId));
      console.log('String check result:', found);
      return found;
    }

    return false;
  });

  return filteredOeuvres;
}

/**
 * Créer un commentaire Edisem
 *
 * @param commentaireData - Données du commentaire
 * @returns Promise avec le résultat de la création
 */
export async function createEdisemComment(commentaireData: {
  contenu: string; // Le texte du commentaire
  actantId?: number; // ID de l'actant associé (optionnel)
  relatedResourceId?: number; // ID de la ressource liée (optionnel)
  owner_id: number;
  class_id?: number;
}): Promise<any> {
  try {
    // Utiliser un owner_id temporaire valide (1 = administrateur)
    // TODO: Implémenter la synchronisation des utilisateurs entre les systèmes
    const finalOwnerId = 1;
    // Utiliser le contenu directement comme titre (comme dans votre exemple)
    const titre = commentaireData.contenu;

    // Créer les propriétés du commentaire
    const values: any[] = [
      {
        property_id: 1, // dcterms:title - ENVOYÉ EN PREMIER pour générer o:title
        value: titre,
        type: 'literal',
      },
      {
        property_id: 561, // schema:commentText
        value: commentaireData.contenu,
        type: 'literal',
      },
      {
        property_id: 562, // schema:commentTime
        value: new Date().toISOString(),
        type: 'literal',
      },
    ];

    console.log('Values to insert:', values);

    // Ajouter automatiquement l'actant (l'auteur du commentaire)
    // Pour l'instant, nous devons faire correspondre l'utilisateur local avec une ressource actant
    // TODO: Implémenter la synchronisation des utilisateurs entre les systèmes
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (currentUser && currentUser.id) {
      values.push({
        property_id: 2095, // jdc:hasActant
        value_resource_id: parseInt(currentUser.id),
        type: 'resource',
      });
    }

    // Ajouter la ressource liée si fournie (ma:hasRelatedResource)
    if (commentaireData.relatedResourceId) {
      values.push({
        property_id: 1794,
        value_resource_id: commentaireData.relatedResourceId,
        type: 'resource',
      });
    }

    // Préparer les paramètres de requête
    const params = new URLSearchParams({
      helper: 'Query',
      action: 'createResource',
      json: '1',
      template_id: '123',
      owner_id: String(finalOwnerId),
      class_id: String(commentaireData.class_id || ''),
      values: JSON.stringify(values),
    });

    console.log('Sending request params:', params.toString());
    console.log('Final URL:', `https://tests.arcanes.ca/omk/s/edisem/page/ajax?${params.toString()}`);

    const response = await fetch(`https://tests.arcanes.ca/omk/s/edisem/page/ajax?${params.toString()}`, {
      method: 'GET', // Utiliser GET car les paramètres sont dans l'URL
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const responseText = await response.text();
    console.log('Raw server response:', responseText);

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Response text:', responseText);
      throw new Error(`Invalid JSON response from server: ${responseText}`);
    }

    if (!result.success) {
      throw new Error(result.message || 'Erreur lors de la création du commentaire');
    }

    return {
      success: true,
      commentaireId: result.id,
      message: 'Commentaire créé avec succès',
    };
  } catch (error) {
    console.error('Erreur lors de la création du commentaire Edisem:', error);
    throw new Error('Impossible de créer le commentaire');
  }
}

/**
 * Récupérer tous les commentaires Edisem
 *
 * @returns Promise avec la liste des commentaires
 */
export async function getEdisemComments(): Promise<any[]> {
  try {
    const response = await fetch('https://tests.arcanes.ca/omk/s/edisem/page/ajax', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        helper: 'Query',
        action: 'getEdisemComments',
        json: '1',
      }).toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const result = await response.json();

    if (!result || !Array.isArray(result)) {
      throw new Error('Format de réponse invalide');
    }

    return result;
  } catch (error) {
    console.error('Erreur lors de la récupération des commentaires:', error);
    throw error;
  }
}

/**
 * Récupérer un commentaire Edisem par son ID
 *
 * @param commentaireId - ID du commentaire
 * @returns Promise avec les données du commentaire
 */
export async function getEdisemCommentById(commentaireId: number): Promise<any> {
  try {
    const comments = await getEdisemComments();
    const comment = comments.find((c: any) => c.id === commentaireId);

    if (!comment) {
      throw new Error(`Commentaire avec l'ID ${commentaireId} non trouvé`);
    }

    return comment;
  } catch (error) {
    console.error('Erreur lors de la récupération du commentaire:', error);
    throw error;
  }
}

/**
 * Supprimer un commentaire Edisem (soft delete)
 *
 * @param commentaireId - ID du commentaire à supprimer
 * @returns Promise avec le résultat de la suppression
 */
export async function deleteEdisemComment(commentaireId: number): Promise<any> {
  try {
    const response = await fetch('https://tests.arcanes.ca/omk/s/edisem/page/ajax', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        helper: 'Query',
        action: 'deleteResource',
        json: '1',
        id: commentaireId.toString(),
      }).toString(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Erreur lors de la suppression du commentaire');
    }

    return {
      success: true,
      message: 'Commentaire supprimé avec succès',
    };
  } catch (error) {
    console.error('Erreur lors de la suppression du commentaire Edisem:', error);
    throw new Error('Impossible de supprimer le commentaire');
  }
}
