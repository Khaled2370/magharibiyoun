import { youtubeId } from "@/lib/content";

export default function YoutubeEmbed({
  url,
  title,
}: {
  url: string;
  title: string;
}) {
  const id = youtubeId(url);
  if (!id) return null;
  return (
    <div className="relative aspect-video overflow-hidden rounded-xl border border-ligne bg-encre">
      <iframe
        className="absolute inset-0 h-full w-full"
        src={`https://www.youtube-nocookie.com/embed/${id}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
