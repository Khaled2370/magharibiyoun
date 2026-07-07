import type { PrismaClient } from "@prisma/client";
import { createEntry, hasArSlug } from "./demo-helpers";
import { getCovers } from "./demo-covers";

export async function seedPersonalities(prisma: PrismaClient) {
  if (await hasArSlug(prisma, "أوغسطينوس")) {
    console.log("Fiches personnalités déjà présentes — lot ignoré.");
    return;
  }
  const covers = await getCovers(prisma);

  await createEntry(prisma, {
    type: "PERSONALITY",
    countries: ["DZ"],
    coverId: covers.portrait,
    personality: {
      birthYear: 354,
      deathYear: 430,
      works: [
        { title: "الاعترافات (Confessions)" },
        { title: "مدينة الله (De civitate Dei)" },
      ],
      quotes: [
        { text: "خلقتَنا متجهين إليك، وقلوبنا قلقة حتى تسكن إليك.", source: "الاعترافات" },
      ],
    },
    sources: [
      { author: "أوغسطينوس", title: "الاعترافات (Confessions)" },
      { author: "Peter Brown", title: "Augustine of Hippo: A Biography", publisher: "University of California Press", year: 1967 },
      { author: "Serge Lancel", title: "Saint Augustin", publisher: "Fayard", year: 1999 },
    ],
    translations: [
      {
        locale: "ar",
        title: "أوغسطينوس",
        slug: "أوغسطينوس",
        summary: "فيلسوف ولاهوتي وُلد بتاغاست (سوق أهراس بالجزائر) سنة 354م، من أعمق المفكرين أثراً في الفكر الغربي كله — وهو ابن هذه الأرض المغاربية.",
        body: "وُلد أوريليوس أوغسطينوس سنة 354م بتاغاست (سوق أهراس اليوم) لأسرة من الأهالي المترومنين؛ أمه مونيكا صارت هي الأخرى علماً من أعلام التقوى. درس بمداوروش ثم بقرطاج، وصار أستاذاً للبلاغة في قرطاج فروما فميلانو، حيث اعتنق المسيحية سنة 386 بعد رحلة قلق فكري رواها بنفسه.\n\nعاد إلى إفريقية وصار أسقفاً لهيبّون (عنابة) من سنة 396 حتى وفاته. في «الاعترافات» كتب أول سيرة ذاتية داخلية في الأدب العالمي، وفي «مدينة الله» — التي ألّفها رداً على صدمة سقوط روما سنة 410 — وضع أسس فلسفة التاريخ المسيحية. آلاف الصفحات من عظاته ورسائله كُتبت كلها من مدينته الساحلية المغاربية.\n\nتوفي سنة 430 وهيبّون محاصرة من الوندال. يُعد اليوم أحد أعظم مفكري العصور القديمة المتأخرة قاطبة، ويحتفي به المؤرخون بوصفه أشهر ابنٍ لهذه الأرض في العالم القديم — شاهداً على عمق الجذور الفكرية للمغرب الكبير قبل الإسلام.",
        seo: "أوغسطينوس ابن سوق أهراس: أسقف عنابة وصاحب الاعترافات ومدينة الله — أعظم مفكري العصور القديمة المتأخرة.",
        date: "2026-06-30",
      },
      {
        locale: "fr",
        title: "Augustin d'Hippone",
        slug: "augustin-d-hippone",
        summary: "Philosophe et théologien né à Thagaste (Souk Ahras, Algérie) en 354, l'un des penseurs les plus influents de toute la pensée occidentale — et un fils de cette terre maghrébine.",
        body: "Aurelius Augustinus naquit en 354 à Thagaste (l'actuelle Souk Ahras), dans une famille d'autochtones romanisés ; sa mère Monique devint elle-même une figure de piété. Il étudia à Madaure puis à Carthage, enseigna la rhétorique à Carthage, Rome et Milan, où il se convertit au christianisme en 386 au terme d'une crise intérieure qu'il raconta lui-même.\n\nRevenu en Afrique, il fut évêque d'Hippone (Annaba) de 396 à sa mort. Dans les « Confessions », il écrivit la première autobiographie intérieure de la littérature universelle ; dans « La Cité de Dieu », composée en réponse au choc du sac de Rome en 410, il fonda la philosophie chrétienne de l'histoire. Des milliers de pages de sermons et de lettres furent écrites depuis sa ville côtière maghrébine.\n\nIl mourut en 430, pendant le siège d'Hippone par les Vandales. Considéré comme l'un des plus grands penseurs de l'Antiquité tardive, il demeure le plus illustre fils de cette terre dans le monde ancien — témoin de la profondeur des racines intellectuelles du Grand Maghreb avant l'islam.",
        seo: "Augustin, fils de Souk Ahras : évêque d'Hippone, auteur des Confessions et de La Cité de Dieu.",
        date: "2026-06-30",
      },
    ],
  });

  await createEntry(prisma, {
    type: "PERSONALITY",
    countries: ["MA"],
    coverId: covers.portrait,
    personality: {
      birthYear: 1304,
      deathYear: 1369,
      works: [{ title: "تحفة النظار في غرائب الأمصار وعجائب الأسفار (الرحلة)", year: 1355 }],
    },
    sources: [
      { author: "ابن بطوطة", title: "تحفة النظار في غرائب الأمصار وعجائب الأسفار" },
      { author: "Ross E. Dunn", title: "The Adventures of Ibn Battuta", publisher: "University of California Press", year: 1986 },
    ],
    translations: [
      {
        locale: "ar",
        title: "ابن بطوطة",
        slug: "ابن-بطوطة",
        summary: "رحالة طنجة الذي جاب العالم القديم من المغرب إلى الصين في نحو ثلاثين سنة، وترك في «الرحلة» أعظم وثيقة سفر في العصور الوسطى.",
        body: "وُلد محمد بن عبد الله بن بطوطة بطنجة سنة 1304م. خرج للحج سنة 1325 وعمره إحدى وعشرون سنة، فإذا بالرحلة تمتد قرابة ثلاثين عاماً: مصر والشام والحجاز والعراق وفارس واليمن وسواحل شرق إفريقيا والأناضول وبلاد القبيلة الذهبية، ثم الهند حيث خدم قاضياً في بلاط دلهي سنوات، فجزر المالديف وسريلانكا وبلاد الملايو والصين.\n\nوبعد عودته، ختم مغامراته برحلتين: إلى الأندلس، ثم عبر الصحراء إلى مالي وبلاد السودان الغربي (1352–1353) حيث وصف إمبراطورية مالي وصفاً لا يقدَّر بثمن. وبأمر السلطان المريني أبي عنان، أملى أخباره على الكاتب ابن جزي بفاس سنة 1355، فكانت «تحفة النظار» المعروفة بالرحلة.\n\nقطع ابن بطوطة مسافات تفوق أضعاف ما قطعه ماركو بولو، ويُعد أعظم رحالة ما قبل العصر الحديث. ورحلته اليوم مصدر أول عن مجتمعات القرن الرابع عشر من طنجة إلى بكين — كتبها مغربيٌ نظر إلى العالم كله فرآه داراً واحدة.",
        seo: "ابن بطوطة رحالة طنجة: ثلاثون سنة من المغرب إلى الصين ومالي، وتحفة النظار أعظم كتب الرحلة.",
        date: "2026-06-29",
      },
      {
        locale: "fr",
        title: "Ibn Battuta",
        slug: "ibn-battuta",
        summary: "Le voyageur de Tanger qui parcourut le monde ancien du Maghreb à la Chine en près de trente ans, laissant dans sa « Rihla » le plus grand document de voyage du Moyen Âge.",
        body: "Muhammad ibn Battuta naquit à Tanger en 1304. Parti pour le pèlerinage en 1325, à vingt et un ans, il vit son voyage s'étendre sur près de trente années : Égypte, Syrie, Hedjaz, Irak, Perse, Yémen, côtes d'Afrique orientale, Anatolie, pays de la Horde d'or, puis l'Inde — où il servit des années comme cadi à la cour de Delhi —, les Maldives, Ceylan, la Malaisie et la Chine.\n\nDe retour, il couronna ses aventures par deux ultimes périples : al-Andalus, puis la traversée du Sahara vers le Mali et le Soudan occidental (1352–1353), dont il laissa une description inestimable de l'empire du Mali. Sur ordre du sultan mérinide Abu Inan, il dicta ses souvenirs au lettré Ibn Juzayy à Fès en 1355 : ce fut la « Tuhfat al-Nuzzar », connue comme la Rihla.\n\nIbn Battuta parcourut des distances plusieurs fois supérieures à celles de Marco Polo et demeure le plus grand voyageur de l'ère prémoderne. Sa Rihla est une source de premier ordre sur les sociétés du XIVe siècle, de Tanger à Pékin — écrite par un Maghrébin qui regarda le monde entier comme une seule demeure.",
        seo: "Ibn Battuta, le voyageur de Tanger : trente ans de voyages du Maghreb à la Chine, la Rihla.",
        date: "2026-06-29",
      },
    ],
  });

  await createEntry(prisma, {
    type: "PERSONALITY",
    countries: ["MA"],
    coverId: covers.portrait,
    personality: {
      birthYear: 1126,
      deathYear: 1198,
      works: [
        { title: "فصل المقال فيما بين الحكمة والشريعة من الاتصال" },
        { title: "تهافت التهافت" },
        { title: "الكليات في الطب" },
        { title: "بداية المجتهد ونهاية المقتصد" },
      ],
    },
    sources: [
      { author: "محمد عابد الجابري", title: "ابن رشد: سيرة وفكر", publisher: "مركز دراسات الوحدة العربية", year: 1998 },
      { author: "Ernest Renan", title: "Averroès et l'averroïsme", year: 1852 },
    ],
    translations: [
      {
        locale: "ar",
        title: "ابن رشد",
        slug: "ابن-رشد",
        summary: "فيلسوف قرطبة وقاضيها وطبيبها، «الشارح الأكبر» لأرسطو الذي أنار عقل أوروبا — عاش في كنف الدولة الموحدية وتوفي بمراكش سنة 1198م.",
        body: "وُلد أبو الوليد محمد بن رشد بقرطبة سنة 1126م لأسرة قضاة عريقة، وجمع علوم عصره: الفقه والطب والفلسفة والفلك. قدّمه ابن طفيل إلى الخليفة الموحدي أبي يعقوب يوسف، فكلّفه بتلخيص أرسطو وشرحه — وهي المهمة التي غيّرت تاريخ الفكر.\n\nلُقّب في أوروبا اللاتينية بـ«الشارح» بإطلاق: شروحه نقلت أرسطو إلى الجامعات الناشئة وأشعلت تياراً كاملاً عُرف بالرشدية اللاتينية. وفي «فصل المقال» أقام البرهان على ألا تعارض بين الحكمة والشريعة، وفي «تهافت التهافت» ردّ على نقد الغزالي للفلاسفة دفاعاً عن حق العقل.\n\nامتُحن في أواخر حياته: أُبعد إلى أليسانة سنة 1197 وأُحرقت بعض كتبه، ثم رُدّ إليه الاعتبار سريعاً. توفي بمراكش في ديسمبر 1198 ودُفن بها قبل أن يُنقل رفاته إلى قرطبة. واليوم يستدعيه الفكر العربي والمغاربي رمزاً أعلى للعقلانية والاجتهاد.",
        seo: "ابن رشد الشارح الأكبر: فيلسوف قرطبة وقاضيها، بين بلاط الموحدين وفصل المقال وتهافت التهافت.",
        date: "2026-06-28",
      },
    ],
  });

  await createEntry(prisma, {
    type: "PERSONALITY",
    featured: false,
    countries: ["DZ"],
    coverId: covers.portrait,
    personality: {
      birthYear: 1808,
      deathYear: 1883,
      works: [
        { title: "المواقف في التصوف والوعظ والإرشاد" },
        { title: "ذكرى العاقل وتنبيه الغافل" },
      ],
    },
    sources: [
      { author: "محمد بن الأمير عبد القادر", title: "تحفة الزائر في تاريخ الجزائر والأمير عبد القادر" },
      { author: "Bruno Étienne", title: "Abdelkader", publisher: "Hachette", year: 1994 },
    ],
    translations: [
      {
        locale: "ar",
        title: "الأمير عبد القادر الجزائري",
        slug: "الأمير-عبد-القادر",
        summary: "قائد المقاومة الجزائرية وباني الدولة الحديثة الأولى في وجه الاحتلال، ثم المتصوف الإنساني الذي حمى مسيحيي دمشق — واحدٌ من أنبل وجوه القرن التاسع عشر.",
        body: "وُلد عبد القادر بن محيي الدين قرب معسكر سنة 1808 في أسرة علم وتصوف. بويع أميراً للجهاد سنة 1832 وعمره أربع وعشرون سنة، فقاد مقاومة الاحتلال الفرنسي خمسة عشر عاماً، وبنى في أثنائها دولة حديثة كاملة: عاصمة متنقلة («الزمالة»)، وإدارة ومصانع أسلحة وقضاء موحد — وأبرم معاهدة التافنة (1837) ثم استأنف الحرب حين نُقضت.\n\nبعد سقوط الزمالة (1843) وتضييق الخناق، أوقف القتال سنة 1847 مقابل وعد بالرحيل إلى المشرق، فغُدر به وسُجن في فرنسا خمس سنوات، قبل أن يُطلق سنة 1852. استقر أخيراً بدمشق متفرغاً للعلم والتصوف، شارحاً لابن عربي، وكتب «المواقف».\n\nوفي يوليو 1860، خلال فتنة دمشق، فتح داره وجنّد رجاله فحمى آلاف المسيحيين من المذبحة، فانهالت عليه أوسمة الدول واحترام العالم. توفي سنة 1883 بدمشق، ونُقل رفاته إلى الجزائر سنة 1966. يبقى الأمير نموذجاً نادراً اجتمع فيه المقاوم وباني الدولة والعارف الإنساني.",
        seo: "الأمير عبد القادر: قائد المقاومة وباني الدولة الجزائرية الأولى، وحامي مسيحيي دمشق 1860.",
        date: "2026-06-27",
      },
      {
        locale: "fr",
        title: "L'émir Abdelkader",
        slug: "emir-abdelkader",
        summary: "Chef de la résistance algérienne et bâtisseur du premier État moderne face à l'occupation, puis soufi humaniste qui protégea les chrétiens de Damas — l'une des plus nobles figures du XIXe siècle.",
        body: "Abdelkader ibn Muhieddine naquit près de Mascara en 1808, dans une famille de science et de soufisme. Proclamé émir du jihad en 1832, à vingt-quatre ans, il mena quinze années de résistance à l'occupation française tout en bâtissant un État moderne complet : capitale itinérante (la smala), administration, manufactures d'armes, justice unifiée — signant le traité de la Tafna (1837) avant de reprendre la guerre lorsqu'il fut violé.\n\nAprès la prise de la smala (1843) et l'étau resserré, il déposa les armes en 1847 contre la promesse d'un départ vers l'Orient. Trahi, il fut emprisonné cinq ans en France avant d'être libéré en 1852. Il s'établit finalement à Damas, voué à l'étude et au soufisme, commentateur d'Ibn Arabi et auteur du « Kitab al-Mawaqif ».\n\nEn juillet 1860, lors des massacres de Damas, il ouvrit sa demeure et mobilisa ses hommes, sauvant des milliers de chrétiens — ce qui lui valut les honneurs du monde entier. Mort à Damas en 1883, il repose à Alger depuis 1966. L'émir demeure ce modèle rare où se rejoignent le résistant, le bâtisseur d'État et le sage humaniste.",
        seo: "L'émir Abdelkader : résistant, bâtisseur d'État et soufi humaniste, protecteur des chrétiens de Damas.",
        date: "2026-06-27",
      },
    ],
  });

  await createEntry(prisma, {
    type: "PERSONALITY",
    countries: ["MA"],
    coverId: covers.portrait,
    personality: { birthYear: 1882, deathYear: 1963 },
    sources: [
      { author: "C. R. Pennell", title: "A Country with a Government and a Flag: The Rif War in Morocco", publisher: "Menas Press", year: 1986 },
      { author: "Germain Ayache", title: "Les origines de la guerre du Rif", publisher: "SMER — Publications de la Sorbonne", year: 1981 },
    ],
    translations: [
      {
        locale: "ar",
        title: "محمد بن عبد الكريم الخطابي",
        slug: "عبد-الكريم-الخطابي",
        summary: "قائد حرب الريف وصانع انتصار أنوال (1921) ومؤسس جمهورية الريف — من أكثر رموز التحرر إلهاماً في القرن العشرين، وأحد آباء الفكرة المغاربية.",
        body: "وُلد محمد بن عبد الكريم الخطابي بأجدير في الريف حوالي 1882، وتلقى تعليماً مزدوجاً بين القرويين والمدارس الإسبانية، وعمل قاضياً وصحافياً بمليلية. لما توسع الاحتلال الإسباني قاد قبائلَ الريف، وفي يوليو 1921 سحق الجيش الإسباني في أنوال — واحدة من أفدح هزائم جيوش الاستعمار في التاريخ.\n\nأسس «جمهورية الريف» (1921–1926) بمؤسسات حديثة: حكومة وإدارة وقضاء موحد، فصارت تجربته مرجعاً لحركات التحرر. لم يُهزم إلا أمام تحالف فرنسي-إسباني ضخم قوامه مئات الآلاف بقيادة بيتان، استُخدمت فيه الغازات السامة كما وثّق المؤرخون. استسلم سنة 1926 ونُفي إلى جزيرة لارينيون عشرين سنة.\n\nوفي 1947، أثناء نقله، غادر الباخرة بمصر ولجأ إلى القاهرة، حيث ترأس «لجنة تحرير المغرب العربي» التي جمعت قادة الحركات الوطنية للبلدان الثلاثة — فكان بذلك من آباء العمل المغاربي المشترك. رفض العودة قبل جلاء آخر جندي أجنبي عن المغرب الكبير، وتوفي بالقاهرة سنة 1963، وقد ألهمت تجربته حركات التحرر في العالم كله.",
        seo: "عبد الكريم الخطابي: أنوال 1921، جمهورية الريف، ولجنة تحرير المغرب العربي — أيقونة التحرر المغاربي.",
        date: "2026-06-26",
      },
    ],
  });

  await createEntry(prisma, {
    type: "PERSONALITY",
    countries: ["TN"],
    coverId: covers.portrait,
    personality: {
      birthYear: 1899,
      deathYear: 1935,
      works: [
        { title: "امرأتنا في الشريعة والمجتمع", year: 1930 },
        { title: "العمال التونسيون وظهور الحركة النقابية", year: 1927 },
      ],
    },
    sources: [
      { author: "الطاهر الحداد", title: "امرأتنا في الشريعة والمجتمع", year: 1930 },
      { author: "أحمد خالد", title: "الطاهر الحداد والبيئة التونسية في الثلث الأول من القرن العشرين", publisher: "الدار التونسية للنشر" },
    ],
    translations: [
      {
        locale: "ar",
        title: "الطاهر الحداد",
        slug: "الطاهر-الحداد",
        summary: "مصلح تونسي رائد (1899–1935) دفع حياته ثمناً لدفاعه المبكر عن حقوق النساء والعمال، قبل أن تنتصر أفكاره بعد وفاته بعقدين.",
        body: "وُلد الطاهر الحداد بتونس العاصمة سنة 1899 لأسرة متواضعة تنحدر من الجنوب، ودرس بجامع الزيتونة. انخرط مبكراً في العمل الوطني ثم النقابي: كان من مؤسسي «جامعة عموم العملة التونسية» مع محمد علي الحامي سنة 1924 — أول تجربة نقابية وطنية مستقلة — وأرّخ لها في كتابه عن العمال التونسيين.\n\nوفي 1930 أصدر كتابه الأشهر «امرأتنا في الشريعة والمجتمع»، داعياً إلى تعليم البنات وإنصاف النساء ومراجعة الاجتهادات من داخل المرجعية الإسلامية نفسها. فقامت عليه حملة تكفير عاصفة: صودر اعتباره العلمي، وهُوجم في المجالس والصحف، وعاش أعوامه الأخيرة معزولاً مريضاً، حتى توفي سنة 1935 وعمره ست وثلاثون سنة.\n\nوبعد عقدين، انتصر الحداد من قبره: صدرت مجلة الأحوال الشخصية (1956) — من أكثر قوانين الأسرة تقدماً في المنطقة — محمولةً على أفكاره، وصار الرجل المنبوذ أباً روحياً للإصلاح الاجتماعي التونسي، وتُدرَّس سيرته اليوم عبرةً في ثمن السبق.",
        seo: "الطاهر الحداد: رائد الدفاع عن المرأة والعمال في تونس — من التكفير إلى الانتصار بعد الوفاة.",
        date: "2026-06-25",
      },
    ],
  });

  await createEntry(prisma, {
    type: "PERSONALITY",
    countries: ["MA", "DSP"],
    coverId: covers.portrait,
    personality: {
      birthYear: 1940,
      deathYear: 2015,
      works: [
        { title: "ما وراء الحجاب (Beyond the Veil)", year: 1975 },
        { title: "الحريم السياسي (Le harem politique)", year: 1987 },
        { title: "أحلام النساء الحريم (Dreams of Trespass)", year: 1994 },
        { title: "سلطانات منسيات (Sultanes oubliées)", year: 1990 },
      ],
    },
    sources: [
      { author: "Fatema Mernissi", title: "Beyond the Veil: Male-Female Dynamics in Muslim Society", year: 1975 },
      { author: "Fatema Mernissi", title: "Dreams of Trespass: Tales of a Harem Girlhood", year: 1994 },
      { title: "Premio Príncipe de Asturias de las Letras 2003", publisher: "Fundación Princesa de Asturias", year: 2003, url: "https://www.fpa.es/en/princess-of-asturias-awards/laureates/2003-fatima-mernissi-and-susan-sontag.html" },
    ],
    translations: [
      {
        locale: "ar",
        title: "فاطمة المرنيسي",
        slug: "فاطمة-المرنيسي",
        summary: "عالمة اجتماع مغربية (1940–2015) من أبرز الأصوات النسوية في العالم الإسلامي، جمعت بين الصرامة الأكاديمية وفن الحكاية، ونالت أرفع الجوائز الدولية.",
        body: "وُلدت فاطمة المرنيسي بفاس سنة 1940 وترعرعت — كما روت هي نفسها بسحر — في بيت عائلي تقليدي كبير. درست بالرباط ثم بالسوربون، ونالت الدكتوراه من جامعة برانديز الأمريكية، قبل أن تعود أستاذةً لعلم الاجتماع بجامعة محمد الخامس بالرباط.\n\nوضعها كتابها الأول «ما وراء الحجاب» (1975) في صدارة الفكر النسوي العالمي، ثم واصلت الحفر: في التراث والحديث («الحريم السياسي»)، وفي التاريخ المنسي للحاكمات المسلمات («سلطانات منسيات»)، وفي الذاكرة والحكي («أحلام النساء الحريم» الذي تُرجم لعشرات اللغات). ولم تكتف بالكتب: أطلقت ورشات كتابة وقوافل مدنية تصل الجامعة بالنساء القرويات والجمعيات.\n\nسنة 2003 نالت جائزة أمير أستورياس للآداب (مناصفة مع سوزان سونتاغ)، وسنة 2004 جائزة إيراسموس. توفيت بالرباط في نوفمبر 2015، وبقيت مدرسةً قائمة الذات: فكرٌ نقدي جذري بلسانٍ حكّاء ومحبة معلنة للناس.",
        seo: "فاطمة المرنيسي: عالمة الاجتماع المغربية ورائدة الفكر النسوي الإسلامي — من فاس إلى جائزتي أستورياس وإيراسموس.",
        date: "2026-06-24",
      },
      {
        locale: "fr",
        title: "Fatima Mernissi",
        slug: "fatima-mernissi",
        summary: "Sociologue marocaine (1940–2015), l'une des grandes voix féministes du monde musulman, alliant rigueur académique et art du récit, couronnée par les plus hautes distinctions internationales.",
        body: "Fatima Mernissi naquit à Fès en 1940 et grandit — comme elle le raconta elle-même avec magie — dans une grande demeure familiale traditionnelle. Elle étudia à Rabat puis à la Sorbonne, obtint son doctorat à l'université Brandeis aux États-Unis, avant de revenir enseigner la sociologie à l'université Mohammed V de Rabat.\n\nSon premier livre, « Beyond the Veil » (1975), la plaça d'emblée au premier rang de la pensée féministe mondiale. Elle poursuivit ensuite son travail de fouille : dans la tradition et le hadith (« Le harem politique »), dans l'histoire oubliée des souveraines musulmanes (« Sultanes oubliées »), dans la mémoire et le récit (« Rêves de femmes », traduit en des dizaines de langues). Et au-delà des livres : des ateliers d'écriture et des caravanes civiques reliant l'université aux femmes rurales et aux associations.\n\nEn 2003, elle reçut le prix Prince des Asturies des lettres (partagé avec Susan Sontag), puis le prix Érasme en 2004. Morte à Rabat en novembre 2015, elle demeure une école à elle seule : une pensée critique radicale portée par une voix de conteuse et un amour déclaré des gens.",
        seo: "Fatima Mernissi : sociologue de Fès, pionnière du féminisme musulman, prix Asturies et Érasme.",
        date: "2026-06-24",
      },
    ],
  });

  await createEntry(prisma, {
    type: "PERSONALITY",
    countries: ["DZ", "DSP"],
    coverId: covers.portrait,
    personality: { birthYear: 1923, deathYear: 2006 },
    sources: [
      { author: "Bouziane Daoudi et Hadj Miliani", title: "L'aventure du raï : musique et société", publisher: "Seuil", year: 1996 },
      { title: "Le raï, chant populaire d'Algérie — Liste représentative du PCI", publisher: "UNESCO", year: 2022, url: "https://ich.unesco.org/fr/RL/le-rai-chant-populaire-dalgerie-01983" },
    ],
    translations: [
      {
        locale: "ar",
        title: "الشيخة ريميتي",
        slug: "الشيخة-ريميتي",
        summary: "«أم الراي» (1923–2006): ستون سنة من الغناء البدوي الوهراني الصريح، من وعدات الغرب الجزائري إلى مسارح العالم — دون أن تغيّر حرفاً من صوتها.",
        body: "وُلدت سعدية بديف بتسالة قرب سيدي بلعباس سنة 1923، يتيمةً فقيرة، فشقّت طريقها مغنيةً في الأسواق والأعراس والوعدات مع شيخات الغرب الجزائري، على إيقاع القصبة والقلال.\n\nسنة 1954 سجّلت «شرّاك قطّاع» فأحدثت زلزالاً: صوت امرأة يقول عالياً ما يُهمس به — فلُقّبت «أم الراي» واتخذت اسم «ريميتي». وعبر ستين سنة من الغناء، حافظت على الراي البدوي الأصيل رافضةً تلطيفه أو تحديثه، فيما كان أبناؤها الفنيون من «الشباب» يكتسحون العالم بالراي العصري.\n\nاكتشفتها المسارح العالمية متأخراً: جولات ومهرجانات من التسعينات، وألبوم «سيدي منصور» (1994) بمشاركة موسيقيين عالميين. وتوفيت في ماي 2006 أياماً قليلة بعد حفل كبير بقاعة الزينيت في باريس — واقفةً حتى النهاية. حين أدرجت اليونسكو الراي تراثاً إنسانياً سنة 2022، كان اسمها في قلب الملف.",
        seo: "الشيخة ريميتي أم الراي: من وعدات الغرب الجزائري إلى مسارح العالم — ستون سنة من الغناء الصريح.",
        date: "2026-06-23",
      },
    ],
  });

  console.log("Fiches personnalités créées : 8 entrées (dont 4 traduites en français).");
}
