class ScrollPerf {
  constructor() {
    this.io = null
    this.groups = new Map()
  }

  start() {
    this.tuneGsap()
    this.markAsyncImages()
  }

  tuneGsap() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return
    gsap.ticker.lagSmoothing(500, 33)
    ScrollTrigger.config({
      limitCallbacks: true,
      ignoreMobileResize: true,
      autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load',
    })
  }

  markAsyncImages() {
    const container = document.querySelector('.main-container.desktop, .main-container.mobile')
    if (!container) return
    container.querySelectorAll('img').forEach((img, index) => {
      img.decoding = 'async'
      if (index > 8 && !img.getAttribute('loading')) {
        img.loading = 'lazy'
      }
    })
  }

  bindTriggers() {
    if (typeof ScrollTrigger === 'undefined') return
    if (this.io) {
      this.io.disconnect()
    }

    this.groups = new Map()
    ScrollTrigger.getAll().forEach((st) => {
      const node = st.trigger
      if (!node || !node.closest) return
      const section = node.closest('.scene, .gallery, .hero-final') || node
      if (!this.groups.has(section)) {
        this.groups.set(section, [])
      }
      this.groups.get(section).push(st)
    })

    const margin = navigator.hardwareConcurrency <= 4 ? '30% 0px' : '60% 0px'

    this.io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          this.setSectionLive(entry.target, entry.isIntersecting)
        })
      },
      { rootMargin: margin }
    )

    this.groups.forEach((_, section) => {
      this.io.observe(section)
    })
  }

  setSectionLive(section, is_live) {
    toggleFlag(section, 'is-live', is_live)

    const triggers = this.groups.get(section)
    if (triggers) {
      triggers.forEach((st) => {
        if (is_live) {
          if (!st.enabled) {
            st.enable()
          }
        } else if (st.enabled) {
          // keep current transforms so off-screen layers do not snap back
          st.disable(false)
        }
      })
    }

    section.querySelectorAll('video').forEach((video) => {
      if (is_live) {
        video.play().catch(() => {})
      } else {
        video.pause()
      }
    })
  }
}

window.scrollPerf = new ScrollPerf()

document.addEventListener('DOMContentLoaded', () => {
  window.scrollPerf.start()
})

window.addEventListener(
  'load',
  () => {
    window.scrollPerf.bindTriggers()
  },
  { once: true }
)
