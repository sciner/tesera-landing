history.scrollRestoration = 'manual'
window.scrollTo(0, 0)

class PageLoader {
  constructor() {
    this.root = document.getElementById('page-loader')
    this.min_ms = 450
    this.max_ms = 10000
    this.started_at = performance.now()
    this.hidden = false
  }

  bind() {
    if (!this.root) return

    this.lockScroll()

    if (document.readyState === 'complete') {
      this.hide()
      return
    }

    window.addEventListener('load', () => {
      this.hide()
    }, { once: true })

    window.setTimeout(() => {
      this.hide()
    }, this.max_ms)
  }

  lockScroll() {
    document.documentElement.classList.add('page-loading')
    document.body.classList.add('page-loading')
    window.scrollTo(0, 0)
  }

  unlockScroll() {
    document.documentElement.classList.remove('page-loading')
    document.body.classList.remove('page-loading')
    this.keepAtTop()
  }

  keepAtTop() {
    // при переходе по якорю (#stage) позицию не трогаем, ей управляет hash-навигация
    if (window.location.hash) return

    window.scrollTo(0, 0)
    requestAnimationFrame(() => {
      window.scrollTo(0, 0)
      requestAnimationFrame(() => {
        window.scrollTo(0, 0)
      })
    })
  }

  hide() {
    if (this.hidden || !this.root) return

    const elapsed = performance.now() - this.started_at
    const wait = Math.max(0, this.min_ms - elapsed)

    window.setTimeout(() => {
      if (this.hidden || !this.root) return
      this.hidden = true
      this.root.classList.add('hidden')
      this.root.setAttribute('aria-busy', 'false')
      this.unlockScroll()
      this.root.addEventListener('transitionend', () => {
        this.root.remove()
        this.keepAtTop()
      }, { once: true })
    }, wait)
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const page_loader = new PageLoader()
  page_loader.bind()
})
