import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canEdit } from "@/lib/authz";
import { isSessionOpen } from "@/lib/lms";

/**
 * Sert un PDF de séance au navigateur.
 *
 * Deux raisons d'exister plutôt que de pointer directement sur Cloudinary :
 *  1. Cloudinary renvoie ces fichiers en "application/octet-stream" (voir la
 *     note dans lib/cloudinary.ts) — le navigateur les téléchargerait au lieu
 *     de les afficher. Ici on rétablit le bon type MIME.
 *  2. Le document n'est accessible qu'aux inscrits du programme, et seulement
 *     si la séance est ouverte — l'adresse Cloudinary n'est jamais exposée.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const blockId = Number(id);
  if (Number.isNaN(blockId)) {
    return new NextResponse("Requête invalide", { status: 400 });
  }

  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return new NextResponse("Non autorisé", { status: 401 });

  const block = await prisma.contentBlock.findUnique({
    where: { id: blockId },
    include: {
      mediaFile: true,
      session: { include: { week: { select: { opensAt: true, programId: true } } } },
    },
  });
  if (!block?.mediaFile?.url || block.type !== "PDF") {
    return new NextResponse("Introuvable", { status: 404 });
  }

  // Les éditeurs voient tout (ils préparent les séances) ; les élèves doivent
  // être inscrits ET la séance doit être ouverte.
  if (!canEdit(session)) {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_programId: { userId, programId: block.session.week.programId },
      },
      select: { status: true },
    });
    const allowed =
      enrollment &&
      enrollment.status !== "DROPPED" &&
      isSessionOpen(block.session, block.session.week);
    if (!allowed) return new NextResponse("Accès refusé", { status: 403 });
  }

  const upstream = await fetch(block.mediaFile.url);
  if (!upstream.ok || !upstream.body) {
    return new NextResponse("Fichier indisponible", { status: 502 });
  }

  const filename = `${(block.title || "document").replace(/[^\p{L}\p{N} _-]/gu, "")}.pdf`;
  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type": "application/pdf",
      // "inline" : le navigateur l'affiche dans sa visionneuse intégrée.
      "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(filename)}`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
