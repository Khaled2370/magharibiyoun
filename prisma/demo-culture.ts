import type { PrismaClient } from "@prisma/client";
import { createEntry, findOrCreateCategory, hasArSlug } from "./demo-helpers";
import { attachCoverBySlug, getCovers } from "./demo-covers";

export async function seedCulture(prisma: PrismaClient) {
  const covers = await getCovers(prisma);

  if (await hasArSlug(prisma, "الموسيقى-الأندلسية")) {
    console.log("Fiches culture déjà présentes — lot ignoré.");
  } else {
    const domMusic = await findOrCreateCategory(prisma, "CULTURAL_DOMAIN", {
      ar: "الموسيقى والغناء",
      fr: "Musique et chant",
      en: "Music and song",
    }, 2);
    const domCraft = await findOrCreateCategory(prisma, "CULTURAL_DOMAIN", {
      ar: "الحرف والفنون",
      fr: "Artisanat et arts",
      en: "Crafts and arts",
    }, 3);
    const domArchi = await findOrCreateCategory(prisma, "CULTURAL_DOMAIN", {
      ar: "العمارة والتراث",
      fr: "Architecture et patrimoine",
      en: "Architecture and heritage",
    }, 4);
    const domCinema = await findOrCreateCategory(prisma, "CULTURAL_DOMAIN", {
      ar: "السينما والمسرح",
      fr: "Cinéma et théâtre",
      en: "Cinema and theatre",
    }, 5);
    const domLetters = await findOrCreateCategory(prisma, "CULTURAL_DOMAIN", {
      ar: "اللغات والخط",
      fr: "Langues et calligraphie",
      en: "Languages and calligraphy",
    }, 6);

    await createEntry(prisma, {
      type: "CULTURAL",
      countries: ["MA", "DZ", "TN", "LY"],
      categoryIds: [domMusic],
      coverId: covers.music,
      cultural: {},
      sources: [
        { author: "Mahmoud Guettat", title: "La musique classique du Maghreb", publisher: "Sindbad", year: 1980 },
        { author: "Christian Poché", title: "La musique arabo-andalouse", publisher: "Cité de la musique / Actes Sud", year: 1995 },
      ],
      translations: [
        {
          locale: "ar",
          title: "الموسيقى الأندلسية المغاربية",
          slug: "الموسيقى-الأندلسية",
          summary: "تراث النوبات الذي وُلد في قرطبة وعبر البحر مع المهاجرين، فصار أرقى فنون المغرب الكبير الكلاسيكية: الآلة والغرناطي والصنعة والمالوف.",
          body: "تعود أصول هذا الفن إلى قرطبة القرن التاسع الميلادي، حين أرسى زرياب — الوافد من بغداد سنة 822م — قواعد مدرسة موسيقية جديدة: نظام النوبة، وترتيب المقامات، وآداب الأداء. وازدهر الفن في حواضر الأندلس قروناً، ثم عبر المضيق مع موجات الهجرة واللجوء الأندلسي إلى حواضر المغرب الكبير.\n\nوفي الضفة الجنوبية تفرعت المدارس الكبرى، لكل مدينة لونها: «الآلة» في فاس وتطوان والرباط، و«الغرناطي» في تلمسان ووهران، و«الصنعة» في الجزائر العاصمة، و«المالوف» في قسنطينة وتونس وليبيا. نوباتٌ تُروى جيلاً عن جيل، وأشعار بالفصحى والملحون، تحفظها جمعياتٌ عريقة ومعاهد ومهرجانات (مهرجان تستور للمالوف مثالاً).\n\nتُعد هذه الموسيقى أوضح مثال على الثقافة المغاربية العابرة للحدود: تراثٌ واحد بألوان محلية، يتقاسمه هواةٌ من طنجة إلى طرابلس، ويشهد على أن ذاكرة الأندلس صارت — منذ خمسة قرون — ذاكرة مغاربية.",
          seo: "الموسيقى الأندلسية المغاربية: من زرياب في قرطبة إلى الآلة والغرناطي والصنعة والمالوف.",
          date: "2026-07-01",
        },
        {
          locale: "fr",
          title: "La musique arabo-andalouse du Maghreb",
          slug: "musique-arabo-andalouse",
          summary: "L'héritage des noubas né à Cordoue et passé par-delà la mer avec les exilés, devenu l'art classique le plus raffiné du Grand Maghreb : al-Âla, gharnati, sanâa et malouf.",
          body: "Les origines de cet art remontent à la Cordoue du IXe siècle, lorsque Ziryab — arrivé de Bagdad en 822 — fonda une nouvelle école musicale : le système de la nouba, l'ordonnancement des modes, l'étiquette de l'exécution. L'art fleurit des siècles durant dans les cités d'al-Andalus, puis traversa le détroit avec les vagues d'exil andalou vers les métropoles du Grand Maghreb.\n\nSur la rive sud se ramifièrent les grandes écoles, chaque ville ayant sa couleur : al-Âla à Fès, Tétouan et Rabat ; le gharnati à Tlemcen et Oran ; la sanâa à Alger ; le malouf à Constantine, Tunis et en Libye. Des noubas transmises de génération en génération, des poèmes en arabe classique et en melhoun, gardés par des associations centenaires, des conservatoires et des festivals — celui du malouf de Testour, par exemple.\n\nCette musique est l'exemple le plus éclatant de culture maghrébine transfrontalière : un même héritage aux couleurs locales, partagé de Tanger à Tripoli, preuve que la mémoire d'al-Andalus est devenue, depuis cinq siècles, une mémoire maghrébine.",
          seo: "La musique arabo-andalouse : de Ziryab à Cordoue aux écoles âla, gharnati, sanâa et malouf du Maghreb.",
          date: "2026-07-01",
        },
      ],
    });

    await createEntry(prisma, {
      type: "CULTURAL",
      countries: ["DZ", "DSP"],
      categoryIds: [domMusic],
      coverId: covers.music,
      cultural: {},
      sources: [
        { author: "Bouziane Daoudi et Hadj Miliani", title: "L'aventure du raï : musique et société", publisher: "Seuil", year: 1996 },
        { title: "Le raï, chant populaire d'Algérie — Liste représentative du PCI", publisher: "UNESCO", year: 2022, url: "https://ich.unesco.org/fr/RL/le-rai-chant-populaire-dalgerie-01983" },
      ],
      translations: [
        {
          locale: "ar",
          title: "الراي",
          slug: "الراي",
          summary: "غناء الهامش الوهراني الذي قال ما لا يُقال، فصار أشهر موسيقى مغاربية في العالم — ومنذ 2022 تراثاً إنسانياً لدى اليونسكو.",
          body: "وُلد الراي في وهران وباديتها مطلع القرن العشرين، من غناء الشيوخ والشيخات البدوي على القصبة والقلال. كلمة «راي» تعني الرأي والمشورة: غناءٌ يخاطب الحياة كما هي — الحب والفقر والغربة والملامة — بصراحة جعلته فناً محاصَراً ومعشوقاً في آن.\n\nحملت الشيخة ريميتي راية المرحلة الأولى، ثم جاء جيل العصرنة في السبعينات فأدخل الآلات الكهربائية، وانفجر «البوب راي» في الثمانينات مع جيل «الشاب» و«الشابة»: خالد ومامي وفضيلة وزهوانية، ومهرجان وهران الأول (1985)، فالانتشار الكوكبي انطلاقاً من باريس حيث احتضنته الجاليات.\n\nسنة 2022 أُدرج «الراي، غناء الجزائر الشعبي» في القائمة التمثيلية للتراث الثقافي غير المادي لليونسكو. وما يزال كما وُلد: صوتَ من لا صوت لهم، وجسراً بين ضفتي المتوسط.",
          seo: "الراي من وهران إلى العالم: تاريخ غناء الهامش الذي صار تراثاً إنسانياً لدى اليونسكو (2022).",
          date: "2026-06-30",
        },
        {
          locale: "fr",
          title: "Le raï",
          slug: "rai",
          summary: "Le chant des marges oranaises qui a dit l'indicible, devenu la musique maghrébine la plus célèbre au monde — et, depuis 2022, patrimoine de l'humanité à l'UNESCO.",
          body: "Le raï est né à Oran et dans sa campagne au début du XXe siècle, du chant bédouin des cheikhs et des cheikhas, porté par la gasba et le gallal. Le mot « raï » signifie l'avis, le conseil : un chant qui parle de la vie telle qu'elle est — l'amour, la pauvreté, l'exil, le blâme — avec une franchise qui en fit un art à la fois assiégé et adoré.\n\nCheikha Remitti porta l'étendard de la première époque ; puis la génération de la modernisation introduisit les instruments électriques dans les années 1970, avant l'explosion du pop-raï des années 1980 avec la génération des « Cheb » : Khaled, Mami, Fadela, Zahouania — le premier festival d'Oran (1985), puis la conquête planétaire depuis Paris, où les diasporas l'avaient adopté.\n\nEn 2022, « le raï, chant populaire d'Algérie » a été inscrit sur la liste représentative du patrimoine culturel immatériel de l'UNESCO. Il demeure ce qu'il fut à sa naissance : la voix des sans-voix, et un pont entre les deux rives de la Méditerranée.",
          seo: "Le raï, d'Oran au monde : histoire du chant des marges devenu patrimoine UNESCO (2022).",
          date: "2026-06-30",
        },
      ],
    });

    await createEntry(prisma, {
      type: "CULTURAL",
      countries: ["MA", "DZ", "TN"],
      categoryIds: [domMusic],
      coverId: covers.music,
      cultural: {},
      sources: [
        { author: "Viviana Pâques", title: "La religion des esclaves : recherches sur la confrérie marocaine des Gnawa", publisher: "Moretti & Vitali", year: 1991 },
        { title: "Le gnaoua — Liste représentative du PCI", publisher: "UNESCO", year: 2019, url: "https://ich.unesco.org/fr/RL/le-gnaoua-01170" },
      ],
      translations: [
        {
          locale: "ar",
          title: "فن كناوة",
          slug: "فن-كناوة",
          summary: "تراث روحي وموسيقي لأحفاد المنحدرين من إفريقيا جنوب الصحراء: ليلة العلاج والحضرة بالكمبري والقراقب — تراث إنساني لدى اليونسكو منذ 2019.",
          body: "كناوة طائفة وممارسة وموسيقى: تراثٌ حمله أحفاد المستعبدين والجنود والتجار المنحدرين من إفريقيا جنوب الصحراء إلى المغرب، وصار مكوناً أصيلاً من نسيجه الثقافي. في قلبه «الليلة»: طقس ليلي كامل يقوده المعلم بآلة الكمبري (الهجهوج) وإيقاع القراقب، تتعاقب فيه الألوان والأرواح والأبخرة طلباً للجذبة والشفاء.\n\nوليس الفن حكراً على ضفة: فله أبناء عمومة من التاريخ نفسه — «الديوان» في الجزائر و«سطمبالي» في تونس — مما يجعله ذاكرة مغاربية مشتركة لمسارات الصحراء الكبرى بأمجادها ومآسيها.\n\nمن هامش الزوايا إلى أضواء العالم: فتح مهرجان الصويرة (منذ 1998) لمعلمي كناوة مسارح الكوكب ولقاءات الجاز والبلوز، وتوّجت اليونسكو المسار بإدراج كناوة في التراث الثقافي غير المادي للإنسانية سنة 2019.",
          seo: "فن كناوة: الليلة والمعلم والكمبري والقراقب — من ذاكرة الصحراء إلى قائمة اليونسكو 2019.",
          date: "2026-06-29",
        },
        {
          locale: "fr",
          title: "L'art gnaoua",
          slug: "gnaoua",
          summary: "Héritage spirituel et musical des descendants d'Afrique subsaharienne : la lila de transe au guembri et aux qraqeb — patrimoine de l'humanité à l'UNESCO depuis 2019.",
          body: "Les Gnaoua sont à la fois confrérie, pratique et musique : un héritage porté par les descendants d'esclaves, de soldats et de marchands venus d'Afrique subsaharienne au Maroc, devenu une composante à part entière de son tissu culturel. En son cœur, la « lila » : un rituel nocturne complet conduit par le maâlem au guembri, sur le rythme des qraqeb, où se succèdent couleurs, esprits et fumigations, en quête de transe et de guérison.\n\nEt cet art n'est pas le monopole d'une seule rive : il a des cousins issus de la même histoire — le diwan en Algérie, le stambali en Tunisie — qui en font une mémoire maghrébine commune des routes transsahariennes, avec leurs grandeurs et leurs tragédies.\n\nDes marges des zaouïas aux lumières du monde : le festival d'Essaouira (depuis 1998) a ouvert aux maâlems les scènes de la planète et les rencontres avec le jazz et le blues, et l'UNESCO a couronné ce parcours en inscrivant le gnaoua au patrimoine culturel immatériel de l'humanité en 2019.",
          seo: "L'art gnaoua : lila, maâlem, guembri et qraqeb — de la mémoire transsaharienne à l'UNESCO 2019.",
          date: "2026-06-29",
        },
      ],
    });

    await createEntry(prisma, {
      type: "CULTURAL",
      countries: ["MA", "DZ"],
      categoryIds: [domMusic],
      coverId: covers.music,
      cultural: {},
      sources: [
        { author: "عباس الجراري", title: "القصيدة: الزجل في المغرب", year: 1970 },
        { title: "الملحون — القائمة التمثيلية للتراث الثقافي غير المادي", publisher: "اليونسكو", year: 2023, url: "https://ich.unesco.org/fr/RL/le-malhoun-01948" },
      ],
      translations: [
        {
          locale: "ar",
          title: "الملحون",
          slug: "الملحون",
          summary: "ديوان الشعب المغاربي: شعرٌ بالدارجة يُنشَد، وُلد في واحات تافيلالت وازدهر في حواضر الصنّاع — وأُدرج لدى اليونسكو سنة 2023.",
          body: "الملحون شعرٌ ملحّن بالدارجة، نشأ في منطقة تافيلالت ثم ازدهر في حواضر الحرفيين: فاس ومكناس ومراكش وسلا وتارودانت، حيث احتضنته أجواق الصنّاع وحلقات الذكر. قوامه «القصيدة» بمقاطعها و«الحربة» — اللازمة التي يردّدها الجمع.\n\nديوانه بحرٌ في كل الأغراض: مديح وغزل («العشاق») ورثاء وحكمة وسياسة وخمريات رمزية، حفظ لنا لغة الناس وذاكرتهم قروناً. ومن أعلامه الكبار سيدي قدور العلمي والجيلالي امتيرد، وقد حظي بعناية أكاديمية رائدة مع أعمال عباس الجراري.\n\nوالملحون حاضر كذلك في الغرب الجزائري، حيث تشكل قصائده خزان الأغنية البدوية والشعبي. وفي 2023 أُدرج «الملحون، فن الشعر الشعبي المغنى» في القائمة التمثيلية لليونسكو — تتويجاً لديوانٍ ظل قروناً صوتَ الحواضر العتيقة.",
          seo: "الملحون: شعر الدارجة المغنى من تافيلالت إلى حواضر الصنّاع — تراث إنساني لدى اليونسكو 2023.",
          date: "2026-06-28",
        },
      ],
    });

    await createEntry(prisma, {
      type: "CULTURAL",
      countries: ["DZ"],
      categoryIds: [domMusic],
      coverId: covers.music,
      cultural: {},
      sources: [
        { author: "Hadj Miliani", title: "Sociétaires de l'émotion : études sur les musiques et les chants d'Algérie", publisher: "Dar El Gharb", year: 2005 },
        { author: "Safinez Bousbia", title: "El Gusto (film documentaire)", year: 2011, kind: "web" },
      ],
      translations: [
        {
          locale: "ar",
          title: "الشعبي الجزائري",
          slug: "الشعبي-الجزائري",
          summary: "فن القصبة العاصمية: من الصنعة الأندلسية وقصائد الملحون صاغ الحاج امحمد العنقة مدرسةً غنائية كاملة صارت صوت الجزائر الحضري.",
          body: "وُلد الشعبي في أزقة القصبة بالجزائر العاصمة بين الحربين، حين طوّر الحاج امحمد العنقة (1907–1978) — تلميذ الشيخ الناظور — تقاليد الصنعة الأندلسية وقصائد الملحون نحو فن حضري جديد: أوركسترا أرحب، مندول وبانجو إلى جانب العود والكمان، وإلقاء يخاطب الحارة لا البلاط.\n\nصار الشعبي مدرسة قائمة: نصوصٌ في الحكمة والغربة والتصوف والملامة، وأعلامٌ تعاقبوا على عرشه — من العنقة إلى الهاشمي قروابي وعمار الزاهي ودحمان الحراشي صاحب «يا الرايح» التي غناها العالم.\n\nوفي 2011 لمّ مشروع وفيلم «El Gusto» شمل عازفي الشعبي المسلمين واليهود الذين فرّقتهم الحرب نصف قرن — قصة رمزية عن قدرة هذا الفن على الجمع. وما يزال الشعبي حياً في الأعراس والقعدات، وعند جيل شاب يعيد اكتشاف كنوزه.",
          seo: "الشعبي الجزائري: الحاج امحمد العنقة ومدرسة القصبة — من الصنعة والملحون إلى يا الرايح.",
          date: "2026-06-27",
        },
      ],
    });

    await createEntry(prisma, {
      type: "CULTURAL",
      countries: ["MA", "DZ", "TN", "LY", "MR"],
      categoryIds: [domLetters],
      coverId: covers.calligraphy,
      cultural: {},
      sources: [
        { author: "عمر أفا ومحمد المغراوي", title: "الخط المغربي: تاريخ وواقع وآفاق", publisher: "منشورات وزارة الأوقاف المغربية", year: 2007 },
        { author: "Octave Houdas", title: "Essai sur l'écriture maghrébine", year: 1886 },
      ],
      translations: [
        {
          locale: "ar",
          title: "الخط المغربي",
          slug: "الخط-المغربي",
          summary: "أسلوب الغرب الإسلامي في كتابة العربية: استداراتٌ سخية وأقواس تحت السطر وتنقيط مميز — هوية بصرية جامعة من القيروان إلى شنقيط.",
          body: "تفرّع الخط المغربي من الكوفي القيرواني — لا من سلالة النسخ المشرقية — فاستقل بجمالياته: استدارات واسعة سخية، وكؤوس تنزل تحت السطر، وميزتان تعرفه بهما العين فوراً: الفاء بنقطة تحتها، والقاف بنقطة واحدة فوقها.\n\nتنوعت أقلامه بحسب الوظيفة: «المبسوط» لكتابة المصاحف، و«المجوهر» للدواوين والمراسلات، و«الثلث المغربي» للعناوين والزخرفة، و«الزمامي» للعقود والوثائق، وامتدت سلالته جنوباً في الخطوط الصحراوية («الصحراوي» أو السوداني) حتى شنقيط وتمبكتو. ومن أشهر شواهد مرحلته الأولى «المصحف الأزرق» القيرواني المكتوب بماء الذهب على رقّ مصبوغ.\n\nولا يزال الخط المغربي حياً: في المصاحب المطبوعة بالمغرب، وألواح الكتاتيب والزوايا، ولوحات خطاطين معاصرين يجددونه، ومسابقات ومعارض تحفظ لهذا الفن مقامه بوصفه الوجه البصري الجامع للغرب الإسلامي.",
          seo: "الخط المغربي: المبسوط والمجوهر والزمامي — هوية الغرب الإسلامي البصرية من القيروان إلى شنقيط.",
          date: "2026-06-26",
        },
      ],
    });

    await createEntry(prisma, {
      type: "CULTURAL",
      countries: ["TN"],
      categoryIds: [domCraft],
      coverId: covers.craft,
      cultural: {},
      sources: [
        { title: "المهارات المرتبطة بفخار نساء سجنان — القائمة التمثيلية", publisher: "اليونسكو", year: 2018, url: "https://ich.unesco.org/fr/RL/les-savoir-faire-lis-la-poterie-des-femmes-de-sejnane-01406" },
        { author: "Gabriel Camps", title: "Les Berbères : mémoire et identité", publisher: "Errance", year: 1987 },
      ],
      translations: [
        {
          locale: "ar",
          title: "فخار نساء سجنان",
          slug: "فخار-سجنان",
          summary: "في شمال غرب تونس تصنع النساء فخاراً باليد دون دولاب، بتقنيات ورموز تمتد جذورها آلاف السنين — تراث إنساني لدى اليونسكو منذ 2018.",
          body: "في قرى سجنان بالشمال الغربي التونسي، تواصل النساء صناعة فخارٍ مشكَّل باليد دون دولاب، على طريقة تكاد لم تتغير منذ آلاف السنين: طينٌ محلي يُعجن ويُشكّل، وصقلٌ بالحصى والصدف، وشيٌّ بالحطب وأغصان الزيتون في العراء.\n\nتُزيَّن القطع — قدورٌ وأطباق ودمى حيوانية — بصبغات نباتية ومعدنية (المغرة الحمراء وسواد المصطكى) ترسم زخارف هندسية ترث رموزاً أمازيغية قديمة: المثلث والمعين والصليب المعقوف الواقي، وهي الرموز نفسها التي تظهر في الوشم والنسيج القديمين.\n\nسنة 2018 أدرجت اليونسكو «المهارات المرتبطة بفخار نساء سجنان» في القائمة التمثيلية للتراث غير المادي. ومنذها صار الفخار مورد رزق وكرامة لمئات العائلات، ورمزاً للحِرف النسائية المغاربية حين تلقى الاعتراف الذي تستحق.",
          seo: "فخار نساء سجنان: تشكيل يدوي ورموز أمازيغية وشيّ بالحطب — تراث اليونسكو 2018.",
          date: "2026-06-25",
        },
      ],
    });

    await createEntry(prisma, {
      type: "CULTURAL",
      countries: ["DZ"],
      categoryIds: [domMusic],
      coverId: covers.music,
      cultural: { contentLanguage: "amz", amazighVariant: "TUAREG" },
      sources: [
        { title: "الممارسات والمعارف المرتبطة بإمزاد — القائمة التمثيلية", publisher: "اليونسكو", year: 2013, url: "https://ich.unesco.org/fr/RL/les-pratiques-et-les-savoirs-lis-limzad-des-communauts-touargues-de-lalgrie-du-mali-et-du-niger-00891" },
      ],
      translations: [
        {
          locale: "ar",
          title: "إمزاد",
          slug: "إمزاد",
          summary: "آلة الوتر الواحد التي لا تصنعها ولا تعزفها إلا نساء الطوارق: حكمةُ الصحراء الموسيقية، أنقذتها مبادرة جزائرية وأدرجتها اليونسكو سنة 2013.",
          body: "إمزاد آلة وترية بقوس، بوترٍ واحد من شعر الخيل مشدود على قرعة مغطاة بالجلد — لكن سرّها ليس في بساطتها بل في قانونها: صنعُها وعزفها حكرٌ على النساء. تجلس العازفة فتوقّع، بينما ينشد الرجال أشعار البطولة والحب والترحال، في مجالس الأهقار والتاسيلي وآزواد.\n\nالإمزاد أكثر من موسيقى: مقامٌ اجتماعي كامل، به تُروَّض النزاعات وتُردّ الأرواح وتُحفظ ذاكرة القبيلة. وقد كاد يندثر أواخر القرن العشرين حين لم يبق من عازفاته الكبيرات إلا قلة.\n\nفجاء الإنقاذ من تمنراست: جمعية «إنقاذ الإمزاد» (تأسست 2003) بنت داراً ومدرسة تُخرّج عازفات شابات. وسنة 2013 أدرجت اليونسكو «الممارسات والمعارف المرتبطة بإمزاد» بملف مشترك بين الجزائر ومالي والنيجر — نموذجاً للتعاون الصحراوي العابر للحدود في خدمة تراث أمازيغي عريق.",
          seo: "إمزاد آلة نساء الطوارق: وتر واحد وحكمة صحراء كاملة — إنقاذ جزائري وإدراج أممي 2013.",
          date: "2026-06-24",
        },
      ],
    });

    await createEntry(prisma, {
      type: "CULTURAL",
      countries: ["MA", "DZ", "TN"],
      categoryIds: [domArchi],
      coverId: covers.architecture,
      cultural: {},
      sources: [
        { author: "Georges Marçais", title: "L'architecture musulmane d'Occident", publisher: "Arts et métiers graphiques", year: 1954 },
        { title: "قوائم التراث العالمي: فاس، تونس، قصبة الجزائر، تطوان، غدامس", publisher: "اليونسكو", url: "https://whc.unesco.org" },
      ],
      translations: [
        {
          locale: "ar",
          title: "العمارة المغاربية الأندلسية",
          slug: "العمارة-المغاربية-الأندلسية",
          summary: "لغة معمارية واحدة للغرب الإسلامي: القوس الحدوي والصومعة المربعة والزليج والجص المنحوت — من قرطبة إلى شنقيط.",
          body: "طوّر الغرب الإسلامي لغته المعمارية الخاصة، تعرفها العين من أول نظرة: القوس على شكل حدوة الفرس، والصومعة المربعة لا الأسطوانية، والصحن المفتوح تحفّه الأروقة، وفنون التكسية — الزليج المتقن، والجص المنحوت آياتٍ وتوريقاً، وسقوف خشب الأرز المصبوغ.\n\nذروة هذا الفن ثلاثية الموحدين الشهيرة: الكتبية بمراكش، والخيرالدا بإشبيلية، وصومعة حسان بالرباط — ثلاث مآذن شقيقات لأسرة واحدة على ضفتين. ثم جاءت مدارس بني مرين بفاس (البوعنانية والعطارين) ونظيراتها الحفصية بتونس والزيانية بتلمسان، فقصور العهد العثماني وقصباته في الجزائر وتونس.\n\nوما تزال هذه اللغة حية: تصنّف اليونسكو مدناً كاملة منها تراثاً عالمياً — فاس وتونس العتيقة وقصبة الجزائر وتطوان وغدامس — ويواصل الصنّاع المغاربيون نقل أسرارها: الزليجيون والجباصون والنقاشون على الخشب، حرّاسُ جمالٍ عمره ألف سنة.",
          seo: "العمارة المغاربية الأندلسية: القوس الحدوي والصوامع المربعة والزليج — من الكتبية وحسان والخيرالدا إلى مدن اليونسكو.",
          date: "2026-06-23",
        },
        {
          locale: "fr",
          title: "L'architecture arabo-andalouse du Maghreb",
          slug: "architecture-arabo-andalouse",
          summary: "Une seule langue architecturale pour l'Occident musulman : arc outrepassé, minaret carré, zellige et plâtre sculpté — de Cordoue à Chinguetti.",
          body: "L'Occident musulman a développé sa langue architecturale propre, reconnaissable au premier regard : l'arc en fer à cheval, le minaret carré et non cylindrique, la cour ouverte bordée de galeries, et les arts du revêtement — zellige minutieux, plâtre sculpté en versets et en rinceaux, plafonds de cèdre peint.\n\nSon sommet reste la fameuse trilogie almohade : la Koutoubia à Marrakech, la Giralda à Séville et la tour Hassan à Rabat — trois minarets sœurs d'une même dynastie, sur deux rives. Vinrent ensuite les médersas mérinides de Fès (Bou Inania, Attarine) et leurs cousines hafsides de Tunis et zianides de Tlemcen, puis les palais et casbahs de l'époque ottomane à Alger et Tunis.\n\nCette langue est toujours vivante : l'UNESCO classe des villes entières qui en relèvent — Fès, la médina de Tunis, la Casbah d'Alger, Tétouan, Ghadamès — et les maîtres-artisans maghrébins continuent d'en transmettre les secrets : zelligeurs, plâtriers, sculpteurs sur bois, gardiens d'une beauté millénaire.",
          seo: "L'architecture arabo-andalouse : arcs outrepassés, minarets carrés, zellige — de la Koutoubia aux médinas UNESCO.",
          date: "2026-06-23",
        },
      ],
    });

    await createEntry(prisma, {
      type: "CULTURAL",
      countries: ["DZ", "TN", "MA", "LY", "MR"],
      categoryIds: [domCinema],
      coverId: covers.cinema,
      cultural: {},
      sources: [
        { author: "Férid Boughedir", title: "Le cinéma africain de A à Z", publisher: "OCIC", year: 1987 },
        { author: "Roy Armes", title: "Postcolonial Images: Studies in North African Film", publisher: "Indiana University Press", year: 2005 },
      ],
      translations: [
        {
          locale: "ar",
          title: "سينما المغرب الكبير",
          slug: "سينما-المغرب-الكبير",
          summary: "من السعفة الذهبية الجزائرية إلى رواد موريتانيا العالميين: سينما خمسة بلدان كتبت الذاكرة والهوية بميزانيات صغيرة وطموح كبير.",
          body: "وُلدت سينمات المغرب الكبير مع الاستقلالات وحملت أسئلتها. الجزائر افتتحت بذاكرة الحرب: «معركة الجزائر» (1966) الذي أنتجته ودخل تاريخ السينما العالمية، ثم توّجت بـ«وقائع سنين الجمر» لمحمد الأخضر حامينا — السعفة الذهبية بمهرجان كان 1975، الوحيدة عربياً وإفريقياً إلى اليوم.\n\nتونس بنت المؤسسات والمواهب: أيام قرطاج السينمائية (1966) أولاً، ثم موجة إبداعية عالمية — «حلفاوين» لفريد بوغدير (1990) و«صمت القصور» لمفيدة التلاتلي (1994). والمغرب نهض منذ التسعينات دعماً وإنتاجاً حتى صار من أنشط سينمات القارة (جيل نبيل عيوش وما بعده). وليبيا أنتجت الملحمة الشهيرة «عمر المختار: أسد الصحراء» (1981). أما موريتانيا فأعطت رائدين عالميين: محمد هوندو («Soleil Ô»، 1970) وعبد الرحمن سيساكو الذي بلغ ترشيح الأوسكار بـ«تمبكتو» (2014).\n\nقاسمها المشترك: سينما مؤلفين تُساءل الذاكرة والمجتمع، تلتقي جماهيرها ونقادها كل موسم في قرطاج ومراكش ووهران — شبكة مهرجانات صارت هي نفسها مؤسسة مغاربية.",
          seo: "سينما المغرب الكبير: سعفة حامينا الذهبية، أيام قرطاج، حلفاوين وتمبكتو — خمس سينمات وذاكرة واحدة.",
          date: "2026-06-22",
        },
        {
          locale: "fr",
          title: "Le cinéma du Grand Maghreb",
          slug: "cinema-du-grand-maghreb",
          summary: "De la Palme d'or algérienne aux pionniers mauritaniens de rang mondial : les cinémas de cinq pays qui écrivent mémoire et identité avec de petits budgets et une grande ambition.",
          body: "Les cinémas du Grand Maghreb sont nés avec les indépendances et en ont porté les questions. L'Algérie ouvrit par la mémoire de la guerre : « La Bataille d'Alger » (1966), qu'elle produisit et qui entra dans l'histoire mondiale du cinéma, puis le sacre de « Chronique des années de braise » de Mohammed Lakhdar-Hamina — Palme d'or à Cannes en 1975, la seule du monde arabe et d'Afrique à ce jour.\n\nLa Tunisie bâtit les institutions et les talents : les Journées cinématographiques de Carthage (1966) d'abord, puis une vague créative de rayonnement mondial — « Halfaouine » de Férid Boughedir (1990), « Les Silences du palais » de Moufida Tlatli (1994). Le Maroc s'est imposé depuis les années 1990 comme l'un des cinémas les plus actifs du continent (la génération Nabil Ayouch et au-delà). La Libye produisit la fresque « Le Lion du désert » (1981). Et la Mauritanie donna deux pionniers de rang mondial : Med Hondo (« Soleil Ô », 1970) et Abderrahmane Sissako, nommé aux Oscars avec « Timbuktu » (2014).\n\nLeur dénominateur commun : un cinéma d'auteurs qui interroge mémoire et société, et dont publics et critiques se retrouvent chaque saison à Carthage, Marrakech ou Oran — un réseau de festivals devenu lui-même une institution maghrébine.",
          seo: "Cinéma du Grand Maghreb : Palme d'or de Lakhdar-Hamina, JCC, Halfaouine, Timbuktu — cinq cinémas, une mémoire.",
          date: "2026-06-22",
        },
      ],
    });

    console.log("Fiches culture créées : 10 entrées (dont 5 traduites en français).");
  }

  if (await hasArSlug(prisma, "أيام-قرطاج-السينمائية")) {
    console.log("Initiatives culturelles déjà présentes — lot ignoré.");
  } else {
    const domCultureInit = await findOrCreateCategory(prisma, "INITIATIVE_DOMAIN", {
      ar: "الثقافة والمهرجانات",
      fr: "Culture et festivals",
      en: "Culture and festivals",
    }, 3);

    await createEntry(prisma, {
      type: "INITIATIVE",
      countries: ["TN"],
      categoryIds: [domCultureInit],
      coverId: covers.cinema,
      initiative: {
        actorType: "FESTIVAL",
        state: "ACTIVE",
        foundedYear: 1966,
        founders: "الطاهر شريعة ووزارة الثقافة التونسية",
        isVerified: true,
        lastVerifiedAt: new Date("2026-06-01"),
        officialLinks: [{ label: "الموقع الرسمي", url: "https://www.jcctunisie.org" }],
      },
      sources: [
        { author: "Férid Boughedir", title: "Le cinéma africain de A à Z", publisher: "OCIC", year: 1987 },
      ],
      translations: [
        {
          locale: "ar",
          title: "أيام قرطاج السينمائية",
          slug: "أيام-قرطاج-السينمائية",
          summary: "أقدم مهرجان سينمائي في إفريقيا والعالم العربي (تونس، منذ 1966): منبر سينما الجنوب وجائزة التانيت الذهبي.",
          body: "أسّس الناقد والمناضل الثقافي الطاهر شريعة أيام قرطاج السينمائية بتونس سنة 1966، برهانٍ مؤسِّس سابق لعصره: أن تكون للسينما الإفريقية والعربية منصتها الخاصة، تُتوَّج فيها أفلامها بمعزل عن مركزية الشمال.\n\nجائزتها الكبرى «التانيت الذهبي» — باسم الإلهة القرطاجية — ذهبت في الدورة الأولى إلى «La Noire de...» للسنغالي عثمان سمبان، معلنةً هوية المهرجان الإفريقية العربية من اليوم الأول. ومنذ 2014 صار المهرجان سنوياً، وظل مدرسةً تخرّج فيها نقاد المنطقة ومخرجوها وجمهورها العريض الذي يملأ قاعات شارع الحبيب بورقيبة كل خريف.\n\nولأيام قرطاج مكانة مغاربية خاصة: فهي الموعد الذي تلتقي فيه أفلام البلدان الخمسة كل سنة على شاشة واحدة وأمام جمهور واحد — مؤسسة ثقافية مغاربية فعلية عمرها ستون سنة.",
          seo: "أيام قرطاج السينمائية منذ 1966: الطاهر شريعة، التانيت الذهبي، وأقدم مهرجانات سينما الجنوب.",
          date: "2026-07-01",
        },
        {
          locale: "fr",
          title: "Les Journées cinématographiques de Carthage",
          slug: "journees-cinematographiques-de-carthage",
          summary: "Le plus ancien festival de cinéma d'Afrique et du monde arabe (Tunis, depuis 1966) : la tribune du cinéma du Sud et son Tanit d'or.",
          body: "Le critique et militant culturel Tahar Cheriaa fonda les Journées cinématographiques de Carthage à Tunis en 1966, sur un pari fondateur en avance sur son temps : donner aux cinémas africains et arabes leur propre tribune, où leurs films seraient couronnés hors de la centralité du Nord.\n\nSon grand prix, le « Tanit d'or » — du nom de la déesse carthaginoise — alla dès la première édition à « La Noire de... » du Sénégalais Ousmane Sembène, affirmant d'emblée l'identité africaine et arabe du festival. Annuel depuis 2014, il demeure l'école où se sont formés les critiques, les cinéastes et le large public de la région, qui remplit chaque automne les salles de l'avenue Bourguiba.\n\nLes JCC occupent une place maghrébine particulière : c'est le rendez-vous où les films des cinq pays se retrouvent chaque année sur un même écran, devant un même public — une institution culturelle maghrébine de fait, vieille de soixante ans.",
          seo: "Les JCC depuis 1966 : Tahar Cheriaa, le Tanit d'or, doyen des festivals du cinéma du Sud.",
          date: "2026-07-01",
        },
      ],
    });

    await createEntry(prisma, {
      type: "INITIATIVE",
      countries: ["MA"],
      categoryIds: [domCultureInit],
      coverId: covers.music,
      initiative: {
        actorType: "FESTIVAL",
        state: "ACTIVE",
        foundedYear: 1998,
        isVerified: true,
        lastVerifiedAt: new Date("2026-06-01"),
        officialLinks: [{ label: "الموقع الرسمي", url: "https://www.festival-gnaoua.net" }],
      },
      sources: [
        { title: "Le gnaoua — Liste représentative du PCI", publisher: "UNESCO", year: 2019, url: "https://ich.unesco.org/fr/RL/le-gnaoua-01170" },
      ],
      translations: [
        {
          locale: "ar",
          title: "مهرجان كناوة وموسيقى العالم — الصويرة",
          slug: "مهرجان-كناوة-الصويرة",
          summary: "منذ 1998 يحوّل مدينة الصويرة كل صيف إلى عاصمة للتلاقح الموسيقي: معلمو كناوة في إبداع مشترك مع نجوم الجاز والبلوز وموسيقى العالم.",
          body: "انطلق مهرجان كناوة وموسيقى العالم بالصويرة سنة 1998 بفكرة بسيطة وجريئة: إخراج فن كناوة من هامش الاعتراف إلى واجهة المشهد، وفتح مسارحه أمام مئات آلاف الزوار مجاناً في قلب المدينة العتيقة وعلى شاطئها.\n\nفلسفته «التلاقح»: إقامات فنية وإبداعات مشتركة تجمع المعلمين الكناويين بنجوم الجاز والبلوز والموسيقى الإفريقية والعالمية، فتولد على منصاته أعمال لا تشبه إلا الصويرة. وقد ساهم هذا المسار في الاعتراف العالمي المتصاعد بالفن، وصولاً إلى إدراج كناوة في قائمة اليونسكو سنة 2019.\n\nصار المهرجان نموذجاً يُحتذى للمهرجانات التراثية في المنطقة: اقتصادٌ ثقافي يحيي مدينة بأكملها، وجسرٌ بين تراث محلي عريق وجمهور كوني.",
          seo: "مهرجان كناوة بالصويرة منذ 1998: التلاقح مع الجاز والبلوز والطريق إلى اليونسكو 2019.",
          date: "2026-06-30",
        },
        {
          locale: "fr",
          title: "Festival Gnaoua et Musiques du monde d'Essaouira",
          slug: "festival-gnaoua-essaouira",
          summary: "Depuis 1998, il transforme chaque été Essaouira en capitale de la fusion : les maâlems gnaoua en création partagée avec les stars du jazz, du blues et des musiques du monde.",
          body: "Le Festival Gnaoua et Musiques du monde d'Essaouira est né en 1998 d'une idée simple et audacieuse : faire passer l'art gnaoua des marges de la reconnaissance au premier plan de la scène, en ouvrant gratuitement ses concerts à des centaines de milliers de visiteurs, au cœur de la médina et sur la plage.\n\nSa philosophie, la « fusion » : résidences artistiques et créations communes réunissant les maâlems gnaoua et les grands noms du jazz, du blues et des musiques africaines et mondiales — donnant naissance sur ses scènes à des œuvres qui ne ressemblent qu'à Essaouira. Ce parcours a contribué à la reconnaissance internationale croissante de cet art, jusqu'à l'inscription du gnaoua à l'UNESCO en 2019.\n\nLe festival est devenu un modèle pour les festivals patrimoniaux de la région : une économie culturelle qui fait vivre toute une ville, et un pont entre un héritage local séculaire et un public universel.",
          seo: "Festival Gnaoua d'Essaouira depuis 1998 : la fusion avec le jazz et le blues, et la route vers l'UNESCO 2019.",
          date: "2026-06-30",
        },
      ],
    });

    console.log("Initiatives culturelles créées : 2 festivals réels.");
  }

  const coverMap: [string, number][] = [
    ["قرطاج", covers.antique],
    ["المرابطون", covers.islamic],
    ["مؤتمر-طنجة-1958", covers.modern],
    ["ابن-خلدون", covers.portrait],
    ["الكاهنة", covers.portrait],
    ["آسيا-جبار", covers.portrait],
    ["الكسكسي", covers.food],
    ["أهليل-قورارة", covers.music],
    ["اتحاد-المغرب-العربي", covers.network],
    ["شبكة-الجامعات-المغاربية", covers.network],
    ["مهرجان-السينما-المغاربية-الشابة", covers.cinema],
    ["المغرب-الكبير-في-10-أسئلة-الحلقة-1", covers.media],
    ["حوار-شبكة-الجامعات-المغاربية", covers.media],
  ];
  for (const [slug, coverId] of coverMap) {
    await attachCoverBySlug(prisma, slug, coverId);
  }
  console.log("Couvertures rattachées aux fiches existantes.");
}
