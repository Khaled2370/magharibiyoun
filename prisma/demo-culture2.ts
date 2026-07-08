import type { PrismaClient } from "@prisma/client";
import { createEntry, findOrCreateCategory, hasArSlug } from "./demo-helpers";
import { attachCoverBySlug, getCovers } from "./demo-covers";

export async function seedCulture2(prisma: PrismaClient) {
  if (await hasArSlug(prisma, "نقوش-طاسيلي-ناجر")) {
    console.log("Deuxième lot culture déjà présent — lot ignoré.");
    return;
  }
  const covers = await getCovers(prisma);

  const domArchi = await findOrCreateCategory(prisma, "CULTURAL_DOMAIN", {
    ar: "العمارة والتراث",
    fr: "Architecture et patrimoine",
    en: "Architecture and heritage",
  }, 4);
  const domLetters = await findOrCreateCategory(prisma, "CULTURAL_DOMAIN", {
    ar: "اللغات والخط",
    fr: "Langues et calligraphie",
    en: "Languages and calligraphy",
  }, 6);
  const domTraditions = await findOrCreateCategory(prisma, "CULTURAL_DOMAIN", {
    ar: "التقاليد والفنون الشعبية",
    fr: "Traditions et arts populaires",
    en: "Traditions and folk arts",
  }, 7);

  const tassili = await createEntry(prisma, {
    type: "CULTURAL",
    countries: ["DZ"],
    categoryIds: [domArchi],
    coverId: covers.heritage,
    cultural: {},
    sources: [
      { title: "Tassili n'Ajjer — World Heritage List", publisher: "UNESCO", year: 1982, url: "https://whc.unesco.org/en/list/179" },
      { author: "Henri Lhote", title: "À la découverte des fresques du Tassili", publisher: "Arthaud", year: 1958 },
    ],
    translations: [
      {
        locale: "ar",
        title: "نقوش طاسيلي ناجر",
        slug: "نقوش-طاسيلي-ناجر",
        summary: "هضبة صحراوية بجنوب شرق الجزائر تضم آلاف الرسوم والنقوش الصخرية التي تمتد عبر آلاف السنين، وتوثّق تحوّل الصحراء من سافانا خصبة إلى صحراء قاحلة.",
        body: "يمتد هضبة طاسيلي ناجر على مساحة شاسعة بجنوب شرق الجزائر، وتحتضن واحدة من أكبر مجموعات الفن الصخري ما قبل التاريخي في العالم: آلاف اللوحات والنقوش المحفورة على الصخر، يعود أقدمها إلى نحو اثني عشر ألف سنة قبل الميلاد.\n\nتتعاقب هذه النقوش عبر مراحل مناخية وثقافية متمايزة يمكن تتبعها بوضوح: مرحلة الحيوانات البرية الكبيرة (فيلة، زرافات، فرس النهر) التي تشهد على صحراء خضراء آهلة بالحياة، فمرحلة الرعاة وقطعان الماشية، ثم مرحلة الخيل، وأخيراً مرحلة الجمل التي تزامنت مع اكتمال التصحّر. تشكل هذه السلسلة أرشيفاً بصرياً فريداً لتحوّل الصحراء الكبرى من سافانا خصبة إلى بيئتها القاحلة الحالية.\n\nقادت بعثات المستكشف الفرنسي هنري لوت بدءاً من 1956 أول توثيق واسع لهذه النقوش، وإن راجع باحثون لاحقون بعض تأويلاته. أدرجت اليونسكو طاسيلي ناجر ضمن التراث العالمي سنة 1982 بصفة مزدوجة (طبيعية وثقافية معاً)، وهي من أندر المواقع التي تحظى بهذا التصنيف المزدوج.",
        seo: "نقوش طاسيلي ناجر: أرشيف صخري صحراوي يوثّق آلاف السنين من تحوّل الصحراء الكبرى — تراث عالمي مزدوج لدى اليونسكو.",
        date: "2026-07-09",
      },
      {
        locale: "fr",
        title: "Les gravures du Tassili n'Ajjer",
        slug: "gravures-du-tassili-n-ajjer",
        summary: "Vaste plateau désertique du sud-est algérien abritant des milliers de peintures et gravures rupestres s'étendant sur des millénaires, documentant la transformation du Sahara d'une savane fertile en désert aride.",
        body: "Le plateau du Tassili n'Ajjer s'étend sur une vaste superficie au sud-est de l'Algérie et abrite l'une des plus grandes concentrations d'art rupestre préhistorique au monde : des milliers de peintures et gravures sur roche, dont les plus anciennes remontent à environ douze mille ans avant notre ère.\n\nCes œuvres se succèdent selon des phases climatiques et culturelles distinctes clairement identifiables : la période de la grande faune sauvage (éléphants, girafes, hippopotames), témoignant d'un Sahara verdoyant et peuplé ; puis la période des pasteurs et de leurs troupeaux ; puis celle du cheval ; et enfin celle du chameau, coïncidant avec l'achèvement de la désertification. Cette séquence constitue une archive visuelle unique de la transformation du Sahara, d'une savane fertile à son environnement aride actuel.\n\nLes expéditions de l'explorateur français Henri Lhote, à partir de 1956, menèrent la première documentation approfondie de ces gravures, bien que des chercheurs ultérieurs aient révisé certaines de ses interprétations. L'UNESCO a inscrit le Tassili n'Ajjer au patrimoine mondial en 1982, au titre mixte (naturel et culturel), l'un des rares sites à bénéficier de cette double reconnaissance.",
        seo: "Le Tassili n'Ajjer : archive rupestre saharienne de la transformation du désert — patrimoine mondial mixte de l'UNESCO.",
        date: "2026-07-09",
      },
    ],
  });

  const jemaaElFna = await createEntry(prisma, {
    type: "CULTURAL",
    countries: ["MA"],
    categoryIds: [domTraditions],
    coverId: covers.heritage,
    cultural: {},
    sources: [
      { title: "Cultural Space of Jemaa el-Fna Square", publisher: "UNESCO — Patrimoine culturel immatériel", year: 2008, url: "https://ich.unesco.org/en/RL/cultural-space-of-jemaa-el-fna-square-00014" },
    ],
    translations: [
      {
        locale: "ar",
        title: "ساحة جامع الفنا",
        slug: "ساحة-جامع-الفنا",
        summary: "قلب مراكش النابض منذ تأسيسها المرابطي، ساحة شعبية جامعة للحكواتية والموسيقيين والباعة، وأول موقع في التاريخ يحظى بإعلان اليونسكو لروائع التراث الشفوي سنة 2001.",
        body: "تقع ساحة جامع الفنا في قلب مدينة مراكش العتيقة، وترجع نشأتها إلى تأسيس المدينة في العصر المرابطي بالقرن الحادي عشر. ظلت منذ ذلك الحين فضاءً شعبياً جامعاً للتجارة والتجمعات العامة والفرجة، ولا تزال اليوم نابضة بالحياة نهاراً ومساءً بحكواتية يروون الحكايات الشفوية، وموسيقيين من مختلف مناطق المغرب، وحلقات السحرة الشعبيين وأصحاب الحيوانات، وباعة الأطعمة التقليدية.\n\nفي سنة 2001 كانت ساحة جامع الفنا أول موقع في العالم يحظى بإعلان اليونسكو ضمن برنامجها الجديد آنذاك «روائع التراث الشفوي وغير المادي للإنسانية» — وهو البرنامج الذي مهّد لاحقاً لاتفاقية التراث الثقافي غير المادي لسنة 2003. أُدرجت رسمياً في القائمة التمثيلية لهذه الاتفاقية سنة 2008.\n\nتمثل الساحة اليوم نموذجاً نادراً لتراث شفوي حيّ يتجدد يومياً بدل أن يُحفظ فقط في الأرشيف، وقد ألهم هذا النموذج لاحقاً برامج حماية مماثلة لفضاءات شعبية أخرى حول العالم.",
        seo: "ساحة جامع الفنا بمراكش: أول موقع في العالم أعلنته اليونسكو تراثاً شفوياً للإنسانية سنة 2001.",
        date: "2026-07-09",
      },
      {
        locale: "fr",
        title: "La place Jemaa el-Fna",
        slug: "place-jemaa-el-fna",
        summary: "Cœur battant de Marrakech depuis sa fondation almoravide, place populaire réunissant conteurs, musiciens et marchands, premier site au monde proclamé par l'UNESCO chef-d'œuvre du patrimoine oral en 2001.",
        body: "La place Jemaa el-Fna se situe au cœur de la médina de Marrakech et remonte à la fondation de la ville à l'époque almoravide, au XIe siècle. Elle est demeurée depuis un espace populaire de commerce, de rassemblement public et de spectacle, toujours vivante de jour comme de nuit : conteurs perpétuant la tradition orale, musiciens venus de toutes les régions du Maroc, cercles de guérisseurs populaires et de dresseurs d'animaux, vendeurs de mets traditionnels.\n\nEn 2001, la place Jemaa el-Fna fut le premier site au monde proclamé par l'UNESCO dans le cadre de son alors nouveau programme des « Chefs-d'œuvre du patrimoine oral et immatériel de l'humanité » — programme qui prépara la voie à la Convention pour la sauvegarde du patrimoine culturel immatériel de 2003. Elle fut officiellement inscrite sur la liste représentative de cette convention en 2008.\n\nLa place constitue aujourd'hui un modèle rare de patrimoine oral vivant, renouvelé quotidiennement plutôt que simplement conservé en archive — un modèle qui a par la suite inspiré des programmes de protection similaires pour d'autres espaces populaires à travers le monde.",
        seo: "Jemaa el-Fna à Marrakech : premier site au monde proclamé patrimoine oral de l'humanité par l'UNESCO (2001).",
        date: "2026-07-09",
      },
    ],
  });

  await createEntry(prisma, {
    type: "CULTURAL",
    countries: ["DZ"],
    categoryIds: [domArchi],
    coverId: covers.heritage,
    cultural: {},
    sources: [
      { title: "M'Zab Valley — World Heritage List", publisher: "UNESCO", year: 1982, url: "https://whc.unesco.org/en/list/188" },
      { author: "André Ravéreau", title: "Le M'Zab : une leçon d'architecture", publisher: "Sindbad", year: 1981 },
    ],
    translations: [
      {
        locale: "ar",
        title: "وادي مزاب",
        slug: "وادي-مزاب",
        summary: "خمس مدن إباضية محصّنة بالجزائر، أسّسها لاجئون من تاهرت حوالي سنة 1011م، اشتهرت بعمارتها الصحراوية الفريدة التي درسها كبار المعماريين المحدثين.",
        body: "يضم وادي مزاب بوسط الجزائر خمس مدن محصّنة (غرداية وبني يزقن وملّيكة وبونورة والعطف) أسّسها لاجئون إباضيون بعد سقوط دولة تاهرت الرستمية، بحثاً عن ملاذ يحفظ استقلالهم الديني والاجتماعي، ابتداء من حوالي سنة 1011م.\n\nتتميز هذه المدن بعمارة صحراوية فريدة تتكيف بذكاء مع مناخ شديد الحرارة: بيوت متلاصقة تتدرج حول مسجد مركزي على شكل هرمي، أزقة ضيقة مظلّلة تحفظ البرودة، ونظام محكم لتوزيع مياه الآبار والأفلاج. أثارت هذه العمارة إعجاب كبار المعماريين المحدثين في القرن العشرين، وعلى رأسهم لوكوربوزييه وفرنان بويون، اللذين درساها ونهلا منها في أعمالهما.\n\nإلى جانب عمارتها، حافظت المجتمعات الإباضية بوادي مزاب على تنظيمها الاجتماعي والديني التقليدي عبر «حلقة العزّابة» المشرفة على الشؤون الدينية والتربوية. أدرجت اليونسكو الوادي بأكمله ضمن التراث العالمي سنة 1982.",
        seo: "وادي مزاب: خمس مدن إباضية جزائرية بعمارة صحراوية فريدة، درسها لوكوربوزييه — تراث عالمي لدى اليونسكو.",
        date: "2026-07-09",
      },
    ],
  });

  const romanSites = await createEntry(prisma, {
    type: "CULTURAL",
    countries: ["MA", "DZ", "LY"],
    categoryIds: [domArchi],
    coverId: covers.heritage,
    cultural: {},
    sources: [
      { title: "Archaeological Site of Volubilis", publisher: "UNESCO", year: 1997, url: "https://whc.unesco.org/en/list/836" },
      { title: "Djémila", publisher: "UNESCO", year: 1982, url: "https://whc.unesco.org/en/list/191" },
      { title: "Timgad", publisher: "UNESCO", year: 1982, url: "https://whc.unesco.org/en/list/194" },
      { title: "Archaeological Site of Leptis Magna", publisher: "UNESCO", year: 1982, url: "https://whc.unesco.org/en/list/183" },
    ],
    translations: [
      {
        locale: "ar",
        title: "المدن الرومانية في المغرب الكبير",
        slug: "المدن-الرومانية-في-المغرب-الكبير",
        summary: "أربعة مواقع أثرية استثنائية الحفظ تشهد على الطبقة الرومانية العميقة في تاريخ المنطقة: وليلي بالمغرب، وجميلة وتيمقاد بالجزائر، ولبدة الكبرى بليبيا.",
        body: "تحتفظ أرض المغرب الكبير بأربعة من أبرز المواقع الأثرية الرومانية حول المتوسط، كل منها مصنّف تراثاً عالمياً لدى اليونسكو. فوليلي بالمغرب، عاصمة ولاية موريطنية الطنجية الرومانية، تكشف بقاياها فسيفساء رائعة وقوس النصر؛ وجميلة (كويكول قديماً) بالجزائر مدينة جبلية بديعة الموقع؛ وتيمقاد، التي أسّسها الإمبراطور تراجان حوالي سنة 100م مستوطنة لقدامى الجند، تُعدّ من أوضح الأمثلة الباقية على المخطط الشبكي للمدن الرومانية؛ ولبدة الكبرى بليبيا، مسقط رأس الإمبراطور سبتيموس سيفيروس الذي أغدق عليها زخرفاً معمارياً جعلها من أفخم المدن الرومانية المحفوظة في حوض المتوسط كله.\n\nتشهد هذه المواقع الأربعة مجتمعة على عمق الطبقة الرومانية-الإفريقية في تاريخ المغرب الكبير، امتداداً لما بدأته قرطاج ونوميديا من اندماج هذه الأرض في حضارة المتوسط القديم. وتبقى اليوم من أهم الوجهات لفهم الحياة اليومية والعمارة في شمال إفريقيا الرومانية.",
        seo: "المدن الرومانية بالمغرب الكبير: وليلي وجميلة وتيمقاد ولبدة الكبرى — أربعة مواقع تراث عالمي لليونسكو.",
        date: "2026-07-09",
      },
      {
        locale: "fr",
        title: "Les cités romaines du Grand Maghreb",
        slug: "cites-romaines-du-grand-maghreb",
        summary: "Quatre sites archéologiques exceptionnellement préservés témoignant de la profonde strate romaine de l'histoire régionale : Volubilis au Maroc, Djémila et Timgad en Algérie, Leptis Magna en Libye.",
        body: "Le sol du Grand Maghreb conserve quatre des plus remarquables sites archéologiques romains du pourtour méditerranéen, chacun classé au patrimoine mondial de l'UNESCO. Volubilis, au Maroc, capitale de la province romaine de Maurétanie Tingitane, révèle de magnifiques mosaïques et un arc de triomphe ; Djémila (l'antique Cuicul), en Algérie, est une cité de montagne au site admirable ; Timgad, fondée par l'empereur Trajan vers 100 apr. J.-C. comme colonie de vétérans, offre l'un des exemples les mieux conservés du plan en damier des villes romaines ; et Leptis Magna, en Libye, ville natale de l'empereur Septime Sévère qui la dota d'ornements somptueux, compte parmi les cités romaines les mieux préservées de toute la Méditerranée.\n\nCes quatre sites témoignent ensemble de la profondeur de la strate romano-africaine dans l'histoire du Grand Maghreb, prolongeant ce que Carthage et la Numidie avaient amorcé de l'intégration de cette terre dans la civilisation méditerranéenne antique. Ils demeurent aujourd'hui des destinations essentielles pour comprendre la vie quotidienne et l'architecture de l'Afrique du Nord romaine.",
        seo: "Les cités romaines du Grand Maghreb : Volubilis, Djémila, Timgad, Leptis Magna — quatre sites UNESCO.",
        date: "2026-07-09",
      },
    ],
  });

  await createEntry(prisma, {
    type: "CULTURAL",
    countries: ["MA"],
    categoryIds: [domTraditions],
    coverId: covers.equestrian,
    cultural: {},
    sources: [
      { title: "Tbourida", publisher: "UNESCO — Patrimoine culturel immatériel", year: 2021, url: "https://ich.unesco.org/fr/RL/tbourida-01609" },
    ],
    translations: [
      {
        locale: "ar",
        title: "التبوريدة (الفانتازيا)",
        slug: "التبوريدة",
        summary: "استعراض فروسية تقليدي مغربي: مجموعات من الفرسان تنطلق بخيولها في تناسق تام ثم تطلق بارودها في آن واحد، تراث إنساني لدى اليونسكو منذ 2021.",
        body: "التبوريدة، المعروفة أيضاً بـ«الفانتازيا»، استعراض فروسية جماعي متجذر في المغرب وأجزاء من المغرب الكبير، يقوم على مجموعة من الفرسان (تُسمى «السربة») يرتدون الزي التقليدي، ينطلقون بخيولهم بتناسق دقيق في خط واحد داخل ساحة مخصصة، ثم يطلقون بواريدهم التقليدية في آن واحد عند نهاية الشوط في مشهد يجمع الدقة والقوة.\n\nتضرب هذه الممارسة جذورها في تقاليد التدريب العسكري القديمة، وترتبط ارتباطاً وثيقاً بتربية الخيول العربية-البربرية الأصيلة وبمكانة اجتماعية رفيعة للفارس وفرسه. تُقام عروض التبوريدة في المواسم والأعراس والمهرجانات، وتتطلب سنوات من التدريب المشترك بين الفارس وجواده لتحقيق التزامن التام المطلوب.\n\nأدرجت اليونسكو التبوريدة في القائمة التمثيلية للتراث الثقافي غير المادي للإنسانية سنة 2021، تقديراً لهذا التراث الفروسي الحي الذي يواصل آلاف الفرسان المغاربة ممارسته والحفاظ عليه إلى اليوم.",
        seo: "التبوريدة (الفانتازيا): استعراض الفروسية المغربي التقليدي — تراث إنساني لدى اليونسكو منذ 2021.",
        date: "2026-07-09",
      },
    ],
  });

  const tifinagh = await createEntry(prisma, {
    type: "CULTURAL",
    countries: ["MA", "DZ", "LY", "MR"],
    categoryIds: [domLetters],
    coverId: covers.calligraphy,
    cultural: { contentLanguage: "amz", script: "TIFINAGH" },
    sources: [
      { author: "Salem Chaker", title: "Le tifinagh, écriture des Berbères", publisher: "Encyclopédie berbère", year: 1996 },
      { title: "ظهير تأسيس المعهد الملكي للثقافة الأمازيغية", publisher: "الجريدة الرسمية للمملكة المغربية", year: 2001 },
    ],
    translations: [
      {
        locale: "ar",
        title: "تيفيناغ",
        slug: "تيفيناغ",
        summary: "أبجدية قديمة لكتابة اللغة الأمازيغية، ورثتها قبائل الطوارق واستعملتها نساؤهم في المراسلات، وشهدت في العقود الأخيرة إحياءً واعتماداً رسمياً في المغرب والجزائر.",
        body: "تيفيناغ أبجدية عريقة لكتابة اللغات الأمازيغية، تنحدر من الكتابة الليبية البربرية القديمة الموثقة في نقوش تعود لأكثر من ألفي عام. حافظت مجتمعات الطوارق بشكل خاص على استعمالها الحي في الحياة اليومية، بما في ذلك — على نحو لافت — استعمالها من قبل النساء في المراسلات والأشعار الغزلية، وهي سمة اجتماعية ولغوية مميزة نادراً ما توجد في أبجديات أخرى.\n\nشهدت تيفيناغ منذ أواخر القرن العشرين إحياءً وتقنيناً حديثاً (يُعرف بـ«نيو-تيفيناغ») ضمن حركات إحياء الثقافة الأمازيغية بالمغرب الكبير. وفي المغرب، اختار المعهد الملكي للثقافة الأمازيغية سنة 2003 اعتماد تيفيناغ رسمياً لتدريس الأمازيغية في المدارس. أما الجزائر، فبعد اعترافها بالأمازيغية لغة وطنية سنة 2002 ثم رسمية سنة 2016، تعترف بتيفيناغ كأحد الحروف المستعملة إلى جانب العربية واللاتينية.\n\nتظل تيفيناغ اليوم رمزاً بصرياً قوياً للهوية الأمازيغية، حاضرة في اللافتات الرسمية والأعلام والفن المعاصر عبر المغرب الكبير.",
        seo: "تيفيناغ: أبجدية الأمازيغية العريقة، من كتابات الطوارق إلى اعتمادها الرسمي في المغرب والجزائر.",
        date: "2026-07-09",
      },
    ],
  });

  await prisma.relatedContent.createMany({
    data: [
      { fromId: romanSites.id, toId: jemaaElFna.id },
    ],
    skipDuplicates: true,
  });

  console.log("Deuxième lot culture créé : 6 entrées (dont 3 traduites en français).");
  return { tassili, jemaaElFna, romanSites, tifinagh };
}
