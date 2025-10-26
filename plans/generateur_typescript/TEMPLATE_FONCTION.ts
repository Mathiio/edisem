/**
 * TEMPLATE RÉUTILISABLE pour générer une nouvelle fonction TypeScript dans Items.ts
 * 
 * Ce template montre la structure standard avec hydratation des ressources liées.
 * Remplacer les placeholders {XXX} par les valeurs appropriées.
 */

/**
 * Récupérer les ressources de type {TYPE_RESSOURCE} avec hydratation
 * 
 * @param id - ID optionnel pour récupérer une ressource spécifique
 * @returns Array de ressources (ou ressource unique si id spécifié)
 */
export async function get{Nom}(id?: number) {
  try {
    // ========================================
    // PARTIE 1 : CACHE
    // ========================================
    
    const stored{Nom} = sessionStorage.getItem('{nom}');
    if (stored{Nom}) {
      const {nom} = JSON.parse(stored{Nom});
      return id ? {nom}.find((x: any) => x.id === String(id)) : {nom};
    }

    // ========================================
    // PARTIE 2 : FETCH AVEC PROMISE.ALL
    // ========================================
    
    const [raw{Nom}, {ressource1}, {ressource2}] = await Promise.all([
      getDataByUrl('https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=get{Nom}&json=1'),
      get{Ressource1}(),  // Ajouter selon les dépendances identifiées
      get{Ressource2}()   // Ajouter selon les dépendances identifiées
    ]);

    // ========================================
    // PARTIE 3 : CRÉATION DES MAPS
    // ========================================
    
    const {ressource1}Map = new Map({ressource1}.map((r: any) => [String(r.id), r]));
    const {ressource2}Map = new Map({ressource2}.map((r: any) => [String(r.id), r]));

    // ========================================
    // PARTIE 4 : HYDRATATION
    // ========================================
    
    // --- Option A : Hydratation simple (pas de parsing legacy) ---
    const {nom}Full = raw{Nom}.map((item: any) => ({
      ...item,
      type: '{nom}',
      
      // Pattern : Array d'IDs → Array d'objets
      {champArray}: Array.isArray(item.{champPhpArray})
        ? item.{champPhpArray}.map((id: any) => {ressource1}Map.get(String(id))).filter(Boolean)
        : [],
      
      // Pattern : ID unique → Objet unique
      {champSingle}: item.{champPhpSingle} 
        ? {ressource2}Map.get(String(item.{champPhpSingle}))
        : null
    }));

    // --- Option B : Hydratation avec parsing legacy (virgules) ---
    /*
    const {nom}Full = raw{Nom}.map((item: any) => {
      // Parser les IDs multiples (gère string avec virgules)
      let {champ}Ids: string[] = [];
      if (item.{champPhp}) {
        if (typeof item.{champPhp} === 'string' && item.{champPhp}.includes(',')) {
          {champ}Ids = item.{champPhp}.split(',').map((id: string) => id.trim());
        } else if (Array.isArray(item.{champPhp})) {
          {champ}Ids = item.{champPhp}.map((id: any) => String(id));
        } else {
          {champ}Ids = [String(item.{champPhp})];
        }
      }

      // Hydrater avec la map
      const {champ}Linked = {champ}Ids
        .map((id: string) => {ressource}Map.get(id))
        .filter(Boolean);

      return {
        ...item,
        type: '{nom}',
        {champ}: {champ}Linked.length > 0 ? {champ}Linked : null
      };
    });
    */

    // --- Option C : Hydratation avec plusieurs sources ---
    /*
    const {nom}Full = raw{Nom}.map((item: any) => {
      const result = {
        ...item,
        type: '{nom}'
      };

      // Chercher dans plusieurs sources (ex: actants + students)
      if (item.{champPhp}) {
        result.{champ} = [
          ...{ressource1}.filter((r: any) => String(r.id) === String(item.{champPhp})),
          ...{ressource2}.filter((r: any) => String(r.id) === String(item.{champPhp}))
        ];
      }

      return result;
    });
    */

    // ========================================
    // PARTIE 5 : CACHE + RETURN
    // ========================================
    
    sessionStorage.setItem('{nom}', JSON.stringify({nom}Full));
    return id ? {nom}Full.find((x: any) => x.id === String(id)) : {nom}Full;
    
  } catch (error) {
    console.error('Error fetching {nom}:', error);
    throw new Error('Failed to fetch {nom}');
  }
}

/**
 * ============================================
 * INSTRUCTIONS D'UTILISATION
 * ============================================
 * 
 * 1. REMPLACER LES PLACEHOLDERS :
 *    - {Nom} : Nom avec majuscule (ex: Oeuvres, Comments)
 *    - {nom} : Nom en camelCase minuscule (ex: oeuvres, comments)
 *    - {ressource1}, {ressource2} : Noms des ressources à charger
 *    - {Ressource1}, {Ressource2} : Noms avec majuscule pour fonctions
 *    - {champPhp} : Nom du champ dans le retour PHP
 *    - {champ} : Nom du champ hydraté en TypeScript
 * 
 * 2. CHOISIR LE PATTERN D'HYDRATATION :
 *    - Option A : Si pas de données legacy (recommandé)
 *    - Option B : Si compatibilité avec données anciennes (virgules)
 *    - Option C : Si plusieurs sources possibles
 * 
 * 3. AJUSTER LE PROMISE.ALL :
 *    - Ajouter/supprimer les get{Ressource}() selon dépendances
 *    - Consulter dependency_mappings.json pour savoir quoi charger
 * 
 * 4. CRÉER LES MAPS :
 *    - Une map par ressource chargée
 *    - Toujours utiliser String(r.id) pour cohérence
 * 
 * 5. HYDRATER LES CHAMPS :
 *    - Pour chaque champ de type resource dans le PHP
 *    - Utiliser le pattern approprié (array/single/multiple sources)
 *    - Toujours .filter(Boolean) pour enlever les nulls
 * 
 * 6. AJOUTER LE TYPE :
 *    - type: '{nom}' pour faciliter le filtrage côté frontend
 * 
 * 7. GESTION DU PARAMÈTRE ID :
 *    - Toujours supporter id?: number
 *    - Return tableau complet si pas d'id
 *    - Return élément trouvé si id spécifié
 * 
 * ============================================
 * EXEMPLES DE RÉFÉRENCE
 * ============================================
 * 
 * Fonction simple (pas d'hydratation) :
 * - getUniversities() (lignes 370-395)
 * - getCitations() (lignes 149-172)
 * 
 * Fonction avec hydratation simple :
 * - getComments() (lignes 1230-1255) - 1 ressource (actants)
 * 
 * Fonction avec hydratation complexe :
 * - getOeuvres() (lignes 791-893) - 4 ressources
 * - getElementNarratifs() (lignes 1083-1148) - 2 ressources
 * - getExperimentations() (lignes 980-1022) - 1 ressource
 * 
 * Fonction avec comptage :
 * - getActants() (lignes 397-471) - Compte interventions
 */

// ============================================
// EXEMPLES DE CODE SPÉCIFIQUES
// ============================================

/**
 * Exemple 1 : Hydratation d'array avec parsing legacy
 */
/*
const personneIds: string[] = [];
if (oeuvre.personne) {
  if (typeof oeuvre.personne === 'string') {
    personneIds = oeuvre.personne.split(',').map((id: string) => id.trim());
  } else if (Array.isArray(oeuvre.personne)) {
    personneIds = oeuvre.personne.map((id: any) => String(id));
  } else {
    personneIds = [String(oeuvre.personne)];
  }
}
const personnesLinked = personneIds.map((id: string) => personnesMap.get(id)).filter(Boolean);
*/

/**
 * Exemple 2 : Hydratation simple sans parsing
 */
/*
{champ}: item.{champPhp} 
  ? ressourceMap.get(String(item.{champPhp}))
  : null
*/

/**
 * Exemple 3 : Transformation de données
 */
/*
title: item.firstname ? `${item.firstname} ${item.lastname}` : item.title,
url: item.url ? `https://www.youtube.com/embed/${item.url.substr(-11)}` : item.url
*/

/**
 * Exemple 4 : Comptage de relations
 */
/*
interventions: confs.filter((c: any) => {
  if (Array.isArray(c.actant)) {
    return c.actant.map(String).includes(String(actant.id));
  }
  return String(c.actant) === String(actant.id);
}).length
*/

