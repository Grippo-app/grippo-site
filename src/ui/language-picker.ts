/** Dismisses the language menu with Escape, outside clicks and keyboard exit. */
export function initLanguagePicker(): void {
  const picker = document.querySelector<HTMLDetailsElement>('.language-picker')
  const summary = picker?.querySelector<HTMLElement>('summary')
  if (!picker || !summary) return

  picker.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !picker.open) return
    event.preventDefault()
    picker.open = false
    summary.focus()
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
