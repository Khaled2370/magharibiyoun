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

## Upload d'images — livré (2026-07-11)
Cloudinary intégré : `src/lib/cloudinary.ts` (config + `uploadImage()`, valide type JPEG/PNG/WebP/GIF + taille max 8 Mo, upload en base64 data URI via le SDK officiel `cloudinary`). Câblé dans `saveContent` (admin-content.ts) : un champ fichier `coverImage` dans `ContentForm` (section dédiée avec aperçu de la couverture actuelle) ; si un fichier est fourni, upload serveur → crée un `MediaFile` → remplace l'éventuelle couverture existante (`ContentMedia` sortOrder 0). Si l'upload échoue, le reste du contenu est quand même enregistré (pas de perte), redirection avec `?coverError=1` affichant un message dédié.
Clé/secret Cloudinary **strictement côté serveur** (`.env` local + variables d'environnement Vercel), jamais exposés au navigateur (le composant formulaire ne fait qu'un `<input type="file">` classique, tout le transfert passe par le Server Action).
Testé de bout en bout en local avec une vraie image (upload réel vers Cloudinary confirmé, URL `res.cloudinary.com/...` visible sur la fiche publique).
**Limite actuelle :** upload réservé au formulaire admin — pas encore sur le formulaire de contribution membre (scope volontairement restreint pour cette itération).
**Pour tester un upload via script/JS dans le navigateur :** les inputs file ne peuvent pas recevoir de valeur directement — utiliser `DataTransfer` + `File` + `input.files = dt.files` + événement `change` (fonctionne dans Chromium, contourne la restriction de sécurité standard).

## Navigation par onglets sur les pages liste denses (2026-07-09)
Pattern ajouté sur `/encyclopedia` : `src/components/content/jump-nav.tsx` (composant client) affiche une barre collante (`sticky top-0`) de boutons pilules qui font défiler vers chaque section (`id={s.key}` + `scroll-mt-20` sur chaque `<section>`). **Ne jamais utiliser de simples ancres HTML (`<a href="#id">`) seules pour ce genre de saut** — testé peu fiable avec le routage/hydratation de Next.js App Router (le hash change mais le défilement n'a pas lieu). Toujours passer par un clic géré en JS (`e.preventDefault()` + `element.scrollIntoView({behavior:"smooth"})` + `history.pushState`), avec un `useEffect` au montage qui rejoue le scroll si l'URL arrive déjà avec un `#hash`. `scroll-smooth` ajouté globalement sur le `<html>` dans `[locale]/layout.tsx`. À réutiliser si d'autres pages (mabadarat, etc.) deviennent aussi denses.
**Piège de vérification :** le défilement `behavior: "smooth"` ne s'anime jamais dans l'outil preview_eval de ce harnais (headless) — utiliser `behavior: "instant"` pour vérifier par le code que le bon élément est ciblé, la vraie animation fonctionne normalement dans un vrai navigateur. Autre piège : React insère des commentaires `<!-- -->` entre nœuds de texte adjacents en SSR — un test qui cherche une sous-chaîne exacte du type "texte (12)" dans le HTML brut échouera à tort ; vérifier plutôt avec une regex tolérante ou en extrayant le innerHTML.

## Module Éducation & Jeunesse — fiches libres (2026-09-04)
Types de contenu `EDUCATIONAL` et `LEARNING_PATH` greffés sur le socle générique `Content`/`ContentTranslation` : fiches simplifiées, lexique, frise, quiz autocorrigé, parcours ordonné. Détails : `EducationalDetail` (ageRange, format, difficulty, sourceContentId → fiche encyclopédique complète, downloadable), `Quiz`/`QuizQuestion` (prompt/choices/explanation en Json multilingue), `LearningPathStep` (étapes pointant n'importe quel `Content` par slug). Admin : mêmes lignes « a | b » que les sources (`question | choix1 | … | n° bonne réponse | explication`). Public : hub `/تعلم` avec filtres âge+format, détail avec `QuizPlayer` (composant client). Seed : `prisma/demo-education.ts`.

## Plateforme e-learning « تعلّم » — Phase 1 (2026-09-04)
**Modèle dédié, séparé du socle Content** (logique trop différente : hiérarchie stricte, ouverture datée, progression par élève) :
`Program` → `ProgramWeek` (weekNumber, kind LEARNING/REVIEW/EXAM, opensAt) → `ProgramSession` → `ContentBlock[]` (VIDEO/TEXT/PDF/IMAGE/LINK, ordonnés, `isSupplementary` pour les ressources annexes) ; plus `Enrollment`, `SessionProgress`, `PersonalNote`.
**Le modèle s'appelle `ProgramSession`, jamais `Session`** — collision garantie avec le type `Session` de next-auth dans les fichiers qui utilisent les deux.
**Contenu en arabe uniquement** (V1) : pas de table de traductions ici, contrairement à l'encyclopédie. Les libellés d'interface passent par le namespace `lms` de messages/{ar,fr,en}.json comme d'habitude.

**Règle d'ouverture d'une séance** (`src/lib/lms.ts`, `isSessionOpen`) — **révisée le 2026-09-05** : chaque statut fait ce que son nom promet.
- `DRAFT` : invisible partout, calendrier compris.
- `LOCKED` : visible mais fermée quelle que soit la date (blocage manuel).
- `PUBLISHED` : **ouverte maintenant**, la date n'est plus qu'une information de calendrier.
- `SCHEDULED` : s'ouvre seule quand `maintenant ≥ max(semaine.opensAt, séance.publishAt)` — les deux verrous comptent.
Avant cette révision, `PUBLISHED` et `SCHEDULED` étaient traités pareil : Khaled a mis deux séances en « منشورة » datées du mois suivant et elles sont restées fermées, ce qui est incompréhensible pour qui choisit « publiée ». Vérifié **côté serveur sur la page elle-même** et sur la route du PDF, pas seulement en masquant les liens.

**Corollaire du statut par défaut (2026-09-05).** Une séance créée — en lot ou par duplication — naît en `DRAFT`, donc invisible côté élève. Khaled a signalé deux fois une séance datée qui « n'apparaissait pas dans le planning » : c'était ça. Le statut par défaut reste `DRAFT` (on ne publie jamais une séance vide par accident), mais **la conséquence doit être écrite à l'écran** : chaque ligne du planning admin porte un badge calculé par `lockReason` (« مرئية للطلبة الآن » / « تفتح للطلبة يوم … » / « مقفلة » / « مسودة — لا تظهر للطلبة »), et chaque semaine contenant des brouillons offre « إظهار المسودات للطلبة » (`op: weekActivateDrafts`) qui les passe en `SCHEDULED` si leur date est à venir, `PUBLISHED` sinon. Règle générale à retenir pour ce back-office : **ne jamais laisser un réglage dont l'effet côté élève n'est pas visible dans la même vue.**

**Le mini-calendrier du tableau de bord renvoie vers `/تعلم/التقويم`** (prop `dayPathname`) : le tableau de bord n'affiche pas le détail d'un jour, donc cliquer une date y semblait sans effet.
**Heure de référence unique** : UTC+1 (Maghreb central, pas de changement d'heure) — décalage fixe dans `lib/lms.ts`, pas de fuseau par utilisateur. `fromDateTimeInputs`/`toDateTimeInputs` convertissent les champs date+heure du formulaire admin.
**Progression** : séances obligatoires terminées ÷ toutes les séances obligatoires non-brouillon du programme (y compris pas encore ouvertes). Jamais stockée, toujours recalculée. « تابع المشاهدة » = première séance ouverte non terminée (pas de suivi « commencé » en V1).

**Pages** — élève : `/تعلم/برامج` (catalogue public), `/تعلم/برامج/[slug]`, `/تعلم/لوحتي`, `/تعلم/برامجي`, `/تعلم/التقويم`, `/تعلم/ملاحظاتي`, `/تعلم/حصة/[slug]` (lecteur). Admin : `/الإدارة/برامج`, `/الإدارة/برامج/[id]` (plan complet semaines+séances), `/الإدارة/برامج/[id]/حصص/[id]` (réglages + éditeur de blocs), `/الإدارة/التقويم`.
Actions serveur : `src/actions/lms-admin.ts` et `lms-student.ts`. Composants : `src/components/lms/` (distinct de `components/learn/`, qui reste au service des fiches libres).
**Presque aucun composant client** : le choix du type de bloc et la navigation du calendrier passent par des paramètres d'URL (`?addType=`, `?year=&month=&day=`) re-rendus côté serveur, comme `/admin/new?type=`. Seuls `note-panel` et `pdf-block` sont clients.
Réordonnancement par boutons haut/bas (échange de `sortOrder`) — pas de glisser-déposer en V1. Le renumérotage des semaines passe par des numéros négatifs temporaires à cause de la contrainte d'unicité `(programId, weekNumber)`.

**PDF — deux pièges résolus, à ne pas réintroduire :**
1. **Livraison Cloudinary** : le compte a la livraison des PDF désactivée, et le blocage se déclenche sur l'**extension de l'URL** — toute adresse finissant par `.pdf` renvoie 401, en `resource_type` "image" comme en "raw". Un envoi **"raw" avec un public_id sans extension** passe (200, octets identiques, CORS \*). D'où `uploadDocument()` dans `lib/cloudinary.ts`.
2. **react-pdf abandonné** : essayé en v10 (pdfjs 5 → plantage « Object.defineProperty called on non-object ») puis v9 (pdfjs 4 → document lu, `onRenderSuccess` déclenché, mais canvas restant `visibility: hidden` et vide). Remplacé par **`/api/documents/[id]`** : la route relit le fichier depuis Cloudinary, le renvoie en `application/pdf` + `Content-Disposition: inline`, et **contrôle l'accès** (inscrit au programme + séance ouverte ; 401 anonyme, 403 séance verrouillée). Le bloc affiche un `<iframe>` sur cette route → visionneuse native du navigateur (pagination, zoom, impression) + boutons plein écran/téléchargement. Zéro dépendance, adresse Cloudinary jamais exposée. **Limite connue** : sur iOS Safari l'aperçu en ligne d'un PDF est partiel — le lien « ouvrir dans un nouvel onglet » sert de repli.

**Texte riche** : markdown simple (`## titre`, `- liste`, `> citation`, `**gras**`, `[texte](lien)`) rendu en **composants React** depuis les jetons de `marked` (`src/components/lms/markdown.tsx`). **Aucun HTML n'est produit ni injecté** : React échappe le texte, donc rien à nettoyer. `isomorphic-dompurify` a été retiré le 2026-09-05 — il embarque jsdom, que le regroupement serverless de Vercel n'arrive pas à tracer, ce qui faisait renvoyer **500 à la page de séance en production alors qu'elle fonctionnait en local** (y compris pour une adresse inexistante : l'échec survenait au chargement du module). `serverExternalPackages` n'a pas suffi. **Ne pas réintroduire de sanitizer à base de jsdom.** Pas d'éditeur visuel, pas de `@tailwindcss/typography`.

**Testé de bout en bout en local** : création du programme « برنامج الوعي المغاربي » (8 semaines tعلّم + 1 مراجعة + 1 اختبار), séance datée du jour, 4 blocs (texte markdown, vidéo YouTube, PDF réel envoyé sur Cloudinary, lien annexe), duplication de séance, réordonnancement ; puis côté élève : inscription, tableau de bord (0 % → 50 %, bouton « ابدأ » → « تابع »), calendrier (aujourd'hui vert entouré, demain verrouillé), lecteur de séance, note personnelle, « أتممت هذه الحصة », page ملاحظاتي, page برامجي. Verrouillage vérifié par adresse directe **et** sur le fichier PDF (403). Mobile 375 px : aucun défilement horizontal.
**Phase 2 (non construite)** : annonces, statistiques, semaine de révision, examen QCM + correction auto, certificats.

## Sécurité — mise à jour de la chaîne d'authentification (2026-09-04)
`npm audit` remontait 2 vulnérabilités **critiques** et 8 **élevées**. Corrigées par : `next-auth` beta.31 → **beta.32**, `@auth/core` 0.41.2 → **0.41.3**, `next` 15.5.20 → **15.5.25** (+ eslint-config-next). Résultat : **0 critique**. Les 8 « élevées » restantes (`js-yaml`, `brace-expansion`, `nanoid`, `postcss`, `deepmerge-ts`, `@prisma/config`, `prisma`, `sharp`) sont des dépendances **d'outillage de compilation**, pas du site en fonctionnement ; `sharp` en particulier n'est jamais sollicité puisque le projet n'utilise pas `next/image` (images en `<img>` + URLs Cloudinary).

La faille qui concernait réellement ce projet : **GHSA-8fpg-xm3f-6cx3** — une erreur de configuration pouvait faire renvoyer par Auth.js un objet session **peuplé mais non authentifié**, faisant passer à tort tout contrôle de la forme `if (session?.user)`. C'était exactement la forme de `requireUser`.
**Défense en profondeur ajoutée dans `src/lib/authz.ts` — ne pas la retirer :** `isAuthenticated(session)` exige un `session.user.id` **non vide** et l'absence de champ `error`, et sert de base à `requireUser`, `canEdit`/`requireEditor` et à la route `/api/documents/[id]`. Ne jamais revenir à un simple test d'existence de l'objet session. `requireUser`/`requireEditor` renvoient désormais le type `AuthenticatedSession` (id garanti), ce qui a permis de supprimer les `session.user.id!` dans les pages.

**Parcours re-testé intégralement après la mise à jour** (build de production local, `npx next start -p 3010`) : anonyme refusé sur `/الإدارة`, `/الإدارة/برامج`, l'espace élève et `/api/documents/*` (401) · connexion admin OK et mauvais mot de passe refusé · admin accède à tout · membre simple refusé de l'admin (307) mais admis dans l'espace élève · inscription d'un nouveau compte + connexion automatique + rôle `عضو` · déconnexion effective. Vérifié ensuite en production.

## 🚫 Ne JAMAIS envoyer de texte arabe via curl sous Windows (2026-09-05)
J'ai corrompu le titre du programme de Khaled en production avec un simple `curl -F "title=برنامج…"` : Git Bash sous Windows convertit l'arabe en points d'interrogation **avant l'envoi**, et la base enregistre `?????? ????? ????????`. Le symptôme trompeur — l'interface reste en arabe (textes statiques), seules les **données** deviennent des `?` — fait croire à un problème de police.
**À faire à la place :** écrire toute donnée en arabe **via le navigateur** (`javascript_tool` sur la vraie page), ou depuis un script Node/Prisma lu en UTF-8. Pour tester une Server Action en curl, n'envoyer que des valeurs latines. Vérifier après coup : `xxd` sur la valeur renvoyée, les `3f` sont des points d'interrogation littéraux.
Corollaire : un envoi partiel n'écrase que ce qu'il contient — les gardes `if (formData.get(...) === null) continue;` dans `lms-planning.ts` ont préservé les titres de séances de Khaled. Ne pas les retirer.

## Aperçu administrateur d'une séance (2026-09-05)
Khaled ne pouvait pas ouvrir sa propre séance programmée pour le mois suivant : le verrou s'appliquait aussi à lui. Désormais, sur `/تعلم/حصة/[slug]`, un éditeur (`canEdit`) accède à une séance **verrouillée ou d'un programme où il n'est pas inscrit**, avec un bandeau « عرض إداري ». En mode aperçu, le bouton « أتممت هذه الحصة » et le panneau de notes sont **masqués** — le serveur les refuserait, et afficher un bouton sans effet est exactement le défaut qu'on vient de corriger ailleurs. La route `/api/documents/[id]` applique déjà la même exception pour les éditeurs.

## Administration du e-learning : un seul formulaire par page (2026-09-05)
**Refonte née d'une perte de données réelle.** Khaled a saisi plusieurs semaines et séances, cliqué sur un « حفظ », et tout perdu en changeant de page. Cause : la page d'un programme comptait **11 formulaires indépendants** (un par semaine, un par séance, un par bouton d'action) — un bouton n'enregistrait que son propre bloc — et **19 actions abandonnaient en silence**, sans le moindre message.

**Règle désormais, à ne pas défaire : une page = un formulaire = une action.**
- `src/actions/lms-planning.ts` : `saveProgramPlanning` (page programme) et `saveSessionPage` (page séance). Chaque envoi **enregistre tout ce qui est à l'écran**, puis applique l'opération demandée, transmise par le bouton pressé dans un champ `op` (`weekDown:12`, `sessionAdd:4`, `blockAdd:TEXT`…). Conséquence : cliquer sur « descendre » ou « supprimer » ne fait plus jamais perdre la saisie en cours.
- Chaque action renvoie une liste de messages (`?msg=saved,weekMoved`) affichés en vert (succès) ou en terracotta (problème). **Plus aucun abandon muet.**
- `src/components/admin/unsaved-guard.tsx` : bandeau collant dès la première frappe + boîte de dialogue native si on quitte sans enregistrer. Pose aussi `document.documentElement.dataset.unsavedForm` tant que la saisie est en attente, pour les autres composants de la page.
- `src/components/admin/back-link.tsx` : retour vers la page parente, **en haut** de l'écran. Le lien existait déjà mais en bas, sous la barre d'enregistrement collante — donc introuvable sur une page longue (signalé le 2026-09-05). **Piège important : `beforeunload` ne se déclenche PAS sur une navigation côté client.** Un `<Link>` Next aurait fait perdre la saisie en silence ; d'où la vraie balise `<a>` (rechargement complet, donc `beforeunload` actif) doublée d'un `confirm()` lisant le drapeau ci-dessus. Le chemin localisé se calcule côté serveur avec `getPathname` de `@/i18n/navigation`.
- `src/components/admin/form-feedback.tsx` : `FormPending` (bandeau « جارٍ الحفظ… » via `useFormStatus`, **à placer dans le formulaire**) et `ScrollToNew` (défilement vers l'élément créé, dont l'identifiant revient dans `?new=<id>`). Ajoutés après « tous ces boutons ne fonctionnent pas » : ils fonctionnaient, mais l'aller-retour serveur dure une à deux secondes sans réaction et le nouveau bloc naît en bas d'une page longue. **Un aller-retour serveur sans retour visuel est lu comme une panne.**
- Répartition des rôles : **page programme = planning** (semaines, dates d'ouverture, titres/dates/statuts des séances), **page séance = contenu** (réglages + blocs). Ajout de plusieurs séances d'un coup via un textarea, un titre par ligne.

**Piège corrigé au passage : `Number(null)` vaut `0`, pas `NaN`.** Les gardes `if (Number.isNaN(id)) return;` ne rattrapaient donc pas un champ absent : l'action partait avec l'identifiant 0 et produisait une erreur 500 au lieu d'un abandon propre. Utiliser `idField(formData, name)` dans `lms-admin.ts`, qui renvoie `null` si le champ manque ou n'est pas un identifiant positif.

**Piège de test :** une page d'admin contient plusieurs Server Actions, donc plusieurs `$ACTION_ID_…` dans le HTML. Pour rejouer un formulaire en curl, prendre celui **situé après** l'attribut `id="…"` du formulaire visé — sinon on déclenche l'action de suppression sans s'en rendre compte.

## 🎓 Phase 2 du module e-learning (2026-09-05)
Livrée en local, testée de bout en bout avant mise en ligne. Migration `add_lms_phase2` : `Announcement`, `Exam`, `ExamQuestion`, `ExamChoice`, `ExamAttempt`, `ExamAnswer`, `Certificate`. Ni la semaine de révision ni les statistiques n'ont de table : elles se calculent à partir de l'existant.

- **Annonces** : `/الإدارة/برامج/[id]/إعلانات`, affichées en tête du tableau de bord élève. Une annonce datée du futur reste invisible, comme une séance programmée.
- **Semaine de révision** (`WeekKind.REVIEW`) : `/تعلم/مراجعة/[weekId]` rassemble automatiquement les séances des semaines précédentes, séparées en « à faire » et « terminées », plus les séances propres à la semaine.
- **Examen** (`WeekKind.EXAM`) : un examen par semaine (`Exam.weekId` unique). Trois types de questions, toutes corrigées automatiquement : `SINGLE`, `MULTIPLE`, `TRUE_FALSE`. **Correct = exactement l'ensemble attendu** — une réponse partielle sur une question à choix multiples ne rapporte rien, seule règle qui ne récompense pas le fait de tout cocher. `Exam.status` réutilise `SessionStatus` : mêmes quatre mots, même sens, pas de second vocabulaire. `maxAttempts: 0` = illimité, la meilleure note compte.
- **Certificat** : page publique `/تعلم/شهادة/[code]`, volontairement accessible sans connexion pour qu'un tiers puisse vérifier un numéro. Délivré une seule fois (`@@unique([userId, programId])`) et **seulement si toutes les séances obligatoires sont terminées ET l'examen réussi** (`issueCertificateIfEarned`). Pas de génération PDF côté serveur : page imprimable (`PrintButton`), ce qui évite d'embarquer une police arabe et une bibliothèque de plus.
- **Statistiques** : `/الإدارة/برامج/[id]/الطلبة` — inscrits, actifs sur 7 jours, décrochage à 14 jours sans activité, terminés, progression moyenne, séances les plus suivies. Toute la progression du programme est chargée **en une requête** puis regroupée en mémoire, jamais une requête par élève.

**Pièges corrigés en construisant cette phase, à ne pas réintroduire :**
1. **Boucle de redirection connexion ⇄ compte.** `/دخول` testait `session?.user` (contrôle laxiste) pendant que `/حسابي` exigeait un compte réellement présent en base. Un cookie désignant un compte supprimé faisait rebondir les deux pages indéfiniment : plus moyen ni de se connecter ni de se déconnecter. Règle : **toutes** les pages passent par `isAuthenticated`/`requireUser`, et quand le compte est introuvable on affiche une sortie explicite (bouton de déconnexion), **jamais** une redirection vers la connexion.
2. **Le gras ne s'appliquait pas dans les listes markdown.** Dans un élément de liste, `marked` enveloppe le contenu dans un jeton `text` qui porte lui-même les jetons de mise en forme ; `Inline` ne descendait pas dedans et affichait les `**` bruts. Vaut aussi pour les blocs de texte des séances.
3. **Une séance terminée redevenait verrouillée** si l'administrateur décalait sa date. L'élève perdait l'accès à ce qu'il avait déjà travaillé, et la semaine de révision devenait inutile. Désormais `completed` ouvre toujours la séance, dans `SessionRow` **et** dans le verrou serveur de la page de séance.
4. **La correction restait affichée pendant une nouvelle tentative** — il suffisait de recopier. Elle est masquée dès que `?retry=1`.
5. **`npm run build` pendant que le serveur de développement tourne** casse son cache (`Cannot find module './5611.js'`). Arrêter le serveur, supprimer `.next`, relancer.

## ⚠️ « Application error » à l'envoi d'un formulaire : limite de poids (2026-09-04/05)
Symptôme : Khaled remplit un formulaire du back-office, l'envoie, et obtient une page blanche « Application error: a server-side exception has occurred » avec un Digest en `@E394`. **Cause réelle : le fichier joint dépassait la limite de corps des Server Actions (1 Mo par défaut).** Reproduit en production avec une image de 2,55 Mo.
Corrigé par trois choses, à ne pas défaire : `bodySizeLimit: "4mb"` dans `next.config.ts` (4 Mo = maximum utile, Vercel plafonnant le corps d'une requête à 4,5 Mo), le composant client **`src/components/admin/file-field.tsx`** qui refuse le fichier *avant* l'envoi avec un message explicite (branché sur les trois formulaires à fichier), et les limites alignées à `MAX_UPLOAD_BYTES` dans `lib/cloudinary.ts`. Pour dépasser 4 Mo un jour, il faudra un envoi direct navigateur → Cloudinary (signature côté serveur), pas une Server Action.

**Leçon de méthode, plus importante que le bug :** mon premier diagnostic était faux — j'avais conclu à un jeton de Server Action périmé après redéploiement, et dit à Khaled de recharger la page. Le signal qui aurait dû m'arrêter : **le Digest était identique d'une tentative à l'autre**, donc l'erreur était déterministe, pas transitoire. Deuxième erreur : j'avais « vérifié » avec des envois en curl **sans fichier**, ce qui ne reproduisait pas son geste. Quand un utilisateur décrit une erreur, reproduire son parcours *complet* (fichier joint compris) avant de conclure.

**Méthode de diagnostic utile :** en production Vercel on n'a qu'un Digest, jamais la trace. Reproduire dans un **vrai navigateur** sur la production (le chemin JS des Server Actions diffère du repli HTML sans JS). En complément, build de production local (`npm run build` puis `npx next start -p 3010`, config `magharibiyoun-prod` dans launch.json) — le mode développement masque certaines erreurs. Pour rejouer une Server Action sans navigateur : se connecter via `/api/auth/csrf` + `/api/auth/callback/credentials` (cookies dans un jar curl), lire le `$ACTION_ID_…` dans le HTML du formulaire, et poster en `multipart/form-data` sur la même URL.

## Upload d'images en production — réparé le 2026-09-05
Les envois échouaient (`?uploadError=config`) : les variables `CLOUDINARY_*` avaient été ajoutées en « Shared » en juillet et n'étaient **pas rattachées au projet**. Khaled les a ajoutées dans le projet lui-même (Environment Variables → Production) ; **un redéploiement est indispensable pour qu'elles soient lues**. Vérifié ensuite de bout en bout : image envoyée depuis le formulaire → URL `res.cloudinary.com/ejqgdyc6/image/upload/…` → fichier lisible publiquement (200, `image/jpeg`, en-tête `ffd8`).
**Piège de test :** ne pas fabriquer une fausse image (octets aléatoires + en-tête JPEG) pour tester l'upload — Cloudinary la refuse et on croit à tort que la configuration est en cause. Générer une vraie image via `canvas.toBlob()` dans le navigateur.
**Autre piège :** une boucle `until` qui rejoue un envoi de formulaire crée un enregistrement à chaque tentative (22 programmes parasites créés ainsi le 2026-09-05). Pour sonder un déploiement, utiliser une requête en **lecture seule**.

## 🚫 Règle absolue : jamais de suppression par plage d'identifiants en production
Le 2026-09-05, pour nettoyer ces 22 programmes de test, une boucle `for id in $(seq 1 40)` a supprimé **tous** les programmes — y compris celui que Khaled était en train de construire (10 semaines, ~16 séances). Perte définitive (aucune restauration Neon tentée à temps).
**À faire à la place :** noter l'identifiant exact renvoyé à chaque création de test, et ne supprimer que ceux-là, un par un. Ne jamais créer de données de test en production pendant que Khaled l'utilise : prévenir avant, ou tester en local. Rappel : `deleteProgram` refuse un programme ayant des inscrits, mais **rien ne protège un programme en cours de construction**.

## ⚠️ Piège connu : ne JAMAIS lancer `npm run build` pendant que le serveur dev tourne
Les deux partagent le dossier `.next` — le mélange corrompt le serveur dev (erreurs « React Client Manifest » / « vendor-chunks »). Remède : arrêter le dev, `Remove-Item .next -Recurse -Force`, relancer.
Le projet étant dans un dossier **OneDrive**, la synchronisation verrouille parfois des fichiers de `.next` en cours d'écriture → erreurs `EBUSY` ou `EINVAL: readlink`. Même remède. À faire aussi **après tout changement de version d'une dépendance** : sinon webpack continue de résoudre l'ancienne arborescence (vu avec react-pdf : `ENOENT .../dist/index.js` alors que le paquet était bien réinstallé).

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
