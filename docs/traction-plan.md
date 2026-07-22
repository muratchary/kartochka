# Kartochka — Traction Plan (locked 2026-07-22)

Result of a 4-expert growth panel (ASO, CIS parent channels, Gulf/Dubai GTM,
consumer growth PM) + founder decisions. One-line verdict, unanimous:
**the product is fine; nobody has been told it exists. Distribution is the job now.**

Strategy in one sentence: **Russia/CIS = traction & review engine (users there
can't pay on iOS anyway); Dubai Russian-speaking moms = first paying beachhead;
Arabic Gulf + Turkey = deferred 90 days.**

---

## 1. Founder actions (the un-fun work only you can do)

### This week
1. **Create the RuStore account tonight.** VK ID + passport, one evening, no
   company needed. It has been "the plan" for 3+ weeks. Everything on the dev
   side is ready; the moment the account exists we build + submit.
2. **Get 8–10 friends-with-kids to genuinely install and rate the app**
   (App Store). A 0-star listing silently kills every post and referral below.
   No fake accounts, no review swaps — real people who actually try it.
3. **Join 5–8 Russian-language Dubai Telegram chats** as yourself, a parent:
   «Мамы Дубая», «Русские в Дубае/ОАЭ», your neighborhood chat, kindergarten /
   развивашки chats you're already in, relocation chats («переезд в Дубай»).
   Answer real questions helpfully for ~a week BEFORE posting anything.

### Weeks 2–6 (steady drumbeat, ~30–60 min/day)
4. **Post the founder message** (§3 below) in chats where you've built presence.
   Never cold-drop a store link — that gets you muted as spam.
5. **Micro-influencer barter:** DM 10+ Russian-speaking mom-bloggers
   (3k–30k followers — below 3k no reach, above 30k they want money).
   Offer: 1 year Premium free + **10 promo codes to raffle to their audience**
   (the giveaway is content they want). DM draft in §3. Budget: max 40 of the
   93 remaining codes.
6. **Seed long-form reviews on Otzovik / IRecommend:** ask your first ~10 real
   users (not you) to write honest detailed reviews with screenshots — one
   promo code each as thanks. These rank in Yandex for «приложение для
   прививок ребёнку» within weeks and convert for years.
7. **Doctor angle (Dubai, zero budget, no entity needed):** at your own child's
   next appointments with Russian-speaking pediatricians, hand over the
   Kartochka PDF as the actual record. If they like it, ask: can I leave a QR
   card at reception? 3 doctors casually recommending it beats 50 posts.
8. **RuStore featuring:** after the app is live there, message RuStore dev
   relations and pitch for «Новинки» / thematic collections — they actively
   feature new Russian-language apps (Детство/Семья collections around Sept 1
   and День матери in late November).

### What NOT to spend time on (next 90 days — unanimous)
- Arabic/Saudi outreach (no Arabic, no presence — it's theater for now)
- Turkey (Android-heavy market, we're iOS-only there)
- Instagram/Facebook/TikTok growth from zero, Одноклассники, YouTube/Rutube
- Product Hunt / tech PR (wrong audience, wrong geography)
- Any further Google Play appeals
- Cold-emailing Gulf clinic chains (procurement wall for a solo individual)

---

## 2. Product/engineering (Claude's side — one release, then freeze)

User-approved decisions (2026-07-22):
1. **Paywall loosened:** first PDF export per child FREE, full quality, small
   "Made with Kartochka" footer (no watermark). Paywall from 2nd export.
   Russian storefront: skip paywall entirely — "Premium is free in your region
   during launch" (Apple IAP is dead in RU; a purchase UI that can't purchase
   reads as broken). Promo-redeem UI stays hidden on iOS.
2. **Partner sharing un-gated:** free users can invite ONE partner; Premium
   keeps more viewers/extras. (It was our only person-to-person invite loop,
   locked behind a paywall with zero payers.)
3. **Shareable milestone cards** (the panel's #1 product lever): free, branded
   card per completed milestone (photo + milestone + age), localized ru/ar/tr,
   rendered on-device, native share sheet, App Store link baked in. Puts the
   app inside family Telegram/WhatsApp chats — the exact channels our audience
   lives in.
4. **In-app rating prompt** (currently the app NEVER asks): soft "Enjoying
   Kartochka?" pre-prompt → happy path calls the native prompt
   (expo-store-review), unhappy path opens feedback email. Triggers: (a) after
   a successful PDF export/share, (b) after 3rd meaningful record (vaccine
   marked done / milestone with photo). Guards: ≥3 days since install, ≥2
   sessions, once per version (Apple caps 3/365d). "Rate Kartochka" row in
   More → write-review deep link:
   `https://apps.apple.com/app/id6773370520?action=write-review`
5. **Ship the already-built v1.1** (daily feeding/sleep/diaper logging +
   onboarding back-nav fix). It ships but is NEVER the marketing lead — the
   story stays "vaccination card + doctor PDF".
6. **ASO metadata fixes** (ship with the same version):
   - RU title suffix: "Kartochka — Здоровье ребёнка"; AR subtitle →
     "التطعيمات والنمو وتطور الطفل"; TR subtitle → drop "ve", lead with "aşı takvimi" tokens.
   - Keyword fields (paste as-is):
     - RU: `календарь,прививок,ребенок,вес,малыш,педиатр,дневник,здоровье,грудничок,мама,вакцинация,карта,график`
     - AR: `تطعيم,تطعيمات,طفل,رضيع,جدول,وزن,طول,صحة,اطفال,مواليد,طبيب,سجل,متابعة`
     - TR: `aşı,takvimi,bebek,çocuk,takip,boy,kilo,persentil,karne,doktor,sağlık,tartı,bebeğim`
     - EN: `baby,tracker,record,book,shot,immunization,schedule,chart,toddler,newborn,pediatric,log,weight,kids`
   - Screenshots: slot 1 = benefit headline "Календарь прививок вашей страны —
     РФ, КЗ, УЗ" (localized per storefront; EN captions for AE), slot 2 = the
     doctor PDF, slot 3 = growth chart.
7. **Landing page SEO (kartochka.app):** RU version must actually contain
   «календарь прививок», «карта прививок ребёнка», «электронная карта
   прививок»; localized `<title>`/meta per language (currently English-only —
   Yandex has nothing to rank). Russian privacy policy page live before
   RuStore submission (moderation checks it).
8. **RuStore build:** fresh local Android build (free) the moment the account
   exists. Listing angle: «Электронная карта прививок и развития ребёнка —
   работает без интернета, данные хранятся на телефоне». Never the word
   «медицинский». Premium in RU = effectively free via codes; RU is the
   review/traction engine, revenue comes from Gulf/diaspora iOS.
9. **PDF export counter:** one anonymous row per export in the existing
   Supabase Edge Function — our only true activation metric (app is
   local-first; this is the honest limit of measurement).

After this release: **engineering freeze — 100% distribution.**

## Weekly scoreboard (every Monday)
1. App Store downloads (App Units) — App Store Connect app/website.
2. PDFs generated — Supabase count (added in #9).
3. Ratings count per storefront — automated via iTunes lookup (Claude checks).

---

## 3. Paste-ready assets (from the channel experts)

### Telegram post — Dubai Russian mom chats
> Девочки, привет! Я папа двухлетки, живём в Дубае. Когда мы переехали, я запутался: прививки сделаны по российскому календарю, а садик и педиатр здесь просят всё по местному, и половина записей — в бумажной карте, половина — в трёх разных приложениях клиник.
>
> Я сделал приложение Карточка — для себя, честно. Туда вносишь прививки ребёнка (есть календари России, Казахстана, Узбекистана и ОАЭ), рост/вес по графикам ВОЗ, и одной кнопкой получаешь аккуратный PDF, который можно показать педиатру или отдать в садик. Есть русский и английский.
>
> Оно бесплатное для одного ребёнка. Я не клиника и не реклама — просто такой же родитель. Буду очень благодарен за критику: чего не хватает, что неудобно. Ссылка: kartochka.app

### Telegram/VK post — Russia/CIS chats (use once RuStore is live)
> Привет! Я папа, живу далеко от дома, и после переезда понял, что прививочный сертификат дочки — это мятая бумажка, которую я вечно не могу найти перед приёмом у педиатра. Сделал для себя приложение «Карточка»: национальный календарь прививок (Россия, Казахстан, Узбекистан и др.), напоминания, графики роста по нормам ВОЗ, вехи развития — и PDF-выписка, которую можно показать врачу с телефона. Всё хранится на самом телефоне, без обязательной регистрации и облаков. Базовые функции бесплатные и такими останутся. Буду очень благодарен за критику — что неудобно, чего не хватает? Ссылка в комментарии (или напишите мне в личку). Первым откликнувшимся — код на год полной версии бесплатно.

### Influencer DM (3k–30k mom-bloggers)
> Здравствуйте, [имя]! Я сам-один делаю приложение «Карточка» — электронная карта прививок и развития ребёнка (календари РФ/КЗ/УЗ, графики ВОЗ, PDF для педиатра). Бюджета на рекламу у меня нет, но могу предложить вам год полной версии бесплатно + 10 таких же кодов для розыгрыша среди подписчиц — обычно такие розыгрыши хорошо заходят. Если приложение не понравится — честно напишите об этом, мне важнее обратная связь. Скинуть код?

### Rules of thumb
- Always helpful-first; the app is mentioned second, never as a cold link.
- Ask for criticism, not installs — it survives moderation and starts threads.
- Never incentivize App Store ratings (Apple ban); promo codes are for
  *usage/feedback/long-form Otzovik reviews*, not star ratings.
- Promo code budget: ~40 influencer raffles, ~10 Otzovik reviewers,
  ~20 chat seeding, rest reserve.
