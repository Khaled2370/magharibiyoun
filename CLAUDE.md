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
Base locale : PostgreSQL `magharibiyoun_db` (voir .env — DATABASE_URL + DIRECT_URL identiques en local).

## Site en ligne
**https://magharibiyoun.vercel.app/** — en production depuis le 2026-07-08 (GitHub → Vercel → Neon, voir DEPLOIEMENT.md). Chaque `git push` sur `main` redéploie automatiquement.

## Performance — région Vercel alignée sur Neon (2026-07-08)
`vercel.json` force les fonctions sur `fra1` (Francfort), même région que Neon. Avant ce fix, les fonctions tournaient par défaut sur `iad1` (Virginie, USA) → chaque requête Prisma payait ~100-150ms de latence transatlantique, multipliée par le nombre de requêtes par page (voir note ci-dessous). Résultat mesuré : accueil 1,8-3,2s → ~350ms ; fiche détail 2,5-3,2s → ~185ms.
**Cause aggravante identifiée (pas encore corrigée, piste d'optimisation future si besoin) :** `detailInclude` dans `src/lib/content.ts` inclut de nombreuses relations via tables de jointure explicites (countries, categories, media, sources, relatedFrom/relatedTo) — Prisma résout probablement chacune en requête SQL séparée plutôt qu'un seul JOIN, soit ~8-10 aller-retours par page de détail. Sans gravité depuis l'alignement de région (chaque aller-retour ne coûte plus que quelques ms), mais à regrouper si le site grossit beaucoup.
Si un jour Neon change de région, mettre à jour `vercel.json` en conséquence.

## Déploiement (voir DEPLOIEMENT.md)
Cible gratuite : **GitHub (repo privé) → Vercel Hobby → Neon Free**. Repo git initialisé (branche main). Réglages prod déjà en place : build webpack standard (dev garde turbopack), `postinstall: prisma generate`, `trustHost: true` (Auth.js), `directUrl` Neon dans schema.prisma, mot de passe admin seedable via `ADMIN_PASSWORD`. Push via HTTPS + Git Credential Manager (gh non installé — installation refusée par UAC). Migrations prod : `npx prisma migrate deploy` + `db seed` lancés depuis la machine locale avec les URLs Neon en variables d'environnement de session (jamais écrites dans .env).

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

## Circuit de contribution + modération (2026-07-10)
Les membres connectés peuvent proposer un article via `/ساهم` (`src/actions/contribute.ts` → `submitContribution`) : crée un `Content` (ARTICLE) + une `ContentTranslation` en `DRAFT` + une `Contribution` (kind NEW_CONTENT, status SUBMITTED). Jamais publié directement.
L'admin voit la file d'attente sur `/admin/contributions` (lien + pastille de compteur depuis `/admin`). Deux actions : **Refuser** (`rejectContribution` dans `admin-content.ts` — status REJECTED + `EditorialReview`) ou **Relire et publier** (renvoie vers le formulaire d'édition existant `/admin/edit/[id]`). Astuce clé : `saveContent` détecte automatiquement, à la sauvegarde, si une traduction passe à PUBLISHED et s'il existe une `Contribution` SUBMITTED/IN_REVIEW liée — si oui, la marque ACCEPTED + crée un `EditorialReview` (APPROVED). Aucune nouvelle table Prisma nécessaire : `Contribution`/`EditorialReview` existaient déjà dans le schéma depuis la conception initiale, jamais câblées avant.
Restriction actuelle : les membres ne peuvent soumettre que des ARTICLE (opinions) — pas encore les autres types de contenu (fiches historiques, initiatives...), choix délibéré pour la première version (contenu le plus adapté à une soumission ouverte).
Testé de bout en bout en local (inscription, soumission, acceptation→publication publique, refus→disparition file+statut visible côté membre) avant chaque déploiement.
**Piège de test :** le navigateur garde la session NextAuth active entre les tests — toujours se déconnecter (bouton خروج sur `/حسابي`) avant de tester un autre rôle (admin ↔ membre), sinon `/تسجيل` ou `/دخول` redirigent silencieusement vers `/حسابي` (session déjà active).

## Upload d'images — prévu, pas encore construit
Décision actée : Cloudinary (gratuit) pour héberger les vraies photos (couvertures actuelles = SVG générées, pas de vraies photos). Reste à faire : Khaled crée un compte Cloudinary gratuit, fournit Cloud Name + API Key/Secret (ou un upload preset "unsigned"), puis intégration (upload direct navigateur → Cloudinary, URL stockée dans `MediaFile`) sur le formulaire admin (`ContentForm`) en priorité, éventuellement sur le formulaire de contribution membre ensuite.

## Navigation par onglets sur les pages liste denses (2026-07-09)
Pattern ajouté sur `/encyclopedia` : `src/components/content/jump-nav.tsx` (composant client) affiche une barre collante (`sticky top-0`) de boutons pilules qui font défiler vers chaque section (`id={s.key}` + `scroll-mt-20` sur chaque `<section>`). **Ne jamais utiliser de simples ancres HTML (`<a href="#id">`) seules pour ce genre de saut** — testé peu fiable avec le routage/hydratation de Next.js App Router (le hash change mais le défilement n'a pas lieu). Toujours passer par un clic géré en JS (`e.preventDefault()` + `element.scrollIntoView({behavior:"smooth"})` + `history.pushState`), avec un `useEffect` au montage qui rejoue le scroll si l'URL arrive déjà avec un `#hash`. `scroll-smooth` ajouté globalement sur le `<html>` dans `[locale]/layout.tsx`. À réutiliser si d'autres pages (mabadarat, etc.) deviennent aussi denses.
**Piège de vérification :** le défilement `behavior: "smooth"` ne s'anime jamais dans l'outil preview_eval de ce harnais (headless) — utiliser `behavior: "instant"` pour vérifier par le code que le bon élément est ciblé, la vraie animation fonctionne normalement dans un vrai navigateur. Autre piège : React insère des commentaires `<!-- -->` entre nœuds de texte adjacents en SSR — un test qui cherche une sous-chaîne exacte du type "texte (12)" dans le HTML brut échouera à tort ; vérifier plutôt avec une regex tolérante ou en extrayant le innerHTML.

## ⚠️ Piège connu : ne JAMAIS lancer `npm run build` pendant que le serveur dev tourne
Les deux partagent le dossier `.next` — le mélange corrompt le serveur dev (erreurs « React Client Manifest » / « vendor-chunks »). Remède : arrêter le dev, `Remove-Item .next -Recurse -Force`, relancer.

## État d'avancement (2026-07-04)
Fondations livrées : scaffold, i18n 3 langues + pathnames localisés (adresses en arabe à la racine, localeDetection désactivée — l'arabe est TOUJOURS la langue de la racine), design tokens, layout header/footer + sélecteur de langue, accueil v1, 7 pages stub, schéma Prisma complet migré + seed (langues/pays/rôles).
Authentification livrée et testée : inscription, connexion, espace membre `/حسابي` (profil, rôles localisés, date d'adhésion format ar-TN, déconnexion), compte admin seedé. Parcours complet vérifié dans le navigateur.
**Socle contenu livré et vérifié (9/9 pages testées, AR+FR)** : contenu de démo seedé (16 contenus / 24 versions linguistiques — fiches réelles : Carthage, Almoravides, Tanger 1958, Ibn Khaldoun, Kahina, Assia Djebar, couscous, Ahellil ; fictifs étiquetés « démo » : 3 articles opinion, réseau universités, festival ciné ; UMA réelle ; 2 podcasts avec vidéos YouTube d'exemple). Pages : accueil vivant (dernières opinions, une de l'encyclopédie, initiative du mois, podcast), hub encyclopédie 3 sections, listes opinions/initiatives/médias, 4 pages de détail avec slugs arabes (`/الموسوعة/قرطاج`), sources numérotées, badges A/B/C, bandeau رأي, embed youtube-nocookie, contenus liés (repli arabe si non traduit). Fichiers clés : `src/lib/content.ts` (requêtes + helpers), `src/components/content/*`, `prisma/demo-content.ts` (seed gardé par un count — pour re-seeder : vider les Content puis `npx prisma db seed`).
Notes : le sélecteur de langue sur une page de détail renvoie vers la liste de la rubrique (les slugs diffèrent par langue) — amélioration future : liens interlangues par fiche (les slugs traduits sont déjà chargés dans detailInclude). Les params `[slug]` arrivent encodés → toujours `decodeURIComponent`.
**Back-office livré et testé de bout en bout (2026-07-04)** : `/الإدارة` réservé aux rôles editor/admin/super_admin (`requireEditor` dans src/lib/authz.ts, anonyme → redirection login, lien Admin dans le header via `canEdit`). Tableau de bord (filtre par type, statut par langue en pastilles ar/fr/en, 200 derniers contenus), création par type (6 types), formulaire complet (`src/components/admin/content-form.tsx` + action serveur `src/actions/admin-content.ts`) : niveaux A/B/C, mis en avant, pays, catégories par module, 3 versions linguistiques (titre/slug auto/résumé/corps/SEO/statut/langue originale), champs par type, sources en textarea (format : auteur | titre | éditeur | année | lien), liens/œuvres/citations en lignes « a | b ». À chaque sauvegarde : ContentVersion créé, traductions non modifiées marquées isOutdated si l'originale change, slugs dédupliqués automatiquement (-2, -3…), revalidatePath global. Suppression avec confirmation (cascade). Testé en réel : création article → publié + visible en accueil → suppression → 404.
Notes back-office : le slugify normalise les hamzas (أ إ آ → ا) — volontaire et souhaitable pour les URL arabes ; les sources sont recréées à chaque sauvegarde (les anciennes lignes Source deviennent orphelines — nettoyage à prévoir un jour) ; en cas d'erreur « aucun titre », le formulaire revient vide (amélioration future : préservation des champs).
**Deuxième lot de contenu sourcé livré (2026-07-09)** : 16 fiches supplémentaires (total ~60 contenus). Histoire : Idrissides (fondation de Fès/Qarawiyyin), Fatimides en Ifriqiya, royaumes post-almohades (Hafsides/Zianides/Mérinides), ibadisme et Tahert. Personnalités : Léon l'Africain, Al-Idrissi, Habib Bourguiba, Kateb Yacine, Idir, Tahar Ben Jelloun. Culture/patrimoine : Tassili n'Ajjer, Jemaa el-Fna, vallée du M'Zab, cités romaines (Volubilis/Djemila/Timgad/Leptis Magna), Tbourida, Tifinagh. Fichiers : demo-history2.ts, demo-personalities2.ts, demo-culture2.ts, demo-crosslinks2.ts (12 liens vers le contenu existant, ex. Idrissides↔Kairouan, Tifinagh↔Imzad/Kahina, sites romains↔Carthage/Numidie). 2 nouvelles couvertures SVG (heritage.svg, equestrian.svg). Vérifié 9/9 en local puis 8/8 en production. **Pattern à réutiliser pour tout futur lot :** créer prisma/demo-XxxN.ts avec `hasArSlug` guard + `createEntry` helper, seeder en local d'abord (`npx prisma db seed`), vérifier via preview, puis répéter le seed avec les env vars Neon en session PowerShell (jamais dans .env) pour propager en production — le code (`git push`) et le contenu (seed manuel) sont deux déploiements séparés et indépendants.

**Contenu encyclopédique sourcé livré (2026-07-06)** : 28 fiches réelles et référencées ajoutées (total ~44 contenus / ~69 versions linguistiques). Histoire : Numidie, Kairouan, Almohades, Andalus-Maghreb, époque ottomane, colonisation, indépendances, émigration. Personnalités : Augustin, Ibn Battuta, Ibn Rochd, émir Abdelkader, Abdelkrim, Tahar Haddad, Fatima Mernissi, Cheikha Remitti. Culture/arts : musique andalouse, raï, gnaoua, malhoun, chaâbi, calligraphie maghrébine, poterie de Sejnane, imzad, architecture, cinéma. + 2 festivals réels (JCC 1966, Gnaoua Essaouira 1998). Sources réelles systématiques (Ibn Khaldoun, Julien, Laroui, Camps, Guettat, Marçais, inscriptions UNESCO avec URL…). Seeds dans prisma/demo-history.ts, demo-personalities.ts, demo-culture.ts (helpers : demo-helpers.ts, demo-covers.ts) — chacun gardé par un slug témoin (hasArSlug).
**Images** : 12 couvertures SVG géométriques maison dans public/images/covers/ (palette du site, licence CC BY-SA, zéro souci de droits), enregistrées comme MediaFile et liées par ContentMedia. Affichage : cartes (content-card) + héro de fiche encyclopédique avec légende/crédit. Vraies photos plus tard via upload Cloudinary (fonctionnalité à construire) ; en attendant, ne JAMAIS hotlinker d'images externes.
**Prochaines étapes prévues :** guichet contribution (soumission par les membres → file de relecture dans l'admin) → SEO (sitemaps/hreflang, generateStaticParams sur les détails) → liens interlangues fiche-à-fiche → module Éducation → recherche.
Note technique : le tab preview revient parfois tout seul à la racine ; faire les parcours de test en un seul preview_eval async (pattern : cliquer lien → poll champ → remplir → soumettre → poll URL). preview_screenshot est capricieux (timeouts fréquents) — vérifier via preview_snapshot + eval.
