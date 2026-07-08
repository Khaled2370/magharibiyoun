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

## Étape 2 — Neon, la base de données (~5 min)

1. Créer un compte sur https://neon.tech (bouton « Sign up », possible avec le compte GitHub).
2. « Create project » → nom : `magharibiyoun` → région : **Europe (Frankfurt)** → PostgreSQL 17.
3. Sur le tableau de bord, cliquer « Connect » et copier **deux** adresses :
   - **Pooled connection** (contient `-pooler`) → ce sera `DATABASE_URL`
   - **Direct connection** (sans `-pooler`) → ce sera `DIRECT_URL`
4. Donner ces deux adresses à Claude, qui exécutera depuis la machine locale :

```bash
# crée les tables puis injecte langues, pays, rôles, admin et contenu
npx prisma migrate deploy
npx prisma db seed
```

(avec `DATABASE_URL`/`DIRECT_URL` pointées vers Neon et `ADMIN_PASSWORD` défini
pour choisir le mot de passe admin de production)

## Étape 3 — Vercel, le site (~5 min)

1. Créer un compte sur https://vercel.com/signup → choisir **« Continue with GitHub »** (c'est ce qui relie les deux).
2. « Add New… → Project » → importer le dépôt `magharibiyoun` → framework détecté : Next.js (ne rien changer).
3. Ouvrir « Environment Variables » et ajouter **4 variables** :

| Nom | Valeur |
|---|---|
| `DATABASE_URL` | l'adresse **Pooled** de Neon |
| `DIRECT_URL` | l'adresse **Direct** de Neon |
| `AUTH_SECRET` | une valeur aléatoire unique (fournie par Claude, différente de celle du local) |
| `ADMIN_PASSWORD` | le mot de passe admin choisi (le même que celui utilisé au seed) |

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
