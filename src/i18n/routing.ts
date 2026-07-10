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
  },
});

export type AppPathname = keyof typeof routing.pathnames;
