# 🍊 Hackathon Orange - SD-WAN Optimization Project

## 🎯 Objectif
Optimisation du remplacement du parc de routeurs SD-WAN (Edge 840 vers Edge 7x0).
Le but est d'analyser la télémétrie réelle du réseau pour proposer une architecture cible économiquement viable et techniquement robuste, plutôt qu'un remplacement "1 pour 1" coûteux.

## 📊 Contexte Business
* **Parc actuel :** 80 sites équipés de Edge 840 (End of Life).
* **Problème :** Sur-dimensionnement potentiel des offres standards.
* **Solution :** Algorithme de décision basé sur la consommation réelle (Throughput, Tunnels, Flows).

## 🛠 Architecture & Stack
* **Backend/IA :** Python (FastAPI/Flask) + Modèle prédictif.
* **Data Analysis :** Pandas, NumPy (Nettoyage et logique métier).
* **Frontend :** Dashboard de visualisation des économies et de l'état du parc.

## 🚀 Installation (Dev)

1. Cloner le repo
2. Créer l'environnement virtuel :
   ```bash
   python -m venv venv
   source venv/bin/activate  # (ou venv\Scripts\activate sur Windows)