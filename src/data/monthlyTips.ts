export interface MonthlyTipGroup {
  ageMonthsMin: number;
  ageMonthsMax: number; // exclusive
  tips: { en: string; ru: string; ar: string; tr: string }[];
}

export const MONTHLY_TIPS: MonthlyTipGroup[] = [
  {
    ageMonthsMin: 0,
    ageMonthsMax: 1,
    tips: [
      {
        en: 'Safe sleep: always place baby on their back on a firm, flat surface with no pillows or loose bedding.',
        ru: 'Безопасный сон: всегда кладите малыша на спину на твёрдую ровную поверхность без подушек и мягких предметов.',
        ar: 'النوم الآمن: ضع طفلك دائماً على ظهره على سطح صلب ومستوٍ بلا وسائد أو بطانيات رخوة.',
        tr: 'Güvenli uyku: bebeğinizi her zaman sırt üstü, sert ve düz bir yüzeyde, yastık veya yumuşak yatak malzemeleri olmadan yatırın.',
      },
      {
        en: 'First pediatrician visit is usually within 3–5 days of birth. Write your questions down — no question is too small.',
        ru: 'Первый визит к педиатру обычно в течение 3–5 дней после рождения. Запишите вопросы заранее — все они важны.',
        ar: 'أول زيارة للطبيب عادةً خلال 3–5 أيام من الولادة. اكتب أسئلتك — لا يوجد سؤال بسيط.',
        tr: 'İlk pediatri ziyareti genellikle doğumdan 3–5 gün sonra olur. Sorularınızı yazın — hiçbir soru önemsiz değildir.',
      },
    ],
  },
  {
    ageMonthsMin: 1,
    ageMonthsMax: 2,
    tips: [
      {
        en: 'Tummy time for a few minutes daily (while awake and supervised) strengthens neck and shoulder muscles.',
        ru: 'Выкладывание на живот (несколько минут в день под присмотром) укрепляет мышцы шеи и плеч.',
        ar: 'وقت الاستلقاء على البطن (دقائق يومياً أثناء الصحو وتحت الإشراف) يقوّي عضلات الرقبة والكتفين.',
        tr: 'Karın üstü zaman (uyanıkken ve gözetim altında günde birkaç dakika) boyun ve omuz kaslarını güçlendirir.',
      },
      {
        en: 'Your baby is starting to follow faces and moving objects with their eyes — talk to them often.',
        ru: 'Малыш начинает следить глазами за лицами и движущимися предметами — разговаривайте с ним чаще.',
        ar: 'يبدأ طفلك في تتبع الوجوه والأشياء المتحركة بعينيه — تحدّث معه كثيراً.',
        tr: 'Bebeğiniz yüzleri ve hareketli nesneleri gözleriyle takip etmeye başlıyor — onunla sık sık konuşun.',
      },
    ],
  },
  {
    ageMonthsMin: 2,
    ageMonthsMax: 4,
    tips: [
      {
        en: 'First real smiles appear around 6–8 weeks. Smile back — it builds trust and emotional attachment.',
        ru: 'Первые настоящие улыбки появляются около 6–8 недель. Улыбайтесь в ответ — это формирует доверие и привязанность.',
        ar: 'تظهر الابتسامات الحقيقية الأولى حول الأسبوع 6–8. ابتسم في المقابل — يبني الثقة والتعلق العاطفي.',
        tr: 'İlk gerçek gülümsemeler yaklaşık 6–8. haftada görülür. Geri gülümseyin — güven ve duygusal bağ oluşturur.',
      },
      {
        en: 'Vaccines are scheduled around 2 months — check the Vaccines tab to see what\'s due.',
        ru: 'Плановые прививки — около 2 месяцев. Откройте вкладку «Прививки», чтобы проверить расписание.',
        ar: 'التطعيمات مقررة حول شهرين — تحقق من تبويب التطعيمات لمعرفة المواعيد.',
        tr: 'Aşılar yaklaşık 2. ayda planlanmaktadır — Aşılar sekmesini kontrol edin.',
      },
    ],
  },
  {
    ageMonthsMin: 4,
    ageMonthsMax: 6,
    tips: [
      {
        en: 'Baby may start rolling soon — never leave them unattended on a changing table or sofa.',
        ru: 'Малыш скоро начнёт переворачиваться — никогда не оставляйте его без присмотра на пеленальном столике или диване.',
        ar: 'قد يبدأ طفلك في الانقلاب قريباً — لا تتركه دون رقابة على طاولة الحفاضات أو الأريكة.',
        tr: 'Bebek yakında yuvarlanmaya başlayabilir — onu bez değiştirme masasında veya kanepede gözetimsiz bırakmayın.',
      },
      {
        en: 'Solid foods aren\'t needed yet. Breast milk or formula provides all the nutrition your baby needs.',
        ru: 'Прикорм ещё не нужен. Грудное молоко или смесь обеспечивают все необходимые питательные вещества.',
        ar: 'الأطعمة الصلبة غير ضرورية بعد. يوفر حليب الثدي أو الحليب الصناعي كل العناصر الغذائية اللازمة.',
        tr: 'Katı gıdalar henüz gerekmemektedir. Anne sütü veya mama bebeğin ihtiyaç duyduğu tüm besini sağlar.',
      },
    ],
  },
  {
    ageMonthsMin: 6,
    ageMonthsMax: 9,
    tips: [
      {
        en: 'First teeth often appear between 4–7 months. A clean damp cloth or teething ring soothes sore gums.',
        ru: 'Первые зубы обычно прорезаются в 4–7 месяцев. Чистая влажная тряпочка или прорезыватель поможет при болезненности дёсен.',
        ar: 'تظهر الأسنان الأولى غالباً بين 4–7 أشهر. قطعة قماش رطبة نظيفة أو لعبة تسنين تهدئ اللثة المؤلمة.',
        tr: 'İlk dişler genellikle 4–7 ay arasında çıkar. Temiz nemli bir bez veya diş çıkarma halkası hassas diş etlerini rahatlatabilir.',
      },
      {
        en: 'Single-ingredient purées are a great first food — introduce one new ingredient every 3 days to watch for reactions.',
        ru: 'Однокомпонентные пюре — хороший старт. Вводите по одному продукту раз в 3 дня, чтобы отследить реакции.',
        ar: 'مهروس المكوّن الواحد بداية رائعة — قدّم مكوّناً جديداً كل 3 أيام لمراقبة ردود الفعل.',
        tr: 'Tek malzemeli püreler harika bir başlangıçtır — reaksiyonları izlemek için her 3 günde bir yeni malzeme ekleyin.',
      },
    ],
  },
  {
    ageMonthsMin: 9,
    ageMonthsMax: 12,
    tips: [
      {
        en: 'Separation anxiety is completely normal. Short, consistent goodbyes and reliable returns build security.',
        ru: 'Тревога разлуки — совершенно нормально. Короткие прощания и предсказуемые возвращения формируют чувство безопасности.',
        ar: 'قلق الانفصال طبيعي تماماً. الوداع القصير المتسق والعودة الموثوقة يبنيان الشعور بالأمان.',
        tr: 'Ayrılık kaygısı tamamen normaldir. Kısa ve tutarlı vedalar ile güvenilir geri dönüşler güvenlik hissi oluşturur.',
      },
      {
        en: 'Finger foods develop fine motor skills and independence — soft, bite-sized pieces work best.',
        ru: 'Кусочки еды для самостоятельного питания развивают мелкую моторику. Лучше всего подходят мягкие кусочки размером с укус.',
        ar: 'أطعمة الأصابع تنمّي المهارات الحركية الدقيقة — القطع الطرية بحجم لقمة هي الأفضل.',
        tr: 'Parmak yiyecekler ince motor becerilerini geliştirir — yumuşak, ısırık büyüklüğündeki parçalar en iyi çalışır.',
      },
    ],
  },
  {
    ageMonthsMin: 12,
    ageMonthsMax: 18,
    tips: [
      {
        en: 'First steps happen anywhere from 9–18 months — there\'s a wide range of normal. Follow your child\'s pace.',
        ru: 'Первые шаги делаются в промежутке 9–18 месяцев — диапазон нормы широкий. Ориентируйтесь на темп своего ребёнка.',
        ar: 'تبدأ الخطوات الأولى في أي وقت بين 9–18 شهراً — هناك نطاق طبيعي واسع. اتبع إيقاع طفلك.',
        tr: 'İlk adımlar 9–18 ay arasında herhangi bir zamanda atılabilir — geniş bir normal aralığı vardır. Çocuğunuzun hızını takip edin.',
      },
      {
        en: 'First words usually appear between 10–14 months. Daily reading and talking build vocabulary.',
        ru: 'Первые слова обычно появляются в 10–14 месяцев. Ежедневное чтение и общение пополняют словарный запас.',
        ar: 'تظهر الكلمات الأولى عادةً بين 10–14 شهراً. القراءة اليومية والحديث يبنيان المفردات.',
        tr: 'İlk kelimeler genellikle 10–14 ay arasında görülür. Günlük okuma ve konuşma kelime dağarcığını geliştirir.',
      },
    ],
  },
  {
    ageMonthsMin: 18,
    ageMonthsMax: 24,
    tips: [
      {
        en: 'Two-word phrases ("more milk", "daddy go") usually appear by 24 months. If delayed, mention it to your pediatrician.',
        ru: 'Двусловные фразы («ещё молока», «папа ушёл») обычно появляются к 24 месяцам. Если нет — скажите педиатру.',
        ar: 'تظهر عبارات الكلمتين ("المزيد من الحليب"، "بابا راح") عادةً بحلول 24 شهراً. إذا تأخرت، أخبر طبيبك.',
        tr: '"Daha süt", "baba git" gibi iki kelimeli ifadeler genellikle 24 aya kadar görülür. Gecikme varsa pediatristle paylaşın.',
      },
      {
        en: 'Tantrums are normal — toddlers feel big emotions but lack the words. Stay calm and consistent.',
        ru: 'Истерики — это нормально: малыши испытывают сильные эмоции, но не умеют их выражать. Сохраняйте спокойствие и последовательность.',
        ar: 'نوبات الغضب طبيعية — يشعر الأطفال الصغار بمشاعر قوية لكنهم يفتقرون للكلمات. ابقَ هادئاً ومتسقاً.',
        tr: 'Öfke nöbetleri normaldir — küçük çocuklar büyük duygular hisseder ama kelimeleri yoktur. Sakin ve tutarlı kalın.',
      },
    ],
  },
  {
    ageMonthsMin: 24,
    ageMonthsMax: 36,
    tips: [
      {
        en: 'Toilet training readiness signs: staying dry 2+ hours, showing interest, communicating the need.',
        ru: 'Признаки готовности к туалетному обучению: сухость 2+ часа, интерес к горшку, умение сообщить о потребности.',
        ar: 'علامات الاستعداد لتدريب التواليت: البقاء جافاً لساعتين أو أكثر، إظهار الاهتمام، التعبير عن الحاجة.',
        tr: 'Tuvalet eğitimine hazırlık işaretleri: 2+ saat kuru kalma, ilgi gösterme, ihtiyacı ifade edebilme.',
      },
      {
        en: 'Pretend play begins this year — toys "talk", cars "go to work". It\'s a sign of healthy cognitive development.',
        ru: 'В этом году начинается сюжетно-ролевая игра — игрушки «разговаривают», машины «едут на работу». Это признак здорового развития.',
        ar: 'يبدأ اللعب التخيلي هذا العام — الألعاب "تتكلم"، السيارات "تذهب للعمل". هذا مؤشر على تطور معرفي صحي.',
        tr: 'Bu yıl hayali oyun başlar — oyuncaklar "konuşur", arabalar "işe gider". Bu sağlıklı bilişsel gelişimin işaretidir.',
      },
    ],
  },
  {
    ageMonthsMin: 36,
    ageMonthsMax: 48,
    tips: [
      {
        en: 'Playing with other children becomes important — playdates and preschool support social development.',
        ru: 'Игры с другими детьми становятся важными — игровые встречи и детский сад поддерживают социальное развитие.',
        ar: 'اللعب مع الأطفال الآخرين يصبح مهماً الآن — مواعيد اللعب والروضة تدعم التطور الاجتماعي.',
        tr: 'Diğer çocuklarla oynamak artık önemlidir — oyun randevuları ve okul öncesi sosyal gelişimi destekler.',
      },
      {
        en: 'Reading together every day builds vocabulary, imagination, and a lifelong love of learning.',
        ru: 'Ежедневное совместное чтение развивает словарный запас, воображение и любовь к учёбе на всю жизнь.',
        ar: 'القراءة اليومية معاً تبني المفردات والخيال وحب التعلم مدى الحياة.',
        tr: 'Her gün birlikte okumak kelime dağarcığını, hayal gücünü ve öğrenme sevgisini geliştirir.',
      },
    ],
  },
  {
    ageMonthsMin: 48,
    ageMonthsMax: 72,
    tips: [
      {
        en: 'School readiness: writing their name, counting to 10, recognizing some letters, following 2–3 step instructions.',
        ru: 'Готовность к школе: написать своё имя, посчитать до 10, знать буквы, выполнять инструкции из 2–3 шагов.',
        ar: 'الاستعداد للمدرسة: كتابة الاسم، العد إلى 10، التعرف على الحروف، اتباع تعليمات من 2–3 خطوات.',
        tr: 'Okul hazırlığı: adını yazma, 10\'a kadar sayma, bazı harfleri tanıma, 2–3 adımlı talimatları takip etme.',
      },
      {
        en: 'Regular dental checkups from age 3 help catch early issues and build a positive relationship with dentistry.',
        ru: 'Регулярные визиты к стоматологу с 3 лет помогают выявить проблемы на ранней стадии и сформировать хорошее отношение к лечению зубов.',
        ar: 'الفحوصات الدورية عند طبيب الأسنان من سن 3 سنوات تساعد في اكتشاف المشاكل مبكراً وتنمية علاقة إيجابية مع طب الأسنان.',
        tr: '3 yaşından itibaren düzenli diş kontrolleri erken sorunları tespit etmeye ve dişçilikle olumlu bir ilişki kurmaya yardımcı olur.',
      },
    ],
  },
];

export function getTipsForAge(ageMonths: number): MonthlyTipGroup | null {
  return MONTHLY_TIPS.find(
    (g) => ageMonths >= g.ageMonthsMin && ageMonths < g.ageMonthsMax,
  ) ?? null;
}
