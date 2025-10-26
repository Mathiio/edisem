# 🔄 Workflow Complet - Nouveau Type de Données

**Guide complet pour ajouter un nouveau type de données de A à Z**

Quand vous voulez ajouter un nouveau type de données (ex: "Collection", "Projet", etc.), suivez ce processus en 3 étapes.

---

## 📋 Vue d'ensemble

```
1️⃣ API PHP           → Créer la fonction de récupération des données
2️⃣ TypeScript        → Créer la fonction de réception côté frontend
3️⃣ Page générique    → Créer la configuration de la page
```

**Temps estimé :** 15-30 minutes pour un type simple

---

## 1️⃣ Étape 1 : Créer la fonction API (PHP)

**Dossier :** `plans/generateur_api_php/`

### A. Préparer les données

1. Créez un fichier JSON d'exemple avec vos données :
   ```json
   // example_collections.json
   [
     {
       "id": "12345",
       "title": "Ma Collection",
       "description": "Description...",
       "items": ["item1", "item2"],
       ...
     }
   ]
   ```

2. Annotez les propriétés complexes (voir `example_oeuvres_annotated.json`)

### B. Utiliser le générateur

**Option 1 - Quick Start :**
```
Suivre : plans/generateur_api_php/QUICK_START.md
```

**Option 2 - Utiliser l'IA :**

1. Lisez `GUIDE_UTILISATION_IA.md`
2. Donnez ce prompt à l'IA :

```
J'ai besoin d'une fonction PHP pour récupérer des "Collection".

Voici mon JSON d'exemple :
[coller votre JSON]

Utilise le template dans TEMPLATE_FONCTION.php et les mappings 
dans property_mappings.json pour générer la fonction getCollections().

Instructions : GENERATION_GUIDE.md
```

### C. Résultat attendu

Une fonction dans le backend PHP :
```php
// backend/api/getCollections.php
function getCollections($id = null) {
  // Logique de récupération
  // Enrichissement des relations
  // Retour JSON
}
```

✅ **Checkpoint :** Testez l'API → `/api/getCollections.php`

---

## 2️⃣ Étape 2 : Créer la fonction TypeScript

**Dossier :** `plans/generateur_typescript/`

### A. Utiliser le générateur

**Option 1 - Quick Start :**
```
Suivre : plans/generateur_typescript/QUICK_START.md
```

**Option 2 - Utiliser l'IA :**

1. Lisez `GUIDE_UTILISATION_IA.md`
2. Donnez ce prompt à l'IA :

```
J'ai une fonction API PHP getCollections() qui retourne des collections.

Voici un exemple de retour :
[coller votre JSON]

Génère la fonction TypeScript getCollections() en utilisant :
- Template : TEMPLATE_FONCTION.ts
- Mappings : dependency_mappings.json
- Guide : GENERATION_GUIDE_TS.md

La fonction doit :
1. Appeler l'API
2. Enrichir les relations (si nécessaire)
3. Retourner les données typées
```

### B. Résultat attendu

Une fonction dans `src/services/Items.ts` :

```typescript
export const getCollections = async (id?: number): Promise<Collection[]> => {
  const response = await fetch(`${API_URL}/getCollections.php${id ? `?id=${id}` : ''}`);
  const data = await response.json();
  
  // Enrichissement si nécessaire
  // ...
  
  return data;
};
```

✅ **Checkpoint :** Testez dans la console → `await getCollections()`

---

## 3️⃣ Étape 3 : Créer la page générique

**Dossier :** `src/pages/generic/`

### A. Lire la documentation

```
Suivre : src/pages/generic/README.md
```

### B. Créer la configuration

Créez `src/pages/generic/config/collectionConfig.tsx` :

```typescript
import { GenericDetailPageConfig, FetchResult } from '../config';
import { RecitiaOverviewCard, RecitiaOverviewSkeleton } from '@/components/features/miseEnRecit/RecitiaOverview';
import { RecitiaDetailsCard, RecitiaDetailsSkeleton } from '@/components/features/miseEnRecit/RecitiaDetails';
import { getCollections } from '@/services/Items';
import { createItemsListView } from '../helpers';

export const collectionConfig: GenericDetailPageConfig = {
  // 1. Data fetching
  dataFetcher: async (id: string): Promise<FetchResult> => {
    const data = await getCollections(Number(id));
    
    return {
      itemDetails: data,
      keywords: [], // Si vous avez des keywords
      recommendations: [],
    };
  },

  // 2. Composants UI
  overviewComponent: RecitiaOverviewCard,
  detailsComponent: RecitiaDetailsCard,
  overviewSkeleton: RecitiaOverviewSkeleton,
  detailsSkeleton: RecitiaDetailsSkeleton,

  // 3. Mappers de props
  mapOverviewProps: (collection: any, currentVideoTime: number) => ({
    id: collection.id,
    title: collection.title,
    personnes: collection.creator,
    medias: collection.associatedMedia || [],
    currentTime: currentVideoTime,
    buttonText: 'Voir plus',
  }),

  mapDetailsProps: (collection: any) => ({
    date: collection.date,
    description: collection.description,
  }),

  // 4. Vues - Utiliser les helpers !
  viewOptions: [
    createItemsListView({
      key: 'Items',
      title: 'Items de la collection',
      getItems: (itemDetails) => itemDetails?.items || [],
      emptyMessage: 'Aucun item',
      annotationType: 'Collection Item',
    }),
  ],

  // 5. Options
  showKeywords: true,
  showComments: true,
  showRecommendations: false,
};
```

### C. Ajouter la route

Dans `src/App.tsx` :

```typescript
// 1. Import
import { collectionConfig } from '@/pages/generic/config/collectionConfig';

// 2. Route
<Route 
  path='/corpus/collection/:id' 
  element={<ConfigurableDetailPage config={collectionConfig} />} 
/>
```

✅ **Checkpoint :** Testez la page → `/corpus/collection/12345`

---

## 📊 Checklist complète

### Phase 1 : API PHP ✅
- [ ] JSON d'exemple créé
- [ ] Propriétés complexes annotées
- [ ] Fonction `getXxx()` générée
- [ ] API testée et fonctionnelle

### Phase 2 : TypeScript ✅
- [ ] Fonction `getXxx()` créée dans `Items.ts`
- [ ] Types définis (si nécessaire)
- [ ] Enrichissement des relations (si nécessaire)
- [ ] Fonction testée dans la console

### Phase 3 : Page générique ✅
- [ ] Config `xxxConfig.tsx` créée
- [ ] `dataFetcher` configuré
- [ ] Composants UI choisis
- [ ] Props mappées correctement
- [ ] ViewOptions configurées (avec helpers)
- [ ] Route ajoutée dans `App.tsx`
- [ ] Page testée dans le navigateur

---

## 🎯 Exemple complet : Ajouter "Collection"

### 1. API PHP (5 min)

```bash
cd plans/generateur_api_php/
# Créer example_collections.json
# Utiliser l'IA avec GUIDE_UTILISATION_IA.md
# → Génère getCollections.php
```

### 2. TypeScript (5 min)

```bash
cd plans/generateur_typescript/
# Utiliser l'IA avec GUIDE_UTILISATION_IA.md
# → Ajoute getCollections() dans src/services/Items.ts
```

### 3. Page générique (10 min)

```bash
# Créer src/pages/generic/config/collectionConfig.tsx
# Ajouter route dans src/App.tsx
# Tester !
```

**Total : ~20 minutes** 🚀

---

## 💡 Helpers disponibles (Étape 3)

Pour gagner du temps dans vos `viewOptions` :

### Helpers complets
```typescript
createOeuvreViews()          // 6 vues
createExperimentationViews() // 5 vues
```

### Helpers individuels
```typescript
createScientificReferencesView()
createCulturalReferencesView()
createArchivesView()
createToolsView()
createAnalysisView()
createNarrativeElementsView()
createAestheticElementsView()
createCriticalAnalysisView()
createFeedbacksView()
```

### Helper personnalisé
```typescript
createItemsListView({
  key: 'monItem',
  title: 'Mon Titre',
  getItems: (itemDetails) => itemDetails?.items || [],
  emptyMessage: 'Aucun item',
  annotationType: 'Mon Type',
  mapUrl: (item) => `/mon-path/${item.id}`,
})
```

---

## 🔧 Troubleshooting

### Problème : L'API ne retourne rien
- ✅ Vérifier que le fichier PHP est accessible
- ✅ Vérifier les logs PHP
- ✅ Tester directement `/api/getXxx.php?id=123`

### Problème : TypeScript ne compile pas
- ✅ Vérifier les imports
- ✅ Vérifier que `API_URL` est défini
- ✅ Vérifier les types retournés

### Problème : La page est vide
- ✅ Vérifier que `dataFetcher` retourne bien des données
- ✅ Vérifier les props dans `mapOverviewProps`
- ✅ Vérifier la console pour les erreurs

### Problème : Les viewOptions ne s'affichent pas
- ✅ Vérifier que `getItems()` retourne un tableau
- ✅ Vérifier que les items ont bien un `id`
- ✅ Utiliser les helpers pour éviter les erreurs

---

## 📚 Documentation détaillée

### Pour l'API PHP
- `plans/generateur_api_php/INDEX.md` - Vue d'ensemble
- `plans/generateur_api_php/QUICK_START.md` - Démarrage rapide
- `plans/generateur_api_php/GUIDE_UTILISATION_IA.md` - Guide IA
- `plans/generateur_api_php/GENERATION_GUIDE.md` - Guide complet

### Pour TypeScript
- `plans/generateur_typescript/INDEX.md` - Vue d'ensemble
- `plans/generateur_typescript/QUICK_START.md` - Démarrage rapide
- `plans/generateur_typescript/GUIDE_UTILISATION_IA.md` - Guide IA
- `plans/generateur_typescript/GENERATION_GUIDE_TS.md` - Guide complet

### Pour les pages génériques
- `src/pages/generic/README.md` - Documentation principale
- `src/pages/generic/config/` - Exemples de configs existantes

---

## 🎉 Résultat final

Après avoir suivi ce workflow, vous aurez :

1. ✅ Une API PHP fonctionnelle
2. ✅ Une fonction TypeScript qui récupère les données
3. ✅ Une page générique configurée et testée
4. ✅ Zero duplication de code
5. ✅ Architecture maintenable et scalable

**Un nouveau type de données complet en ~20-30 minutes !** 🚀

---

## 📝 Modèle de prompt IA complet

Pour automatiser tout le processus avec l'IA :

```
Je veux ajouter un nouveau type "Collection" à mon application.

ÉTAPE 1 - API PHP :
Génère la fonction getCollections() en PHP.
Exemple de données : [JSON]
Utilise : plans/generateur_api_php/TEMPLATE_FONCTION.php
Guide : plans/generateur_api_php/GENERATION_GUIDE.md

ÉTAPE 2 - TypeScript :
Génère la fonction getCollections() en TypeScript.
Utilise : plans/generateur_typescript/TEMPLATE_FONCTION.ts
Guide : plans/generateur_typescript/GENERATION_GUIDE_TS.md

ÉTAPE 3 - Config page :
Génère collectionConfig.tsx.
Utilise : src/pages/generic/README.md
Exemples : src/pages/generic/config/*.tsx

Propriétés de Collection :
- id, title, description
- items (array d'IDs)
- creator, date
- associatedMedia

Je veux afficher :
- Overview avec titre, créateur, médias
- Details avec date, description
- Vue "Items" avec la liste des items
```

---

**Créé le :** 2025-10-15  
**Auteur :** Workflow unifié  
**Version :** 1.0

