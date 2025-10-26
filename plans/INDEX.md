# 📑 Index - Documentation des Workflows

**Navigation rapide vers toute la documentation**

---

## 🎯 Par où commencer ?

### 🟢 Vous êtes nouveau ?

1. **Lisez :** [README_WORKFLOWS.md](./README_WORKFLOWS.md) - Vue d'ensemble complète
2. **Suivez :** [WORKFLOW_COMPLET.md](./WORKFLOW_COMPLET.md) - Guide pas à pas
3. **Testez :** Créez votre premier type de données !

### 🟡 Vous connaissez les bases ?

**Accès rapide aux générateurs :**

- [Générateur PHP - QUICK_START](./generateur_api_php/QUICK_START.md)
- [Générateur TypeScript - QUICK_START](./generateur_typescript/QUICK_START.md)
- [Pages génériques - README](../src/pages/generic/README.md)

### 🔴 Vous cherchez un détail précis ?

**Documentation détaillée :**

- [Générateur PHP - GENERATION_GUIDE](./generateur_api_php/GENERATION_GUIDE.md)
- [Générateur TypeScript - GENERATION_GUIDE_TS](./generateur_typescript/GENERATION_GUIDE_TS.md)
- [Générateur PHP - property_mappings.json](./generateur_api_php/property_mappings.json)
- [Générateur TypeScript - dependency_mappings.json](./generateur_typescript/dependency_mappings.json)

---

## 📂 Structure de la documentation

```
plans/
├── INDEX.md (ce fichier)        → Navigation rapide
├── README_WORKFLOWS.md          → Hub central de documentation
├── WORKFLOW_COMPLET.md          → Guide pas à pas complet
├── README.md                    → Vue d'ensemble des générateurs
│
├── generateur_api_php/
│   ├── README.md                → Vue d'ensemble PHP
│   ├── QUICK_START.md           → Démarrage rapide
│   ├── GUIDE_UTILISATION_IA.md  → Utiliser avec une IA
│   ├── GENERATION_GUIDE.md      → Guide complet et détaillé
│   ├── INDEX.md                 → Table des matières PHP
│   ├── TEMPLATE_FONCTION.php    → Template réutilisable
│   ├── property_mappings.json   → 40+ property_id documentés
│   ├── example_actants_annotated.json
│   └── example_oeuvres_annotated.json
│
└── generateur_typescript/
    ├── README.md                → Vue d'ensemble TypeScript
    ├── QUICK_START.md           → Démarrage rapide
    ├── GUIDE_UTILISATION_IA.md  → Utiliser avec une IA
    ├── GENERATION_GUIDE_TS.md   → Guide complet et détaillé
    ├── INDEX.md                 → Table des matières TypeScript
    ├── TEMPLATE_FONCTION.ts     → Template réutilisable
    ├── dependency_mappings.json → Mappings des dépendances
    ├── example_oeuvres_ts_annotated.ts
    └── example_comments_ts_annotated.ts
```

---

## 📚 Documents principaux

### 🌟 Hub central

**[README_WORKFLOWS.md](./README_WORKFLOWS.md)**

- Vue d'ensemble complète des 3 systèmes
- Architecture et flux de données
- Guides d'apprentissage par niveau
- Statistiques et métriques
- Troubleshooting complet

### 🚀 Guide pratique

**[WORKFLOW_COMPLET.md](./WORKFLOW_COMPLET.md)**

- Processus étape par étape
- Exemples concrets
- Checklist complète
- Modèle de prompt IA
- Helpers disponibles

### 📋 Vue d'ensemble technique

**[README.md](./README.md)**

- Comparaison des générateurs
- Flux de données technique
- Exemples disponibles
- Statistiques du système

---

## 🎯 Par cas d'usage

### Je veux ajouter un nouveau type de données

➡️ [WORKFLOW_COMPLET.md](./WORKFLOW_COMPLET.md)

### Je veux comprendre le système complet

➡️ [README_WORKFLOWS.md](./README_WORKFLOWS.md)

### Je veux générer une fonction PHP

➡️ [generateur_api_php/QUICK_START.md](./generateur_api_php/QUICK_START.md)

### Je veux générer une fonction TypeScript

➡️ [generateur_typescript/QUICK_START.md](./generateur_typescript/QUICK_START.md)

### Je veux créer une page générique

➡️ [../src/pages/generic/README.md](../src/pages/generic/README.md)

### Je veux utiliser une IA pour générer du code

➡️ [generateur_api_php/GUIDE_UTILISATION_IA.md](./generateur_api_php/GUIDE_UTILISATION_IA.md)  
➡️ [generateur_typescript/GUIDE_UTILISATION_IA.md](./generateur_typescript/GUIDE_UTILISATION_IA.md)

### Je cherche des exemples

➡️ [generateur*api_php/example*\*.json](./generateur_api_php/)  
➡️ [generateur*typescript/example*\*.ts](./generateur_typescript/)  
➡️ [../src/pages/generic/config/](../src/pages/generic/config/)

### J'ai un problème / une erreur

➡️ [README_WORKFLOWS.md - Section Troubleshooting](./README_WORKFLOWS.md#troubleshooting)  
➡️ [WORKFLOW_COMPLET.md - Section Troubleshooting](./WORKFLOW_COMPLET.md#troubleshooting)

---

## 📊 Temps de lecture estimé

| Document                   | Temps     | Niveau        |
| -------------------------- | --------- | ------------- |
| README_WORKFLOWS.md        | 15-20 min | Débutant      |
| WORKFLOW_COMPLET.md        | 10-15 min | Débutant      |
| README.md                  | 5-10 min  | Tous niveaux  |
| QUICK_START.md (PHP ou TS) | 3-5 min   | Débutant      |
| GUIDE_UTILISATION_IA.md    | 5-8 min   | Intermédiaire |
| GENERATION_GUIDE.md        | 20-30 min | Avancé        |
| GENERATION_GUIDE_TS.md     | 20-30 min | Avancé        |

---

## 🔗 Navigation externe

### Depuis la racine du projet

- [README principal](../README.md) → Point d'entrée du projet

### Vers le code source

- [Pages génériques](../src/pages/generic/) → Système de pages génériques
- [Configs existantes](../src/pages/generic/config/) → 8 exemples de configurations
- [Services TypeScript](../src/services/Items.ts) → Fonctions de récupération de données

---

## ✅ Checklist de lecture recommandée

### Pour commencer (30-45 minutes)

- [ ] Lire README_WORKFLOWS.md (15-20 min)
- [ ] Lire WORKFLOW_COMPLET.md (10-15 min)
- [ ] Parcourir un exemple de config (5-10 min)

### Pour approfondir (1-2 heures)

- [ ] Lire GENERATION_GUIDE.md (20-30 min)
- [ ] Lire GENERATION_GUIDE_TS.md (20-30 min)
- [ ] Analyser les exemples annotés (20-30 min)

### Pour maîtriser (2-4 heures)

- [ ] Créer un nouveau type de données complet
- [ ] Contribuer aux mappings
- [ ] Optimiser les helpers

---

## 🎉 Résultat

Après avoir parcouru cette documentation, vous serez capable de :

✅ Créer un nouveau type de données en 20-30 minutes  
✅ Comprendre l'architecture complète du système  
✅ Générer du code avec 90-98% de réussite  
✅ Maintenir et faire évoluer le système

---

**Bonne lecture ! 📚**

**Créé le :** 2025-10-15  
**Version :** 1.0
