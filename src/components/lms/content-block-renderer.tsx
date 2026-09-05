import { getTranslations } from "next-intl/server";
import {
  BookOpen,
  ExternalLink,
  FileText,
  Globe,
  Headphones,
  Link2,
  Video,
} from "lucide-react";
import type { BlockWithMedia } from "@/lib/lms";
import Markdown from "./markdown";
import YoutubeEmbed from "@/components/content/youtube-embed";
import PdfBlock from "./pdf-block";

const LINK_ICONS = {
  ARTICLE: BookOpen,
  SITE: Globe,
  PODCAST: Headphones,
  VIDEO: Video,
  DOCUMENT: FileText,
  OTHER: Link2,
} as const;

export default async function ContentBlockRenderer({
  block,
}: {
  block: BlockWithMedia;
}) {
  const t = await getTranslations("lms");

  const heading = block.title ? (
    <h3 className="mb-2 text-lg font-medium">{block.title}</h3>
  ) : null;

  if (block.type === "VIDEO") {
    if (!block.videoUrl) return null;
    return (
      <section>
        {heading}
        <YoutubeEmbed url={block.videoUrl} title={block.videoTitle ?? block.title ?? ""} />
        {(block.videoTitle || block.videoInstructor || block.videoDurationMin) && (
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-mutedink">
            {block.videoTitle ? (
              <span className="font-medium text-encre">{block.videoTitle}</span>
            ) : null}
            {block.videoInstructor ? <span>{block.videoInstructor}</span> : null}
            {block.videoDurationMin ? (
              <span>{t("durationMin", { n: block.videoDurationMin })}</span>
            ) : null}
          </p>
        )}
      </section>
    );
  }

  if (block.type === "TEXT") {
    if (!block.textBody) return null;
    return (
      <section>
        {heading}
        <Markdown source={block.textBody} />
      </section>
    );
  }

  if (block.type === "PDF") {
    if (!block.mediaFile?.url) return null;
    return (
      <section>
        {heading}
        <PdfBlock
          // Servi par notre propre adresse : bon type MIME et accès contrôlé.
          src={`/api/documents/${block.id}`}
          labels={{
            fullscreen: t("pdfFullscreen"),
            download: t("pdfDownload"),
            loading: t("pdfLoading"),
            fallback: t("pdfFallback"),
          }}
        />
      </section>
    );
  }

  if (block.type === "IMAGE") {
    if (!block.mediaFile?.url) return null;
    return (
      <section>
        {heading}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={block.mediaFile.url}
          alt={block.title ?? ""}
          className="w-full rounded-xl border border-ligne bg-sable2"
        />
      </section>
    );
  }

  if (block.type === "LINK") {
    if (!block.linkUrl) return null;
    const Icon = LINK_ICONS[block.linkKind ?? "OTHER"];
    return (
      <section>
        {heading}
        <a
          href={block.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-xl border border-ligne bg-white p-4 transition-colors hover:border-majorelle"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-majorellel">
            <Icon className="h-5 w-5 text-majorelle" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-medium">
              {block.linkLabel ?? block.linkUrl}
            </span>
            <span className="block text-xs text-mutedink">
              {t(`adminLinkKind${block.linkKind ?? "OTHER"}`)}
            </span>
          </span>
          <ExternalLink className="h-4 w-4 shrink-0 text-mutedink" aria-hidden />
        </a>
      </section>
    );
  }

  return null;
}
