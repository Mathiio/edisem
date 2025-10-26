# Guide de génération automatique de fonctions PHP pour API Omeka S

## Vue d'ensemble

Ce guide permet à l'IA de générer automatiquement des fonctions PHP `getXxx()` pour `QuerySqlViewHelper.php` à partir d'un JSON Omeka S, avec un minimum de modifications manuelles.

---

## Structure standard d'une fonction

Toute fonction suit ce pattern en 5 parties :

```php
function getXxx()
{
    // 1. REQUÊTE PRINCIPALE : Récupération des IDs
    // 2. REQUÊTE DES VALEURS : Récupération des propriétés
    // 3. MAPS DES RESSOURCES LIÉES : Thumbnails, titres, URIs
    // 4. CONSTRUCTION DU RÉSULTAT : Boucle avec switch/case
    // 5. RETURN DU RÉSULTAT
}
```

---

## ÉTAPE 1 : Analyse du JSON fourni

### Extractions obligatoires

#### 1.1 Métadonnées de base
```json
{
  "o:resource_template": {
    "o:id": 103  // → $template_id
  },
  "@type": [
    "o:Item",
    "fiafcore:Film"  // → Nom de la fonction
  ]
}
```

**Règle de nommage de la fonction :**
- Prendre `@type[1]` (le deuxième élément)
- Extraire la partie après `:` → `Film`
- Pluraliser et mettre en camelCase → `getFilms`
- Si déjà au pluriel ou nom commun → conserver tel quel (ex: `jdc:Actant` → `getActants`)

#### 1.2 Liste des property_id
Parcourir toutes les clés du JSON et extraire tous les `property_id` uniques.

Exemple :
```json
"dcterms:title": [{"property_id": 1}],
"schema:agent": [{"property_id": 386}],
"foaf:firstName": [{"property_id": 139}]
```
→ Liste : `[1, 386, 139]`

#### 1.3 Identification des types de propriétés

Pour chaque propriété, noter son type :

| Type dans JSON | Traitement |
|----------------|------------|
| `"type": "literal"` | Stocker `@value` directement |
| `"type": "uri"` | Stocker `@id` dans le champ |
| `"type": "resource"` | Stocker `value_resource_id` + créer maps si nécessaire |
| `"type": "customvocab:XX"` | Traiter comme `resource` |

#### 1.4 Détection des maps nécessaires

**Une map est nécessaire si la propriété de type `resource` contient :**
- `thumbnail_url` → Créer `xxxThumbnailMap`
- `display_title` → Créer `xxxMap` ou `xxxTitleMap`
- `url` (propriété spécifique) → Créer `xxxPageMap` ou `xxxUriMap`

Exemple :
```json
"schema:agent": [{
  "type": "resource",
  "property_id": 386,
  "value_resource_id": 19133,
  "display_title": "Spike Jonze",
  "thumbnail_url": "https://...",
  "url": null
}]
```
→ Nécessite : `agentMap` (pour display_title) + `agentThumbnailMap`

---

## ÉTAPE 2 : Génération du code PHP

### 2.1 Partie 1 : Requête principale

```php
function get{Nom}()
{
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
```

**Variables à remplacer :**
- `{Nom}` : Nom extrait de `@type[1]` (ex: `Films`, `Actants`)
- `{TEMPLATE_ID}` : Valeur de `o:resource_template.o:id`

### 2.2 Partie 2 : Requête des valeurs

```php
    $valueQuery = "
        SELECT v.resource_id, v.value, v.property_id, v.value_resource_id, v.uri, v.type,
               m.id as media_id, m.storage_id, m.extension
        FROM `value` v
        LEFT JOIN `media` m ON v.value_resource_id = m.id
        WHERE v.resource_id IN (" . implode(',', $resourceIds) . ")
        AND v.property_id IN ({PROPERTY_IDS})
    ";

    $values = $this->conn->executeQuery($valueQuery)->fetchAllAssociative();
```

**Variables à remplacer :**
- `{PROPERTY_IDS}` : Liste des property_id séparés par des virgules (ex: `1, 386, 139, 140, 1517, 724`)

**Note :** Le `LEFT JOIN` sur `media` est toujours inclus car certaines propriétés peuvent référencer des médias.

### 2.3 Partie 3 : Maps des ressources liées

#### 3.3.1 Thumbnail principal (logo)

Toujours généré si `o:thumbnail` ou `thumbnail_display_urls` existe dans le JSON :

```php
    // Requête pour récupérer les logos/thumbnails
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
```

#### 3.3.2 Maps pour propriétés de type resource

**Pattern générique pour une ressource liée avec display_title :**

```php
    // Récupérer les informations pour {NomRessource}
    ${nomRessource}Ids = [];
    foreach ($values as $value) {
        if ($value['property_id'] == {PROPERTY_ID} && $value['value_resource_id']) {
            ${nomRessource}Ids[] = $value['value_resource_id'];
        }
    }

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
```

**Pattern avec thumbnail :**

Ajouter après la récupération du titre :

```php
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
```

**Pattern avec URL/page (property_id 174 ou 1517) :**

```php
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
```

**Valeurs courantes de URL_PROPERTY_ID :**
- `174` : `foaf:page`
- `1517` : `schema:url`
- `121` : `bibo:uri`

#### 3.3.3 Maps pour médias associés (property_id 438)

Si `schema:associatedMedia` (property_id 438) est présent :

```php
    // Récupérer tous les IDs des médias associés
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
```

### 2.4 Partie 4 : Construction du résultat

#### 2.4.1 Initialisation du tableau

Analyser le JSON pour créer la structure initiale. Pour chaque propriété :

```php
    $result = [];
    foreach ($resources as $resource) {
        ${nomVariable} = [
            'id' => $resource['id'],
            // Ajouter tous les champs extraits du JSON
            '{nomChamp1}' => '',           // Pour literal
            '{nomChamp2}' => [],           // Pour resource (multiple)
            '{nomChamp3}' => '',           // Pour uri
            'thumbnail' => isset($logoMap[$resource['id']]) 
                ? $this->generateThumbnailUrl($logoMap[$resource['id']]) 
                : ''
        ];
```

**Règles de nommage des champs :**
- Voir `property_mappings.json` pour les mappings courants
- Utiliser camelCase
- Pluraliser si la propriété peut avoir plusieurs valeurs (tableau `[]`)

#### 2.4.2 Switch/case pour chaque property_id

```php
        foreach ($values as $value) {
            if ($value['resource_id'] == $resource['id']) {
                switch ($value['property_id']) {
                    // Pour chaque property_id trouvé dans le JSON
                }
            }
        }
```

**Templates de case selon le type :**

**Type literal :**
```php
case {PROPERTY_ID}: // {LABEL}
    ${nomVariable}['{nomChamp}'] = $value['value'];
    break;
```

**Type uri :**
```php
case {PROPERTY_ID}: // {LABEL}
    ${nomVariable}['{nomChamp}'] = $value['uri'];
    break;
```

**Type resource (simple ID) :**
```php
case {PROPERTY_ID}: // {LABEL}
    if ($value['value_resource_id']) {
        ${nomVariable}['{nomChamp}'][] = $value['value_resource_id'];
    }
    break;
```

**Type resource (avec map - objet détaillé) :**
```php
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
```

**Type resource pour media (property_id 438) :**
```php
case 438: // schema:associatedMedia
    if ($value['value_resource_id']) {
        $mediaId = $value['value_resource_id'];
        if (isset($associatedMediaMap[$mediaId])) {
            ${nomVariable}['associatedMedia'][] = 
                $this->generateThumbnailUrl($associatedMediaMap[$mediaId]);
        }
    }
    break;
```

**Type resource pour image principale (property_id 1701) :**
```php
case 1701: // schema:image
    if ($value['storage_id'] && $value['extension']) {
        ${nomVariable}['picture'] = $this->generateThumbnailUrl(
            $value['storage_id'], 
            $value['extension']
        );
    }
    break;
```

#### 2.4.3 Finalisation

```php
        $result[] = ${nomVariable};
    }

    return $result;
}
```

---

## ÉTAPE 3 : Ajout au switch principal

Dans le fichier `QuerySqlViewHelper.php`, ajouter un case dans la fonction `__invoke()` (autour de la ligne 33) :

```php
case 'get{Nom}':
    $result = $this->get{Nom}();
    break;
```

---

## Mapping des noms de propriétés courantes

Voir le fichier `property_mappings.json` pour la liste complète.

### Propriétés standards

| Label Omeka | Nom de champ PHP | Type |
|-------------|------------------|------|
| `dcterms:title` | `title` | string |
| `dcterms:description` | `description` | string |
| `dcterms:date` | `date` | string |
| `dcterms:abstract` | `abstract` | string |
| `schema:url` | `url` | string (uri) |
| `schema:agent` | `acteurs` ou `agents` | array |
| `schema:contributor` | `actants` ou `contributors` | array |
| `foaf:firstName` | `firstName` | string |
| `foaf:lastName` | `lastName` | string |
| `schema:email` | `mail` | string |
| `schema:image` | `picture` | string (url) |
| `schema:associatedMedia` | `associatedMedia` | array |

### Contexte spécifique ARCANES

| Label Omeka | Nom de champ PHP | Type |
|-------------|------------------|------|
| `jdc:hasConcept` | `keywords` ou `concepts` | array |
| `jdc:hasActant` | `actant` | int/object |
| `jdc:hasUniversity` | `universities` | array |
| `jdc:hasLaboratoire` | `laboratories` | array |
| `jdc:hasEcoleDoctorale` | `doctoralSchools` | array |

---

## Exemples complets

Voir les fichiers :
- `example_oeuvres_annotated.json` : Exemple pour Films/Oeuvres
- `example_actants_annotated.json` : Exemple pour Actants

---

## Checklist de génération

Lors de la génération d'une nouvelle fonction :

- [ ] Template ID extrait du JSON
- [ ] Nom de fonction déduit de `@type[1]`
- [ ] Tous les property_id listés
- [ ] Types de propriétés identifiés (literal/uri/resource)
- [ ] Maps nécessaires identifiées (thumbnail/title/url)
- [ ] Structure initiale du tableau créée
- [ ] Switch/case complet pour tous les property_id
- [ ] Gestion des ressources liées avec objets détaillés
- [ ] Thumbnail principal géré
- [ ] Case ajouté dans `__invoke()`
- [ ] Code commenté avec labels des propriétés

---

## Notes importantes

1. **Toujours utiliser `array_unique()` avant les requêtes** pour éviter les doublons
2. **Vérifier `!empty()` avant les requêtes** pour éviter les erreurs SQL
3. **Utiliser `??` pour les valeurs optionnelles** dans les maps
4. **Préférer les tableaux `[]` initiaux** pour les propriétés multiples
5. **Ajouter des commentaires** avec les labels Omeka pour faciliter la maintenance

