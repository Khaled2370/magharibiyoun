import type { PrismaClient } from "@prisma/client";
import { findOrCreateCategory, hasArSlug } from "./demo-helpers";
import { getCovers } from "./demo-covers";

async function contentIdBySlug(prisma: PrismaClient, slug: string): Promise<number | null> {
  const tr = await prisma.contentTranslation.findUnique({
    where: { locale_slug: { locale: "ar", slug } },
    select: { contentId: true },
  });
  return tr?.contentId ?? null;
}

export async function seedEducation(prisma: PrismaClient) {
  if (await hasArSlug(prisma, "قرطاج-بعيون-طفل")) {
    console.log("Contenu Éducation & Jeunesse déjà présent — lot ignoré.");
    return;
  }
  const covers = await getCovers(prisma);

  const themeHistory = await findOrCreateCategory(prisma, "EDUCATION_THEME", {
    ar: "التاريخ",
    fr: "Histoire",
    en: "History",
  }, 1);
  const themeCulture = await findOrCreateCategory(prisma, "EDUCATION_THEME", {
    ar: "الثقافة",
    fr: "Culture",
    en: "Culture",
  }, 2);

  const carthageId = await contentIdBySlug(prisma, "قرطاج");
  const ibnKhaldounId = await contentIdBySlug(prisma, "ابن-خلدون");

  // 1. Fiche enfants : قرطاج
  const kidsSheet = await prisma.content.create({
    data: {
      type: "EDUCATIONAL",
      validationLevel: "COMMUNITY",
      categories: { create: [{ categoryId: themeHistory }] },
      countries: { create: [{ countryCode: "TN" }] },
      media: covers.antique ? { create: [{ mediaFileId: covers.antique }] } : undefined,
      educational: {
        create: {
          ageRange: "KIDS",
          format: "SHEET",
          difficulty: "EASY",
          sourceContentId: carthageId,
          downloadable: false,
        },
      },
      translations: {
        create: [
          {
            locale: "ar",
            title: "قرطاج بعيون طفل",
            slug: "قرطاج-بعيون-طفل",
            summary: "هل تعرف أن مدينة قديمة جداً في تونس كانت يوماً من أقوى المدن في العالم؟ تعال نكتشف قصة قرطاج بطريقة سهلة وممتعة!",
            body: "منذ زمن بعيد جداً، أبعد من زمن جدّك وجدّتك بكثير، جاء أناس من بلاد بعيدة اسمها فينيقيا (بلاد لبنان اليوم) وبنوا مدينة جميلة على شاطئ البحر في تونس. سمّوها قرطاج، ومعناها «المدينة الجديدة».\n\nكبرت قرطاج وصارت قوية جداً، وامتلكت سفناً كثيرة تجوب البحر الأبيض المتوسط كله للتجارة. كان أهلها بحّارة ماهرين وتجّاراً أذكياء.\n\nأشهر قائد عرفته قرطاج اسمه حنبعل. فعل حنبعل شيئاً لا يُصدَّق: قاد جيشاً ومعه أفيال ضخمة، وعبر بها جبالاً مغطاة بالثلوج تسمى جبال الألب، ليصل إلى بلاد إيطاليا! تخيّل معي فيلاً يمشي فوق الثلج!\n\nحاربت قرطاج مدينة روما القوية في حروب كبيرة، وفي النهاية انتصرت روما وهدمت قرطاج. لكن الناس لم ينسوا قرطاج أبداً، وبقيت آثارها في تونس إلى يومنا هذا، ويزورها آلاف السياح كل سنة ليروا أين عاش أهلها منذ آلاف السنين.",
            status: "PUBLISHED",
            isOriginal: true,
            publishedAt: new Date("2026-07-11"),
          },
          {
            locale: "fr",
            title: "Carthage racontée aux enfants",
            slug: "carthage-racontee-aux-enfants",
            summary: "Savais-tu qu'une très vieille ville de Tunisie a un jour été l'une des plus puissantes du monde ? Viens découvrir l'histoire de Carthage, racontée simplement !",
            body: "Il y a très, très longtemps, bien avant l'époque de tes grands-parents, des gens venus d'un pays lointain appelé Phénicie (le Liban d'aujourd'hui) ont construit une belle ville au bord de la mer, en Tunisie. Ils l'ont appelée Carthage, ce qui veut dire « la ville nouvelle ».\n\nCarthage a grandi et est devenue très puissante, avec de nombreux bateaux qui parcouraient toute la mer Méditerranée pour faire du commerce. Ses habitants étaient d'excellents marins et de très bons commerçants.\n\nLe chef le plus célèbre de Carthage s'appelait Hannibal. Il a fait quelque chose d'incroyable : il a mené une armée, avec d'énormes éléphants, à travers des montagnes couvertes de neige appelées les Alpes, pour atteindre l'Italie ! Imagine un éléphant qui marche dans la neige !\n\nCarthage a combattu la puissante ville de Rome lors de grandes guerres, et à la fin, Rome a gagné et a détruit Carthage. Mais les gens n'ont jamais oublié Carthage, et ses ruines existent encore aujourd'hui en Tunisie : des milliers de touristes viennent chaque année voir où vivaient ses habitants il y a des milliers d'années.",
            status: "PUBLISHED",
            publishedAt: new Date("2026-07-11"),
          },
        ],
      },
    },
  });

  // 2. Fiche ados : ابن خلدون
  await prisma.content.create({
    data: {
      type: "EDUCATIONAL",
      validationLevel: "COMMUNITY",
      categories: { create: [{ categoryId: themeHistory }] },
      countries: { create: [{ countryCode: "TN" }] },
      media: covers.portrait ? { create: [{ mediaFileId: covers.portrait }] } : undefined,
      educational: {
        create: {
          ageRange: "TEENS",
          format: "SHEET",
          difficulty: "MEDIUM",
          sourceContentId: ibnKhaldounId,
          downloadable: false,
        },
      },
      translations: {
        create: [
          {
            locale: "ar",
            title: "ابن خلدون: أول من فهم كيف تُبنى الحضارات",
            slug: "ابن-خلدون-للمراهقين",
            summary: "مؤرخ من تونس عاش قبل 700 سنة، ووضع أفكاراً عن المجتمع ما زالت تُدرَّس اليوم في أرقى الجامعات — قصة رجل غيّر طريقة تفكيرنا في التاريخ.",
            body: "تخيّل شخصاً عاش في القرن الرابع عشر، أي قبل نحو 700 سنة، ومع ذلك وضع نظريات عن المجتمع لا يزال علماء الاجتماع يدرسونها اليوم. هذا هو ابن خلدون، وُلد في تونس سنة 1332م.\n\nعاش ابن خلدون حياة مليئة بالمغامرات: عمل وزيراً وقاضياً، وسُجن، وتنقّل بين تونس وفاس وغرناطة والقاهرة. وفي لحظة هدوء نادرة، اختبأ في قلعة صغيرة بالجزائر، وهناك كتب أعظم كتاب في حياته: «المقدمة».\n\nفي هذا الكتاب، طرح ابن خلدون سؤالاً بسيطاً في الظاهر: لماذا تقوى بعض الدول ثم تضعف وتسقط؟ أجاب بفكرة سمّاها «العصبية» — أي الروح الجماعية التي تجمع الناس وتجعلهم يبنون دولة قوية، لكن هذه الروح تضعف مع الوقت والترف، فتسقط الدولة أمام قوة جديدة أكثر تماسكاً.\n\nاليوم، يعتبر مؤرخون من كل أنحاء العالم — لا العرب فقط — ابن خلدون أول من درس التاريخ والمجتمع بطريقة علمية منهجية، قبل أن تظهر كلمة «علم الاجتماع» بقرون. وهو فخر حقيقي لكل شباب المغرب الكبير.",
            status: "PUBLISHED",
            isOriginal: true,
            publishedAt: new Date("2026-07-11"),
          },
        ],
      },
    },
  });

  // 3. Glossaire simplifié
  const glossary = await prisma.content.create({
    data: {
      type: "EDUCATIONAL",
      validationLevel: "COMMUNITY",
      categories: { create: [{ categoryId: themeHistory }, { categoryId: themeCulture }] },
      media: covers.calligraphy ? { create: [{ mediaFileId: covers.calligraphy }] } : undefined,
      educational: {
        create: { ageRange: "FAMILIES", format: "GLOSSARY", difficulty: "EASY" },
      },
      translations: {
        create: [
          {
            locale: "ar",
            title: "معجم مبسّط: كلمات من تاريخ المغرب الكبير",
            slug: "معجم-مبسط-المغرب-الكبير",
            summary: "لا تعرف معنى «الاتحاد المغاربي» أو «الحقبة العثمانية»؟ هذا المعجم يشرح لك أهم الكلمات بلغة بسيطة، ليناسب كل أفراد العائلة.",
            body: "المغرب الكبير: التسمية التي تجمع خمسة بلدان متجاورة في شمال إفريقيا: تونس والجزائر والمغرب وليبيا وموريتانيا.\n\nاتحاد المغرب العربي: منظمة أسّستها البلدان الخمسة سنة 1989 لتنسيق التعاون بينها.\n\nالأمازيغ: السكان الأصليون لشمال إفريقيا، الذين تعود جذورهم إلى ما قبل وصول العرب، ولهم لغتهم وثقافتهم الخاصة.\n\nالفتح الإسلامي: وصول الإسلام إلى شمال إفريقيا في القرن السابع الميلادي، وما تلاه من قيام دول ودول إسلامية في المنطقة.\n\nالاستعمار: فترة سيطرت خلالها دول أوروبية (فرنسا وإسبانيا وإيطاليا) على بلدان المغرب الكبير، بين القرن التاسع عشر ومنتصف القرن العشرين.\n\nالاستقلال: تحرر كل بلد من بلدان المغرب الكبير من الاستعمار، وهي مرحلة تمت بين سنتي 1951 و1962.\n\nتيفيناغ: الحروف القديمة التي تُكتب بها اللغة الأمازيغية.\n\nاليونسكو: منظمة تابعة للأمم المتحدة تُعنى بحماية التراث الثقافي حول العالم، وقد صنّفت عدة عناصر من تراث المغرب الكبير ضمن التراث الإنساني.",
            status: "PUBLISHED",
            isOriginal: true,
            publishedAt: new Date("2026-07-11"),
          },
        ],
      },
    },
  });

  // 4. Chronologie simplifiée
  const timeline = await prisma.content.create({
    data: {
      type: "EDUCATIONAL",
      validationLevel: "COMMUNITY",
      categories: { create: [{ categoryId: themeHistory }] },
      media: covers.modern ? { create: [{ mediaFileId: covers.modern }] } : undefined,
      educational: {
        create: { ageRange: "FAMILIES", format: "TIMELINE", difficulty: "EASY" },
      },
      translations: {
        create: [
          {
            locale: "ar",
            title: "خط زمني مبسّط: محطات كبرى في تاريخ المغرب الكبير",
            slug: "خط-زمني-مبسط-المغرب-الكبير",
            summary: "رحلة سريعة عبر أهم محطات تاريخ المغرب الكبير، من قرطاج القديمة إلى الاستقلالات — بلغة بسيطة لكل العائلة.",
            body: "814 ق.م: الفينيقيون يؤسّسون مدينة قرطاج في تونس.\n\n670م: عقبة بن نافع يؤسّس مدينة القيروان، أول حاضرة إسلامية كبرى في المغرب الكبير.\n\n788م: إدريس الأول يؤسّس أول دولة إسلامية مستقلة بالمغرب الأقصى، وابنه يبني مدينة فاس.\n\n1040م تقريباً: قيام دولة المرابطين التي بنت مدينة مراكش ووحّدت غرب المغرب الكبير مع الأندلس.\n\n1121م: انطلاق الدولة الموحدية التي وحّدت المغرب الكبير كله لأول مرة في التاريخ.\n\n1830 إلى 1912: فرنسا وإسبانيا وإيطاليا يستعمرون بلدان المغرب الكبير الواحد تلو الآخر.\n\n1951 إلى 1962: استقلال ليبيا ثم تونس والمغرب ثم موريتانيا وأخيراً الجزائر.\n\n1989: تأسيس اتحاد المغرب العربي الذي يجمع البلدان الخمسة.",
            status: "PUBLISHED",
            isOriginal: true,
            publishedAt: new Date("2026-07-11"),
          },
        ],
      },
    },
  });

  // 5. Quiz
  const quizContent = await prisma.content.create({
    data: {
      type: "EDUCATIONAL",
      validationLevel: "COMMUNITY",
      categories: { create: [{ categoryId: themeHistory }] },
      media: covers.network ? { create: [{ mediaFileId: covers.network }] } : undefined,
      educational: {
        create: { ageRange: "TEENS", format: "QUIZ", difficulty: "EASY" },
      },
      translations: {
        create: [
          {
            locale: "ar",
            title: "اختبر معلوماتك: المغرب الكبير",
            slug: "اختبار-المغرب-الكبير",
            summary: "خمسة أسئلة سريعة لتختبر ما تعلّمته من فيشات الموسوعة — كل إجابة مبنية على معلومات موثّقة منشورة في مغاربيون.",
            body: "أجب عن الأسئلة الخمسة التالية، وستظهر لك النتيجة والتفسير فور كل إجابة.",
            status: "PUBLISHED",
            isOriginal: true,
            publishedAt: new Date("2026-07-11"),
          },
        ],
      },
      quiz: {
        create: {
          questions: {
            create: [
              {
                sortOrder: 0,
                prompt: { ar: "من أسّس مدينة فاس؟" },
                choices: ["يوسف بن تاشفين", "إدريس الثاني", "عقبة بن نافع", "حنبعل"],
                correctIndex: 1,
                explanation: { ar: "أسّس إدريس الثاني مدينة فاس سنة 808م لتكون عاصمة الدولة الإدريسية." },
              },
              {
                sortOrder: 1,
                prompt: { ar: "في أي مدينة وُلد ابن خلدون؟" },
                choices: ["فاس", "تونس", "القاهرة", "تلمسان"],
                correctIndex: 1,
                explanation: { ar: "وُلد ابن خلدون بمدينة تونس سنة 1332م." },
              },
              {
                sortOrder: 2,
                prompt: { ar: "ما الطبق المغاربي الذي أدرجته اليونسكو تراثاً إنسانياً سنة 2020 بملف مشترك بين أربع دول؟" },
                choices: ["الطاجين", "الكسكسي", "الحريرة", "البسطيلة"],
                correctIndex: 1,
                explanation: { ar: "أدرجت اليونسكو الكسكسي سنة 2020 بملف مشترك بين الجزائر وموريتانيا والمغرب وتونس." },
              },
              {
                sortOrder: 3,
                prompt: { ar: "في أي سنة كانت ليبيا أول دولة مغاربية تنال استقلالها؟" },
                choices: ["1956", "1951", "1960", "1962"],
                correctIndex: 1,
                explanation: { ar: "نالت ليبيا استقلالها في 24 ديسمبر 1951، وكانت أول دولة مغاربية مستقلة." },
              },
              {
                sortOrder: 4,
                prompt: { ar: "من هم الذين أسّسوا مدينة قرطاج؟" },
                choices: ["الرومان", "الفينيقيون", "الأمازيغ", "العثمانيون"],
                correctIndex: 1,
                explanation: { ar: "أسّس الفينيقيون القادمون من صور مدينة قرطاج حوالي سنة 814 ق.م." },
              },
            ],
          },
        },
      },
    },
  });

  // 6. Parcours "اكتشف المغرب الكبير"
  const pathSteps: { slug: string; note: string }[] = [
    { slug: "قرطاج-بعيون-طفل", note: "kids sheet" },
    { slug: "نوميديا", note: "real entry" },
    { slug: "الأدارسة", note: "real entry" },
    { slug: "خط-زمني-مبسط-المغرب-الكبير", note: "timeline" },
    { slug: "اختبار-المغرب-الكبير", note: "quiz" },
  ];
  const path = await prisma.content.create({
    data: {
      type: "LEARNING_PATH",
      validationLevel: "COMMUNITY",
      isFeatured: true,
      media: covers.network ? { create: [{ mediaFileId: covers.network }] } : undefined,
      translations: {
        create: [
          {
            locale: "ar",
            title: "اكتشف المغرب الكبير",
            slug: "اكتشف-المغرب-الكبير",
            summary: "مسار تعلّم مرتّب يأخذك في جولة سريعة عبر تاريخ المغرب الكبير وثقافته، من قرطاج القديمة إلى اختبار يقيس ما تعلّمته.",
            body: "لا تعرف من أين تبدأ اكتشاف المغرب الكبير؟ هذا المسار يرتّب لك خمس محطات بسيطة: فيشة للأطفال، ثم فيشتان موسوعيتان حقيقيتان، ثم خط زمني مبسّط، وأخيراً اختبار لتتحقق مما تعلّمته.",
            status: "PUBLISHED",
            isOriginal: true,
            publishedAt: new Date("2026-07-11"),
          },
          {
            locale: "fr",
            title: "Découvrir le Grand Maghreb",
            slug: "decouvrir-le-grand-maghreb",
            summary: "Un parcours guidé qui vous emmène en un tour rapide à travers l'histoire et la culture du Grand Maghreb, de l'antique Carthage à un quiz pour vérifier ce que vous avez appris.",
            body: "Vous ne savez pas par où commencer pour découvrir le Grand Maghreb ? Ce parcours organise cinq étapes simples : une fiche pour enfants, deux vraies fiches encyclopédiques, une chronologie simplifiée, et enfin un quiz pour vérifier ce que vous avez retenu.",
            status: "PUBLISHED",
            publishedAt: new Date("2026-07-11"),
          },
        ],
      },
    },
  });

  let order = 0;
  for (const step of pathSteps) {
    const targetId = await contentIdBySlug(prisma, step.slug);
    if (!targetId) {
      console.warn(`Étape de parcours introuvable : ${step.slug}`);
      continue;
    }
    await prisma.learningPathStep.create({
      data: { pathContentId: path.id, targetContentId: targetId, sortOrder: order++ },
    });
  }

  await prisma.relatedContent.createMany({
    data: [
      { fromId: kidsSheet.id, toId: glossary.id },
      { fromId: timeline.id, toId: quizContent.id },
    ],
    skipDuplicates: true,
  });

  console.log("Contenu Éducation & Jeunesse créé : 5 fiches + 1 parcours (5 étapes).");
}
