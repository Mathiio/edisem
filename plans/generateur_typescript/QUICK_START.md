# Quick Start - Génération TypeScript pour Items.ts

## Comment utiliser ce système

### Pour l'utilisateur (vous)

**En 2 étapes simples :**

1. **Générez d'abord la fonction PHP** (voir `../generateur_api_php/`)
2. **Collez le même JSON** dans le chat et je génère automatiquement la fonction TypeScript avec hydratation

**C'est tout !**

---

## Exemple concret

### Vous dites :

```
Voici le JSON pour une nouvelle ressource Conference, génère aussi la fonction TypeScript :

{JSON complet ici}
```

### Je réponds avec :

**1. Fonction PHP complète** (si pas déjà générée)
**2. Fonction TypeScript complète** avec :

- ✅ Cache sessionStorage
- ✅ Promise.all pour chargement parallèle
- ✅ Hydratation des ressources liées (IDs → objets)
- ✅ Support du paramètre `id` optionnel

**Temps estimé : 1-3 minutes total (PHP + TS)**

---

## Qu'est-ce que l'hydratation ?

### Données brutes du PHP

```json
{
  "id": 19125,
  "title": "Her",
  "personne": [19133, 19135, 19137], // ← IDs uniquement
  "genre": "Cinéma"
}
```

### Après hydratation en TypeScript

```json
{
  "id": 19125,
  "title": "Her",
  "personne": [
    // ← Objets complets !
    {
      "id": 19133,
      "firstName": "Spike",
      "lastName": "Jonze",
      "picture": "https://..."
    },
    {
      "id": 19135,
      "firstName": "Joaquin",
      "lastName": "Phoenix",
      "picture": "https://..."
    }
  ],
  "genre": "Cinéma"
}
```

**Avantage** : Frontend a accès direct aux détails sans requêtes supplémentaires !

---

## Fichiers de référence

### Documentation

1. **README.md** - Vue d'ensemble
2. **GENERATION_GUIDE_TS.md** - Méthodologie complète
3. **GUIDE_UTILISATION_IA.md** - Workflow pour l'IA
4. **dependency_mappings.json** - Mapping property_id → fonctions TS

### Exemples

- **example_comments_ts_annotated.ts** - Pattern SIMPLE (1 ressource)
- **example_oeuvres_ts_annotated.ts** - Pattern COMPLEXE (4 ressources)

---

## Patterns supportés

| Pattern       | Ressources liées | Temps génération | Exemple           |
| ------------- | ---------------- | ---------------- | ----------------- |
| SIMPLE        | 0                | ~15s             | getUniversities() |
| INTERMÉDIAIRE | 1-2              | ~30s-1min        | getComments()     |
| COMPLEXE      | 3+               | ~1-2min          | getOeuvres()      |

---

## Ce que vous obtenez

### Code TypeScript généré

```typescript
export async function getXxx(id?: number) {
  // Cache sessionStorage
  // Promise.all pour chargement parallèle
  // Maps pour accès O(1)
  // Hydratation automatique
  // Return optimisé
}
```

### Avec explications

- Ressources hydratées identifiées
- Pattern utilisé
- Notes d'implémentation

---

## Ressources hydratées automatiquement

✅ Actants (property_id 2095, 581)
✅ Personnes (property_id 386)
✅ Éléments narratifs (property_id 461)
✅ Éléments esthétiques (property_id 428)
✅ Annotations (property_id 4)
✅ Keywords/Concepts (property_id 2097)
✅ Feedbacks (property_id 1606)
✅ Universities, Laboratories, Schools
✅ Bibliographies, Médiagraphies

Et toutes les autres dans `dependency_mappings.json` !

---

## Performance

**Sans hydratation (IDs uniquement) :**

- Frontend doit faire N requêtes pour les détails
- Temps total : Lent ❌

**Avec hydratation (objets complets) :**

- Une seule requête initiale
- Cache réutilisé pour toutes les pages
- Temps total : Rapide ✅

**Gain** : 80-90% de requêtes en moins !

---

## Questions fréquentes

**Q : Dois-je générer le PHP avant le TypeScript ?**
R : Oui, le générateur TypeScript a besoin de savoir quels champs retourne le PHP.

**Q : Toutes les ressources liées sont hydratées ?**
R : Non, seulement celles qui ont des IDs bruts dans le PHP. Si le PHP retourne déjà des objets détaillés, on les laisse tels quels.

**Q : Le cache peut poser problème ?**
R : Non, sessionStorage est vidé à la fermeture du navigateur. Pour forcer un refresh, ajouter le paramètre `forceRefresh`.

**Q : Puis-je désactiver l'hydratation ?**
R : Oui, demandez une fonction sans hydratation et je génère uniquement la partie fetch/cache.

---

## Prêt à commencer ?

**Collez votre JSON et je m'occupe de tout ! 🚀**

1. Je génère le PHP (si pas déjà fait)
2. Je génère le TypeScript avec hydratation
3. Vous copiez-collez dans vos fichiers
4. Ça fonctionne immédiatement !
