# مغاربيون — Magharibiyoun · Guide Claude Code

## Contexte
Plateforme encyclopédique, média et communautaire du Grand Maghreb (5 pays + diaspora).
**Khaled n'est pas développeur** : toujours expliquer en langage simple, en français.
Toujours annoncer ce qu'on va modifier et pourquoi avant de le faire.

## Identité — règles non négociables
- **L'arabe est la langue principale** : à la racine des URL (sans préfixe), interface RTL native.
- Français = `/fr`, anglais = `/en` (préfixés). Adresses traduites par langue (pathnames next-intl).
- **L'amazigh est une langue de contenu, pas d'interface** (champs `contentLanguage`, `amazighVariant`, `script`).
- **Les vidéos ne sont jamais hébergées** : YouTube (chaîne officielle) intégré via lien externe.
- **Outils 100 % gratuits uniquement** (contrainte forte de Khaled). Cible déploiement : Vercel Hobby + Neon free + Cloudinary free + Brevo free.
- Étiquette « Opinion » obligatoire sur les articles d'opinion ; sources requises pour l'encyclopédique.
- Pas de commentaires publics ni forum avant la phase 7 (la table Comment existe mais reste désactivée).

## Lancement
```bash
npm run dev          # → http://localhost:3009 (port 3009 : convention Khaled — makina=3007, portage=3008)
npx prisma migrate dev   # migrations base de données
npx prisma db seed       # langues, pays, rôles
```
Base locale : PostgreSQL `magharibiyoun_db` (voir .env).

## Stack
Next.js 15 (App Router, Turbopack) · TypeScript · Tailwind v4 · next-intl v4 (`localePrefix: "as-needed"`, defaultLocale `ar`) · Prisma 6 + PostgreSQL · lucide-react. Auth.js prévu (pas encore installé).

## Design system (maquettes validées par Khaled)
- Tokens (globals.css, `@theme`) : `sable #FAF6EF` (fond), `encre #16243D` (texte/bandeaux), `majorelle #4A5FC1` (liens/actions), `terracotta #C05B33` (CTA + badge Opinion), `oasis #2F6B4F` (badges vérifié), `ligne #E5DECC` (bordures), `mutedink #5A6272`.
- Polices : Noto Kufi Arabic (titres ar + logo), Noto Naskh Arabic (corps ar), Noto Sans (latin). Chiffres occidentaux (0-9) partout, y compris en arabe.
- RTL d'abord : utiliser les utilitaires logiques (ms-, me-, ps-, pe-, text-start/end), jamais ml-/mr- codés en dur.

## Modèle de données (prisma/schema.prisma)
Socle générique : `Content` (fiche mère, type enum) + `ContentTranslation` (une ligne par langue : titre, slug, corps, statut de publication PAR langue, isOutdated) + tables de détail par type (ArticleDetail, InitiativeDetail, HistoricalDetail, PersonalityDetail, CulturalDetail, MediaItemDetail, EducationalDetail…) + taxonomies (Country, Category par module, Tag) + Source (obligatoire pour l'encyclopédique) + workflow (Contribution, EditorialReview) + modération (ModerationReport, ModerationAction, RightOfReplyRequest) + communauté (Follow, Favorite, Badge, Notification, NewsletterSubscriber).
Niveaux de fiabilité : ValidationLevel NONE (opinions) / COMMUNITY (C) / VERIFIED (B) / ACADEMIC (A).

## Règles importantes
1. Ne jamais modifier les tables sans migration Prisma (`npx prisma migrate dev --name description`).
2. Tout texte d'interface passe par messages/ar.json + fr.json + en.json (jamais de texte en dur).
3. L'arabe est la source ; ne jamais laisser une clé manquante dans ar.json.
4. Tester avec `npm run dev` après toute modification backend.

## Comptes de test
| Rôle | Email | Mot de passe |
|------|-------|-------------|
| Super admin | admin@magharibiyoun.tn | MagharibAdmin2026! |

## Authentification (Auth.js v5)
- Config dans `src/auth.ts` (Credentials + bcryptjs, sessions JWT), routes API `src/app/api/auth/[...nextauth]/route.ts`.
- Pages : `/دخول` (login), `/تسجيل` (register), `/حسابي` (account) — pathnames localisés dans routing.ts.
- L'inscription crée automatiquement le rôle `member` ; les rôles sont dans le token JWT (`session.user.roles`).
- Header session-aware (server component avec `auth()`).
- AUTH_SECRET dans .env (généré aléatoirement, jamais commité).

## ⚠️ Piège connu : ne JAMAIS lancer `npm run build` pendant que le serveur dev tourne
Les deux partagent le dossier `.next` — le mélange corrompt le serveur dev (erreurs « React Client Manifest » / « vendor-chunks »). Remède : arrêter le dev, `Remove-Item .next -Recurse -Force`, relancer.

## État d'avancement (2026-07-04)
Fondations livrées : scaffold, i18n 3 langues + pathnames localisés (adresses en arabe à la racine, localeDetection désactivée — l'arabe est TOUJOURS la langue de la racine), design tokens, layout header/footer + sélecteur de langue, accueil v1, 7 pages stub, schéma Prisma complet migré + seed (langues/pays/rôles).
Authentification livrée et testée : inscription, connexion, espace membre `/حسابي` (profil, rôles localisés, date d'adhésion format ar-TN, déconnexion), compte admin seedé. Parcours complet vérifié dans le navigateur.
**Socle contenu livré et vérifié (9/9 pages testées, AR+FR)** : contenu de démo seedé (16 contenus / 24 versions linguistiques — fiches réelles : Carthage, Almoravides, Tanger 1958, Ibn Khaldoun, Kahina, Assia Djebar, couscous, Ahellil ; fictifs étiquetés « démo » : 3 articles opinion, réseau universités, festival ciné ; UMA réelle ; 2 podcasts avec vidéos YouTube d'exemple). Pages : accueil vivant (dernières opinions, une de l'encyclopédie, initiative du mois, podcast), hub encyclopédie 3 sections, listes opinions/initiatives/médias, 4 pages de détail avec slugs arabes (`/الموسوعة/قرطاج`), sources numérotées, badges A/B/C, bandeau رأي, embed youtube-nocookie, contenus liés (repli arabe si non traduit). Fichiers clés : `src/lib/content.ts` (requêtes + helpers), `src/components/content/*`, `prisma/demo-content.ts` (seed gardé par un count — pour re-seeder : vider les Content puis `npx prisma db seed`).
Notes : le sélecteur de langue sur une page de détail renvoie vers la liste de la rubrique (les slugs diffèrent par langue) — amélioration future : liens interlangues par fiche (les slugs traduits sont déjà chargés dans detailInclude). Les params `[slug]` arrivent encodés → toujours `decodeURIComponent`.
**Back-office livré et testé de bout en bout (2026-07-04)** : `/الإدارة` réservé aux rôles editor/admin/super_admin (`requireEditor` dans src/lib/authz.ts, anonyme → redirection login, lien Admin dans le header via `canEdit`). Tableau de bord (filtre par type, statut par langue en pastilles ar/fr/en, 200 derniers contenus), création par type (6 types), formulaire complet (`src/components/admin/content-form.tsx` + action serveur `src/actions/admin-content.ts`) : niveaux A/B/C, mis en avant, pays, catégories par module, 3 versions linguistiques (titre/slug auto/résumé/corps/SEO/statut/langue originale), champs par type, sources en textarea (format : auteur | titre | éditeur | année | lien), liens/œuvres/citations en lignes « a | b ». À chaque sauvegarde : ContentVersion créé, traductions non modifiées marquées isOutdated si l'originale change, slugs dédupliqués automatiquement (-2, -3…), revalidatePath global. Suppression avec confirmation (cascade). Testé en réel : création article → publié + visible en accueil → suppression → 404.
Notes back-office : le slugify normalise les hamzas (أ إ آ → ا) — volontaire et souhaitable pour les URL arabes ; les sources sont recréées à chaque sauvegarde (les anciennes lignes Source deviennent orphelines — nettoyage à prévoir un jour) ; en cas d'erreur « aucun titre », le formulaire revient vide (amélioration future : préservation des champs).
**Contenu encyclopédique sourcé livré (2026-07-06)** : 28 fiches réelles et référencées ajoutées (total ~44 contenus / ~69 versions linguistiques). Histoire : Numidie, Kairouan, Almohades, Andalus-Maghreb, époque ottomane, colonisation, indépendances, émigration. Personnalités : Augustin, Ibn Battuta, Ibn Rochd, émir Abdelkader, Abdelkrim, Tahar Haddad, Fatima Mernissi, Cheikha Remitti. Culture/arts : musique andalouse, raï, gnaoua, malhoun, chaâbi, calligraphie maghrébine, poterie de Sejnane, imzad, architecture, cinéma. + 2 festivals réels (JCC 1966, Gnaoua Essaouira 1998). Sources réelles systématiques (Ibn Khaldoun, Julien, Laroui, Camps, Guettat, Marçais, inscriptions UNESCO avec URL…). Seeds dans prisma/demo-history.ts, demo-personalities.ts, demo-culture.ts (helpers : demo-helpers.ts, demo-covers.ts) — chacun gardé par un slug témoin (hasArSlug).
**Images** : 12 couvertures SVG géométriques maison dans public/images/covers/ (palette du site, licence CC BY-SA, zéro souci de droits), enregistrées comme MediaFile et liées par ContentMedia. Affichage : cartes (content-card) + héro de fiche encyclopédique avec légende/crédit. Vraies photos plus tard via upload Cloudinary (fonctionnalité à construire) ; en attendant, ne JAMAIS hotlinker d'images externes.
**Prochaines étapes prévues :** guichet contribution (soumission par les membres → file de relecture dans l'admin) → SEO (sitemaps/hreflang, generateStaticParams sur les détails) → liens interlangues fiche-à-fiche → module Éducation → recherche.
Note technique : le tab preview revient parfois tout seul à la racine ; faire les parcours de test en un seul preview_eval async (pattern : cliquer lien → poll champ → remplir → soumettre → poll URL). preview_screenshot est capricieux (timeouts fréquents) — vérifier via preview_snapshot + eval.
