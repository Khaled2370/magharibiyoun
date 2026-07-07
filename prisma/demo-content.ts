import { PrismaClient } from "@prisma/client";

export async function seedDemoContent(prisma: PrismaClient) {
  const existing = await prisma.content.count();
  if (existing > 0) {
    console.log("Contenu déjà présent — seed de démonstration ignoré.");
    return;
  }

  const cat = (module: "HISTORY_PERIOD" | "OPINION_CATEGORY" | "INITIATIVE_DOMAIN" | "CULTURAL_DOMAIN", labels: object, sortOrder = 0) =>
    prisma.category.create({ data: { module, labels, sortOrder } });

  const perAntiq = await cat("HISTORY_PERIOD", { ar: "العصور القديمة", fr: "Antiquité", en: "Antiquity" }, 1);
  const perIslam = await cat("HISTORY_PERIOD", { ar: "الفتح الإسلامي والدول المغاربية", fr: "Conquête musulmane et dynasties", en: "Islamic conquest and dynasties" }, 2);
  const perModern = await cat("HISTORY_PERIOD", { ar: "الاستقلالات وبناء الدول", fr: "Indépendances et États modernes", en: "Independence and modern states" }, 3);
  const opFuture = await cat("OPINION_CATEGORY", { ar: "مستقبل المغرب", fr: "Avenir du Maghreb", en: "Future of the Maghreb" }, 1);
  const opEdu = await cat("OPINION_CATEGORY", { ar: "التعليم والجامعة", fr: "Éducation et université", en: "Education and university" }, 2);
  const opDiaspora = await cat("OPINION_CATEGORY", { ar: "الجالية", fr: "Diaspora", en: "Diaspora" }, 3);
  const domInteg = await cat("INITIATIVE_DOMAIN", { ar: "التكامل الإقليمي", fr: "Intégration régionale", en: "Regional integration" }, 1);
  const domEdu = await cat("INITIATIVE_DOMAIN", { ar: "التعليم والبحث", fr: "Éducation et recherche", en: "Education and research" }, 2);
  const domCulture = await cat("INITIATIVE_DOMAIN", { ar: "الثقافة والمهرجانات", fr: "Culture et festivals", en: "Culture and festivals" }, 3);
  const culFood = await cat("CULTURAL_DOMAIN", { ar: "المطبخ المغاربي", fr: "Gastronomie", en: "Gastronomy" }, 1);
  const culMusic = await cat("CULTURAL_DOMAIN", { ar: "الموسيقى والغناء", fr: "Musique et chant", en: "Music and song" }, 2);

  // ── Histoire ──

  const carthage = await prisma.content.create({
    data: {
      type: "HISTORICAL_ENTRY",
      validationLevel: "VERIFIED",
      isFeatured: true,
      countries: { create: [{ countryCode: "TN" }] },
      categories: { create: [{ categoryId: perAntiq.id }] },
      historical: { create: { periodCategoryId: perAntiq.id, yearStart: -814, yearEnd: -146 } },
      sources: {
        create: [
          { sortOrder: 1, source: { create: { kind: "book", author: "ابن خلدون", title: "كتاب العِبَر وديوان المبتدأ والخبر", year: 1377 } } },
          { sortOrder: 2, source: { create: { kind: "book", author: "Serge Lancel", title: "Carthage", publisher: "Fayard", year: 1992 } } },
          { sortOrder: 3, source: { create: { kind: "book", author: "محمد حسين فنطر", title: "قرطاج: الحضارة والتاريخ", year: 1998 } } },
        ],
      },
      translations: {
        create: [
          {
            locale: "ar",
            title: "قرطاج",
            slug: "قرطاج",
            summary: "مدينة ودولة تاريخية أسّسها الفينيقيون على خليج تونس حوالي سنة 814 ق.م، تحوّلت إلى قوة بحرية وتجارية كبرى في غرب المتوسط قبل أن تسقط أمام روما سنة 146 ق.م.",
            body: "تروي المصادر القديمة أن الأميرة الفينيقية عليسة (أليسار) وصلت إلى خليج تونس قادمةً من صور حوالي سنة 814 ق.م، فأسّست مدينة «قرت حدشت» أي «المدينة الجديدة». نمت المستوطنة الصغيرة بسرعة بفضل موقعها الاستثنائي بين حوضي المتوسط، وتحوّلت خلال قرون قليلة إلى عاصمة إمبراطورية بحرية تمتد مراكزها التجارية من سواحل ليبيا إلى جنوب الأندلس.\n\nقام ازدهار قرطاج على التجارة البحرية والزراعة المتطورة؛ وقد ترجم الرومان أنفسهم كتاب الزراعة القرطاجي لماغون واعتمدوه مرجعاً. كما عرفت المدينة نظاماً سياسياً وصفه أرسطو بالإعجاب في كتابه «السياسة»، يقوم على توازن بين الملوك (السوفيتيم) ومجلس الشيوخ والشعب.\n\nدخلت قرطاج في صراع طويل مع روما عُرف بالحروب البونيقية الثلاث. اشتهرت الحرب الثانية بعبور القائد حنبعل برقة جبال الألب بجيشه وفيلته سنة 218 ق.م وانتصاراته الساحقة في إيطاليا، قبل أن تنقلب الموازين وتُهزم قرطاج في معركة زاما سنة 202 ق.م. وفي سنة 146 ق.م دمّر الرومان المدينة تدميراً كاملاً بعد حصار ثلاث سنوات، ثم أعادوا بناءها لاحقاً لتصبح من كبريات مدن الإمبراطورية. صُنّف الموقع الأثري لقرطاج ضمن التراث العالمي لليونسكو سنة 1979.",
            status: "PUBLISHED",
            isOriginal: true,
            publishedAt: new Date("2026-06-20"),
            seoDescription: "قرطاج: من التأسيس الفينيقي إلى الحروب البونيقية — تاريخ القوة المتوسطية الكبرى التي واجهت روما.",
          },
          {
            locale: "fr",
            title: "Carthage",
            slug: "carthage",
            summary: "Cité et puissance historique fondée par les Phéniciens sur le golfe de Tunis vers 814 av. J.-C., devenue une grande puissance maritime de la Méditerranée occidentale avant de tomber face à Rome en 146 av. J.-C.",
            body: "Selon les sources antiques, la princesse phénicienne Élissa (Didon) arriva de Tyr sur le golfe de Tunis vers 814 av. J.-C. et y fonda « Qart Hadasht », la « ville nouvelle ». Grâce à sa position exceptionnelle entre les deux bassins de la Méditerranée, le comptoir devint en quelques siècles la capitale d'un empire maritime dont les comptoirs s'étendaient des côtes libyennes au sud de l'Espagne.\n\nLa prospérité de Carthage reposait sur le commerce maritime et une agriculture avancée : les Romains eux-mêmes firent traduire le traité d'agronomie du Carthaginois Magon. Aristote décrivit avec admiration, dans « La Politique », l'équilibre institutionnel de la cité entre les suffètes, le conseil des anciens et le peuple.\n\nCarthage affronta Rome lors des trois guerres puniques. La deuxième reste célèbre pour la traversée des Alpes par Hannibal Barca en 218 av. J.-C. et ses victoires éclatantes en Italie, avant le retournement de Zama en 202 av. J.-C. En 146 av. J.-C., Rome détruisit entièrement la ville après trois ans de siège, puis la rebâtit pour en faire l'une des grandes métropoles de l'Empire. Le site archéologique de Carthage est inscrit au patrimoine mondial de l'UNESCO depuis 1979.",
            status: "PUBLISHED",
            publishedAt: new Date("2026-06-21"),
            seoDescription: "Carthage : de la fondation phénicienne aux guerres puniques, histoire de la grande puissance méditerranéenne qui défia Rome.",
          },
        ],
      },
    },
  });

  const almoravides = await prisma.content.create({
    data: {
      type: "HISTORICAL_ENTRY",
      validationLevel: "VERIFIED",
      countries: { create: [{ countryCode: "MR" }, { countryCode: "MA" }, { countryCode: "DZ" }] },
      categories: { create: [{ categoryId: perIslam.id }] },
      historical: { create: { periodCategoryId: perIslam.id, yearStart: 1040, yearEnd: 1147 } },
      sources: {
        create: [
          { sortOrder: 1, source: { create: { kind: "book", author: "ابن خلدون", title: "كتاب العِبَر", year: 1377 } } },
          { sortOrder: 2, source: { create: { kind: "book", author: "عبد الله العروي", title: "مجمل تاريخ المغرب", publisher: "المركز الثقافي العربي" } } },
        ],
      },
      translations: {
        create: [
          {
            locale: "ar",
            title: "دولة المرابطين",
            slug: "المرابطون",
            summary: "حركة إصلاحية ودولة كبرى قامت في القرن الحادي عشر الميلادي انطلاقاً من الصحراء الموريتانية، وحّدت أجزاء واسعة من المغرب الكبير والأندلس وأسّست مدينة مراكش.",
            body: "نشأت الحركة المرابطية في أواسط القرن الحادي عشر الميلادي بين قبائل صنهاجة الصحراوية، على يد الفقيه عبد الله بن ياسين الذي أقام رباطاً لتعليم الدين ونشر الإصلاح. تحوّلت الدعوة سريعاً إلى قوة سياسية وعسكرية صاعدة انطلقت من أقاصي الصحراء نحو الشمال.\n\nبلغت الدولة أوجها مع يوسف بن تاشفين الذي أسّس مدينة مراكش حوالي سنة 1070م لتكون عاصمة الدولة، ووحّد المغرب الأقصى وأجزاء من المغرب الأوسط، ثم عبر إلى الأندلس نجدةً لملوك الطوائف وانتصر في معركة الزلاقة الشهيرة سنة 1086م.\n\nشكّلت الدولة المرابطية أول تجربة تاريخية كبرى تربط ضفتي الصحراء بالأندلس في كيان سياسي واحد، ونشّطت طرق التجارة الصحراوية ونشرت المذهب المالكي، قبل أن تتراجع أمام صعود الموحدين في منتصف القرن الثاني عشر.",
            status: "PUBLISHED",
            isOriginal: true,
            publishedAt: new Date("2026-06-15"),
            seoDescription: "دولة المرابطين: من رباط الصحراء إلى مراكش والأندلس — قصة الدولة التي وحّدت غرب المغرب الكبير.",
          },
          {
            locale: "fr",
            title: "L'empire almoravide",
            slug: "almoravides",
            summary: "Mouvement réformateur et grand État né au XIe siècle depuis le Sahara mauritanien, qui unifia une large partie du Maghreb occidental et d'al-Andalus et fonda la ville de Marrakech.",
            body: "Le mouvement almoravide naît au milieu du XIe siècle parmi les tribus sanhadja du Sahara, sous l'impulsion du juriste Abdallah Ibn Yasin, fondateur d'un ribat dédié à l'enseignement religieux et à la réforme. La prédication se mue rapidement en puissance politique et militaire partie des confins sahariens vers le nord.\n\nL'État atteint son apogée avec Youssef Ibn Tachfin, qui fonde Marrakech vers 1070 pour en faire sa capitale, unifie le Maghreb extrême et une partie du Maghreb central, puis passe en al-Andalus au secours des royaumes de taïfas — remportant la célèbre bataille de Zallaqa en 1086.\n\nL'empire almoravide constitue la première grande expérience historique reliant les deux rives du Sahara et al-Andalus en une seule entité politique. Il dynamisa les routes commerciales transsahariennes et diffusa le malikisme, avant de céder face à la montée almohade au milieu du XIIe siècle.",
            status: "PUBLISHED",
            publishedAt: new Date("2026-06-16"),
            seoDescription: "L'empire almoravide : du ribat saharien à Marrakech et al-Andalus, l'État qui unifia l'ouest du Grand Maghreb.",
          },
        ],
      },
    },
  });

  await prisma.content.create({
    data: {
      type: "HISTORICAL_ENTRY",
      validationLevel: "VERIFIED",
      countries: { create: [{ countryCode: "TN" }, { countryCode: "DZ" }, { countryCode: "MA" }] },
      categories: { create: [{ categoryId: perModern.id }] },
      historical: { create: { periodCategoryId: perModern.id, yearStart: 1958, yearEnd: 1958 } },
      sources: {
        create: [
          { sortOrder: 1, source: { create: { kind: "book", author: "محمد المالكي", title: "الحركات الوطنية والاستعمار في المغرب العربي", publisher: "مركز دراسات الوحدة العربية" } } },
        ],
      },
      translations: {
        create: [
          {
            locale: "ar",
            title: "مؤتمر طنجة 1958",
            slug: "مؤتمر-طنجة-1958",
            summary: "لقاء تاريخي جمع الأحزاب الوطنية الكبرى في تونس والجزائر والمغرب سنة 1958 للدعوة إلى وحدة مغاربية فدرالية، ويُعتبر لحظة تأسيسية في مسار الحلم المغاربي.",
            body: "في أواخر أبريل 1958، وبينما كانت حرب التحرير الجزائرية في ذروتها، اجتمع في مدينة طنجة ممثلو ثلاثة أحزاب وطنية كبرى: حزب الاستقلال المغربي، والحزب الحر الدستوري الجديد التونسي، وجبهة التحرير الوطني الجزائرية.\n\nأصدر المؤتمر توصيات تاريخية دعت إلى قيام اتحاد فدرالي بين أقطار المغرب العربي، وإلى مساندة كفاح الشعب الجزائري من أجل الاستقلال، وإلى إنشاء مؤسسات مغاربية مشتركة. ورغم أن الظروف السياسية اللاحقة حالت دون تجسيد هذه التوصيات، بقي مؤتمر طنجة مرجعاً رمزياً يستدعيه كل حديث عن الوحدة المغاربية، وممهّداً بعيداً لتأسيس اتحاد المغرب العربي سنة 1989.",
            status: "PUBLISHED",
            isOriginal: true,
            publishedAt: new Date("2026-06-10"),
            seoDescription: "مؤتمر طنجة 1958: حين اجتمعت الحركات الوطنية الثلاث لتعلن حلم الوحدة المغاربية الفدرالية.",
          },
        ],
      },
    },
  });

  // ── Personnalités ──

  const ibnKhaldoun = await prisma.content.create({
    data: {
      type: "PERSONALITY",
      validationLevel: "VERIFIED",
      countries: { create: [{ countryCode: "TN" }, { countryCode: "DZ" }, { countryCode: "MA" }] },
      personality: {
        create: {
          birthYear: 1332,
          deathYear: 1406,
          isLiving: false,
          works: [
            { title: "المقدمة", year: 1377 },
            { title: "كتاب العِبَر وديوان المبتدأ والخبر" },
            { title: "التعريف بابن خلدون ورحلته غرباً وشرقاً" },
          ],
          quotes: [{ text: "الظلم مؤذنٌ بخراب العمران.", source: "المقدمة" }],
        },
      },
      sources: {
        create: [
          { sortOrder: 1, source: { create: { kind: "book", author: "ابن خلدون", title: "التعريف بابن خلدون ورحلته غرباً وشرقاً" } } },
          { sortOrder: 2, source: { create: { kind: "book", author: "Yves Lacoste", title: "Ibn Khaldoun : naissance de l'Histoire, passé du tiers monde", publisher: "La Découverte", year: 1998 } } },
        ],
      },
      translations: {
        create: [
          {
            locale: "ar",
            title: "ابن خلدون",
            slug: "ابن-خلدون",
            summary: "مؤرخ ومفكر وُلد بتونس سنة 1332م، يُعدّ مؤسس علم العمران البشري بمقدمته الشهيرة، وتنقّل بين بلاطات المغرب الكبير والأندلس ومصر.",
            body: "وُلد عبد الرحمن بن خلدون بتونس سنة 1332م (732هـ) لأسرة أندلسية الأصل. تلقّى تعليماً موسوعياً في علوم اللغة والفقه والفلسفة، وخاض مبكراً غمار السياسة والإدارة، متنقلاً بين تونس وفاس وغرناطة وبجاية وتلمسان في مسار مليء بالصعود والمحن.\n\nفي خلوة بقلعة ابن سلامة قرب تيارت بالجزائر، كتب بين 1375 و1377 «المقدمة» التي غيّرت وجه الفكر الإنساني: فيها أسّس ما سمّاه «علم العمران البشري»، وحلّل قيام الدول وسقوطها بمفهوم «العصبية»، ودرس الاقتصاد والاجتماع والتربية بمنهج وصفيّ تحليلي سابق لعصره بقرون. ثم انتقل إلى القاهرة حيث تولى قضاء المالكية ودرّس بالأزهر، والتقى تيمورلنك في دمشق في واحد من أشهر لقاءات التاريخ، وتوفي بالقاهرة سنة 1406م.\n\nيُجمع الدارسون اليوم، شرقاً وغرباً، على اعتبار ابن خلدون رائداً لعلم الاجتماع وفلسفة التاريخ، وتحتفي به بلدان المغرب الكبير جميعاً بوصفه أشهر أعلامها الفكرية.",
            status: "PUBLISHED",
            isOriginal: true,
            publishedAt: new Date("2026-06-18"),
            seoDescription: "ابن خلدون: المؤرخ التونسي المغاربي الذي أسّس علم العمران البشري بمقدمته الشهيرة.",
          },
          {
            locale: "fr",
            title: "Ibn Khaldoun",
            slug: "ibn-khaldoun",
            summary: "Historien et penseur né à Tunis en 1332, considéré comme le fondateur de la sociologie avec sa célèbre Muqaddima, il servit les cours du Grand Maghreb, d'al-Andalus et d'Égypte.",
            body: "Abd al-Rahman Ibn Khaldoun naît à Tunis en 1332 dans une famille d'origine andalouse. Formé aux sciences du langage, au droit et à la philosophie, il s'engage tôt dans la politique et l'administration, passant de Tunis à Fès, Grenade, Béjaïa et Tlemcen, dans un parcours fait d'ascensions et de disgrâces.\n\nRetiré à la forteresse d'Ibn Salama, près de Tiaret en Algérie, il rédige entre 1375 et 1377 la « Muqaddima » (les Prolégomènes), qui bouleverse la pensée universelle : il y fonde la « science de la civilisation » (ilm al-umran), analyse la naissance et la chute des États par le concept d'asabiyya, et étudie l'économie, la société et l'éducation avec une méthode analytique en avance de plusieurs siècles. Installé ensuite au Caire, grand cadi malikite et professeur à al-Azhar, il rencontre Tamerlan à Damas lors d'une des entrevues les plus fameuses de l'histoire, avant de s'éteindre en 1406.\n\nChercheurs d'Orient et d'Occident s'accordent aujourd'hui à voir en Ibn Khaldoun le précurseur de la sociologie et de la philosophie de l'histoire — et tous les pays du Grand Maghreb le célèbrent comme leur plus illustre figure intellectuelle.",
            status: "PUBLISHED",
            publishedAt: new Date("2026-06-19"),
            seoDescription: "Ibn Khaldoun : l'historien maghrébin qui fonda la science des sociétés avec la Muqaddima.",
          },
        ],
      },
    },
  });

  await prisma.content.create({
    data: {
      type: "PERSONALITY",
      validationLevel: "COMMUNITY",
      countries: { create: [{ countryCode: "DZ" }, { countryCode: "TN" }] },
      personality: { create: { isLiving: false } },
      sources: {
        create: [
          { sortOrder: 1, source: { create: { kind: "book", author: "ابن خلدون", title: "كتاب العِبَر", year: 1377 } } },
        ],
      },
      translations: {
        create: [
          {
            locale: "ar",
            title: "الكاهنة",
            slug: "الكاهنة",
            summary: "ملكة أمازيغية من جبال الأوراس قادت مقاومة واسعة في أواخر القرن السابع الميلادي، وتحوّلت إلى رمز غنيّ ومتعدد القراءات في الذاكرة المغاربية.",
            body: "تُعرف في المصادر باسم «الكاهنة» — ديهيا في الروايات الأمازيغية — وهي ملكة قبيلة جراوة الزناتية بجبال الأوراس. قادت في أواخر القرن السابع الميلادي مقاومة كبرى، وحقّقت انتصاراً مدوّياً على جيش حسان بن النعمان في معركة وادي نيني (مسكيانة) قبل أن تُهزم وتُقتل حوالي سنة 701م.\n\nتختلف المصادر القديمة في تفاصيل سيرتها اختلافاً كبيراً، وقد نسجت حولها الروايات الكثير من الأساطير. لكنها بقيت عبر القرون رمزاً حاضراً في الذاكرة الشعبية المغاربية، تتعدد قراءاته بين البطولة والمأساة، ويستلهمه الأدب والفن في المنطقة إلى اليوم.",
            status: "PUBLISHED",
            isOriginal: true,
            publishedAt: new Date("2026-06-08"),
            seoDescription: "الكاهنة (ديهيا): ملكة الأوراس التي قادت المقاومة في القرن السابع وصارت رمزاً في الذاكرة المغاربية.",
          },
        ],
      },
    },
  });

  await prisma.content.create({
    data: {
      type: "PERSONALITY",
      validationLevel: "VERIFIED",
      countries: { create: [{ countryCode: "DZ" }, { countryCode: "DSP" }] },
      personality: {
        create: {
          birthYear: 1936,
          deathYear: 2015,
          isLiving: false,
          works: [
            { title: "الحب والفانتازيا (L'Amour, la fantasia)", year: 1985 },
            { title: "نساء الجزائر في شققهن (Femmes d'Alger dans leur appartement)", year: 1980 },
            { title: "بعيداً عن المدينة (Loin de Médine)", year: 1991 },
          ],
        },
      },
      sources: {
        create: [
          { sortOrder: 1, source: { create: { kind: "web", title: "Assia Djebar", publisher: "Académie française", url: "https://www.academie-francaise.fr/les-immortels/assia-djebar" } } },
        ],
      },
      translations: {
        create: [
          {
            locale: "ar",
            title: "آسيا جبار",
            slug: "آسيا-جبار",
            summary: "روائية ومخرجة وأكاديمية جزائرية (1936–2015)، أول شخصية من المغرب الكبير تنتخب في الأكاديمية الفرنسية، كرّست أعمالها لذاكرة النساء والحرب والاستعمار.",
            body: "وُلدت فاطمة الزهراء إيمالاين — الشهيرة بآسيا جبار — بشرشال في الجزائر سنة 1936. كانت أول جزائرية تلتحق بمدرسة الأساتذة العليا بباريس، ونشرت روايتها الأولى «العطش» وهي في العشرين، لتبني بعدها واحداً من أهم المشاريع الأدبية في المنطقة: كتابة تُنصت لأصوات النساء وتحفر في ذاكرة الاستعمار والحرب.\n\nإلى جانب الرواية، أخرجت أفلاماً وثائقية روائية عن ذاكرة النساء في جبال شنوة، ودرّست الأدب في جامعات الجزائر والولايات المتحدة. سنة 2005 انتُخبت عضواً في الأكاديمية الفرنسية — أول شخصية من المغرب الكبير تدخل هذه المؤسسة — وظل اسمها يتردد سنوياً بين المرشحين لجائزة نوبل للآداب حتى رحيلها سنة 2015.",
            status: "PUBLISHED",
            isOriginal: true,
            publishedAt: new Date("2026-06-22"),
            seoDescription: "آسيا جبار: الروائية الجزائرية التي كتبت ذاكرة النساء ودخلت الأكاديمية الفرنسية.",
          },
          {
            locale: "fr",
            title: "Assia Djebar",
            slug: "assia-djebar",
            summary: "Romancière, cinéaste et académicienne algérienne (1936–2015), première personnalité du Grand Maghreb élue à l'Académie française, elle a consacré son œuvre à la mémoire des femmes, de la guerre et de la colonisation.",
            body: "Fatima-Zohra Imalayène, dite Assia Djebar, naît à Cherchell en 1936. Première Algérienne admise à l'École normale supérieure, elle publie son premier roman, « La Soif », à vingt ans, avant de bâtir l'une des œuvres majeures de la région : une écriture à l'écoute des voix de femmes, fouillant la mémoire de la colonisation et de la guerre.\n\nRomancière mais aussi cinéaste — « La Nouba des femmes du Mont Chenoua » —, elle enseigna la littérature à Alger puis aux États-Unis. En 2005, elle est élue à l'Académie française, première personnalité du Grand Maghreb à y siéger, et son nom revint chaque année parmi les favoris du prix Nobel de littérature jusqu'à sa disparition en 2015.",
            status: "PUBLISHED",
            publishedAt: new Date("2026-06-23"),
            seoDescription: "Assia Djebar : la romancière algérienne, mémoire des femmes, élue à l'Académie française.",
          },
        ],
      },
    },
  });

  // ── Culture ──

  await prisma.content.create({
    data: {
      type: "CULTURAL",
      validationLevel: "VERIFIED",
      countries: { create: [{ countryCode: "TN" }, { countryCode: "DZ" }, { countryCode: "MA" }, { countryCode: "MR" }] },
      categories: { create: [{ categoryId: culFood.id }] },
      cultural: { create: {} },
      sources: {
        create: [
          { sortOrder: 1, source: { create: { kind: "web", title: "Les savoirs, savoir-faire et pratiques liés à la production et à la consommation du couscous", publisher: "UNESCO — Patrimoine culturel immatériel", year: 2020, url: "https://ich.unesco.org/fr/RL/-01602" } } },
        ],
      },
      translations: {
        create: [
          {
            locale: "ar",
            title: "الكسكسي",
            slug: "الكسكسي",
            summary: "الطبق الجامع لموائد المغرب الكبير وأحد أبرز رموز مطبخه، أُدرج سنة 2020 في قائمة اليونسكو للتراث الثقافي غير المادي بملف مشترك تاريخي بين أربع دول مغاربية.",
            body: "يقوم الكسكسي على حبيبات السميد المفتولة يدوياً والمطهوة على البخار في «الكسكاس»، وتتنوع وصفاته بلا حصر بين البلدان والجهات والمواسم: بالخضار أو باللحم أو بالسمك في السواحل، حلواً بالزبيب في المناسبات، أو مقدَّماً في أطباق الأعياد والجنائز والأعراس على السواء. وهو أبعد من أكلة: طقس اجتماعي جامع تلتف حوله العائلة يوم الجمعة، وذاكرة نسائية تتوارث فنّ الفتل جيلاً عن جيل.\n\nوفي سابقة تاريخية، تقدّمت الجزائر وموريتانيا والمغرب وتونس سنة 2020 بملف مشترك إلى اليونسكو، فأُدرجت «معارف ومهارات وممارسات إنتاج الكسكسي واستهلاكه» في القائمة التمثيلية للتراث الثقافي غير المادي للإنسانية — في واحدة من أجمل صور التعاون الثقافي المغاربي.",
            status: "PUBLISHED",
            isOriginal: true,
            publishedAt: new Date("2026-06-25"),
            seoDescription: "الكسكسي: الطبق الجامع للمغرب الكبير الذي دخل قائمة اليونسكو بملف مغاربي مشترك سنة 2020.",
          },
          {
            locale: "fr",
            title: "Le couscous",
            slug: "couscous",
            summary: "Plat fédérateur des tables du Grand Maghreb et l'un des grands symboles de sa cuisine, inscrit en 2020 au patrimoine culturel immatériel de l'UNESCO grâce à un dossier commun historique de quatre pays maghrébins.",
            body: "Le couscous repose sur des grains de semoule roulés à la main et cuits à la vapeur dans le keskes. Ses recettes varient à l'infini selon les pays, les régions et les saisons : aux légumes, à la viande, au poisson sur les côtes, sucré aux raisins secs pour les fêtes — servi aussi bien aux mariages qu'aux funérailles. Plus qu'un plat, c'est un rituel social qui rassemble la famille le vendredi, et une mémoire féminine où l'art de rouler la graine se transmet de génération en génération.\n\nFait historique : en 2020, l'Algérie, la Mauritanie, le Maroc et la Tunisie ont déposé ensemble un dossier commun à l'UNESCO, et « les savoirs, savoir-faire et pratiques liés à la production et à la consommation du couscous » ont été inscrits sur la liste représentative du patrimoine culturel immatériel de l'humanité — l'un des plus beaux exemples de coopération culturelle maghrébine.",
            status: "PUBLISHED",
            publishedAt: new Date("2026-06-26"),
            seoDescription: "Le couscous : le plat fédérateur du Grand Maghreb, inscrit à l'UNESCO en 2020 par un dossier maghrébin commun.",
          },
        ],
      },
    },
  });

  await prisma.content.create({
    data: {
      type: "CULTURAL",
      validationLevel: "VERIFIED",
      countries: { create: [{ countryCode: "DZ" }] },
      categories: { create: [{ categoryId: culMusic.id }] },
      cultural: { create: { contentLanguage: "amz", amazighVariant: "OTHER" } },
      sources: {
        create: [
          { sortOrder: 1, source: { create: { kind: "web", title: "L'Ahellil du Gourara", publisher: "UNESCO — Patrimoine culturel immatériel", year: 2008, url: "https://ich.unesco.org/fr/RL/lahellil-du-gourara-00121" } } },
        ],
      },
      translations: {
        create: [
          {
            locale: "ar",
            title: "أهليل قورارة",
            slug: "أهليل-قورارة",
            summary: "فن غنائي شعري جماعي من واحات قورارة بالجنوب الجزائري، يُؤدَّى بالزناتية الأمازيغية في ليالي المناسبات، وأدرجته اليونسكو ضمن التراث الثقافي غير المادي للإنسانية.",
            body: "الأهليل فنّ جماعي يجمع الشعر والغناء المتعدد الأصوات والموسيقى والرقص الوقور، تحييه جماعات واحات قورارة (منطقة تيميمون) في المناسبات الدينية والأعراس والأسمار الجماعية. يقف المؤدون في حلقة متراصة حول حامل «القمبري» وعازف الناي، يتمايلون بإيقاع واحد بينما يرتفع الغناء بالزناتية — إحدى الوحدات اللغوية الأمازيغية — في نصوص تمزج المديح الديني بحكمة الأجداد وذاكرة المنطقة.\n\nأدرجت اليونسكو الأهليل سنة 2008 في القائمة التمثيلية للتراث الثقافي غير المادي، بوصفه شاهداً حياً على عمق التنوع الثقافي واللغوي في المغرب الكبير، وعلى المكانة الخاصة للتراث الأمازيغي في نسيجه.",
            status: "PUBLISHED",
            isOriginal: true,
            publishedAt: new Date("2026-06-12"),
            seoDescription: "أهليل قورارة: الفن الغنائي الأمازيغي الزناتي من الجنوب الجزائري، تراث إنساني لدى اليونسكو.",
          },
        ],
      },
    },
  });

  // ── Articles d'opinion (fictifs) ──

  const art1 = await prisma.content.create({
    data: {
      type: "ARTICLE",
      validationLevel: "NONE",
      isFeatured: true,
      countries: { create: [{ countryCode: "TN" }] },
      categories: { create: [{ categoryId: opFuture.id }] },
      article: { create: { authorName: "د. سلمى بن يوسف", authorCountryCode: "TN", readingTimeMin: 6 } },
      translations: {
        create: [
          {
            locale: "ar",
            title: "لماذا يحتاج المغرب الكبير إلى جيلٍ جديد من المبادرات؟",
            slug: "جيل-جديد-من-المبادرات",
            summary: "ظلّ الحديث عن الوحدة المغاربية عقوداً حبيس البيانات الرسمية. لكنّ جيلاً جديداً بدأ يبني جسوره بنفسه — والمطلوب اليوم توثيق هذه الطاقة وربطها.",
            body: "ظلّ الحديث عن الوحدة المغاربية عقوداً حبيسَ البيانات الرسمية والقمم المؤجَّلة. لكنّ شيئاً ما تغيّر في السنوات الأخيرة: جيلٌ جديد لا ينتظر المؤسسات، بل يبني جسوره بنفسه — في الجامعة والثقافة والاقتصاد الرقمي.\n\nمن شبكات الطلبة إلى المهرجانات المشتركة، ومن التعاونيات الرقمية إلى مبادرات الجاليات في المهجر، تتشكّل اليوم بنية تحتية ناعمة للتعاون المغاربي. هذه المبادرات، على تواضع إمكاناتها، تنجز في صمت ما عجزت عنه هياكل رسمية بأكملها: تجعل التعاون المغاربي واقعاً يومياً معيشاً.\n\nما تحتاجه هذه الطاقة ليس الخُطب، بل ثلاثة أشياء بسيطة: التوثيق حتى لا تضيع التجارب، والربط حتى تتعلم المبادرات من بعضها، والذاكرة حتى يبني كل جيل على ما سبقه بدل أن يبدأ من الصفر. وهذا بالضبط ما ينبغي أن تكون عليه المنصات المدنية المغاربية القادمة.",
            status: "PUBLISHED",
            isOriginal: true,
            publishedAt: new Date("2026-06-28"),
            seoDescription: "رأي: جيل مغاربي جديد يبني جسوره بنفسه — والمطلوب توثيق مبادراته وربطها.",
          },
          {
            locale: "fr",
            title: "Pourquoi le Grand Maghreb a besoin d'une nouvelle génération d'initiatives",
            slug: "nouvelle-generation-d-initiatives",
            summary: "Le discours sur l'unité maghrébine est resté prisonnier des communiqués officiels. Mais une nouvelle génération construit déjà ses ponts elle-même — il faut désormais documenter et relier cette énergie.",
            body: "Pendant des décennies, le discours sur l'unité maghrébine est resté prisonnier des communiqués officiels et des sommets reportés. Mais quelque chose a changé ces dernières années : une génération nouvelle n'attend plus les institutions — elle construit ses ponts elle-même, à l'université, dans la culture, dans l'économie numérique.\n\nDes réseaux étudiants aux festivals communs, des coopératives numériques aux initiatives des diasporas, une infrastructure douce de la coopération maghrébine prend forme. Ces initiatives, malgré la modestie de leurs moyens, accomplissent en silence ce que des structures officielles entières n'ont pas réussi : faire de la coopération maghrébine une réalité quotidienne vécue.\n\nCette énergie n'a pas besoin de discours, mais de trois choses simples : la documentation, pour que les expériences ne se perdent pas ; la mise en relation, pour que les initiatives apprennent les unes des autres ; et la mémoire, pour que chaque génération bâtisse sur la précédente au lieu de repartir de zéro. C'est exactement ce que devront être les prochaines plateformes citoyennes maghrébines.",
            status: "PUBLISHED",
            publishedAt: new Date("2026-06-29"),
            seoDescription: "Opinion : une nouvelle génération maghrébine construit ses ponts — documentons et relions ses initiatives.",
          },
        ],
      },
    },
  });

  const art2 = await prisma.content.create({
    data: {
      type: "ARTICLE",
      validationLevel: "NONE",
      countries: { create: [{ countryCode: "DZ" }] },
      categories: { create: [{ categoryId: opEdu.id }] },
      article: { create: { authorName: "كمال مرزوقي", authorCountryCode: "DZ", readingTimeMin: 5 } },
      translations: {
        create: [
          {
            locale: "ar",
            title: "الجامعة المغاربية: أقصر الطرق إلى التكامل",
            slug: "الجامعة-المغاربية-طريق-التكامل",
            summary: "قد تكون قاعات المحاضرات، لا قاعات المؤتمرات، هي المكان الذي سيولد فيه المغرب الكبير فعلياً: حجة في ثلاث خطوات عملية.",
            body: "حين يتبادل مئات الطلبة مقاعد الدراسة بين تونس والجزائر والرباط ونواكشوط وطرابلس كل سنة، فإنهم يفعلون للوحدة المغاربية أكثر مما فعلته عقود من الخطب. التكامل الحقيقي يبدأ من السيرة الذاتية المشتركة: أستاذ مشرف من بلد، وزميل مختبر من بلد آخر، وشهادة يعترف بها الجميع.\n\nثلاث خطوات عملية يمكن أن تبدأ غداً: الاعتراف المتبادل الكامل بالشهادات الجامعية، وبرنامج تبادل مغاربي على غرار «إيراسموس» الأوروبي ولو بميزانية متواضعة، ومدارس دكتوراه مشتركة في التخصصات التي يملك فيها كل بلد قطعة من الحل — الطاقة والمياه والذكاء الاصطناعي والتراث.\n\nليست هذه أحلاماً: كل عنصر منها جرى اختباره ثنائياً في لحظة ما. ما ينقص هو الإطار الجامع والإرادة المؤسسية. وفي انتظارهما، تتقدم الشبكات الجامعية المستقلة لتملأ الفراغ — وتستحق منا كل الدعم.",
            status: "PUBLISHED",
            isOriginal: true,
            publishedAt: new Date("2026-06-24"),
            seoDescription: "رأي: ثلاث خطوات عملية تجعل الجامعة أقصر طريق نحو التكامل المغاربي.",
          },
        ],
      },
    },
  });

  await prisma.content.create({
    data: {
      type: "ARTICLE",
      validationLevel: "NONE",
      countries: { create: [{ countryCode: "MR" }, { countryCode: "DSP" }] },
      categories: { create: [{ categoryId: opDiaspora.id }] },
      article: { create: { authorName: "ليلى ولد الشيخ", authorCountryCode: "MR", readingTimeMin: 7 } },
      translations: {
        create: [
          {
            locale: "ar",
            title: "مغاربيون في المهجر: الجيل الثالث يبحث عن جسر",
            slug: "مغاربيون-في-المهجر",
            summary: "أحفاد المهاجرين لا يريدون العودة، بل يريدون الوصل: شهادة من داخل الجاليات المغاربية في أوروبا وأمريكا الشمالية.",
            body: "في باريس ومونريال وبروكسيل، يكبر جيل ثالث من أبناء المهاجرين المغاربيين يتكلم لغات إقامته بطلاقة، ويحمل في الوقت نفسه سؤالاً هادئاً وملحّاً: ما الذي يصلني بضفة البحر الأخرى؟ هذا الجيل لا يخطط «للعودة» — فحياته حيث وُلد — لكنه يبحث عن وصلٍ ثقافي ومعرفي حقيقي، لا عن فولكلور المناسبات.\n\nالمفارقة أن هذا الجيل يكتشف مغاربيته في المهجر قبل أن يكتشف بلده الأصلي: في الحي الواحد يجاور التونسي الجزائريَّ والمغربيَّ والموريتاني والليبي، فتذوب الحدود التي ما زالت مغلقة في الوطن الأم. الجاليات، بهذا المعنى، هي المختبر الحي الوحيد للوحدة المغاربية اليوم.\n\nما ينتظره هؤلاء الشباب ممن يخاطبهم: محتوى رصين بلغات يفهمونها، وذاكرة عائلية موثقة قبل أن يرحل جيل الأجداد، ومنصات تربطهم بمبادرات الضفتين. من يبني هذه الجسور اليوم، يبني قراء الغد ومواطنيه.",
            status: "PUBLISHED",
            isOriginal: true,
            publishedAt: new Date("2026-06-26"),
            seoDescription: "رأي: الجيل الثالث من الجاليات المغاربية يبحث عن وصل حقيقي لا عن فولكلور.",
          },
          {
            locale: "fr",
            title: "Maghrébins de la diaspora : la troisième génération cherche un pont",
            slug: "maghrebins-de-la-diaspora",
            summary: "Les petits-enfants des émigrés ne veulent pas « rentrer » : ils veulent se relier. Témoignage depuis les diasporas maghrébines d'Europe et d'Amérique du Nord.",
            body: "À Paris, Montréal ou Bruxelles grandit une troisième génération d'enfants de l'émigration maghrébine. Elle parle couramment les langues de ses pays de naissance et porte en même temps une question calme et insistante : qu'est-ce qui me relie à l'autre rive ? Cette génération ne projette pas de « retour » — sa vie est là où elle est née — mais elle cherche un lien culturel et intellectuel réel, pas un folklore d'occasions.\n\nParadoxe : cette génération découvre sa maghrébinité en diaspora avant de découvrir son pays d'origine. Dans le même quartier, le Tunisien côtoie l'Algérien, le Marocain, le Mauritanien et le Libyen — et les frontières encore fermées au pays fondent ici. Les diasporas sont, en ce sens, le seul laboratoire vivant de l'unité maghrébine aujourd'hui.\n\nCe que ces jeunes attendent de ceux qui s'adressent à eux : des contenus sérieux dans des langues qu'ils comprennent, une mémoire familiale documentée avant que ne parte la génération des grands-parents, et des plateformes qui les relient aux initiatives des deux rives. Qui construit ces ponts aujourd'hui construit les lecteurs et les citoyens de demain.",
            status: "PUBLISHED",
            publishedAt: new Date("2026-06-27"),
            seoDescription: "Opinion : la troisième génération des diasporas maghrébines cherche un lien réel, pas un folklore.",
          },
        ],
      },
    },
  });

  // ── Initiatives ──

  await prisma.content.create({
    data: {
      type: "INITIATIVE",
      validationLevel: "VERIFIED",
      isFeatured: true,
      countries: { create: [{ countryCode: "TN" }, { countryCode: "DZ" }, { countryCode: "MA" }, { countryCode: "LY" }, { countryCode: "MR" }] },
      categories: { create: [{ categoryId: domInteg.id }] },
      initiative: {
        create: {
          actorType: "INSTITUTION",
          state: "ACTIVE",
          foundedYear: 1989,
          founders: "الدول الخمس الموقّعة على معاهدة مراكش",
          isVerified: true,
          lastVerifiedAt: new Date("2026-06-01"),
          officialLinks: [{ label: "الموقع الرسمي", url: "https://www.maghrebarabe.org" }],
        },
      },
      translations: {
        create: [
          {
            locale: "ar",
            title: "اتحاد المغرب العربي",
            slug: "اتحاد-المغرب-العربي",
            summary: "التنظيم الإقليمي الجامع لدول المغرب الكبير الخمس، تأسس بمعاهدة مراكش سنة 1989 بهدف تحقيق التكامل الاقتصادي والسياسي بين أعضائه.",
            body: "تأسس اتحاد المغرب العربي في 17 فبراير 1989 بتوقيع معاهدة مراكش من قبل قادة تونس والجزائر والمغرب وليبيا وموريتانيا. نصّت المعاهدة على أهداف طموحة: حرية تنقل الأشخاص والسلع، وسياسات مشتركة في الاقتصاد والدفاع والثقافة، وصولاً إلى وحدة اندماجية بين الأقطار الخمسة.\n\nيملك الاتحاد هياكل قائمة: أمانة عامة دائمة مقرها الرباط، ومجلس رئاسة، ومجالس وزارية متخصصة، ومصرف مغاربي للاستثمار والتجارة الخارجية. غير أن العمل المؤسسي شبه متوقف منذ منتصف التسعينات — فلم تنعقد قمة رؤساء الدول منذ 1994 — بسبب الخلافات السياسية بين الأعضاء.\n\nورغم هذا الجمود، يبقى الاتحاد الإطار القانوني والرمزي المرجعي لأي مشروع وحدوي مغاربي، وتواصل أمانته العامة إصدار الدراسات وتنظيم الاجتماعات الفنية، فيما تتجدد الدعوات المدنية والأكاديمية بانتظام لإعادة تفعيله.",
            status: "PUBLISHED",
            isOriginal: true,
            publishedAt: new Date("2026-06-05"),
            seoDescription: "اتحاد المغرب العربي: التنظيم الإقليمي الخماسي المؤسس بمعاهدة مراكش 1989 — أهدافه وهياكله وواقعه.",
          },
          {
            locale: "fr",
            title: "Union du Maghreb arabe",
            slug: "union-du-maghreb-arabe",
            summary: "L'organisation régionale des cinq pays du Grand Maghreb, fondée par le traité de Marrakech en 1989 pour réaliser l'intégration économique et politique de ses membres.",
            body: "L'Union du Maghreb arabe est fondée le 17 février 1989 par la signature du traité de Marrakech par les dirigeants de la Tunisie, de l'Algérie, du Maroc, de la Libye et de la Mauritanie. Le traité fixe des objectifs ambitieux : libre circulation des personnes et des biens, politiques communes en matière d'économie, de défense et de culture, jusqu'à une union intégrale entre les cinq pays.\n\nL'Union dispose de structures réelles : un secrétariat général permanent siégeant à Rabat, un conseil de la présidence, des conseils ministériels spécialisés et une banque maghrébine d'investissement et de commerce extérieur. Mais le travail institutionnel est quasiment à l'arrêt depuis le milieu des années 1990 — aucun sommet des chefs d'État ne s'est tenu depuis 1994 — en raison des différends politiques entre membres.\n\nMalgré cette léthargie, l'UMA demeure le cadre juridique et symbolique de référence de tout projet unitaire maghrébin. Son secrétariat général continue de publier des études et d'organiser des réunions techniques, tandis que les appels citoyens et académiques à sa réactivation se renouvellent régulièrement.",
            status: "PUBLISHED",
            publishedAt: new Date("2026-06-06"),
            seoDescription: "Union du Maghreb arabe : l'organisation des cinq pays fondée à Marrakech en 1989 — objectifs, structures, réalité.",
          },
        ],
      },
    },
  });

  const reseau = await prisma.content.create({
    data: {
      type: "INITIATIVE",
      validationLevel: "COMMUNITY",
      countries: { create: [{ countryCode: "TN" }, { countryCode: "DZ" }, { countryCode: "MA" }, { countryCode: "LY" }, { countryCode: "MR" }] },
      categories: { create: [{ categoryId: domEdu.id }] },
      initiative: {
        create: {
          actorType: "UNIVERSITY",
          state: "ACTIVE",
          foundedYear: 2023,
          founders: "مجموعة من الجامعات المغاربية الشريكة",
          isVerified: true,
          lastVerifiedAt: new Date("2026-05-15"),
          officialLinks: [],
        },
      },
      translations: {
        create: [
          {
            locale: "ar",
            title: "شبكة الجامعات المغاربية",
            slug: "شبكة-الجامعات-المغاربية",
            summary: "شبكة تجمع 14 جامعة من البلدان الخمسة لتبادل الطلبة والباحثين وتنظيم مدارس صيفية مشتركة وبرامج دكتوراه مغاربية. (محتوى توضيحي)",
            body: "تأسست الشبكة سنة 2023 بمبادرة من مجموعة جامعات من البلدان الخمسة، بهدف بسيط وطموح: أن يصبح التنقل الأكاديمي داخل المغرب الكبير أمراً عادياً. تنظم الشبكة تبادلات فصلية للطلبة، وإقامات بحثية قصيرة للدكتوراليين، ومدرسة صيفية سنوية تدور بين البلدان الأعضاء.\n\nتشتغل الشبكة اليوم على ثلاث أولويات: بناء قاعدة بيانات مشتركة للمختبرات والتخصصات، وإطلاق أول برنامج دكتوراه مغاربي مشترك في تخصصات المياه والطاقة، وتوسيع العضوية نحو مؤسسات جديدة.\n\n(هذه فيشة توضيحية أُنشئت لأغراض العرض — بيانات هذه المبادرة ليست حقيقية.)",
            status: "PUBLISHED",
            isOriginal: true,
            publishedAt: new Date("2026-06-14"),
            seoDescription: "شبكة الجامعات المغاربية: 14 جامعة من البلدان الخمسة للتبادل الطلابي والبحثي. (محتوى توضيحي)",
          },
          {
            locale: "fr",
            title: "Réseau des universités maghrébines",
            slug: "reseau-des-universites-maghrebines",
            summary: "Un réseau réunissant 14 universités des cinq pays pour l'échange d'étudiants et de chercheurs, des écoles d'été communes et des doctorats maghrébins. (Contenu de démonstration)",
            body: "Fondé en 2023 à l'initiative d'un groupe d'universités des cinq pays, le réseau poursuit un objectif simple et ambitieux : faire de la mobilité académique à l'intérieur du Grand Maghreb une chose normale. Il organise des échanges semestriels d'étudiants, des séjours de recherche courts pour doctorants et une école d'été annuelle tournante.\n\nTrois priorités actuelles : construire une base de données commune des laboratoires et spécialités, lancer le premier programme doctoral maghrébin commun dans les domaines de l'eau et de l'énergie, et élargir le réseau à de nouveaux membres.\n\n(Fiche de démonstration créée à des fins d'illustration — les données de cette initiative ne sont pas réelles.)",
            status: "PUBLISHED",
            publishedAt: new Date("2026-06-15"),
            seoDescription: "Réseau des universités maghrébines : 14 universités des cinq pays pour la mobilité académique. (Démo)",
          },
        ],
      },
    },
  });

  await prisma.content.create({
    data: {
      type: "INITIATIVE",
      validationLevel: "COMMUNITY",
      countries: { create: [{ countryCode: "TN" }, { countryCode: "DZ" }, { countryCode: "MA" }] },
      categories: { create: [{ categoryId: domCulture.id }] },
      initiative: {
        create: {
          actorType: "FESTIVAL",
          state: "ACTIVE",
          foundedYear: 2024,
          isVerified: false,
          officialLinks: [],
        },
      },
      translations: {
        create: [
          {
            locale: "ar",
            title: "مهرجان السينما المغاربية الشابة",
            slug: "مهرجان-السينما-المغاربية-الشابة",
            summary: "مهرجان متنقل للأفلام القصيرة لمخرجين مغاربيين تحت الثلاثين، ينتقل كل دورة بين مدينة مغاربية جديدة. (محتوى توضيحي)",
            body: "انطلق المهرجان سنة 2024 بفكرة بسيطة: شاشة واحدة تجمع الجيل الجديد من صناع السينما في المنطقة. يعرض المهرجان أفلاماً قصيرة لمخرجات ومخرجين تحت سن الثلاثين من البلدان الخمسة، وتنتقل دوراته بين المدن — دورة في تونس، وأخرى في وهران، وثالثة مرتقبة في طنجة.\n\nإلى جانب العروض، يقيم المهرجان ورشات كتابة وإنتاج مشتركة تلتقي فيها مواهب من بلدان مختلفة حول مشاريع أفلام مشتركة.\n\n(هذه فيشة توضيحية أُنشئت لأغراض العرض — بيانات هذا المهرجان ليست حقيقية.)",
            status: "PUBLISHED",
            isOriginal: true,
            publishedAt: new Date("2026-06-09"),
            seoDescription: "مهرجان السينما المغاربية الشابة: أفلام قصيرة لجيل ما تحت الثلاثين، بدورات متنقلة بين المدن المغاربية. (توضيحي)",
          },
        ],
      },
    },
  });

  // ── Médiathèque ──

  const podcast1 = await prisma.content.create({
    data: {
      type: "MEDIA_ITEM",
      validationLevel: "COMMUNITY",
      isFeatured: true,
      mediaItem: {
        create: {
          kind: "PODCAST",
          externalUrl: "https://www.youtube.com/watch?v=M7lc4UVf-mo",
          durationMin: 45,
          host: "فريق مغاربيون",
          showName: "المغرب الكبير في 10 أسئلة",
          mediaLanguage: "ar",
        },
      },
      translations: {
        create: [
          {
            locale: "ar",
            title: "المغرب الكبير في 10 أسئلة — الحلقة الأولى: من نحن؟",
            slug: "المغرب-الكبير-في-10-أسئلة-الحلقة-1",
            summary: "الحلقة الافتتاحية من بودكاست المنصة: ما الذي يجمع شعوب المغرب الكبير تاريخياً وثقافياً، ولماذا نحتاج موسوعة مشتركة؟ (محتوى توضيحي — الفيديو عيّنة)",
            body: "في هذه الحلقة الافتتاحية نطرح السؤال الأول والأبسط: من نحن، نحن المغاربيين؟ نتجول بين الجغرافيا التي وحّدتنا والتاريخ الذي تقاطعت فيه دروبنا، ونسأل: لماذا يعرف بعضنا عن ضفاف بعيدة أكثر مما يعرف عن جاره؟\n\n(هذه الحلقة محتوى توضيحي لأغراض العرض؛ الفيديو المضمّن عيّنة تقنية.)",
            status: "PUBLISHED",
            isOriginal: true,
            publishedAt: new Date("2026-06-27"),
            seoDescription: "الحلقة الأولى من بودكاست المغرب الكبير في 10 أسئلة: من نحن؟",
          },
        ],
      },
    },
  });

  const podcast2 = await prisma.content.create({
    data: {
      type: "MEDIA_ITEM",
      validationLevel: "COMMUNITY",
      mediaItem: {
        create: {
          kind: "INTERVIEW",
          externalUrl: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
          durationMin: 28,
          host: "فريق مغاربيون",
          guests: "منسّق شبكة الجامعات المغاربية",
          mediaLanguage: "ar",
        },
      },
      translations: {
        create: [
          {
            locale: "ar",
            title: "حوار: كيف تشتغل شبكة الجامعات المغاربية؟",
            slug: "حوار-شبكة-الجامعات-المغاربية",
            summary: "حوار مع منسّق الشبكة حول التبادل الطلابي والدكتوراه المشتركة وصعوبات التنقل الأكاديمي بين البلدان الخمسة. (محتوى توضيحي — الفيديو عيّنة)",
            body: "كيف يعبر طالب دكتوراه من وهران إلى مختبر في تونس؟ وما الذي يعطّل الاعتراف المتبادل بالشهادات؟ في هذا الحوار نستضيف منسّق شبكة الجامعات المغاربية للحديث عن التجربة: النجاحات الصغيرة، والعوائق الإدارية، والحلم الأكاديمي المشترك.\n\n(هذه الحلقة محتوى توضيحي لأغراض العرض؛ الفيديو المضمّن عيّنة تقنية.)",
            status: "PUBLISHED",
            isOriginal: true,
            publishedAt: new Date("2026-06-21"),
            seoDescription: "حوار حول شبكة الجامعات المغاربية: التبادل الطلابي والدكتوراه المشتركة.",
          },
        ],
      },
    },
  });

  // ── Liens croisés ──

  await prisma.relatedContent.createMany({
    data: [
      { fromId: reseau.id, toId: art2.id },
      { fromId: reseau.id, toId: podcast2.id },
      { fromId: ibnKhaldoun.id, toId: almoravides.id },
      { fromId: carthage.id, toId: ibnKhaldoun.id },
      { fromId: art1.id, toId: reseau.id },
      { fromId: podcast1.id, toId: carthage.id },
    ],
  });

  console.log("Contenu de démonstration créé : 16 contenus, 24 versions linguistiques, liens croisés.");
}
