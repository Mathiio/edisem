# Guide de génération automatique de fonctions TypeScript pour Items.ts

## Vue d'ensemble

Ce guide permet à l'IA de générer automatiquement des fonctions TypeScript dans `Items.ts` qui récupèrent les données du backend PHP et hydratent les ressources liées.

---

## Structure standard d'une fonction TypeScript

Toute fonction suit ce pattern en 5 parties :

```typescript
export async function getXxx(id?: number) {
  try {
    // 1. CACHE : Vérifier sessionStorage
    // 2. FETCH : Récupérer données + dépendances en Promise.all
    // 3. MAPS : Créer maps pour accès rapide
    // 4. HYDRATATION : Remplacer IDs par objets complets
    // 5. CACHE + RETURN : Stocker et retourner
  } catch (error) {
    // Gestion d'erreur standard
  }
}
```

---

## ÉTAPE 1 : Analyse du JSON et de la fonction PHP

### 1.1 Extractions du JSON
- **Template ID** : `o:resource_template.o:id`
- **Type** : `@type[1]` → Nom de la fonction
- **Property IDs** : Tous les property_id présents

### 1.2 Analyse de la fonction PHP générée

Identifier dans le code PHP :
- Les property_id de **type resource** (avec `value_resource_id`)
- Les champs qui sont des **tableaux** (`[]`)
- Les champs qui sont des **valeurs uniques** (string/number)

**Exemple dans PHP :**
```php
$oeuvre = [
    'personne' => [],              // Array → Plusieurs personnes
    'genre' => '',                 // String → Un seul genre
    'elementsNarratifs' => [],     // Array → Plusieurs éléments
];

case 386: // schema:agent
    $oeuvre['personne'][] = $value['value_resource_id'];  // → Array
    break;
case 1621: // schema:genre
    $oeuvre['genre'] = $genreMap[$genreId];               // → Single
    break;
```

---

## ÉTAPE 2 : Déterminer les dépendances

### 2.1 Consulter dependency_mappings.json

Pour chaque property_id de type resource trouvé dans le PHP, vérifier :
- Quelle fonction TypeScript appeler
- Si cette fonction existe déjà dans Items.ts
- Le nom du champ hydraté

### 2.2 Identifier les ressources à charger

**Règle** : Charger uniquement les ressources qui seront utilisées pour l'hydratation.

**Exemple :**
```typescript
// PHP a : actant (2095), personne (386), keywords (2097), elementsNarratifs (461)
// TypeScript doit charger : getActants(), getPersonnes(), getKeywords(), getElementNarratifs()
```

### 2.3 Cas particuliers

**Ressources déjà hydratées :**
- Si le PHP retourne déjà les détails (ex: avec maps) → Pas besoin d'hydrater côté TS
- Si le PHP retourne uniquement IDs → Hydrater côté TS

**Ressources sans fonction TS :**
- Si aucune fonction existe (ex: nouveau type) → Laisser comme ID
- Documenter pour créer la fonction plus tard

---

## ÉTAPE 3 : Génération du code TypeScript

### 3.1 Partie 1 : Cache (toujours identique)

```typescript
export async function get{Nom}(id?: number) {
  try {
    const stored{Nom} = sessionStorage.getItem('{nom}');
    if (stored{Nom}) {
      const {nom} = JSON.parse(stored{Nom});
      return id ? {nom}.find((x: any) => x.id === String(id)) : {nom};
    }
```

**Variables à remplacer :**
- `{Nom}` : Nom avec majuscule (ex: `Oeuvres`, `Comments`)
- `{nom}` : Nom en minuscule/camelCase (ex: `oeuvres`, `comments`)

### 3.2 Partie 2 : Fetch avec Promise.all

```typescript
    const [raw{Nom}, {ressource1}, {ressource2}, ...] = await Promise.all([
      getDataByUrl('https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=get{Nom}&json=1'),
      get{Ressource1}(),
      get{Ressource2}(),
      // Ajouter toutes les ressources identifiées à l'étape 2
    ]);
```

**Ordre des éléments dans Promise.all :**
1. Toujours `getDataByUrl()` en premier
2. Ensuite les fonctions de ressources liées dans l'ordre logique

### 3.3 Partie 3 : Création des Maps

Pour chaque ressource chargée, créer une Map :

```typescript
    const {ressource1}Map = new Map({ressource1}.map((r: any) => [String(r.id), r]));
    const {ressource2}Map = new Map({ressource2}.map((r: any) => [String(r.id), r]));
```

**Note importante :** Toujours utiliser `String(r.id)` pour éviter les problèmes de types (number vs string).

### 3.4 Partie 4 : Hydratation (cœur du système)

#### Pattern 1 : Champ Array d'IDs → Array d'objets

**Cas simple (IDs déjà en array dans PHP) :**
```typescript
const {nom}Full = raw{Nom}.map((item: any) => ({
  ...item,
  type: '{nom}',
  {champHydrate}: Array.isArray(item.{champPhp})
    ? item.{champPhp}.map((id: any) => ressourceMap.get(String(id))).filter(Boolean)
    : []
}));
```

**Cas legacy (IDs séparés par virgules) :**
```typescript
const {nom}Full = raw{Nom}.map((item: any) => {
  // Parser les IDs multiples
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

  const {champ}Linked = {champ}Ids.map((id: string) => ressourceMap.get(id)).filter(Boolean);

  return {
    ...item,
    type: '{nom}',
    {champ}: {champ}Linked.length > 0 ? {champ}Linked : null
  };
});
```

#### Pattern 2 : Champ ID unique → Objet unique

```typescript
const {nom}Full = raw{Nom}.map((item: any) => ({
  ...item,
  type: '{nom}',
  {champHydrate}: item.{champPhp} ? ressourceMap.get(String(item.{champPhp})) : null
}));
```

#### Pattern 3 : Hydratation conditionnelle

```typescript
const {nom}Full = raw{Nom}.map((item: any) => {
  const result = {
    ...item,
    type: '{nom}'
  };

  // Hydrater uniquement si le champ existe
  if (item.{champPhp}) {
    result.{champHydrate} = Array.isArray(item.{champPhp})
      ? item.{champPhp}.map((id: any) => ressourceMap.get(String(id))).filter(Boolean)
      : ressourceMap.get(String(item.{champPhp}));
  }

  return result;
});
```

### 3.5 Partie 5 : Cache et Return

```typescript
    sessionStorage.setItem('{nom}', JSON.stringify({nom}Full));
    return id ? {nom}Full.find((x: any) => x.id === String(id)) : {nom}Full;
  } catch (error) {
    console.error('Error fetching {nom}:', error);
    throw new Error('Failed to fetch {nom}');
  }
}
```

**Note :** Toujours retourner un tableau (même si id spécifié, on retourne l'élément trouvé ou undefined).

---

## ÉTAPE 4 : Identifier les ressources à charger

### 4.1 Table de correspondance property_id → fonction

| property_id | Ressource | Fonction TS | Champ PHP | Champ TS hydraté |
|-------------|-----------|-------------|-----------|------------------|
| 2095 | Actant | `getActants()` | `actant` | `actant` |
| 386 | Agent/Personne | `getPersonnes()` | `personne` | `personne` |
| 581 | Contributeur | `getActants()` | `actants` | `actants` |
| 461 | Élément narratif | `getElementNarratifs()` | `elementsNarratifs` | `elementsNarratifs` |
| 428 | Élément esthétique | `getElementEsthetique()` | `elementsEsthetique` | `elementsEsthetique` |
| 4 | Annotation | `getAnnotations()` | `annotations` | `annotations` |
| 2097 | Concept | `getKeywords()` | `keywords` | `keywords` |
| 1606 | Feedback | `getFeedbacks()` | `feedbacks` | `feedbacks` |
| 3038 | Université | `getUniversities()` | `universities` | `universities` |
| 3043 | École doctorale | `getDoctoralSchools()` | `doctoralSchools` | `doctoralSchools` |
| 3044 | Laboratoire | `getLaboratories()` | `laboratories` | `laboratories` |
| 951 | Médiagraphie | `getMediagraphies()` | `mediagraphies` | `mediagraphies` |
| 36 | Bibliographie | `getBibliographies()` | `bibliographies` | `bibliographies` |

### 4.2 Règle de décision

**Hydrater si :**
- Le property_id a une fonction TypeScript correspondante
- Le PHP retourne uniquement des IDs (pas d'objets détaillés)

**Ne PAS hydrater si :**
- Le PHP retourne déjà des objets complets (avec maps)
- Aucune fonction TypeScript n'existe encore
- Le champ n'est pas de type resource (literal/uri)

---

## ÉTAPE 5 : Gestion des cas spéciaux

### Cas 1 : Multiple types de ressources dans un champ

**Exemple :** `contributor` peut être Actant OU Student

```typescript
const [rawXxx, actants, students] = await Promise.all([...]);

const actantsMap = new Map(actants.map((a: any) => [String(a.id), a]));
const studentsMap = new Map(students.map((s: any) => [String(s.id), s]));

// Hydrater en cherchant dans les deux maps
xxxFull.forEach((item: any) => {
  const contributorId = item.contributor;
  item.actant = [
    ...actants.filter((a: any) => a.id === contributorId),
    ...students.filter((s: any) => s.id === contributorId)
  ];
});
```

Voir : `getAnnotations()` lignes 229-236

### Cas 2 : Transformation de données

**Exemple :** Ajouter un titre composé

```typescript
const xxxFull = rawXxx.map((item: any) => ({
  ...item,
  type: 'xxx',
  title: item.firstname ? `${item.firstname} ${item.lastname}` : item.title
}));
```

Voir : `getActants()` ligne 430

### Cas 3 : Transformation d'URL

**Exemple :** Convertir URL YouTube en embed

```typescript
url: conf.url ? `https://www.youtube.com/embed/${conf.url.substr(-11)}` : conf.url
```

Voir : `getSeminarConfs()` ligne 531

### Cas 4 : Comptage de relations

**Exemple :** Compter les interventions d'un actant

```typescript
const interventions = confs.filter((c: any) => {
  if (Array.isArray(c.actant)) {
    return c.actant.map(String).includes(String(actant.id));
  }
  return String(c.actant) === String(actant.id);
}).length;
```

Voir : `getActants()` lignes 415-426

---

## ÉTAPE 6 : Template complet

### Fonction sans hydratation

```typescript
export async function getXxx() {
  try {
    const storedXxx = sessionStorage.getItem('xxx');
    if (storedXxx) {
      return JSON.parse(storedXxx);
    }

    const xxx = await getDataByUrl(
      'https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getXxx&json=1'
    );

    const xxxFull = xxx.map((item: any) => ({
      ...item,
      type: 'xxx'
    }));

    sessionStorage.setItem('xxx', JSON.stringify(xxxFull));
    return xxxFull;
  } catch (error) {
    console.error('Error fetching xxx:', error);
    throw new Error('Failed to fetch xxx');
  }
}
```

### Fonction avec hydratation simple (1 ressource)

```typescript
export async function getXxx(id?: number) {
  try {
    const storedXxx = sessionStorage.getItem('xxx');
    if (storedXxx) {
      const xxx = JSON.parse(storedXxx);
      return id ? xxx.find((x: any) => x.id === String(id)) : xxx;
    }

    const [rawXxx, ressource] = await Promise.all([
      getDataByUrl('https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getXxx&json=1'),
      getRessource()
    ]);

    const ressourceMap = new Map(ressource.map((r: any) => [String(r.id), r]));

    const xxxFull = rawXxx.map((item: any) => ({
      ...item,
      type: 'xxx',
      ressourceField: item.ressourceField 
        ? ressourceMap.get(String(item.ressourceField))
        : null
    }));

    sessionStorage.setItem('xxx', JSON.stringify(xxxFull));
    return id ? xxxFull.find((x: any) => x.id === String(id)) : xxxFull;
  } catch (error) {
    console.error('Error fetching xxx:', error);
    throw new Error('Failed to fetch xxx');
  }
}
```

### Fonction avec hydratation complexe (plusieurs ressources)

```typescript
export async function getXxx(id?: number) {
  try {
    const storedXxx = sessionStorage.getItem('xxx');
    if (storedXxx) {
      const xxx = JSON.parse(storedXxx);
      return id ? xxx.find((x: any) => x.id === String(id)) : xxx;
    }

    const [rawXxx, ressource1, ressource2, ressource3] = await Promise.all([
      getDataByUrl('https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=getXxx&json=1'),
      getRessource1(),
      getRessource2(),
      getRessource3()
    ]);

    const ressource1Map = new Map(ressource1.map((r: any) => [String(r.id), r]));
    const ressource2Map = new Map(ressource2.map((r: any) => [String(r.id), r]));
    const ressource3Map = new Map(ressource3.map((r: any) => [String(r.id), r]));

    const xxxFull = rawXxx.map((item: any) => {
      // Parser les IDs si nécessaire (format legacy avec virgules)
      let ressource1Ids: string[] = [];
      if (item.ressource1Field) {
        if (typeof item.ressource1Field === 'string' && item.ressource1Field.includes(',')) {
          ressource1Ids = item.ressource1Field.split(',').map((id: string) => id.trim());
        } else if (Array.isArray(item.ressource1Field)) {
          ressource1Ids = item.ressource1Field.map((id: any) => String(id));
        } else {
          ressource1Ids = [String(item.ressource1Field)];
        }
      }

      const ressource1Linked = ressource1Ids
        .map((id: string) => ressource1Map.get(id))
        .filter(Boolean);

      return {
        ...item,
        type: 'xxx',
        ressource1Field: ressource1Linked.length > 0 ? ressource1Linked : null,
        ressource2Field: item.ressource2Field 
          ? ressource2Map.get(String(item.ressource2Field))
          : null,
        ressource3Field: Array.isArray(item.ressource3Field)
          ? item.ressource3Field.map((id: any) => ressource3Map.get(String(id))).filter(Boolean)
          : []
      };
    });

    sessionStorage.setItem('xxx', JSON.stringify(xxxFull));
    return id ? xxxFull.find((x: any) => x.id === String(id)) : xxxFull;
  } catch (error) {
    console.error('Error fetching xxx:', error);
    throw new Error('Failed to fetch xxx');
  }
}
```

---

## ÉTAPE 7 : Patterns d'hydratation détaillés

### Pattern A : Array d'IDs → Array d'objets (simple)

**Quand l'utiliser :** Le PHP retourne un array d'IDs propre

```typescript
{champ}: Array.isArray(item.{champPhp})
  ? item.{champPhp}.map((id: any) => ressourceMap.get(String(id))).filter(Boolean)
  : []
```

### Pattern B : Array d'IDs → Array d'objets (avec parsing)

**Quand l'utiliser :** Le PHP peut retourner string avec virgules OU array

```typescript
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

const {champ}Linked = {champ}Ids.map((id: string) => ressourceMap.get(id)).filter(Boolean);

return {
  ...item,
  {champ}: {champ}Linked.length > 0 ? {champ}Linked : null
};
```

**Utiliser ce pattern quand :** Compatibilité avec données legacy

### Pattern C : ID unique → Objet unique

**Quand l'utiliser :** Le PHP retourne un seul ID (pas un array)

```typescript
{champ}: item.{champPhp} ? ressourceMap.get(String(item.{champPhp})) : null
```

### Pattern D : Hydratation avec plusieurs sources

**Quand l'utiliser :** Un champ peut référencer plusieurs types de ressources

```typescript
const contributorId = item.contributor;
item.actant = [
  ...actants.filter((a: any) => a.id === contributorId),
  ...students.filter((s: any) => s.id === contributorId)
];
```

---

## Checklist de génération

Lors de la génération d'une nouvelle fonction :

- [ ] Nom de fonction extrait du JSON
- [ ] Cache sessionStorage ajouté
- [ ] Toutes les ressources liées identifiées
- [ ] Promise.all avec toutes les dépendances
- [ ] Maps créées pour chaque ressource
- [ ] Hydratation pour chaque champ de type resource
- [ ] Parser les IDs si format legacy (virgules)
- [ ] Propriété `type` ajoutée
- [ ] Gestion du paramètre `id` optionnel
- [ ] Gestion d'erreur standard
- [ ] Test avec données réelles

---

## Notes importantes

1. **Toujours utiliser `String(id)`** pour la cohérence des types
2. **Toujours utiliser `.filter(Boolean)`** pour enlever les nulls
3. **Toujours vérifier `Array.isArray()`** avant de mapper
4. **Gérer les cas legacy** avec split(',') si nécessaire
5. **Return null ou []** selon le type attendu (single vs multiple)
6. **Ajouter `type`** pour faciliter le filtrage côté frontend

---

## Exemples complets

Voir les fichiers :
- `example_comments_ts_annotated.ts` : Hydratation simple (actants)
- `example_oeuvres_ts_annotated.ts` : Hydratation complexe (multiples ressources)

---

## Performance

**Optimisation avec Promise.all :**
- ✅ Chargement parallèle de toutes les dépendances
- ✅ Réutilisation du cache pour éviter les requêtes
- ✅ Maps pour accès O(1) au lieu de filter O(n)

**Exemple de gain :**
- Sans Promise.all : 500ms + 200ms + 300ms = 1000ms
- Avec Promise.all : max(500ms, 200ms, 300ms) = 500ms
- **Gain : 50% de temps en moins**

