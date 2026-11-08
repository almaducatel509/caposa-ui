# Cash (encaisse) demandes au backend
**Une remise de caisse n'existe pas dans le vide — elle marque le début ou la fin d'une session de travail d'un employé sur un terminal. Sans ce lien, tu ne peux pas répondre à des questions de base comme :

Quel fonds de caisse a été remis pour quelle session ?
L'employé a-t-il bien remis l'argent en fin de session ?
Est-ce que les transactions de la session correspondent au cash remis ?

## 1. Endpoint principal : liste des remises
GET /api/cash-handovers
Paramètres de filtre :

period : day | week | month | year
start_date / end_date (optionnel, override le period)
branch_id
employee_id (optionnel)
min_amount / max_amount
search (nom employé ou référence)
page / limit

Ce que je veux recevoir pour chaque remise :
```json
json{
  "id": "handover_001",
  "session_id": "session_123",
  "type": "closing",
  "amount": 2500.00,
  "created_at": "2026-05-27T09:15:00Z",
  "is_locked": true,
  "notes": "...",
  
  "employee": { "id": "emp_001", "name": "Jean Dupont" },
  "verified_by": { "id": "emp_002", "name": "Marie Tremblay" },
  "received_by": { "id": "emp_003", "name": "Paul Martin" },
  "branch": { "id": "branch_001", "name": "Succursale Hull" },
  "terminal": { "id": "term_01", "name": "Caisse 1" }
}
```
Important : le backend fait les joins (Session → Employee, Terminal, Branch) et me retourne l'objet enrichi. Je ne veux pas faire 4 appels API pour afficher une ligne.

## 2. Endpoint des KPIs (agrégations)
GET /api/cash-handovers/stats?period=week&branch_id=...
Ce que je veux recevoir :
```json
json{
  "total_count": 60,
  "total_amount": 145000.00,
  "average_amount": 2416.67,
  "unique_employees": 6,
  "period": { "start": "...", "end": "..." }
}
```
Pourquoi séparé : les KPIs doivent refléter toute la période, pas juste la page courante. Calculer côté frontend sur les données paginées donne des chiffres faux.

## 3. Endpoint pour les graphiques (séries temporelles)
GET /api/cash-handovers/timeseries?period=week&granularity=day
Ce que je veux recevoir :

```json
json{
  "data": [
    { "label": "Lun 20", "date": "2026-05-20", "count": 12, "amount": 28500.00 },
    { "label": "Mar 21", "date": "2026-05-21", "count": 10, "amount": 24000.00 }
  ]
}
```
Granularité selon le filtre :

day → par heure
week / month → par jour
year → par mois

Résumé de ce que tu dis aux devs

## « Pour la page Encaisse, j'ai besoin de 3 endpoints :
Liste paginée des remises avec les infos employé/branche/terminal déjà jointes (pas de champs dupliqués, tout vient de la Session)
KPIs agrégés sur toute la période sélectionnée (pas seulement la page)
Série temporelle pour les graphiques, avec la granularité adaptée au filtre période

Tous les filtres (période, branche, montants, recherche) sont passés en query params et appliqués côté backend. Le frontend n'agrège rien — il affiche. »