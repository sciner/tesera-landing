// ===== Утиліти =====
let VH = window.innerHeight / 100;
let REM = parseFloat(getComputedStyle(document.documentElement).fontSize);

// Update navigation button text based on current page
function updateNavButton() {
  const navButton = document.getElementById('nav-button');
  const header = document.querySelector('.header');

  if (navButton && header) {
    const currentPath = window.location.pathname;
    if (
      currentPath.includes('roadmap') ||
      currentPath.includes('privacy') ||
      currentPath.includes('legal')
    ) {
      navButton.textContent = 'Back to Main';
      navButton.href = './';
      header.classList.add('active');
    } else {
      navButton.textContent = 'Roadmap';
      navButton.href = './roadmap.html';
      header.classList.remove('active');
    }
  }
}

// Get the currently visible main container (desktop or mobile)
function getActiveContainer() {
  const desktop = document.querySelector('.main-container.desktop');
  const mobile = document.querySelector('.main-container.mobile');

  // Check which one is visible
  if (desktop && getComputedStyle(desktop).display !== 'none') {
    return desktop;
  }
  if (mobile && getComputedStyle(mobile).display !== 'none') {
    return mobile;
  }
  return desktop || mobile; // Fallback
}

function toggleFlag(el, class_name, is_on) {
  if (!el) return;
  if (el.classList.contains(class_name) === is_on) return;
  el.classList.toggle(class_name, is_on);
}

// Debounce resize events
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Cookie Popup Management
function initCookiePopup() {
  const cookiePopup = document.getElementById('cookiePopup');
  const acceptBtn = document.getElementById('cookieAccept');
  const declineBtn = document.getElementById('cookieDecline');

  if (!cookiePopup) return;

  const cookieConsent = localStorage.getItem('cookieConsent');

  if (!cookieConsent) {
    setTimeout(() => {
      cookiePopup.classList.add('show');
    }, 1000);
  }

  // Handle Accept button
  acceptBtn?.addEventListener('click', () => {
    localStorage.setItem('cookieConsent', 'accepted');
    cookiePopup.classList.remove('show');
    // Here you can initialize analytics or other tracking
  });

  // Handle Decline button
  declineBtn?.addEventListener('click', () => {
    localStorage.setItem('cookieConsent', 'declined');
    cookiePopup.classList.remove('show');
  });
}

// Update on resize with debounce
const handleResize = debounce(() => {
  VH = window.innerHeight / 100;
  REM = parseFloat(getComputedStyle(document.documentElement).fontSize);
  refreshLevelLabels();
  ScrollTrigger.refresh();
  if (typeof updateClipPath === 'function') {
    updateClipPath();
  }
}, 250);

function lazyLoadVideos() {
  const videoObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const video = entry.target;
          const sources = video.querySelectorAll('source[data-src]');
          sources.forEach((source) => {
            source.src = source.dataset.src;
            source.removeAttribute('data-src');
          });
          video.load();
          video.play().catch(() => {}); // Handle autoplay restrictions
          videoObserver.unobserve(video);
        }
      });
    },
    { rootMargin: '200px' }
  );

  const container = getActiveContainer();
  const videos = container ? container.querySelectorAll('video') : [];
  videos.forEach((video) => {
    videoObserver.observe(video);
  });
}

function updateTierDisplay(sceneNumber) {
  const tierLevelEl = document.querySelector('.tier-level');
  const tierSuffixEl = document.querySelector('.tier-suffix');
  const tierImages = document.querySelectorAll('.tier-image');

  const tierData = {
    1: { level: '4', suffix: 'tier' },
    2: { level: '1/2', suffix: 'tier' },
    3: { level: '3', suffix: 'tier' },
    4: { level: '4', suffix: 'tier' },
  };

  if (tierLevelEl && tierSuffixEl && tierData[sceneNumber]) {
    tierLevelEl.textContent = tierData[sceneNumber].level;
    tierSuffixEl.textContent = tierData[sceneNumber].suffix;
  }

  // Update tier images
  tierImages.forEach((img, index) => {
    if (index === sceneNumber - 1) {
      img.classList.add('visible');
    } else {
      img.classList.remove('visible');
    }
  });
}

const level_label_anims = [];

function refreshLevelLabels() {
  level_label_anims.forEach((anim) => {
    anim.timeline.invalidate();
    anim.sync();
  });
}

function initLevelLabelAnimation(sceneNumber, yOffset, progressRange = { start: 0.55, end: 0.7 }) {
  const container = getActiveContainer();
  const stepLabels = document.querySelectorAll('.fixed-panels .step');
  const bigLevelLabel = container.querySelector(`.level-label.level-${sceneNumber}`);

  if (!bigLevelLabel) return null;

  const stepIndex = sceneNumber - 1;
  let last_progress = 0;

  const activateStep = () => {
    stepLabels.forEach((label) => label.classList.remove('active'));
    if (stepLabels[stepIndex]) {
      stepLabels[stepIndex].classList.add('active');
    }
    updateTierDisplay(sceneNumber);
  };

  // y in px from current rem — rem is vw-based, so it must be read on each invalidate
  const tlLabel = gsap
    .timeline({
      paused: true,
    })
    .to(bigLevelLabel, {
      y: () => -yOffset * REM,
      ease: 'none',
      duration: 1,
    });

  const updateProgress = (progress) => {
    last_progress = progress;
    const { start, end } = progressRange;
    const local = (progress - start) / (end - start);
    const clamped = Math.max(0, Math.min(1, local));
    tlLabel.progress(clamped);
  };

  const anim = {
    trigger: container.querySelector(`.scene-${sceneNumber}`),
    timeline: tlLabel,
    progressRange: progressRange,
    activateStep: activateStep,
    updateProgress: updateProgress,
    sync: () => {
      updateProgress(last_progress);
    },
  };

  level_label_anims.push(anim);
  return anim;
}

function animateHero() {
  const container = getActiveContainer();
  if (!container) return;
  const hero = container.querySelector('.hero');
  gsap.set(hero, { opacity: 1 });
  const tl = gsap.timeline({
    defaults: {
      ease: 'power3.out',
      duration: 1,
    },
    delay: 0.6,
  });

  tl.from(hero.querySelector('.logo'), {
    opacity: 0,
    y: 40,
    scale: 0.95,
  })
    .from(
      hero.querySelector('.title'),
      {
        opacity: 0,
        y: 40,
        scale: 0.95,
      },
      '-=0.85'
    )
    .from(
      hero.querySelector('.subtitle'),
      {
        opacity: 0,
        y: 40,
        scale: 0.95,
      },
      '-=0.8'
    )
    .from(
      hero.querySelector('.btns'),
      {
        opacity: 0,
        y: 20,
        scale: 0.95,
        stagger: 0.2,
      },
      '-=0.8'
    );
}

function initSceneGalleryTransition() {
  const container = getActiveContainer();
  if (!container) return;

  // Only the visible desktop/mobile copy — hidden duplicate grids get broken trigger positions
  container.querySelectorAll('.gallery .grid').forEach((grid) => {
    gsap.to(grid, {
      y: '-80%',
      ease: 'none',
      scrollTrigger: {
        trigger: grid,
        start: `top bottom`,
        end: 'bottom center',
        scrub: true,
      },
    });
  });
}

function initRoadmapNavigation() {
  const roadmapStages = document.querySelectorAll('.roadmap-stage');
  const steps = document.querySelectorAll('.step');
  const stageBgs = document.querySelectorAll('.fixed-bg');
  const arrow = document.querySelector('.arrow');

  if (!roadmapStages.length || !steps.length) return;

  // Set initial opacity for all backgrounds
  stageBgs.forEach((bg, idx) => {
    gsap.set(bg, { opacity: idx === 0 ? 1 : 0 });
  });

  roadmapStages.forEach((stage, index) => {
    const currentBg = stageBgs[index];

    // Parallax effect for background
    if (currentBg) {
      gsap.to(currentBg, {
        y: '-20%',
        ease: 'none',
        scrollTrigger: {
          trigger: stage,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });
    }

    // Handle active step and background opacity
    ScrollTrigger.create({
      trigger: stage,
      start: 'top center',
      end: 'bottom center',
      onEnter: () => {
        steps.forEach((step) => step.classList.remove('active'));
        steps[index]?.classList.add('active');

        stageBgs.forEach((bg, idx) => {
          gsap.to(bg, { opacity: idx === index ? 1 : 0, overwrite: 'auto' });
        });
      },
      onEnterBack: () => {
        steps.forEach((step) => step.classList.remove('active'));
        steps[index]?.classList.add('active');

        stageBgs.forEach((bg, idx) => {
          gsap.to(bg, { opacity: idx === index ? 1 : 0, overwrite: 'auto' });
        });
      },
    });
  });

  // Handle arrow animation on last stage
  if (arrow && roadmapStages.length > 0) {
    const lastStage = roadmapStages[roadmapStages.length - 1];

    ScrollTrigger.create({
      trigger: lastStage,
      start: 'bottom bottom+=200',
      onEnter: () => {
        arrow.classList.add('slide-right');
      },
      onLeaveBack: () => {
        arrow.classList.remove('slide-right');
      },
    });
  }
}

function initRoadmapDotsAnimation() {
  const dotsLine = document.querySelector('.line[data-segment="1"]');

  if (!dotsLine) return;

  // Looped fill animation from orange to blue (left to right)
  gsap.fromTo(
    dotsLine,
    {
      '--fill-progress': '0%',
    },
    {
      '--fill-progress': '100%',
      duration: 2,
      ease: 'none',
      repeat: -1,
    }
  );
}

function initBackgroundParallax() {
  const pageBg = document.querySelector('.text-page .fixed-bg');
  // Parallax effect for background
  if (pageBg) {
    gsap.to(pageBg, {
      y: '-20%',
      ease: 'none',
      scrollTrigger: {
        trigger: '.text-page',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
      },
    });
  }
}

function initMobileMenu() {
  const burger = document.querySelector('.header .burger');
  const menu = document.querySelector('.header .btns');
  const logo = document.querySelector('.header .logo');
  const body = document.body;

  if (!burger || !menu) return;

  function openMenu() {
    burger.classList.add('active');
    menu.classList.add('active');
    body.classList.add('fixed');
    logo?.classList.add('hidden');
  }

  function closeMenu() {
    burger.classList.remove('active');
    menu.classList.remove('active');
    body.classList.remove('fixed');
    logo?.classList.remove('hidden');
  }

  burger.addEventListener('click', (e) => {
    e.stopPropagation();
    if (burger.classList.contains('active')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Close menu when clicking on menu items
  menu.querySelectorAll('.btn').forEach((btn) => {
    btn.addEventListener('click', closeMenu);
  });
}

// ===== Ініціалізація =====
document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
  // document.querySelectorAll('.scene').forEach(sec => new CanvasSequence(sec));

  ScrollTrigger.config({
    limitCallbacks: true, // Limit unnecessary callbacks
    syncInterval: 150, // Reduce sync frequency
  });

  const landing = getActiveContainer();
  const sliders = landing ? landing.querySelectorAll('.splide') : [];
  sliders.forEach((splideElement) => {
    new Splide(splideElement, {
      type: 'loop',
      perPage: 1,
      perMove: 1,
      gap: '1rem',
      arrows: true,
      pagination: true,
      autoplay: false,
    }).mount();
  });

  lazyLoadVideos();
  animateHero();
  initSceneGalleryTransition();
  initRoadmapNavigation();
  initRoadmapDotsAnimation();
  updateNavButton();
  initBackgroundParallax();
  initMobileMenu();
  initCookiePopup();

  // Refresh ScrollTrigger after all images load
  window.addEventListener(
    'load',
    () => {
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        if (!window.location.hash) {
          window.scrollTo(0, 0);
        }
      });

      const is_low_end =
        navigator.hardwareConcurrency <= 4 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);

      if (is_low_end) {
        ScrollTrigger.getAll().forEach((st) => {
          if (st.vars.scrub) st.vars.scrub = 0;
        });
      }

      // Handle hash navigation after page is fully loaded
      if (window.location.hash) {
        const hash = window.location.hash;
        const target = document.querySelector(hash);
        if (target) {
          // offsetTop считается от offsetParent, а не от документа — берём реальную позицию
          window.scrollTo(0, target.getBoundingClientRect().top + window.scrollY);

          setTimeout(() => {
            document.documentElement.style.scrollBehavior = 'smooth';
          }, 100);
        }
      }
    },
    { once: true }
  );
  // Add resize handler with debounce
  window.addEventListener('resize', handleResize);
});
