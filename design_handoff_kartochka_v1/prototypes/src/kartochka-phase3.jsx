// ──────────────────────────────────────────────────────────────────────
// Kartochka — Phase 3 screens
//   Group 3: 3.1 Paywall · 3.2 PDF preview · 3.3 Success
//   Group 4: 4.1 Settings · 4.2 Privacy · 4.3 Notifications · 4.4 Add 2nd child
//   Group 5: 5.1 Empty · 5.2 Loading · 5.3 Error · 5.4 Offline banner
// ──────────────────────────────────────────────────────────────────────

// ══════════════════════════════════════════════════════════════════════
// PDF thumbnail (small, used in paywall) and full preview (3.2)
// ══════════════════════════════════════════════════════════════════════
function PDFThumb({ width = 220 }) {
  const h = width * 1.414; // A4 ratio
  return (
    <div style={{
      width, height: h, background: '#fff', borderRadius: 8,
      boxShadow: '0 10px 30px rgba(26,46,46,0.18), 0 2px 6px rgba(26,46,46,0.08)',
      overflow: 'hidden', position: 'relative',
      transform: 'rotate(-3deg)',
    }}>
      <PDFContents compact/>
    </div>
  );
}
function PDFContents({ compact = false }) {
  const s = compact ? 0.7 : 1;
  return (
    <div style={{
      width: '100%', height: '100%', padding: 14 * s, boxSizing: 'border-box',
      fontFamily: K.font, color: K.ink, display: 'flex', flexDirection: 'column', gap: 10 * s,
      fontSize: 9 * s,
    }}>
      {/* header bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8 * s, paddingBottom: 8 * s,
        borderBottom: `1.5px solid ${K.teal}`,
      }}>
        <SeedlingMark size={18 * s} radius={4 * s}/>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11 * s, fontWeight: 800, color: K.teal, letterSpacing: 0.3 }}>МЕДКАРТА · KARTOCHKA</div>
          <div style={{ fontSize: 7 * s, color: K.ink2, fontWeight: 600 }}>Сводный отчёт для педиатра · 23 мая 2025</div>
        </div>
      </div>

      {/* child summary */}
      <div>
        <div style={{ fontSize: 13 * s, fontWeight: 800, color: K.ink, letterSpacing: -0.2 }}>Алина Иванова</div>
        <div style={{ fontSize: 7.5 * s, color: K.ink2, fontWeight: 600, marginTop: 2 * s, lineHeight: 1.4 }}>
          Дата рождения: 12 апреля 2024 · Возраст: 1 год 4 месяца<br/>
          Пол: жен. · Календарь: Россия (Приказ № 1122н)
        </div>
      </div>

      {/* vaccines section */}
      <div>
        <div style={{ fontSize: 9 * s, fontWeight: 800, color: K.teal, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 * s }}>
          Прививки · 8 из 16
        </div>
        <div style={{ background: K.bg, borderRadius: 4 * s, overflow: 'hidden' }}>
          {[
            { n: 'БЦЖ-М',          d: '13.04.24', a: 'род.' },
            { n: 'Гепатит B · 1',  d: '13.04.24', a: 'род.' },
            { n: 'Гепатит B · 2',  d: '15.05.24', a: '1 мес' },
            { n: 'Пневмококк · 1', d: '14.06.24', a: '2 мес' },
            { n: 'АКДС · 1',       d: '12.07.24', a: '3 мес' },
          ].map((r, i) => (
            <div key={i} style={{
              display: 'flex', gap: 6 * s, padding: `${3 * s}px ${6 * s}px`,
              fontSize: 7 * s, fontWeight: 600, color: K.ink,
              borderBottom: i < 4 ? `0.5px solid ${K.border2}` : 'none',
            }}>
              <div style={{ flex: 1 }}>{r.n}</div>
              <div style={{ color: K.ink2, width: 30 * s }}>{r.a}</div>
              <div style={{ color: K.ink2, width: 38 * s }}>{r.d}</div>
              <div style={{ color: K.success }}>✓</div>
            </div>
          ))}
        </div>
      </div>

      {/* growth mini */}
      <div>
        <div style={{ fontSize: 9 * s, fontWeight: 800, color: K.teal, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 * s }}>
          Рост и вес
        </div>
        <div style={{ display: 'flex', gap: 6 * s }}>
          <MiniMetric s={s} label="Вес" val="10.4 кг" p="75"/>
          <MiniMetric s={s} label="Рост" val="78 см" p="68"/>
          <MiniMetric s={s} label="Окр." val="46 см" p="60"/>
        </div>
        {/* tiny chart sketch */}
        <svg width="100%" height={36 * s} viewBox="0 0 200 36" style={{ marginTop: 4 * s }}>
          <path d="M0 30 C40 26 80 18 120 14 L160 10 L200 8" stroke={K.tealLine} strokeWidth="1" fill="none" strokeDasharray="2 2"/>
          <path d="M0 30 C40 27 80 22 120 18 L160 15 L200 12" stroke={K.amber} strokeWidth="1.5" fill="none"/>
          {[[0,30],[40,27],[80,22],[120,18],[160,15],[200,12]].map((p,i)=>(
            <circle key={i} cx={p[0]} cy={p[1]} r="1.4" fill={K.amber}/>
          ))}
        </svg>
      </div>

      {/* milestones */}
      <div>
        <div style={{ fontSize: 9 * s, fontWeight: 800, color: K.teal, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 * s }}>
          Развитие · 19 из 26
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 * s }}>
          {['Ходит сам · фев 2025', 'Башенка из 2 кубиков · фев 2025', 'Узнаёт себя в зеркале · мар 2025', '6+ слов · апр 2025'].map((m, i) => (
            <div key={i} style={{ fontSize: 7 * s, fontWeight: 600, color: K.ink, display: 'flex', gap: 4 * s }}>
              <span style={{ color: K.success }}>✓</span><span>{m}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1 }}/>
      <div style={{ fontSize: 6.5 * s, color: K.ink3, fontWeight: 500, textAlign: 'center', paddingTop: 4 * s, borderTop: `0.5px solid ${K.border2}` }}>
        Сформировано Карточка · {new Date().toLocaleDateString('ru-RU')} · стр. 1 из 2
      </div>
    </div>
  );
}
function MiniMetric({ s, label, val, p }) {
  return (
    <div style={{ flex: 1, background: K.bg, padding: `${4 * s}px ${6 * s}px`, borderRadius: 3 * s }}>
      <div style={{ fontSize: 6 * s, color: K.ink2, fontWeight: 700, letterSpacing: 0.3, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: 9 * s, fontWeight: 800, color: K.ink, marginTop: 1 }}>{val}</div>
      <div style={{ fontSize: 6 * s, color: K.success, fontWeight: 700, marginTop: 1 }}>{p}-й</div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// 3.1 PAYWALL — modal sheet over previous screen
// ══════════════════════════════════════════════════════════════════════
function ScreenPaywall({ rtl = false }) {
  const t = rtl
    ? {
        title: 'تقرير\nيُعجِب طبيب الأطفال',
        sub: 'PDF جاهز للزيارة، ومميزات إضافية',
        b1: 'PDF جاهز للطبيب', b1s: 'صفحتان في ٥ ثوانٍ',
        b2: 'حتى ٥ أطفال', b2s: 'في عائلة واحدة',
        b3: 'مشاركة مع شريكك', b3s: 'الوالد الآخر يبقى على اطلاع',
        b4: 'نسخ احتياطي سحابي', b4s: 'لا تفقد أي شيء',
        monthly: 'شهري', yearly: 'سنوي · وفر ٤٨٪',
        priceM: '$3.99', priceMSub: '/الشهر',
        priceY: '$24.99', priceYSub: '/السنة · ~$2.08/شهر',
        cta: 'ابدأ ٧ أيام مجانية',
        ctaSub: 'ثم $24.99/سنة · ألغِ في أي وقت',
        restore: 'استعادة المشتريات',
        terms: 'الشروط · الخصوصية',
      }
    : {
        title: 'Отчёт,\nкоторый оценит\nпедиатр',
        sub: 'PDF за 5 секунд и ещё несколько премиум-функций',
        b1: 'PDF для педиатра',   b1s: '2 страницы за 5 секунд',
        b2: 'До 5 детей',          b2s: 'В одной семье',
        b3: 'Доступ для партнёра', b3s: 'Второй родитель в курсе',
        b4: 'Облачная копия',      b4s: 'Ничего не потеряется',
        monthly: 'Месяц', yearly: 'Год · −48%',
        priceM: '299 ₽', priceMSub: '/мес',
        priceY: '1 890 ₽', priceYSub: '/год · ~158 ₽/мес',
        cta: 'Начать 7 дней бесплатно',
        ctaSub: 'Затем 1 890 ₽/год · отмена в любой момент',
        restore: 'Восстановить покупки',
        terms: 'Условия · Конфиденциальность',
      };
  const font = rtl ? K.fontAr : K.font;

  return (
    <Phone bg="#1A2E2E">
      {/* dim of underlying screen */}
      <div style={{
        position: 'absolute', inset: 0, background: 'rgba(26,46,46,0.6)', zIndex: 1,
      }}/>
      {/* sheet */}
      <div style={{
        position: 'absolute', top: 70, left: 0, right: 0, bottom: 0, zIndex: 2,
        background: K.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24,
        boxShadow: '0 -10px 30px rgba(0,0,0,0.2)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        direction: rtl ? 'rtl' : 'ltr', fontFamily: font,
      }}>
        {/* grabber */}
        <div style={{
          height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <div style={{ width: 36, height: 4, borderRadius: 999, background: K.border }}/>
        </div>
        {/* close + restore */}
        <div style={{
          position: 'absolute', top: 18, right: rtl ? 'auto' : 14, left: rtl ? 14 : 'auto', zIndex: 3,
        }}>
          <button style={{
            width: 32, height: 32, borderRadius: 999, border: 'none', background: K.border2,
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0,
          }}>
            <Icon name="plus" size={18} color={K.ink} strokeWidth={2.5} style={{ transform: 'rotate(45deg)' }}/>
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 16px' }}>

          {/* hero — PDF thumb */}
          <div style={{
            height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', marginBottom: 14,
          }}>
            <div style={{
              position: 'absolute', width: 280, height: 200, borderRadius: 999,
              background: 'radial-gradient(circle, ' + K.amberSoft + ' 0%, ' + K.bg + ' 70%)',
            }}/>
            <PDFThumb width={150}/>
          </div>

          {/* title */}
          <h1 style={{
            margin: 0, fontFamily: font, fontWeight: 800, fontSize: 30, letterSpacing: -0.7,
            color: K.ink, lineHeight: 1.1, whiteSpace: 'pre-line', textAlign: rtl ? 'right' : 'left',
          }}>{t.title}</h1>
          <p style={{
            margin: '10px 0 18px', fontSize: 15, color: K.ink2, fontWeight: 600,
            lineHeight: 1.5, textAlign: rtl ? 'right' : 'left',
          }}>{t.sub}</p>

          {/* benefits */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
            <Benefit icon="fileText" iconBg={K.amber} title={t.b1} sub={t.b1s}/>
            <Benefit icon="user"     iconBg={K.teal}  title={t.b2} sub={t.b2s}/>
            <Benefit icon="share"    iconBg={K.teal}  title={t.b3} sub={t.b3s}/>
            <Benefit icon="cloud"    iconBg={K.teal}  title={t.b4} sub={t.b4s}/>
          </div>

          {/* plan toggle */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
            <PlanCard
              selected
              label={t.yearly}
              price={t.priceY}
              priceSub={t.priceYSub}
              badge="−48%"
              rtl={rtl}
            />
            <PlanCard
              label={t.monthly}
              price={t.priceM}
              priceSub={t.priceMSub}
              rtl={rtl}
            />
          </div>
        </div>

        {/* footer CTA */}
        <div style={{
          flexShrink: 0, padding: '12px 20px 0',
          borderTop: `1px solid ${K.border}`, background: K.surface,
        }}>
          <Button variant="amber" size="lg">{t.cta}</Button>
          <div style={{
            marginTop: 8, fontSize: 11.5, color: K.ink2, fontWeight: 600,
            textAlign: 'center',
          }}>{t.ctaSub}</div>
          <div style={{
            marginTop: 10, display: 'flex', justifyContent: 'center', gap: 18,
            fontSize: 11.5, color: K.ink3, fontWeight: 700,
          }}>
            <span>{t.restore}</span>
            <span>·</span>
            <span>{t.terms}</span>
          </div>
          <div style={{ height: 34, flexShrink: 0 }}/>
        </div>
      </div>
    </Phone>
  );
}
function Benefit({ icon, iconBg, title, sub }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{
        width: 38, height: 38, borderRadius: 10, background: iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon name={icon} size={20} color="#fff"/>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: K.ink, letterSpacing: -0.2 }}>{title}</div>
        <div style={{ fontSize: 12.5, color: K.ink2, fontWeight: 600, marginTop: 1 }}>{sub}</div>
      </div>
    </div>
  );
}
function PlanCard({ selected, label, price, priceSub, badge, rtl }) {
  return (
    <div style={{
      position: 'relative', padding: '14px 16px', borderRadius: 12,
      border: `2px solid ${selected ? K.amber : K.border}`,
      background: selected ? '#FFFDF8' : K.surface,
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{
        width: 22, height: 22, borderRadius: 999,
        border: `1.5px solid ${selected ? K.amber : K.border}`,
        background: selected ? K.amber : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        {selected && <Icon name="check" size={14} color="#1A2E2E" strokeWidth={3}/>}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14.5, fontWeight: 800, color: K.ink }}>{label}</div>
        <div style={{ fontSize: 12, color: K.ink2, fontWeight: 600, marginTop: 1 }}>{priceSub}</div>
      </div>
      <div style={{ textAlign: rtl ? 'left' : 'right' }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: K.ink, letterSpacing: -0.3 }}>{price}</div>
        {badge && (
          <div style={{
            display: 'inline-flex', marginTop: 2,
            padding: '2px 6px', borderRadius: 4,
            background: K.amber, color: K.ink, fontSize: 10, fontWeight: 800, letterSpacing: 0.3,
          }}>{badge}</div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// 3.2 PDF preview (premium user)
// ══════════════════════════════════════════════════════════════════════
function ScreenPDFPreview() {
  return (
    <Phone bg="#EDEAE2">
      <NavBar back title="PDF · 2 страницы" right={
        <button style={navBtnInline}><Icon name="share" size={20} color={K.ink}/></button>
      }/>
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        {/* page 1 */}
        <div style={{
          width: 320, height: 320 * 1.414, background: '#fff', borderRadius: 6,
          boxShadow: '0 10px 30px rgba(26,46,46,0.18), 0 2px 6px rgba(26,46,46,0.08)',
          overflow: 'hidden',
        }}>
          <PDFContents/>
        </div>

        <div style={{ fontSize: 11.5, color: K.ink3, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase' }}>
          стр. 1 из 2
        </div>

        {/* page 2 preview (cut off) */}
        <div style={{
          width: 320, height: 200, background: '#fff', borderRadius: 6,
          boxShadow: '0 10px 30px rgba(26,46,46,0.18)',
          padding: 14, boxSizing: 'border-box', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 8,
            borderBottom: `1.5px solid ${K.teal}`,
          }}>
            <SeedlingMark size={16} radius={3}/>
            <div style={{ flex: 1, fontSize: 9, fontWeight: 800, color: K.teal, letterSpacing: 0.3 }}>МЕДКАРТА · KARTOCHKA · стр. 2</div>
          </div>
          <div style={{ marginTop: 10, fontSize: 9, fontWeight: 800, color: K.teal, letterSpacing: 0.5, textTransform: 'uppercase' }}>
            Развитие · 19 из 26
          </div>
          <div style={{ marginTop: 6, columnCount: 2, columnGap: 12, fontSize: 7.5 }}>
            {['Первая улыбка', 'Голова на животе', 'Переворот со спины', 'Сидит сам', 'Первое слово', 'Первые шаги', 'Башенка', 'Зеркало', '6+ слов', 'Указывает на части тела'].map((m,i) => (
              <div key={i} style={{ fontWeight: 600, color: K.ink, marginBottom: 2 }}>
                <span style={{ color: K.success, marginRight: 3 }}>✓</span>{m}
              </div>
            ))}
          </div>
          <div style={{
            position: 'absolute', left: 0, right: 0, bottom: 0, height: 60,
            background: 'linear-gradient(180deg, transparent, #EDEAE2)',
          }}/>
        </div>
      </div>

      <div style={{ padding: '12px 20px 0', borderTop: `1px solid ${K.border}`, background: K.surface, flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="secondary" icon="download">Сохранить</Button>
          <Button variant="primary" icon="share">Поделиться</Button>
        </div>
        <div style={{ height: 34, flexShrink: 0 }}/>
      </div>
    </Phone>
  );
}

// ══════════════════════════════════════════════════════════════════════
// 3.3 SUBSCRIPTION SUCCESS
// ══════════════════════════════════════════════════════════════════════
function ScreenSubSuccess() {
  return (
    <Phone>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 24px' }}>
        <div style={{ height: 12 }}/>
        {/* hero */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 18, position: 'relative',
        }}>
          {/* radial bg */}
          <div style={{
            position: 'absolute', width: 280, height: 280, borderRadius: 999,
            background: 'radial-gradient(circle, ' + K.amberSoft + ' 0%, transparent 70%)',
          }}/>
          {/* checkmark over seedling */}
          <div style={{ position: 'relative' }}>
            <SeedlingMark size={120} radius={30}/>
            <div style={{
              position: 'absolute', bottom: -8, right: -8,
              width: 44, height: 44, borderRadius: 999, background: K.amber,
              border: '4px solid ' + K.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="check" size={22} color={K.ink} strokeWidth={3}/>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, color: K.ink, letterSpacing: -0.6 }}>
              Премиум активен
            </h1>
            <p style={{ margin: '10px 0 0', fontSize: 15, color: K.ink2, fontWeight: 600, lineHeight: 1.5 }}>
              7 дней бесплатно, затем 1 890 ₽ в год.<br/>
              Следующий платёж: <strong style={{ color: K.ink }}>23 мая 2026</strong>
            </p>
          </div>
        </div>

        {/* unlock list */}
        <Card style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: K.ink2, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 10 }}>
            Открыто
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              'PDF для педиатра',
              'До 5 детей в одной семье',
              'Совместный доступ для партнёра',
              'Облачная резервная копия',
            ].map((u, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 999, background: K.success,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon name="check" size={14} color="#fff" strokeWidth={3}/>
                </div>
                <span style={{ fontSize: 14.5, color: K.ink, fontWeight: 700 }}>{u}</span>
              </div>
            ))}
          </div>
        </Card>

        <Button variant="primary" iconRight="arrowRight">Создать первый PDF</Button>
        <div style={{ height: 8 }}/>
        <button style={{
          height: 44, border: 'none', background: 'transparent', color: K.ink2,
          fontFamily: K.font, fontSize: 14, fontWeight: 700, cursor: 'pointer',
        }}>На главную</button>
        <div style={{ height: 34, flexShrink: 0 }}/>
      </div>
    </Phone>
  );
}

// ══════════════════════════════════════════════════════════════════════
// 4.1 SETTINGS
// ══════════════════════════════════════════════════════════════════════
function ScreenSettings() {
  return (
    <Phone>
      <NavBar title="Настройки"/>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* subscription banner */}
        <div style={{
          padding: '14px 16px', borderRadius: 12,
          background: 'linear-gradient(135deg, ' + K.teal + ', ' + K.tealDark + ')',
          color: '#fff', display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <SeedlingMark size={36} bg="rgba(255,255,255,0.18)" leaf="#fff" radius={9}/>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: -0.2 }}>Бесплатный план</div>
            <div style={{ fontSize: 12.5, opacity: 0.85, fontWeight: 600, marginTop: 1 }}>
              1 ребёнок · ведение записей
            </div>
          </div>
          <button style={{
            height: 32, padding: '0 14px', borderRadius: 8,
            background: K.amber, color: K.ink, border: 'none', fontFamily: K.font,
            fontSize: 13, fontWeight: 800, cursor: 'pointer',
          }}>Premium</button>
        </div>

        <SettingsGroup label="Дети">
          <SettingsRow icon="user" iconBg={K.tealSoft} iconColor={K.teal} title="Алина" subtitle="1 год 4 месяца · ж"/>
          <SettingsRow icon="plus" iconBg={K.border2} iconColor={K.ink2} title="Добавить ребёнка" right={<LockBadge/>}/>
        </SettingsGroup>

        <SettingsGroup label="Приложение">
          <SettingsRow icon="globe"    iconBg={K.tealSoft} iconColor={K.teal} title="Язык"     detail="Русский"/>
          <SettingsRow icon="shield"   iconBg={K.tealSoft} iconColor={K.teal} title="Страна"   detail="Россия 🇷🇺"/>
          <SettingsRow icon="bell"     iconBg={K.tealSoft} iconColor={K.teal} title="Уведомления" detail="4 включено"/>
        </SettingsGroup>

        <SettingsGroup label="Безопасность">
          <SettingsRow icon="lock"  iconBg={K.tealSoft} iconColor={K.teal} title="Конфиденциальность и данные"/>
          <SettingsRow icon="cloud" iconBg={K.tealSoft} iconColor={K.teal} title="Резервное копирование" right={<LockBadge/>}/>
        </SettingsGroup>

        <SettingsGroup label="Подписка">
          <SettingsRow icon="sparkle" iconBg={K.amberSoft} iconColor={K.amberDk} title="Управление подпиской"/>
          <SettingsRow icon="info"    iconBg={K.tealSoft}  iconColor={K.teal}    title="О приложении" detail="v1.0.0"/>
          <SettingsRow icon="user"    iconBg={K.tealSoft}  iconColor={K.teal}    title="Связаться с нами"/>
        </SettingsGroup>

        <div style={{ textAlign: 'center', padding: '12px 0 0', fontSize: 11.5, color: K.ink3, fontWeight: 600 }}>
          Сделано с заботой о ваших детях
        </div>
      </div>
      <TabBar active="settings"/>
      <HomeIndicator/>
    </Phone>
  );
}
function SettingsGroup({ label, children }) {
  return (
    <div>
      <div style={{
        padding: '0 14px 8px', fontSize: 11.5, fontWeight: 800, color: K.ink2,
        letterSpacing: 0.5, textTransform: 'uppercase',
      }}>{label}</div>
      <div style={{
        background: K.surface, border: `1px solid ${K.border}`, borderRadius: 12, overflow: 'hidden',
      }}>{children}</div>
    </div>
  );
}
function SettingsRow({ icon, iconBg, iconColor, title, subtitle, detail, right }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
      borderBottom: `1px solid ${K.border2}`,
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8, background: iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon name={icon} size={18} color={iconColor}/>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: K.ink }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12.5, color: K.ink2, fontWeight: 600, marginTop: 1 }}>{subtitle}</div>}
      </div>
      {detail && <span style={{ fontSize: 13.5, color: K.ink2, fontWeight: 600 }}>{detail}</span>}
      {right}
      <Icon name="chevronRight" size={18} color={K.ink3}/>
    </div>
  );
}
function LockBadge() {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 8px', borderRadius: 999,
      background: K.amberSoft, color: K.amberDk, fontSize: 11, fontWeight: 800, letterSpacing: 0.3,
    }}>
      <Icon name="lock" size={11} color={K.amberDk}/>
      PRO
    </span>
  );
}

// ══════════════════════════════════════════════════════════════════════
// 4.2 PRIVACY & DATA
// ══════════════════════════════════════════════════════════════════════
function ScreenPrivacy() {
  return (
    <Phone>
      <NavBar back title="Данные и приватность"/>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* reassurance hero */}
        <div style={{
          padding: 18, borderRadius: 14, background: K.tealSoft,
          display: 'flex', gap: 14, alignItems: 'center',
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14, background: K.teal,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Icon name="lock" size={28} color="#fff"/>
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: K.tealDark, letterSpacing: -0.2 }}>На вашем устройстве</div>
            <div style={{ fontSize: 12.5, color: K.tealDark, fontWeight: 600, lineHeight: 1.45, marginTop: 2 }}>
              По умолчанию данные ребёнка не покидают телефон. Облако и аналитика — только по вашему согласию.
            </div>
          </div>
        </div>

        <SettingsGroup label="Сохранение">
          <ToggleRow icon="cloud" title="Облачное резервное копирование" subtitle="Шифрование end-to-end" on={false} pro/>
          <ToggleRow icon="activity" title="Анонимная статистика" subtitle="Помогает нам улучшать приложение" on={true}/>
        </SettingsGroup>

        <SettingsGroup label="Ваши данные">
          <SettingsRow icon="download" iconBg={K.tealSoft} iconColor={K.teal} title="Экспорт всех данных" subtitle="ZIP с фото и записями"/>
          <SettingsRow icon="trash"    iconBg={K.errorSoft} iconColor={K.error} title="Удалить все данные" subtitle="Действие необратимо"/>
        </SettingsGroup>

        <div style={{
          padding: '12px 14px', background: K.surface, border: `1px solid ${K.border}`, borderRadius: 10,
          fontSize: 12.5, color: K.ink2, fontWeight: 500, lineHeight: 1.5,
        }}>
          Подробнее в <span style={{ color: K.teal, fontWeight: 700 }}>Политике конфиденциальности</span> и <span style={{ color: K.teal, fontWeight: 700 }}>Условиях использования</span>.
        </div>
      </div>
      <HomeIndicator/>
    </Phone>
  );
}
function ToggleRow({ icon, title, subtitle, on, pro }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
      borderBottom: `1px solid ${K.border2}`,
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8, background: K.tealSoft,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon name={icon} size={18} color={K.teal}/>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: K.ink }}>{title}</span>
          {pro && <LockBadge/>}
        </div>
        {subtitle && <div style={{ fontSize: 12.5, color: K.ink2, fontWeight: 600, marginTop: 1 }}>{subtitle}</div>}
      </div>
      <Toggle on={on}/>
    </div>
  );
}
function Toggle({ on }) {
  return (
    <div style={{
      width: 44, height: 26, borderRadius: 999,
      background: on ? K.teal : K.border,
      padding: 2, boxSizing: 'border-box',
      display: 'flex', alignItems: 'center',
      justifyContent: on ? 'flex-end' : 'flex-start',
      transition: 'all .2s',
    }}>
      <div style={{
        width: 22, height: 22, borderRadius: 999, background: '#fff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }}/>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// 4.3 NOTIFICATIONS
// ══════════════════════════════════════════════════════════════════════
function ScreenNotifications() {
  return (
    <Phone>
      <NavBar back title="Уведомления"/>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        <div style={{
          padding: '14px 16px', borderRadius: 12, background: K.tealSoft,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <Icon name="bell" size={24} color={K.teal}/>
          <div style={{ flex: 1, fontSize: 13, color: K.tealDark, fontWeight: 600, lineHeight: 1.45 }}>
            Мы напомним о прививке заранее. Никакого спама и маркетинга.
          </div>
        </div>

        <SettingsGroup label="Напоминания о прививках">
          <ToggleRow icon="calendar" title="За 14 дней" subtitle="Время записаться к врачу" on={true}/>
          <ToggleRow icon="calendar" title="За 7 дней"  subtitle="Финальное планирование" on={true}/>
          <ToggleRow icon="clock"    title="За 1 день"  subtitle="Утром накануне" on={true}/>
          <ToggleRow icon="bell"     title="В день прививки" subtitle="9:00 утра, локально" on={true}/>
        </SettingsGroup>

        <SettingsGroup label="Развитие">
          <ToggleRow icon="star" title="Новый возрастной этап" subtitle="Когда открываются новые навыки" on={true}/>
          <ToggleRow icon="activity" title="Пора измерить рост и вес" subtitle="Раз в месяц до 2 лет" on={false}/>
        </SettingsGroup>

        <Button variant="ghost" icon="bell">Отправить тестовое</Button>
      </div>
      <HomeIndicator/>
    </Phone>
  );
}

// ══════════════════════════════════════════════════════════════════════
// 4.4 ADD SECOND CHILD (premium gate)
// ══════════════════════════════════════════════════════════════════════
function ScreenAddSecondChild() {
  return (
    <Phone>
      <NavBar back title="Второй ребёнок"/>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 16px' }}>

        {/* premium gate */}
        <div style={{
          marginTop: 4, padding: 20, borderRadius: 16,
          background: 'linear-gradient(135deg, #FFFDF8, ' + K.amberSoft + ')',
          border: `1px solid ${K.amber}`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 12,
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14, background: K.amber,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="lock" size={26} color={K.ink}/>
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: K.ink, letterSpacing: -0.4 }}>
              До 5 детей в одной семье
            </h1>
            <p style={{ margin: '8px 0 0', fontSize: 14, color: K.ink2, fontWeight: 600, lineHeight: 1.5 }}>
              Бесплатно — один ребёнок. С Premium можно вести медкарту для каждого, и переключаться одним касанием.
            </p>
          </div>
          <Button variant="amber" iconRight="arrowRight">Попробовать 7 дней бесплатно</Button>
        </div>

        {/* preview of the form (dimmed) */}
        <div style={{ marginTop: 22, position: 'relative' }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: K.ink2, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 12 }}>
            Так это будет выглядеть
          </div>
          <div style={{ opacity: 0.55, pointerEvents: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <FormField label="Имя">
              <div style={{ ...inputStyle, color: K.ink3 }}>Имя второго ребёнка</div>
            </FormField>
            <FormField label="Дата рождения">
              <div style={{ ...inputStyle, display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon name="calendar" size={18} color={K.ink3}/>
                <span style={{ color: K.ink3, fontWeight: 600 }}>—</span>
              </div>
            </FormField>
            <FormField label="Пол при рождении">
              <Segmented options={['Мальчик', 'Девочка', 'Не указывать']} value={null}/>
            </FormField>
          </div>
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 12,
            background: 'linear-gradient(180deg, transparent 30%, ' + K.bg + ' 90%)',
            pointerEvents: 'none',
          }}/>
        </div>
      </div>
      <HomeIndicator/>
    </Phone>
  );
}

// ══════════════════════════════════════════════════════════════════════
// 5.1 EMPTY STATE — home with no child yet
// ══════════════════════════════════════════════════════════════════════
function ScreenEmptyHome() {
  return (
    <Phone>
      <NavBar title="Карточка" right={
        <button style={navBtnInline}><Icon name="settings" size={22} color={K.ink}/></button>
      }/>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '0 24px', gap: 20 }}>

        {/* illustration: card growing seedling */}
        <div style={{ position: 'relative', width: 200, height: 200 }}>
          <div style={{
            position: 'absolute', width: 200, height: 200, borderRadius: 999,
            background: 'radial-gradient(circle, ' + K.tealSoft + ' 0%, transparent 70%)',
          }}/>
          {/* a record card with a seedling growing out of it */}
          <svg viewBox="0 0 200 200" width="200" height="200" style={{ position: 'relative' }}>
            <rect x="40" y="80" width="120" height="100" rx="10" fill="#fff" stroke={K.border} strokeWidth="2"/>
            <rect x="40" y="80" width="120" height="20" rx="10" fill={K.teal}/>
            <rect x="40" y="94" width="120" height="6" fill={K.teal}/>
            <rect x="52" y="118" width="60" height="6" rx="3" fill={K.border}/>
            <rect x="52" y="132" width="80" height="6" rx="3" fill={K.border}/>
            <rect x="52" y="146" width="50" height="6" rx="3" fill={K.border}/>
            <rect x="52" y="160" width="70" height="6" rx="3" fill={K.border}/>
            {/* seedling growing from card top */}
            <path d="M100 80 L100 30" stroke={K.teal} strokeWidth="6" strokeLinecap="round" fill="none"/>
            <path d="M100 45 C82 32 60 32 52 18 C66 10 90 14 100 32 Z" fill={K.teal}/>
            <path d="M100 38 C118 22 140 22 150 8 C146 0 116 -4 100 22 Z" fill={K.teal}/>
            <circle cx="100" cy="20" r="6" fill={K.amber}/>
          </svg>
        </div>

        <div style={{ textAlign: 'center' }}>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: K.ink, letterSpacing: -0.5 }}>
            Добавьте первого ребёнка
          </h1>
          <p style={{ margin: '10px 0 0', fontSize: 15, color: K.ink2, fontWeight: 600, lineHeight: 1.5, maxWidth: 280 }}>
            Имя и дата рождения — этого хватит, чтобы построить календарь и кривые роста.
          </p>
        </div>

        <Button variant="primary" iconRight="arrowRight">Добавить ребёнка</Button>
      </div>
      <TabBar active="home"/>
      <HomeIndicator/>
    </Phone>
  );
}

// ══════════════════════════════════════════════════════════════════════
// 5.2 LOADING — skeleton on home
// ══════════════════════════════════════════════════════════════════════
function ScreenLoading() {
  const Sk = ({ w = '100%', h = 12, r = 6, mt = 0, mb = 0 }) => (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: 'linear-gradient(90deg, #ECEEEC, #F4F5F4, #ECEEEC)',
      backgroundSize: '200% 100%', marginTop: mt, marginBottom: mb,
    }}/>
  );
  return (
    <Phone>
      <style>{`
        @keyframes shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }
      `}</style>
      {/* header skeleton */}
      <div style={{ padding: '8px 20px 0', display: 'flex', alignItems: 'center', gap: 14 }}>
        <Sk w={48} h={48} r={999}/>
        <div style={{ flex: 1 }}>
          <Sk w={80} h={10}/>
          <Sk w={140} h={18} mt={6} r={6}/>
        </div>
        <Sk w={40} h={40} r={999}/>
      </div>

      <div style={{ padding: '20px 20px 0', display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            background: K.surface, border: `1px solid ${K.border}`, borderRadius: 12, padding: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <Sk w={32} h={32} r={8}/>
              <Sk w={100} h={12}/>
            </div>
            <Sk w="70%" h={18} mb={6}/>
            <Sk w="50%" h={12} mb={12}/>
            {i === 1 && <Sk w="100%" h={56} r={8}/>}
            {i === 2 && (
              <>
                <Sk w="60%" h={12} mb={6}/>
                <Sk w="80%" h={12}/>
              </>
            )}
          </div>
        ))}
        <div style={{ padding: '4px 0', textAlign: 'center', fontSize: 12, color: K.ink3, fontWeight: 700 }}>
          Подгружаем данные…
        </div>
      </div>
      <TabBar active="home"/>
      <HomeIndicator/>
    </Phone>
  );
}

// ══════════════════════════════════════════════════════════════════════
// 5.3 ERROR
// ══════════════════════════════════════════════════════════════════════
function ScreenError() {
  return (
    <Phone>
      <NavBar back/>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '0 32px', gap: 20 }}>
        <div style={{ position: 'relative' }}>
          <div style={{
            position: 'absolute', width: 180, height: 180, borderRadius: 999,
            background: 'radial-gradient(circle, ' + K.errorSoft + ' 0%, transparent 70%)',
            top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          }}/>
          <div style={{
            position: 'relative', width: 88, height: 88, borderRadius: 22,
            background: K.errorSoft, border: `2px solid ${K.error}33`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="wifiOff" size={42} color={K.error}/>
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: K.ink, letterSpacing: -0.4 }}>
            Что-то пошло не так
          </h1>
          <p style={{ margin: '10px 0 0', fontSize: 15, color: K.ink2, fontWeight: 600, lineHeight: 1.5 }}>
            Не удалось обновить данные. Это могло произойти из-за проблем с сетью —
            данные ребёнка в безопасности на устройстве.
          </p>
        </div>
        <div style={{ width: '100%', maxWidth: 280, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Button variant="primary">Повторить</Button>
          <Button variant="ghost">Связаться с поддержкой</Button>
        </div>
      </div>
      <HomeIndicator/>
    </Phone>
  );
}

// ══════════════════════════════════════════════════════════════════════
// 5.4 OFFLINE — home with offline banner
// ══════════════════════════════════════════════════════════════════════
function ScreenOffline() {
  return (
    <Phone>
      {/* banner */}
      <div style={{
        margin: '0 16px 8px', padding: '10px 14px', borderRadius: 10,
        background: K.warningSoft, border: `1px solid ${K.warning}55`,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <Icon name="wifiOff" size={18} color={K.amberDk}/>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: K.amberDk }}>Без подключения</div>
          <div style={{ fontSize: 11.5, color: K.amberDk, fontWeight: 600, marginTop: 1 }}>
            Данные сохраняются локально и синхронизируются позже.
          </div>
        </div>
      </div>

      <ChildHeader/>
      <div style={{ padding: '16px 20px 0', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Card p={0} style={{ overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px 10px', borderBottom: `1px solid ${K.border2}` }}>
            <div style={iconChip(K.teal)}><Icon name="syringe" size={20} color="#fff"/></div>
            <span style={{ fontSize: 13, fontWeight: 700, color: K.ink2, letterSpacing: 0.4, textTransform: 'uppercase' }}>Следующая прививка</span>
            <span style={{ marginInlineStart: 'auto' }}><Pill tone="warning" size="sm">через 12 дн</Pill></span>
          </div>
          <div style={{ padding: '14px 16px 16px' }}>
            <div style={{ fontSize: 19, fontWeight: 800, color: K.ink, letterSpacing: -0.3 }}>АКДС · ревакцинация</div>
            <div style={{ marginTop: 4, fontSize: 13.5, color: K.ink2, fontWeight: 600 }}>23 мая · в 18 месяцев</div>
          </div>
        </Card>
        <Card p={0} style={{ overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px 10px', borderBottom: `1px solid ${K.border2}` }}>
            <div style={iconChip(K.success)}><Icon name="activity" size={20} color="#fff"/></div>
            <span style={{ fontSize: 13, fontWeight: 700, color: K.ink2, letterSpacing: 0.4, textTransform: 'uppercase' }}>Рост</span>
            <span style={{ marginInlineStart: 'auto', fontSize: 12, color: K.ink3, fontWeight: 600 }}>2 нед назад</span>
          </div>
          <div style={{ padding: '14px 16px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}>
              <Metric label="Вес" value="10.4" unit="кг"/>
              <Metric label="Рост" value="78" unit="см"/>
            </div>
          </div>
        </Card>
      </div>
      <TabBar active="home"/>
      <HomeIndicator/>
    </Phone>
  );
}

Object.assign(window, {
  ScreenPaywall, ScreenPDFPreview, ScreenSubSuccess,
  ScreenSettings, ScreenPrivacy, ScreenNotifications, ScreenAddSecondChild,
  ScreenEmptyHome, ScreenLoading, ScreenError, ScreenOffline,
});
