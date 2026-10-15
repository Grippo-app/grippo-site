/** Opens app screenshots at a readable size, using the native dialog focus trap. */
export function initScreenZoom(): void {
  const dialog = document.querySelector<HTMLDialogElement>('#screenZoomDialog')
  const image = dialog?.querySelector<HTMLImageElement>('[data-zoom-image]')
  const closeButton = dialog?.querySelector<HTMLButtonElement>('[data-zoom-close]')
  if (!dialog || !image || !closeButton || typeof dialog.showModal !== 'function') return

  let activeTrigger: HTMLButtonElement | null = null

  document.querySelectorAll<HTMLButtonElement>('button[data-screen-zoom]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const selector = trigger.dataset.zoomSource
      const source = selector
        ? document.querySelector<HTMLImageElement>(selector)
        : trigger.closest('.phone-stage')?.querySelector<HTMLImageElement>('img.phone-shot.is-active')
      if (!source || dialog.open) return

      image.src = source.currentSrc || source.src
      image.alt = source.alt
      activeTrigger = trigger
      dialog.showModal()
      dialog.scrollTop = 0
      document.body.classList.add('screenshot-open')
      closeButton.focus()
    })
  })

  closeButton.addEventListener('click', () => dialog.close())
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return
    const bounds = dialog.getBoundingClientRect()
    if (event.clientX < bounds.left || event.clientX > bounds.right ||
        event.clientY < bounds.top || event.clientY > bounds.bottom) {
      dialog.close()
    }
  })
  dialog.addEventListener('close', () => {
    document.body.classList.remove('screenshot-open')
    if (activeTrigger?.isConnected) activeTrigger.focus({ preventScroll: true })
    activeTrigger = null
  })
}
