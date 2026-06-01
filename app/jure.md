"Dans CAPOSA, toute transaction est liée à une session active. En cas de panne, la session est automatiquement marquée comme interrompue. Les transactions complétées avant la panne sont conservées. Celles qui étaient en cours sont annulées. À la reprise, le caissier ouvre une nouvelle session et resaisit uniquement ce qui n'a pas été confirmé."
Si le jury demande comment on détecte la panne

"On utilise un timestamp de dernière activité sur la session. Un processus backend vérifie périodiquement les sessions inactives depuis trop longtemps et les marque comme interrompues automatiquement."