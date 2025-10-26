# Guide d'utilisation pour l'IA - Génération TypeScript

## Workflow complet de génération

Quand l'utilisateur fournit un JSON Omeka S pour générer une fonction TypeScript, suivre ce workflow :

---

## PRÉREQUIS

✅ La fonction PHP correspondante doit déjà être générée (voir `../generateur_api_php/`)
✅ Le JSON Omeka S complet est fourni
✅ Accès au fichier `Items.ts` pour consultation des patterns existants

---

## ÉTAPE 1 : Analyse du JSON et de la fonction PHP

### 1.1 Extraire les métadonnées

```
Template ID : o:resource_template.o:id
Type : @type[1]
Nom fonction TS : get{Nom}
```

### 1.2 Identifier les property_id de type resource

Parcourir le JSON et noter tous les property_id où `type: "resource"` ET `value_resource_id` est présent.

**Exemple :**
```json
"schema:agent": [{
  "type": "resource",
  "property_id": 386,
  "value_resource_id": 19133,
  "display_title": "Spike Jonze"
}]
```
→ property_id 386 est de type resource

### 1.3 Vérifier la fonction PHP générée

**Important :** Vérifier comment le PHP stocke ces propriétés :

```php
case 386:
    $oeuvre['personne'][] = $value['value_resource_id'];  // Array
```
→ Le champ `personne` contient des IDs à hydrater

```php
case 1621:
    $oeuvre['genre'] = $genreMap[$genreId];  // String avec titre
```
→ Le champ `genre` est déjà hydraté en PHP, ne PAS réhydrater en TS

**Règle** : Hydrater uniquement les champs qui contiennent des IDs bruts (pas d'objets détaillés).

---

## ÉTAPE 2 : Consulter dependency_mappings.json

Pour chaque property_id de type resource identifié :

1. **Chercher dans `dependency_mappings.json`**
   ```json
   "386": {
     "ts_function": "getPersonnes",
     "php_field": "personne",
     "ts_field": "personne"
   }
   ```

2. **Noter :**
   - Fonction TypeScript à appeler
   - Nom du champ PHP
   - Nom du champ TS (peut être différent)
   - Type d'hydratation (array/single)

3. **Vérifier si la fonction existe** dans `Items.ts`
   - Si OUI → L'ajouter à Promise.all
   - Si NON → Laisser comme ID (documenter pour création ultérieure)

---

## ÉTAPE 3 : Déterminer le pattern d'hydratation

### 3.1 Analyser la structure des données PHP

**Dans le PHP, le champ est initialisé comme :**
- `[]` → Pattern ARRAY (plusieurs valeurs possibles)
- `''` → Pattern SINGLE (une seule valeur)

### 3.2 Vérifier les données existantes

**Consulter Items.ts :**
- Si d'autres fonctions traitent le même type → Vérifier si parsing legacy nécessaire
- Si première utilisation → Pattern simple suffit

**Parsing legacy nécessaire si :**
- Des données existantes peuvent avoir format "id1,id2,id3"
- Compatibilité avec anciennes versions requise

**Exemple dans Items.ts :**
```typescript
// getOeuvres() ligne 824-832 utilise parsing legacy
if (typeof oeuvre.personne === 'string') {
  personneIds = oeuvre.personne.split(',').map((id: string) => id.trim());
}
```

---

## ÉTAPE 4 : Générer le code TypeScript

### 4.1 Structure de base

```typescript
export async function get{Nom}(id?: number) {
  try {
    // 1. Cache
    // 2. Promise.all
    // 3. Maps
    // 4. Hydratation
    // 5. Cache + Return
  } catch (error) {
    // Gestion erreur
  }
}
```

### 4.2 Compléter le Promise.all

**Format :**
```typescript
const [raw{Nom}, {res1}, {res2}, ...] = await Promise.all([
  getDataByUrl('https://tests.arcanes.ca/omk/s/edisem/page/ajax?helper=Query&action=get{Nom}&json=1'),
  get{Res1}(),  // Pour property_id XXX
  get{Res2}(),  // Pour property_id YYY
  // ...
]);
```

**Liste des fonctions** : Basée sur les dependency trouvées à l'étape 2.

### 4.3 Créer les Maps

```typescript
const {res1}Map = new Map({res1}.map((r: any) => [String(r.id), r]));
```

**Si besoin d'ajouter type dans la map :**
```typescript
const {res1}Map = new Map(
  ({res1} || []).map((r: any) => [String(r.id), { ...r, type: '{typeRes1}' }])
);
```

### 4.4 Hydratation

**Choisir le pattern selon analyse :**

**Pattern SIMPLE (recommandé si pas de legacy) :**
```typescript
const {nom}Full = raw{Nom}.map((item: any) => ({
  ...item,
  type: '{nom}',
  {champ}: Array.isArray(item.{champPhp})
    ? item.{champPhp}.map((id: any) => ressourceMap.get(String(id))).filter(Boolean)
    : []
}));
```

**Pattern LEGACY (si compatibilité nécessaire) :**
```typescript
const {nom}Full = raw{Nom}.map((item: any) => {
  let {champ}Ids: string[] = [];
  // Parsing...
  const {champ}Linked = {champ}Ids.map((id: string) => map.get(id)).filter(Boolean);
  
  return {
    ...item,
    type: '{nom}',
    {champ}: {champ}Linked.length > 0 ? {champ}Linked : null
  };
});
```

---

## ÉTAPE 5 : Cas spéciaux à gérer

### 5.1 Ressource liée déjà hydratée en PHP

**Indicateur :** Le PHP utilise une map (ex: `genreMap`) et retourne des titres/objets

**Action :** NE PAS hydrater en TypeScript

**Exemple :**
```php
// PHP
case 1621:
    $oeuvre['genre'] = $genreMap[$genreId];  // Déjà un titre, pas un ID

// TypeScript → NE RIEN FAIRE
// Le champ genre reste tel quel
```

### 5.2 Propriété avec plusieurs sources possibles

**Indicateur :** `multiple_sources` dans dependency_mappings.json

**Action :** Charger toutes les sources et chercher dans chacune

**Exemple (property_id 581 - contributors) :**
```typescript
const [rawXxx, actants, students] = await Promise.all([...]);

xxxFull.forEach((item: any) => {
  item.actant = [
    ...actants.filter((a: any) => a.id === item.contributor),
    ...students.filter((s: any) => s.id === item.contributor)
  ];
});
```

### 5.3 Transformations de données

**Composer un titre :**
```typescript
title: item.firstname ? `${item.firstname} ${item.lastname}` : item.title
```

**Transformer URL :**
```typescript
url: conf.url ? `https://www.youtube.com/embed/${conf.url.substr(-11)}` : conf.url
```

---

## ÉTAPE 6 : Formatage et présentation

### 6.1 Code final

Présenter :

```markdown
## Analyse

**Template ID** : XXX
**Fonction** : get{Nom}()
**Ressources à hydrater** : [liste]
**Pattern** : SIMPLE/INTERMÉDIAIRE/COMPLEXE

## Code TypeScript généré

\```typescript
export async function get{Nom}(id?: number) {
  // Code complet
}
\```

## Explications

- property_id XXX → Champ {champ} → Fonction get{Ressource}()
- Pattern {pattern} utilisé pour l'hydratation
- Parsing legacy activé/désactivé

## À ajouter dans Items.ts

Insérer la fonction après la ligne XXX (ou à la fin du fichier)
```

---

## ÉTAPE 7 : Validation et checklist

### Checklist avant de présenter le code

- [ ] Cache sessionStorage ajouté
- [ ] Promise.all avec toutes les dépendances identifiées
- [ ] Maps créées pour toutes les ressources chargées
- [ ] Hydratation pour tous les champs de type resource (sauf si déjà hydraté en PHP)
- [ ] Pattern approprié choisi (simple vs legacy)
- [ ] Type ajouté : `type: '{nom}'`
- [ ] Support du paramètre `id?: number`
- [ ] Gestion d'erreur standard
- [ ] Noms de variables cohérents avec conventions
- [ ] Code commenté si nécessaire

---

## EXEMPLES DE GÉNÉRATION

### Cas 1 : Fonction simple sans hydratation

**Input** : JSON avec uniquement propriétés literal/uri

**Output** :
```typescript
export async function getXxx() {
  const storedXxx = sessionStorage.getItem('xxx');
  if (storedXxx) return JSON.parse(storedXxx);
  
  const xxx = await getDataByUrl('.../getXxx&json=1');
  const xxxFull = xxx.map((item: any) => ({ ...item, type: 'xxx' }));
  
  sessionStorage.setItem('xxx', JSON.stringify(xxxFull));
  return xxxFull;
}
```

**Temps** : ~15 secondes

### Cas 2 : Fonction avec 1 ressource liée

**Input** : JSON avec 1 property_id de type resource

**Output** : Code avec Promise.all(2), 1 map, hydratation simple

**Temps** : ~30 secondes

**Exemple** : `getComments()` - Voir `example_comments_ts_annotated.ts`

### Cas 3 : Fonction avec plusieurs ressources liées

**Input** : JSON avec 3-5 property_id de type resource

**Output** : Code avec Promise.all(4-6), multiples maps, hydratation complexe

**Temps** : ~1-2 minutes

**Exemple** : `getOeuvres()` - Voir `example_oeuvres_ts_annotated.ts`

---

## ERREURS COURANTES À ÉVITER

### ❌ Erreur 1 : Hydrater un champ déjà hydraté en PHP

```php
// PHP utilise genreMap
case 1621:
    $oeuvre['genre'] = $genreMap[$genreId];  // Retourne "Cinéma"
```

```typescript
// ❌ MAUVAIS : Essayer de réhydrater
genre: genreMap.get(item.genre)  // item.genre = "Cinéma" (string), pas un ID

// ✅ BON : Laisser tel quel
genre: item.genre  // Ou simplement ne pas toucher
```

### ❌ Erreur 2 : Oublier filter(Boolean)

```typescript
// ❌ MAUVAIS
actants: item.actants.map((id: any) => actantsMap.get(String(id)))
// Peut retourner [undefined, actant, undefined]

// ✅ BON
actants: item.actants.map((id: any) => actantsMap.get(String(id))).filter(Boolean)
// Retourne [actant] (uniquement les valeurs existantes)
```

### ❌ Erreur 3 : Ne pas gérer les cas null

```typescript
// ❌ MAUVAIS
item.field.map(...)  // Crash si item.field est null/undefined

// ✅ BON
Array.isArray(item.field) ? item.field.map(...) : []
// Ou
item.field ? item.field.map(...) : []
```

### ❌ Erreur 4 : Oublier String(id)

```typescript
// ❌ MAUVAIS (types peuvent ne pas correspondre)
map.get(id)

// ✅ BON
map.get(String(id))
```

---

## OPTIMISATIONS

### 1. Charger uniquement les ressources utilisées

```typescript
// ✅ BON : Si 2 property_id sur 5 ont type resource
const [rawXxx, ressource1, ressource2] = await Promise.all([...]);

// ❌ MAUVAIS : Charger toutes les ressources "au cas où"
const [rawXxx, actants, personnes, keywords, ...] = await Promise.all([...]);
```

### 2. Réutiliser les maps si possible

Si plusieurs champs référencent la même ressource, utiliser la même map.

### 3. Ajouter type dans la map si utilisé partout

```typescript
// Au lieu de
elementsNarratifs: ids.map(id => ({ ...map.get(id), type: 'elementNarratif' }))

// Faire
const map = new Map(items.map(e => [String(e.id), { ...e, type: 'elementNarratif' }]));
elementsNarratifs: ids.map(id => map.get(id))
```

---

## DÉCISIONS AUTOMATIQUES

### Parsing legacy : OUI si

- Le type existe déjà dans le code (ex: Oeuvres existe déjà)
- Des données peuvent avoir format legacy
- Pattern utilisé dans d'autres fonctions similaires

### Parsing legacy : NON si

- Nouveau type jamais vu
- Garantie que les données sont toujours en array
- Simplification demandée par l'utilisateur

### Hydratation : OUI si

- property_id a une fonction TS dans dependency_mappings.json
- Le PHP retourne uniquement des IDs
- `hydrate: true` dans dependency_mappings.json

### Hydratation : NON si

- Le PHP retourne déjà des objets détaillés (avec maps PHP)
- `hydrate: false` dans dependency_mappings.json
- Aucune fonction TS disponible

---

## FORMAT DE PRÉSENTATION

### Structure de réponse

```markdown
## Analyse du JSON

**Template ID** : XXX
**Type** : {Type}
**Fonction TypeScript** : get{Nom}()

### Property IDs de type resource trouvés

| property_id | Label | Champ PHP | Fonction TS | Hydrater |
|-------------|-------|-----------|-------------|----------|
| 386 | schema:agent | personne | getPersonnes() | ✅ OUI |
| 1621 | schema:genre | genre | getKeywords() | ❌ NON (déjà en PHP) |

### Dépendances à charger

- getPersonnes() - Pour hydrater 'personne'
- getElementNarratifs() - Pour hydrater 'elementsNarratifs'

---

## Code TypeScript généré

\```typescript
export async function get{Nom}(id?: number) {
  // Code complet ici
}
\```

---

## Notes d'implémentation

- Pattern {pattern} utilisé
- Parsing legacy activé/désactivé
- X ressources hydratées
- Temps estimé : ~XXs

---

## Intégration

Ajouter cette fonction dans `src/services/Items.ts` après la ligne XXX ou à la fin du fichier.
```

---

## TESTS RAPIDES

Après génération, vérifier mentalement :

1. **Promise.all contient** : getDataByUrl + toutes les dépendances identifiées ✓
2. **Chaque ressource a sa map** : Une map par élément dans Promise.all ✓
3. **Hydratation cohérente** : Pattern adapté au type (array/single) ✓
4. **Type ajouté** : `type: '{nom}'` présent ✓
5. **Cache géré** : sessionStorage.getItem/setItem présents ✓

---

## AMÉLIORATIONS FUTURES

Si l'utilisateur demande des fonctionnalités spécifiques :

- **forceRefresh** : Ajouter paramètre `forceRefresh = false`
- **Comptage** : Calculer des statistiques (ex: interventions)
- **Filtrage** : Ajouter paramètres de filtre
- **Pagination** : Gérer le chargement progressif

**Par défaut** : Générer uniquement la fonction de base.

---

## RESSOURCES

- **GENERATION_GUIDE_TS.md** : Patterns détaillés d'hydratation
- **dependency_mappings.json** : Mappings property_id → fonctions
- **TEMPLATE_FONCTION.ts** : Template commenté
- **example_*.ts** : Exemples complets annotés
- **Items.ts** : Code source pour références

---

**Prêt à générer ? Suivez les étapes et consultez les exemples !**

