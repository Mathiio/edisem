# DynamicBreadcrumbs

Composant de fil d'Ariane (breadcrumbs) dynamique qui s'adapte automatiquement à la route actuelle.

## Utilisation

### Usage basique

Le composant détecte automatiquement la route et génère les breadcrumbs appropriés :

```tsx
import { DynamicBreadcrumbs } from '@/components/layout/DynamicBreadcrumbs';

function MyPage() {
  return (
    <div>
      <DynamicBreadcrumbs />
      {/* Reste du contenu */}
    </div>
  );
}
```

### Avec titre personnalisé

Passez le titre de l'item actuel pour un breadcrumb plus précis :

```tsx
<DynamicBreadcrumbs itemTitle={conference?.titre} />
```

### Personnalisation du style

```tsx
<DynamicBreadcrumbs
  itemTitle='Ma Conférence'
  underline='always' // 'none' | 'hover' | 'always' | 'active' | 'focus'
  className='my-4'
/>
```

## Exemples de rendu

### `/corpus/seminaires/conference/123`

```
Accueil > Séminaires > Titre de la conférence
```

### `/corpus/recitsArtistiques`

```
Accueil > Œuvres
```

### `/corpus/mise-en-recit/456`

```
Accueil > Mise en récits > Titre de la mise en récit
```

## Props

| Prop        | Type                                                   | Default     | Description                                                    |
| ----------- | ------------------------------------------------------ | ----------- | -------------------------------------------------------------- |
| `itemTitle` | `string`                                               | `undefined` | Titre optionnel de l'item actuel (remplace le label générique) |
| `underline` | `'none' \| 'hover' \| 'always' \| 'active' \| 'focus'` | `'hover'`   | Style de soulignement des liens                                |
| `className` | `string`                                               | `''`        | Classes CSS personnalisées                                     |

## Routes supportées

Le composant supporte automatiquement toutes les routes de l'application :

- **Corpus**

  - Séminaires (avec conférences)
  - Colloques (avec conférences)
  - Journées d'études (avec conférences)
  - Pratiques narratives
  - Mise en récits
  - Expérimentations
  - Œuvres (avec genres)
  - Éléments narratifs
  - Éléments esthétiques
  - Analyses critiques
  - Objets technologiques
  - Outils
  - Documentation scientifique

- **Autres sections**
  - Intervenants
  - Visualisation
  - Base de données
  - Recherche
  - Feedbacks

## Notes

- Le composant ne s'affiche pas sur la page d'accueil (`/`)
- Les liens sont automatiquement générés pour les niveaux parents
- Le dernier élément du breadcrumb n'est pas cliquable (item actuel)
- Le breadcrumb "Corpus" n'est pas affiché car il ne correspond pas à une page existante
