# 🔍 Audit Complet — Code vs Exigences du Hackathon SD-WAN

## VERDICT GLOBAL : ⚠️ 85% conforme — 3 bugs à corriger, 2 manques importants

---

## ✅ CE QUI EST CONFORME (7/10)

### 1. Rapport EoL / EoS — ✅ PARFAIT
- Table `lifecycle` : 12 modèles, dates exactes vérifiées contre le PDF Arista
- Edge 840 : EoS 29/09/2020, EoL 29/09/2025 → ✅ correspond au PDF
- Edge 680 : EoS 29/07/2022, EoL 29/07/2027 → ✅ correspond (variante Wi-Fi)
- Urgency CRITICAL/HIGH → ✅ correctement classifié

### 2. Specs Edge 7x0 — ✅ PARFAIT
Vérifié ligne par ligne contre `VeloCloud-SD-WAN-Edge-7x0-Series.pdf` :

| Spec | 710 (code) | 710 (PDF) | 720 (code) | 720 (PDF) | 740 (code) | 740 (PDF) |
|---|---|---|---|---|---|---|
| IMIX Mbps | 395 | 395 ✅ | 2300 | 2300 ✅ | 3500 | 3500 ✅ |
| Tunnels | 50 | 50 ✅ | 400 | 400 ✅ | 800 | 800 ✅ |
| Flows/s | 4000 | 4000 ✅ | 18000 | 18000 ✅ | 26000 | 26000 ✅ |
| Concurrent | 225K | 225K ✅ | 440K | 440K ✅ | 900K | 900K ✅ |
| NAT | 225K | 225K ✅ | 440K | 440K ✅ | 900K | 900K ✅ |

### 3. Algorithme de sizing — ✅ 98% exact
- **88/90 edges** correspondent exactement au PDF "edges measured max values"
- 2 écarts sur host-edge840-53 et 54 (voir section bugs)
- Distribution code : 710=71, 720=15, 740=4
- Distribution PDF : 710=73, 720=13, 740=4

### 4. Licence Enterprise — ✅ CORRECT
- Client utilise : 8 profiles, 6 segments, Dynamic B2B, Enhanced Firewall
- Standard : max 4 segments / 4 profiles → ❌ insuffisant
- Enterprise : 128 segments / illimité profiles / Dynamic B2B → ✅
- Premium : ajout Gateway-to-SaaS → client n'en a pas besoin
- **Enterprise est le bon choix**

### 5. Bandwidth Tiers — ✅ CORRECT
- Edge 710 : 10M→500M ✅ (PDF : ✓ de 10M à 500M)
- Edge 720 : 10M→10G ✅ (PDF : ✓ de 10M à 10G)
- Edge 740 : 100M→10G ✅ (PDF : commence bien à 100M)

### 6. Architecture DB/LLM — ✅ SOLIDE
- 8 tables, schéma clair
- LLM Agent avec mémoire adaptative
- Export JSON pour frontend
- 55 tests unitaires

### 7. Calcul d'économies — ✅ CORRECT
- Optimisé : 71×200 + 15×350 + 4×700 = 22 250
- Baseline : 90×700 = 63 000
- Économies : 40 750 (64%) → ✅

---

## 🔴 BUGS À CORRIGER (3)

### BUG 1 — Upgrade Path trop long (IMPORTANT pour la démo)

**Le code dit :**
```
4.2.2 → 4.5.2 → 5.0.x → 5.4.x → 6.1.x → 6.4.x  (5 sauts)
```

**Les Release Notes disent :**
- RN 5.2.3 : *"An Edge can be upgraded directly to Release 5.2.3 from any Release 4.x or later"*
- RN 6.4.0 : *"An Edge can be upgraded directly to Release 6.4.0 from Release 4.5.x or later"*

**Le chemin réel minimal :**
```
4.2.2 → 5.2.3 (LTS) → 6.4.x    (2 sauts seulement)
```
Ou en passant par les LTS pour la sécurité :
```
4.2.2 → 5.2.3 (LTS) → 6.1.x (LTS) → 6.4.x  (3 sauts)
```

**Fichiers à modifier :** `audit_engine.py` (`_UPGRADE_PATHS`) + `populate_db.py` (`UPGRADE_PATHS`)

**Correction proposée :**
```python
_UPGRADE_PATHS = {
    "4.2.2": "4.2.2 -> 5.2.3 (LTS) -> 6.1.x (LTS) -> 6.4.x",
    "5.0":   "5.0.x -> 6.4.x",           # direct (4.5+ accepté par 6.4)
    "5.2":   "5.2.x -> 6.4.x",           # direct
    "5.4":   "5.4.x -> 6.4.x",           # direct
    "6.1":   "6.1.x -> 6.4.x",           # direct
}
```

---

### BUG 2 — Edge 840-53 et 840-54 : SFP mismatch mineur

**Le problème :** Ces 2 sites ont 2 ports SFP utilisés mais un faible débit (24/22 Mbps).
- Le PDF dit → **Edge 710 30M** (l'expert a jugé qu'on peut recâbler en RJ45)
- Le code dit → **Edge 720 50M** (règle stricte : 2 SFP = 720)

**Impact :** mineur (2 edges sur 90), les deux approches sont défendables.
Le jury pourrait poser la question. Suggestion : ajouter un commentaire dans le code expliquant ce choix.

---

### BUG 3 — Edge 840 ne supporte PAS 6.4.x (incohérence dans l'upgrade path)

**Le problème :** Le code donne un upgrade path jusqu'à 6.4.x pour les Edge 840. Mais :
- Edge 840 est EoL depuis 09/2025
- Il ne peut probablement pas tourner au-delà de 5.2.x
- Il sera **remplacé physiquement** par un 7x0 qui tournera en 6.4.x

**L'upgrade path devrait distinguer :**
- **Edge 840 (remplacement HW)** : upgrade SW temporaire à 5.2.3 max → puis remplacement par 7x0 en 6.4.x
- **Edge 680 (upgrade + remplacement ultérieur)** : upgrade direct vers 6.1.x ou 6.4.x possible (EoL 2027)

**Le sujet dit explicitement (slide 11) :**
> *"Priorité aux upgrades SW car rapides dès signature du contrat. Remplacement HW dans un second temps."*

---

## 🟠 MANQUES IMPORTANTS (2)

### MANQUE 1 — Version max par modèle non explicitement requêtable

Le sujet demande (slide 10) :
> *"Avoir un rapport de la version maximum possible pouvant être mise à jour sur le parc"*

La table `software_compatibility` existe mais le LLM n'a pas d'exemple dans son prompt pour répondre à "quelle est la version max pour un Edge 840 ?". Ajouter un exemple SQL dans le SYSTEM_PROMPT :

```sql
SELECT modele, branche_version, supporte FROM software_compatibility 
WHERE modele = 'Edge 840' AND supporte = 'Oui' 
ORDER BY branche_version DESC LIMIT 1;
```

---

## 📋 CHECKLIST COMPLÈTE — Exigences du Sujet

### Slide 10 — Scénarios demandés
| Exigence | Statut | Détail |
|---|---|---|
| Rapport fin de vie / fin de support | ✅ | Table `lifecycle` + `classify_lifecycle()` |
| Version max possible par composant | ⚠️ | Table existe mais pas d'exemple SQL dans le prompt LLM |
| Chemin de version pour être à jour | 🔴 | Chemins trop longs — à corriger |

### Slide 11 — Prérequis techniques
| Exigence | Statut | Détail |
|---|---|---|
| LLM (Grok/Ollama) | ✅ | Ollama + qwen2.5-coder via Open WebUI |
| Résistance aux questions du jury | ⚠️ | Bon système de prompt mais ajouter plus d'exemples |

### Addendum — Optimisation coûts
| Exigence | Statut | Détail |
|---|---|---|
| Niveau de services (Standard/Enterprise/Premium) | ✅ | Enterprise, bien justifié |
| Modèle le moins cher adapté | ✅ | Algorithme de sizing basé sur mesures réelles |
| Niveau de débits à souscrire | ✅ | `determine_bandwidth_tier()` |
| Estimation économie vs tout 740 | ✅ | 22 250 vs 63 000 = 64% |


### Points de vigilance (slide 11)
| Exigence | Statut | Détail |
|---|---|---|
| Matrices de compatibilité VCO/GW/Edges | ✅ | Table `software_compatibility` |
| Notices EoL SW et HW | ✅ | Table `lifecycle` + données EoS software dans prompt |
| Séquencement VCO → GW → Edges | ✅ | Documenté dans `upgrade_paths.notes_ordre` |

---

## 🎯 ACTIONS PRIORITAIRES (par ordre)

1. **🔴 Corriger les upgrade paths** — 15 min — Impact démo élevé
2. **🟠 Distinguer upgrade SW (Edge 840 max 5.2.3) vs remplacement HW (7x0 en 6.4.x)** — 30 min
3. **🟠 Ajouter exemples SQL "version max" dans le prompt LLM** — 10 min
4. **🟡 Documenter le choix SFP pour les 2 edges litigieux** — 5 min
