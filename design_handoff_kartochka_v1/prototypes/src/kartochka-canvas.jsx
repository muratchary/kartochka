// Kartochka — full canvas (Phases 2 + 3)
// 24 artboards across 6 sections.

function KartochkaCanvas() {
  return (
    <DesignCanvas minScale={0.1} maxScale={2.2}>

      <DCSection
        id="onboarding"
        title="Группа 1 · Онбординг"
        subtitle="Splash → Welcome → Country → Language → Add first child"
      >
        <DCArtboard id="1.1" label="1.1 · Splash"        width={402} height={874}><ScreenSplash/></DCArtboard>
        <DCArtboard id="1.2" label="1.2 · Welcome"       width={402} height={874}><ScreenWelcome/></DCArtboard>
        <DCArtboard id="1.3" label="1.3 · Country"       width={402} height={874}><ScreenCountry/></DCArtboard>
        <DCArtboard id="1.4" label="1.4 · Language"      width={402} height={874}><ScreenLanguage/></DCArtboard>
        <DCArtboard id="1.5" label="1.5 · Add child"     width={402} height={874}><ScreenAddChild/></DCArtboard>
      </DCSection>

      <DCSection
        id="main"
        title="Группа 2 · Основное приложение"
        subtitle="Главная → Прививки → Деталь прививки → Рост → Развитие"
      >
        <DCArtboard id="2.1" label="2.1 · Home"           width={402} height={874}><ScreenHome/></DCArtboard>
        <DCArtboard id="2.2" label="2.2 · Vaccines"       width={402} height={874}><ScreenVaccines/></DCArtboard>
        <DCArtboard id="2.3" label="2.3 · Vaccine detail" width={402} height={874}><ScreenVaccineDetail/></DCArtboard>
        <DCArtboard id="2.4" label="2.4 · Growth"         width={402} height={874}><ScreenGrowth/></DCArtboard>
        <DCArtboard id="2.5" label="2.5 · Milestones"     width={402} height={874}><ScreenMilestones/></DCArtboard>
      </DCSection>

      <DCSection
        id="pdf"
        title="Группа 3 · PDF и подписка"
        subtitle="Paywall → Превью PDF → Успех"
      >
        <DCArtboard id="3.1" label="3.1 · Paywall"        width={402} height={874}><ScreenPaywall/></DCArtboard>
        <DCArtboard id="3.2" label="3.2 · PDF preview"    width={402} height={874}><ScreenPDFPreview/></DCArtboard>
        <DCArtboard id="3.3" label="3.3 · Sub success"    width={402} height={874}><ScreenSubSuccess/></DCArtboard>
      </DCSection>

      <DCSection
        id="settings"
        title="Группа 4 · Настройки"
        subtitle="Настройки → Приватность → Уведомления → Второй ребёнок"
      >
        <DCArtboard id="4.1" label="4.1 · Settings"       width={402} height={874}><ScreenSettings/></DCArtboard>
        <DCArtboard id="4.2" label="4.2 · Privacy"        width={402} height={874}><ScreenPrivacy/></DCArtboard>
        <DCArtboard id="4.3" label="4.3 · Notifications"  width={402} height={874}><ScreenNotifications/></DCArtboard>
        <DCArtboard id="4.4" label="4.4 · 2nd child gate" width={402} height={874}><ScreenAddSecondChild/></DCArtboard>
      </DCSection>

      <DCSection
        id="states"
        title="Группа 5 · Состояния"
        subtitle="Пусто → Загрузка → Ошибка → Офлайн-баннер"
      >
        <DCArtboard id="5.1" label="5.1 · Empty"          width={402} height={874}><ScreenEmptyHome/></DCArtboard>
        <DCArtboard id="5.2" label="5.2 · Loading"        width={402} height={874}><ScreenLoading/></DCArtboard>
        <DCArtboard id="5.3" label="5.3 · Error"          width={402} height={874}><ScreenError/></DCArtboard>
        <DCArtboard id="5.4" label="5.4 · Offline banner" width={402} height={874}><ScreenOffline/></DCArtboard>
      </DCSection>

      <DCSection
        id="rtl"
        title="Arabic · RTL"
        subtitle="Welcome, Home, Paywall — للتحقق من تخطيط من اليمين إلى اليسار"
      >
        <DCArtboard id="rtl-welcome" label="1.2 · Welcome (AR)" width={402} height={874}><ScreenWelcome rtl/></DCArtboard>
        <DCArtboard id="rtl-home"    label="2.1 · Home (AR)"    width={402} height={874}><ScreenHome rtl/></DCArtboard>
        <DCArtboard id="rtl-paywall" label="3.1 · Paywall (AR)" width={402} height={874}><ScreenPaywall rtl/></DCArtboard>
      </DCSection>

    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<KartochkaCanvas/>);
