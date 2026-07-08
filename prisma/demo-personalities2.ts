import type { PrismaClient } from "@prisma/client";
import { createEntry, hasArSlug } from "./demo-helpers";
import { getCovers } from "./demo-covers";

export async function seedPersonalities2(prisma: PrismaClient) {
  if (await hasArSlug(prisma, "الحسن-الوزان")) {
    console.log("Deuxième lot personnalités déjà présent — lot ignoré.");
    return;
  }
  const covers = await getCovers(prisma);

  const wazzan = await createEntry(prisma, {
    type: "PERSONALITY",
    countries: ["MA"],
    coverId: covers.portrait,
    personality: {
      birthYear: 1494,
      deathYear: 1554,
      works: [{ title: "وصف إفريقيا (Descrittione dell'Africa)", year: 1550 }],
    },
    sources: [
      { author: "Natalie Zemon Davis", title: "Trickster Travels: A Sixteenth-Century Muslim Between Worlds", publisher: "Hill and Wang", year: 2006 },
      { author: "الحسن الوزّان", title: "وصف إفريقيا" },
    ],
    translations: [
      {
        locale: "ar",
        title: "الحسن الوزّان (ليون الإفريقي)",
        slug: "الحسن-الوزان",
        summary: "دبلوماسي ورحالة وُلد بغرناطة ونشأ بفاس، أسرته القراصنة وأهدي إلى بابا روما فتنصّر مؤقتاً، وترك كتاب «وصف إفريقيا» الذي ظل مرجع أوروبا الأول عن القارة لقرون.",
        body: "وُلد الحسن بن محمد الوزّان الفاسي حوالي سنة 1494م بغرناطة، وانتقلت أسرته إلى فاس بعد سقوطها سنة 1492م. تلقى تعليمه بجامع القرويين، ثم عمل دبلوماسياً في خدمة السلطان الوطاسي، مما أتاح له التجول الواسع عبر شمال إفريقيا والصحراء والمشرق في مهام رسمية متكررة.\n\nفي إحدى عودته من مهمة دبلوماسية حوالي سنة 1518م، أسره قراصنة، فأُهدي إلى البابا لاون العاشر في روما، الذي عمّده نصرانياً باسم «جيوفاني ليونه» (يوحنا الأسدي) نسبة إلى اسمه هو، وكلّفه بتدوين معارفه عن إفريقيا التي لم يكن الأوروبيون يعرفون عنها إلا القليل.\n\nثمرة ذلك كتاب «وصف إفريقيا» (1550م)، الذي ظل المرجع الأوروبي الأشمل عن جغرافيا القارة ومجتمعاتها طوال قرون تالية، وتُرجم إلى لغات عدة. تختلف الروايات حول أواخر أيامه: يذهب بعض الباحثين إلى أنه عاد إلى شمال إفريقيا وإلى الإسلام بعد سنوات قضاها بإيطاليا. يبقى الحسن الوزّان اليوم رمزاً فريداً لرجل عاش على حدود عالمين وترجم أحدهما للآخر.",
        seo: "الحسن الوزّان (ليون الإفريقي): من فاس إلى بلاط البابا، وكتاب وصف إفريقيا الذي عرّف أوروبا بالقارة.",
        date: "2026-07-09",
      },
      {
        locale: "fr",
        title: "Léon l'Africain (al-Hasan al-Wazzan)",
        slug: "leon-l-africain",
        summary: "Diplomate et voyageur né à Grenade et élevé à Fès, capturé par des corsaires et offert au pape, converti temporairement au christianisme, il laissa la « Description de l'Afrique », référence européenne majeure sur le continent pendant des siècles.",
        body: "Al-Hasan ibn Muhammad al-Wazzan naquit vers 1494 à Grenade ; sa famille s'installa à Fès après la chute de la ville en 1492. Formé à la mosquée-université al-Qarawiyyin, il devint diplomate au service du sultan wattasside, ce qui lui permit de voyager considérablement à travers l'Afrique du Nord, le Sahara et l'Orient au fil de missions officielles répétées.\n\nAlors qu'il revenait d'une mission diplomatique vers 1518, il fut capturé par des corsaires et offert au pape Léon X à Rome, qui le baptisa sous le nom de « Giovanni Leone » (Jean le Lion), en référence à son propre nom, et lui commanda de consigner ses connaissances sur une Afrique alors largement méconnue des Européens.\n\nIl en résulta la « Description de l'Afrique » (1550), qui demeura la référence européenne la plus complète sur la géographie et les sociétés du continent pendant des siècles, traduite en plusieurs langues. Les récits divergent sur la fin de sa vie : certains chercheurs estiment qu'il retourna en Afrique du Nord et à l'islam après ses années italiennes. Léon l'Africain demeure aujourd'hui la figure emblématique d'un homme ayant vécu aux frontières de deux mondes et traduit l'un à l'autre.",
        seo: "Léon l'Africain : de Fès à la cour du pape, et la Description de l'Afrique qui révéla le continent à l'Europe.",
        date: "2026-07-09",
      },
    ],
  });

  const idrissi = await createEntry(prisma, {
    type: "PERSONALITY",
    countries: ["MA"],
    coverId: covers.portrait,
    personality: {
      birthYear: 1100,
      deathYear: 1165,
      works: [{ title: "نزهة المشتاق في اختراق الآفاق (لوحة روجر)", year: 1154 }],
    },
    sources: [
      { author: "S. Maqbul Ahmad", title: "Cartography of al-Sharif al-Idrisi", publisher: "History of Cartography, University of Chicago Press", year: 1992 },
    ],
    translations: [
      {
        locale: "ar",
        title: "الشريف الإدريسي",
        slug: "الشريف-الإدريسي",
        summary: "جغرافي وُلد بسبتة سنة 1100م، رسم في بلاط ملك صقلية روجر الثاني أدق خريطة للعالم في العصور الوسطى، جامعاً بين معارف العرب واليونان ورحّالة عصره.",
        body: "وُلد أبو عبد الله محمد الشريف الإدريسي بسبتة سنة 1100م، من ذرية أدارسة المغرب، وتلقى علومه بقرطبة، ثم تنقل واسعاً بين الأندلس وشمال إفريقيا وآسيا الصغرى، وتذكر بعض الروايات وصوله إلى فرنسا وإنجلترا.\n\nاستقر في بلاط الملك النورماندي روجر الثاني بجزيرة صقلية، الذي كلّفه برسم خريطة شاملة للعالم المعروف آنذاك، معتمداً على مصادر متعددة: كتب الجغرافيين العرب، وتراث بطليموس اليوناني، وشهادات الرحّالة والتجار المباشرة التي كان الإدريسي يجمعها بمنهجية دقيقة.\n\nثمرة هذا العمل كتاب «نزهة المشتاق في اختراق الآفاق» المعروف بـ«لوحة روجر»، الذي أتمّه سنة 1154م، ويُعدّ من أدق خرائط العالم وأشملها في العصور الوسطى، جمع فيه معارف عصره من الصين شرقاً إلى المحيط الأطلسي غرباً. توفي الإدريسي حوالي سنة 1165م، وبقيت لوحته مرجعاً للجغرافيين الأوروبيين قروناً تالية.",
        seo: "الشريف الإدريسي: جغرافي سبتة الذي رسم لوحة روجر، أدق خريطة للعالم في العصور الوسطى.",
        date: "2026-07-09",
      },
      {
        locale: "fr",
        title: "Al-Idrissi",
        slug: "al-idrissi",
        summary: "Géographe né à Ceuta en 1100, il dressa à la cour du roi normand de Sicile Roger II la carte du monde la plus précise du Moyen Âge, croisant les savoirs arabes, grecs et les récits de voyageurs.",
        body: "Abu Abdallah Muhammad al-Sharif al-Idrissi naquit à Ceuta en 1100, descendant des Idrissides du Maroc, et fit ses études à Cordoue avant de voyager largement entre al-Andalus, l'Afrique du Nord et l'Asie Mineure — certains récits évoquant même un passage par la France et l'Angleterre.\n\nIl s'installa à la cour du roi normand Roger II de Sicile, qui lui commanda une carte complète du monde alors connu, s'appuyant sur des sources multiples : les traités des géographes arabes, l'héritage grec de Ptolémée, et les témoignages directs de voyageurs et marchands qu'al-Idrissi collectait avec une rigueur méthodique.\n\nCe travail aboutit à la « Tabula Rogeriana » (Nuzhat al-Mushtaq), achevée en 1154, considérée comme l'une des cartes du monde les plus précises et complètes du Moyen Âge, réunissant les connaissances de son époque de la Chine à l'océan Atlantique. Al-Idrissi mourut vers 1165, et sa carte demeura une référence pour les géographes européens pendant des siècles.",
        seo: "Al-Idrissi : le géographe de Ceuta et la Tabula Rogeriana, carte du monde la plus précise du Moyen Âge.",
        date: "2026-07-09",
      },
    ],
  });

  const bourguiba = await createEntry(prisma, {
    type: "PERSONALITY",
    countries: ["TN"],
    coverId: covers.portrait,
    personality: { birthYear: 1903, deathYear: 2000 },
    sources: [
      { author: "محمد المالكي", title: "الحركات الوطنية والاستعمار في المغرب العربي", publisher: "مركز دراسات الوحدة العربية" },
      { title: "مجلة الأحوال الشخصية التونسية", publisher: "الرائد الرسمي للجمهورية التونسية", year: 1956 },
    ],
    translations: [
      {
        locale: "ar",
        title: "الحبيب بورقيبة",
        slug: "الحبيب-بورقيبة",
        summary: "قائد الحركة الوطنية التونسية وأول رئيس للجمهورية (1957–1987)، ارتبط اسمه بمجلة الأحوال الشخصية وسياسات تحديثية واسعة، وبحكم أحادي الحزب دام ثلاثة عقود.",
        body: "وُلد الحبيب بورقيبة سنة 1903 بالمنستير، ودرس الحقوق بباريس، وأسّس سنة 1934 الحزب الحر الدستوري الجديد الذي قاد به الحركة الوطنية التونسية، فسُجن ونُفي مرات عدة على يد سلطات الحماية الفرنسية قبل استقلال تونس سنة 1956.\n\nتولى رئاسة الحكومة عقب الاستقلال، ثم أعلن إلغاء النظام الملكي (البايات) وقيام الجمهورية، فانتُخب أول رئيس لها سنة 1957 واستمر في الحكم حتى تنحيته بموجب تقرير طبي دبّره وزيره الأول زين العابدين بن علي سنة 1987. طبع حكمه إصلاحات تحديثية واسعة: مجلة الأحوال الشخصية سنة 1956 التي منعت تعدد الزوجات ووسّعت حقوق النساء، وتعميم التعليم، وسياسة علمنة نسبية للدولة. من أبرز محطاته الجدلية خطابه الشهير سنة 1960 الذي دعا فيه إلى الإفطار في رمضان باسم متطلبات الإنتاج، فأثار جدلاً واسعاً.\n\nحكم بورقيبة تونس عقوداً ضمن نظام الحزب الواحد، وهو ما يجعل تقييم إرثه محل نقاش مستمر بين الإشادة بإصلاحاته الاجتماعية والانتقاد لطول حكمه الفردي. توفي سنة 2000 بمسقط رأسه المنستير.",
        seo: "الحبيب بورقيبة: أول رئيس تونسي، مجلة الأحوال الشخصية، وثلاثة عقود من الحكم الأحادي.",
        date: "2026-07-09",
      },
      {
        locale: "fr",
        title: "Habib Bourguiba",
        slug: "habib-bourguiba",
        summary: "Chef du mouvement national tunisien et premier président de la République (1957-1987), associé au Code du statut personnel et à de vastes réformes modernisatrices, ainsi qu'à trois décennies de régime à parti unique.",
        body: "Habib Bourguiba naquit en 1903 à Monastir et étudia le droit à Paris. Il fonda en 1934 le Néo-Destour, avec lequel il mena le mouvement national tunisien, ce qui lui valut plusieurs emprisonnements et exils sous le protectorat français avant l'indépendance de la Tunisie en 1956.\n\nDevenu chef du gouvernement après l'indépendance, il proclama ensuite l'abolition de la monarchie beylicale et l'avènement de la République, dont il fut élu premier président en 1957, gouvernant jusqu'à sa destitution par rapport médical orchestré par son Premier ministre Zine el-Abidine Ben Ali en 1987. Son règne fut marqué par de vastes réformes modernisatrices : le Code du statut personnel de 1956, qui interdit la polygamie et étendit les droits des femmes, la généralisation de l'éducation, et une politique de sécularisation relative de l'État. Son discours de 1960 appelant à rompre le jeûne du Ramadan au nom des impératifs de production reste l'un de ses épisodes les plus controversés.\n\nBourguiba gouverna la Tunisie pendant des décennies dans un système de parti unique, ce qui rend l'évaluation de son héritage toujours débattue, entre éloge de ses réformes sociales et critique de la longévité de son pouvoir personnel. Il mourut en 2000 dans sa ville natale de Monastir.",
        seo: "Habib Bourguiba : premier président tunisien, Code du statut personnel, et trois décennies de pouvoir.",
        date: "2026-07-09",
      },
    ],
  });

  const kateb = await createEntry(prisma, {
    type: "PERSONALITY",
    countries: ["DZ"],
    coverId: covers.portrait,
    personality: {
      birthYear: 1929,
      deathYear: 1989,
      works: [
        { title: "نجمة (Nedjma)", year: 1956 },
        { title: "الأسلاف يزدادون ضراوة (Le Cercle des représailles)", year: 1959 },
      ],
    },
    sources: [
      { author: "Kateb Yacine", title: "Nedjma", publisher: "Le Seuil", year: 1956 },
      { author: "Charles Bonn", title: "Kateb Yacine, Nedjma", publisher: "PUF", year: 1990 },
    ],
    translations: [
      {
        locale: "ar",
        title: "كاتب ياسين",
        slug: "كاتب-ياسين",
        summary: "روائي وكاتب مسرحي جزائري (1929–1989)، اعتُقل في مجازر ماي 1945 وهو مراهق، وكتب رواية «نجمة» التي صارت من أهم روايات الأدب المغاربي الحديث.",
        body: "وُلد كاتب ياسين سنة 1929 بقسنطينة، واعتُقل وهو في السادسة عشرة إثر مشاركته في مظاهرات الثامن من ماي 1945 التي قوبلت بقمع دموي واسع في سطيف وقالمة وخراطة — تجربة تركت أثراً عميقاً في وعيه ومساره الأدبي.\n\nنشر سنة 1956 روايته «نجمة»، التي تروي بأسلوب متقطع ومركّب قصة حب واغتراب وهوية، وصارت علامة فارقة في الأدب الجزائري والمغاربي الناطق بالفرنسية، ومرجعاً يُدرَّس في الجامعات حول العالم. توجه لاحقاً نحو «المسرح الشعبي» الذي كتبه بالدارجة الجزائرية والأمازيغية سعياً لإيصال أعماله إلى جمهور أوسع خارج النخبة المثقفة الفرنكوفونية.\n\nيُعدّ كاتب ياسين اليوم أحد أبرز الأصوات الأدبية المغاربية في القرن العشرين، ونال عن مجمل أعماله تقديراً نقدياً كبيراً قبل وفاته سنة 1989.",
        seo: "كاتب ياسين: روائي الجزائر وصاحب نجمة، من مجازر 1945 إلى المسرح الشعبي بالدارجة.",
        date: "2026-07-09",
      },
      {
        locale: "fr",
        title: "Kateb Yacine",
        slug: "kateb-yacine",
        summary: "Romancier et dramaturge algérien (1929-1989), arrêté adolescent lors des massacres de mai 1945, auteur de « Nedjma », devenu l'un des romans majeurs de la littérature maghrébine moderne.",
        body: "Kateb Yacine naquit en 1929 à Constantine et fut arrêté à seize ans après avoir participé aux manifestations du 8 mai 1945, réprimées dans le sang à Sétif, Guelma et Kherrata — une expérience qui marqua profondément sa conscience et son parcours littéraire.\n\nIl publia en 1956 « Nedjma », roman à la structure fragmentée et complexe, récit d'amour, d'exil et de quête identitaire, qui devint un jalon de la littérature algérienne et maghrébine d'expression française, étudié aujourd'hui dans les universités du monde entier. Il se tourna ensuite vers un « théâtre populaire » écrit en arabe dialectal algérien et en tamazight, cherchant à toucher un public plus large que l'élite francophone lettrée.\n\nKateb Yacine demeure l'une des voix littéraires maghrébines majeures du XXe siècle, dont l'œuvre reçut une large reconnaissance critique avant sa mort en 1989.",
        seo: "Kateb Yacine : romancier algérien de Nedjma, des massacres de 1945 au théâtre populaire.",
        date: "2026-07-09",
      },
    ],
  });

  await createEntry(prisma, {
    type: "PERSONALITY",
    countries: ["DZ", "DSP"],
    coverId: covers.portrait,
    personality: { birthYear: 1949, deathYear: 2020 },
    sources: [
      { title: "Idir, la voix de la Kabylie, s'est éteinte", publisher: "Le Monde", year: 2020, url: "https://www.lemonde.fr/disparitions/article/2020/05/02/idir-la-voix-de-la-kabylie-s-est-eteinte_6038028_3382.html" },
    ],
    translations: [
      {
        locale: "ar",
        title: "إيدير",
        slug: "إيدير",
        summary: "مغنٍّ قبائلي جزائري (1949–2020)، حوّلت أغنيته «آ ياوا إينوة» (1973) الغناء الأمازيغي إلى ظاهرة عالمية، وكرّس مساره الفني للدفاع عن الثقافة واللغة الأمازيغيتين.",
        body: "وُلد حميد الشريط، المعروف باسمه الفني إيدير، سنة 1949 بآيت الحسن بمنطقة القبائل الجزائرية. سجّل سنة 1973 أغنيته «آ ياوا إينوة» (يا أبتِ الصغير) المستوحاة من حكاية قبائلية تقليدية، فكانت أول أغنية جزائرية تدخل القوائم الفرنسية للأغاني الأكثر استماعاً، ولفتت انتباه العالم لأول مرة إلى الموسيقى القبائلية.\n\nواصل إيدير مساره الفني من باريس حيث استقر، جامعاً بين الحفاظ على التراث الشفوي الأمازيغي وتحديث توزيعه الموسيقي، وتعاون مع فنانين عالميين. ظل طوال مسيرته صوتاً بارزاً في الدفاع عن الاعتراف باللغة والثقافة الأمازيغيتين.\n\nتوفي بباريس سنة 2020، ورثاه محبّوه في المغرب الكبير وخارجه بوصفه أحد أهم من عرّف العالم بالثقافة الأمازيغية عبر الموسيقى.",
        seo: "إيدير: صوت القبائل الذي عرّف العالم بالأغنية الأمازيغية عبر أغنية آ ياوا إينوة.",
        date: "2026-07-09",
      },
    ],
  });

  await createEntry(prisma, {
    type: "PERSONALITY",
    countries: ["MA", "DSP"],
    coverId: covers.portrait,
    personality: {
      birthYear: 1944,
      isLiving: true,
      works: [
        { title: "الليلة المقدسة (La Nuit sacrée)", year: 1987 },
        { title: "طفل الرمال (L'Enfant de sable)", year: 1985 },
        { title: "العنصرية كما شرحتها لابنتي", year: 1998 },
      ],
    },
    sources: [
      { title: "Tahar Ben Jelloun, prix Goncourt 1987", publisher: "Académie Goncourt", url: "https://www.academiegoncourt.com" },
    ],
    translations: [
      {
        locale: "ar",
        title: "الطاهر بنجلون",
        slug: "الطاهر-بنجلون",
        summary: "كاتب وشاعر مغربي وُلد بفاس سنة 1944، أول كاتب مغاربي وعربي ينال جائزة غونكور الفرنسية الرفيعة سنة 1987 عن روايته «الليلة المقدسة».",
        body: "وُلد الطاهر بنجلون سنة 1944 بفاس، واستقر بفرنسا منذ 1971 حيث بنى مساراً أدبياً غزيراً بالفرنسية، تناول فيه قضايا الهوية والهجرة والإسلام وحقوق الإنسان.\n\nحقق شهرة عالمية واسعة برواية «طفل الرمال» (1985) وتتمّتها «الليلة المقدسة» (1987)، التي نالت عنها جائزة غونكور المرموقة في السنة نفسها، ليصبح بذلك أول كاتب مغاربي وعربي ينالها. عُرف كذلك بمقالاته ومؤلفاته التربوية في مناهضة العنصرية، أبرزها كتابه «العنصرية كما شرحتها لابنتي» (1998) الذي تُرجم إلى لغات عديدة واعتُمد في برامج تربوية بفرنسا.\n\nلا يزال الطاهر بنجلون أحد أكثر الأصوات الأدبية المغاربية حضوراً على الساحة الدولية، وواصل نشر أعماله الروائية والشعرية والمقالية حتى اليوم.",
        seo: "الطاهر بنجلون: كاتب فاس الحائز على غونكور 1987، أول مغاربي وعربي ينال الجائزة.",
        date: "2026-07-09",
      },
      {
        locale: "fr",
        title: "Tahar Ben Jelloun",
        slug: "tahar-ben-jelloun",
        summary: "Écrivain et poète marocain né à Fès en 1944, premier auteur maghrébin et arabe à recevoir le prestigieux prix Goncourt en 1987 pour « La Nuit sacrée ».",
        body: "Tahar Ben Jelloun naquit en 1944 à Fès et s'installa en France dès 1971, où il construisit une œuvre littéraire abondante en langue française, abordant les questions d'identité, d'immigration, d'islam et de droits humains.\n\nIl connut une renommée internationale avec « L'Enfant de sable » (1985) et sa suite « La Nuit sacrée » (1987), pour laquelle il reçut cette même année le prestigieux prix Goncourt, devenant ainsi le premier écrivain maghrébin et arabe à l'obtenir. Il est également connu pour ses essais pédagogiques contre le racisme, notamment « Le Racisme expliqué à ma fille » (1998), traduit en de nombreuses langues et intégré à des programmes éducatifs en France.\n\nTahar Ben Jelloun demeure l'une des voix littéraires maghrébines les plus présentes sur la scène internationale, poursuivant aujourd'hui encore la publication d'œuvres romanesques, poétiques et d'essais.",
        seo: "Tahar Ben Jelloun : écrivain de Fès, premier Maghrébin et Arabe lauréat du prix Goncourt (1987).",
        date: "2026-07-09",
      },
    ],
  });

  await prisma.relatedContent.createMany({
    data: [{ fromId: wazzan.id, toId: idrissi.id }],
    skipDuplicates: true,
  });

  console.log("Deuxième lot personnalités créé : 6 entrées (dont 4 traduites en français).");
  return { wazzan, idrissi, bourguiba, kateb };
}
