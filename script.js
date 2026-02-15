(() => {
  "use strict";

  const VIEW_MODE = {
    LANDING: "landing",
    POLICIES: "policies",
  };

  const TAB_PARAM = "tab";
  const DEFAULT_TAB = "privacy";
  const LANDING_TAB_VALUES = new Set(["landing", "promo"]);

  const MODE_VALUE_PARAMS = ["view", "page", "mode"];
  const MODE_FLAG_PARAMS = ["landing", "promo"];
  const LANDING_MODE_VALUES = new Set(["landing", "promo"]);
  const TRUTHY_VALUES = new Set(["", "1", "true", "yes"]);
  const LANDING_CLEANUP_PARAMS = ["landing", "promo", "view", "page", "mode"];

  const DEFAULT_LOCALE = "en";
  const SUPPORTED_LOCALES = new Set(["en", "ua", "ru"]);
  const LOCALE_PARAMS = ["locale", "lang", "lng"];

  const FALLBACK_SHOWCASE_IMAGES = ["screen_home.png", "screen_profile.png"];

  const SHOWCASE_IMAGES = {
    en: [
      "assets/screenshots/en-dashboard.png",
      "assets/screenshots/en-trainings.png",
    ],
    ua: [
      "assets/screenshots/ua-dashboard.png",
      "assets/screenshots/ua-trainings.png",
    ],
    ru: [
      "assets/screenshots/ru-dashboard.png",
      "assets/screenshots/ru-trainings.png",
    ],
  };

  const I18N = {
    en: {
      "brand.name": "Grippo",
      "title.landing": "Grippo | Workouts That Make Sense",
      "title.policies": "Grippo Policies",
      "landing.hero.title": "Workouts That Make Sense",
      "landing.hero.subtitle":
        "Grippo is a workout app that shows not just exercises, but real progress. No quotes. No empty promises. Just training, numbers, and a clear view of what is happening to your body.",
      "landing.store.appStore.overline": "Download on the",
      "landing.store.appStore.title": "App Store",
      "landing.store.googlePlay.overline": "Get it on",
      "landing.store.googlePlay.title": "Google Play",
      "landing.points.first.title": "What makes Grippo different",
      "landing.points.first.item1": "See how your strength grows over time",
      "landing.points.first.item2": "Track which muscles actually get load",
      "landing.points.first.item3": "Spot where progress happens and where it stalls",
      "landing.points.first.item4": "Know exactly what to adjust in the next workout",
      "landing.points.second.title": "Progress from day one",
      "landing.points.second.item1": "Calculates workout volume and load automatically",
      "landing.points.second.item2": "Analyzes sets, reps, and strength dynamics",
      "landing.points.second.item3": "Turns raw numbers into readable insights",
      "landing.points.second.item4": "No \"someday\" predictions, only your current state",
      "landing.showcase.eyebrow": "Inside The App",
      "landing.showcase.title": "Real screens. Real numbers. Zero fluff.",
      "landing.showcase.subtitle": "Your dashboard and workout log update with your progress as you train.",
      "landing.features.first.title": "Smart insights, not templates",
      "landing.features.first.body":
        "Understand overload and underload by muscle group. Grippo helps you decide when to push harder and when to recover, based on your own training history.",
      "landing.features.second.title": "Full workout control",
      "landing.features.second.body":
        "Log workouts quickly, review exercise stats, and visualize muscle load in a clean, distraction-free interface. Spend less time tapping and more time understanding.",
      "landing.features.third.title": "Built for serious training",
      "landing.features.third.body":
        "Grippo is for people who train regularly, care about measurable progress, and want to know why results appear or disappear.",
      "landing.cta.eyebrow": "Start With Your First Workout",
      "landing.cta.title": "Open the app, log your session, and see what others do not show.",
      "landing.cta.subtitle": "Grippo gives you a clear snapshot of your training right now.",
      "landing.footer.navAria": "Legal and account links",
      "landing.footer.privacy": "Privacy Policy",
      "landing.footer.terms": "Terms & Conditions",
      "landing.footer.remove": "Account Management",
      "policies.hero.title": "Policies & Account",
      "policies.hero.subtitle": "Find the privacy policy, terms & conditions, and account removal instructions for the Grippo mobile app.",
      "policies.hero.tabAria": "Policy sections",
      "policies.tabs.privacy": "Privacy Policy",
      "policies.tabs.terms": "Terms & Conditions",
      "policies.tabs.remove": "Account Management",
      "remove.title": "Account Management",
      "remove.subtitle": "Follow the steps below to permanently delete your Grippo account. After confirmation, all data associated with the account is removed and cannot be restored.",
      "remove.step1.title": "Open your profile from the home screen",
      "remove.step1.body": "From the start screen, tap the user icon in the top-right corner.",
      "remove.step2.title": "Go to Settings",
      "remove.step2.body": "In your profile, find the Settings section and tap it to open account options.",
      "remove.step3.title": "Delete the account",
      "remove.step3.body": "In settings, tap \"Delete account\" and confirm. This permanently removes all data.",
      "remove.warning.label": "Important:",
      "remove.warning.body": "deletion is irreversible. Activity history, settings, and related information are removed forever.",
      "footer.copyright": "Grippo © 2026. All rights reserved.",
      "showcase.alt.dashboard": "Grippo app dashboard screenshot",
      "showcase.alt.training": "Grippo app trainings screenshot",
    },
    ua: {
      "brand.name": "Grippo",
      "title.landing": "Grippo | Тренування з сенсом",
      "title.policies": "Grippo Політики",
      "landing.hero.title": "Тренування, які мають сенс",
      "landing.hero.subtitle":
        "Grippo — це фітнес-додаток, який показує не просто вправи, а реальний прогрес. Без мотиваційних цитат. Без порожніх обіцянок. Лише тренування, цифри та чітке розуміння того, що відбувається з вашим тілом.",
      "landing.store.appStore.overline": "Завантажити в",
      "landing.store.appStore.title": "App Store",
      "landing.store.googlePlay.overline": "Доступно в",
      "landing.store.googlePlay.title": "Google Play",
      "landing.points.first.title": "Що відрізняє Grippo",
      "landing.points.first.item1": "Бачте, як зростає сила з часом",
      "landing.points.first.item2": "Відстежуйте, які м'язи реально отримують навантаження",
      "landing.points.first.item3": "Розумійте, де є прогрес, а де він зупинився",
      "landing.points.first.item4": "Знайте, що саме змінити в наступному тренуванні",
      "landing.points.second.title": "Прогрес з першого дня",
      "landing.points.second.item1": "Автоматичний розрахунок обсягу та навантаження",
      "landing.points.second.item2": "Аналіз підходів, повторень і динаміки сили",
      "landing.points.second.item3": "Перетворення даних у зрозумілі інсайти",
      "landing.points.second.item4": "Без прогнозів на \"колись\" — тільки ваш стан зараз",
      "landing.showcase.eyebrow": "Всередині додатку",
      "landing.showcase.title": "Реальні екрани. Реальні цифри. Без зайвого.",
      "landing.showcase.subtitle": "Дашборд і журнал тренувань оновлюються разом з вашим прогресом.",
      "landing.features.first.title": "Розумні інсайти, а не шаблони",
      "landing.features.first.body": "Розумійте перевантаження і недовантаження по групах м'язів та коригуйте план на основі власної історії тренувань.",
      "landing.features.second.title": "Повний контроль тренувань",
      "landing.features.second.body": "Швидко фіксуйте тренування, переглядайте статистику і бачте розподіл навантаження без зайвих дій.",
      "landing.features.third.title": "Для тих, хто тренується системно",
      "landing.features.third.body": "Grippo для людей, яким важливі цифри, стабільність і розуміння причин результату.",
      "landing.cta.eyebrow": "Почніть з першого тренування",
      "landing.cta.title": "Відкрийте додаток, запишіть тренування і побачте те, що інші не показують.",
      "landing.cta.subtitle": "Grippo показує чесний зріз вашої форми вже зараз.",
      "landing.footer.navAria": "Посилання на політики та керування акаунтом",
      "landing.footer.privacy": "Політика конфіденційності",
      "landing.footer.terms": "Умови використання",
      "landing.footer.remove": "Керування акаунтом",
      "policies.hero.title": "Політики та акаунт",
      "policies.hero.subtitle": "Тут ви знайдете політику конфіденційності, умови використання та інструкцію з видалення акаунта Grippo.",
      "policies.hero.tabAria": "Розділи політик",
      "policies.tabs.privacy": "Політика конфіденційності",
      "policies.tabs.terms": "Умови використання",
      "policies.tabs.remove": "Керування акаунтом",
      "remove.title": "Керування акаунтом",
      "remove.subtitle": "Виконайте кроки нижче, щоб назавжди видалити акаунт Grippo. Після підтвердження дані відновити неможливо.",
      "remove.step1.title": "Відкрийте профіль з головного екрана",
      "remove.step1.body": "На стартовому екрані натисніть іконку користувача у правому верхньому куті.",
      "remove.step2.title": "Перейдіть у Налаштування",
      "remove.step2.body": "У профілі знайдіть розділ Налаштування та відкрийте параметри акаунта.",
      "remove.step3.title": "Видаліть акаунт",
      "remove.step3.body": "У налаштуваннях натисніть \"Видалити акаунт\" та підтвердьте дію.",
      "remove.warning.label": "Важливо:",
      "remove.warning.body": "видалення незворотне. Історія активності, налаштування та пов'язані дані буде видалено назавжди.",
      "footer.copyright": "Grippo © 2026. Усі права захищено.",
      "showcase.alt.dashboard": "Скріншот дашборду Grippo",
      "showcase.alt.training": "Скріншот тренувань Grippo",
    },
    ru: {
      "brand.name": "Grippo",
      "title.landing": "Grippo | Тренировки со смыслом",
      "title.policies": "Grippo Политики",
      "landing.hero.title": "Тренировки, которые имеют смысл",
      "landing.hero.subtitle":
        "Grippo — это фитнес-приложение, которое показывает не просто упражнения, а реальный прогресс. Без мотивационных цитат. Без пустых обещаний. Только тренировки, цифры и ясное понимание того, что происходит с вашим телом.",
      "landing.store.appStore.overline": "Скачать в",
      "landing.store.appStore.title": "App Store",
      "landing.store.googlePlay.overline": "Доступно в",
      "landing.store.googlePlay.title": "Google Play",
      "landing.points.first.title": "Что отличает Grippo",
      "landing.points.first.item1": "Видно, как растет сила со временем",
      "landing.points.first.item2": "Понятно, какие мышцы действительно получают нагрузку",
      "landing.points.first.item3": "Ясно, где есть прогресс, а где он остановился",
      "landing.points.first.item4": "Понятно, что менять в следующей тренировке",
      "landing.points.second.title": "Прогресс с первого дня",
      "landing.points.second.item1": "Автоматический расчет объема и нагрузки",
      "landing.points.second.item2": "Анализ подходов, повторений и динамики силы",
      "landing.points.second.item3": "Преобразование данных в понятные инсайты",
      "landing.points.second.item4": "Без прогнозов на \"когда-нибудь\" — только ваше состояние сейчас",
      "landing.showcase.eyebrow": "Внутри приложения",
      "landing.showcase.title": "Реальные экраны. Реальные цифры. Ничего лишнего.",
      "landing.showcase.subtitle": "Дашборд и журнал тренировок обновляются вместе с вашим прогрессом.",
      "landing.features.first.title": "Умные инсайты вместо шаблонов",
      "landing.features.first.body": "Понимайте перегруз и недогруз по мышечным группам и корректируйте план на основе вашей истории тренировок.",
      "landing.features.second.title": "Полный контроль тренировок",
      "landing.features.second.body": "Быстро фиксируйте тренировки, смотрите статистику упражнений и анализируйте нагрузку без лишних действий.",
      "landing.features.third.title": "Для тех, кто тренируется регулярно",
      "landing.features.third.body": "Grippo создан для тех, кому важны цифры, контроль и понимание причин результата.",
      "landing.cta.eyebrow": "Начните с первой тренировки",
      "landing.cta.title": "Откройте приложение, запишите тренировку и увидьте то, чего не показывают другие.",
      "landing.cta.subtitle": "Grippo показывает честный срез вашего прогресса уже сейчас.",
      "landing.footer.navAria": "Ссылки на политики и управление аккаунтом",
      "landing.footer.privacy": "Политика конфиденциальности",
      "landing.footer.terms": "Условия использования",
      "landing.footer.remove": "Управление аккаунтом",
      "policies.hero.title": "Политики и аккаунт",
      "policies.hero.subtitle": "Здесь вы найдете политику конфиденциальности, условия использования и инструкции по удалению аккаунта Grippo.",
      "policies.hero.tabAria": "Разделы политик",
      "policies.tabs.privacy": "Политика конфиденциальности",
      "policies.tabs.terms": "Условия использования",
      "policies.tabs.remove": "Управление аккаунтом",
      "remove.title": "Управление аккаунтом",
      "remove.subtitle": "Следуйте шагам ниже, чтобы навсегда удалить аккаунт Grippo. После подтверждения данные нельзя восстановить.",
      "remove.step1.title": "Откройте профиль с главного экрана",
      "remove.step1.body": "На стартовом экране нажмите иконку пользователя в правом верхнем углу.",
      "remove.step2.title": "Перейдите в Настройки",
      "remove.step2.body": "В профиле откройте раздел Настройки для управления аккаунтом.",
      "remove.step3.title": "Удалите аккаунт",
      "remove.step3.body": "В настройках нажмите \"Удалить аккаунт\" и подтвердите действие.",
      "remove.warning.label": "Важно:",
      "remove.warning.body": "удаление необратимо. История активности, настройки и связанные данные будут удалены навсегда.",
      "footer.copyright": "Grippo © 2026. Все права защищены.",
      "showcase.alt.dashboard": "Скриншот дашборда Grippo",
      "showcase.alt.training": "Скриншот тренировок Grippo",
    },
  };

  class GrippoSiteController {
    constructor() {
      this.landingPage = document.getElementById("landingPage");
      this.policyPage = document.getElementById("policyPage");

      this.tabs = Array.from(document.querySelectorAll(".tab-button"));
      this.panels = Array.from(document.querySelectorAll("[data-tab-panel]"));
      this.panelById = new Map(this.panels.map((panel) => [panel.id, panel]));

      this.translatableElements = Array.from(document.querySelectorAll("[data-i18n]"));
      this.translatableAriaElements = Array.from(document.querySelectorAll("[data-i18n-aria-label]"));
      this.tabLinks = Array.from(document.querySelectorAll("[data-tab-link]"));

      this.showcasePrimary = document.getElementById("phoneShotPrimary");
      this.showcaseSecondary = document.getElementById("phoneShotSecondary");
      this.showcaseDots = Array.from(document.querySelectorAll("#phoneDots .phone-dot"));
      this.showcaseTimer = null;
      this.showcaseIndex = 0;

      this.locale = DEFAULT_LOCALE;

      this.handlePopState = this.handlePopState.bind(this);
      this.handleHashChange = this.handleHashChange.bind(this);
    }

    init() {
      if (!this.landingPage || !this.policyPage) {
        return;
      }

      this.locale = this.resolveLocaleFromLocation();
      this.applyLocale();
      this.bindStaticEvents();
      this.syncUiFromLocation(false);
    }

    bindStaticEvents() {
      this.tabs.forEach((button) => {
        button.setAttribute("role", "tab");
        button.addEventListener("click", () => {
          this.setActiveTab(button.dataset.tab, { updateUrl: true });
        });
      });

      window.addEventListener("popstate", this.handlePopState);
      window.addEventListener("hashchange", this.handleHashChange);
    }

    handlePopState() {
      this.syncLocaleFromLocation();
      this.syncUiFromLocation(false);
    }

    handleHashChange() {
      this.syncUiFromLocation(false);
    }

    syncLocaleFromLocation() {
      const nextLocale = this.resolveLocaleFromLocation();
      if (nextLocale !== this.locale) {
        this.locale = nextLocale;
        this.applyLocale();
      }
    }

    syncUiFromLocation(shouldPushState) {
      const mode = this.resolveViewMode();
      this.setViewMode(mode);

      if (mode === VIEW_MODE.POLICIES) {
        const tabId = this.resolveTabFromLocation();
        this.setActiveTab(tabId, { updateUrl: shouldPushState });
      }
    }

    getSearchParams() {
      return new URLSearchParams(window.location.search);
    }

    isTruthyParam(value) {
      if (value === null) {
        return false;
      }

      return TRUTHY_VALUES.has(value.toLowerCase());
    }

    isValidTab(tabId) {
      return Boolean(tabId) && this.panelById.has(tabId);
    }

    normalizeLocale(locale) {
      if (!locale) {
        return DEFAULT_LOCALE;
      }

      const normalized = locale.toLowerCase();
      if (normalized === "uk") {
        return "ua";
      }

      if (SUPPORTED_LOCALES.has(normalized)) {
        return normalized;
      }

      return DEFAULT_LOCALE;
    }

    resolveLocaleFromLocation() {
      const params = this.getSearchParams();
      for (const key of LOCALE_PARAMS) {
        const rawValue = params.get(key);
        if (rawValue) {
          return this.normalizeLocale(rawValue);
        }
      }
      return DEFAULT_LOCALE;
    }

    getTranslation(key) {
      const localized = I18N[this.locale] && I18N[this.locale][key];
      if (localized) {
        return localized;
      }

      return I18N[DEFAULT_LOCALE][key] || "";
    }

    applyLocale() {
      document.documentElement.lang = this.locale === "ua" ? "uk" : this.locale;

      this.translatableElements.forEach((element) => {
        const key = element.dataset.i18n;
        if (!key) {
          return;
        }

        const value = this.getTranslation(key);
        if (value) {
          element.textContent = value;
        }
      });

      this.translatableAriaElements.forEach((element) => {
        const key = element.dataset.i18nAriaLabel;
        if (!key) {
          return;
        }

        const value = this.getTranslation(key);
        if (value) {
          element.setAttribute("aria-label", value);
        }
      });

      this.updateLocalizedTabLinks();
      this.updateShowcaseContent();
    }

    updateLocalizedTabLinks() {
      this.tabLinks.forEach((link) => {
        const tab = link.dataset.tabLink;
        if (!tab) {
          return;
        }

        const url = new URL(window.location.href);
        url.search = "";
        url.hash = "";
        url.searchParams.set(TAB_PARAM, tab);

        if (this.locale !== DEFAULT_LOCALE) {
          url.searchParams.set("locale", this.locale);
        }

        link.setAttribute("href", `${url.pathname}${url.search}`);
      });
    }

    resolveViewMode() {
      const params = this.getSearchParams();
      const tabParam = params.get(TAB_PARAM);
      const normalizedTabParam = tabParam ? tabParam.toLowerCase() : null;

      // Legal/account deep links always have priority over landing mode params.
      if (this.isValidTab(tabParam)) {
        return VIEW_MODE.POLICIES;
      }

      if (normalizedTabParam && LANDING_TAB_VALUES.has(normalizedTabParam)) {
        return VIEW_MODE.LANDING;
      }

      const hasLandingModeValue = MODE_VALUE_PARAMS
        .map((key) => params.get(key))
        .filter(Boolean)
        .map((value) => value.toLowerCase())
        .some((value) => LANDING_MODE_VALUES.has(value));

      if (hasLandingModeValue) {
        return VIEW_MODE.LANDING;
      }

      const hasLandingFlag = MODE_FLAG_PARAMS.some((key) => this.isTruthyParam(params.get(key)));
      if (hasLandingFlag) {
        return VIEW_MODE.LANDING;
      }

      return VIEW_MODE.POLICIES;
    }

    setViewMode(mode) {
      const isLanding = mode === VIEW_MODE.LANDING;

      this.landingPage.hidden = !isLanding;
      this.policyPage.hidden = isLanding;
      document.title = isLanding ? this.getTranslation("title.landing") : this.getTranslation("title.policies");

      if (isLanding) {
        this.startShowcaseCarousel();
      } else {
        this.stopShowcaseCarousel();
      }
    }

    resolveTabFromLocation() {
      const params = this.getSearchParams();
      const tabParam = params.get(TAB_PARAM);

      if (this.isValidTab(tabParam)) {
        return tabParam;
      }

      const hashTab = window.location.hash.replace("#", "");
      if (this.isValidTab(hashTab)) {
        return hashTab;
      }

      return DEFAULT_TAB;
    }

    setActiveTab(tabId, options = {}) {
      const { updateUrl = true } = options;

      if (!this.isValidTab(tabId)) {
        return;
      }

      this.tabs.forEach((button) => {
        const isActive = button.dataset.tab === tabId;
        button.classList.toggle("active", isActive);
        button.setAttribute("aria-selected", String(isActive));
        button.setAttribute("tabindex", isActive ? "0" : "-1");
      });

      this.panels.forEach((panel) => {
        panel.classList.toggle("active", panel.id === tabId);
      });

      if (updateUrl) {
        this.pushUrlForTab(tabId);
      }
    }

    pushUrlForTab(tabId) {
      const url = new URL(window.location.href);
      url.searchParams.set(TAB_PARAM, tabId);

      if (this.locale !== DEFAULT_LOCALE) {
        url.searchParams.set("locale", this.locale);
      } else {
        url.searchParams.delete("locale");
        url.searchParams.delete("lang");
        url.searchParams.delete("lng");
      }

      LANDING_CLEANUP_PARAMS.forEach((key) => {
        const value = url.searchParams.get(key);
        if (value === null) {
          return;
        }

        if (key === "landing" || key === "promo") {
          url.searchParams.delete(key);
          return;
        }

        if (LANDING_MODE_VALUES.has(value.toLowerCase())) {
          url.searchParams.delete(key);
        }
      });

      url.hash = tabId;
      window.history.pushState({ tab: tabId, locale: this.locale }, "", url);
    }

    getShowcaseImagesForLocale() {
      return SHOWCASE_IMAGES[this.locale] || SHOWCASE_IMAGES[DEFAULT_LOCALE] || FALLBACK_SHOWCASE_IMAGES;
    }

    setImageWithFallback(imageElement, candidates) {
      if (!imageElement || !Array.isArray(candidates) || candidates.length === 0) {
        return;
      }

      let index = 0;
      const tryNext = () => {
        if (index >= candidates.length) {
          return;
        }

        imageElement.src = candidates[index];
        index += 1;
      };

      imageElement.onerror = () => {
        tryNext();
      };

      tryNext();
    }

    updateShowcaseContent() {
      if (!this.showcasePrimary || !this.showcaseSecondary) {
        return;
      }

      const localeImages = this.getShowcaseImagesForLocale();
      const candidatesFirst = [localeImages[0], FALLBACK_SHOWCASE_IMAGES[0], FALLBACK_SHOWCASE_IMAGES[1]].filter(Boolean);
      const candidatesSecond = [localeImages[1], FALLBACK_SHOWCASE_IMAGES[1], FALLBACK_SHOWCASE_IMAGES[0]].filter(Boolean);

      this.setImageWithFallback(this.showcasePrimary, candidatesFirst);
      this.setImageWithFallback(this.showcaseSecondary, candidatesSecond);

      this.showcasePrimary.alt = this.getTranslation("showcase.alt.dashboard");
      this.showcaseSecondary.alt = this.getTranslation("showcase.alt.training");
    }

    startShowcaseCarousel() {
      if (!this.showcasePrimary || !this.showcaseSecondary) {
        return;
      }

      this.stopShowcaseCarousel();
      this.showcaseIndex = 0;
      this.renderShowcaseFrame();

      this.showcaseTimer = window.setInterval(() => {
        this.showcaseIndex = this.showcaseIndex === 0 ? 1 : 0;
        this.renderShowcaseFrame();
      }, 3800);
    }

    stopShowcaseCarousel() {
      if (this.showcaseTimer !== null) {
        window.clearInterval(this.showcaseTimer);
        this.showcaseTimer = null;
      }
    }

    renderShowcaseFrame() {
      const isPrimaryActive = this.showcaseIndex === 0;

      if (this.showcasePrimary) {
        this.showcasePrimary.classList.toggle("is-active", isPrimaryActive);
      }

      if (this.showcaseSecondary) {
        this.showcaseSecondary.classList.toggle("is-active", !isPrimaryActive);
      }

      this.showcaseDots.forEach((dot, index) => {
        dot.classList.toggle("is-active", index === this.showcaseIndex);
      });
    }
  }

  new GrippoSiteController().init();
})();
