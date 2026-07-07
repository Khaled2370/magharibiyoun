import type { PrismaClient } from "@prisma/client";
import { createEntry, findOrCreateCategory, hasArSlug } from "./demo-helpers";
import { getCovers } from "./demo-covers";

export async function seedHistory(prisma: PrismaClient) {
  if (await hasArSlug(prisma, "نوميديا")) {
    console.log("Fiches histoire déjà présentes — lot ignoré.");
    return;
  }
  const covers = await getCovers(prisma);

  const perAntiq = await findOrCreateCategory(prisma, "HISTORY_PERIOD", {
    ar: "العصور القديمة",
    fr: "Antiquité",
    en: "Antiquity",
  }, 1);
  const perIslam = await findOrCreateCategory(prisma, "HISTORY_PERIOD", {
    ar: "الفتح الإسلامي والدول المغاربية",
    fr: "Conquête musulmane et dynasties",
    en: "Islamic conquest and dynasties",
  }, 2);
  const perOttoman = await findOrCreateCategory(prisma, "HISTORY_PERIOD", {
    ar: "العهد العثماني والحقبة الحديثة",
    fr: "Époque ottomane et temps modernes",
    en: "Ottoman era and early modern times",
  }, 3);
  const perColonial = await findOrCreateCategory(prisma, "HISTORY_PERIOD", {
    ar: "الاستعمار والمقاومة",
    fr: "Colonisation et résistances",
    en: "Colonisation and resistance",
  }, 4);
  const perModern = await findOrCreateCategory(prisma, "HISTORY_PERIOD", {
    ar: "الاستقلالات وبناء الدول",
    fr: "Indépendances et États modernes",
    en: "Independence and modern states",
  }, 5);

  await createEntry(prisma, {
    type: "HISTORICAL_ENTRY",
    countries: ["DZ", "TN"],
    categoryIds: [perAntiq],
    coverId: covers.antique,
    historical: { periodCategoryId: perAntiq, yearStart: -202, yearEnd: -46 },
    sources: [
      { author: "Gabriel Camps", title: "Les Berbères : mémoire et identité", publisher: "Errance", year: 1987 },
      { author: "سالوستيوس", title: "حرب يوغرطة (Bellum Jugurthinum)" },
      { author: "Charles-André Julien", title: "Histoire de l'Afrique du Nord", publisher: "Payot", year: 1951 },
    ],
    translations: [
      {
        locale: "ar",
        title: "مملكة نوميديا",
        slug: "نوميديا",
        summary: "أول مملكة أمازيغية كبرى موحّدة في التاريخ، قامت في شمال إفريقيا خلال القرن الثالث قبل الميلاد وبلغت أوجها في عهد الملك ماسينيسا وعاصمته سيرتا.",
        body: "توحّدت القبائل النوميدية — الماسيل شرقاً والماسيسيل غرباً — على يد ماسينيسا سنة 202 ق.م، بعد تحالفه مع روما في نهاية الحرب البونيقية الثانية. حكم ماسينيسا أكثر من نصف قرن، وجعل من سيرتا (قسنطينة اليوم) عاصمةً لدولة امتدت من غرب البلاد التونسية الحالية إلى عمق الجزائر.\n\nعمل الملك على توطين الرحّل وتطوير الزراعة وسكّ العملة وبناء جيش نظامي، حتى غدت نوميديا قوة إقليمية يُحسب لها الحساب، ونُسب إليه الشعار الشهير «إفريقيا للإفريقيين». وبعد وفاته سنة 148 ق.م عرفت المملكة صراعات على العرش، أشهرها حرب يوغرطة ضد روما (112–105 ق.م) التي خلّدها المؤرخ الروماني سالوستيوس في كتاب كامل.\n\nانتهى الكيان النوميدي المستقل فعلياً سنة 46 ق.م، حين هُزم الملك يوبا الأول — حليف بومبيوس — أمام قيصر، فحوّلت روما نوميديا إلى ولاية. وتبقى المملكة مرجعاً مؤسِّساً في الذاكرة المغاربية بوصفها أول دولة كبرى بناها سكان شمال إفريقيا الأصليون.",
        seo: "مملكة نوميديا وماسينيسا: أول دولة أمازيغية كبرى في التاريخ، من سيرتا إلى حرب يوغرطة.",
        date: "2026-06-30",
      },
      {
        locale: "fr",
        title: "Le royaume de Numidie",
        slug: "royaume-de-numidie",
        summary: "Premier grand royaume amazigh unifié de l'histoire, né en Afrique du Nord au IIIe siècle av. J.-C. et porté à son apogée par le roi Massinissa depuis sa capitale Cirta.",
        body: "Les tribus numides — Massyles à l'est, Masaesyles à l'ouest — furent unifiées par Massinissa en 202 av. J.-C., après son alliance avec Rome à l'issue de la deuxième guerre punique. Massinissa régna plus d'un demi-siècle et fit de Cirta (l'actuelle Constantine) la capitale d'un État s'étendant de l'ouest de la Tunisie actuelle aux profondeurs de l'Algérie.\n\nLe roi sédentarisa les nomades, développa l'agriculture, frappa monnaie et bâtit une armée régulière, faisant de la Numidie une puissance régionale respectée — on lui attribue la devise fameuse « l'Afrique aux Africains ». Après sa mort en 148 av. J.-C., le royaume connut des luttes de succession, dont la plus célèbre est la guerre de Jugurtha contre Rome (112–105 av. J.-C.), immortalisée par l'historien Salluste.\n\nL'entité numide indépendante s'éteignit en 46 av. J.-C., quand le roi Juba Ier, allié de Pompée, fut vaincu par César et que Rome fit de la Numidie une province. Le royaume demeure une référence fondatrice de la mémoire maghrébine : le premier grand État bâti par les habitants originels de l'Afrique du Nord.",
        seo: "Le royaume de Numidie et Massinissa : premier grand État amazigh, de Cirta à la guerre de Jugurtha.",
        date: "2026-06-30",
      },
    ],
  });

  await createEntry(prisma, {
    type: "HISTORICAL_ENTRY",
    countries: ["TN"],
    categoryIds: [perIslam],
    coverId: covers.islamic,
    historical: { periodCategoryId: perIslam, yearStart: 670, yearEnd: 1057 },
    sources: [
      { author: "حسين مؤنس", title: "فتح العرب للمغرب", publisher: "مكتبة الثقافة الدينية" },
      { author: "ابن عذاري المراكشي", title: "البيان المغرب في أخبار الأندلس والمغرب" },
      { title: "القيروان — قائمة التراث العالمي", publisher: "اليونسكو", year: 1988, url: "https://whc.unesco.org/fr/list/499" },
    ],
    translations: [
      {
        locale: "ar",
        title: "تأسيس القيروان",
        slug: "تأسيس-القيروان",
        summary: "أسّس عقبة بن نافع مدينة القيروان سنة 50هـ/670م قاعدةً للفتح الإسلامي في المغرب، فصارت أول حاضرة إسلامية كبرى في المنطقة ومركز إشعاع علمي لقرون.",
        body: "اختطّ عقبة بن نافع الفهري القيروان سنة 50هـ/670م في سهول البلاد التونسية الداخلية، بعيداً عن ساحلٍ كانت تهدده الأساطيل البيزنطية، لتكون معسكراً ثابتاً وقاعدة انطلاق نحو غرب المغرب. وشيّد فيها جامعه الكبير الذي ما يزال قائماً في موضعه بعد إعادة بناء متعاقبة.\n\nبلغت المدينة أوجها في عهد الأغالبة (800–909م): جُدّد جامع عقبة في صورته الكبرى سنة 836م، وأُنشئت البرك المائية الشهيرة، وانطلق من مينائها فتح صقلية سنة 827م بقيادة الفقيه أسد بن الفرات. وفي رحابها دوّن سحنون «المدونة» فصارت القيروان قلعة المذهب المالكي الذي يجمع المغرب الكبير إلى اليوم.\n\nتراجعت المدينة بعد الزحف الهلالي في منتصف القرن الحادي عشر لفائدة تونس والمهدية، لكنها حافظت على مكانتها الروحية والعلمية. وصنّفت اليونسكو مدينتها العتيقة تراثاً عالمياً سنة 1988.",
        seo: "تأسيس القيروان 670م: عقبة بن نافع، جامع القيروان، الأغالبة، وقلعة المالكية في المغرب الكبير.",
        date: "2026-06-29",
      },
      {
        locale: "fr",
        title: "La fondation de Kairouan",
        slug: "fondation-de-kairouan",
        summary: "Fondée par Uqba ibn Nafi en 670, Kairouan fut la base de la conquête musulmane du Maghreb, première grande métropole islamique de la région et foyer de rayonnement savant pendant des siècles.",
        body: "Uqba ibn Nafi traça Kairouan en 670 (50 de l'hégire) dans les plaines intérieures de la Tunisie actuelle, loin d'un littoral menacé par les flottes byzantines, pour en faire un camp permanent et une base de départ vers l'ouest du Maghreb. Il y éleva sa Grande Mosquée, toujours debout au même emplacement après des reconstructions successives.\n\nLa ville connut son apogée sous les Aghlabides (800–909) : la mosquée d'Uqba fut rebâtie dans sa forme monumentale en 836, les célèbres bassins hydrauliques furent créés, et c'est de là que partit la conquête de la Sicile en 827, menée par le juriste Asad ibn al-Furat. C'est aussi à Kairouan que Sahnoun compila la « Mudawwana », faisant de la cité la citadelle du malikisme qui unit encore le Grand Maghreb.\n\nLa ville déclina après l'arrivée des tribus hilaliennes au milieu du XIe siècle, au profit de Tunis et Mahdia, mais conserva son prestige spirituel et savant. Sa médina est inscrite au patrimoine mondial de l'UNESCO depuis 1988.",
        seo: "Kairouan, 670 : Uqba ibn Nafi, la Grande Mosquée, les Aghlabides et la citadelle du malikisme maghrébin.",
        date: "2026-06-29",
      },
    ],
  });

  await createEntry(prisma, {
    type: "HISTORICAL_ENTRY",
    countries: ["MA", "DZ", "TN", "LY"],
    categoryIds: [perIslam],
    coverId: covers.islamic,
    historical: { periodCategoryId: perIslam, yearStart: 1121, yearEnd: 1269 },
    sources: [
      { author: "Roger Le Tourneau", title: "The Almohad Movement in North Africa", publisher: "Princeton University Press", year: 1969 },
      { author: "عبد الله العروي", title: "مجمل تاريخ المغرب", publisher: "المركز الثقافي العربي" },
      { author: "ابن خلدون", title: "كتاب العِبَر" },
    ],
    translations: [
      {
        locale: "ar",
        title: "الدولة الموحدية",
        slug: "الموحدون",
        summary: "الدولة الوحيدة في التاريخ التي وحّدت بلدان المغرب الكبير كلها والأندلس تحت راية واحدة (1121–1269)، انطلاقاً من دعوة ابن تومرت في جبال الأطلس.",
        body: "انطلقت الحركة الموحدية من دعوة محمد بن تومرت، الذي اتخذ من تينمل في الأطلس الكبير معقلاً حوالي سنة 1121م ونادى بإصلاح ديني صارم. وبعد وفاته قاد خليفته عبد المؤمن بن علي — وهو زناتي من ندرومة قرب تلمسان — الحركة إلى النصر، فدخل مراكش سنة 1147 وأسقط المرابطين.\n\nخلال عقود، حقق الموحدون ما لم يتحقق قبلهم ولا بعدهم: توحيد المغرب الكبير بأسره، من طرابلس إلى المحيط، مع الأندلس، في دولة واحدة. وازدهرت في ظلهم حياة فكرية استثنائية — ابن رشد وابن طفيل في بلاط الخلفاء — وعمارة خالدة: الكتبية بمراكش، والخيرالدا بإشبيلية، وصومعة حسان بالرباط.\n\nبعد الهزيمة أمام التحالف القشتالي في معركة العقاب (لاس نافاس) سنة 1212 بدأ التفكك، وورثت الدولةَ ثلاثُ ممالك: الحفصيون بتونس، والزيانيون بتلمسان، والمرينيون بفاس — وهي القسمة التي ما تزال ملامحها ماثلة في خريطة المنطقة الحديثة.",
        seo: "الموحدون: الدولة التي وحّدت المغرب الكبير كله والأندلس — ابن تومرت، عبد المؤمن، الكتبية وحسان والخيرالدا.",
        date: "2026-06-28",
      },
      {
        locale: "fr",
        title: "L'empire almohade",
        slug: "empire-almohade",
        summary: "Le seul État de l'histoire à avoir unifié tous les pays du Grand Maghreb et al-Andalus sous une même bannière (1121–1269), à partir de la prédication d'Ibn Toumert dans l'Atlas.",
        body: "Le mouvement almohade naquit de la prédication de Muhammad ibn Toumert, qui fit de Tinmel, dans le Haut Atlas, son bastion vers 1121, appelant à une réforme religieuse rigoureuse. À sa mort, son successeur Abd al-Mumin — un Zénète de Nedroma, près de Tlemcen — mena le mouvement à la victoire et entra à Marrakech en 1147, renversant les Almoravides.\n\nEn quelques décennies, les Almohades accomplirent ce que nul n'avait réalisé avant eux ni ne réalisera après : l'unification de tout le Grand Maghreb, de Tripoli à l'Atlantique, avec al-Andalus, en un seul État. Sous leur règne fleurit une vie intellectuelle exceptionnelle — Averroès et Ibn Tufayl à la cour des califes — et une architecture immortelle : la Koutoubia à Marrakech, la Giralda à Séville, la tour Hassan à Rabat.\n\nAprès la défaite de Las Navas de Tolosa (al-Uqab) en 1212, la dislocation commença. Trois royaumes héritèrent de l'empire : les Hafsides à Tunis, les Zianides à Tlemcen et les Mérinides à Fès — un partage dont les contours restent lisibles sur la carte moderne de la région.",
        seo: "L'empire almohade : le seul État à avoir unifié tout le Grand Maghreb et al-Andalus — Ibn Toumert, Koutoubia, Giralda, Hassan.",
        date: "2026-06-28",
      },
    ],
  });

  await createEntry(prisma, {
    type: "HISTORICAL_ENTRY",
    countries: ["MA", "DZ", "TN"],
    categoryIds: [perIslam],
    coverId: covers.islamic,
    historical: { periodCategoryId: perIslam, yearStart: 711, yearEnd: 1614 },
    sources: [
      { author: "المقّري التلمساني", title: "نفح الطيب من غصن الأندلس الرطيب" },
      { author: "Charles-André Julien", title: "Histoire de l'Afrique du Nord", publisher: "Payot", year: 1951 },
    ],
    translations: [
      {
        locale: "ar",
        title: "الأندلس والمغرب الكبير",
        slug: "الأندلس-والمغرب-الكبير",
        summary: "ثمانية قرون من التاريخ المشترك ربطت ضفتي مضيق جبل طارق: فتوحٌ وهجراتٌ وعلومٌ وفنون، ثم لجوء أندلسي غيّر وجه مدن المغرب الكبير.",
        body: "منذ عبور طارق بن زياد المضيق سنة 711م، ظلت الأندلس والمغرب الكبير فضاءً واحداً متصل الدماء والعلوم والأسواق. حكمت الدولُ المغاربية الأندلسَ في أوج قوتها — المرابطون ثم الموحدون — وظل طلبة العلم والتجار والصنّاع يعبرون في الاتجاهين كأنما يعبرون نهراً لا بحراً.\n\nشكّلت حواضر الضفتين شبكة واحدة: قرطبة وإشبيلية وغرناطة تحاور فاس وتلمسان وبجاية وتونس. ومن تلمسان خرج المقّري الذي كتب لاحقاً «نفح الطيب»، الموسوعة الأشهر في ذاكرة الأندلس، شاهداً على أن حفظ ذلك الإرث صار مهمة مغاربية.\n\nوبعد سقوط غرناطة سنة 1492 ثم مرسوم الطرد الكبير (1609–1614)، لجأ مئات الآلاف من الأندلسيين والموريسكيين إلى المغرب الكبير، فأحيوا مدناً بأكملها: تطوان والرباط وسلا وشفشاون غرباً، وشرشال والبليدة في الوسط، وتستور وسليمان وحاضرة تونس شرقاً. وما تزال بصمتهم حية في العمارة والموسيقى والمطبخ وأسماء العائلات إلى اليوم.",
        seo: "الأندلس والمغرب الكبير: ثمانية قرون من التاريخ المشترك، من طارق بن زياد إلى لجوء الموريسكيين.",
        date: "2026-06-27",
      },
      {
        locale: "fr",
        title: "Al-Andalus et le Grand Maghreb",
        slug: "al-andalus-et-le-grand-maghreb",
        summary: "Huit siècles d'histoire commune ont relié les deux rives du détroit de Gibraltar : conquêtes, migrations, sciences et arts, puis un exil andalou qui a changé le visage des villes maghrébines.",
        body: "Depuis la traversée du détroit par Tariq ibn Ziyad en 711, al-Andalus et le Grand Maghreb formèrent un seul espace, aux lignées, aux savoirs et aux marchés entremêlés. Les États maghrébins gouvernèrent al-Andalus à leur apogée — Almoravides puis Almohades — tandis qu'étudiants, marchands et artisans traversaient dans les deux sens, comme on franchit un fleuve plutôt qu'une mer.\n\nLes métropoles des deux rives formaient un même réseau : Cordoue, Séville et Grenade dialoguaient avec Fès, Tlemcen, Béjaïa et Tunis. C'est de Tlemcen qu'était issu al-Maqqari, auteur du « Nafh al-Tib », la plus célèbre encyclopédie de la mémoire andalouse — preuve que la garde de cet héritage était devenue une affaire maghrébine.\n\nAprès la chute de Grenade en 1492, puis le grand décret d'expulsion (1609–1614), des centaines de milliers d'Andalous et de Morisques se réfugièrent au Grand Maghreb et firent revivre des villes entières : Tétouan, Rabat, Salé et Chefchaouen à l'ouest, Cherchell et Blida au centre, Testour, Soliman et Tunis à l'est. Leur empreinte demeure vivante dans l'architecture, la musique, la cuisine et les noms de famille.",
        seo: "Al-Andalus et le Maghreb : huit siècles d'histoire partagée, de Tariq ibn Ziyad au refuge morisque.",
        date: "2026-06-27",
      },
    ],
  });

  await createEntry(prisma, {
    type: "HISTORICAL_ENTRY",
    countries: ["DZ", "TN", "LY", "MA"],
    categoryIds: [perOttoman],
    coverId: covers.islamic,
    historical: { periodCategoryId: perOttoman, yearStart: 1516, yearEnd: 1830 },
    sources: [
      { author: "Charles-André Julien", title: "Histoire de l'Afrique du Nord", publisher: "Payot", year: 1951 },
      { author: "عبد الجليل التميمي", title: "دراسات في التاريخ العثماني المغاربي", publisher: "مؤسسة التميمي للبحث العلمي" },
    ],
    translations: [
      {
        locale: "ar",
        title: "العهد العثماني في المغرب الكبير",
        slug: "العهد-العثماني-في-المغرب-الكبير",
        summary: "ثلاثة قرون أعادت رسم السياسة المغاربية: إيالات الجزائر وتونس وطرابلس تحت الراية العثمانية بحكم ذاتي متزايد، والمغرب الأقصى مستقلاً عنها تماماً.",
        body: "في سياق الصراع مع الإسبان الذين طاردوا مسلمي الأندلس إلى السواحل، انضوت حواضر المشرق المغاربي تحت الراية العثمانية: الجزائر مع الأخوين بربروس (منذ 1516)، وطرابلس سنة 1551، وتونس نهائياً سنة 1574. فصارت المنطقة ثلاث إيالات ضمن أوسع إمبراطوريات العصر.\n\nلكن الحكم تطور سريعاً نحو الاستقلال الذاتي: الدايات في الجزائر، والأسرة الحسينية في تونس (منذ 1705)، والقرمانليون في طرابلس (منذ 1711) — دولٌ فعلية تبرم المعاهدات وتخوض الحروب البحرية، ولا يربطها بإسطنبول غير الولاء الاسمي. أما المغرب الأقصى فبقي خارج السلطنة كلياً: صدّ السعديون الأطماع في معركة وادي المخازن (1578)، ثم رسّخ العلويون دولة مستقلة قائمة إلى اليوم.\n\nخلّف العهد العثماني حدوداً إدارية مهّدت لخرائط الدول الحديثة، وطبقةً من التأثيرات في المطبخ والموسيقى واللباس واللهجات (خاصة بالحواضر)، وتجربة سياسية معقدة ظلت تتأرجح بين التبعية الرمزية والسيادة الفعلية حتى مجيء الاستعمار الأوروبي.",
        seo: "العهد العثماني في المغرب الكبير: إيالات الجزائر وتونس وطرابلس، واستقلال المغرب الأقصى — ثلاثة قرون مفصلية.",
        date: "2026-06-26",
      },
    ],
  });

  await createEntry(prisma, {
    type: "HISTORICAL_ENTRY",
    countries: ["DZ", "TN", "MA", "LY", "MR"],
    categoryIds: [perColonial],
    coverId: covers.modern,
    historical: { periodCategoryId: perColonial, yearStart: 1830, yearEnd: 1934 },
    sources: [
      { author: "Charles-Robert Ageron", title: "Histoire de l'Algérie contemporaine", publisher: "PUF" },
      { author: "Charles-André Julien", title: "Histoire de l'Afrique du Nord", publisher: "Payot", year: 1951 },
      { author: "E. E. Evans-Pritchard", title: "The Sanusi of Cyrenaica", publisher: "Oxford", year: 1949 },
    ],
    translations: [
      {
        locale: "ar",
        title: "الاستعمار الأوروبي في المغرب الكبير",
        slug: "الاستعمار-الأوروبي-في-المغرب-الكبير",
        summary: "بين 1830 و1912 سقط المغرب الكبير كله تحت السيطرة الأوروبية: فرنسا في الجزائر وتونس والمغرب وموريتانيا، وإيطاليا في ليبيا، وإسبانيا في الشمال المغربي.",
        body: "بدأ المسلسل بنزول الجيش الفرنسي في سيدي فرج واحتلال الجزائر سنة 1830، الذي تحول إلى استعمار استيطاني اقتلاعي دام 132 سنة. ثم فُرضت الحماية على تونس بمعاهدة باردو (1881)، وعلى المغرب بمعاهدة فاس (1912) مع منطقة نفوذ إسبانية في الشمال والجنوب، بينما غزت إيطاليا ليبيا سنة 1911، وضُمت موريتانيا إلى إفريقيا الغربية الفرنسية.\n\nاختلفت الصيغ — استيطانٌ هنا وحمايةٌ هناك — وتشابهت الآثار: مصادرة الأراضي الخصبة، واقتصادٌ موجَّه نحو المتروبول، وتفكيك البنى التعليمية والاجتماعية القائمة. وواجهت الشعوب ذلك بمقاومات متعاقبة: الأمير عبد القادر ثم انتفاضة المقراني (1871) في الجزائر، وعمر المختار في برقة (أُعدم سنة 1931)، وعبد الكريم الخطابي في الريف، ومقاومات الجنوب المغربي والصحراء وموريتانيا.\n\nلكن الحقبة نفسها أفرزت — من حيث لا تريد — أدوات التحرر: نخباً حديثة التكوين، وصحافةً ونقاباتٍ وأحزاباً وطنية، ستقود معارك الاستقلال في منتصف القرن العشرين.",
        seo: "الاستعمار الأوروبي في المغرب الكبير 1830–1912: الجزائر وتونس والمغرب وليبيا وموريتانيا، والمقاومات الكبرى.",
        date: "2026-06-25",
      },
      {
        locale: "fr",
        title: "La colonisation européenne au Grand Maghreb",
        slug: "colonisation-europeenne-au-maghreb",
        summary: "Entre 1830 et 1912, tout le Grand Maghreb passa sous domination européenne : la France en Algérie, en Tunisie, au Maroc et en Mauritanie, l'Italie en Libye, l'Espagne dans le nord marocain.",
        body: "Le processus commença avec le débarquement français de Sidi Ferruch et la prise d'Alger en 1830, prélude à une colonisation de peuplement qui dura 132 ans. Vinrent ensuite le protectorat sur la Tunisie (traité du Bardo, 1881), puis sur le Maroc (traité de Fès, 1912) avec une zone espagnole au nord et au sud, tandis que l'Italie envahissait la Libye en 1911 et que la Mauritanie était intégrée à l'Afrique-Occidentale française.\n\nLes formules différaient — peuplement ici, protectorat là — mais les effets se ressemblaient : confiscation des meilleures terres, économie orientée vers la métropole, démantèlement des structures éducatives et sociales existantes. Les peuples y opposèrent des résistances successives : l'émir Abdelkader puis l'insurrection d'El Mokrani (1871) en Algérie, Omar al-Mukhtar en Cyrénaïque (exécuté en 1931), Abdelkrim dans le Rif, et les résistances du sud marocain, du Sahara et de Mauritanie.\n\nMais la même période engendra — malgré elle — les instruments de l'émancipation : des élites de formation moderne, une presse, des syndicats et des partis nationaux qui mèneraient les combats de l'indépendance au milieu du XXe siècle.",
        seo: "La colonisation du Grand Maghreb, 1830–1912 : cinq pays sous domination européenne et les grandes résistances.",
        date: "2026-06-25",
      },
    ],
  });

  await createEntry(prisma, {
    type: "HISTORICAL_ENTRY",
    featured: false,
    countries: ["LY", "MA", "TN", "MR", "DZ"],
    categoryIds: [perModern],
    coverId: covers.modern,
    historical: { periodCategoryId: perModern, yearStart: 1951, yearEnd: 1962 },
    sources: [
      { author: "Benjamin Stora", title: "Histoire de la guerre d'Algérie (1954-1962)", publisher: "La Découverte", year: 1993 },
      { author: "محمد المالكي", title: "الحركات الوطنية والاستعمار في المغرب العربي", publisher: "مركز دراسات الوحدة العربية" },
    ],
    translations: [
      {
        locale: "ar",
        title: "الاستقلالات المغاربية",
        slug: "الاستقلالات-المغاربية",
        summary: "عقدٌ واحد غيّر الخريطة: ليبيا 1951، تونس والمغرب 1956، موريتانيا 1960، ثم الجزائر 1962 بعد واحدة من أعنف حروب التحرير في القرن العشرين.",
        body: "كانت ليبيا أولى المستقلات: أعلنت مملكةً متحدة في 24 ديسمبر 1951 بقرار أممي، بعد نضال طويل توّج تضحيات المقاومة السنوسية. وفي مارس 1956 تحرر الجاران: تونس بقيادة الحركة الدستورية بعد سنوات من الكفاح النقابي والسياسي، والمغرب بعد ملحمة العرش والشعب — من وثيقة المطالبة بالاستقلال (1944) إلى نفي محمد الخامس (1953–1955) الذي فجّر المقاومة.\n\nونالت موريتانيا استقلالها في 28 نوفمبر 1960 بقيادة المختار ولد داداه. أما الجزائر فخاضت منذ أول نوفمبر 1954 حرب تحرير شاملة قادتها جبهة التحرير الوطني، ونظّمها مؤتمر الصومام (1956)، وكلفت مئات آلاف الشهداء، قبل أن تفضي اتفاقيات إيفيان إلى استقلال 5 جويلية 1962.\n\nلم تكن تلك المعارك جزراً معزولة: تضامن مغاربي فعلي رافقها — مؤتمر طنجة (1958)، قواعد خلفية متبادلة، سلاح ومال وملاذات — قبل أن تنصرف الدول الفتية إلى بناء كياناتها الوطنية وتتباعد مساراتها.",
        seo: "الاستقلالات المغاربية 1951–1962: ليبيا وتونس والمغرب وموريتانيا والجزائر — عقد التحرر الكبير.",
        date: "2026-06-24",
      },
      {
        locale: "fr",
        title: "Les indépendances maghrébines",
        slug: "independances-maghrebines",
        summary: "Une décennie a changé la carte : Libye 1951, Tunisie et Maroc 1956, Mauritanie 1960, puis l'Algérie en 1962, au terme de l'une des plus âpres guerres de libération du XXe siècle.",
        body: "La Libye ouvrit la voie : royaume uni proclamé le 24 décembre 1951 par décision des Nations unies, couronnant le long combat de la résistance senoussie. En mars 1956, les deux voisins se libérèrent : la Tunisie, portée par le mouvement destourien après des années de lutte syndicale et politique ; le Maroc, après l'épopée du trône et du peuple — du Manifeste de l'indépendance (1944) à l'exil de Mohammed V (1953–1955) qui embrasa la résistance.\n\nLa Mauritanie accéda à l'indépendance le 28 novembre 1960, sous la conduite de Mokhtar Ould Daddah. L'Algérie, elle, mena à partir du 1er novembre 1954 une guerre de libération totale, dirigée par le FLN et structurée par le congrès de la Soummam (1956), au prix de centaines de milliers de morts, jusqu'aux accords d'Évian et à l'indépendance du 5 juillet 1962.\n\nCes combats ne furent pas des îles : une solidarité maghrébine réelle les accompagna — conférence de Tanger (1958), bases arrière partagées, armes, fonds et refuges — avant que les jeunes États ne se consacrent à leur construction nationale et que leurs chemins ne s'écartent.",
        seo: "Les indépendances du Grand Maghreb, 1951–1962 : la décennie de la libération, pays par pays.",
        date: "2026-06-24",
      },
    ],
  });

  await createEntry(prisma, {
    type: "HISTORICAL_ENTRY",
    countries: ["DZ", "MA", "TN", "LY", "MR", "DSP"],
    categoryIds: [perModern],
    coverId: covers.modern,
    historical: { periodCategoryId: perModern, yearStart: 1900, yearEnd: 2000 },
    sources: [
      { author: "Abdelmalek Sayad", title: "La double absence : des illusions de l'émigré aux souffrances de l'immigré", publisher: "Seuil", year: 1999 },
      { author: "Benjamin Stora", title: "Ils venaient d'Algérie : l'immigration algérienne en France (1912-1992)", publisher: "Fayard", year: 1992 },
    ],
    translations: [
      {
        locale: "ar",
        title: "الهجرة المغاربية إلى أوروبا",
        slug: "الهجرة-المغاربية-إلى-أوروبا",
        summary: "من عمال المناجم الأوائل إلى جاليات تعدّ بالملايين: قرنٌ من الهجرة صنع «مغرباً كبيراً» آخر على الضفة الشمالية للمتوسط.",
        body: "بدأت الهجرة مبكراً: عمال من القبائل في مصانع فرنسا قبل الحرب العالمية الأولى، ثم عشرات آلاف المجندين والعمال خلال الحربين. وبعد الاستقلالات، نظّمت اتفاقياتُ اليد العاملة في الخمسينات والستينات تدفقاً واسعاً نحو فرنسا ثم بلجيكا وهولندا وألمانيا، لسدّ حاجة أوروبا المعاد إعمارها إلى السواعد.\n\nوحين أوقفت فرنسا هجرة العمل سنة 1974، قلب التجمعُ العائلي المعادلة: تحولت هجرة الرجال المؤقتة إلى استقرار عائلي دائم، ووُلد جيلٌ ثانٍ فثالث يحمل ازدواج الانتماء. واليوم تشكل الجاليات المغاربية قوةً اقتصادية (تحويلات بمليارات الدولارات سنوياً) وثقافيةً وازنة: أدب وسينما وموسيقى وأسماء بارزة في كل الميادين.\n\nوصف عالم الاجتماع عبد المالك صياد محنة المهاجر بـ«الغياب المزدوج»: غائبٌ عن وطنه وغائبٌ في بلد إقامته. غير أن أحفاد أولئك الغائبين صاروا حاضرين بقوة — وجسراً لا غنى عنه لأي مشروع مغاربي مشترك.",
        seo: "قرن من الهجرة المغاربية إلى أوروبا: من عمال المناجم إلى جاليات الملايين — تاريخ وذاكرة وجسور.",
        date: "2026-06-23",
      },
    ],
  });

  console.log("Fiches histoire créées : 8 entrées (dont 6 traduites en français).");
}
