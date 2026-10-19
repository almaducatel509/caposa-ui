Ne pas deviner à partir de la liste des fichiers, comme je l'ai fait au début, et de **demander directement à Django**. Après chaque `git pull` côté backend, suis cette petite routine :

**1. Regarder si de nouveaux paquets sont demandés**

Si `requirements.txt` apparaît dans la liste du pull, installe d'abord les dépendances. Sinon, Django risque de planter au démarrage.

```bash
pip install -r requirements.txt
```

**2. Demander à Django s'il y a des migrations à appliquer**

C'est l'étape clé. Elle détecte tout : vos propres migrations, mais aussi celles des librairies ajoutées dans `settings.py`, comme aujourd'hui.

```bash
python manage.py migrate --plan
```

- « No planned migration operations » : rien à faire.
- Une liste de migrations : lance `python manage.py migrate`.

**3. Vérifier qu'aucun modèle n'a été modifié sans sa migration**

Ça arrive quand quelqu'un oublie de pousser son fichier de migration.

```bash
python manage.py makemigrations --check --dry-run
```

« No changes detected » veut dire que tout va bien. Si la commande liste des changements, **ne crée pas toi-même les migrations** : préviens CS, sinon vous risquez d'avoir deux migrations en conflit.

**4. Lancer les tests**

```bash
python manage.py test
```

**Les signes à repérer dans la liste du pull**

| Fichier modifié | Ce qu'il faut faire |
|---|---|
| `requirements.txt` | `pip install -r requirements.txt` |
| `models.py` ou dossier `migrations/` | `migrate` |
| `settings.py` | `migrate --plan`, car une app a peut-être été ajoutée |
| `.env.example` | Ajouter les nouvelles variables dans ton `.env` |
| `views.py`, `serializers.py`, `permissions.py` | Rien côté base; vérifier l'impact sur le frontend |

Lance toutes ces commandes depuis le dossier qui contient `manage.py` (`caposa-api\api`), avec ton environnement `(.env)` activé.

Si tu veux aller plus vite, tu peux enchaîner les étapes 1 à 3 en une seule ligne :

```bash
pip install -r requirements.txt && python manage.py migrate && python manage.py makemigrations --check --dry-run
```