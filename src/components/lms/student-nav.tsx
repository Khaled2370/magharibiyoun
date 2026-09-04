import { getTranslations } from "next-intl/server";
import { CalendarDays, GraduationCap, NotebookPen, TrendingUp } from "lucide-react";
import { Link } from "@/i18n/navigation";

type Key = "dashboard" | "programs" | "calendar" | "notes";

const ITEMS = [
  { key: "dashboard", href: "/learn/dashboard", label: "navDashboard", Icon: TrendingUp },
  { key: "programs", href: "/learn/my-programs", label: "navMyPrograms", Icon: GraduationCap },
  { key: "calendar", href: "/learn/calendar", label: "navCalendar", Icon: CalendarDays },
  { key: "notes", href: "/learn/notes", label: "navNotes", Icon: NotebookPen },
] as const;

/** Barre de navigation de l'espace élève (absente du lecteur de séance). */
export default async function StudentNav({ active }: { active: Key }) {
  const t = await getTranslations("lms");
  return (
    <nav className="-mx-4 mb-6 overflow-x-auto px-4">
      <div className="flex min-w-max gap-1.5">
        {ITEMS.map(({ key, href, label, Icon }) => (
          <Link
            key={key}
            href={href}
            aria-current={key === active ? "page" : undefined}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              key === active
                ? "bg-encre text-sable"
                : "border border-ligne bg-white text-mutedink hover:border-majorelle"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            {t(label)}
          </Link>
        ))}
      </div>
    </nav>
  );
}
