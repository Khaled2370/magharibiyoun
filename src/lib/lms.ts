import type {
  ContentBlock,
  MediaFile,
  ProgramSession,
  ProgramWeek,
  SessionStatus,
} from "@prisma/client";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// ─────────────────────────────────────────────
// Heure de référence
// Une seule heure pour tout le monde (décision V1 : pas de fuseau par élève).
// UTC+1 = heure du Maghreb central (Tunis/Alger/Rabat), sans changement d'heure,
// donc un simple décalage fixe suffit — pas besoin de base de fuseaux horaires.
// ─────────────────────────────────────────────

const TZ_OFFSET_MIN = 60;
export const LMS_TIME_ZONE = "Africa/Tunis";

function shiftToRef(d: Date): Date {
  return new Date(d.getTime() + TZ_OFFSET_MIN * 60_000);
}

/** Clé "AAAA-MM-JJ" d'une date, exprimée dans l'heure de référence. */
export function dayKey(d: Date): string {
  const s = shiftToRef(d);
  const m = String(s.getUTCMonth() + 1).padStart(2, "0");
  const day = String(s.getUTCDate()).padStart(2, "0");
  return `${s.getUTCFullYear()}-${m}-${day}`;
}

/** Date du jour (clé) dans l'heure de référence. */
export function todayKey(now: Date = new Date()): string {
  return dayKey(now);
}

/**
 * Opération inverse de `dayKey` : « 2026-10-08 » → un instant de ce jour-là.
 * Fixé à midi UTC pour que le formatage retombe sur le bon jour quel que soit
 * le décalage appliqué ensuite. Sert à afficher une date en toutes lettres
 * quand on ne dispose que de la clé.
 */
export function dateFromDayKey(key: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!m) return null;
  return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12));
}

/** Champs date + heure d'un formulaire admin → instant réel (stocké en UTC). */
export function fromDateTimeInputs(
  dateStr: string | null,
  timeStr: string | null,
): Date | null {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return null;
  const [hh, mm] = (timeStr || "00:00").split(":").map(Number);
  return new Date(
    Date.UTC(y, m - 1, d, hh || 0, mm || 0) - TZ_OFFSET_MIN * 60_000,
  );
}

/** Instant → valeurs à pré-remplir dans les champs date/heure du formulaire. */
export function toDateTimeInputs(d: Date | null | undefined): {
  date: string;
  time: string;
} {
  if (!d) return { date: "", time: "" };
  const s = shiftToRef(d);
  const m = String(s.getUTCMonth() + 1).padStart(2, "0");
  const day = String(s.getUTCDate()).padStart(2, "0");
  const hh = String(s.getUTCHours()).padStart(2, "0");
  const mm = String(s.getUTCMinutes()).padStart(2, "0");
  return { date: `${s.getUTCFullYear()}-${m}-${day}`, time: `${hh}:${mm}` };
}

function intlLocale(locale: string): string {
  return locale === "ar" ? "ar-TN" : locale;
}

export function fmtSessionDate(locale: string, d: Date | null | undefined): string {
  if (!d) return "";
  return new Intl.DateTimeFormat(intlLocale(locale), {
    dateStyle: "long",
    timeZone: LMS_TIME_ZONE,
  }).format(d);
}

export function fmtSessionDateTime(
  locale: string,
  d: Date | null | undefined,
): string {
  if (!d) return "";
  return new Intl.DateTimeFormat(intlLocale(locale), {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: LMS_TIME_ZONE,
  }).format(d);
}

// ─────────────────────────────────────────────
// Requêtes réutilisables
// ─────────────────────────────────────────────

export const programStructureInclude = {
  weeks: {
    orderBy: { weekNumber: "asc" },
    include: { sessions: { orderBy: { orderInWeek: "asc" } } },
  },
} satisfies Prisma.ProgramInclude;

export type ProgramWithStructure = Prisma.ProgramGetPayload<{
  include: typeof programStructureInclude;
}>;

export const sessionDetailInclude = {
  blocks: { orderBy: { sortOrder: "asc" }, include: { mediaFile: true } },
  week: { include: { program: true } },
} satisfies Prisma.ProgramSessionInclude;

export type SessionDetail = Prisma.ProgramSessionGetPayload<{
  include: typeof sessionDetailInclude;
}>;

export type BlockWithMedia = ContentBlock & { mediaFile: MediaFile | null };

export type SessionWithWeek = { session: ProgramSession; week: ProgramWeek };

/** Toutes les séances d'un programme, dans l'ordre pédagogique réel. */
export function flattenSessions(program: ProgramWithStructure): SessionWithWeek[] {
  return [...program.weeks]
    .sort((a, b) => a.weekNumber - b.weekNumber)
    .flatMap((week) =>
      [...week.sessions]
        .sort((a, b) => a.orderInWeek - b.orderInWeek || a.id - b.id)
        .map((session) => ({ session, week })),
    );
}

// ─────────────────────────────────────────────
// Ouverture des séances
// Règle : les DEUX verrous doivent être ouverts (semaine + séance).
// DRAFT = invisible partout · LOCKED = fermé quelle que soit la date.
// ─────────────────────────────────────────────

export function isVisibleToStudents(status: SessionStatus): boolean {
  return status !== "DRAFT";
}

/** Instant réel d'ouverture : le plus tardif des deux verrous. */
export function effectiveUnlockAt(
  session: Pick<ProgramSession, "publishAt">,
  week: Pick<ProgramWeek, "opensAt">,
): Date | null {
  const dates = [week.opensAt, session.publishAt].filter(Boolean) as Date[];
  if (dates.length === 0) return null;
  return new Date(Math.max(...dates.map((d) => d.getTime())));
}

/**
 * Une séance est-elle accessible aux élèves ?
 *
 * Sémantique des quatre statuts, choisie pour coller à ce que le mot affiche :
 *  - DRAFT     : invisible partout, y compris dans le calendrier.
 *  - LOCKED    : visible mais fermée, quelle que soit la date (blocage manuel).
 *  - PUBLISHED : **ouverte maintenant**, la date n'est plus qu'une information
 *                de calendrier. C'est ce qu'attend l'admin quand il choisit
 *                « منشورة » (corrigé le 2026-09-05 : les deux statuts étaient
 *                auparavant traités pareil, une séance « publiée » datée du
 *                mois suivant restait fermée, ce qui n'avait aucun sens).
 *  - SCHEDULED : s'ouvre toute seule à la date prévue — les deux verrous
 *                doivent être atteints, celui de la semaine et celui de la
 *                séance.
 */
export function isSessionOpen(
  session: Pick<ProgramSession, "status" | "publishAt">,
  week: Pick<ProgramWeek, "opensAt">,
  now: Date = new Date(),
): boolean {
  if (session.status === "DRAFT" || session.status === "LOCKED") return false;
  if (session.status === "PUBLISHED") return true;
  const unlock = effectiveUnlockAt(session, week);
  return !unlock || unlock.getTime() <= now.getTime();
}

export type LockReason = "open" | "scheduled" | "locked" | "draft";

export function lockReason(
  session: Pick<ProgramSession, "status" | "publishAt">,
  week: Pick<ProgramWeek, "opensAt">,
  now: Date = new Date(),
): LockReason {
  if (session.status === "DRAFT") return "draft";
  if (session.status === "LOCKED") return "locked";
  return isSessionOpen(session, week, now) ? "open" : "scheduled";
}

// ─────────────────────────────────────────────
// Progression
// Dénominateur : toutes les séances obligatoires non-brouillon du programme,
// y compris celles pas encore ouvertes (correspond à l'exemple « 10 / 48 »).
// ─────────────────────────────────────────────

export type ProgressStats = {
  done: number;
  total: number;
  percent: number;
  remaining: number;
};

export function computeProgress(
  sessions: Pick<ProgramSession, "id" | "isMandatory" | "status">[],
  completedIds: Set<number>,
): ProgressStats {
  const counted = sessions.filter((s) => s.isMandatory && isVisibleToStudents(s.status));
  const total = counted.length;
  const done = counted.filter((s) => completedIds.has(s.id)).length;
  return {
    done,
    total,
    remaining: Math.max(total - done, 0),
    percent: total === 0 ? 0 : Math.round((done / total) * 100),
  };
}

/**
 * « تابع المشاهدة » : la prochaine séance à faire = la première séance ouverte
 * et non terminée, dans l'ordre du programme. Pas de suivi « commencé mais pas
 * fini » en V1 — le parcours étant linéaire, le résultat est le même en pratique.
 */
export function findContinueSession(
  program: ProgramWithStructure,
  completedIds: Set<number>,
  now: Date = new Date(),
): SessionWithWeek | null {
  return (
    flattenSessions(program).find(
      ({ session, week }) =>
        isSessionOpen(session, week, now) && !completedIds.has(session.id),
    ) ?? null
  );
}

/** Séance précédente / suivante visibles, pour la navigation dans le lecteur. */
export function neighbourSessions(
  program: ProgramWithStructure,
  currentSessionId: number,
): { prev: ProgramSession | null; next: ProgramSession | null } {
  const list = flattenSessions(program)
    .filter(({ session }) => isVisibleToStudents(session.status))
    .map(({ session }) => session);
  const i = list.findIndex((s) => s.id === currentSessionId);
  if (i === -1) return { prev: null, next: null };
  return { prev: list[i - 1] ?? null, next: list[i + 1] ?? null };
}

// ─────────────────────────────────────────────
// Calendrier
// ─────────────────────────────────────────────

export type DayStatus = "none" | "locked" | "available" | "missed" | "done";

export type CalendarCell = {
  key: string;
  date: Date;
  inMonth: boolean;
  isToday: boolean;
  status: DayStatus;
  sessions: SessionWithWeek[];
};

/** Grille du mois (semaines commençant le lundi), dans l'heure de référence. */
export function monthCells(year: number, month1to12: number): {
  key: string;
  date: Date;
  inMonth: boolean;
}[] {
  const first = new Date(Date.UTC(year, month1to12 - 1, 1));
  // getUTCDay : 0 = dimanche → on ramène à un index lundi = 0
  const lead = (first.getUTCDay() + 6) % 7;
  const start = new Date(first.getTime() - lead * 86_400_000);
  const cells: { key: string; date: Date; inMonth: boolean }[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start.getTime() + i * 86_400_000);
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    cells.push({
      key: `${d.getUTCFullYear()}-${m}-${day}`,
      date: d,
      inMonth: d.getUTCMonth() === month1to12 - 1,
    });
  }
  // On coupe la 6e ligne si elle est entièrement hors du mois.
  return cells.slice(0, 35).some((c) => c.inMonth) &&
    !cells.slice(35).some((c) => c.inMonth)
    ? cells.slice(0, 35)
    : cells;
}

/** Statut d'un jour = priorité « à faire » > « manqué » > « fait » > « verrouillé ». */
export function dayStatusFor(
  sessions: SessionWithWeek[],
  dayIsPast: boolean,
  completedIds: Set<number>,
  now: Date = new Date(),
): DayStatus {
  if (sessions.length === 0) return "none";
  let hasAvailable = false;
  let hasMissed = false;
  let hasDone = false;
  for (const { session, week } of sessions) {
    if (completedIds.has(session.id)) {
      hasDone = true;
    } else if (isSessionOpen(session, week, now)) {
      if (dayIsPast) hasMissed = true;
      else hasAvailable = true;
    }
  }
  if (hasAvailable) return "available";
  if (hasMissed) return "missed";
  if (hasDone) return "done";
  return "locked";
}

/** Construit la grille complète d'un mois à partir des séances d'un programme. */
export function buildCalendar(
  program: ProgramWithStructure,
  year: number,
  month1to12: number,
  completedIds: Set<number>,
  now: Date = new Date(),
): CalendarCell[] {
  const byDay = new Map<string, SessionWithWeek[]>();
  for (const item of flattenSessions(program)) {
    if (!isVisibleToStudents(item.session.status)) continue;
    if (!item.session.publishAt) continue;
    const key = dayKey(item.session.publishAt);
    const list = byDay.get(key) ?? [];
    list.push(item);
    byDay.set(key, list);
  }
  const today = todayKey(now);
  return monthCells(year, month1to12).map((cell) => {
    const sessions = byDay.get(cell.key) ?? [];
    return {
      ...cell,
      isToday: cell.key === today,
      sessions,
      status: dayStatusFor(sessions, cell.key < today, completedIds, now),
    };
  });
}

// ─────────────────────────────────────────────
// Accès aux données côté élève
// ─────────────────────────────────────────────

/** Identifiants des séances déjà terminées par un élève (tout programme confondu). */
export async function completedSessionIds(userId: string): Promise<Set<number>> {
  const rows = await prisma.sessionProgress.findMany({
    where: { userId },
    select: { sessionId: true },
  });
  return new Set(rows.map((r) => r.sessionId));
}

export type EnrolledProgram = {
  program: ProgramWithStructure;
  enrolledAt: Date;
  progress: ProgressStats;
  currentWeek: number | null;
  state: "upcoming" | "inProgress" | "completed";
};

/** Programmes suivis par un élève, avec progression calculée. */
export async function getEnrolledPrograms(
  userId: string,
  now: Date = new Date(),
): Promise<EnrolledProgram[]> {
  const [enrollments, completed] = await Promise.all([
    prisma.enrollment.findMany({
      where: { userId, status: { not: "DROPPED" } },
      include: { program: { include: programStructureInclude } },
      orderBy: { enrolledAt: "desc" },
    }),
    completedSessionIds(userId),
  ]);

  return enrollments.map((e) => {
    const all = flattenSessions(e.program);
    const progress = computeProgress(
      all.map(({ session }) => session),
      completed,
    );
    const open = all.filter(({ session, week }) => isSessionOpen(session, week, now));
    const next = findContinueSession(e.program, completed, now);
    const currentWeek =
      next?.week.weekNumber ??
      (open.length > 0 ? open[open.length - 1].week.weekNumber : null);
    const state =
      progress.total > 0 && progress.done >= progress.total
        ? ("completed" as const)
        : open.length === 0
          ? ("upcoming" as const)
          : ("inProgress" as const);
    return {
      program: e.program,
      enrolledAt: e.enrolledAt,
      progress,
      currentWeek,
      state,
    };
  });
}

/** Programme « actif » mis en avant sur le tableau de bord. */
export function pickActiveProgram(list: EnrolledProgram[]): EnrolledProgram | null {
  return (
    list.find((p) => p.state === "inProgress") ??
    list.find((p) => p.state === "upcoming") ??
    list[0] ??
    null
  );
}
