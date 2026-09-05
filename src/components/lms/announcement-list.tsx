import { getTranslations } from "next-intl/server";
import { Megaphone, Pin } from "lucide-react";
import type { Announcement } from "@prisma/client";
import { fmtSessionDate } from "@/lib/lms";
import Markdown from "@/components/lms/markdown";

/**
 * Annonces d'un programme, telles que l'élève les voit.
 *
 * Les annonces épinglées passent devant, puis les plus récentes. La liste est
 * déjà filtrée et triée par l'appelant : ce composant n'affiche rien de plus
 * que ce qu'on lui donne.
 */
export default async function AnnouncementList({
  announcements,
  locale,
}: {
  announcements: Announcement[];
  locale: string;
}) {
  const t = await getTranslations("lms");

  if (announcements.length === 0) {
    return (
      <p className="rounded-xl border border-ligne bg-white p-4 text-sm text-mutedink">
        {t("announcementsEmpty")}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {announcements.map((a) => (
        <article
          key={a.id}
          className={`rounded-xl border bg-white p-4 ${
            a.isPinned ? "border-majorelle" : "border-ligne"
          }`}
        >
          <header className="mb-1.5 flex flex-wrap items-center gap-2">
            <Megaphone className="h-4 w-4 shrink-0 text-majorelle" aria-hidden />
            <h3 className="font-medium">{a.title}</h3>
            {a.isPinned ? (
              <span className="flex items-center gap-1 rounded-full bg-majorellel px-2 py-0.5 text-[11px] font-medium text-majorelle">
                <Pin className="h-3 w-3" aria-hidden />
                {t("announcementPinned")}
              </span>
            ) : null}
            <time className="ms-auto text-xs text-mutedink">
              {fmtSessionDate(locale, a.publishAt)}
            </time>
          </header>
          <div className="text-sm leading-relaxed text-mutedink">
            <Markdown source={a.body} />
          </div>
        </article>
      ))}
    </div>
  );
}
