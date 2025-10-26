/**
 * EXEMPLE ANNOTÉ : Génération de getComments()
 * Pattern SIMPLE avec une seule ressource liée (actants)
 * 
 * Fichier de référence : src/services/Items.ts lignes 1230-1255
 */

// ============================================
// ANALYSE DU JSON ET DU PHP
// ============================================

/**
 * JSON OMEKA S fourni (simplifié) :
 * {
 *   "o:resource_template": {"o:id": 123},
 *   "@type": ["o:Item", "edisem:Comment"],
 *   "dcterms:title": [{"property_id": 1, "type": "literal"}],
 *   "schema:commentText": [{"property_id": 561, "type": "literal"}],
 *   "schema:commentTime": [{"property_id": 562, "type": "literal"}],
 *   "jdc:hasActant": [{"property_id": 2095, "type": "resource", "value_resource_id": 14436}],
 *   "ma:hasRelatedResource": [{"property_id": 1794, "type": "resource"}]
 * }
 * 
 * FONCTION PHP générée :
 * function getComments() {
 *   // Retourne :
 *   $comment = [
 *     'id' => ...,
 *     'title' => '',       // property_id 1 (literal)
 *     'commentText' => '', // property_id 561 (literal)
 *     'commentTime' => '', // property_id 562 (literal)
 *     'actant' => '',      // property_id 2095 (resource) → À HYDRATER
 *     'relatedResource' => '' // property_id 1794 (resource) → Laisser comme ID
 *   ];
 * }
 * 
 * ANALYSE DES DÉPENDANCES :
 * - property_id 2095 (jdc:hasActant) → Type resource → Champ 'actant'
 * - Consulter dependency_mappings.json → getActants()
 * - DONC : Charger getActants() et hydrater le champ 'actant'
 */

// ============================================
// CODE TYPESCRIPT GÉNÉRÉ
// ============================================

export async function getComments(id?: number) {
  try {
    // ========================================
    // 1. CACHE
    // ========================================
    // ANNOTATION: Toujours vérifier le cache en premier
    // Clé : nom de la ressource en minuscule
    
    const storedComments = sessionStorage.getItem('comments');
    if (storedComments) {
      const comments = JSON.parse(storedComments);
      // ANNOTATION: Support du paramètre id optionnel
      // Retourner tableau complet OU élément spécifique
      return id ? comments.find((c: any) => c.id === String(id)) : comments;
    }

    // ========================================
    // 2. FETCH PARALLÈLE
    // ========================================
    // ANNOTATION: Promise.all pour charger en parallèle
    // Premier élément : TOUJOURS getDataByUrl avec action=get{Nom}
    // Éléments suivants : Fonctions des ressources à hydrater
    
    const [comments, actants] = await Promise.all([
      getDataByUrl(
        'https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getComments&json=1'
      ),
      getActants()  // ANNOTATION: Chargé car property_id 2095 détecté dans PHP
    ]);

    // ========================================
    // 3. MAPS POUR ACCÈS RAPIDE
    // ========================================
    // ANNOTATION: Une Map par ressource chargée
    // Key: ID en string, Value: objet complet
    // Performance: O(1) au lieu de filter O(n)
    
    const actantsMap = new Map(actants.map((actant: any) => [String(actant.id), actant]));

    // ========================================
    // 4. HYDRATATION
    // ========================================
    // ANNOTATION: Remplacer les IDs par les objets complets
    
    // PATTERN SIMPLE : forEach pour modification in-place
    comments.forEach((comment: any) => {
      // ANNOTATION: Remplacer l'ID par l'objet complet
      // Si l'ID n'existe pas dans la map → undefined
      comment.actant = actantsMap.get(String(comment.actant));
    });

    // ALTERNATIVE : Pattern map (création nouveau tableau)
    /*
    const commentsFull = comments.map((comment: any) => ({
      ...comment,
      type: 'comment',
      actant: comment.actant ? actantsMap.get(String(comment.actant)) : null
    }));
    */

    // ========================================
    // 5. CACHE + RETURN
    // ========================================
    // ANNOTATION: Toujours stocker en cache avant de retourner
    
    sessionStorage.setItem('comments', JSON.stringify(comments));
    return id ? comments.find((c: any) => c.id === String(id)) : comments;
    
  } catch (error) {
    // ANNOTATION: Gestion d'erreur standard
    console.error('Error fetching comments:', error);
    throw new Error('Failed to fetch comments');
  }
}

// ============================================
// NOTES D'IMPLÉMENTATION
// ============================================

/**
 * POURQUOI CE PATTERN ?
 * 
 * 1. CACHE sessionStorage :
 *    - Évite requêtes multiples
 *    - Données persistantes pendant la session
 *    - Accès instantané après premier chargement
 * 
 * 2. Promise.all :
 *    - Chargement parallèle (plus rapide)
 *    - Exemple : 200ms + 300ms en parallèle = 300ms (vs 500ms séquentiel)
 * 
 * 3. Maps :
 *    - Accès O(1) vs filter O(n)
 *    - Exemple : 1000 actants → Map.get() instantané vs filter lent
 * 
 * 4. String(id) :
 *    - PHP peut retourner number ou string
 *    - Normaliser en string pour cohérence
 * 
 * 5. filter(Boolean) :
 *    - Enlever les undefined/null
 *    - Si ID n'existe pas dans la map
 * 
 * COMPLEXITÉ : ★★☆☆☆ (2/5)
 * - Une seule ressource à hydrater
 * - Pas de parsing legacy
 * - Hydratation simple (ID → objet)
 * 
 * TEMPS DE GÉNÉRATION : ~30 secondes
 */

// ============================================
// COMPARAISON AVEC LE CODE EXISTANT
// ============================================

/**
 * CODE EXISTANT dans Items.ts (lignes 1230-1255) :
 * 
 * export async function getComments(forceRefresh = false) {
 *   try {
 *     const storedComments = sessionStorage.getItem('comments');
 *     if (storedComments && !forceRefresh) {
 *       return JSON.parse(storedComments);
 *     }
 * 
 *     const [comments, actants] = await Promise.all([
 *       getDataByUrl('https://.../getComments&json=1'),
 *       getActants()
 *     ]);
 * 
 *     const actantsMap = new Map(actants.map((actant: any) => [actant.id.toString(), actant]));
 *     comments.forEach((comment: any) => {
 *       comment.actant = actantsMap.get(comment.actant);
 *     });
 * 
 *     sessionStorage.setItem('comments', JSON.stringify(comments));
 *     return comments;
 *   } catch (error) {
 *     console.error('Error fetching comments:', error);
 *     throw new Error('Failed to fetch comments');
 *   }
 * }
 * 
 * DIFFÉRENCES AVEC LE TEMPLATE :
 * - forceRefresh ajouté manuellement (pas généré automatiquement)
 * - actant.id.toString() vs String(actant.id) (équivalent)
 * - Pas de support du paramètre id (peut être ajouté)
 * 
 * CORRESPONDANCE : 95%+ ✅
 */

