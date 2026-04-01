# Dans chaque serializer ou signal Django, 
# créer l'archive automatiquement :

# archives/signals.py  ou  archives/utils.py

ARCHIVE_MAPPING = {

    # ── SESSIONS ──────────────────────────────────────────────────
    'session_open':              ('Opérationnel',  'Session caisse',          'Ouverture de session'),
    'session_close':             ('Opérationnel',  'Session caisse',          'Fermeture de session'),
    'session_force_close':       ('Opérationnel',  'Session caisse',          'Fermeture forcée par admin'),

    # ── CAISSE ────────────────────────────────────────────────────
    'caisse_create':             ('Administratif', 'Gestion caisse',          'Enregistrement d\'une nouvelle caisse'),
    'caisse_update':             ('Administratif', 'Gestion caisse',          'Modification d\'une caisse'),
    'caisse_deactivate':         ('Administratif', 'Gestion caisse',          'Désactivation d\'une caisse'),
    'caisse_restore':            ('Administratif', 'Gestion caisse',          'Restauration d\'une caisse archivée'),

    # ── TRANSACTIONS ──────────────────────────────────────────────
    'deposit':                   ('Opérationnel',  'Transaction journalière', 'Dépôt effectué'),
    'withdrawal':                ('Opérationnel',  'Transaction journalière', 'Retrait effectué'),
    'transfer':                  ('Opérationnel',  'Transaction journalière', 'Transfert effectué'),
    'remise':                    ('Opérationnel',  'Remise de caisse',        'Remise au responsable trésorerie'),
    'reconciliation':            ('Opérationnel',  'Réconciliation de caisse','Réconciliation effectuée'),
    'cloture_journee':           ('Réglementaire', 'Clôture journalière',     'Clôture de fin de journée'),

    # ── PRÊTS ─────────────────────────────────────────────────────
    'loan_request':              ('Opérationnel',  'Prêt',                    'Demande de prêt soumise'),
    'loan_approved':             ('Opérationnel',  'Prêt',                    'Prêt approuvé'),
    'loan_rejected':             ('Opérationnel',  'Prêt',                    'Prêt rejeté'),
    'loan_disbursed':            ('Opérationnel',  'Prêt',                    'Décaissement de prêt'),
    'loan_payment':              ('Opérationnel',  'Prêt',                    'Remboursement de prêt'),
    'loan_closed':               ('Opérationnel',  'Prêt',                    'Prêt soldé et clôturé'),
    'loan_defaulted':            ('Réglementaire', 'Prêt',                    'Prêt en défaut de paiement'),

    # ── TRÉSORERIE ────────────────────────────────────────────────
    'treasury_cash_in':          ('Opérationnel',  'Trésorerie',              'Entrée de fonds — Encaisse'),
    'treasury_cash_out':         ('Opérationnel',  'Trésorerie',              'Sortie de fonds — Encaisse'),
    'treasury_vault_deposit':    ('Opérationnel',  'Trésorerie',              'Dépôt au coffre'),
    'treasury_vault_withdrawal': ('Opérationnel',  'Trésorerie',              'Retrait du coffre'),
    'treasury_reconciliation':   ('Réglementaire', 'Réconciliation trésorerie','Réconciliation trésorerie effectuée'),

    # ── RAPPORTS ──────────────────────────────────────────────────
    'rapport_liquidite':         ('Réglementaire', 'Rapport de liquidité',    'Rapport de liquidité généré'),
    'rapport_solvabilite':       ('Réglementaire', 'Rapport de solvabilité',  'Rapport de solvabilité généré'),
    'rapport_caisse':            ('Réglementaire', 'Rapport de caisse',       'Rapport de caisse journalier'),
    'rapport_transactions':      ('Réglementaire', 'Rapport de transactions', 'Export des transactions'),
    'rapport_prets':             ('Réglementaire', 'Rapport de prêts',        'Rapport portefeuille prêts'),
    'rapport_performance':       ('Réglementaire', 'Rapport de performance',  'Rapport de performance agence'),

    # ── ANALYSE & KPIs ────────────────────────────────────────────
    'kpi_snapshot':              ('Réglementaire', 'Analyse',                 'Snapshot KPIs généré automatiquement'),

    # ── COMPTES (membres) ─────────────────────────────────────────
    'account_create':            ('Administratif', 'Gestion compte',          'Ouverture de compte membre'),
    'account_update':            ('Administratif', 'Gestion compte',          'Modification de compte'),
    'account_suspend':           ('Administratif', 'Gestion compte',          'Suspension de compte'),
    'account_close':             ('Réglementaire', 'Gestion compte',          'Clôture de compte membre'),
    'account_reopen':            ('Administratif', 'Gestion compte',          'Réouverture de compte'),

    # ── MEMBRES ───────────────────────────────────────────────────
    'member_create':             ('Administratif', 'Gestion membre',          'Enregistrement d\'un nouveau membre'),
    'member_update':             ('Administratif', 'Gestion membre',          'Modification d\'un profil membre'),
    'member_suspend':            ('Administratif', 'Gestion membre',          'Suspension d\'un membre'),
    'member_delete':             ('Administratif', 'Gestion membre',          'Suppression d\'un membre'),

    # ── EMPLOYÉS ──────────────────────────────────────────────────
    'employee_create':           ('Administratif', 'Gestion employé',         'Création d\'un employé'),
    'employee_update':           ('Administratif', 'Gestion employé',         'Modification d\'un employé'),
    'employee_suspend':          ('Administratif', 'Gestion employé',         'Suspension d\'un employé'),
    'employee_delete':           ('Administratif', 'Gestion employé',         'Suppression d\'un employé'),
    'employee_role_change':      ('Administratif', 'Gestion employé',         'Changement de poste/rôle'),

    # ── HORAIRES ──────────────────────────────────────────────────
    'opening_hour_create':       ('Administratif', 'Horaire',                 'Création d\'un horaire d\'ouverture'),
    'opening_hour_update':       ('Administratif', 'Horaire',                 'Modification d\'un horaire'),
    'opening_hour_delete':       ('Administratif', 'Horaire',                 'Suppression d\'un horaire'),

    # ── BRANCHES ──────────────────────────────────────────────────
    'branch_create':             ('Administratif', 'Branche',                 'Création d\'une agence'),
    'branch_update':             ('Administratif', 'Branche',                 'Modification d\'une agence'),
    'branch_deactivate':         ('Administratif', 'Branche',                 'Désactivation d\'une agence'),

    # ── POSTES ────────────────────────────────────────────────────
    'poste_create':              ('Administratif', 'Poste',                   'Création d\'un poste'),
    'poste_update':              ('Administratif', 'Poste',                   'Modification d\'un poste'),
    'poste_delete':              ('Administratif', 'Poste',                   'Suppression d\'un poste'),

    # ── CALENDRIER / JOURS FÉRIÉS ─────────────────────────────────
    'holiday_create':            ('Administratif', 'Calendrier',              'Ajout d\'un jour férié'),
    'holiday_update':            ('Administratif', 'Calendrier',              'Modification d\'un jour férié'),
    'holiday_delete':            ('Administratif', 'Calendrier',              'Suppression d\'un jour férié'),

    # ── SETTINGS ──────────────────────────────────────────────────
    'settings_bank_update':      ('Administratif', 'Configuration',           'Modification des paramètres bancaires'),
    'settings_cash_update':      ('Administratif', 'Configuration',           'Modification du système de gestion caisse'),
    'settings_general_update':   ('Administratif', 'Configuration',           'Modification des paramètres généraux'),

    # ── SÉCURITÉ (automatique) ────────────────────────────────────
    'login_failed':              ('Administratif', 'Sécurité',                'Tentative de connexion échouée'),
    'login_success':             ('Administratif', 'Sécurité',                'Connexion réussie'),
    'password_change':           ('Administratif', 'Sécurité',                'Changement de mot de passe'),
    'permission_denied':         ('Administratif', 'Sécurité',                'Accès refusé — action non autorisée'),
}

# Exemple dans un signal post_save :
@receiver(post_save, sender=CaisseSession)
def archive_session(sender, instance, created, **kwargs):
    if not created and instance.statut == 'fermée':
        categorie, type_archive = ARCHIVE_MAPPING['session_close']
        Archive.objects.create(
            identifiant=f"ARC_{date}_{sequence}",
            categorie=categorie,
            type=type_archive,
            employe=instance.username,
            resume=f"Session {instance.numero_caisse} fermée",
            reference_id=instance.id,
            reference_model='CaisseSession',
        )
# archives/utils.py

def create_archive(event_type: str, employe: str, reference_id: str,
                   reference_model: str, details: str = ''):
    from datetime import date
    from .models import Archive

    if event_type not in ARCHIVE_MAPPING:
        return  # event non mappé → on ignore

    categorie, type_archive, resume = ARCHIVE_MAPPING[event_type]

    # Séquence auto : ARC_20260401_00001
    today   = date.today().strftime('%Y%m%d')
    count   = Archive.objects.filter(
                  identifiant__startswith=f'ARC_{today}'
              ).count() + 1
    identifiant = f'ARC_{today}_{str(count).zfill(5)}'

    Archive.objects.create(
        identifiant      = identifiant,
        categorie        = categorie,
        type             = type_archive,
        resume           = resume,
        employe          = employe,
        reference_id     = reference_id,
        reference_model  = reference_model,
        details          = details,
    )

# Exemple d'appel dans n'importe quel signal ou serializer :

@receiver(post_save, sender=CaisseSession)
def archive_session(sender, instance, created, **kwargs):
    if created:
        create_archive(
            event_type      = 'session_open',
            employe         = instance.username,
            reference_id    = str(instance.id),
            reference_model = 'CaisseSession',
            details         = f'Caisse {instance.numero_caisse} — Montant : {instance.montant_ouverture} HTG',
        )
    elif instance.statut == 'fermée':
        create_archive(
            event_type      = 'session_close',
            employe         = instance.username,
            reference_id    = str(instance.id),
            reference_model = 'CaisseSession',
            details         = f'Écart : {instance.ecart} HTG — {instance.note_fermeture or ""}',
        )

# Résumé des catégories utilisées :
Opérationnel =>Tout ce qui touche au flux d'argent quotidien
Réglementaire =>Rapports, clôtures, défauts — obligations légales
Administratif =>Paramètres, employés, structure organisationnelle

# Ce que le frontend fait déjà
Clic "Fermer session"  →  POST /sessions/{id}/close/
Clic "Supprimer"       →  DELETE /employees/{id}/
Clic "Approuver prêt"  →  PATCH /loans/{id}/
C'est tout. Le frontend envoie la requête métier normale.

# Ce que Django fait automatiquement derrière
POST /sessions/{id}/close/
    → Django ferme la session
    → Signal post_save déclenché
    → create_archive('session_close', ...)  ← automatique
    → Archive créée dans la DB
# Le frontend ne sait même pas que l'archive a été créée.

# La seule chose que le frontend fait avec les archives
Lire — afficher ce que Django a enregistré.
GET /archives/          →  liste toutes les archives
GET /archives/?categorie=Opérationnel  →  filtrée
Ta page /dashboard/archives fait déjà ça. C'est son seul rôle.