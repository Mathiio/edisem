# ARCANES EDISEM

Application web pour la plateforme ARCANES - Analyse et visualisation de données pour la recherche en sciences humaines.

---

## 📚 Documentation

### 🚀 Démarrage rapide - Ajouter un nouveau type de données

**Vous voulez ajouter un nouveau type de ressource (Collection, Projet, etc.) ?**

➡️ **Consultez le [Workflow Complet](./plans/WORKFLOW_COMPLET.md)**

Le processus complet (API → TypeScript → Page) prend **20-30 minutes** au lieu de 4-6 heures !

### 📖 Documentation complète

Pour une vue d'ensemble de tous les systèmes de génération automatique :

➡️ **[Guide des Workflows](./plans/README_WORKFLOWS.md)** - Hub central de documentation

### 🔧 Générateurs individuels

- **API PHP :** [plans/generateur_api_php/](./plans/generateur_api_php/)
- **TypeScript :** [plans/generateur_typescript/](./plans/generateur_typescript/)
- **Pages génériques :** [src/pages/generic/](./src/pages/generic/)

---

## 🏗️ Architecture du projet

```
edisem/
├── src/
│   ├── pages/
│   │   └── generic/          → Système de pages génériques (zéro duplication)
│   ├── services/
│   │   └── Items.ts          → Fonctions TypeScript de récupération de données
│   └── components/           → Composants React réutilisables
│
├── plans/
│   ├── WORKFLOW_COMPLET.md   → Guide complet de bout en bout
│   ├── README_WORKFLOWS.md   → Hub de documentation
│   ├── generateur_api_php/   → Générateur de fonctions PHP backend
│   └── generateur_typescript/→ Générateur de fonctions TypeScript frontend
│
└── README.md                 → Ce fichier
```

---

## 🎯 Workflow complet

```
1️⃣ API PHP (5 min)        → Backend récupère les données
2️⃣ TypeScript (5 min)     → Frontend hydrate les données
3️⃣ Page générique (10 min) → UI affiche les données
```

**Temps total : 20-30 minutes** 🚀

---

## 🚀 Installation

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

---

## 📊 Statistiques

- **8 types de pages** déjà configurés (Conference, Oeuvre, Experimentation, etc.)
- **60+ property_id** documentés dans les générateurs
- **87% moins de code dupliqué** grâce au système de pages génériques
- **90-98% de code généré correct** avec les générateurs automatiques

---

## 🔗 Liens rapides

- 📄 [Workflow complet](./plans/WORKFLOW_COMPLET.md) ⭐ **Commencez ici**
- 📚 [Guide des workflows](./plans/README_WORKFLOWS.md)
- 🔵 [Générateur PHP - Quick Start](./plans/generateur_api_php/QUICK_START.md)
- 🟢 [Générateur TypeScript - Quick Start](./plans/generateur_typescript/QUICK_START.md)
- 🎨 [Pages génériques - README](./src/pages/generic/README.md)

---

## 📝 License

© 2025 ARCANES EDISEM - Tous droits réservés
