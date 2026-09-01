class VideoPopup {
  constructor() {
    this.root = document.getElementById('video-popup')
    this.frame_box = this.root ? this.root.querySelector('.video-popup-frame') : null
    this.embed_url = 'https://www.youtube-nocookie.com/embed/kKZ37mUspvQ?autoplay=1&rel=0'
    this.onKeydown = this.onKeydown.bind(this)
  }

  bind() {
    if (!this.root || !this.frame_box) return

    document.querySelectorAll('.watch-video-btn').forEach((btn) => {
      btn.addEventListener('click', (event) => {
        event.preventDefault()
        this.open()
      })
    })

    this.root.querySelector('.video-popup-backdrop')?.addEventListener('click', () => {
      this.close()
    })

    this.root.querySelector('.video-popup-close')?.addEventListener('click', () => {
      this.close()
    })
  }

  open() {
    if (!this.frame_box.querySelector('iframe')) {
      const frame = document.createElement('iframe')
      frame.src = this.embed_url
      frame.title = 'Tesera trailer'
      frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
      frame.allowFullscreen = true
      this.frame_box.appendChild(frame)
    }

    this.root.classList.add('show')
    this.root.setAttribute('aria-hidden', 'false')
    document.body.classList.add('fixed')
    document.addEventListener('keydown', this.onKeydown)
  }

  close() {
    this.root.classList.remove('show')
    this.root.setAttribute('aria-hidden', 'true')
    document.body.classList.remove('fixed')
    document.removeEventListener('keydown', this.onKeydown)
    this.frame_box.innerHTML = ''
  }

  onKeydown(event) {
    if (event.key === 'Escape') {
      this.close()
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const video_popup = new VideoPopup()
  video_popup.bind()
})
