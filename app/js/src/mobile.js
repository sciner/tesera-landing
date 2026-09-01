// Mobile-specific JavaScript (screens < 768px)

const container = document.querySelector('.main-container.mobile');

function initSvgClickInfo() {
  let activePopup = null;
  let activePopupParent = null;
  let mobilePortal = document.querySelector('.mobile-popup-portal');

  [1, 2, 3, 4].forEach((sceneId) => {
    const sceneElement = container?.querySelector(`.scene-${sceneId}`);
    if (!sceneElement) return;

    // Handle clicks on info icons and char items
    sceneElement.addEventListener(
      'click',
      (e) => {
        const charItem = e.target.closest('.char-item');
        const infoIcon = e.target.closest('.icon');
        const popup = e.target.closest('.popup');

        // If clicking inside popup, don't close it
        if (popup) {
          e.stopPropagation();
          return;
        }

        // If clicking on icon or char item, toggle popup
        if (charItem || infoIcon) {
          e.stopPropagation();

          // Get targetId from the clicked element or its parent
          let targetId = null;
          if (charItem) {
            // For SVG char-item, get data-target-id directly from the element
            targetId = charItem.getAttribute('data-target-id');
          } else if (infoIcon) {
            // For info icon, get from parent .info
            const parentInfo = infoIcon.closest('.info');
            targetId = parentInfo?.dataset.targetId;
          }

          if (targetId) {
            const targetInfo = container.querySelector(
              `.scene-${sceneId} .info[data-target-id="${targetId}"]`
            );
            const targetCharItem = sceneElement.querySelector(
              `.char-item[data-target-id="${targetId}"]`
            );

            // If this popup is already active, close it
            if (activePopup === targetInfo) {
              closeActivePopup();
            } else {
              // Close any other open popup first
              closeActivePopup();

              // Open this popup
              if (targetInfo) {
                const popupElement = targetInfo.querySelector('.popup');
                if (popupElement) {
                  // Move popup to portal for proper centering
                  mobilePortal?.appendChild(popupElement);
                  mobilePortal?.classList.add('active');
                  targetInfo.classList.add('active');

                  // Add visible class to char-item
                  if (targetCharItem) {
                    targetCharItem.classList.add('visible');
                  }

                  activePopup = targetInfo;
                  activePopupParent = targetInfo;
                  // Trigger animation after DOM update
                  requestAnimationFrame(() => {
                    popupElement.classList.add('visible');
                  });
                }
              }
            }
          }
        }
      },
      true
    );
  });

  // Close popup when clicking on portal backdrop
  mobilePortal?.addEventListener('click', (e) => {
    if (e.target === mobilePortal) {
      closeActivePopup();
    }
  });

  // Close popup when touching outside (mobile)
  mobilePortal?.addEventListener(
    'touchstart',
    (e) => {
      if (e.target === mobilePortal) {
        closeActivePopup();
      }
    },
    { passive: false }
  );

  // Close popup when clicking outside
  container?.addEventListener('click', (e) => {
    const popup = e.target.closest('.popup');
    const infoIcon = e.target.closest('.icon');
    const charItem = e.target.closest('.char-item');

    // If not clicking on popup, icon, or char item, close active popup
    if (!popup && !infoIcon && !charItem) {
      closeActivePopup();
    }
  });

  function closeActivePopup() {
    if (activePopup && activePopupParent) {
      const popupElement = mobilePortal.querySelector('.popup');
      const savedParent = activePopupParent; // Capture parent reference before nulling

      // Remove visible class from ALL char-items across all scenes
      container.querySelectorAll('.char-item.visible').forEach((item) => {
        item.classList.remove('visible');
      });

      // Restore body scroll
      document.body.style.overflow = '';

      if (popupElement) {
        // Fade out animation
        popupElement.classList.remove('visible');
        // Wait for animation to complete before moving element back
        setTimeout(() => {
          // Move popup back to its original parent using saved reference
          savedParent.appendChild(popupElement);
          mobilePortal.classList.remove('active');
        }, 300); // Match CSS transition duration
      } else {
        mobilePortal.classList.remove('active');
      }
      activePopup.classList.remove('active');
      activePopup = null;
      activePopupParent = null;
    }
  }
}

function initScene1Animation() {
  let header = document.querySelector('.header');
  let steps = document.querySelector('.steps');
  let levels = document.querySelector('.levels');

  const levelAnimation = initLevelLabelAnimation(1, 20, { start: 0.1, end: 0.4 });

  // Кешуємо DOM елементи для оптимізації
  const scene1Svg = container.querySelector('.scene-1 .scene-svg');
  const scene1CloudsBack = container.querySelector('.scene-1 .clouds-back');

  ScrollTrigger.create({
    trigger: container.querySelector('.hero-scene'),
    start: 'top top',
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
        levelAnimation.updateProgress(progress / 2);
      }
      if (progress >= 0.9) {
        header?.classList.add('active');
        steps?.classList.add('visible');
        levels?.classList.add('visible');
      } else {
        header?.classList.remove('active');
        steps?.classList.remove('visible');
        levels?.classList.remove('visible');
      }
    },
  });

  gsap.to(container.querySelector('.scene-1 .clouds-back'), {
    y: '20%',
    ease: 'none',
    force3D: true,
    scrollTrigger: {
      trigger: container.querySelector('.hero-scene'),
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    },
  });

  gsap.to(container.querySelector('.hero-scene .clouds-front'), {
    y: '-40%',
    ease: 'none',
    force3D: true,
    scrollTrigger: {
      trigger: container.querySelector('.hero-scene'),
      start: 'top top',
      end: `bottom bottom-=${100 * VH}`,
      scrub: true,
    },
  });

  gsap.to(container.querySelector('.scene-1 .islands-back-2'), {
    y: '220%',
    ease: 'none',
    force3D: true,
    scrollTrigger: {
      trigger: container.querySelector('.scene-1'),
      start: `top bottom`,
      end: `bottom top`,
      scrub: true,
    },
  });

  gsap.to(container.querySelector('.scene-1 .main-layer'), {
    ease: 'none',
    force3D: true,
    scrollTrigger: {
      trigger: container.querySelector('.scene-1'),
      start: `top bottom`,
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => {
        const progress = self.progress;

        if (progress >= 0.3 && progress <= 0.9) {
          scene1Svg?.classList.add('svg-active');
        } else {
          scene1Svg?.classList.remove('svg-active');
        }
        if (scene1CloudsBack) {
          gsap.to(scene1CloudsBack, {
            opacity: 1 - progress * 1.5,
            ease: 'none',
          });
        }
      },
    },
  });
}

function initSceneTransitionMobile() {
  gsap.to(container.querySelector('.scene-transition .clouds-front'), {
    y: '-50%',
    ease: 'none',
    force3D: true,
    scrollTrigger: {
      trigger: container.querySelector('.scene-transition'),
      start: 'top bottom',
      end: `bottom bottom-=${10 * VH}`,
      scrub: true,
    },
  });
}

function initScene2Animation() {
  const levelAnimation = initLevelLabelAnimation(2, 30, { start: 0.01, end: 0.2 });

  // Кешуємо DOM елемент для оптимізації
  const scene2Svg = container.querySelector('.scene-2 .scene-svg');

  ScrollTrigger.create({
    trigger: container.querySelector('.scene-2'),
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
        levelAnimation.updateProgress(progress / 2);
      }
    },
  });

  gsap.to(container.querySelector('.scene-2 .islands-back-2'), {
    y: '50%',
    opacity: 0,
    ease: 'none',
    force3D: true,
    scrollTrigger: {
      trigger: container.querySelector('.scene-2'),
      start: `top bottom`,
      end: 'bottom top',
      scrub: true,
    },
  });

  gsap.to(container.querySelector('.scene-2 .main-layer'), {
    ease: 'none',
    force3D: true,
    scrollTrigger: {
      trigger: container.querySelector('.scene-2'),
      start: `top bottom`,
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => {
        const progress = self.progress;

        if (progress >= 0.3 && progress <= 0.85) {
          scene2Svg?.classList.add('svg-active');
        } else {
          scene2Svg?.classList.remove('svg-active');
        }
      },
    },
  });
}

function initScene3Animation() {
  const levelAnimation = initLevelLabelAnimation(3, 60, { start: 0.01, end: 0.3 });

  // Кешуємо DOM елемент для оптимізації
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
        levelAnimation.updateProgress(progress / 2);
      }
    },
  });

  gsap.to(container.querySelector('.scene-3 .main-layer'), {
    ease: 'none',
    force3D: true,
    scrollTrigger: {
      trigger: container.querySelector('.scene-3'),
      start: `top bottom`,
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        const progress = self.progress;
        if (progress >= 0.4 && progress <= 1) {
          scene3Svg?.classList.add('svg-active');
        } else {
          scene3Svg?.classList.remove('svg-active');
        }
      },
    },
  });
}

function initScene4Animation() {
  let header = document.querySelector('.header');
  let steps = document.querySelector('.steps');
  let levels = document.querySelector('.levels');

  const levelAnimation = initLevelLabelAnimation(4, 40, { start: 0.1, end: 0.5 });

  // Кешуємо DOM елемент для оптимізації
  const scene4Svg = container.querySelector('.scene-4 .scene-svg');

  ScrollTrigger.create({
    trigger: container.querySelector('.scene-4'),
    start: `top bottom `,
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
        levelAnimation.updateProgress(progress);
      }
      if (progress >= 0.9) {
        header?.classList.remove('active');
        steps?.classList.remove('visible');
        levels?.classList.remove('visible');
      } else {
        header?.classList.add('active');
        steps?.classList.add('visible');
        levels?.classList.add('visible');
      }
    },
  });

  gsap.to(container.querySelector('.scene-4 .main-layer'), {
    ease: 'none',
    force3D: true,
    scrollTrigger: {
      trigger: container.querySelector('.scene-4'),
      start: `top bottom`,
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        const progress = self.progress;
        if (progress >= 0.5 && progress <= 1) {
          scene4Svg?.classList.add('svg-active');
        } else {
          scene4Svg?.classList.remove('svg-active');
        }
      },
    },
  });
}

function initMobile() {
  initSvgClickInfo();
  initScene1Animation();
  initSceneTransitionMobile();
  initScene2Animation();
  initScene3Animation();
  initScene4Animation();
}

// Run immediately if DOM is ready, otherwise wait for DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMobile);
} else {
  initMobile();
}
