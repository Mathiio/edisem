# Générateur automatique de fonctions TypeScript pour Items.ts

> **🔄 Workflow complet :** Pour un processus de bout en bout (API → TypeScript → Page), voir [`WORKFLOW_COMPLET.md`](../WORKFLOW_COMPLET.md).

## Vue d'ensemble

Ce système permet de générer automatiquement des fonctions TypeScript dans `Items.ts` qui :

1. Récupèrent les données du backend PHP (avec IDs uniquement pour les ressources liées)
2. Hydratent les ressources liées en remplaçant les IDs par les objets complets
3. Utilisent le cache sessionStorage pour optimiser les performances

**Taux de réussite visé : 90-95% de code correct du premier coup**

---

## 🚀 Démarrage rapide

**Pour générer une nouvelle fonction TypeScript :**

1. Générez d'abord la fonction PHP correspondante (voir `../generateur_api_php/`)
2. Copiez le même JSON Omeka S
3. Collez-le dans le chat avec l'IA
4. L'IA génère automatiquement la fonction TypeScript avec hydratation

---

## 📁 Fichiers du système

```
plans/generateur_typescript/
├── README.md (ce fichier)
├── GENERATION_GUIDE_TS.md (méthodologie complète)
├── dependency_mappings.json (property_id → fonctions TS)
├── TEMPLATE_FONCTION.ts (template réutilisable)
├── example_oeuvres_ts_annotated.ts (exemple complexe avec hydratation)
└── example_comments_ts_annotated.ts (exemple simple)
```

---

## 📊 Pattern de fonction TypeScript

### Structure standard

```typescript
export async function getXxx(id?: number) {
  try {
    // 1. CACHE - Vérifier sessionStorage
    const storedXxx = sessionStorage.getItem('xxx');
    if (storedXxx) {
      const xxx = JSON.parse(storedXxx);
      return id ? xxx.find((x: any) => x.id === String(id)) : xxx;
    }

    // 2. FETCH - Récupérer données + ressources liées en Promise.all
    const [rawXxx, ressource1, ressource2] = await Promise.all([
      getDataByUrl('https://.../getXxx&json=1'),
      getRessource1(), // Si nécessaire
      getRessource2(), // Si nécessaire
    ]);

    // 3. MAPS - Créer maps pour accès rapide
    const ressource1Map = new Map(ressource1.map((r: any) => [String(r.id), r]));

    // 4. HYDRATATION - Remplacer IDs par objets
    const xxxFull = rawXxx.map((item: any) => ({
      ...item,
      type: 'xxx',
      ressource1Field: item.ressource1Field.map((id: any) => ressource1Map.get(String(id))).filter(Boolean),
    }));

    // 5. CACHE + RETURN
    sessionStorage.setItem('xxx', JSON.stringify(xxxFull));
    return id ? xxxFull.find((x: any) => x.id === String(id)) : xxxFull;
  } catch (error) {
    console.error('Error fetching xxx:', error);
    throw new Error('Failed to fetch xxx');
  }
}
```

---

## 🔗 Mapping des dépendances

| property_id PHP | Type ressource     | Fonction TypeScript      | Champ hydraté        |
| --------------- | ------------------ | ------------------------ | -------------------- |
| 2095            | Actant             | `getActants()`           | `actant`             |
| 2097            | Concept            | `getKeywords()`          | `concepts`           |
| 386             | Agent/Personne     | `getPersonnes()`         | `personne`           |
| 581             | Contributeur       | `getActants()`           | `actants`            |
| 461             | Élément narratif   | `getElementNarratifs()`  | `elementsNarratifs`  |
| 428             | Élément esthétique | `getElementEsthetique()` | `elementsEsthetique` |
| 4               | Annotation         | `getAnnotations()`       | `annotations`        |
| 1606            | Feedback           | `getFeedbacks()`         | `feedbacks`          |

Voir `dependency_mappings.json` pour la liste complète.

---

## ✨ Avantages

- **Cache optimisé** : Une seule requête par session
- **Performance** : Chargement parallèle avec Promise.all
- **Réutilisation** : Les ressources déjà chargées sont réutilisées
- **Type-safe** : TypeScript pour détecter les erreurs
- **Consistance** : Pattern identique pour toutes les fonctions

---

## 📝 Exemples

### Fonction simple (pas d'hydratation)

Voir : `getUniversities()`, `getLaboratories()` - Pas de ressources liées

### Fonction avec hydratation simple

Voir : `getComments()` - Une seule ressource liée (actants)

### Fonction avec hydratation complexe

Voir : `getOeuvres()` - Plusieurs ressources liées (personnes, éléments, annotations)

---

## 🎯 Utilisation

1. Consultez **[GENERATION_GUIDE_TS.md](GENERATION_GUIDE_TS.md)** pour la méthodologie
2. Consultez **[dependency_mappings.json](dependency_mappings.json)** pour les mappings
3. Collez votre JSON et je génère le code TypeScript !

---

**Prêt à générer votre première fonction TypeScript ? Suivez le guide !**
