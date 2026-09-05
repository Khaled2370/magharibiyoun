import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ar", "fr", "en"],
  defaultLocale: "ar",
  localePrefix: "as-needed",
  localeDetection: false,
  pathnames: {
    "/": "/",
    "/encyclopedia": {
      ar: "/الموسوعة",
      fr: "/encyclopedie",
      en: "/encyclopedia",
    },
    "/initiatives": {
      ar: "/مبادرات",
      fr: "/initiatives",
      en: "/initiatives",
    },
    "/opinions": {
      ar: "/آراء",
      fr: "/opinions",
      en: "/opinions",
    },
    "/learn": {
      ar: "/تعلم",
      fr: "/apprendre",
      en: "/learn",
    },
    "/media": {
      ar: "/بودكاست",
      fr: "/mediatheque",
      en: "/media",
    },
    "/contribute": {
      ar: "/ساهم",
      fr: "/contribuer",
      en: "/contribute",
    },
    "/about": {
      ar: "/من-نحن",
      fr: "/a-propos",
      en: "/about",
    },
    "/login": {
      ar: "/دخول",
      fr: "/connexion",
      en: "/login",
    },
    "/register": {
      ar: "/تسجيل",
      fr: "/inscription",
      en: "/register",
    },
    "/account": {
      ar: "/حسابي",
      fr: "/mon-compte",
      en: "/account",
    },
    "/encyclopedia/[slug]": {
      ar: "/الموسوعة/[slug]",
      fr: "/encyclopedie/[slug]",
      en: "/encyclopedia/[slug]",
    },
    "/opinions/[slug]": {
      ar: "/آراء/[slug]",
      fr: "/opinions/[slug]",
      en: "/opinions/[slug]",
    },
    "/initiatives/[slug]": {
      ar: "/مبادرات/[slug]",
      fr: "/initiatives/[slug]",
      en: "/initiatives/[slug]",
    },
    "/media/[slug]": {
      ar: "/بودكاست/[slug]",
      fr: "/mediatheque/[slug]",
      en: "/media/[slug]",
    },
    "/learn/[slug]": {
      ar: "/تعلم/[slug]",
      fr: "/apprendre/[slug]",
      en: "/learn/[slug]",
    },
    "/learn/programs": {
      ar: "/تعلم/برامج",
      fr: "/apprendre/programmes",
      en: "/learn/programs",
    },
    "/learn/programs/[slug]": {
      ar: "/تعلم/برامج/[slug]",
      fr: "/apprendre/programmes/[slug]",
      en: "/learn/programs/[slug]",
    },
    "/learn/dashboard": {
      ar: "/تعلم/لوحتي",
      fr: "/apprendre/tableau-de-bord",
      en: "/learn/dashboard",
    },
    "/learn/my-programs": {
      ar: "/تعلم/برامجي",
      fr: "/apprendre/mes-programmes",
      en: "/learn/my-programs",
    },
    "/learn/calendar": {
      ar: "/تعلم/التقويم",
      fr: "/apprendre/calendrier",
      en: "/learn/calendar",
    },
    "/learn/notes": {
      ar: "/تعلم/ملاحظاتي",
      fr: "/apprendre/mes-notes",
      en: "/learn/notes",
    },
    "/learn/session/[slug]": {
      ar: "/تعلم/حصة/[slug]",
      fr: "/apprendre/seance/[slug]",
      en: "/learn/session/[slug]",
    },
    "/learn/exam/[weekId]": {
      ar: "/تعلم/اختبار/[weekId]",
      fr: "/apprendre/examen/[weekId]",
      en: "/learn/exam/[weekId]",
    },
    "/learn/review/[weekId]": {
      ar: "/تعلم/مراجعة/[weekId]",
      fr: "/apprendre/revision/[weekId]",
      en: "/learn/review/[weekId]",
    },
    "/learn/certificate/[code]": {
      ar: "/تعلم/شهادة/[code]",
      fr: "/apprendre/certificat/[code]",
      en: "/learn/certificate/[code]",
    },
    "/admin": {
      ar: "/الإدارة",
      fr: "/admin",
      en: "/admin",
    },
    "/admin/new": {
      ar: "/الإدارة/جديد",
      fr: "/admin/nouveau",
      en: "/admin/new",
    },
    "/admin/edit/[id]": {
      ar: "/الإدارة/تحرير/[id]",
      fr: "/admin/modifier/[id]",
      en: "/admin/edit/[id]",
    },
    "/admin/contributions": {
      ar: "/الإدارة/المساهمات",
      fr: "/admin/contributions",
      en: "/admin/contributions",
    },
    "/admin/programs": {
      ar: "/الإدارة/برامج",
      fr: "/admin/programmes",
      en: "/admin/programs",
    },
    "/admin/programs/new": {
      ar: "/الإدارة/برامج/جديد",
      fr: "/admin/programmes/nouveau",
      en: "/admin/programs/new",
    },
    "/admin/programs/[id]": {
      ar: "/الإدارة/برامج/[id]",
      fr: "/admin/programmes/[id]",
      en: "/admin/programs/[id]",
    },
    "/admin/programs/[id]/sessions/[sessionId]": {
      ar: "/الإدارة/برامج/[id]/حصص/[sessionId]",
      fr: "/admin/programmes/[id]/seances/[sessionId]",
      en: "/admin/programs/[id]/sessions/[sessionId]",
    },
    "/admin/programs/[id]/announcements": {
      ar: "/الإدارة/برامج/[id]/إعلانات",
      fr: "/admin/programmes/[id]/annonces",
      en: "/admin/programs/[id]/announcements",
    },
    "/admin/programs/[id]/exam/[weekId]": {
      ar: "/الإدارة/برامج/[id]/اختبار/[weekId]",
      fr: "/admin/programmes/[id]/examen/[weekId]",
      en: "/admin/programs/[id]/exam/[weekId]",
    },
    "/admin/programs/[id]/students": {
      ar: "/الإدارة/برامج/[id]/الطلبة",
      fr: "/admin/programmes/[id]/eleves",
      en: "/admin/programs/[id]/students",
    },
    "/admin/calendar": {
      ar: "/الإدارة/التقويم",
      fr: "/admin/calendrier",
      en: "/admin/calendar",
    },
  },
});

export type AppPathname = keyof typeof routing.pathnames;
