# 4. Panne de serveur — ce que tu dis au jury
C'est différent d'une panne de courant. Ici le problème c'est la perte de données en transit.
Ta réponse structurée :

"On distingue deux cas. Une panne côté client — panne de courant au guichet — est gérée par les transactions atomiques : rien n'est à moitié enregistré. Une panne côté serveur est gérée par les sauvegardes automatiques de la base de données et les logs de transactions PostgreSQL — le WAL — qui permettent de rejouer les opérations jusqu'au moment exact de la panne."

Le WAL (Write-Ahead Log) — c'est le mot technique qui impressionne :

PostgreSQL écrit chaque opération dans un journal avant de la confirmer
En cas de crash serveur, PostgreSQL se répare lui-même au redémarrage
Tu n'as rien à coder — c'est natif à PostgreSQL

## "CAPOSA protège les données à trois niveaux :
 l'atomicité des transactions, 
 la traçabilité complète de chaque opération, et la résilience native de PostgreSQL en cas de panne serveur."