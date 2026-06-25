document.addEventListener('DOMContentLoaded', () => {

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
  const FRAME_MS = 12;
  const LOOP_PAUSE = 2800;

  function scrambleLoop(el) {
    const original = el.dataset.original || el.textContent.trim();
    el.dataset.original = original;

    function runOnce(onDone) {
      let frame = 0;
      const totalFrames = Math.max(10, original.length * 1.26 + 5);
      const iv = setInterval(() => {
        let out = '';
        for (let i = 0; i < original.length; i++) {
          if (original[i] === ' ') { out += ' '; continue; }
          const revealAt = Math.floor((i / original.length) * (totalFrames - 5));
          out += frame >= revealAt + 3
            ? original[i]
            : CHARS[Math.floor(Math.random() * CHARS.length)];
        }
        el.textContent = out;
        frame++;
        if (frame >= totalFrames) {
          el.textContent = original;
          clearInterval(iv);
          if (onDone) onDone();
        }
      }, FRAME_MS);
    }

    function loop() {
      runOnce(() => {
        setTimeout(loop, LOOP_PAUSE);
      });
    }

    loop();
  }

  function initScramble() {
    document.querySelectorAll('[data-scramble]').forEach(el => {
      el.dataset.original = el.textContent.trim();
    });

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          scrambleLoop(e.target);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -10px 0px' });

    document.querySelectorAll('[data-scramble]').forEach(el => obs.observe(el));

    requestAnimationFrame(() => {
      document.querySelectorAll('[data-scramble]').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          obs.unobserve(el);
          scrambleLoop(el);
        }
      });
    });

    const barObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('animated');
          barObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.3 });

    document.querySelectorAll('.skill-bar').forEach(b => barObs.observe(b));

    document.querySelectorAll('.skills-group, .tools-block').forEach(el => {
      el.classList.add('reveal');
      const revObs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) { e.target.classList.add('visible'); revObs.unobserve(e.target); }
        });
      }, { threshold: 0.1 });
      revObs.observe(el);
    });
  }

  initScramble();

  // Seek animation card thumbnail to 3s for a proper preview frame
  document.querySelectorAll('.cat-thumb-video').forEach(v => {
    v.addEventListener('loadedmetadata', () => {
      v.currentTime = Math.min(3, v.duration * 0.1);
    });
  });

  const burger = document.getElementById('navBurger');
  const mobileNav = document.getElementById('navMobile');

  if (burger && mobileNav) {
    burger.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('open');
      burger.setAttribute('aria-expanded', String(isOpen));
    });
  }

  const pageHome    = document.getElementById('page-home');
  const pageGallery = document.getElementById('page-gallery');
  const galleryTitle = document.getElementById('galleryTitle');
  const galleryCount = document.getElementById('galleryCount');
  const galleryGrid  = document.getElementById('galleryGrid');
  const galleryBack  = document.getElementById('galleryBack');
  const nsfwGateFull = document.getElementById('nsfwGateFull');
  const nsfwConfirm  = document.getElementById('nsfwConfirm');

  let nsfwUnlocked = false;
  let activeCategory = null;

  const categories = {
    artist: {
      label: 'Art',
      count: '5 works',
      images: [
        { src: 'assets/images/artist/01.jpg', alt: 'Art work 01' },
        { src: 'assets/images/artist/02.jpg', alt: 'Art work 02' },
        { src: 'assets/images/artist/03.jpg', alt: 'Art work 03' },
      ]
    },
    graphics: {
      label: 'Graphics Designer',
      count: '5 works',
      images: [
        { src: 'assets/images/graphics/01.jpg', alt: 'Graphics design 01' },
        { src: 'assets/images/graphics/02.jpg', alt: 'Graphics design 02' },
        { src: 'assets/images/graphics/03.jpg', alt: 'Graphics design 03' },
      ]
    },
    animation: {
      label: '2D Animation',
      count: '4 works',
      images: [
        { src: 'assets/images/animation/01.mp4', alt: '2D Animation 01', type: 'video' },
        { src: 'assets/images/animation/02.mp4', alt: '2D Animation 02', type: 'video' },
      ]
    },
    photography: {
      label: 'Photography',
      count: '3 works',
      images: [
        { src: 'assets/images/photography/01.jpg', alt: 'Photography 01' },
        { src: 'assets/images/photography/02.jpg', alt: 'Photography 02' },
        { src: 'assets/images/photography/03.jpg', alt: 'Photography 03' },
      ]
    },
    nsfw: {
      label: 'NSFW',
      count: 'Adult content',
      images: [
        { src: 'assets/images/nsfw/01.jpg', alt: 'NSFW work 01' },
        { src: 'assets/images/nsfw/02.jpg', alt: 'NSFW work 02' },
        { src: 'assets/images/nsfw/03.jpg', alt: 'NSFW work 03' },
      ]
    }
  };

  function showPage(page, instant) {
    [pageHome, pageGallery].forEach(p => {
      p.classList.remove('page--visible', 'page--entering');
      p.classList.add('page--hidden');
      p.style.display = 'none';
    });

    page.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'instant' });

    if (instant) {
      page.classList.remove('page--hidden', 'page--entering');
      page.classList.add('page--visible');
    } else {
      page.classList.remove('page--hidden');
      page.classList.add('page--entering');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          page.classList.remove('page--entering');
          page.classList.add('page--visible');
        });
      });
    }
  }

  function buildGalleryGrid(data) {
    galleryGrid.innerHTML = '';
    data.images.forEach(img => {
      const fig = document.createElement('figure');
      fig.className = 'gallery-item';
      fig.style.margin = '0';

      if (img.type === 'video') {
        fig.classList.add('gallery-item--video');
        const v = document.createElement('video');
        v.src = img.src;
        v.controls = true;
        v.loop = true;
        v.muted = true;
        v.playsInline = true;
        v.preload = 'metadata';
        v.setAttribute('aria-label', img.alt);
        // Seek to 1s so browser renders a real frame as poster/thumbnail
        v.addEventListener('loadedmetadata', () => {
          v.currentTime = Math.min(3, v.duration * 0.1);
        });
        fig.appendChild(v);
      } else {
        const i = document.createElement('img');
        i.src = img.src;
        i.alt = img.alt;
        i.loading = 'lazy';
        fig.appendChild(i);
      }

      galleryGrid.appendChild(fig);
    });
  }

  function buildGallery(cat) {
    const data = categories[cat];
    if (!data) return;

    activeCategory = cat;
    galleryTitle.textContent = data.label;
    galleryCount.textContent = data.count;
    galleryGrid.innerHTML = '';

    if (cat === 'nsfw' && !nsfwUnlocked) {
      nsfwGateFull.style.display = 'flex';
      galleryGrid.style.display = 'none';
    } else {
      nsfwGateFull.style.display = 'none';
      galleryGrid.style.display = 'grid';
      buildGalleryGrid(data);
    }

    showPage(pageGallery);
  }

  document.querySelectorAll('.cat-card').forEach(card => {
    card.addEventListener('click', () => {
      buildGallery(card.dataset.category);
    });
  });

  galleryBack.addEventListener('click', () => {
    showPage(pageHome);
    activeCategory = null;
  });

  if (nsfwConfirm) {
    nsfwConfirm.addEventListener('click', () => {
      nsfwUnlocked = true;
      nsfwGateFull.style.display = 'none';
      galleryGrid.style.display = 'grid';
      buildGalleryGrid(categories['nsfw']);
    });
  }

  document.querySelectorAll('[data-nav]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      mobileNav.classList.remove('open');
      const target = link.dataset.nav;

      if (target === 'home') {
        showPage(pageHome);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (target === 'work') {
        showPage(pageHome);
        setTimeout(() => {
          document.getElementById('work-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else if (target === 'about') {
        showPage(pageHome);
        setTimeout(() => {
          document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else if (target === 'contact') {
        showPage(pageHome);
        setTimeout(() => {
          document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    });
  });

  document.getElementById('navLogo')?.addEventListener('click', (e) => {
    e.preventDefault();
    showPage(pageHome);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  showPage(pageHome, true);

});
