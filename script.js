(() => {
  "use strict";

  const VIEW_MODE = {
    LANDING: "landing",
    POLICIES: "policies",
  };

  const TITLE_BY_MODE = {
    [VIEW_MODE.LANDING]: "Grippo | Workouts That Make Sense",
    [VIEW_MODE.POLICIES]: "Grippo Policies",
  };

  const TAB_PARAM = "tab";
  const DEFAULT_TAB = "privacy";

  const MODE_VALUE_PARAMS = ["view", "page", "mode"];
  const MODE_FLAG_PARAMS = ["landing", "promo"];
  const LANDING_MODE_VALUES = new Set(["landing", "promo"]);
  const TRUTHY_VALUES = new Set(["", "1", "true", "yes"]);

  const LANDING_CLEANUP_PARAMS = ["landing", "promo", "view", "page", "mode"];

  class GrippoSiteController {
    constructor() {
      this.landingPage = document.getElementById("landingPage");
      this.policyPage = document.getElementById("policyPage");

      this.tabs = Array.from(document.querySelectorAll(".tab-button"));
      this.panels = Array.from(document.querySelectorAll("[data-tab-panel]"));
      this.panelById = new Map(this.panels.map((panel) => [panel.id, panel]));

      this.handlePopState = this.handlePopState.bind(this);
      this.handleHashChange = this.handleHashChange.bind(this);
    }

    init() {
      if (!this.landingPage || !this.policyPage) {
        return;
      }

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
      this.syncUiFromLocation(false);
    }

    handleHashChange() {
      this.syncUiFromLocation(false);
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

    resolveViewMode() {
      const params = this.getSearchParams();
      const tabParam = params.get(TAB_PARAM);

      // Legal/account deep links always have priority over landing mode params.
      if (this.isValidTab(tabParam)) {
        return VIEW_MODE.POLICIES;
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
      document.title = TITLE_BY_MODE[mode] || TITLE_BY_MODE[VIEW_MODE.POLICIES];
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
      window.history.pushState({ tab: tabId }, "", url);
    }
  }

  new GrippoSiteController().init();
})();
