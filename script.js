const tabs = Array.from(document.querySelectorAll(".tab-button"));
const panels = Array.from(document.querySelectorAll("[data-tab-panel]"));
const tabMap = new Map(panels.map((panel) => [panel.id, panel]));
const defaultTab = "privacy";

const getTabFromLocation = () => {
  const params = new URLSearchParams(window.location.search);
  const tabParam = params.get("tab");
  if (tabParam && tabMap.has(tabParam)) {
    return tabParam;
  }

  const hash = window.location.hash.replace("#", "");
  if (hash && tabMap.has(hash)) {
    return hash;
  }

  return defaultTab;
};

const setActiveTab = (tabId, updateUrl = true) => {
  if (!tabMap.has(tabId)) {
    return;
  }

  tabs.forEach((button) => {
    const isActive = button.dataset.tab === tabId;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", String(isActive));
    button.setAttribute("tabindex", isActive ? "0" : "-1");
  });

  panels.forEach((panel) => {
    panel.classList.toggle("active", panel.id === tabId);
  });

  if (updateUrl) {
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tabId);
    url.hash = tabId;
    window.history.pushState({ tab: tabId }, "", url);
  }
};

tabs.forEach((button) => {
  button.setAttribute("role", "tab");
  button.addEventListener("click", () => {
    setActiveTab(button.dataset.tab);
  });
});

window.addEventListener("popstate", () => {
  setActiveTab(getTabFromLocation(), false);
});

window.addEventListener("hashchange", () => {
  setActiveTab(getTabFromLocation(), false);
});

setActiveTab(getTabFromLocation(), false);
