// ──────────────────────────────────────────────────────────────────────
// Kartochka — main app screens (Group 2)
//   2.1 Home · 2.2 Vaccine timeline · 2.3 Vaccine detail
//   2.4 Growth · 2.5 Milestones
// ──────────────────────────────────────────────────────────────────────

// ══════════════════════════════════════════════════════════════════════
// Shared header — child summary chip used on home + as context elsewhere
// ══════════════════════════════════════════════════════════════════════
function ChildHeader({ rtl = false }) {
  const t = rtl
    ? { name: 'علينا', age: 'سنة و 4 أشهر', greeting: 'مرحبًا،' }
    : { name: 'Алина', age: '1 год 4 месяца', greeting: 'Добрый день,' };
  const font = rtl ? K.fontAr : K.font;
  return (
    <div style={{
      padding: '8px 20px 0', display: 'flex', alignItems: 'center', gap: 14,
      direction: rtl ? 'rtl' : 'ltr',
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 999,
        background: K.tealSoft, border: `1.5px solid ${K.tealLine}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: font, fontWeight: 800, fontSize: 20, color: K.teal,
      }}>А</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12.5, color: K.ink2, fontWeight: 600, fontFamily: font }}>{t.greeting}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: K.ink, letterSpacing: -0.4, fontFamily: font }}>{t.name}</span>
          <span style={{ fontSize: 13, color: K.ink2, fontWeight: 600, fontFamily: font }}>· {t.age}</span>
        </div>
      </div>
      <button style={{
        width: 40, height: 40, borderRadius: 999, border: `1px solid ${K.border}`,
        background: K.surface, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
      }}>
        <Icon name="bell" size={20} color={K.ink}/>
      </button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// 2.1 HOME / DASHBOARD
// ══════════════════════════════════════════════════════════════════════
function ScreenHome({ rtl = false }) {
  const t = rtl
    ? {
        nextVacc: 'التطعيم القادم', vaccName: 'تطعيم ثلاثي معزز · جرعة منشطة',
        dueIn: 'بعد ١٢ يومًا', dueOn: '٢٣ مايو', age: 'في ١٨ شهرًا',
        growth: 'النمو', weight: 'الوزن', height: 'الطول',
        percentile: 'المئوي ٧٥ · معايير منظمة الصحة',
        ms: 'النماء', recent: 'الأخير', nextExpected: 'القادم',
        recentItem: 'الخطوات الأولى ✓', nextItem: 'جمل من كلمتين',
        export: 'تصدير PDF للطبيب', exportSub: '٥ تطعيمات، نمو، نماء',
      }
    : {
        nextVacc: 'Следующая прививка', vaccName: 'АКДС · ревакцинация',
        dueIn: 'через 12 дней', dueOn: '23 мая', age: 'в 18 месяцев',
        growth: 'Рост', weight: 'Вес', height: 'Рост',
        percentile: '75-й перцентиль · ВОЗ',
        ms: 'Развитие', recent: 'Недавно', nextExpected: 'Скоро',
        recentItem: 'Первые шаги ✓', nextItem: 'Фразы из 2 слов',
        export: 'PDF для педиатра', exportSub: '5 прививок, рост, развитие',
      };
  const font = rtl ? K.fontAr : K.font;

  return (
    <Phone>
      <ChildHeader rtl={rtl}/>
      <div style={{
        padding: '16px 20px 0', flex: 1, overflowY: 'auto',
        display: 'flex', flexDirection: 'column', gap: 10,
        direction: rtl ? 'rtl' : 'ltr', fontFamily: font,
      }}>

        {/* CARD 1 — next vaccination */}
        <Card p={14}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={iconChip(K.teal)}>
              <Icon name="syringe" size={18} color="#fff"/>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: K.ink2, letterSpacing: 0.4, textTransform: 'uppercase' }}>{t.nextVacc}</span>
            <span style={{ marginInlineStart: 'auto' }}><Pill tone="warning" size="sm">{t.dueIn}</Pill></span>
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: K.ink, letterSpacing: -0.3, lineHeight: 1.2 }}>{t.vaccName}</div>
          <div style={{ marginTop: 2, fontSize: 13, color: K.ink2, fontWeight: 600 }}>
            {t.dueOn} · {t.age}
          </div>
          <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
            <Button variant="ghost" size="sm" full={false}>Подробнее</Button>
            <Button variant="primary" size="sm" full={false} icon="check">Отметить</Button>
          </div>
        </Card>

        {/* CARD 2 — growth */}
        <Card p={14}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={iconChip(K.success)}>
              <Icon name="activity" size={18} color="#fff"/>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: K.ink2, letterSpacing: 0.4, textTransform: 'uppercase' }}>{t.growth}</span>
            <span style={{ marginInlineStart: 'auto', fontSize: 11.5, color: K.ink3, fontWeight: 600 }}>2 нед назад</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}>
            <Metric label={t.weight} value="10.4" unit="кг"/>
            <Metric label={t.height} value="78" unit="см"/>
          </div>
          <div style={{ marginTop: 10 }}>
            <PercentileBar value={75}/>
            <div style={{ marginTop: 12, fontSize: 12, color: K.ink2, fontWeight: 600 }}>{t.percentile}</div>
          </div>
        </Card>

        {/* CARD 3 — milestones */}
        <Card p={14}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={iconChip(K.amber)}>
              <Icon name="star" size={18} color="#fff"/>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: K.ink2, letterSpacing: 0.4, textTransform: 'uppercase' }}>{t.ms}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <MilestoneRow tone="success" label={t.recent} body={t.recentItem}/>
            <MilestoneRow tone="neutral" label={t.nextExpected} body={t.nextItem}/>
          </div>
        </Card>

        {/* PDF export CTA */}
        <button style={{
          marginTop: 2, width: '100%', textAlign: rtl ? 'right' : 'left',
          background: K.amberSoft, border: `1px solid ${K.amber}`, borderRadius: 12,
          padding: '12px 14px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={iconChip(K.amber)}>
            <Icon name="fileText" size={18} color="#fff"/>
          </div>
          <div style={{ flex: 1, textAlign: rtl ? 'right' : 'left' }}>
            <div style={{ fontSize: 14.5, fontWeight: 800, color: K.amberDk, fontFamily: font }}>{t.export}</div>
            <div style={{ fontSize: 12, color: K.amberDk, fontWeight: 600, marginTop: 1, opacity: 0.85, fontFamily: font }}>{t.exportSub}</div>
          </div>
          <Icon name={rtl ? 'chevronLeft' : 'chevronRight'} size={18} color={K.amberDk}/>
        </button>

        <div style={{ height: 8 }}/>
      </div>
      <TabBar active="home" rtl={rtl}/>
      <HomeIndicator/>
    </Phone>
  );
}

const iconChip = (bg) => ({
  width: 32, height: 32, borderRadius: 8, background: bg,
  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
});

function Metric({ label, value, unit }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: K.ink2, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 2 }}>
        <span style={{ fontSize: 26, fontWeight: 800, color: K.ink, letterSpacing: -0.6 }}>{value}</span>
        <span style={{ fontSize: 13, color: K.ink2, fontWeight: 700 }}>{unit}</span>
      </div>
    </div>
  );
}

function PercentileBar({ value }) {
  // Real bell-curve distribution. The curve itself is neutral — only the
  // child's marker carries color. Hash marks at the standard WHO breakpoints.
  const W = 320, H = 56, PAD_X = 6;
  // bell shape via gaussian, normalized so peak = H - 14
  const xs = (p) => PAD_X + (p / 100) * (W - PAD_X * 2);
  const bell = (p) => {
    const z = (p - 50) / 20; // sigma ≈ 20 percentile units
    return (H - 14) - (H - 18) * Math.exp(-(z * z) / 2);
  };
  // polyline path: filled area under curve
  const pts = [];
  for (let p = 0; p <= 100; p += 2) pts.push([xs(p), bell(p)]);
  const area = 'M' + PAD_X + ',' + (H - 6) + ' '
    + pts.map(p => 'L' + p[0] + ',' + p[1]).join(' ')
    + ' L' + (W - PAD_X) + ',' + (H - 6) + ' Z';
  const line = 'M' + pts.map(p => p[0] + ',' + p[1]).join(' L');

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', overflow: 'visible' }}>
      <path d={area} fill={K.tealSoft}/>
      <path d={line} fill="none" stroke={K.tealLine} strokeWidth="1.5"/>
      {/* hash marks */}
      {[3, 15, 50, 85, 97].map(p => (
        <g key={p}>
          <line x1={xs(p)} x2={xs(p)} y1={H - 6} y2={H - 2} stroke={K.ink3} strokeWidth="1"/>
          <text x={xs(p)} y={H + 8} textAnchor="middle" fontSize="9" fill={K.ink3} fontFamily={K.font} fontWeight="600">{p}</text>
        </g>
      ))}
      {/* child marker */}
      <line x1={xs(value)} x2={xs(value)} y1={bell(value) - 4} y2={H - 6} stroke={K.success} strokeWidth="2" strokeLinecap="round"/>
      <circle cx={xs(value)} cy={bell(value) - 4} r="4.5" fill={K.success} stroke="#fff" strokeWidth="2"/>
    </svg>
  );
}

function MilestoneRow({ tone, label, body }) {
  const toneStyles = {
    success: { iconBg: K.success, ico: 'check' },
    neutral: { iconBg: K.tealLine, ico: 'circle' },
  };
  const s = toneStyles[tone];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{
        width: 22, height: 22, borderRadius: 999, background: tone === 'success' ? K.success : 'transparent',
        border: tone === 'success' ? 'none' : `1.5px solid ${K.tealLine}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        {tone === 'success' && <Icon name="check" size={14} color="#fff" strokeWidth={3}/>}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: K.ink2, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase' }}>{label}</div>
        <div style={{ fontSize: 14.5, color: K.ink, fontWeight: 700, marginTop: 1 }}>{body}</div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// 2.2 VACCINATION TIMELINE
// ══════════════════════════════════════════════════════════════════════
function ScreenVaccines() {
  const items = [
    { name: 'БЦЖ-М',         age: 'при рождении',  date: '13 апр 2024', status: 'done' },
    { name: 'Гепатит B · 1', age: 'при рождении',  date: '13 апр 2024', status: 'done' },
    { name: 'Гепатит B · 2', age: '1 месяц',       date: '15 мая 2024', status: 'done' },
    { name: 'Пневмококк · 1', age: '2 месяца',     date: '14 июн 2024', status: 'done' },
    { name: 'АКДС · 1',      age: '3 месяца',      date: '12 июл 2024', status: 'done' },
    { name: 'АКДС · 2',      age: '4.5 месяца',    date: '27 авг 2024', status: 'done' },
    { name: 'АКДС · 3',      age: '6 месяцев',     date: '15 окт 2024', status: 'done' },
    { name: 'Корь · краснуха · паротит', age: '12 месяцев', date: '13 апр 2025', status: 'done' },
    { name: 'АКДС · ревакц. 1',       age: '18 месяцев', date: '23 мая 2025',  status: 'due', dueIn: 'через 12 дн' },
    { name: 'Полиомиелит · ревакц. 1', age: '20 месяцев', date: 'июль 2025',    status: 'upcoming' },
    { name: 'Гепатит A · 1',           age: '20 месяцев', date: 'июль 2025',    status: 'upcoming' },
    { name: 'Полиомиелит · ревакц. 2', age: '24 месяца',  date: 'окт 2025',     status: 'upcoming' },
    { name: 'Ветрянка',                age: '24 месяца',  date: 'окт 2025',     status: 'upcoming' },
    { name: 'Гепатит A · 2',           age: '26 месяцев', date: 'дек 2025',     status: 'upcoming' },
    { name: 'Грипп · сезонная',         age: 'ежегодно',   date: 'сент 2025',    status: 'upcoming' },
    { name: 'КПК · ревакц.',           age: '6 лет',      date: '2030',         status: 'upcoming' },
  ];
  return (
    <Phone>
      <NavBar title="Прививки" subtitle="16 в календаре · 8 готово" right={
        <button style={{ ...navBtnInline }}>
          <Icon name="plus" size={22} color={K.ink}/>
        </button>
      }/>
      {/* filter chips */}
      <div style={{ padding: '0 20px 14px', display: 'flex', gap: 8, overflowX: 'auto' }}>
        <FilterChip active>Все · 16</FilterChip>
        <FilterChip>Скоро · 8</FilterChip>
        <FilterChip>Готово · 8</FilterChip>
        <FilterChip>Просрочено · 0</FilterChip>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 16px' }}>
        {/* group: upcoming */}
        <GroupHeader label="Предстоящие"/>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {items.filter(i => i.status !== 'done').map((i, idx) => (
            <VaccineRow key={idx} {...i}/>
          ))}
        </div>

        {/* group: done */}
        <GroupHeader label="Готово"/>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.filter(i => i.status === 'done').slice().reverse().map((i, idx) => (
            <VaccineRow key={idx} {...i}/>
          ))}
        </div>
      </div>

      <TabBar active="vaccines"/>
      <HomeIndicator/>
    </Phone>
  );
}
const navBtnInline = {
  width: 40, height: 40, borderRadius: 999, border: 'none', background: 'transparent',
  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0,
};

function FilterChip({ children, active = false }) {
  return (
    <div style={{
      height: 32, padding: '0 12px', borderRadius: 999,
      background: active ? K.teal : K.surface,
      border: `1px solid ${active ? K.teal : K.border}`,
      color: active ? '#fff' : K.ink, fontWeight: 700, fontSize: 13,
      display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap',
      flexShrink: 0,
    }}>{children}</div>
  );
}
function GroupHeader({ label }) {
  return (
    <div style={{
      padding: '12px 4px 8px', fontSize: 12, color: K.ink2,
      fontWeight: 800, letterSpacing: 0.4, textTransform: 'uppercase',
    }}>{label}</div>
  );
}
function VaccineRow({ name, age, date, status, dueIn }) {
  const done = status === 'done';
  const due = status === 'due';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 14px', borderRadius: 12,
      background: K.surface, border: `1px solid ${K.border}`,
      opacity: done ? 0.7 : 1,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 999,
        background: done ? K.successSoft : due ? K.warningSoft : K.tealSoft,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon
          name={done ? 'check' : due ? 'clock' : 'syringe'}
          size={done ? 18 : 18}
          color={done ? K.success : due ? K.warning : K.teal}
          strokeWidth={done ? 3 : 2}
        />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 15, fontWeight: 700, color: done ? K.ink2 : K.ink,
          letterSpacing: -0.2, textDecoration: done ? 'none' : 'none',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{name}</div>
        <div style={{ fontSize: 12.5, color: K.ink2, marginTop: 2, fontWeight: 600 }}>
          {age} · {date}
        </div>
      </div>
      {due && <Pill tone="warning" size="sm">{dueIn}</Pill>}
      {!done && !due && <Pill tone="neutral" size="sm">скоро</Pill>}
      {done && <Icon name="check" size={18} color={K.success} strokeWidth={3}/>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// 2.3 VACCINE DETAIL
// ══════════════════════════════════════════════════════════════════════
function ScreenVaccineDetail() {
  return (
    <Phone>
      <NavBar back title="" right={
        <button style={navBtnInline}><Icon name="moreH" size={22} color={K.ink}/></button>
      }/>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 24px' }}>

        {/* hero */}
        <div style={{
          padding: '8px 4px 20px', display: 'flex', flexDirection: 'column', gap: 14,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14,
              background: K.warningSoft,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="syringe" size={28} color={K.warning}/>
            </div>
            <Pill tone="warning">через 12 дней · 23 мая</Pill>
          </div>
          <h1 style={{
            margin: 0, fontSize: 30, fontWeight: 800, color: K.ink, letterSpacing: -0.6, lineHeight: 1.1,
          }}>АКДС<br/><span style={{ color: K.ink2, fontWeight: 700, fontSize: 22 }}>Первая ревакцинация</span></h1>
        </div>

        {/* what it protects against */}
        <div style={{
          padding: 16, background: K.surface, border: `1px solid ${K.border}`, borderRadius: 12,
          marginBottom: 14,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Icon name="shieldCheck" size={18} color={K.teal}/>
            <span style={{ fontSize: 12, fontWeight: 800, color: K.teal, letterSpacing: 0.4, textTransform: 'uppercase' }}>Защищает от</span>
          </div>
          <p style={{ margin: 0, fontSize: 15, color: K.ink, fontWeight: 600, lineHeight: 1.5 }}>
            Дифтерии, столбняка и коклюша — трёх тяжёлых инфекций, которые особенно опасны
            для детей младшего возраста.
          </p>
          <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Pill tone="ghost" size="sm">Дифтерия</Pill>
            <Pill tone="ghost" size="sm">Столбняк</Pill>
            <Pill tone="ghost" size="sm">Коклюш</Pill>
          </div>
        </div>

        {/* reassurance */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 10,
          padding: '12px 14px', borderRadius: 10,
          background: K.successSoft, marginBottom: 14,
        }}>
          <Icon name="shield" size={18} color={K.success}/>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#2E6B4A' }}>Чего ждать после</div>
            <div style={{ fontSize: 12.5, color: '#2E6B4A', fontWeight: 600, lineHeight: 1.45, marginTop: 2 }}>
              Лёгкие реакции — небольшая болезненность, припухлость, температура до 38°C —
              обычно проходят за 24–48 часов.
            </div>
          </div>
        </div>

        {/* schedule */}
        <div style={{ padding: 16, background: K.surface, border: `1px solid ${K.border}`, borderRadius: 12, marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: K.ink2, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 10 }}>
            По календарю
          </div>
          <DetailRow icon="calendar" label="Возраст" value="18 месяцев"/>
          <DetailRow icon="clock" label="Срок" value="23 мая 2025"/>
          <DetailRow icon="info" label="Доза" value="0.5 мл, в/м" last/>
        </div>

        {/* placeholder for optional fields */}
        <div style={{ padding: 16, background: K.surface, border: `1px dashed ${K.border}`, borderRadius: 12, marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: K.ink2, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 8 }}>
            После прививки добавите
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <PlaceholderRow icon="user" label="Клиника / врач"/>
            <PlaceholderRow icon="camera" label="Фото справки"/>
            <PlaceholderRow icon="edit" label="Заметки о реакции"/>
          </div>
        </div>

        <Button variant="amber" icon="check">Отметить как сделано</Button>
        <div style={{ height: 8 }}/>
        <Button variant="ghost">Перенести</Button>

      </div>
      <HomeIndicator/>
    </Phone>
  );
}
function DetailRow({ icon, label, value, last }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 0',
      borderBottom: last ? 'none' : `1px solid ${K.border2}`,
    }}>
      <Icon name={icon} size={18} color={K.ink2}/>
      <span style={{ fontSize: 14, color: K.ink2, fontWeight: 600 }}>{label}</span>
      <span style={{ marginLeft: 'auto', fontSize: 14.5, color: K.ink, fontWeight: 700 }}>{value}</span>
    </div>
  );
}
function PlaceholderRow({ icon, label }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0',
    }}>
      <Icon name={icon} size={18} color={K.ink3}/>
      <span style={{ fontSize: 14, color: K.ink3, fontWeight: 600 }}>{label}</span>
      <Icon name="plus" size={16} color={K.ink3} style={{ marginLeft: 'auto' }}/>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// 2.4 GROWTH TRACKING
// ══════════════════════════════════════════════════════════════════════
function ScreenGrowth() {
  return (
    <Phone>
      <NavBar title="Рост" subtitle="по нормам ВОЗ"/>
      {/* tabs */}
      <div style={{ padding: '0 20px 14px' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          background: K.border2, borderRadius: 10, padding: 4, gap: 4,
        }}>
          {[
            { lbl: 'Вес', a: true },
            { lbl: 'Рост', a: false },
            { lbl: 'Окр. головы', a: false },
          ].map(t => (
            <div key={t.lbl} style={{
              height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 7,
              background: t.a ? K.surface : 'transparent',
              color: t.a ? K.teal : K.ink2,
              fontWeight: t.a ? 700 : 600, fontSize: 13.5,
              boxShadow: t.a ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}>{t.lbl}</div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 16px', display: 'flex', flexDirection: 'column', gap: 14, position: 'relative' }}>

        {/* big number */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: K.ink2, letterSpacing: 0.4, textTransform: 'uppercase' }}>Последнее</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 2 }}>
                <span style={{ fontSize: 36, fontWeight: 800, color: K.ink, letterSpacing: -1 }}>10.4</span>
                <span style={{ fontSize: 16, color: K.ink2, fontWeight: 700 }}>кг</span>
              </div>
              <div style={{ fontSize: 12.5, color: K.ink2, fontWeight: 600, marginTop: 2 }}>2 нед назад · 16 мес</div>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <Pill tone="success">75-й перцентиль</Pill>
              <div style={{ fontSize: 12, color: K.ink2, fontWeight: 600, marginTop: 6, maxWidth: 150 }}>
                Уверенно в норме
              </div>
            </div>
          </div>
        </Card>

        {/* chart */}
        <Card p={0} style={{ overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: K.ink, letterSpacing: -0.1 }}>Вес по возрасту</div>
            <div style={{ fontSize: 11.5, color: K.ink2, fontWeight: 700 }}>0–24 мес</div>
          </div>
          <GrowthChart/>
          <div style={{
            padding: '0 16px 14px', display: 'flex', flexWrap: 'wrap', gap: 8,
            fontSize: 10.5, color: K.ink2, fontWeight: 700,
          }}>
            <LegendDot color={K.tealLine}/><span>3</span>
            <LegendDot color={K.tealLine}/><span>15</span>
            <LegendDot color={K.teal}/><span>50 · норма</span>
            <LegendDot color={K.tealLine}/><span>85</span>
            <LegendDot color={K.tealLine}/><span>97</span>
            <span style={{ marginLeft: 'auto' }}>—  Алина</span>
          </div>
        </Card>

        <div style={{ height: 80 }}/>
      </div>

      {/* FAB */}
      <div style={{
        position: 'absolute', right: 20, bottom: 96, zIndex: 10,
      }}>
        <button style={{
          width: 56, height: 56, borderRadius: 999, border: 'none',
          background: K.amber, color: '#1A2E2E',
          boxShadow: '0 6px 16px rgba(216,142,46,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', padding: 0,
        }}>
          <Icon name="plus" size={26} color={K.ink} strokeWidth={2.5}/>
        </button>
      </div>

      <TabBar active="growth"/>
      <HomeIndicator/>
    </Phone>
  );
}
function LegendDot({ color }) {
  return <span style={{ width: 8, height: 8, borderRadius: 999, background: color, display: 'inline-block' }}/>;
}
function GrowthChart() {
  // x: months 0-24, y: kg 2-15
  const W = 320, H = 200, PAD_L = 28, PAD_R = 8, PAD_T = 10, PAD_B = 22;
  const xs = (m) => PAD_L + (m / 24) * (W - PAD_L - PAD_R);
  const ys = (kg) => PAD_T + (1 - (kg - 2) / 13) * (H - PAD_T - PAD_B);

  // WHO girl weight-for-age, smoothed approximation
  const curves = [
    { color: K.tealLine, opacity: 0.5, label: '3',  pts: [[0,2.4],[3,4.6],[6,5.8],[9,6.6],[12,7.0],[18,7.9],[24,8.6]] },
    { color: K.tealLine, opacity: 0.7, label: '15', pts: [[0,2.8],[3,5.2],[6,6.5],[9,7.4],[12,8.0],[18,9.0],[24,9.8]] },
    { color: K.teal,     opacity: 1.0, label: '50', pts: [[0,3.2],[3,5.8],[6,7.3],[9,8.2],[12,8.9],[18,10.2],[24,11.5]] },
    { color: K.tealLine, opacity: 0.7, label: '85', pts: [[0,3.7],[3,6.6],[6,8.2],[9,9.2],[12,10.0],[18,11.5],[24,13.1]] },
    { color: K.tealLine, opacity: 0.5, label: '97', pts: [[0,4.2],[3,7.4],[6,9.1],[9,10.2],[12,11.1],[18,12.8],[24,14.4]] },
  ];
  const childPts = [
    [0, 3.4], [2, 5.1], [4, 6.4], [6, 7.4], [9, 8.4], [12, 9.2], [16, 10.4],
  ];
  const toPath = (pts) => pts.map((p, i) => (i === 0 ? 'M' : 'L') + xs(p[0]) + ',' + ys(p[1])).join(' ');

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
      {/* y axis labels + grid */}
      {[2, 5, 8, 11, 14].map(v => (
        <g key={v}>
          <line x1={PAD_L} x2={W - PAD_R} y1={ys(v)} y2={ys(v)} stroke={K.border2} strokeWidth="1"/>
          <text x={PAD_L - 6} y={ys(v) + 3} textAnchor="end" fontSize="9.5" fill={K.ink3} fontFamily={K.font}>{v}</text>
        </g>
      ))}
      {/* x axis labels */}
      {[0, 6, 12, 18, 24].map(m => (
        <text key={m} x={xs(m)} y={H - 6} textAnchor="middle" fontSize="9.5" fill={K.ink3} fontFamily={K.font}>{m} мес</text>
      ))}
      {/* curves */}
      {curves.map((c, i) => (
        <path key={i} d={toPath(c.pts)} fill="none" stroke={c.color} strokeWidth={c.label === '50' ? 1.6 : 1} strokeOpacity={c.opacity} strokeDasharray={c.label === '50' ? '0' : '3 3'}/>
      ))}
      {/* child line */}
      <path d={toPath(childPts)} fill="none" stroke={K.amber} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
      {childPts.map((p, i) => (
        <circle key={i} cx={xs(p[0])} cy={ys(p[1])} r="3.2" fill="#fff" stroke={K.amber} strokeWidth="2"/>
      ))}
      {/* last point emphasis */}
      <circle cx={xs(16)} cy={ys(10.4)} r="6" fill={K.amber} opacity="0.18"/>
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════════════
// 2.5 MILESTONES
// ══════════════════════════════════════════════════════════════════════
function ScreenMilestones() {
  return (
    <Phone>
      <NavBar title="Развитие" subtitle="по возрастным этапам"/>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 16px' }}>

        <ProgressOverview/>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <MSGroup
            title="0–3 месяца"
            done={4} total={4}
            collapsed
          />
          <MSGroup
            title="3–6 месяцев"
            done={5} total={5}
            collapsed
          />
          <MSGroup
            title="6–12 месяцев"
            done={6} total={6}
            collapsed
          />
          <MSGroup
            title="12–24 месяца · сейчас"
            done={4} total={7}
            expanded
            items={[
              { label: 'Ходит сам',                    done: true,  date: '2 фев 2025' },
              { label: 'Складывает башенку из 2 кубиков', done: true,  date: '14 фев 2025' },
              { label: 'Узнаёт себя в зеркале',          done: true,  date: '3 мар 2025' },
              { label: 'Произносит 6+ слов',              done: true,  date: 'апр 2025' },
              { label: 'Составляет фразы из 2 слов',      done: false, next: true },
              { label: 'Указывает части тела',            done: false },
              { label: 'Бегает уверенно',                  done: false },
            ]}
          />
          <MSGroup
            title="2–3 года"
            done={0} total={9}
            collapsed
            future
          />
          <MSGroup
            title="3–6 лет"
            done={0} total={12}
            collapsed
            future
          />
        </div>
      </div>
      <TabBar active="milestones"/>
      <HomeIndicator/>
    </Phone>
  );
}
function ProgressOverview() {
  return (
    <div style={{
      margin: '4px 0 14px', padding: '14px 16px',
      background: K.tealSoft, border: `1px solid ${K.tealLine}`, borderRadius: 12,
      display: 'flex', alignItems: 'center', gap: 14,
    }}>
      <RingProgress value={73} size={56}/>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: K.tealDark }}>19 из 26 этапов</div>
        <div style={{ fontSize: 12.5, color: K.tealDark, fontWeight: 600, marginTop: 2, opacity: 0.85 }}>
          Алина уверенно идёт по графику — отличная работа.
        </div>
      </div>
    </div>
  );
}
function RingProgress({ value, size = 56 }) {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} stroke="#fff" strokeWidth="6" fill="none"/>
      <circle cx={size/2} cy={size/2} r={r} stroke={K.teal} strokeWidth="6" fill="none"
        strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)}
        transform={`rotate(-90 ${size/2} ${size/2})`}/>
      <text x={size/2} y={size/2 + 4} textAnchor="middle" fontSize="13" fontWeight="800" fill={K.tealDark} fontFamily={K.font}>{value}%</text>
    </svg>
  );
}
function MSGroup({ title, done, total, expanded = false, future = false, items = [], collapsed = false }) {
  const complete = done === total && total > 0;
  const pct = total ? (done / total) * 100 : 0;
  return (
    <div style={{
      background: K.surface, border: `1px solid ${K.border}`, borderRadius: 12, overflow: 'hidden',
      opacity: future ? 0.65 : 1,
    }}>
      <div style={{
        padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: 999,
          background: complete ? K.success : K.tealSoft,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          {complete
            ? <Icon name="check" size={16} color="#fff" strokeWidth={3}/>
            : <span style={{ fontSize: 11, fontWeight: 800, color: K.teal }}>{done}/{total}</span>
          }
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14.5, fontWeight: 800, color: K.ink, letterSpacing: -0.1 }}>{title}</div>
          {!expanded && !future && (
            <div style={{
              marginTop: 6, height: 4, borderRadius: 999, background: K.border2, overflow: 'hidden',
            }}>
              <div style={{
                width: pct + '%', height: '100%',
                background: complete ? K.success : K.teal, borderRadius: 999,
              }}/>
            </div>
          )}
          {(expanded || future) && (
            <div style={{ fontSize: 12, color: K.ink2, fontWeight: 600, marginTop: 1 }}>
              {complete ? 'все этапы пройдены' : future ? `впереди ${total} этапов` : `пройдено ${done} из ${total}`}
            </div>
          )}
        </div>
        <Icon name={expanded ? 'chevronDown' : 'chevronRight'} size={18} color={K.ink3}/>
      </div>
      {expanded && (
        <div style={{ borderTop: `1px solid ${K.border2}`, padding: '6px 14px 12px' }}>
          {items.map((it, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
              borderBottom: i < items.length - 1 ? `1px solid ${K.border2}` : 'none',
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: 999,
                background: it.done ? K.success : 'transparent',
                border: it.done ? 'none' : `1.5px solid ${it.next ? K.teal : K.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {it.done && <Icon name="check" size={14} color="#fff" strokeWidth={3}/>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14.5, color: it.done ? K.ink : K.ink, fontWeight: it.next ? 800 : 700 }}>
                  {it.label}
                </div>
                {it.date && (
                  <div style={{ fontSize: 12, color: K.ink2, fontWeight: 600, marginTop: 1 }}>{it.date}</div>
                )}
                {it.next && (
                  <div style={{ fontSize: 12, color: K.teal, fontWeight: 700, marginTop: 1 }}>Ожидаемо сейчас</div>
                )}
              </div>
              {it.next && <Pill tone="neutral" size="sm">скоро</Pill>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

Object.assign(window, {
  ScreenHome, ScreenVaccines, ScreenVaccineDetail, ScreenGrowth, ScreenMilestones,
  ChildHeader, iconChip, Metric, navBtnInline,
});
