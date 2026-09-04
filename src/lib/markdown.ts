import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";

marked.setOptions({ gfm: true, breaks: true });

// Le texte des blocs de cours est saisi en markdown simple par l'admin
// (## titre, - liste, > citation, **gras**, [lien](url)) puis nettoyé
// avant affichage : on ne fait jamais confiance au HTML brut.
export function renderMarkdown(input: string | null | undefined): string {
  if (!input) return "";
  const html = marked.parse(input, { async: false }) as string;
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p", "br", "strong", "em", "del", "code", "pre",
      "h2", "h3", "h4",
      "ul", "ol", "li",
      "blockquote", "hr",
      "a", "table", "thead", "tbody", "tr", "th", "td",
    ],
    ALLOWED_ATTR: ["href", "title", "target", "rel"],
  });
}

// Classes Tailwind appliquées au HTML rendu — le projet n'utilise pas
// @tailwindcss/typography, on garde la même palette que le reste du site.
export const proseClass = [
  "leading-loose",
  "[&_p]:mb-4",
  "[&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:text-xl [&_h2]:font-medium",
  "[&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-medium",
  "[&_h4]:mt-4 [&_h4]:mb-1 [&_h4]:font-medium",
  "[&_ul]:mb-4 [&_ul]:list-disc [&_ul]:ps-6",
  "[&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:ps-6",
  "[&_li]:mb-1",
  "[&_a]:text-majorelle [&_a]:underline",
  "[&_strong]:font-medium [&_strong]:text-encre",
  "[&_blockquote]:my-4 [&_blockquote]:border-s-4 [&_blockquote]:border-ligne [&_blockquote]:ps-4 [&_blockquote]:text-mutedink",
  "[&_hr]:my-6 [&_hr]:border-ligne",
  "[&_code]:rounded [&_code]:bg-sable2 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-sm",
].join(" ");
