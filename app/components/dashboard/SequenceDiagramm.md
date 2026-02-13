sequenceDiagram
    autonumber

    actor C as Caissier
    actor S as Superviseur
    actor D as Directeur

    participant UI as Interface CAPOSA
    participant API as Backend API
    participant DB as Base de données

    C->>UI: Saisie des transactions de la journée
    UI->>API: POST /transactions
    API->>DB: INSERT transactions

    C->>UI: Génère rapport journalier
    UI->>API: POST /reports/daily
    API->>DB: INSERT daily_report

    C->>UI: Soumet la journée pour réconciliation
    UI->>API: PATCH /reports/daily/{id}/submit
    API->>DB: UPDATE report.status = "submitted"

    S->>UI: Ouvre module de réconciliation
    UI->>API: GET /reports/daily/{id}/details
    API->>DB: SELECT transactions, cash, agents, bank

    S->>UI: Marque transactions (match / écart / en attente)
    UI->>API: POST /reconciliation/entries
    API->>DB: INSERT reconciliation_entries

    S->>UI: Ajoute notes d’explication
    UI->>API: PATCH /reconciliation/entries/{id}
    API->>DB: UPDATE reconciliation_entries.notes

    S->>UI: Soumet pour validation
    UI->>API: PATCH /reports/daily/{id}/reviewed
    API->>DB: UPDATE report.status = "reviewed"

    D->>UI: Valide la journée
    UI->>API: PATCH /reports/daily/{id}/approve
    API->>DB: UPDATE report.status = "approved"

    API->>DB: LOCK report (verrouillage)
