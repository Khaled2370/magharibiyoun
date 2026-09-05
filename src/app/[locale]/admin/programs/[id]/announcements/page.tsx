import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Megaphone, Pin, Plus, Save } from "lucide-react";
import { requireEditor } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { toDateTimeInputs } from "@/lib/lms";
import { saveAnnouncements } from "@/actions/lms-announcements";
import UnsavedGuard from "@/components/admin/unsaved-guard";
import { FormPending } from "@/components/admin/form-feedback";
import BackLink from "@/components/admin/safe-link";
import { getPathname } from "@/i18n/navigation";

const FORM_ID = "announcements";
const input =
  "w-full rounded-lg border border-ligne bg-white px-3 py-2 text-sm outline-none focus:border-majorelle";
const small =
  "rounded-lg border border-ligne bg-white px-2 py-1 text-sm outline-none focus:border-majorelle";
const label = "mb-1 block text-sm font-medium";

const MSG_KEYS: Record<string, string> = {
  saved: "msgSaved",
  announcementAdded: "msgAnnouncementAdded",
  announcementDeleted: "msgAnnouncementDeleted",
};

export default async function AdminAnnouncementsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ msg?: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  await requireEditor(locale);
  const t = await getTranslations("lms");
  const sp = await searchParams;

  const programId = Number(id);
  if (!Number.isInteger(programId)) notFound();

  const program = await prisma.program.findUnique({
    where: { id: programId },
    include: {
      announcements: { orderBy: [{ isPinned: "desc" }, { publishAt: "desc" }] },
    },
  });
  if (!program) notFound();

  const messages = (sp.msg ?? "").split(",").filter(Boolean);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <BackLink
        href={getPathname({
          locale,
          href: { pathname: "/admin/programs/[id]", params: { id: String(programId) } },
        })}
        label={t("adminBackToProgram")}
        confirmText={t("unsavedLeaveConfirm")}
      />
      <p className="text-xs text-mutedink">{program.title}</p>
      <h1 className="mb-2 mt-1 flex items-center gap-2 text-2xl font-medium sm:text-3xl">
        <Megaphone className="h-6 w-6 text-majorelle" aria-hidden />
        {t("adminAnnouncements")}
      </h1>
      <p className="mb-6 text-sm text-mutedink">{t("adminAnnouncementsIntro")}</p>

      <UnsavedGuard formId={FORM_ID} label={t("unsavedWarning")} />

      {messages.length > 0 ? (
        <p className="mb-3 rounded-lg bg-oasisl px-4 py-2.5 text-sm text-oasis">
          {messages.map((m) => t(MSG_KEYS[m] ?? "msgSaved")).join(" ")}
        </p>
      ) : null}

      <form action={saveAnnouncements} id={FORM_ID} className="space-y-4">
        <FormPending label={t("savingInProgress")} />
        <input type="hidden" name="uiLocale" value={locale} />
        <input type="hidden" name="programId" value={program.id} />

        <button
          type="submit"
          name="op"
          value="add"
          className="flex items-center gap-1.5 rounded-lg border border-ligne bg-white px-3 py-1.5 text-sm font-medium text-mutedink transition-colors hover:border-majorelle hover:text-majorelle"
        >
          <Plus className="h-4 w-4" aria-hidden />
          {t("adminAddAnnouncement")}
        </button>

        {program.announcements.length === 0 ? (
          <p className="rounded-xl border border-ligne bg-white p-6 text-center text-mutedink">
            {t("adminNoAnnouncements")}
          </p>
        ) : (
          program.announcements.map((a) => {
            const when = toDateTimeInputs(a.publishAt);
            return (
              <section key={a.id} className="rounded-xl border border-ligne bg-white p-5">
                <input type="hidden" name={`ann_${a.id}_present`} value="1" />

                <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-ligne pb-2">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-mutedink">
                    <input
                      type="checkbox"
                      name={`ann_${a.id}_pinned`}
                      defaultChecked={a.isPinned}
                      className="h-4 w-4"
                    />
                    <Pin className="h-3.5 w-3.5" aria-hidden />
                    {t("adminPinned")}
                  </label>
                  <button
                    type="submit"
                    name="op"
                    value={`delete:${a.id}`}
                    className="rounded-lg border border-terracotta px-2.5 py-1 text-xs font-medium text-terracotta transition-colors hover:bg-terracottal"
                  >
                    {t("adminDelete")}
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className={label} htmlFor={`ann-${a.id}-title`}>
                      {t("adminAnnouncementTitle")}
                    </label>
                    <input
                      id={`ann-${a.id}-title`}
                      name={`ann_${a.id}_title`}
                      defaultValue={a.title}
                      className={input}
                    />
                  </div>
                  <div>
                    <label className={label} htmlFor={`ann-${a.id}-body`}>
                      {t("adminAnnouncementBody")}
                    </label>
                    <textarea
                      id={`ann-${a.id}-body`}
                      name={`ann_${a.id}_body`}
                      rows={4}
                      defaultValue={a.body}
                      className={input}
                    />
                    <p className="mt-1 text-xs text-mutedink">{t("adminTextHint")}</p>
                  </div>
                  <div className="flex flex-wrap items-end gap-2">
                    <div>
                      <label className={label} htmlFor={`ann-${a.id}-date`}>
                        {t("adminPublishDate")}
                      </label>
                      <input
                        id={`ann-${a.id}-date`}
                        name={`ann_${a.id}_date`}
                        type="date"
                        defaultValue={when.date}
                        className={small}
                        dir="ltr"
                      />
                    </div>
                    <input
                      name={`ann_${a.id}_time`}
                      type="time"
                      defaultValue={when.time}
                      aria-label={t("adminPublishTime")}
                      className={small}
                      dir="ltr"
                    />
                  </div>
                </div>
              </section>
            );
          })
        )}

        <div className="sticky bottom-0 -mx-4 border-t border-ligne bg-sable/95 px-4 py-3 backdrop-blur">
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-majorelle px-6 py-3 font-medium text-white transition-opacity hover:opacity-90"
          >
            <Save className="h-5 w-5" aria-hidden />
            {t("saveAll")}
          </button>
        </div>
      </form>
    </div>
  );
}
