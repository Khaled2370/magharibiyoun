# 🚀 Mise en production gratuite — Magharibiyoun

Architecture retenue (100 % gratuite, prévue dans l'étude) :

```
GitHub (code) ──→ Vercel (site web) ──→ Neon (base PostgreSQL)
                        │
                        └── à chaque « git push », Vercel redéploie automatiquement
```

| Service | Rôle | Offre gratuite | Limites à connaître |
|---|---|---|---|
| GitHub | stocke le code (dépôt privé) | illimité | — |
| Vercel | héberge le site Next.js | plan Hobby | usage non commercial, 100 Go de trafic/mois |
| Neon | base PostgreSQL | plan Free | 0,5 Go de données, mise en veille après inactivité (réveil ~1 s) |

Seul coût futur optionnel : le nom de domaine (~15 €/an). En attendant, le site aura une adresse du type `magharibiyoun.vercel.app`.

---

## Étape 1 — GitHub (à faire une fois, ~5 min)

1. Créer un compte sur https://github.com/signup (email + mot de passe).
2. Une fois connecté : bouton « + » en haut à droite → « New repository » →
   - Repository name : `magharibiyoun`
   - Visibilité : **Private**
   - Ne rien cocher d'autre (pas de README, pas de .gitignore) → « Create repository ».
3. Communiquer le nom d'utilisateur GitHub à Claude, qui lancera :

```bash
git remote add origin https://github.com/NOM_UTILISATEUR/magharibiyoun.git
git push -u origin main
```

Au premier envoi, une fenêtre GitHub s'ouvre dans le navigateur pour autoriser
la connexion (Git Credential Manager) — cliquer « Authorize », une seule fois.

## Étape 2 — Neon, la base de données ✅ FAIT (2026-07-08)

Projet Neon créé, tables créées (`prisma migrate deploy`), contenu injecté
(`prisma db seed`) : 43 contenus, 69 versions linguistiques publiées, compte
admin créé. Détails et identifiants transmis à Khaled dans la conversation
(pas stockés dans ce fichier).

**Les migrations de base sont automatiques depuis le 2026-09-04** : le script de
build est `prisma migrate deploy && next build`. À chaque déploiement, Vercel
applique lui-même les migrations en attente sur Neon, avec les identifiants déjà
enregistrés dans ses variables d'environnement. Plus aucune étape manuelle quand
le schéma change. Si une migration échoue, le build échoue **avant** la mise en
ligne : le site en production reste sur l'ancienne version, intact.
`prisma migrate deploy` n'applique que les migrations non encore appliquées — le
relancer est sans effet.

Le **contenu** (seed) reste manuel : c'est une opération volontaire, pas une
conséquence d'un changement de code. Pour relancer un seed plus tard (nouveau
contenu ajouté localement à répercuter en production), depuis la machine locale :

```powershell
$env:DATABASE_URL = "<adresse Pooled Neon>"
$env:DIRECT_URL = "<adresse Direct Neon>"
npx prisma migrate deploy   # si le schema a changé
npx prisma db seed          # le seed est idempotent (guards par slug)
```

## Étape 3 — Vercel, le site (~5 min)

1. Créer un compte sur https://vercel.com/signup → choisir **« Continue with GitHub »** (c'est ce qui relie les deux).
2. « Add New… → Project » → importer le dépôt `magharibiyoun` → framework détecté : Next.js (ne rien changer).
3. Ouvrir « Environment Variables » et ajouter **3 variables** :

| Nom | Valeur |
|---|---|
| `DATABASE_URL` | l'adresse **Pooled** de Neon (celle avec `-pooler`) |
| `DIRECT_URL` | l'adresse **Direct** de Neon (sans `-pooler`) |
| `AUTH_SECRET` | une valeur aléatoire unique (fournie par Claude, différente de celle du local) |

`ADMIN_PASSWORD` n'est pas nécessaire sur Vercel : il ne sert qu'au moment du
seed (déjà fait ci-dessus), jamais lu par le site lui-même une fois le compte
admin créé.

4. Cliquer « Deploy » et attendre ~2 minutes. Le site est en ligne sur `https://magharibiyoun-….vercel.app`.

## Vérifications après mise en ligne

- La racine affiche l'accueil **en arabe** ; `/fr` affiche le français.
- Une fiche s'ouvre avec sa couverture et ses sources : `/الموسوعة/قرطاج`.
- Connexion admin (`admin@magharibiyoun.tn` + le mot de passe de production) → lien « الإدارة » visible.

## Au quotidien ensuite

- Chaque `git push` sur `main` redéploie le site automatiquement (~2 min).
- Le contenu créé dans le back-office est stocké dans Neon : il survit aux redéploiements.
- Pour repartir de zéro côté données : vider les tables dans Neon puis relancer `npx prisma db seed`.

## Sécurité — règles d'or

- Le fichier `.env` n'est **jamais** envoyé sur GitHub (déjà exclu par `.gitignore`).
- `AUTH_SECRET` de production ≠ celui du local ; ne jamais le partager.
- Changer le mot de passe admin par défaut avant d'ouvrir le site à d'autres personnes.
