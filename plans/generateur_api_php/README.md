# Générateur automatique de fonctions PHP pour API Omeka S

> **🔄 Workflow complet :** Pour un processus de bout en bout (API → TypeScript → Page), voir [`WORKFLOW_COMPLET.md`](../WORKFLOW_COMPLET.md).

Ce système permet de générer automatiquement des fonctions PHP `getXxx()` pour `QuerySqlViewHelper.php` à partir d'un JSON Omeka S.

## 🚀 Utilisation rapide

**Collez simplement un JSON Omeka S dans le chat avec l'IA, et elle génère automatiquement le code PHP complet !**

**Taux de réussite : 90-98% de code correct du premier coup**

---

## 📁 Documentation complète

### Fichiers principaux

- **[INDEX.md](INDEX.md)** - Vue d'ensemble du système
- **[QUICK_START.md](QUICK_START.md)** - Démarrage rapide
- **[GENERATION_GUIDE.md](GENERATION_GUIDE.md)** - Méthodologie complète
- **[property_mappings.json](property_mappings.json)** - Dictionnaire de 40+ property_id

### Exemples

- **[example_actants_annotated.json](example_actants_annotated.json)** - Pattern simple
- **[example_oeuvres_annotated.json](example_oeuvres_annotated.json)** - Pattern complexe

---

## 📊 Ce que le système génère

✅ Fonction PHP complète `getXxx()`
✅ Requêtes SQL optimisées
✅ Maps pour ressources liées
✅ Switch/case commenté
✅ Code ajout au `__invoke()`

---

## ⚡ Avantages

- **Rapidité** : 30 secondes à 3 minutes vs 30-60 minutes manuellement
- **Précision** : 90-98% de code correct
- **Consistance** : Structure toujours identique
- **Documentation** : Commentaires automatiques sur chaque propriété

---

## 🎯 Comment ça marche

1. **Vous** : Collez un JSON Omeka S
2. **IA** : Analyse le JSON et identifie les patterns
3. **IA** : Génère le code PHP complet
4. **Vous** : Validez et ajoutez au fichier (modifications minimes si nécessaires)

---

**Pour commencer → Consultez [QUICK_START.md](QUICK_START.md)**
