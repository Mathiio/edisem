# Guide d'utilisation pour l'IA - Génération automatique de fonctions PHP

## Workflow de génération

Quand l'utilisateur fournit un nouveau JSON Omeka S, suivre ces étapes :

---

## ÉTAPE 1 : Analyse initiale du JSON

### 1.1 Extraire les métadonnées de base

```
Template ID : o:resource_template.o:id
Type de ressource : @type[1] (après "o:Item")
Nom de fonction : Déduire de @type[1]
```

### 1.2 Scanner toutes les propriétés

Parcourir le JSON et créer un tableau :

```json
{
  "property_id": X,
  "label": "namespace:name",
  "type": "literal|uri|resource|customvocab:XX",
  "has_display_title": boolean,
  "has_thumbnail_url": boolean,
  "has_url": boolean,
  "is_array": boolean (si plusieurs valeurs possibles)
}
```

### 1.3 Consulter property_mappings.json

Pour chaque property_id trouvé, vérifier s'il existe dans `property_mappings.json` et récupérer :
- `field_name` recommandé
- `type` attendu
- `needs_map` : si une map est nécessaire
- `map_properties` : quelles propriétés récupérer pour la map

---

## ÉTAPE 2 : Déterminer les maps nécessaires

Pour chaque propriété de type `resource` :

### 2.1 Map simple (titre uniquement)

**Critère** : `display_title` présent MAIS pas `thumbnail_url` ni `url`

**Maps à créer** :
- `{nom}Map` : Titre (property_id 1)

**Exemple** : `genreMap`, `linkedResourceMap`

### 2.2 Map complète (titre + thumbnail)

**Critère** : `display_title` ET `thumbnail_url` présents

**Maps à créer** :
- `{nom}Map` : Titre (property_id 1)
- `{nom}ThumbnailMap` : Thumbnail (media table)

**Exemple** : `agentMap` + `agentThumbnailMap`

### 2.3 Map ultra-complète (titre + thumbnail + url)

**Critère** : `display_title` ET `thumbnail_url` ET `url` présents

**Maps à créer** :
- `{nom}Map` : Titre (property_id 1)
- `{nom}ThumbnailMap` : Thumbnail (media table)
- `{nom}PageMap` : URL (property_id 174 ou 1517 ou 121)

**Exemple** : `contributorMap` + `contributorThumbnailMap` + `contributorPageMap`

### 2.4 Map groupée (plusieurs property_id partagent les mêmes maps)

**Critère** : Plusieurs propriétés référencent le même type de ressource

**Exemple** :
- property_id 36 (dcterms:references) + property_id 48 (dcterms:bibliographicCitation)
  → Grouper dans `referencesAndCitationsIds`
  → Créer `titleMap`, `uriMap`, `thumbnailMap` partagés

### 2.5 Cas spéciaux

#### Property_id 438 (schema:associatedMedia)
**Map** : `associatedMediaMap`
**Requête spéciale** : UNION query (item_id et id)

#### Property_id 1701 (schema:image)
**Pas de map** : Utiliser `storage_id` et `extension` directement depuis valueQuery

#### Property_id 2355 (drama:achieves - Archives)
**Maps** : `archiveTitleMap` + `archiveSourceMap`
**Requête spéciale** : `media.source` pour archiveSourceMap

---

## ÉTAPE 3 : Génération du code PHP

### 3.1 Template de base

```php
function get{Nom}()
{
    // 1. REQUÊTE PRINCIPALE
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

    // 2. REQUÊTE DES VALEURS
    $valueQuery = "
        SELECT v.resource_id, v.value, v.property_id, v.value_resource_id, v.uri, v.type,
               m.id as media_id, m.storage_id, m.extension
        FROM `value` v
        LEFT JOIN `media` m ON v.value_resource_id = m.id
        WHERE v.resource_id IN (" . implode(',', $resourceIds) . ")
        AND v.property_id IN ({LISTE_PROPERTY_IDS})
    ";

    $values = $this->conn->executeQuery($valueQuery)->fetchAllAssociative();

    // 3. MAPS (à générer selon analyse)
    
    // 4. CONSTRUCTION DU RÉSULTAT
    $result = [];
    foreach ($resources as $resource) {
        ${nomVariable} = [
            'id' => $resource['id'],
            // Champs à ajouter selon JSON
        ];

        foreach ($values as $value) {
            if ($value['resource_id'] == $resource['id']) {
                switch ($value['property_id']) {
                    // Cases à générer
                }
            }
        }

        $result[] = ${nomVariable};
    }

    return $result;
}
```

### 3.2 Génération des maps

Pour chaque map identifiée à l'étape 2, utiliser les templates du `GENERATION_GUIDE.md` section 2.3.

### 3.3 Génération du switch/case

Pour chaque property_id :

1. Vérifier le type dans le JSON
2. Utiliser le template correspondant :
   - **literal** : `$var['field'] = $value['value'];`
   - **uri** : `$var['field'] = $value['uri'];`
   - **resource (ID simple)** : `$var['field'][] = $value['value_resource_id'];`
   - **resource (avec map)** : Utiliser les maps créées

---

## ÉTAPE 4 : Formatage du code généré

### 4.1 Commentaires à ajouter

```php
case {PROPERTY_ID}: // {LABEL}
```

Pour chaque case, ajouter le label Omeka en commentaire.

### 4.2 Organisation

- Grouper les maps par catégorie (media, ressources liées, etc.)
- Ordonner les cases par property_id croissant
- Ajouter des commentaires de section si nécessaire

### 4.3 Validation

Vérifier :
- [ ] Tous les property_id du JSON sont dans la requête
- [ ] Tous les property_id ont un case correspondant
- [ ] Les maps nécessaires sont créées
- [ ] Les noms de champs sont cohérents avec property_mappings.json
- [ ] Le thumbnail principal est géré si `thumbnail_display_urls` existe
- [ ] Pas de property_id en double

---

## ÉTAPE 5 : Présentation du résultat

### Format de réponse

Présenter le code généré avec :

1. **Résumé de l'analyse**
   ```
   Template ID: X
   Fonction: getXxx()
   Property IDs trouvés: [liste]
   Maps nécessaires: [liste]
   ```

2. **Code PHP complet**
   ```php
   function getXxx() { ... }
   ```

3. **Ajout au switch principal**
   ```php
   // À ajouter dans __invoke() autour de la ligne 150
   case 'getXxx':
       $result = $this->getXxx();
       break;
   ```

4. **Notes et points d'attention**
   - Propriétés spéciales utilisées
   - Choix de nommage particuliers
   - Différences avec les patterns standards

---

## Exemples de référence

### Pattern SIMPLE
Voir : `example_actants_annotated.json` et fonction `getActants()`
- Peu de maps
- IDs directs
- Une seule propriété spéciale (1701)

### Pattern COMPLEXE
Voir : `example_oeuvres_annotated.json` et fonction `getOeuvres()`
- Nombreuses maps
- Ressources liées détaillées
- Plusieurs propriétés spéciales

### Pattern INTERMÉDIAIRE
Voir : fonction `getExperimentations()`
- Mix de maps et IDs directs
- Quelques propriétés spéciales

---

## Checklist finale avant génération

- [ ] Analyse complète du JSON effectuée
- [ ] property_mappings.json consulté pour tous les property_id
- [ ] Maps nécessaires identifiées et classées
- [ ] Template de code choisi (simple/intermédiaire/complexe)
- [ ] Noms de champs cohérents avec les conventions
- [ ] Commentaires ajoutés pour chaque case
- [ ] Code formaté et indenté correctement

---

## Gestion des cas ambigus

### Propriété peut être literal OU resource

**Exemple** : `dcterms:description` (property_id 4)
- Normalement literal
- Parfois resource (annotations)

**Solution** : Vérifier dans le JSON fourni. Si `value_resource_id` est présent, traiter comme resource.

### Nom de champ ambigu

**Exemple** : `schema:agent` → `agents` ou `acteurs` ?

**Solution** : 
1. Vérifier le contexte (Oeuvres → acteurs, autres → agents)
2. Consulter property_mappings.json → `alternative_field_name`
3. Demander clarification à l'utilisateur si nécessaire

### Map ou pas map ?

**Règle** : Si le frontend a déjà accès aux détails via une autre fonction (ex: `getUniversities()`), stocker uniquement l'ID.

**Exemples** :
- `universities` : ID uniquement → `getUniversities()` existe
- `agents` dans Oeuvres : Map complète → Besoin des détails inline

---

## Optimisations possibles

### Requêtes groupées

Si plusieurs property_id référencent le même type de ressource avec les mêmes besoins (titre + thumbnail), grouper les IDs et créer une seule map.

**Exemple** : 
```php
// property_id 2097, 3233, 3238, 3239, 2079, 3235, 3240, 2080
// Tous besoin uniquement du titre
→ Créer linkedResourceMap unique
```

### Éviter les requêtes inutiles

Ne créer une map que si au moins un élément du JSON l'utilise.

**Vérification** :
```php
if (!empty(${nom}Ids)) {
    // Créer la map
}
```

---

## Note importante

**Ce guide est destiné à l'IA pour automatiser la génération.**
**L'utilisateur colle simplement un JSON et l'IA génère le code complet.**
**Objectif : 95%+ de code correct du premier coup.**

