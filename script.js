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

  const FALLBACK_SHOWCASE_IMAGES = [
    "assets/account.management/screen_home.png",
    "assets/account.management/screen_profile.png",
    "assets/account.management/screen_settings.png",
  ];

  const SHOWCASE_SLIDE_KEYS = ["dashboard", "training", "exercises", "muscles"];

  const SHOWCASE_IMAGE_CANDIDATES = {
    en: {
      dashboard: ["assets/screenshots/dashboard_en.png"],
      training: ["assets/screenshots/training_en.png"],
      exercises: ["assets/screenshots/exercises_en.png"],
      muscles: ["assets/screenshots/muscles_en.png"],
    },
    ua: {
      dashboard: ["assets/screenshots/dashboard_ua.png"],
      training: ["assets/screenshots/training_ua.png"],
      exercises: ["assets/screenshots/exercises_ua.png"],
      muscles: ["assets/screenshots/muscles_ua.png"],
    },
    ru: {
      dashboard: ["assets/screenshots/dashboard_ru.png"],
      training: ["assets/screenshots/training_ru.png"],
      exercises: ["assets/screenshots/exercises_ru.png"],
      muscles: ["assets/screenshots/muscles_ru.png"],
    },
  };

  const STORE_LINKS = {
    appStore: {
      en: "https://apps.apple.com/us?utm_source=landing&utm_medium=web&utm_campaign=launch&utm_content=ios_en",
      ua: "https://apps.apple.com/ua?utm_source=landing&utm_medium=web&utm_campaign=launch&utm_content=ios_ua",
      ru: "https://apps.apple.com/ru?utm_source=landing&utm_medium=web&utm_campaign=launch&utm_content=ios_ru",
    },
    googlePlay: {
      en: "https://play.google.com/store/apps/details?id=com.grippo.app&utm_source=landing&utm_medium=web&utm_campaign=launch&utm_content=android_en",
      ua: "https://play.google.com/store/apps/details?id=com.grippo.app&utm_source=landing&utm_medium=web&utm_campaign=launch&utm_content=android_ua",
      ru: "https://play.google.com/store/apps/details?id=com.grippo.app&utm_source=landing&utm_medium=web&utm_campaign=launch&utm_content=android_ru",
    },
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
      "landing.showcase.prevAria": "Previous screenshot",
      "landing.showcase.nextAria": "Next screenshot",
      "landing.kpi.days.label": "Active days",
      "landing.kpi.volume.label": "Volume growth",
      "landing.kpi.balance.label": "Muscle balance",
      "landing.kpi.section.eyebrow": "Performance Snapshot",
      "landing.kpi.section.title": "Your progress in clear numbers",
      "landing.kpi.section.subtitle": "No noise, only the metrics that move your next workout decision.",
      "landing.features.first.title": "Smart insights, not templates",
      "landing.features.first.body":
        "Understand overload and underload by muscle group. Grippo helps you decide when to push harder and when to recover, based on your own training history.",
      "landing.features.second.title": "Full workout control",
      "landing.features.second.body":
        "Log workouts quickly, review exercise stats, and visualize muscle load in a clean, distraction-free interface. Spend less time tapping and more time understanding.",
      "landing.features.third.title": "Built for serious training",
      "landing.features.third.body":
        "Grippo is for people who train regularly, care about measurable progress, and want to know why results appear or disappear.",
      "landing.audience.eyebrow": "For Whom",
      "landing.audience.first.title": "Train regularly",
      "landing.audience.first.body": "Stay focused on progressive overload and consistent volume.",
      "landing.audience.second.title": "Track numbers",
      "landing.audience.second.body": "Measure real output instead of relying on vague motivation.",
      "landing.audience.third.title": "Need clear decisions",
      "landing.audience.third.body": "Know what to change in your next workout with confidence.",
      "landing.cta.eyebrow": "Start With Your First Workout",
      "landing.cta.title": "Open the app, log your session, and see what others do not show.",
      "landing.cta.subtitle": "Grippo gives you a clear snapshot of your training right now.",
      "landing.cta.download": "Download Grippo",
      "landing.cta.legal": "Open Privacy & Account",
      "landing.footer.navAria": "Legal and account links",
      "landing.footer.privacy": "Privacy Policy",
      "landing.footer.terms": "Terms & Conditions",
      "landing.footer.remove": "Account Management",
      "policies.hero.title": "Policies & Account",
      "policies.hero.subtitle": "Find the privacy policy, terms & conditions, and account removal instructions for the Grippo mobile app.",
      "policies.back": "←",
      "policies.backAria": "Back to landing",
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
      "showcase.alt.exercises": "Grippo app exercises screenshot",
      "showcase.alt.muscles": "Grippo app muscle analytics screenshot",
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
      "landing.showcase.prevAria": "Попередній скріншот",
      "landing.showcase.nextAria": "Наступний скріншот",
      "landing.kpi.days.label": "Активні дні",
      "landing.kpi.volume.label": "Зростання обсягу",
      "landing.kpi.balance.label": "Баланс м'язів",
      "landing.kpi.section.eyebrow": "Зріз прогресу",
      "landing.kpi.section.title": "Ваш прогрес у чітких цифрах",
      "landing.kpi.section.subtitle": "Без зайвого шуму, тільки метрики для рішень у наступному тренуванні.",
      "landing.features.first.title": "Розумні інсайти, а не шаблони",
      "landing.features.first.body": "Розумійте перевантаження і недовантаження по групах м'язів та коригуйте план на основі власної історії тренувань.",
      "landing.features.second.title": "Повний контроль тренувань",
      "landing.features.second.body": "Швидко фіксуйте тренування, переглядайте статистику і бачте розподіл навантаження без зайвих дій.",
      "landing.features.third.title": "Для тих, хто тренується системно",
      "landing.features.third.body": "Grippo для людей, яким важливі цифри, стабільність і розуміння причин результату.",
      "landing.audience.eyebrow": "Для кого",
      "landing.audience.first.title": "Тренуєтесь регулярно",
      "landing.audience.first.body": "Фокус на прогресивному навантаженні та стабільному обсязі.",
      "landing.audience.second.title": "Працюєте з цифрами",
      "landing.audience.second.body": "Вимірюйте реальний результат замість абстрактної мотивації.",
      "landing.audience.third.title": "Потрібні чіткі рішення",
      "landing.audience.third.body": "Точно знайте, що змінити у наступному тренуванні.",
      "landing.cta.eyebrow": "Почніть з першого тренування",
      "landing.cta.title": "Відкрийте додаток, запишіть тренування і побачте те, що інші не показують.",
      "landing.cta.subtitle": "Grippo показує чесний зріз вашої форми вже зараз.",
      "landing.cta.download": "Завантажити Grippo",
      "landing.cta.legal": "Відкрити політики та акаунт",
      "landing.footer.navAria": "Посилання на політики та керування акаунтом",
      "landing.footer.privacy": "Політика конфіденційності",
      "landing.footer.terms": "Умови використання",
      "landing.footer.remove": "Керування акаунтом",
      "policies.hero.title": "Політики та акаунт",
      "policies.hero.subtitle": "Тут ви знайдете політику конфіденційності, умови використання та інструкцію з видалення акаунта Grippo.",
      "policies.back": "←",
      "policies.backAria": "Назад на лендинг",
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
      "showcase.alt.exercises": "Скріншот вправ Grippo",
      "showcase.alt.muscles": "Скріншот аналітики м'язів Grippo",
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
      "landing.showcase.prevAria": "Предыдущий скриншот",
      "landing.showcase.nextAria": "Следующий скриншот",
      "landing.kpi.days.label": "Активные дни",
      "landing.kpi.volume.label": "Рост объема",
      "landing.kpi.balance.label": "Баланс мышц",
      "landing.kpi.section.eyebrow": "Срез прогресса",
      "landing.kpi.section.title": "Ваш прогресс в понятных цифрах",
      "landing.kpi.section.subtitle": "Без лишнего шума, только метрики для решений в следующей тренировке.",
      "landing.features.first.title": "Умные инсайты вместо шаблонов",
      "landing.features.first.body": "Понимайте перегруз и недогруз по мышечным группам и корректируйте план на основе вашей истории тренировок.",
      "landing.features.second.title": "Полный контроль тренировок",
      "landing.features.second.body": "Быстро фиксируйте тренировки, смотрите статистику упражнений и анализируйте нагрузку без лишних действий.",
      "landing.features.third.title": "Для тех, кто тренируется регулярно",
      "landing.features.third.body": "Grippo создан для тех, кому важны цифры, контроль и понимание причин результата.",
      "landing.audience.eyebrow": "Для кого",
      "landing.audience.first.title": "Тренируетесь регулярно",
      "landing.audience.first.body": "Фокус на прогрессивной нагрузке и стабильном объеме.",
      "landing.audience.second.title": "Следите за цифрами",
      "landing.audience.second.body": "Измеряйте реальный результат вместо абстрактной мотивации.",
      "landing.audience.third.title": "Нужны четкие решения",
      "landing.audience.third.body": "Точно понимайте, что менять в следующей тренировке.",
      "landing.cta.eyebrow": "Начните с первой тренировки",
      "landing.cta.title": "Откройте приложение, запишите тренировку и увидьте то, чего не показывают другие.",
      "landing.cta.subtitle": "Grippo показывает честный срез вашего прогресса уже сейчас.",
      "landing.cta.download": "Скачать Grippo",
      "landing.cta.legal": "Открыть политики и аккаунт",
      "landing.footer.navAria": "Ссылки на политики и управление аккаунтом",
      "landing.footer.privacy": "Политика конфиденциальности",
      "landing.footer.terms": "Условия использования",
      "landing.footer.remove": "Управление аккаунтом",
      "policies.hero.title": "Политики и аккаунт",
      "policies.hero.subtitle": "Здесь вы найдете политику конфиденциальности, условия использования и инструкции по удалению аккаунта Grippo.",
      "policies.back": "←",
      "policies.backAria": "Назад на лендинг",
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
      "showcase.alt.exercises": "Скриншот упражнений Grippo",
      "showcase.alt.muscles": "Скриншот аналитики мышц Grippo",
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
      this.landingLinks = Array.from(document.querySelectorAll("[data-landing-link]"));

      this.showcasePrimary = document.getElementById("phoneShotPrimary");
      this.showcaseSecondary = document.getElementById("phoneShotSecondary");
      this.showcaseStage = document.querySelector(".phone-stage");
      this.showcasePrev = document.getElementById("phonePrev");
      this.showcaseNext = document.getElementById("phoneNext");
      this.showcaseDotsContainer = document.getElementById("phoneDots");
      this.showcaseDots = [];
      this.showcaseTimer = null;
      this.showcaseIndex = 0;
      this.showcaseSlides = [];
      this.showcaseActiveSlot = 0;
      this.kpiValues = Array.from(document.querySelectorAll("[data-kpi-target]"));
      this.kpiAnimated = false;
      this.kpiObserver = null;
      this.revealTargets = Array.from(document.querySelectorAll("[data-reveal]"));
      this.revealObserver = null;

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
      this.setupRevealObserver();
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

      if (this.showcasePrev) {
        this.showcasePrev.addEventListener("click", () => {
          this.advanceShowcaseFrame(-1, true);
        });
      }

      if (this.showcaseNext) {
        this.showcaseNext.addEventListener("click", () => {
          this.advanceShowcaseFrame(1, true);
        });
      }

      if (this.showcaseStage) {
        this.showcaseStage.addEventListener("mouseenter", () => this.stopShowcaseCarousel());
        this.showcaseStage.addEventListener("mouseleave", () => this.startShowcaseCarousel());
      }

      window.addEventListener("popstate", this.handlePopState);
      window.addEventListener("hashchange", this.handleHashChange);
    }

    setupRevealObserver() {
      if (this.revealTargets.length === 0) {
        return;
      }

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      this.revealTargets.forEach((target, index) => {
        target.classList.add("reveal-item");
        target.style.setProperty("--reveal-delay", `${Math.min(index * 60, 360)}ms`);
        if (reduceMotion) {
          target.classList.add("is-visible");
        }
      });

      if (reduceMotion) {
        return;
      }

      if (this.revealObserver) {
        this.revealObserver.disconnect();
      }

      this.revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              return;
            }

            entry.target.classList.add("is-visible");
            if (this.revealObserver) {
              this.revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
      );

      this.revealTargets.forEach((target) => this.revealObserver.observe(target));
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

      this.updateLocalizedNavigationLinks();
      this.updateStoreLinks();
      this.updateShowcaseContent();
      this.setupKpiObserver();
    }

    updateLocalizedNavigationLinks() {
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

      this.landingLinks.forEach((link) => {
        const url = new URL(window.location.href);
        url.search = "";
        url.hash = "";
        url.searchParams.set(TAB_PARAM, "landing");

        if (this.locale !== DEFAULT_LOCALE) {
          url.searchParams.set("locale", this.locale);
        }

        link.setAttribute("href", `${url.pathname}${url.search}`);
      });
    }

    updateStoreLinks() {
      const locale = this.locale in STORE_LINKS.appStore ? this.locale : DEFAULT_LOCALE;
      const appStoreUrl = STORE_LINKS.appStore[locale] || STORE_LINKS.appStore[DEFAULT_LOCALE];
      const googlePlayUrl = STORE_LINKS.googlePlay[locale] || STORE_LINKS.googlePlay[DEFAULT_LOCALE];
      const preferredStore = this.detectPreferredStore();

      const storeLinks = Array.from(document.querySelectorAll("[data-store]"));
      storeLinks.forEach((link) => {
        const storeType = link.dataset.store;
        if (storeType === "app-store") {
          link.setAttribute("href", appStoreUrl);
        } else if (storeType === "google-play") {
          link.setAttribute("href", googlePlayUrl);
        } else if (storeType === "auto") {
          link.setAttribute("href", preferredStore === "google-play" ? googlePlayUrl : appStoreUrl);
        }
      });
    }

    detectPreferredStore() {
      const ua = (navigator.userAgent || "").toLowerCase();
      const platform = (navigator.platform || "").toLowerCase();
      const hasTouch = navigator.maxTouchPoints > 1;

      const isAndroid = ua.includes("android");
      const isIphone = ua.includes("iphone") || ua.includes("ipod");
      const isIpad = ua.includes("ipad") || (platform.includes("mac") && hasTouch);

      if (isAndroid) {
        return "google-play";
      }

      if (isIphone || isIpad) {
        return "app-store";
      }

      return "app-store";
    }

    setupKpiObserver() {
      if (this.kpiAnimated || this.kpiValues.length === 0 || this.resolveViewMode() !== VIEW_MODE.LANDING) {
        return;
      }

      if (this.kpiObserver) {
        this.kpiObserver.disconnect();
      }

      this.kpiObserver = new IntersectionObserver(
        (entries) => {
          const shouldAnimate = entries.some((entry) => entry.isIntersecting);
          if (!shouldAnimate) {
            return;
          }

          this.kpiAnimated = true;
          this.kpiValues.forEach((element) => this.animateKpiCounter(element));
          if (this.kpiObserver) {
            this.kpiObserver.disconnect();
            this.kpiObserver = null;
          }
        },
        { threshold: 0.35 }
      );

      const observedTarget = this.kpiValues[0] ? this.kpiValues[0].closest(".kpi-grid") : null;
      if (observedTarget) {
        this.kpiObserver.observe(observedTarget);
      }
    }

    animateKpiCounter(element) {
      const target = Number(element.dataset.kpiTarget || "0");
      const suffix = element.dataset.kpiSuffix || "";
      const duration = 1100;
      const start = performance.now();

      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.round(target * eased);
        element.textContent = `${value}${suffix}`;

        if (progress < 1) {
          window.requestAnimationFrame(tick);
        }
      };

      window.requestAnimationFrame(tick);
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
        this.setupKpiObserver();
      } else {
        this.stopShowcaseCarousel();
      }

      window.requestAnimationFrame(() => this.ensureVisibleForCurrentView());
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

      this.ensureVisibleForCurrentView();

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

    getShowcaseSlidesForLocale() {
      const localized = SHOWCASE_IMAGE_CANDIDATES[this.locale] || SHOWCASE_IMAGE_CANDIDATES[DEFAULT_LOCALE] || {};
      const defaultLocalized = SHOWCASE_IMAGE_CANDIDATES[DEFAULT_LOCALE] || {};

      return SHOWCASE_SLIDE_KEYS.map((key, index) => {
        const fallbackImage = FALLBACK_SHOWCASE_IMAGES[index % FALLBACK_SHOWCASE_IMAGES.length];
        const candidates = [
          ...(localized[key] || []),
          ...(defaultLocalized[key] || []),
          fallbackImage,
          ...FALLBACK_SHOWCASE_IMAGES,
        ].filter(Boolean);

        return {
          key,
          candidates: [...new Set(candidates)],
        };
      }).filter((slide) => slide.candidates.length > 0);
    }

    setImageWithFallback(imageElement, candidates, onResolved) {
      if (!imageElement || !Array.isArray(candidates) || candidates.length === 0) {
        return;
      }

      let index = 0;
      const tryNext = () => {
        if (index >= candidates.length) {
          return;
        }

        const candidate = candidates[index];
        imageElement.src = candidate;
        index += 1;
      };

      imageElement.onerror = () => {
        tryNext();
      };

      imageElement.onload = () => {
        if (typeof onResolved === "function") {
          onResolved(imageElement.src);
        }
      };

      tryNext();
    }

    updateShowcaseContent() {
      if (!this.showcasePrimary || !this.showcaseSecondary) {
        return;
      }

      this.showcaseSlides = this.getShowcaseSlidesForLocale();
      if (this.showcaseSlides.length === 0) {
        return;
      }

      this.showcaseIndex = 0;
      this.showcaseActiveSlot = 0;
      this.renderShowcaseDots(this.showcaseSlides.length);

      const firstSlide = this.showcaseSlides[0];
      this.setImageWithFallback(this.showcasePrimary, firstSlide.candidates);
      this.showcasePrimary.alt = this.getTranslation(`showcase.alt.${firstSlide.key}`);
      this.showcasePrimary.classList.add("is-active");
      this.showcaseSecondary.classList.remove("is-active");

      const secondSlide = this.showcaseSlides[1] || firstSlide;
      this.setImageWithFallback(this.showcaseSecondary, secondSlide.candidates);
      this.showcaseSecondary.alt = this.getTranslation(`showcase.alt.${secondSlide.key}`);
    }

    startShowcaseCarousel() {
      if (!this.showcasePrimary || !this.showcaseSecondary || this.showcaseSlides.length <= 1) {
        this.renderShowcaseFrame();
        return;
      }

      this.stopShowcaseCarousel();
      this.renderShowcaseFrame();

      this.showcaseTimer = window.setInterval(() => {
        this.advanceShowcaseFrame(1, false);
      }, 3800);
    }

    stopShowcaseCarousel() {
      if (this.showcaseTimer !== null) {
        window.clearInterval(this.showcaseTimer);
        this.showcaseTimer = null;
      }
    }

    renderShowcaseFrame() {
      this.showcaseDots.forEach((dot, index) => {
        dot.classList.toggle("is-active", index === this.showcaseIndex);
        dot.setAttribute("aria-current", index === this.showcaseIndex ? "true" : "false");
      });
    }

    advanceShowcaseFrame(direction = 1, restartTimer = false) {
      if (!this.showcasePrimary || !this.showcaseSecondary || this.showcaseSlides.length <= 1) {
        return;
      }

      const normalizedDirection = direction >= 0 ? 1 : -1;
      const nextIndex = (this.showcaseIndex + normalizedDirection + this.showcaseSlides.length) % this.showcaseSlides.length;
      const hiddenSlot = this.showcaseActiveSlot === 0 ? 1 : 0;
      const hiddenElement = hiddenSlot === 0 ? this.showcasePrimary : this.showcaseSecondary;
      const visibleElement = hiddenSlot === 0 ? this.showcaseSecondary : this.showcasePrimary;
      const nextSlide = this.showcaseSlides[nextIndex];

      this.setImageWithFallback(hiddenElement, nextSlide.candidates);
      hiddenElement.alt = this.getTranslation(`showcase.alt.${nextSlide.key}`);

      visibleElement.classList.remove("is-active");
      hiddenElement.classList.add("is-active");

      this.showcaseActiveSlot = hiddenSlot;
      this.showcaseIndex = nextIndex;
      this.renderShowcaseFrame();

      if (restartTimer) {
        this.startShowcaseCarousel();
      }
    }

    goToShowcaseSlide(nextIndex) {
      if (!Number.isInteger(nextIndex) || nextIndex < 0 || nextIndex >= this.showcaseSlides.length || nextIndex === this.showcaseIndex) {
        return;
      }

      const direction = nextIndex > this.showcaseIndex ? 1 : -1;
      this.advanceShowcaseFrame(direction, true);
      while (this.showcaseIndex !== nextIndex) {
        this.advanceShowcaseFrame(direction, false);
      }
    }

    renderShowcaseDots(count) {
      if (!this.showcaseDotsContainer) {
        this.showcaseDots = [];
        return;
      }

      this.showcaseDotsContainer.innerHTML = "";
      this.showcaseDots = [];

      for (let i = 0; i < count; i += 1) {
        const dot = document.createElement("span");
        dot.className = "phone-dot";
        dot.setAttribute("role", "button");
        dot.setAttribute("tabindex", "0");
        dot.setAttribute("aria-label", `Go to screenshot ${i + 1}`);
        dot.addEventListener("click", () => this.goToShowcaseSlide(i));
        dot.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            this.goToShowcaseSlide(i);
          }
        });
        this.showcaseDotsContainer.appendChild(dot);
        this.showcaseDots.push(dot);
      }

      this.renderShowcaseFrame();
    }

    ensureVisibleForCurrentView() {
      const mode = this.resolveViewMode();

      if (mode === VIEW_MODE.POLICIES) {
        const activePanel = this.panels.find((panel) => panel.classList.contains("active"));
        if (activePanel && activePanel.classList.contains("reveal-item") && !activePanel.classList.contains("is-visible")) {
          window.requestAnimationFrame(() => activePanel.classList.add("is-visible"));
        }
      }
    }
  }

  new GrippoSiteController().init();
})();
