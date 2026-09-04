import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  contentHref,
  fmtDate,
  fmtYear,
  listJoin,
  tLabel,
  type ListItem,
} from "@/lib/content";

function Chip({
  tone,
  children,
}: {
  tone: "terracotta" | "majorelle" | "oasis" | "neutral";
  children: React.ReactNode;
}) {
  const tones: Record<string, string> = {
    terracotta: "bg-terracottal text-terracotta",
    majorelle: "bg-majorellel text-majorelle",
    oasis: "bg-oasisl text-oasis",
    neutral: "bg-sable2 text-mutedink",
  };
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export default async function ContentCard({
  item,
  locale,
}: {
  item: ListItem;
  locale: string;
}) {
  const t = await getTranslations("content");
  const c = item.content;
  const countries = listJoin(
    locale,
    c.countries.map((cc) => tLabel(cc.country.labels, locale)),
  );

  const chips: React.ReactNode[] = [];
  let meta = "";

  if (c.type === "ARTICLE") {
    chips.push(
      <Chip key="op" tone="terracotta">
        {t("opinionChip")}
      </Chip>,
    );
    const parts = [c.article?.authorName ?? "", fmtDate(locale, item.publishedAt)];
    if (c.article?.readingTimeMin) {
      parts.push(t("readingTime", { min: c.article.readingTimeMin }));
    }
    meta = listJoin(locale, parts.filter(Boolean));
  } else if (c.type === "INITIATIVE") {
    if (c.initiative) {
      chips.push(
        <Chip key="st" tone="majorelle">
          {t(`state${c.initiative.state}`)}
        </Chip>,
      );
      if (c.initiative.isVerified) {
        chips.push(
          <Chip key="vf" tone="oasis">
            ✓ {t("verifiedInitiative")}
          </Chip>,
        );
      }
    }
    meta = countries;
  } else if (c.type === "EDUCATIONAL") {
    if (c.educational) {
      chips.push(
        <Chip key="fm" tone="majorelle">
          {t(`format${c.educational.format}`)}
        </Chip>,
      );
      if (c.educational.ageRange) {
        chips.push(
          <Chip key="ag" tone="neutral">
            {t(`age${c.educational.ageRange}`)}
          </Chip>,
        );
      }
    }
    meta = "";
  } else if (c.type === "LEARNING_PATH") {
    chips.push(
      <Chip key="lp" tone="oasis">
        {t("learningPathLabel")}
      </Chip>,
    );
    meta = "";
  } else if (c.type === "MEDIA_ITEM") {
    if (c.mediaItem) {
      chips.push(
        <Chip key="kd" tone="majorelle">
          {t(`kind${c.mediaItem.kind}`)}
        </Chip>,
      );
      if (c.mediaItem.durationMin) {
        chips.push(
          <Chip key="du" tone="neutral">
            {t("duration", { min: c.mediaItem.durationMin })}
          </Chip>,
        );
      }
    }
    meta = c.mediaItem?.showName ?? "";
  } else {
    if (c.historical?.periodCategory) {
      chips.push(
        <Chip key="pe" tone="majorelle">
          {tLabel(c.historical.periodCategory.labels, locale)}
        </Chip>,
      );
    }
    if (c.personality?.birthYear) {
      chips.push(
        <Chip key="yr" tone="neutral">
          {fmtYear(locale, c.personality.birthYear)}
          {c.personality.deathYear
            ? ` – ${fmtYear(locale, c.personality.deathYear)}`
            : ""}
        </Chip>,
      );
    }
    if (c.validationLevel === "VERIFIED" || c.validationLevel === "ACADEMIC") {
      chips.push(
        <Chip key="vl" tone="oasis">
          ✓{" "}
          {c.validationLevel === "ACADEMIC"
            ? t("badgeAcademic")
            : t("badgeVerified")}
        </Chip>,
      );
    }
    meta = countries;
  }

  const cover = c.media[0]?.mediaFile;

  return (
    <Link
      href={{ pathname: contentHref(c.type), params: { slug: item.slug } }}
      className="group flex flex-col gap-2 rounded-xl border border-ligne bg-white p-4 transition-colors hover:border-majorelle"
    >
      {cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={cover.url}
          alt=""
          loading="lazy"
          className="-mx-4 -mt-4 mb-1 h-36 w-[calc(100%+2rem)] max-w-none rounded-t-xl border-b border-ligne bg-sable2 object-cover"
        />
      ) : null}
      <div className="flex flex-wrap gap-1.5">{chips}</div>
      <div className="font-medium leading-relaxed group-hover:text-majorelle">
        {item.title}
      </div>
      {item.summary ? (
        <p className="line-clamp-3 text-sm leading-relaxed text-mutedink">
          {item.summary}
        </p>
      ) : null}
      {meta ? <div className="mt-auto text-xs text-mutedink">{meta}</div> : null}
    </Link>
  );
}
