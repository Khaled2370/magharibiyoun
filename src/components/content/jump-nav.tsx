"use client";

import { useEffect } from "react";

export type JumpNavItem = { key: string; label: string; count: number };

export default function JumpNav({ items }: { items: JumpNavItem[] }) {
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  function jumpTo(id: string, e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.pushState(null, "", `#${id}`);
  }

  return (
    <nav className="sticky top-0 z-10 mt-6 flex flex-wrap gap-2 border-b border-ligne bg-sable py-3">
      {items.map((s) => (
        <a
          key={s.key}
          href={`#${s.key}`}
          onClick={(e) => jumpTo(s.key, e)}
          className="rounded-full border border-ligne bg-white px-3 py-1.5 text-sm font-medium text-mutedink transition-colors hover:border-majorelle hover:text-majorelle"
        >
          {s.label} ({s.count})
        </a>
      ))}
    </nav>
  );
}
