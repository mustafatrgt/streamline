if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
if (!window.location.hash && window.scrollY > 0) {
  window.scrollTo(0, 0);
}

document.addEventListener('DOMContentLoaded', () => {
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const closeMenuBtn = document.getElementById('close-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  function openMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove('translate-x-full');
    if (mobileMenuBtn) mobileMenuBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.add('translate-x-full');
    if (mobileMenuBtn) mobileMenuBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openMenu);
  if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeMenu);

  mobileLinks.forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  const SMOOTH_SCROLL_DURATION = 100;
  function smoothScrollTo(targetY) {
    const startY = window.scrollY;
    const startTime = performance.now();

    function step(now) {
      const t = Math.min((now - startTime) / SMOOTH_SCROLL_DURATION, 1);
      const eased = 1 - Math.pow(1 - t, 2);
      window.scrollTo(0, Math.round(startY + (targetY - startY) * eased));
      if (t < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    const id = anchor.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;

    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.scrollY;
      smoothScrollTo(y);
    });
  });

  const heroEndSentinel = document.getElementById('hero-end-sentinel');
  const scrollToTopBtn = document.getElementById('scroll-to-top');
  if (heroEndSentinel && scrollToTopBtn) {
    const topButtonObserver = new IntersectionObserver((entries) => {
      const entry = entries[0];
      scrollToTopBtn.setAttribute('aria-hidden', entry && entry.isIntersecting ? 'true' : 'false');
    }, {
      root: null,
      threshold: 0,
      rootMargin: '-50px 0px 0px 0px',
    });

    topButtonObserver.observe(heroEndSentinel);
    scrollToTopBtn.addEventListener('click', () => {
      smoothScrollTo(0);
    });
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, {
    root: null,
    rootMargin: '0px',
    threshold: 0.15,
  });

  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  revealElements.forEach((el) => observer.observe(el));

  const portfolioProjects = {
    'leaside-toronto': {
      location: 'Leaside, Toronto, ON',
      title: 'Poolside Privacy Fence Installation',
      image: 'img/portfolio-1.avif',
      imageSrcset: 'img/portfolio-1-480.avif 480w, img/portfolio-1-960.avif 960w, img/portfolio-1.avif 1536w',
      imageSizes: '(max-width: 767px) calc(100vw - 4rem), (max-width: 1279px) 52vw, 540px',
      imageAlt: 'Poolside privacy fence project in Leaside, Toronto',
      summary: 'This backyard upgrade was completed for a family pool zone that needed stronger privacy and cleaner lines from every adjacent lot angle.',
      details: [
        'Built on Bayview-side residential lot with uneven grade corrections.',
        'Installed premium cedar boards with reinforced horizontal rails.',
        'Integrated gate opening for pool maintenance and service access.',
        'Finished with low-visibility hardware for a seamless modern look.',
      ],
    },
    'oakville-lakeshore': {
      location: 'Old Oakville, ON',
      title: 'Lakeshore Estate Perimeter Build',
      image: 'img/portfolio-2.avif',
      imageSrcset: 'img/portfolio-2-480.avif 480w, img/portfolio-2-960.avif 960w, img/portfolio-2.avif 1536w',
      imageSizes: '(max-width: 767px) calc(100vw - 4rem), (max-width: 1279px) 52vw, 540px',
      imageAlt: 'Estate perimeter fencing project in Old Oakville',
      summary: 'A full perimeter replacement around a legacy property where the owners wanted higher security without compromising curb aesthetics.',
      details: [
        'Completed on a mature lot with tree-root-sensitive post planning.',
        'Combined privacy sections and decorative transitions toward street frontage.',
        'Delivered weather-resistant finishes for wind-heavy seasonal exposure.',
        'Coordinated phased install to keep driveway and service path active.',
      ],
    },
    'vaughan-maple': {
      location: 'Maple, Vaughan, ON',
      title: 'Modern Slat and Gate System',
      image: 'img/portfolio-3.avif',
      imageSrcset: 'img/portfolio-3-480.avif 480w, img/portfolio-3-960.avif 960w, img/portfolio-3.avif 1536w',
      imageSizes: '(max-width: 767px) calc(100vw - 4rem), (max-width: 1279px) 52vw, 540px',
      imageAlt: 'Modern slat and gate fence system in Maple, Vaughan',
      summary: 'This project focused on a contemporary visual profile for a newly renovated home with strict alignment and spacing requirements.',
      details: [
        'Custom slat spacing calibrated for privacy and architectural symmetry.',
        'Heavy-duty gate frame built for frequent family and delivery traffic.',
        'Post caps and trim matched to exterior facade tones.',
        'Final reveal line leveled to preserve clean perspective from driveway view.',
      ],
    },
    'ottawa-nepean': {
      location: 'Nepean, Ottawa, ON',
      title: 'Shared-Line Neighbour Fence Project',
      image: 'img/portfolio-4.avif',
      imageSrcset: 'img/portfolio-4-480.avif 480w, img/portfolio-4-960.avif 960w, img/portfolio-4.avif 1536w',
      imageSizes: '(max-width: 767px) calc(100vw - 4rem), (max-width: 1279px) 52vw, 540px',
      imageAlt: 'Shared-line backyard fence project in Nepean, Ottawa',
      summary: 'A coordinated neighbour split install where both properties required a single, consistent build with clear scope and shared approvals.',
      details: [
        'Executed on a shared boundary with synchronized neighbor scheduling.',
        'Used reinforced base strategy to reduce long-term panel movement.',
        'Maintained independent access zones during installation windows.',
        'Delivered unified finish with transparent cost and scope documentation.',
      ],
    },
  };

  const portfolioModal = document.getElementById('portfolio-modal');
  const portfolioCards = document.querySelectorAll('.portfolio-card[data-portfolio-id]');
  const portfolioModalLocation = document.getElementById('portfolio-modal-location');
  const portfolioModalTitle = document.getElementById('portfolio-modal-title');
  const portfolioModalImage = document.getElementById('portfolio-modal-image');
  const portfolioModalSummary = document.getElementById('portfolio-modal-summary');
  const portfolioModalDetails = document.getElementById('portfolio-modal-details');
  let portfolioOverflowBackup = '';
  let portfolioLastTrigger = null;

  function openPortfolioModal(projectId, triggerEl) {
    if (!portfolioModal) return;
    const project = portfolioProjects[projectId];
    if (!project) return;
    if (!portfolioModalLocation || !portfolioModalTitle || !portfolioModalImage || !portfolioModalSummary || !portfolioModalDetails) return;

    portfolioLastTrigger = triggerEl || null;
    portfolioModalLocation.textContent = project.location;
    portfolioModalTitle.textContent = project.title;
    portfolioModalImage.srcset = project.imageSrcset || '';
    portfolioModalImage.sizes = project.imageSizes || '';
    portfolioModalImage.src = project.image;
    portfolioModalImage.alt = project.imageAlt || project.title;
    portfolioModalSummary.textContent = project.summary;
    portfolioModalDetails.innerHTML = '';

    project.details.forEach((detail) => {
      const item = document.createElement('li');
      item.textContent = detail;
      portfolioModalDetails.appendChild(item);
    });

    portfolioOverflowBackup = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    portfolioModal.classList.add('is-open');
    portfolioModal.setAttribute('aria-hidden', 'false');
  }

  function closePortfolioModal() {
    if (!portfolioModal || !portfolioModal.classList.contains('is-open')) return;
    portfolioModal.classList.remove('is-open');
    portfolioModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = portfolioOverflowBackup;
    if (portfolioLastTrigger) portfolioLastTrigger.focus();
  }

  if (portfolioModal && portfolioCards.length > 0) {
    portfolioCards.forEach((card) => {
      card.addEventListener('click', () => {
        openPortfolioModal(card.dataset.portfolioId, card);
      });
    });

    portfolioModal.addEventListener('click', (event) => {
      if (event.target.closest('[data-portfolio-close="true"]')) {
        closePortfolioModal();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closePortfolioModal();
      }
    });
  }

  document.addEventListener('mousemove', (e) => {
    document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
    document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
  });

  const poster = document.getElementById('hero-video-poster');
  const heroSection = document.getElementById('hero');
  const videoDesktop = document.getElementById('hero-video-desktop');
  const videoMobile = document.getElementById('hero-video-mobile');
  const desktopQuery = window.matchMedia('(min-width: 768px)');
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const reducedDataMode = !!(connection && (connection.saveData || ['slow-2g', '2g', '3g'].includes(connection.effectiveType)));
  let isHeroInViewport = true;
  let isDocumentVisible = document.visibilityState !== 'hidden';

  function hidePoster() {
    if (!poster) return;
    poster.style.opacity = '0';
    poster.style.pointerEvents = 'none';
    setTimeout(() => {
      poster.style.visibility = 'hidden';
    }, 500);
  }

  function loadHeroVideo(videoEl) {
    if (!videoEl || videoEl.dataset.loaded === 'true') return;
    const src = videoEl.dataset.src;
    if (!src) return;

    videoEl.addEventListener('loadeddata', () => {
      videoEl.classList.add('opacity-100');
      hidePoster();
    }, { once: true });

    videoEl.src = src;
    videoEl.load();
    const playPromise = videoEl.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {
        // Autoplay can be blocked by browser policies on some devices.
      });
    }

    videoEl.dataset.loaded = 'true';
  }

  function playHeroVideo(videoEl) {
    if (!videoEl) return;
    const playPromise = videoEl.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {
        // Autoplay can be blocked by browser policies on some devices.
      });
    }
  }

  function unloadHeroVideo(videoEl) {
    if (!videoEl || videoEl.dataset.loaded !== 'true') return;
    videoEl.pause();
    videoEl.classList.remove('opacity-100');
    videoEl.removeAttribute('src');
    videoEl.load();
    videoEl.dataset.loaded = 'false';
  }

  function getHeroVideosForViewport() {
    const viewportWidths = [
      window.innerWidth,
      document.documentElement ? document.documentElement.clientWidth : 0,
      window.visualViewport ? window.visualViewport.width : 0,
      window.screen ? window.screen.width : 0,
    ].filter((value) => Number.isFinite(value) && value > 0);

    const viewportWidth = viewportWidths.length > 0 ? Math.min(...viewportWidths) : window.innerWidth;
    const desktopActive = viewportWidth >= 768 || desktopQuery.matches;
    const activeVideo = desktopActive ? videoDesktop : videoMobile;
    const inactiveVideo = desktopActive ? videoMobile : videoDesktop;

    return { activeVideo, inactiveVideo };
  }

  function syncHeroVideoForViewport() {
    if (reducedDataMode) return;

    const { activeVideo, inactiveVideo } = getHeroVideosForViewport();
    unloadHeroVideo(inactiveVideo);

    if (!isHeroInViewport || !isDocumentVisible) {
      if (activeVideo && activeVideo.dataset.loaded === 'true') {
        activeVideo.pause();
      }
      return;
    }

    if (activeVideo && activeVideo.dataset.loaded === 'true') {
      playHeroVideo(activeVideo);
      return;
    }

    loadHeroVideo(activeVideo);
  }

  const scheduleHeroVideo = () => {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(syncHeroVideoForViewport, { timeout: 1200 });
    } else {
      setTimeout(syncHeroVideoForViewport, 400);
    }
  };

  if (document.readyState === 'complete') {
    scheduleHeroVideo();
  } else {
    window.addEventListener('load', scheduleHeroVideo, { once: true });
  }

  if (heroSection) {
    const heroRect = heroSection.getBoundingClientRect();
    isHeroInViewport = heroRect.bottom > 0 && heroRect.top < window.innerHeight;

    const heroVisibilityObserver = new IntersectionObserver((entries) => {
      const entry = entries[0];
      isHeroInViewport = !!(entry && entry.isIntersecting);
      syncHeroVideoForViewport();
    }, {
      root: null,
      threshold: 0.05,
    });

    heroVisibilityObserver.observe(heroSection);
  }

  document.addEventListener('visibilitychange', () => {
    isDocumentVisible = document.visibilityState !== 'hidden';
    syncHeroVideoForViewport();
  });

  if (desktopQuery.addEventListener) {
    desktopQuery.addEventListener('change', syncHeroVideoForViewport);
  } else if (desktopQuery.addListener) {
    desktopQuery.addListener(syncHeroVideoForViewport);
  }
});
