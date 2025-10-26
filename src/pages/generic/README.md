# 📄 Pages Génériques

> **🔄 Workflow complet :** Pour un processus de bout en bout (API → TypeScript → Page), voir [`WORKFLOW_COMPLET.md`](../../../plans/WORKFLOW_COMPLET.md).

Système pour créer des pages de détails (conference, experimentation, oeuvre, etc.) **sans dupliquer le code**.

## 📁 Fichiers

### Composants principaux

- `GenericDetailPage.tsx` - Composant principal qui affiche une page complète
- `ConfigurableDetailPage.tsx` - Wrapper pour utiliser dans les routes
- `config.ts` - Types TypeScript

### Composants réutilisables

- `components.tsx` - ToolItem, ItemsList, SimpleTextBlock, EmptyState
- `helpers.tsx` - Helpers pour créer des viewOptions en 1 ligne

### Configurations (`config/`)

- `config/conferenceConfig.tsx` - Config pour les conférences
- `config/experimentationConfig.tsx` - Config pour les expérimentations
- `config/miseEnRecitConfig.tsx` - Config pour les mises en récit
- `config/oeuvreConfig.tsx` - Config pour les oeuvres

## 🚀 Créer une nouvelle page

### 1. Créer la config

```tsx
// src/pages/generic/config/maConfig.tsx
import { GenericDetailPageConfig } from '../config';
import { createOeuvreViews } from '../helpers';

export const maConfig: GenericDetailPageConfig = {
  dataFetcher: async (id: string) => {
    const data = await fetchMyData(id);
    return {
      itemDetails: data,
      keywords: data.keywords,
    };
  },

  overviewComponent: MyOverviewCard,
  detailsComponent: MyDetailsCard,

  mapOverviewProps: (item, currentVideoTime) => ({
    id: item.id,
    title: item.title,
  }),

  mapDetailsProps: (item) => ({
    date: item.date,
    description: item.description,
  }),

  // ✨ Utiliser les helpers !
  viewOptions: createOeuvreViews(),

  showKeywords: true,
  showComments: true,
};
```

### 2. Utiliser dans App.tsx

```tsx
import { ConfigurableDetailPage } from '@/pages/generic/ConfigurableDetailPage';
import { maConfig } from '@/pages/generic/config/maConfig';

<Route path='/ma-page/:id' element={<ConfigurableDetailPage config={maConfig} />} />;
```

## ✨ Helpers disponibles

**Helpers complets :**

```tsx
createOeuvreViews(); // 6 vues
createExperimentationViews(); // 5 vues
```

**Helpers individuels :**

```tsx
createScientificReferencesView();
createCulturalReferencesView();
createArchivesView();
createToolsView();
createAnalysisView();
createNarrativeElementsView();
createAestheticElementsView();
createCriticalAnalysisView();
createFeedbacksView();
```

**Helper personnalisé :**

```tsx
createItemsListView({
  key: 'maVue',
  title: 'Mes Items',
  getItems: (itemDetails) => itemDetails.mesItems || [],
  emptyMessage: 'Aucun item',
  annotationType: 'Mon Type',
});
```

## 📦 Structure

```
src/pages/generic/
├── GenericDetailPage.tsx      # Composant principal
├── ConfigurableDetailPage.tsx # Wrapper
├── config.ts                  # Types
├── components.tsx             # ToolItem, ItemsList, etc.
├── helpers.tsx                # Helpers viewOptions
├── config/                    # Configurations
│   ├── conferenceConfig.tsx
│   ├── experimentationConfig.tsx
│   ├── miseEnRecitConfig.tsx
│   └── oeuvreConfig.tsx
└── README.md
```

## 🎯 Résultat

**1 config (~150 lignes) = 1 page complète**

- ✅ Zéro duplication
- ✅ ViewOptions en 1 ligne
- ✅ Maintenance ultra-simple
- ✅ Totalement flexible
