/**
 * Pushes App Store localizations (EN/RU/AR/TR) to the editable App Store version
 * via the App Store Connect API. Reusable for future updates.
 *
 *   node scripts/asc-push-metadata.mjs
 *
 * Reads the API key from .secrets/asc-api.env (gitignored). Idempotent: updates
 * existing locale records, creates missing ones (ru, tr). Source of truth for
 * the copy is docs/appstore-metadata.md (kept in sync here).
 */
import fs from 'fs';
import crypto from 'crypto';
import https from 'https';

const APP = '6773370520';
const MARKETING_URL = 'https://kartochka.app';
const SUPPORT_URL = 'https://kartochka.app';
const PRIVACY_URL = 'https://kartochka.app/privacy';
const TERMS_URL = 'https://kartochka.app/terms';

// App Store 3.1.2(c): subscription apps must include a functional Terms of Use
// (EULA) link in the App Description. Appended per-locale below.
const EULA_LINE = {
  'en-US': `\n\nTerms of Use (EULA): ${TERMS_URL}`,
  ru: `\n\nУсловия использования (EULA): ${TERMS_URL}`,
  'ar-SA': `\n\nشروط الاستخدام (EULA): ${TERMS_URL}`,
  tr: `\n\nKullanım Koşulları (EULA): ${TERMS_URL}`,
};

const env = Object.fromEntries(
  fs.readFileSync('.secrets/asc-api.env', 'utf8').split('\n')
    .filter((l) => l && !l.startsWith('#')).map((l) => l.split('=')),
);
const KEY_ID = env.ASC_KEY_ID.trim(), ISS = env.ASC_ISSUER_ID.trim();
const PK = fs.readFileSync(env.ASC_KEY_PATH.trim(), 'utf8');

// locale → { name, subtitle, promo, keywords, description }
const C = {
  'en-US': {
    name: 'Kartochka', subtitle: 'Vaccines, growth, milestones',
    promo: 'Track vaccines, growth, milestones, and milestone photos. Generate a pediatrician-ready PDF in one tap. Free for one child, 14-day Premium trial.',
    keywords: 'baby,child,vaccine,vaccination,growth chart,milestones,pediatrician,parent,kids,health record,WHO',
    description: `One card. Their whole childhood.

Kartochka keeps everything about your child's health in one simple place — built for parents, ready for the pediatrician.

WHAT'S INSIDE
• Vaccines — National schedules with smart reminders before each dose is due. Never miss one again.
• Growth — Weight, height, and head-circumference charts based on WHO standards.
• Milestones + Album — Track 37 developmental milestones and keep the photos in a beautiful, age-grouped album.
• Doctor PDF — One tap creates a clean, printable report with vaccines, growth, and milestones to share with your pediatrician.

ALSO INSIDE
• Emergency Card — Blood type, allergies, and current medications, always one tap away.
• Doctor Visits — Log every visit with notes.
• Partner Sharing — Keep both parents in sync.
• Cloud Backup — Optional, encrypted backup and restore.

FREE & PREMIUM
Free: one child, all tracking, reminders, growth charts, milestones, doctor visits, and the emergency card.
Premium: PDF export, unlimited children, partner sharing, cloud backup, and WHO percentile bands. 14-day free trial.

PRIVACY FIRST
Your data lives on your device. No account is required to start. Cloud backup is optional and encrypted.

Built for parents in Russian-speaking countries and the Middle East.`,
  },
  ru: {
    name: 'Kartochka', subtitle: 'Прививки, рост, развитие',
    promo: 'Отслеживайте прививки, рост, этапы развития и фото. Создайте PDF для педиатра одним нажатием. Бесплатно для одного ребёнка, 14 дней Premium.',
    keywords: 'малыш,ребёнок,прививки,вакцинация,рост,развитие,педиатр,родители,дети,здоровье,ВОЗ,календарь',
    description: `Одна карточка. Всё их детство.

Kartochka хранит всё о здоровье вашего ребёнка в одном простом месте — создано для родителей, готово для педиатра.

ЧТО ВНУТРИ
• Прививки — национальные календари с умными напоминаниями до каждой дозы. Больше не пропустите.
• Рост — графики веса, роста и окружности головы по стандартам ВОЗ.
• Развитие + Альбом — отмечайте 37 этапов развития и храните фото в красивом альбоме по возрасту.
• PDF для врача — одно нажатие создаёт аккуратный отчёт с прививками, ростом и этапами, чтобы показать педиатру.

ТАКЖЕ ВНУТРИ
• Карта экстренной помощи — группа крови, аллергии и текущие лекарства всегда под рукой.
• Визиты к врачу — записывайте каждый визит с заметками.
• Доступ для партнёра — оба родителя всегда синхронизированы.
• Резервная копия в облаке — по желанию, зашифрованная.

БЕСПЛАТНО И PREMIUM
Бесплатно: один ребёнок, всё отслеживание, напоминания, графики роста, этапы развития, визиты к врачу и карта экстренной помощи.
Premium: экспорт PDF, неограниченное число детей, доступ для партнёра, резервная копия в облаке и перцентильные коридоры ВОЗ. 14 дней бесплатно.

КОНФИДЕНЦИАЛЬНОСТЬ
Ваши данные хранятся на устройстве. Аккаунт не нужен для начала. Резервная копия в облаке — по желанию и зашифрована.

Создано для родителей в русскоязычных странах и на Ближнем Востоке.`,
  },
  'ar-SA': {
    name: 'Kartochka', subtitle: 'اللقاحات والنمو والإنجازات',
    promo: 'تتبّع اللقاحات والنمو والمعالم والصور. أنشئ تقرير PDF لطبيب الأطفال بضغطة واحدة. مجاني لطفل واحد، وتجربة Premium لمدة 14 يوماً.',
    keywords: 'طفل,رضيع,لقاح,تطعيم,نمو,مخطط,معالم,طبيب أطفال,والدين,أطفال,صحة,منظمة الصحة',
    description: `بطاقة واحدة. طفولتهم كاملةً.

يحفظ Kartochka كل ما يخص صحة طفلك في مكان واحد بسيط — مصمم للآباء، جاهز لطبيب الأطفال.

ماذا يوجد بالداخل
• اللقاحات — جداول وطنية مع تذكيرات ذكية قبل كل جرعة. لا تفوّت أي جرعة.
• النمو — مخططات الوزن والطول ومحيط الرأس وفق معايير منظمة الصحة العالمية.
• المعالم + الألبوم — سجّل 37 معلماً تطورياً واحفظ الصور في ألبوم جميل مرتب حسب العمر.
• ملف PDF للطبيب — بضغطة واحدة يُنشأ تقرير أنيق باللقاحات والنمو والمعالم لمشاركته مع طبيب الأطفال.

أيضاً بالداخل
• بطاقة الطوارئ — فصيلة الدم والحساسية والأدوية الحالية دائماً في متناول اليد.
• زيارات الطبيب — سجّل كل زيارة مع الملاحظات.
• المشاركة مع الشريك — يبقى الوالدان متزامنين.
• النسخ الاحتياطي السحابي — اختياري ومشفّر.

مجاني و Premium
مجاني: طفل واحد، كل التتبّع، التذكيرات، مخططات النمو، المعالم، زيارات الطبيب وبطاقة الطوارئ.
Premium: تصدير PDF، عدد غير محدود من الأطفال، المشاركة مع الشريك، النسخ الاحتياطي السحابي، ونطاقات النسب المئوية لمنظمة الصحة. تجربة مجانية 14 يوماً.

الخصوصية أولاً
بياناتك تبقى على جهازك. لا حاجة لحساب للبدء. النسخ الاحتياطي السحابي اختياري ومشفّر.

مصمم للآباء في الدول الناطقة بالروسية والشرق الأوسط.`,
  },
  tr: {
    name: 'Kartochka', subtitle: 'Aşılar, büyüme ve gelişim',
    promo: 'Aşıları, büyümeyi, gelişimi ve fotoğrafları takip edin. Tek dokunuşla doktora hazır PDF oluşturun. Bir çocuk için ücretsiz, 14 gün Premium deneme.',
    keywords: 'bebek,çocuk,aşı,aşılama,büyüme,gelişim,çocuk doktoru,ebeveyn,sağlık,takvim,DSÖ',
    description: `Tek kart. Tüm çocuklukları.

Kartochka, çocuğunuzun sağlığıyla ilgili her şeyi tek bir basit yerde toplar — ebeveynler için tasarlandı, doktora hazır.

İÇİNDE NELER VAR
• Aşılar — her dozdan önce akıllı hatırlatıcılı ulusal takvimler. Bir daha kaçırmayın.
• Büyüme — DSÖ standartlarına göre kilo, boy ve baş çevresi grafikleri.
• Gelişim + Albüm — 37 gelişim basamağını işaretleyin ve fotoğrafları yaşa göre düzenli, güzel bir albümde saklayın.
• Doktor PDF'i — tek dokunuşla aşılar, büyüme ve gelişim içeren temiz, yazdırılabilir bir rapor oluşturun.

AYRICA İÇİNDE
• Acil Durum Kartı — kan grubu, alerjiler ve mevcut ilaçlar her zaman elinizin altında.
• Doktor Ziyaretleri — her ziyareti notlarla kaydedin.
• Partner Paylaşımı — iki ebeveyn de senkronize kalır.
• Bulut Yedekleme — isteğe bağlı ve şifreli.

ÜCRETSİZ VE PREMIUM
Ücretsiz: bir çocuk, tüm takip, hatırlatıcılar, büyüme grafikleri, gelişim, doktor ziyaretleri ve acil durum kartı.
Premium: PDF dışa aktarma, sınırsız çocuk, partner paylaşımı, bulut yedekleme ve DSÖ persentil bantları. 14 gün ücretsiz deneme.

ÖNCE GİZLİLİK
Verileriniz cihazınızda kalır. Başlamak için hesap gerekmez. Bulut yedekleme isteğe bağlı ve şifrelidir.

Rusça konuşulan ülkeler ve Orta Doğu'daki ebeveynler için tasarlandı.`,
  },
};

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
function token() {
  const now = Math.floor(Date.now() / 1000);
  const si = b64({ alg: 'ES256', kid: KEY_ID, typ: 'JWT' }) + '.' + b64({ iss: ISS, iat: now, exp: now + 1100, aud: 'appstoreconnect-v1' });
  const sig = crypto.sign('sha256', Buffer.from(si), { key: PK, dsaEncoding: 'ieee-p1363' }).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return si + '.' + sig;
}
function req(method, path, body) {
  return new Promise((res, rej) => {
    const data = body ? JSON.stringify(body) : null;
    const r = https.request('https://api.appstoreconnect.apple.com' + path, {
      method, headers: { Authorization: 'Bearer ' + token(), 'Content-Type': 'application/json', ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}) },
    }, (rs) => { let b = ''; rs.on('data', (d) => b += d); rs.on('end', () => res({ s: rs.statusCode, j: (() => { try { return JSON.parse(b); } catch { return b; } })() })); });
    r.on('error', rej); if (data) r.write(data); r.end();
  });
}

(async () => {
  // Find editable version
  const vers = await req('GET', `/v1/apps/${APP}/appStoreVersions?limit=5`);
  const ver = (vers.j.data || []).find((v) => ['PREPARE_FOR_SUBMISSION', 'DEVELOPER_REJECTED', 'REJECTED', 'METADATA_REJECTED'].includes(v.attributes.appStoreState));
  if (!ver) { console.log('No editable version found.'); return; }
  console.log('Editable version:', ver.attributes.versionString, ver.id);

  // App info (for name/subtitle/privacy)
  const infos = await req('GET', `/v1/apps/${APP}/appInfos`);
  const infoId = infos.j.data[0].id;

  const existVL = (await req('GET', `/v1/appStoreVersions/${ver.id}/appStoreVersionLocalizations?limit=50`)).j.data || [];
  const existIL = (await req('GET', `/v1/appInfos/${infoId}/appInfoLocalizations?limit=50`)).j.data || [];

  for (const [loc, c] of Object.entries(C)) {
    // ---- Version localization (description, keywords, promo, urls) ----
    const vl = existVL.find((x) => x.attributes.locale === loc);
    const vlAttrs = { description: c.description + (EULA_LINE[loc] || ''), keywords: c.keywords, promotionalText: c.promo, marketingUrl: MARKETING_URL, supportUrl: SUPPORT_URL };
    if (vl) {
      const r = await req('PATCH', `/v1/appStoreVersionLocalizations/${vl.id}`, { data: { type: 'appStoreVersionLocalizations', id: vl.id, attributes: vlAttrs } });
      console.log(`  [${loc}] version-loc PATCH:`, r.s === 200 ? 'OK' : r.s + ' ' + JSON.stringify(r.j).slice(0, 160));
    } else {
      const r = await req('POST', `/v1/appStoreVersionLocalizations`, { data: { type: 'appStoreVersionLocalizations', attributes: { locale: loc, ...vlAttrs }, relationships: { appStoreVersion: { data: { type: 'appStoreVersions', id: ver.id } } } } });
      console.log(`  [${loc}] version-loc CREATE:`, r.s === 201 ? 'OK' : r.s + ' ' + JSON.stringify(r.j).slice(0, 160));
    }
    // ---- App info localization (name, subtitle, privacy) ----
    const il = existIL.find((x) => x.attributes.locale === loc);
    const ilAttrs = { name: c.name, subtitle: c.subtitle, privacyPolicyUrl: PRIVACY_URL };
    if (il) {
      const r = await req('PATCH', `/v1/appInfoLocalizations/${il.id}`, { data: { type: 'appInfoLocalizations', id: il.id, attributes: ilAttrs } });
      console.log(`  [${loc}] info-loc PATCH:`, r.s === 200 ? 'OK' : r.s + ' ' + JSON.stringify(r.j).slice(0, 160));
    } else {
      const r = await req('POST', `/v1/appInfoLocalizations`, { data: { type: 'appInfoLocalizations', attributes: { locale: loc, ...ilAttrs }, relationships: { appInfo: { data: { type: 'appInfos', id: infoId } } } } });
      console.log(`  [${loc}] info-loc CREATE:`, r.s === 201 ? 'OK' : r.s + ' ' + JSON.stringify(r.j).slice(0, 160));
    }
  }
  console.log('Done.');
})().catch((e) => console.log('ERR', e.message));
