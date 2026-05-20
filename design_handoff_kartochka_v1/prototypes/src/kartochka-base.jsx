// ──────────────────────────────────────────────────────────────────────
// Kartochka — design tokens, brand mark, icons, screen shells
// ──────────────────────────────────────────────────────────────────────

const K = {
  teal:     '#2A7F7F',
  tealDark: '#1F6363',
  tealSoft: '#E8F1F0',
  tealLine: '#BFD7D5',
  amber:    '#F0A848',
  amberDk:  '#D88E2E',
  amberSoft:'#FBE9CC',
  bg:       '#FAFAF7',
  surface:  '#FFFFFF',
  ink:      '#1A2E2E',
  ink2:     '#5A6E6E',
  ink3:     '#8FA0A0',
  border:   '#E0E5E5',
  border2:  '#EDF0F0',
  success:  '#4A9D6E',
  successSoft: '#E4F2EB',
  warning:  '#E89B3C',
  warningSoft: '#FBEBD3',
  error:    '#C75959',
  errorSoft:'#F6E2E2',
  font:     '"Nunito", -apple-system, system-ui, sans-serif',
  fontAr:   '"IBM Plex Sans Arabic", "Nunito", system-ui, sans-serif',
};

// ──────────────────────────────────────────────────────────────────────
// Brand mark — seedling. Reused everywhere.
// ──────────────────────────────────────────────────────────────────────
function SeedlingMark({ size = 48, bg = K.teal, leaf = '#FFFFFF', bud = K.amber, radius = null }) {
  const r = radius == null ? size * 0.22 : radius;
  return (
    <svg width={size} height={size} viewBox="0 0 232 232" aria-hidden="true" style={{ display: 'block' }}>
      <rect width="232" height="232" rx={r * (232/size)} fill={bg}/>
      <path d="M116 178 L116 110" stroke={leaf} strokeWidth="14" strokeLinecap="round" fill="none"/>
      <path d="M116 124 C100 110 78 110 70 96 C84 88 108 90 116 110 Z" fill={leaf}/>
      <path d="M116 118 C132 100 156 102 168 88 C162 74 134 70 116 102 Z" fill={leaf}/>
      <circle cx="116" cy="90" r="11" fill={bud}/>
    </svg>
  );
}

function Wordmark({ size = 22, color = K.ink, mark = true }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.4 }}>
      {mark && <SeedlingMark size={size * 1.15} />}
      <span style={{ fontFamily: K.font, fontWeight: 800, fontSize: size, letterSpacing: -0.4, color }}>
        Карточка
      </span>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Icons — Lucide-style, 2px stroke, rounded
// ──────────────────────────────────────────────────────────────────────
function Icon({ name, size = 24, color = 'currentColor', strokeWidth = 2, fill = false }) {
  const props = {
    width: size, height: size, viewBox: '0 0 24 24',
    fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round',
    style: { display: 'block', flexShrink: 0 },
  };
  const paths = {
    home:        <><path d="M3 10l9-7 9 7v10a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2z"/></>,
    syringe:     <><path d="M14 4l6 6"/><path d="M17 7l3-3"/><path d="M11 7l6 6"/><path d="M9 9l-5 5a2 2 0 0 0 0 3l2 2a2 2 0 0 0 3 0l5-5"/><path d="M7 13l2 2"/></>,
    activity:    <><path d="M3 12h4l3-9 4 18 3-9h4"/></>,
    star:        <><path d="M12 3l2.6 5.4 6 .9-4.4 4.2 1 6-5.2-2.8L6.8 19.5l1-6L3.4 9.3l6-.9z"/></>,
    settings:    <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8L4.2 7a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></>,
    chevronRight:<><path d="M9 6l6 6-6 6"/></>,
    chevronLeft: <><path d="M15 6l-6 6 6 6"/></>,
    chevronDown: <><path d="M6 9l6 6 6-6"/></>,
    plus:        <><path d="M12 5v14"/><path d="M5 12h14"/></>,
    check:       <><path d="M5 12l5 5L20 7"/></>,
    checkCircle: <><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/></>,
    circle:      <><circle cx="12" cy="12" r="9"/></>,
    clock:       <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    calendar:    <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M8 3v4"/><path d="M16 3v4"/></>,
    fileText:    <><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/><path d="M8 13h8"/><path d="M8 17h5"/></>,
    bell:        <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/></>,
    shield:      <><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/></>,
    shieldCheck: <><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/></>,
    globe:       <><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></>,
    moreH:       <><circle cx="6" cy="12" r="1.4" fill={color}/><circle cx="12" cy="12" r="1.4" fill={color}/><circle cx="18" cy="12" r="1.4" fill={color}/></>,
    info:        <><circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><circle cx="12" cy="8" r=".5" fill={color}/></>,
    share:       <><path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/><path d="M16 6l-4-4-4 4"/><path d="M12 2v14"/></>,
    camera:      <><path d="M3 7h4l2-3h6l2 3h4v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><circle cx="12" cy="13" r="4"/></>,
    user:        <><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 5-6 8-6s7 2 8 6"/></>,
    sparkle:     <><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/></>,
    leaf:        <><path d="M21 3c-12 0-18 6-18 16 0 1 0 1 1 1 9 0 17-6 17-17z"/><path d="M3 19c4-4 8-7 14-11"/></>,
    download:    <><path d="M12 3v12"/><path d="M7 11l5 5 5-5"/><path d="M5 20h14"/></>,
    wifiOff:     <><path d="M1 4l22 22"/><path d="M16 8a8 8 0 0 0-11 1"/><path d="M5 12a5 5 0 0 1 7 0"/><circle cx="12" cy="18" r="1.4" fill={color}/></>,
    arrowRight:  <><path d="M5 12h14"/><path d="M13 5l7 7-7 7"/></>,
    edit:        <><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4z"/></>,
    trash:       <><path d="M3 6h18"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></>,
    lock:        <><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></>,
    cloud:       <><path d="M18 16a4 4 0 0 0-1.5-7.7A6 6 0 0 0 5 9a4.5 4.5 0 0 0 .5 8.9z"/></>,
  };
  const path = paths[name];
  if (!path) return <svg {...props}><circle cx="12" cy="12" r="3"/></svg>;
  return <svg {...props}>{path}</svg>;
}

// ──────────────────────────────────────────────────────────────────────
// Flag components (simplified, for country picker)
// ──────────────────────────────────────────────────────────────────────
function Flag({ country, size = 28 }) {
  const wrap = (children) => (
    <div style={{
      width: size * 1.4, height: size, borderRadius: 5, overflow: 'hidden',
      flexShrink: 0, boxShadow: '0 0 0 1px rgba(0,0,0,0.08) inset',
    }}>
      <svg width={size * 1.4} height={size} viewBox="0 0 42 30">{children}</svg>
    </div>
  );
  switch (country) {
    case 'RU': return wrap(<>
      <rect width="42" height="10" fill="#fff"/>
      <rect y="10" width="42" height="10" fill="#1F4FA3"/>
      <rect y="20" width="42" height="10" fill="#D52B1E"/>
    </>);
    case 'KZ': return wrap(<>
      <rect width="42" height="30" fill="#00ABC2"/>
      <circle cx="20" cy="15" r="5" fill="none" stroke="#FFD400" strokeWidth="0.8"/>
      <circle cx="20" cy="15" r="2.5" fill="#FFD400"/>
      <path d="M14 14h12M14 16h12M14 12h12M14 18h12" stroke="#FFD400" strokeWidth="0.4" opacity="0.7"/>
    </>);
    case 'UZ': return wrap(<>
      <rect width="42" height="10" fill="#1EB53A"/>
      <rect y="10" width="42" height="10" fill="#fff"/>
      <rect y="20" width="42" height="10" fill="#0099B5"/>
      <rect y="9.5" width="42" height="1" fill="#CE1126"/>
      <rect y="19.5" width="42" height="1" fill="#CE1126"/>
      <path d="M10 5c-2 0-3.5 1.5-3.5 3.5S8 12 10 12c0.5 0 1-.1 1.4-.3-1 .3-2.1-.4-2.4-1.5-.3-1.1.4-2.3 1.6-2.6.4-.1.7-.1 1.1 0C11.3 6.4 10.7 5 10 5z" fill="#fff"/>
    </>);
    case 'AE': return wrap(<>
      <rect width="42" height="10" fill="#00843D"/>
      <rect y="10" width="42" height="10" fill="#fff"/>
      <rect y="20" width="42" height="10" fill="#000"/>
      <rect width="11" height="30" fill="#C8102E"/>
    </>);
    case 'SA': return wrap(<>
      <rect width="42" height="30" fill="#006C35"/>
      <text x="21" y="14" textAnchor="middle" fill="#fff" fontSize="4" fontFamily="serif">العربية</text>
      <path d="M10 19h22" stroke="#fff" strokeWidth="1" strokeLinecap="round"/>
      <path d="M12 20l4 1 4-1 4 1 4-1 4 1" stroke="#fff" strokeWidth="0.6" fill="none"/>
    </>);
    case 'TR': return wrap(<>
      <rect width="42" height="30" fill="#E30A17"/>
      <circle cx="15" cy="15" r="5.5" fill="#fff"/>
      <circle cx="17" cy="15" r="4.5" fill="#E30A17"/>
      <path d="M22 13l1 2 2 .3-1.5 1.3.4 2L22 17.5l-1.9 1.1.4-2L19 15.3l2-.3z" fill="#fff"/>
    </>);
    default: return wrap(<rect width="42" height="30" fill={K.border}/>);
  }
}

// ──────────────────────────────────────────────────────────────────────
// AppShell — replaces the iOS default chrome with Kartochka chrome.
// Renders inside an IOSDevice.
// ──────────────────────────────────────────────────────────────────────
function StatusBar({ time = '9:41', dark = false }) {
  // Re-implementation matching the ios-frame status bar but with our
  // background so it sits flush on bg-colored screens.
  const c = dark ? '#fff' : '#000';
  return (
    <div style={{
      height: 54, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
      padding: '0 32px 6px', position: 'relative', zIndex: 20,
    }}>
      <span style={{
        fontFamily: '-apple-system, "SF Pro", system-ui',
        fontWeight: 590, fontSize: 17, color: c,
      }}>{time}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <svg width="19" height="12" viewBox="0 0 19 12">
          <rect x="0" y="7.5" width="3.2" height="4.5" rx="0.7" fill={c}/>
          <rect x="4.8" y="5" width="3.2" height="7" rx="0.7" fill={c}/>
          <rect x="9.6" y="2.5" width="3.2" height="9.5" rx="0.7" fill={c}/>
          <rect x="14.4" y="0" width="3.2" height="12" rx="0.7" fill={c}/>
        </svg>
        <svg width="17" height="12" viewBox="0 0 17 12">
          <path d="M8.5 3.2C10.8 3.2 12.9 4.1 14.4 5.6L15.5 4.5C13.7 2.7 11.2 1.5 8.5 1.5C5.8 1.5 3.3 2.7 1.5 4.5L2.6 5.6C4.1 4.1 6.2 3.2 8.5 3.2Z" fill={c}/>
          <path d="M8.5 6.8C9.9 6.8 11.1 7.3 12 8.2L13.1 7.1C11.8 5.9 10.2 5.1 8.5 5.1C6.8 5.1 5.2 5.9 3.9 7.1L5 8.2C5.9 7.3 7.1 6.8 8.5 6.8Z" fill={c}/>
          <circle cx="8.5" cy="10.5" r="1.5" fill={c}/>
        </svg>
        <svg width="27" height="13" viewBox="0 0 27 13">
          <rect x="0.5" y="0.5" width="23" height="12" rx="3.5" stroke={c} strokeOpacity="0.35" fill="none"/>
          <rect x="2" y="2" width="20" height="9" rx="2" fill={c}/>
          <path d="M25 4.5V8.5C25.8 8.2 26.5 7.2 26.5 6.5C26.5 5.8 25.8 4.8 25 4.5Z" fill={c} fillOpacity="0.4"/>
        </svg>
      </div>
    </div>
  );
}

function HomeIndicator({ dark = false }) {
  return (
    <div style={{
      height: 34, display: 'flex', justifyContent: 'center', alignItems: 'flex-end',
      paddingBottom: 8, flexShrink: 0,
    }}>
      <div style={{
        width: 139, height: 5, borderRadius: 100,
        background: dark ? 'rgba(255,255,255,0.7)' : 'rgba(26,46,46,0.25)',
      }}/>
    </div>
  );
}

// Custom Kartochka nav bar (replaces the iOS-default one)
function NavBar({ title, subtitle, back = false, right = null, transparent = false, rtl = false }) {
  return (
    <div style={{
      height: 56, padding: '0 12px', display: 'flex', alignItems: 'center',
      background: transparent ? 'transparent' : K.bg,
      direction: rtl ? 'rtl' : 'ltr',
      flexShrink: 0,
    }}>
      {/* leading */}
      <div style={{ width: 40, display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
        {back && (
          <button style={navBtn}>
            <Icon name={rtl ? 'chevronRight' : 'chevronLeft'} size={22} color={K.ink}/>
          </button>
        )}
      </div>
      <div style={{ flex: 1, textAlign: 'center' }}>
        {title && (
          <div style={{ fontFamily: K.font, fontSize: 17, fontWeight: 700, color: K.ink, letterSpacing: -0.2 }}>
            {title}
          </div>
        )}
        {subtitle && (
          <div style={{ fontFamily: K.font, fontSize: 12, color: K.ink2, marginTop: 1 }}>
            {subtitle}
          </div>
        )}
      </div>
      <div style={{ width: 40, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
        {right}
      </div>
    </div>
  );
}
const navBtn = {
  width: 36, height: 36, borderRadius: 999, border: 'none', background: 'transparent',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0,
};

// Bottom tab bar (5 items)
function TabBar({ active = 'home', rtl = false }) {
  const items = [
    { id: 'home',       label: 'Главная',   icon: 'home' },
    { id: 'vaccines',   label: 'Прививки',  icon: 'syringe' },
    { id: 'growth',     label: 'Рост',      icon: 'activity' },
    { id: 'milestones', label: 'Развитие',  icon: 'star' },
    { id: 'settings',   label: 'Ещё',       icon: 'settings' },
  ];
  return (
    <div style={{
      borderTop: '1px solid ' + K.border,
      background: 'rgba(255,255,255,0.96)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      padding: '8px 8px 0',
      flexShrink: 0,
      direction: rtl ? 'rtl' : 'ltr',
    }}>
      <div style={{ display: 'flex' }}>
        {items.map(it => {
          const isActive = it.id === active;
          return (
            <div key={it.id} style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              padding: '6px 0',
            }}>
              <Icon name={it.icon} size={24} color={isActive ? K.teal : K.ink3} strokeWidth={isActive ? 2.2 : 1.8}/>
              <span style={{
                fontFamily: K.font, fontSize: 10.5, fontWeight: isActive ? 700 : 500,
                color: isActive ? K.teal : K.ink3, letterSpacing: 0.1,
              }}>{it.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Generic primitives ────────────────────────────────────────────────
function Button({ children, variant = 'primary', size = 'lg', icon, iconRight, full = true, dim = false, style = {} }) {
  const sizes = {
    lg: { h: 52, fs: 16, px: 20, gap: 10 },
    md: { h: 44, fs: 15, px: 16, gap: 8 },
    sm: { h: 36, fs: 13, px: 14, gap: 6 },
  };
  const s = sizes[size];
  const variants = {
    primary:   { bg: K.teal,    fg: '#fff',    border: 'transparent' },
    amber:     { bg: K.amber,   fg: '#1A2E2E', border: 'transparent' },
    ghost:     { bg: 'transparent', fg: K.teal, border: K.tealLine },
    secondary: { bg: K.surface, fg: K.ink,     border: K.border },
    danger:    { bg: K.errorSoft, fg: K.error, border: 'transparent' },
  };
  const v = variants[variant];
  return (
    <button style={{
      height: s.h, padding: `0 ${s.px}px`, borderRadius: 8,
      background: v.bg, color: v.fg, border: `1px solid ${v.border}`,
      fontFamily: K.font, fontSize: s.fs, fontWeight: 700, letterSpacing: -0.1,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: s.gap,
      width: full ? '100%' : 'auto',
      cursor: 'pointer', opacity: dim ? 0.5 : 1,
      boxShadow: variant === 'primary' ? '0 1px 2px rgba(42,127,127,0.18)' :
                 variant === 'amber'   ? '0 1px 2px rgba(216,142,46,0.22)' : 'none',
      ...style,
    }}>
      {icon && <Icon name={icon} size={s.fs + 2} color={v.fg}/>}
      <span>{children}</span>
      {iconRight && <Icon name={iconRight} size={s.fs + 2} color={v.fg}/>}
    </button>
  );
}

function Card({ children, p = 16, style = {} }) {
  return (
    <div style={{
      background: K.surface, border: `1px solid ${K.border}`, borderRadius: 12,
      padding: p, ...style,
    }}>{children}</div>
  );
}

function Pill({ children, tone = 'neutral', size = 'md' }) {
  const tones = {
    neutral: { bg: K.tealSoft, fg: K.teal },
    success: { bg: K.successSoft, fg: K.success },
    warning: { bg: K.warningSoft, fg: K.warning },
    error:   { bg: K.errorSoft, fg: K.error },
    ghost:   { bg: 'transparent', fg: K.ink2, border: K.border },
    amber:   { bg: K.amberSoft, fg: K.amberDk },
  };
  const t = tones[tone];
  const sz = size === 'sm' ? { h: 22, fs: 11, px: 8 } : { h: 26, fs: 12, px: 10 };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      height: sz.h, padding: `0 ${sz.px}px`, borderRadius: 999,
      background: t.bg, color: t.fg,
      border: t.border ? `1px solid ${t.border}` : 'none',
      fontFamily: K.font, fontSize: sz.fs, fontWeight: 700, letterSpacing: 0.2, whiteSpace: 'nowrap',
    }}>{children}</span>
  );
}

// Section title row (used a lot in onboarding)
function ScreenTitle({ title, subtitle, align = 'left', rtl = false }) {
  return (
    <div style={{ textAlign: align, direction: rtl ? 'rtl' : 'ltr' }}>
      <h1 style={{
        margin: 0, fontFamily: rtl ? K.fontAr : K.font, fontWeight: 800, fontSize: 28,
        letterSpacing: -0.5, color: K.ink, lineHeight: 1.15,
      }}>{title}</h1>
      {subtitle && (
        <p style={{
          margin: '10px 0 0', fontFamily: rtl ? K.fontAr : K.font, fontSize: 15,
          color: K.ink2, lineHeight: 1.5, fontWeight: 500,
        }}>{subtitle}</p>
      )}
    </div>
  );
}

Object.assign(window, {
  K, SeedlingMark, Wordmark, Icon, Flag,
  StatusBar, HomeIndicator, NavBar, TabBar,
  Button, Card, Pill, ScreenTitle,
});
