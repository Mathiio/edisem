<?php
/**
 * TEMPLATE RÉUTILISABLE pour générer une nouvelle fonction getXxx()
 * 
 * Ce template montre la structure standard à suivre.
 * Remplacer les placeholders {XXX} par les valeurs appropriées.
 */

/**
 * Récupérer les ressources de type {TYPE_RESSOURCE}
 * 
 * @return array
 */
function get{NomFonction}()
{
    // ========================================
    // PARTIE 1 : REQUÊTE PRINCIPALE
    // ========================================
    
    $resourceQuery = "
        SELECT r.id
        FROM `resource` r
        WHERE r.resource_template_id = {TEMPLATE_ID}
        ORDER BY r.created DESC
    ";

    $resources = $this->conn->executeQuery($resourceQuery)->fetchAllAssociative();

    if (empty($resources)) {
        return [];
    }

    $resourceIds = array_column($resources, 'id');

    // ========================================
    // PARTIE 2 : REQUÊTE DES VALEURS
    // ========================================
    
    $valueQuery = "
        SELECT v.resource_id, v.value, v.property_id, v.value_resource_id, v.uri, v.type,
               m.id as media_id, m.storage_id, m.extension
        FROM `value` v
        LEFT JOIN `media` m ON v.value_resource_id = m.id
        WHERE v.resource_id IN (" . implode(',', $resourceIds) . ")
        AND v.property_id IN ({LISTE_PROPERTY_IDS})
    ";

    $values = $this->conn->executeQuery($valueQuery)->fetchAllAssociative();

    // ========================================
    // PARTIE 3 : MAPS DES RESSOURCES LIÉES
    // ========================================
    
    // --- 3.1 Thumbnail principal (si nécessaire) ---
    /*
    $logoQuery = "
        SELECT item_id, CONCAT(storage_id, '.', extension) AS logo
        FROM `media`
        WHERE item_id IN (" . implode(',', $resourceIds) . ")
    ";
    $logos = $this->conn->executeQuery($logoQuery)->fetchAllAssociative();
    
    $logoMap = [];
    foreach ($logos as $logo) {
        $logoMap[$logo['item_id']] = $logo['logo'];
    }
    */

    // --- 3.2 Maps pour ressources liées (exemple générique) ---
    /*
    // Récupérer les IDs des ressources liées
    ${nomRessource}Ids = [];
    foreach ($values as $value) {
        if ($value['property_id'] == {PROPERTY_ID} && $value['value_resource_id']) {
            ${nomRessource}Ids[] = $value['value_resource_id'];
        }
    }

    // Map pour les titres
    ${nomRessource}Map = [];
    if (!empty(${nomRessource}Ids)) {
        ${nomRessource}Query = "
            SELECT v.resource_id, v.value
            FROM `value` v
            WHERE v.resource_id IN (" . implode(',', array_unique(${nomRessource}Ids)) . ")
            AND v.property_id = 1
        ";
        ${nomRessource}Data = $this->conn->executeQuery(${nomRessource}Query)->fetchAllAssociative();

        foreach (${nomRessource}Data as $data) {
            ${nomRessource}Map[$data['resource_id']] = $data['value'];
        }
    }

    // Map pour les thumbnails
    ${nomRessource}ThumbnailMap = [];
    if (!empty(${nomRessource}Ids)) {
        ${nomRessource}ThumbnailQuery = "
            SELECT item_id, CONCAT(storage_id, '.', extension) AS thumbnail
            FROM `media`
            WHERE item_id IN (" . implode(',', array_unique(${nomRessource}Ids)) . ")
        ";
        ${nomRessource}ThumbnailData = $this->conn->executeQuery(${nomRessource}ThumbnailQuery)->fetchAllAssociative();

        foreach (${nomRessource}ThumbnailData as $thumbnail) {
            ${nomRessource}ThumbnailMap[$thumbnail['item_id']] = $this->generateThumbnailUrl($thumbnail['thumbnail']);
        }
    }

    // Map pour les URLs/pages
    ${nomRessource}PageMap = [];
    if (!empty(${nomRessource}Ids)) {
        ${nomRessource}PageQuery = "
            SELECT v.resource_id, v.uri
            FROM `value` v
            WHERE v.resource_id IN (" . implode(',', array_unique(${nomRessource}Ids)) . ")
            AND v.property_id = {URL_PROPERTY_ID}
        ";
        ${nomRessource}PageData = $this->conn->executeQuery(${nomRessource}PageQuery)->fetchAllAssociative();

        foreach (${nomRessource}PageData as $data) {
            ${nomRessource}PageMap[$data['resource_id']] = $data['uri'];
        }
    }
    */

    // --- 3.3 Map pour médias associés (property_id 438) ---
    /*
    $associatedMediaIds = [];
    foreach ($values as $value) {
        if ($value['property_id'] == 438 && $value['value_resource_id']) {
            $associatedMediaIds[] = $value['value_resource_id'];
        }
    }

    $associatedMediaMap = [];
    if (!empty($associatedMediaIds)) {
        $associatedMediaQuery = "
            (SELECT item_id as resource_id, CONCAT(storage_id, '.', extension) AS media_file
            FROM `media`
            WHERE item_id IN (" . implode(',', array_unique($associatedMediaIds)) . "))
            UNION
            (SELECT id as resource_id, CONCAT(storage_id, '.', extension) AS media_file
            FROM `media`
            WHERE id IN (" . implode(',', array_unique($associatedMediaIds)) . "))
        ";
        $associatedMediaData = $this->conn->executeQuery($associatedMediaQuery)->fetchAllAssociative();

        foreach ($associatedMediaData as $media) {
            $associatedMediaMap[$media['resource_id']] = $media['media_file'];
        }
    }
    */

    // ========================================
    // PARTIE 4 : CONSTRUCTION DU RÉSULTAT
    // ========================================
    
    $result = [];
    foreach ($resources as $resource) {
        ${nomVariable} = [
            'id' => $resource['id'],
            // Ajouter tous les champs selon le JSON
            '{champ1}' => '',      // Pour literal
            '{champ2}' => [],      // Pour resource (multiple)
            '{champ3}' => '',      // Pour uri
            // 'thumbnail' => isset($logoMap[$resource['id']]) ? $this->generateThumbnailUrl($logoMap[$resource['id']]) : ''
        ];

        foreach ($values as $value) {
            if ($value['resource_id'] == $resource['id']) {
                switch ($value['property_id']) {
                    
                    // --- TYPE LITERAL ---
                    case {PROPERTY_ID}: // {LABEL}
                        ${nomVariable}['{nomChamp}'] = $value['value'];
                        break;

                    // --- TYPE URI ---
                    case {PROPERTY_ID}: // {LABEL}
                        ${nomVariable}['{nomChamp}'] = $value['uri'];
                        break;

                    // --- TYPE RESOURCE (ID simple) ---
                    case {PROPERTY_ID}: // {LABEL}
                        if ($value['value_resource_id']) {
                            ${nomVariable}['{nomChamp}'][] = $value['value_resource_id'];
                        }
                        break;

                    // --- TYPE RESOURCE (avec map - objet détaillé) ---
                    case {PROPERTY_ID}: // {LABEL}
                        if ($value['value_resource_id']) {
                            ${nomRessource}Id = $value['value_resource_id'];
                            ${nomVariable}['{nomChamp}'][] = [
                                'id' => ${nomRessource}Id,
                                'name' => ${nomRessource}Map[${nomRessource}Id] ?? null,
                                'thumbnail' => ${nomRessource}ThumbnailMap[${nomRessource}Id] ?? null,
                                'page' => ${nomRessource}PageMap[${nomRessource}Id] ?? null
                            ];
                        }
                        break;

                    // --- CAS SPÉCIAL : associatedMedia (438) ---
                    case 438: // schema:associatedMedia
                        if ($value['value_resource_id']) {
                            $mediaId = $value['value_resource_id'];
                            if (isset($associatedMediaMap[$mediaId])) {
                                ${nomVariable}['associatedMedia'][] = 
                                    $this->generateThumbnailUrl($associatedMediaMap[$mediaId]);
                            }
                        }
                        break;

                    // --- CAS SPÉCIAL : image principale (1701) ---
                    case 1701: // schema:image
                        if ($value['storage_id'] && $value['extension']) {
                            ${nomVariable}['picture'] = $this->generateThumbnailUrl(
                                $value['storage_id'], 
                                $value['extension']
                            );
                        }
                        break;
                }
            }
        }

        $result[] = ${nomVariable};
    }

    // ========================================
    // PARTIE 5 : RETURN
    // ========================================
    
    return $result;
}

/**
 * INSTRUCTIONS D'UTILISATION :
 * 
 * 1. Remplacer les placeholders :
 *    - {NomFonction} : Nom de la fonction (ex: Actants, Oeuvres)
 *    - {TEMPLATE_ID} : ID du template Omeka S
 *    - {LISTE_PROPERTY_IDS} : Liste des property_id séparés par des virgules
 *    - {nomVariable} : Nom de la variable dans la boucle (ex: $actant, $oeuvre)
 *    - {nomRessource} : Nom pour les maps (ex: agent, contributor)
 *    - {PROPERTY_ID} : ID de la propriété
 *    - {LABEL} : Label Omeka de la propriété
 *    - {nomChamp} : Nom du champ dans le tableau résultat
 * 
 * 2. Décommenter les sections nécessaires (maps, thumbnail principal, etc.)
 * 
 * 3. Ajouter/supprimer des cases dans le switch selon les property_id trouvés
 * 
 * 4. Ajouter le case dans __invoke() :
 *    case 'get{NomFonction}':
 *        $result = $this->get{NomFonction}();
 *        break;
 */

