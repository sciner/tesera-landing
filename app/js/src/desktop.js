// Desktop-specific JavaScript (screens >= 768px)
const container = document.querySelector('.main-container.desktop');

function updateClipPath() {
  container.querySelectorAll('.popup').forEach((popup) => {
    const height = popup.offsetHeight;
    const y1 = Math.max(140, Math.min(height / 2 - 10, 140));
    const y2 = Math.max(100, Math.min(height / 2 - 10, 100));
    popup.style.setProperty('--clip-y1', `${y1}px`);
    popup.style.setProperty('--clip-y2', `${y2}px`);
  });
}

function initSvgHoverInfo() {
  // Store scene/target pairs for active popups
  const activePopups = new Map();

  [1, 2, 3, 4].forEach((sceneId) => {
    const sceneElement = container.querySelector(`.scene-${sceneId}`);
    if (!sceneElement) return;

    // Hover to show outline on char-item
    sceneElement.addEventListener(
      'mouseenter',
      (e) => {
        const infoElement = e.target.closest('.info');
        if (infoElement) {
          const targetId = infoElement.dataset.targetId;
          if (targetId) {
            const charItems = sceneElement.querySelectorAll(
              `.char-item[data-target-id="${targetId}"]`
            );
            if (charItems.length > 1) {
              charItems.forEach((item) => {
                item.classList.add('show-outline');
              });
            } else {
              charItems[0]?.classList.add('show-outline');
            }
          }
        }
      },
      true
    );

    sceneElement.addEventListener(
      'mouseleave',
      (e) => {
        const infoElement = e.target.closest('.info');
        if (infoElement) {
          const targetId = infoElement.dataset.targetId;
          if (targetId) {
            const charItems = sceneElement.querySelectorAll(
              `.char-item[data-target-id="${targetId}"]`
            );
            charItems.forEach((item) => {
              item.classList.remove('show-outline');
            });
          }
        }
      },
      true
    );

    // Click to toggle popup
    sceneElement.addEventListener(
      'click',
      (e) => {
        // Don't toggle if clicking inside the popup content
        if (e.target.closest('.content')) {
          return;
        }

        const infoElement = e.target.closest('.info');
        if (infoElement) {
          const targetId = infoElement.dataset.targetId;
          if (targetId) {
            e.stopPropagation();
            toggleInfo(targetId, sceneId);
          }
        }
      },
      true
    );
  });

  function toggleInfo(targetId, sceneId) {
    const sceneElement = container.querySelector(`.scene-${sceneId}`);
    const targetInfo = sceneElement.querySelector(`.info[data-target-id="${targetId}"]`);
    const charItems = sceneElement.querySelectorAll(`.char-item[data-target-id="${targetId}"]`);

    if (!targetInfo || charItems.length === 0) return;

    const isActive = targetInfo.classList.contains('active');

    // Close all other popups in the same scene
    activePopups.forEach((data, key) => {
      if (data.sceneId === sceneId && key !== targetId) {
        const otherInfo = sceneElement.querySelector(`.info[data-target-id="${key}"]`);
        const otherCharItems = sceneElement.querySelectorAll(`.char-item[data-target-id="${key}"]`);
        otherInfo?.classList.remove('active');
        otherCharItems.forEach((item) => {
          item.classList.remove('visible');
        });
        activePopups.delete(key);
      }
    });

    // Toggle current popup
    if (!isActive) {
      targetInfo.classList.add('active');
      charItems.forEach((item) => {
        item.classList.add('visible');
      });
      activePopups.set(targetId, { sceneId, sceneElement });
    } else {
      targetInfo.classList.remove('active');
      charItems.forEach((item) => {
        item.classList.remove('visible');
      });
      activePopups.delete(targetId);
    }
  }

  // Close popup when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.info')) {
      activePopups.forEach((data, targetId) => {
        const { sceneElement } = data;
        const info = sceneElement.querySelector(`.info[data-target-id="${targetId}"]`);
        const charItems = sceneElement.querySelectorAll(`.char-item[data-target-id="${targetId}"]`);
        info?.classList.remove('active');
        charItems.forEach((item) => {
          item.classList.remove('visible');
        });
      });
      activePopups.clear();
    }
  });
}

function initHeroAnimation() {
  let header = document.querySelector('.header');
  let steps = document.querySelector('.steps');
  let levels = document.querySelector('.levels');

  gsap.to(container.querySelector('.hero-scene .clouds-front'), {
    y: '-60%',
    ease: 'none',
    scrollTrigger: {
      trigger: container.querySelector('.hero-scene'),
      start: 'top top',
      end: `bottom top`,
      scrub: true,
      onUpdate: (self) => {
        const show_chrome = self.progress >= 1;
        toggleFlag(header, 'active', show_chrome);
        toggleFlag(steps, 'visible', show_chrome);
        toggleFlag(levels, 'visible', show_chrome);
      },
    },
  });
}

function initScene1Animation() {
  const levelAnimation = initLevelLabelAnimation(1, 30, { start: 0.0, end: 0.6 });

  // Кешуємо DOM елементи для оптимізації
  const scene1Svg = container.querySelector('.scene-1 .scene-svg');
  const scene1CloudsBack = container.querySelector('.scene-1 .clouds-back');

  ScrollTrigger.create({
    trigger: container.querySelector('.scene-1'),
    start: 'top bottom',
    end: `bottom top`,
    scrub: true,
    onEnter: () => {
      if (levelAnimation) {
        levelAnimation.activateStep();
      }
    },
    onEnterBack: () => {
      if (levelAnimation) {
        levelAnimation.activateStep();
      }
    },
    onUpdate: (self) => {
      const progress = self.progress;

      if (levelAnimation) {
        levelAnimation.updateProgress(progress);
      }

      toggleFlag(scene1Svg, 'svg-active', progress >= 0.4 && progress <= 0.8);
      if (scene1CloudsBack) {
        scene1CloudsBack.style.opacity = String(Math.max(0, 1 - progress * 1.5));
      }
    },
  });

  gsap.to(container.querySelector('.scene-1 .islands-back-1'), {
    y: '140%',
    ease: 'none',
    scrollTrigger: {
      trigger: container.querySelector('.scene-1'),
      start: `top bottom`,
      end: 'bottom top',
      scrub: true,
    },
  });
  gsap.to(container.querySelector('.scene-1 .islands-back-2'), {
    y: '320%',
    ease: 'none',
    scrollTrigger: {
      trigger: container.querySelector('.scene-1'),
      start: `top bottom`,
      end: `bottom top`,
      scrub: true,
    },
  });

}

function initSceneTransition() {
  gsap.to(container.querySelector('.scene-transition .clouds-back'), {
    y: '-20%',
    ease: 'none',
    scrollTrigger: {
      trigger: container.querySelector('.scene-transition'),
      start: `top bottom+=${10 * VH}`,
      end: `bottom top`,
      scrub: true,
    },
  });
  gsap.to(container.querySelector('.scene-transition .clouds-front'), {
    y: '-40%',
    ease: 'none',
    scrollTrigger: {
      trigger: container.querySelector('.scene-transition'),
      start: `top bottom+=${15 * VH}`,
      end: `bottom top`,
      scrub: true,
    },
  });
}

function initScene2Animation() {
  const levelAnimation = initLevelLabelAnimation(2, 20, { start: 0.1, end: 0.4 });

  const scene2Svg = container.querySelector('.scene-2 .scene-svg');

  ScrollTrigger.create({
    trigger: container.querySelector('.scene-2'),
    start: 'top bottom',
    end: `bottom top`,
    scrub: true,
    anticipatePin: 1,
    onEnter: () => {
      if (levelAnimation) {
        levelAnimation.activateStep();
      }
    },
    onEnterBack: () => {
      if (levelAnimation) {
        levelAnimation.activateStep();
      }
    },
    onUpdate: (self) => {
      const progress = self.progress;
      if (levelAnimation) {
        const { start, end } = levelAnimation.progressRange;
        if (progress >= start && progress <= end) {
          levelAnimation.updateProgress(progress);
        }
      }
      toggleFlag(scene2Svg, 'svg-active', progress >= 0.1 && progress <= 0.85);
    },
  });

  gsap.to(container.querySelector('.scene-2 .islands-back-2'), {
    y: '100%',
    opacity: 0,
    ease: 'none',
    scrollTrigger: {
      trigger: container.querySelector('.scene-2'),
      start: `top bottom`,
      end: `bottom bottom`,
      scrub: true,
    },
  });

}

function initScene3Animation() {
  const levelAnimation = initLevelLabelAnimation(3, 40, { start: 0.1, end: 0.4 });

  const scene3Svg = container.querySelector('.scene-3 .scene-svg');

  ScrollTrigger.create({
    trigger: container.querySelector('.scene-3'),
    start: `top bottom`,
    end: `bottom top`,
    scrub: true,
    anticipatePin: 1,
    // invalidateOnRefresh: true, // Закоментовано для оптимізації продуктивності
    // fastScrollEnd: true, // Закоментовано для оптимізації продуктивності
    onEnter: () => {
      if (levelAnimation) {
        levelAnimation.activateStep();
      }
    },
    onEnterBack: () => {
      if (levelAnimation) {
        levelAnimation.activateStep();
      }
    },
    onUpdate: (self) => {
      const progress = self.progress;

      if (levelAnimation) {
        const { start, end } = levelAnimation.progressRange;
        if (progress >= start && progress <= end) {
          levelAnimation.updateProgress(progress);
        }
      }
    },
  });

  ScrollTrigger.create({
    trigger: container.querySelector('.scene-3'),
    start: 'top bottom',
    end: 'bottom bottom',
    onUpdate: (self) => {
      toggleFlag(scene3Svg, 'svg-active', self.progress >= 0.3 && self.progress <= 0.98);
    },
  });

  gsap.to(container.querySelector('.scene-3 .islands-back-2'), {
    y: `-65%`,
    ease: 'none',
    scrollTrigger: {
      trigger: container.querySelector('.scene-3'),
      start: `top bottom`,
      end: `bottom bottom-=${300 * VH}`,
      scrub: true,
    },
  });
}

function initScene4Animation() {
  let header = document.querySelector('.header');
  let steps = document.querySelector('.steps');
  let levels = document.querySelector('.levels');

  const levelAnimation = initLevelLabelAnimation(4, 40, { start: 0.2, end: 0.4 });

  // Кешуємо DOM елемент для оптимізації
  const scene4Svg = container.querySelector('.scene-4 .scene-svg');

  ScrollTrigger.create({
    trigger: container.querySelector('.scene-4'),
    start: `top bottom `,
    end: `bottom top`,
    scrub: true,
    anticipatePin: 1,
    onEnter: () => {
      if (levelAnimation) {
        levelAnimation.activateStep();
      }
    },
    onEnterBack: () => {
      if (levelAnimation) {
        levelAnimation.activateStep();
      }
    },
    onUpdate: (self) => {
      const progress = self.progress;

      if (levelAnimation) {
        levelAnimation.updateProgress(progress);
      }
      const show_chrome = progress < 0.9;
      toggleFlag(header, 'active', show_chrome);
      toggleFlag(steps, 'visible', show_chrome);
      toggleFlag(levels, 'visible', show_chrome);
    },
  });

  ScrollTrigger.create({
    trigger: container.querySelector('.scene-4'),
    start: 'top bottom',
    end: 'bottom bottom',
    onUpdate: (self) => {
      toggleFlag(scene4Svg, 'svg-active', self.progress >= 0.4 && self.progress <= 1);
    },
  });

  gsap.to(container.querySelector('.scene-4 .islands-back-2'), {
    y: `-100%`,
    ease: 'none',
    scrollTrigger: {
      trigger: container.querySelector('.scene-4'),
      start: `top bottom`,
      end: `bottom bottom`,
      scrub: true,
    },
  });
}

// ===== Ініціалізація =====
function initDesktop() {
  updateClipPath();
  initSvgHoverInfo();
  initHeroAnimation();
  initScene1Animation();
  initSceneTransition();
  initScene2Animation();
  initScene3Animation();
  initScene4Animation();
  window.scrollPerf?.bindTriggers();
}

// Run immediately if DOM is ready, otherwise wait for DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDesktop);
} else {
  initDesktop();
}
