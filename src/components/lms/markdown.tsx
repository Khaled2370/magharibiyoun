import { marked, type Token, type Tokens } from "marked";

/**
 * Affiche le texte d'un bloc de cours écrit en markdown simple.
 *
 * Aucun HTML n'est produit ni injecté : on lit les jetons de `marked` et on
 * construit des éléments React. React échappe le texte lui-même, donc rien à
 * nettoyer — ce qui a permis de retirer `isomorphic-dompurify`, dont la
 * dépendance à jsdom faisait échouer la page de séance en production (erreur
 * 500 sur Vercel alors que tout marchait en local).
 *
 * Sous-ensemble volontairement restreint : titres, paragraphes, listes,
 * citations, gras/italique, liens, code, filets. Tout le reste est rendu comme
 * du texte brut.
 */

function Inline({ tokens }: { tokens?: Token[] }) {
  if (!tokens) return null;
  return (
    <>
      {tokens.map((tk, i) => {
        switch (tk.type) {
          case "strong":
            return (
              <strong key={i} className="font-medium text-encre">
                <Inline tokens={(tk as Tokens.Strong).tokens} />
              </strong>
            );
          case "em":
            return (
              <em key={i}>
                <Inline tokens={(tk as Tokens.Em).tokens} />
              </em>
            );
          case "del":
            return (
              <del key={i}>
                <Inline tokens={(tk as Tokens.Del).tokens} />
              </del>
            );
          case "codespan":
            return (
              <code key={i} className="rounded bg-sable2 px-1 py-0.5 text-sm">
                {(tk as Tokens.Codespan).text}
              </code>
            );
          case "br":
            return <br key={i} />;
          case "link": {
            const l = tk as Tokens.Link;
            // Seuls les liens http(s) et internes sont cliquables : on écarte
            // javascript:, data:, etc.
            const safe = /^(https?:\/\/|\/)/i.test(l.href);
            if (!safe) return <span key={i}>{l.text}</span>;
            const external = l.href.startsWith("http");
            return (
              <a
                key={i}
                href={l.href}
                className="text-majorelle underline"
                {...(external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                <Inline tokens={l.tokens} />
              </a>
            );
          }
          default:
            return <span key={i}>{"text" in tk ? tk.text : ""}</span>;
        }
      })}
    </>
  );
}

function Block({ token }: { token: Token }) {
  switch (token.type) {
    case "heading": {
      const h = token as Tokens.Heading;
      const cls =
        h.depth <= 2
          ? "mt-6 mb-2 text-xl font-medium"
          : h.depth === 3
            ? "mt-5 mb-2 text-lg font-medium"
            : "mt-4 mb-1 font-medium";
      const Tag = (h.depth <= 2 ? "h2" : h.depth === 3 ? "h3" : "h4") as
        | "h2"
        | "h3"
        | "h4";
      return (
        <Tag className={cls}>
          <Inline tokens={h.tokens} />
        </Tag>
      );
    }
    case "paragraph":
      return (
        <p className="mb-4">
          <Inline tokens={(token as Tokens.Paragraph).tokens} />
        </p>
      );
    case "list": {
      const l = token as Tokens.List;
      const Tag = l.ordered ? "ol" : "ul";
      return (
        <Tag className={`mb-4 ps-6 ${l.ordered ? "list-decimal" : "list-disc"}`}>
          {l.items.map((item, i) => (
            <li key={i} className="mb-1">
              <Inline tokens={item.tokens} />
            </li>
          ))}
        </Tag>
      );
    }
    case "blockquote":
      return (
        <blockquote className="my-4 border-s-4 border-ligne ps-4 text-mutedink">
          {(token as Tokens.Blockquote).tokens.map((t, i) => (
            <Block key={i} token={t} />
          ))}
        </blockquote>
      );
    case "code":
      return (
        <pre className="mb-4 overflow-x-auto rounded-lg bg-sable2 p-3 text-sm">
          <code>{(token as Tokens.Code).text}</code>
        </pre>
      );
    case "hr":
      return <hr className="my-6 border-ligne" />;
    case "space":
      return null;
    default:
      return "text" in token && token.text ? (
        <p className="mb-4">{token.text}</p>
      ) : null;
  }
}

export default function Markdown({ source }: { source: string | null | undefined }) {
  if (!source) return null;
  const tokens = marked.lexer(source, { gfm: true, breaks: true });
  return (
    <div className="leading-loose">
      {tokens.map((t, i) => (
        <Block key={i} token={t} />
      ))}
    </div>
  );
}
