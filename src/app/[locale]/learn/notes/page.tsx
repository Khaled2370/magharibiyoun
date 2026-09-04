import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { fmtSessionDate } from "@/lib/lms";
import { deleteNote, saveNote } from "@/actions/lms-student";
import StudentNav from "@/components/lms/student-nav";
import ConfirmSubmit from "@/components/lms/confirm-submit";
import { Link } from "@/i18n/navigation";

export default async function LearnNotesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const auth = await requireUser(locale);
  const t = await getTranslations("lms");

  const notes = await prisma.personalNote.findMany({
    where: { userId: auth.user.id! },
    include: {
      session: {
        select: {
          id: true,
          slug: true,
          title: true,
          week: { select: { weekNumber: true, program: { select: { title: true } } } },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-medium">{t("notesTitle")}</h1>
      <p className="mt-2 text-sm text-mutedink">{t("notesIntro")}</p>
      <div className="mt-6">
        <StudentNav active="notes" />
      </div>

      {notes.length === 0 ? (
        <p className="rounded-xl border border-ligne bg-white p-6 text-center text-mutedink">
          {t("notesEmpty")}
        </p>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <article key={note.id} className="rounded-xl border border-ligne bg-white p-5">
              <header className="mb-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <div className="min-w-0">
                  <Link
                    href={{
                      pathname: "/learn/session/[slug]",
                      params: { slug: note.session.slug },
                    }}
                    className="font-medium hover:text-majorelle"
                  >
                    {note.session.title}
                  </Link>
                  <p className="text-xs text-mutedink">
                    {note.session.week.program.title} —{" "}
                    {t("weekLabel", { n: note.session.week.weekNumber })}
                  </p>
                </div>
                <span className="text-xs text-mutedink">
                  {fmtSessionDate(locale, note.updatedAt)}
                </span>
              </header>

              <form action={saveNote}>
                <input type="hidden" name="id" value={note.id} />
                <input type="hidden" name="sessionId" value={note.session.id} />
                <input type="hidden" name="uiLocale" value={locale} />
                <textarea
                  name="body"
                  rows={4}
                  defaultValue={note.body}
                  className="w-full rounded-lg border border-ligne bg-white px-3 py-2 text-sm leading-relaxed outline-none focus:border-majorelle"
                />
                <div className="mt-2 flex flex-wrap items-center justify-end gap-2">
                  <Link
                    href={{
                      pathname: "/learn/session/[slug]",
                      params: { slug: note.session.slug },
                    }}
                    className="rounded-lg border border-ligne px-3 py-1.5 text-sm text-mutedink transition-colors hover:border-majorelle hover:text-majorelle"
                  >
                    {t("notesGoToSession")}
                  </Link>
                  <button
                    type="submit"
                    className="rounded-lg bg-majorelle px-4 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
                  >
                    {t("notesUpdate")}
                  </button>
                </div>
              </form>

              <div className="mt-2 flex justify-end">
                <ConfirmSubmit
                  action={deleteNote}
                  fields={{ id: note.id, uiLocale: locale }}
                  label={t("notesDelete")}
                  confirmText={t("notesConfirmDelete")}
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
