// ──────────────────────────────────────────────────────────────────────
// Kartochka — onboarding screens (Group 1)
//   1.1 Splash · 1.2 Welcome · 1.3 Country · 1.4 Language · 1.5 Add child
// ──────────────────────────────────────────────────────────────────────

// Phone wrapper — uses IOSDevice chrome but renders our own screen body.
// IOSDevice handles dynamic island, status bar (zIndex 10, absolute top),
// and home indicator. Our content needs paddingTop:54 to clear the bar.
function Phone({ children, bg = K.bg, statusDark = false }) {
  return (
    <IOSDevice width={402} height={874} dark={false}>
      <div style={{
        height: '100%', background: bg, display: 'flex', flexDirection: 'column',
        fontFamily: K.font, color: K.ink,
      }}>
        <div style={{ height: 54, flexShrink: 0 }}/> {/* status bar clearance */}
        {children}
      </div>
    </IOSDevice>
  );
}

// ══════════════════════════════════════════════════════════════════════
// 1.1 SPLASH
// ══════════════════════════════════════════════════════════════════════
function ScreenSplash() {
  return (
    <Phone>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
        <SeedlingMark size={104} radius={26}/>
        <div style={{ marginTop: 4, fontFamily: K.font, fontSize: 32, fontWeight: 800, color: K.ink, letterSpacing: -0.6 }}>
          Карточка
        </div>
        <div style={{ fontFamily: K.font, fontSize: 14, color: K.ink2, fontWeight: 500, maxWidth: 280, textAlign: 'center', lineHeight: 1.4 }}>
          Медкарта ребёнка,<br/>которую оценит ваш педиатр
        </div>
      </div>
      <div style={{ paddingBottom: 80, display: 'flex', justifyContent: 'center' }}>
        <SplashDots/>
      </div>
      <div style={{ height: 34, flexShrink: 0 }}/> {/* home indicator clearance */}
    </Phone>
  );
}
function SplashDots() {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 8, height: 8, borderRadius: 999,
          background: K.teal, opacity: 0.3 + i * 0.25,
        }}/>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// 1.2 WELCOME
// ══════════════════════════════════════════════════════════════════════
function ScreenWelcome({ rtl = false }) {
  const t = rtl
    ? {
        h1: 'مرحبًا بك',
        sub: 'سجل صحي لطفلك،\nسيشكرك عليه طبيب الأطفال',
        cta: 'لنبدأ',
        link: 'لدي حساب بالفعل',
        privacy: 'بيانات طفلك تبقى على جهازك افتراضيًا',
      }
    : {
        h1: 'Здравствуйте',
        sub: 'Медкарта вашего ребёнка,\nкоторую оценит педиатр',
        cta: 'Начать',
        link: 'У меня уже есть аккаунт',
        privacy: 'Данные вашего ребёнка остаются на устройстве',
      };

  const font = rtl ? K.fontAr : K.font;
  return (
    <Phone>
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        padding: '24px 24px 0', direction: rtl ? 'rtl' : 'ltr',
      }}>
        {/* Hero: oversized seedling on a soft circle */}
        <div style={{
          marginTop: 8, height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
        }}>
          {/* big background blob */}
          <div style={{
            position: 'absolute', width: 240, height: 240, borderRadius: 999,
            background: 'radial-gradient(circle at 35% 30%, ' + K.tealSoft + ', ' + K.bg + ' 75%)',
          }}/>
          {/* deco leaves */}
          <svg width="340" height="260" viewBox="0 0 340 260" style={{ position: 'absolute' }}>
            <path d="M40 180 C60 170 90 175 110 195" stroke={K.tealLine} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.55"/>
            <path d="M300 80 C280 90 250 90 232 75" stroke={K.tealLine} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.55"/>
            <circle cx="56" cy="60" r="3.5" fill={K.amber} opacity="0.7"/>
            <circle cx="292" cy="200" r="3.5" fill={K.amber} opacity="0.7"/>
          </svg>
          <SeedlingMark size={136} radius={34}/>
        </div>

        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <h1 style={{
            margin: 0, fontFamily: font, fontWeight: 800, fontSize: 32,
            letterSpacing: -0.7, color: K.ink,
          }}>{t.h1}</h1>
          <p style={{
            margin: '12px 0 0', fontFamily: font, fontSize: 16, color: K.ink2,
            fontWeight: 500, lineHeight: 1.5, whiteSpace: 'pre-line',
          }}>{t.sub}</p>
        </div>

        <div style={{ flex: 1 }}/>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Button variant="primary">{t.cta}</Button>
          <button style={{
            height: 44, border: 'none', background: 'transparent',
            color: K.teal, fontFamily: font, fontSize: 15, fontWeight: 700,
            cursor: 'pointer',
          }}>{t.link}</button>
        </div>

        <div style={{
          marginTop: 12, padding: '12px 14px', borderRadius: 10,
          background: K.tealSoft, display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <Icon name="lock" size={18} color={K.teal}/>
          <span style={{ fontFamily: font, fontSize: 12.5, color: K.tealDark, fontWeight: 600, lineHeight: 1.35 }}>
            {t.privacy}
          </span>
        </div>

        <div style={{ height: 34, flexShrink: 0 }}/>
      </div>
    </Phone>
  );
}

// ══════════════════════════════════════════════════════════════════════
// 1.3 COUNTRY SELECTION
// ══════════════════════════════════════════════════════════════════════
function ScreenCountry() {
  const list = [
    { code: 'RU', name: 'Россия',         hint: 'Календарь Минздрава РФ' },
    { code: 'KZ', name: 'Казахстан',      hint: 'Календарь МЗ РК' },
    { code: 'UZ', name: 'Узбекистан',     hint: 'Календарь МЗ РУз' },
    { code: 'AE', name: 'ОАЭ',            hint: 'MoHAP schedule' },
    { code: 'SA', name: 'Саудовская Аравия', hint: 'MoH KSA schedule' },
    { code: 'TR', name: 'Турция',         hint: 'T.C. Sağlık Bakanlığı' },
  ];
  const selected = 'RU';

  return (
    <Phone>
      <NavBar back/>
      <div style={{ padding: '4px 24px 0', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* step indicator */}
        <StepDots step={2} total={4}/>
        <div style={{ height: 16 }}/>
        <ScreenTitle
          title="Где вы находитесь?"
          subtitle="Мы подберём календарь прививок для вашей страны. Можно поменять позже."
        />
        <div style={{ height: 20 }}/>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden' }}>
          {list.map(c => (
            <CountryRow key={c.code} {...c} selected={c.code === selected}/>
          ))}
        </div>

        <div style={{ flex: 1 }}/>
        <div style={{ paddingBottom: 8 }}>
          <Button variant="primary" iconRight="arrowRight">Продолжить</Button>
        </div>
        <div style={{ height: 34, flexShrink: 0 }}/>
      </div>
    </Phone>
  );
}
function CountryRow({ code, name, hint, selected }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '12px 14px', borderRadius: 12,
      background: selected ? K.tealSoft : K.surface,
      border: `1.5px solid ${selected ? K.teal : K.border}`,
    }}>
      <Flag country={code}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: K.ink, letterSpacing: -0.2 }}>{name}</div>
        <div style={{ fontSize: 12, color: K.ink2, marginTop: 1, fontWeight: 500 }}>{hint}</div>
      </div>
      <div style={{
        width: 22, height: 22, borderRadius: 999,
        border: `1.5px solid ${selected ? K.teal : K.border}`,
        background: selected ? K.teal : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {selected && <Icon name="check" size={14} color="#fff" strokeWidth={3}/>}
      </div>
    </div>
  );
}
function StepDots({ step, total }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: i === step - 1 ? 24 : 6, height: 6, borderRadius: 999,
          background: i < step ? K.teal : K.border, transition: 'all .2s',
        }}/>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// 1.4 LANGUAGE SELECTION
// ══════════════════════════════════════════════════════════════════════
function ScreenLanguage() {
  const items = [
    { code: 'ru', native: 'Русский',  en: 'Russian',  dir: 'ltr', selected: true },
    { code: 'ar', native: 'العربية',  en: 'Arabic',   dir: 'rtl', selected: false },
    { code: 'en', native: 'English',  en: 'English',  dir: 'ltr', selected: false },
  ];
  return (
    <Phone>
      <NavBar back/>
      <div style={{ padding: '4px 24px 0', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <StepDots step={3} total={4}/>
        <div style={{ height: 16 }}/>
        <ScreenTitle
          title="Выберите язык"
          subtitle="Подобрали по вашей стране. Можно сменить в любой момент в настройках."
        />
        <div style={{ height: 20 }}/>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map(it => (
            <div key={it.code} style={{
              padding: '16px 16px', borderRadius: 12,
              background: it.selected ? K.tealSoft : K.surface,
              border: `1.5px solid ${it.selected ? K.teal : K.border}`,
              display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, background: K.surface,
                border: `1px solid ${K.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: it.code === 'ar' ? K.fontAr : K.font,
                fontWeight: 800, fontSize: 18, color: K.teal,
              }}>
                {it.code === 'ar' ? 'ع' : it.code === 'ru' ? 'Я' : 'A'}
              </div>
              <div style={{ flex: 1, direction: it.dir }}>
                <div style={{
                  fontSize: 18, fontWeight: 700, color: K.ink,
                  fontFamily: it.code === 'ar' ? K.fontAr : K.font,
                }}>{it.native}</div>
                <div style={{ fontSize: 12, color: K.ink2, marginTop: 1, fontWeight: 500, direction: 'ltr', textAlign: it.dir === 'rtl' ? 'right' : 'left' }}>{it.en}</div>
              </div>
              <div style={{
                width: 22, height: 22, borderRadius: 999,
                border: `1.5px solid ${it.selected ? K.teal : K.border}`,
                background: it.selected ? K.teal : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {it.selected && <Icon name="check" size={14} color="#fff" strokeWidth={3}/>}
              </div>
            </div>
          ))}
        </div>

        <div style={{ flex: 1 }}/>
        <div style={{ paddingBottom: 8 }}>
          <Button variant="primary" iconRight="arrowRight">Продолжить</Button>
        </div>
        <div style={{ height: 34, flexShrink: 0 }}/>
      </div>
    </Phone>
  );
}

// ══════════════════════════════════════════════════════════════════════
// 1.5 ADD FIRST CHILD
// ══════════════════════════════════════════════════════════════════════
function ScreenAddChild() {
  return (
    <Phone>
      <NavBar back/>
      <div style={{ padding: '4px 24px 0', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <StepDots step={4} total={4}/>
        <div style={{ height: 16 }}/>
        <ScreenTitle
          title="Расскажите о ребёнке"
          subtitle="Чтобы построить календарь прививок и кривые роста."
        />
        <div style={{ height: 24 }}/>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, overflow: 'auto' }}>
          <FormField label="Имя" required>
            <input defaultValue="Алина" style={inputStyle}/>
          </FormField>

          <FormField label="Дата рождения" required>
            <div style={{ ...inputStyle, display: 'flex', alignItems: 'center', gap: 10, color: K.ink }}>
              <Icon name="calendar" size={18} color={K.teal}/>
              <span style={{ fontWeight: 600 }}>12 апреля 2024</span>
              <span style={{ marginLeft: 'auto', color: K.ink3, fontSize: 13 }}>1 г 4 мес</span>
            </div>
          </FormField>

          <FormField
            label="Пол при рождении"
            help="Кривые роста ВОЗ построены отдельно для мальчиков и девочек. Это нужно только для них."
          >
            <Segmented options={['Мальчик', 'Девочка', 'Не указывать']} value="Девочка"/>
          </FormField>

          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 10,
            padding: '12px 14px', borderRadius: 10, background: K.tealSoft,
          }}>
            <Icon name="info" size={18} color={K.teal}/>
            <span style={{ fontSize: 12.5, color: K.tealDark, lineHeight: 1.45, fontWeight: 500 }}>
              Можно добавить ещё детей позже. Первый ребёнок — бесплатно навсегда.
            </span>
          </div>

          {/* country confirmation — what schedule will be generated */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 14px', borderRadius: 10,
            background: K.successSoft, border: `1px solid ${K.success}33`,
          }}>
            <Flag country="RU" size={22}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, color: K.ink, fontWeight: 700 }}>
                Календарь будет настроен для России
              </div>
              <div style={{ fontSize: 11.5, color: K.ink2, fontWeight: 600, marginTop: 1 }}>
                По приказу Минздрава РФ № 1122н · 11 прививок до 6 лет
              </div>
            </div>
            <button style={{
              border: 'none', background: 'transparent', padding: 0, cursor: 'pointer',
              fontSize: 12.5, fontWeight: 700, color: K.teal,
            }}>Изменить</button>
          </div>
        </div>

        <div style={{ flex: 1 }}/>
        <div style={{ padding: '12px 0 8px' }}>
          <Button variant="primary">Сохранить</Button>
        </div>
        <div style={{ height: 34, flexShrink: 0 }}/>
      </div>
    </Phone>
  );
}
const inputStyle = {
  width: '100%', height: 48, padding: '0 14px', borderRadius: 8,
  border: `1.5px solid ${K.border}`, background: K.surface,
  fontFamily: K.font, fontSize: 16, fontWeight: 600, color: K.ink, outline: 'none',
  boxSizing: 'border-box',
};
function FormField({ label, help, required, children }) {
  return (
    <div>
      <label style={{
        display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 700, color: K.ink, letterSpacing: 0.05,
      }}>
        {label}{required && <span style={{ color: K.error, marginLeft: 4 }}>*</span>}
      </label>
      {children}
      {help && (
        <div style={{ marginTop: 6, fontSize: 12, color: K.ink2, lineHeight: 1.45, fontWeight: 500 }}>
          {help}
        </div>
      )}
    </div>
  );
}
function Segmented({ options, value }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: `repeat(${options.length}, 1fr)`,
      background: K.border2, borderRadius: 10, padding: 4, gap: 4,
    }}>
      {options.map(o => {
        const sel = o === value;
        return (
          <div key={o} style={{
            height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 7,
            background: sel ? K.surface : 'transparent',
            color: sel ? K.teal : K.ink2,
            fontWeight: sel ? 700 : 600, fontSize: 13.5,
            boxShadow: sel ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            letterSpacing: -0.1,
          }}>{o}</div>
        );
      })}
    </div>
  );
}

Object.assign(window, {
  Phone,
  ScreenSplash, ScreenWelcome, ScreenCountry, ScreenLanguage, ScreenAddChild,
  FormField, Segmented, inputStyle,
});
