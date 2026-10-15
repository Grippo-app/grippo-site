import { type Locale } from '../i18n/types'
import { resolveFromParams } from '../modules/locale/locale-resolver'
import { LOCALE_PARAMS } from '../modules/locale/types'

/** Changes language in place while keeping native links for modified clicks. */
export function initLanguagePicker(onChange: () => void): void {
  const picker = document.querySelector<HTMLDetailsElement>('.language-picker')
  const summary = picker?.querySelector<HTMLElement>('summary')
  if (!picker || !summary) return

  const close = (): void => {
    picker.open = false
    summary.focus({ preventScroll: true })
  }
  const localeUrl = (locale: Locale): URL => {
    const url = new URL(window.location.href)
    LOCALE_PARAMS.forEach((param) => url.searchParams.delete(param))
    url.searchParams.set('locale', locale)
    return url
  }
  const options = Array.from(picker.querySelectorAll<HTMLAnchorElement>('.language-options a'))
    .map((link) => ({ link, locale: resolveFromParams(new URL(link.href).searchParams) }))
  const syncOptions = (): void => {
    const currentLocale = document.documentElement.lang === 'uk' ? 'ua' : document.documentElement.lang
    options.forEach(({ link, locale }) => {
      if (!locale) return
      link.href = localeUrl(locale).href
      if (locale === currentLocale) link.setAttribute('aria-current', 'true')
      else link.removeAttribute('aria-current')
    })
  }

  syncOptions()
  picker.addEventListener('toggle', syncOptions)
  new MutationObserver(syncOptions).observe(document.documentElement, {
    attributes: true, attributeFilter: ['lang'],
  })
  options.forEach(({ link, locale }) => {
    if (!locale) return
    link.addEventListener('click', (event) => {
      syncOptions()
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey ||
          event.shiftKey || event.altKey || link.target === '_blank') return

      event.preventDefault()
      const currentLocale = document.documentElement.lang === 'uk' ? 'ua' : document.documentElement.lang
      if (locale !== currentLocale) {
        window.history.pushState(null, '', localeUrl(locale))
        onChange()
      }
      close()
    })
  })

  picker.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !picker.open) return
    event.preventDefault()
    close()
  })

  document.addEventListener('click', (event) => {
    if (event.target instanceof Node && !picker.contains(event.target)) picker.open = false
  })

  picker.addEventListener('focusout', (event) => {
    if (event.relatedTarget instanceof Node && !picker.contains(event.relatedTarget)) {
      picker.open = false
    }
  })
}
