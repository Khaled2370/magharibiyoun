import type { PrismaClient } from "@prisma/client";
import { createEntry, findOrCreateCategory, hasArSlug } from "./demo-helpers";
import { getCovers } from "./demo-covers";

export async function seedInitiativeVGM(prisma: PrismaClient) {
  if (await hasArSlug(prisma, "دولة-المغرب-الكبير-الافتراضية")) {
    console.log("Initiative Virtual Great Maghreb déjà présente — ignorée.");
    return;
  }
  const covers = await getCovers(prisma);

  const domInteg = await findOrCreateCategory(prisma, "INITIATIVE_DOMAIN", {
    ar: "التكامل الإقليمي",
    fr: "Intégration régionale",
    en: "Regional integration",
  }, 1);

  await createEntry(prisma, {
    type: "INITIATIVE",
    level: "VERIFIED",
    countries: ["TN", "DZ", "MA", "LY", "MR"],
    categoryIds: [domInteg],
    coverId: covers.network,
    initiative: {
      actorType: "DIGITAL_PLATFORM",
      state: "ACTIVE",
      foundedYear: 2020,
      founders: "خالد الرحموني",
      isVerified: true,
      lastVerifiedAt: new Date("2026-07-10"),
      officialLinks: [
        { label: "الموقع الرسمي", url: "https://virtualgreatmaghreb.org" },
        { label: "LinkedIn", url: "https://www.linkedin.com/company/virtual-great-maghreb" },
      ],
    },
    sources: [
      { title: "تصريح مباشر من المؤسس خالد الرحموني", publisher: "مغاربيون", year: 2026 },
      { title: "Virtual Great Maghreb — Company Profile", publisher: "LinkedIn", url: "https://www.linkedin.com/company/virtual-great-maghreb" },
      { title: "دولة المغرب الكبير الإفتراضية", publisher: "virtualgreatmaghreb.org", url: "https://virtualgreatmaghreb.org/" },
    ],
    translations: [
      {
        locale: "ar",
        title: "دولة المغرب الكبير الافتراضية",
        slug: "دولة-المغرب-الكبير-الافتراضية",
        summary: "مبادرة مواطنة رقمية تأسست بتونس سنة 2020، تقدّم نفسها «دولة افتراضية» تجمع المؤمنين بوحدة المغرب الكبير من بلدانه الخمسة عبر موقع إلكتروني ووسائل التواصل الاجتماعي.",
        body: "«دولة المغرب الكبير الافتراضية» مشروع مواطن رقمي أسّسه خالد الرحموني انطلاقاً من تونس سنة 2020، يقدّم نفسه بوصفه «دولة» رمزية في الفضاء السيبراني تضم مواطنين افتراضيين من البلدان المغاربية الخمسة: ليبيا وتونس والجزائر والمغرب وموريتانيا. شعاره المعلن، كما ورد في صفحته الرسمية، هو تحويل «الحلم المغاربي المفقود» إلى واقع.\n\nيتمحور محتوى الموقع حول التاريخ المشترك للمغرب الكبير، وحتمية الاندماج المغاربي، وأقسام من نوع «المغرب الكبير بالأرقام»، وسِيَر أعلام تاريخيين كابن خلدون وعمر المختار، إلى جانب محتوى ثقافي وسياحي، وفعاليات واحتفالات بذكرى التأسيس السنوية. تنشط المبادرة بشكل رئيسي عبر موقعها الإلكتروني وصفحاتها على فيسبوك ولينكدإن.\n\nتُعدّ هذه المبادرة سابقة مواطنة لمنصة «مغاربيون» نفسها: فقد سبق لمؤسسها أن اشتغل منذ 2020 على فكرة الوحدة المغاربية عبر هذا المشروع الرقمي، قبل أن يتطور الاهتمام لاحقاً نحو بناء موسوعة مغاربية أشمل وأكثر تنظيماً.",
        seo: "دولة المغرب الكبير الافتراضية: مبادرة مواطنة رقمية تونسية تأسست 2020 لتجميع المؤمنين بالوحدة المغاربية.",
        date: "2026-07-10",
      },
      {
        locale: "fr",
        title: "L'État virtuel du Grand Maghreb (Virtual Great Maghreb)",
        slug: "virtual-great-maghreb",
        summary: "Initiative citoyenne numérique fondée en Tunisie en 2020, se présentant comme un « État virtuel » réunissant les croyants en l'unité du Grand Maghreb à travers ses cinq pays, via un site web et les réseaux sociaux.",
        body: "« Virtual Great Maghreb » (دولة المغرب الكبير الافتراضية) est un projet citoyen numérique fondé par Khaled Rahmouni depuis la Tunisie en 2020, qui se présente comme un « État » symbolique dans l'espace cybernétique, rassemblant des citoyens virtuels des cinq pays du Grand Maghreb : Libye, Tunisie, Algérie, Maroc et Mauritanie. Sa devise affichée, telle qu'elle apparaît sur sa présentation officielle, est de transformer « le rêve maghrébin perdu » en réalité.\n\nLe contenu du site s'articule autour de l'histoire commune du Grand Maghreb, du caractère jugé inévitable de l'intégration maghrébine, de rubriques telles que « le Maghreb en chiffres », de biographies de figures historiques comme Ibn Khaldoun et Omar Mukhtar, ainsi que de contenus culturels et touristiques, et d'événements marquant l'anniversaire annuel de sa fondation. L'initiative est principalement active via son site web et ses pages Facebook et LinkedIn.\n\nCette initiative constitue en réalité un précédent citoyen à la plateforme Magharibiyoun elle-même : son fondateur avait déjà travaillé dès 2020 sur l'idée de l'unité maghrébine à travers ce projet numérique, avant que cet intérêt n'évolue vers la construction d'une encyclopédie maghrébine plus large et plus structurée.",
        seo: "Virtual Great Maghreb : initiative citoyenne numérique tunisienne fondée en 2020 pour l'unité du Grand Maghreb.",
        date: "2026-07-10",
      },
    ],
  });

  console.log("Initiative Virtual Great Maghreb créée (ar + fr).");
}
