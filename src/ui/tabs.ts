import { isValidTab } from '../modules/router/router'

/**
 * Controls the policy tabs DOM.
 * Pure UI — no URL building, no routing decisions.
 * Routing is handled by the caller via the onTabChange callback.
 */
export class PolicyTabs {
  private readonly panelById: Map<string, HTMLElement>

  constructor(
    private readonly tabs: HTMLElement[],
    private readonly panels: HTMLElement[],
  ) {
    this.panelById = new Map(panels.map((p) => [p.id, p]))
  }

  setActive(tabId: string): void {
    // codestyle: early-return-null-guard
    if (!isValidTab(tabId)) return

    this.tabs.forEach((button) => {
      const isActive = (button as HTMLElement & { dataset: DOMStringMap }).dataset.tab === tabId
      button.classList.toggle('active', isActive)
      button.setAttribute('aria-selected', String(isActive))
      button.setAttribute('tabindex', isActive ? '0' : '-1')
    })

    this.panels.forEach((panel) => {
      panel.classList.toggle('active', panel.id === tabId)
    })
  }

  bindEvents(onTabChange: (tabId: string) => void): void {
    this.tabs.forEach((button, index) => {
      button.setAttribute('role', 'tab')
      button.addEventListener('click', () => {
        const tabId = (button as HTMLElement & { dataset: DOMStringMap }).dataset.tab
        if (tabId) onTabChange(tabId)
      })
      button.addEventListener('keydown', (event) => {
        if (event.altKey || event.ctrlKey || event.metaKey) return

        let nextIndex: number
        switch (event.key) {
          case 'ArrowDown':
          case 'ArrowRight':
            nextIndex = (index + 1) % this.tabs.length
            break
          case 'ArrowUp':
          case 'ArrowLeft':
            nextIndex = (index - 1 + this.tabs.length) % this.tabs.length
            break
          case 'Home':
            nextIndex = 0
            break
          case 'End':
            nextIndex = this.tabs.length - 1
            break
          default:
            return
        }

        const nextTab = this.tabs[nextIndex]
        const tabId = nextTab?.dataset.tab
        if (!tabId) return

        event.preventDefault()
        onTabChange(tabId)
        nextTab.focus()
      })
    })
  }

  ensureActiveVisible(): void {
    const activePanel = this.panels.find(
      (panel) =>
        panel.classList.contains('active') &&
        panel.classList.contains('reveal-item') &&
        !panel.classList.contains('is-visible'),
    )

    if (activePanel) {
      window.requestAnimationFrame(() => activePanel.classList.add('is-visible'))
    }
  }
}
