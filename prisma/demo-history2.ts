import type { PrismaClient } from "@prisma/client";
import { createEntry, findOrCreateCategory, hasArSlug } from "./demo-helpers";
import { getCovers } from "./demo-covers";

export async function seedHistory2(prisma: PrismaClient) {
  if (await hasArSlug(prisma, "الأدارسة")) {
    console.log("Deuxième lot histoire déjà présent — lot ignoré.");
    return;
  }
  const covers = await getCovers(prisma);

  const perIslam = await findOrCreateCategory(prisma, "HISTORY_PERIOD", {
    ar: "الفتح الإسلامي والدول المغاربية",
    fr: "Conquête musulmane et dynasties",
    en: "Islamic conquest and dynasties",
  }, 2);

  const idrissides = await createEntry(prisma, {
    type: "HISTORICAL_ENTRY",
    countries: ["MA"],
    categoryIds: [perIslam],
    coverId: covers.islamic,
    historical: { periodCategoryId: perIslam, yearStart: 788, yearEnd: 985 },
    sources: [
      { author: "ابن خلدون", title: "كتاب العِبَر" },
      { author: "Abdallah Laroui", title: "L'Histoire du Maghreb : un essai de synthèse", publisher: "François Maspero", year: 1970 },
      { title: "جامعة القرويين", publisher: "منظمة اليونسكو للتربية والعلم والثقافة", url: "https://whc.unesco.org/fr/list/170" },
    ],
    translations: [
      {
        locale: "ar",
        title: "الأدارسة",
        slug: "الأدارسة",
        summary: "أول دولة إسلامية مستقلة في المغرب الأقصى، أسّسها إدريس الأول الفارّ من بطش العباسيين سنة 788م، وأتمّ ابنه إدريس الثاني بناء مدينة فاس التي صارت حاضرة علمية كبرى.",
        body: "وصل إدريس بن عبد الله — وهو من ذرية الحسن بن علي بن أبي طالب — إلى مدينة وليلي بالمغرب سنة 788م فارّاً من ملاحقة الخليفة العباسي بعد موقعة فخ قرب مكة. بايعته قبيلة أوربة البربرية إماماً، فأسّس أول دولة إسلامية مستقلة بالمغرب الأقصى، قبل أن يُدسّ له السمّ على يد مبعوث عباسي سنة 791م.\n\nولد بعد وفاته بأشهر ابنه إدريس الثاني، الذي تولى الحكم في سن مبكرة وشرع سنة 808م في بناء مدينة فاس لتكون عاصمة الدولة. استقبلت المدينة الوليدة موجتين من اللاجئين: أندلسيون فارّون من فتنة قرطبة استقروا في «عدوة الأندلسيين»، وقرويون من إفريقية استقروا في «عدوة القرويين» — فمنحا فاس طابعها الحضاري المزدوج منذ نشأتها.\n\nفي هذا الحيّ الأخير أسّست فاطمة الفهرية — وهي امرأة ثرية من أصل قيرواني — سنة 859م مسجد وجامعة القرويين، التي يعتبرها كثير من المؤرخين أقدم مؤسسة جامعية لا تزال تعمل في العالم. تفتت الدولة الإدريسية تدريجياً بين ورثة الأسرة في القرن العاشر، وأفل نجمها أمام صعود الفاطميين ثم المرابطين، لكنها بقيت الأساس المؤسِّس للدولة المغربية وعاصمتها الروحية فاس.",
        seo: "الأدارسة: أول دولة إسلامية مستقلة بالمغرب الأقصى، وتأسيس فاس وجامعة القرويين.",
        date: "2026-07-09",
      },
      {
        locale: "fr",
        title: "Les Idrissides",
        slug: "idrissides",
        summary: "Premier État islamique indépendant du Maghreb extrême, fondé par Idris Ier en 788 après sa fuite de la répression abbasside ; son fils Idris II acheva la fondation de Fès, qui devint une grande cité savante.",
        body: "Idris ibn Abdallah — descendant de Hassan, petit-fils du Prophète — atteignit la ville de Volubilis au Maroc en 788, fuyant la répression du calife abbasside après la bataille de Fakhkh près de La Mecque. La tribu berbère des Awraba lui prêta allégeance comme imam, fondant ainsi le premier État islamique indépendant du Maghreb extrême, avant qu'il ne soit empoisonné par un émissaire abbasside en 791.\n\nSon fils Idris II, né après sa mort, accéda au pouvoir très jeune et entreprit dès 808 la construction de la ville de Fès pour en faire la capitale. La cité naissante accueillit deux vagues de réfugiés : des Andalous fuyant les troubles de Cordoue, installés dans le « quartier des Andalous », et des Kairouanais venus d'Ifriqiya, installés dans le « quartier des Kairouanais » — donnant à Fès son caractère cosmopolite dès sa naissance.\n\nC'est dans ce dernier quartier que Fatima al-Fihriya — une femme fortunée d'origine kairouanaise — fonda en 859 la mosquée-université al-Qarawiyyin, considérée par de nombreux historiens comme la plus ancienne institution universitaire encore en activité au monde. La dynastie idrisside se fragmenta progressivement entre héritiers au Xe siècle et déclina face aux Fatimides puis aux Almoravides, mais elle demeure le socle fondateur de l'État marocain et de sa capitale spirituelle, Fès.",
        seo: "Les Idrissides : premier État islamique indépendant du Maroc, fondation de Fès et de l'université al-Qarawiyyin.",
        date: "2026-07-09",
      },
    ],
  });

  const fatimides = await createEntry(prisma, {
    type: "HISTORICAL_ENTRY",
    countries: ["TN"],
    categoryIds: [perIslam],
    coverId: covers.islamic,
    historical: { periodCategoryId: perIslam, yearStart: 909, yearEnd: 973 },
    sources: [
      { author: "ابن خلدون", title: "كتاب العِبَر" },
      { author: "Charles-André Julien", title: "Histoire de l'Afrique du Nord", publisher: "Payot", year: 1951 },
      { author: "Farhat Dachraoui", title: "Le Califat fatimide au Maghreb", publisher: "STD", year: 1981 },
    ],
    translations: [
      {
        locale: "ar",
        title: "الدولة الفاطمية في إفريقية",
        slug: "الدولة-الفاطمية-في-إفريقية",
        summary: "خلافة شيعية إسماعيلية انطلقت من إفريقية سنة 909م بعد إسقاط الأغالبة، وبنت مدينة المهدية عاصمةً لها، قبل أن تنتقل إلى مصر وتترك المغرب لولاتها الزيريين.",
        body: "أعلن عبيد الله المهدي قيام الخلافة الفاطمية سنة 909م بعد أن أسقطت دعوته الإسماعيلية دولة الأغالبة بإفريقية، متخذاً لقب الخليفة استناداً إلى دعوى النسب الفاطمي. بنى مدينة المهدية على شبه جزيرة محصّنة بالساحل التونسي بين 916 و921م لتكون عاصمة حصينة تحميه من انتفاضات الخوارج التي هزّت الدولة الوليدة، وأخطرها ثورة أبي يزيد «صاحب الحمار» التي كادت تسقط الخلافة.\n\nظلت إفريقية قاعدة الفاطميين الأولى قرابة ستين عاماً، وشهدت خلالها ازدهاراً بحرياً وتجارياً، قبل أن يحقق الخليفة الرابع المعز لدين الله حلم أسلافه بفتح مصر سنة 969م وتأسيس القاهرة، فنقل إليها الخلافة سنة 973م.\n\nترك المعز حكم إفريقية لنائبه بلكين بن زيري، مؤسس الدولة الزيرية، التي بقيت موالية اسمياً للفاطميين عقوداً قبل أن يقطع المعز بن باديس الزيري الولاء ويعلن رجوعه إلى المذهب السنّي سنة 1048م — وهو القرار الذي دفع الفاطميين، حسب رواية ابن خلدون الشهيرة، إلى إطلاق قبائل بني هلال وبني سليم نحو إفريقية عقاباً لهم، في حدث سيغيّر التركيبة السكانية واللغوية للمغرب الكبير جذرياً.",
        seo: "الدولة الفاطمية في إفريقية: من المهدية إلى فتح مصر، وأصل الزحف الهلالي على المغرب الكبير.",
        date: "2026-07-09",
      },
    ],
  });

  const posteAlmohades = await createEntry(prisma, {
    type: "HISTORICAL_ENTRY",
    countries: ["TN", "DZ", "MA"],
    categoryIds: [perIslam],
    coverId: covers.islamic,
    historical: { periodCategoryId: perIslam, yearStart: 1229, yearEnd: 1574 },
    sources: [
      { author: "ابن خلدون", title: "كتاب العِبَر" },
      { author: "Charles-André Julien", title: "Histoire de l'Afrique du Nord", publisher: "Payot", year: 1951 },
      { author: "Georges Marçais", title: "L'architecture musulmane d'Occident", publisher: "Arts et métiers graphiques", year: 1954 },
    ],
    translations: [
      {
        locale: "ar",
        title: "الممالك المغاربية بعد الموحدين",
        slug: "الممالك-المغاربية-بعد-الموحدين",
        summary: "بعد تفكك الدولة الموحدية، ورثت المغرب الكبير ثلاث دول بربرية-عربية استقرت حدودها قروناً: الحفصيون بتونس، والزيانيون بتلمسان، والمرينيون بفاس.",
        body: "مع تراجع الدولة الموحدية بعد هزيمة العقاب سنة 1212م، انقسم المغرب الكبير تدريجياً بين ثلاث دول خلفتها كل واحدة في إقليمها: الحفصيون، وهم ولاة موحديون بتونس أعلنوا استقلالهم سنة 1229م وحكموا إفريقية حتى الفتح العثماني سنة 1574م؛ والزيانيون (أو بنو عبد الواد) الذين أسّسوا سنة 1236م دولة عاصمتها تلمسان استمرت حتى 1554م؛ والمرينيون الذين استولوا على فاس سنة 1244م وحكموا المغرب الأقصى حتى 1465م قبل أن يخلفهم الوطاسيون ثم السعديون.\n\nشهدت كل عاصمة من هذه العواصم الثلاث ازدهاراً عمرانياً وعلمياً خاصاً بها: الحفصيون جدّدوا أسوار تونس وقصورها، والزيانيون بنوا جامع تلمسان الكبير ومدينة المنصورة المحصّنة، والمرينيون شيّدوا مدرستي البوعنانية والعطارين بفاس، وأدخلوا نظام المدارس الدينية الذي انتشر لاحقاً في المغرب الكبير كله.\n\nيلاحظ الدارسون أن الخريطة التقريبية لهذه الممالك الثلاث — تونس والجزائر الغربية والمغرب — تتقاطع بشكل لافت مع حدود الدول المغاربية الثلاث الحديثة، مما يجعل هذه الحقبة مرجعاً لفهم عمق الجذور التاريخية لهذا التقسيم الجغرافي.",
        seo: "الممالك المغاربية بعد الموحدين: الحفصيون بتونس، الزيانيون بتلمسان، المرينيون بفاس — ثلاثة قرون مؤسِّسة.",
        date: "2026-07-09",
      },
      {
        locale: "fr",
        title: "Les royaumes maghrébins après les Almohades",
        slug: "royaumes-maghrebins-apres-almohades",
        summary: "Après la dislocation de l'empire almohade, trois États berbéro-arabes héritèrent du Maghreb et fixèrent des frontières durables : les Hafsides à Tunis, les Zianides à Tlemcen, les Mérinides à Fès.",
        body: "Avec le déclin almohade après la défaite de Las Navas de Tolosa en 1212, le Grand Maghreb se divisa progressivement entre trois États héritiers, chacun dans sa région : les Hafsides, gouverneurs almohades de Tunis qui proclamèrent leur indépendance en 1229 et régnèrent sur l'Ifriqiya jusqu'à la conquête ottomane de 1574 ; les Zianides (ou Abd al-Wadides), qui fondèrent en 1236 un État capitale Tlemcen, jusqu'en 1554 ; et les Mérinides, qui prirent Fès en 1244 et gouvernèrent le Maroc jusqu'en 1465, avant d'être remplacés par les Wattassides puis les Saadiens.\n\nChacune de ces trois capitales connut un essor architectural et savant propre : les Hafsides rénovèrent les remparts et palais de Tunis ; les Zianides bâtirent la grande mosquée de Tlemcen et la cité fortifiée de Mansourah ; les Mérinides érigèrent les médersas Bou Inania et Attarine à Fès, généralisant le système des écoles religieuses qui se répandit ensuite dans tout le Grand Maghreb.\n\nLes chercheurs relèvent que la carte approximative de ces trois royaumes — Tunisie, Algérie occidentale, Maroc — recoupe de façon frappante les frontières des trois États maghrébins modernes, faisant de cette période une référence pour comprendre la profondeur historique de ce découpage géographique.",
        seo: "Les royaumes post-almohades : Hafsides de Tunis, Zianides de Tlemcen, Mérinides de Fès — trois siècles fondateurs.",
        date: "2026-07-09",
      },
    ],
  });

  const rustamides = await createEntry(prisma, {
    type: "HISTORICAL_ENTRY",
    countries: ["DZ", "TN", "LY"],
    categoryIds: [perIslam],
    coverId: covers.islamic,
    historical: { periodCategoryId: perIslam, yearStart: 776, yearEnd: 909 },
    sources: [
      { author: "ابن خلدون", title: "كتاب العِبَر" },
      { author: "Tadeusz Lewicki", title: "Études ibadites nord-africaines", publisher: "PWN — Éditions scientifiques de Pologne", year: 1955 },
      { title: "M'Zab Valley — World Heritage List", publisher: "UNESCO", year: 1982, url: "https://whc.unesco.org/en/list/188" },
    ],
    translations: [
      {
        locale: "ar",
        title: "الإباضية ودولة تاهرت الرستمية",
        slug: "الإباضية-ودولة-تاهرت",
        summary: "مذهب إسلامي معتدل انتشر بين قبائل بربرية عديدة، وأقام دولة تاهرت الرستمية (776–909م) بالجزائر، ولا تزال جماعاته قائمة اليوم في وادي مزاب وجربة وجبل نفوسة.",
        body: "الإباضية مذهب إسلامي مستقل عن السنة والشيعة، ينسب إلى عبد الله بن إباض، ويتميز عموماً بطابعه المعتدل ونزعته نحو الانضباط الأخلاقي والتنظيم المجتمعي المحكم. وجد هذا المذهب أرضاً خصبة بين عدد من القبائل البربرية بالمغرب الأوسط منذ القرن الثاني الهجري.\n\nأسّس عبد الرحمن بن رستم سنة 776/778م دولة تاهرت (تيارت الحالية بالجزائر)، فصارت عاصمة إمامة إباضية ازدهرت بفضل موقعها على طرق التجارة الصحراوية العابرة للصحراء نحو غرب إفريقيا، وبفضل سمعتها كمركز علمي جذب طلبة من أنحاء المغرب الكبير. دام هذا الكيان قرابة قرن وربع القرن، إلى أن دمّرته الجيوش الفاطمية سنة 909م، بالتزامن مع سقوط الأغالبة بإفريقية.\n\nبعد سقوط تاهرت، لجأ الإباضيون إلى مناطق أكثر عزلة حافظت على استقلالها الديني والاجتماعي حتى اليوم: وادي مزاب بالجزائر (حيث أُسّست مدنه الخمس ابتداء من سنة 1011م تقريباً وصُنّف تراثاً عالمياً لدى اليونسكو سنة 1982م)، وجزيرة جربة بتونس، وجبل نفوسة بليبيا. تشكل هذه الجيوب الثلاثة اليوم الحضور الإباضي الرئيسي في المغرب الكبير، وتُعدّ شاهداً حياً على التعدد المذهبي الذي عرفته المنطقة تاريخياً.",
        seo: "الإباضية ودولة تاهرت الرستمية: من الجزائر القرن الثامن إلى وادي مزاب وجربة ونفوسة اليوم.",
        date: "2026-07-09",
      },
    ],
  });

  await prisma.relatedContent.createMany({
    data: [
      { fromId: fatimides.id, toId: posteAlmohades.id },
      { fromId: rustamides.id, toId: fatimides.id },
    ],
    skipDuplicates: true,
  });

  console.log("Deuxième lot histoire créé : 4 entrées (dont 2 traduites en français).");
  return { idrissides, fatimides, posteAlmohades, rustamides };
}
