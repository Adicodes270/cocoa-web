import { gsap } from 'gsap';
import Lenis from 'lenis';

// ========== Micro Interactions ==========

let ringX = 0, ringY = 0, mouseX = 0, mouseY = 0;

const hoverSel = 'a, button, .contributor-tag, .card, .contributors-card';
const magneticSel = '.btn-cta';

function initCursor() {
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

  document.body.classList.add('has-custom-cursor');

  const dot = document.createElement('div');
  dot.id = 'cursor-dot';
  document.body.appendChild(dot);

  const ring = document.createElement('div');
  ring.id = 'cursor-ring';
  document.body.appendChild(ring);

  setInterval(() => {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
  }, 16);

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  document.addEventListener('mouseleave', () => {
    dot.style.opacity = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity = '1';
    ring.style.opacity = '1';
  });

  document.querySelectorAll(hoverSel).forEach((el) => {
    const isButton = el.matches(magneticSel);
    el.addEventListener('mouseenter', () => {
      dot.style.display = 'none';
      ring.classList.add('cursor-hover');
      if (isButton) ring.classList.add('cursor-btn');
    });
    el.addEventListener('mouseleave', () => {
      dot.style.display = 'block';
      ring.classList.remove('cursor-hover');
      if (isButton) ring.classList.remove('cursor-btn');
    });
  });
}

function initMagnetic() {
  document.querySelectorAll(magneticSel).forEach((btn) => {
    btn.addEventListener('mousemove', function (e) {
      const r = this.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      gsap.to(this, { x: x * 0.35, y: y * 0.35, duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
    });
    btn.addEventListener('mouseleave', function () {
      gsap.to(this, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.3)' });
    });
  });
}

function initButtonPress() {
  document.querySelectorAll(magneticSel).forEach((btn) => {
    btn.addEventListener('mousedown', () => {
      gsap.to(btn, { scale: 0.95, duration: 0.15, ease: 'power2.out', overwrite: 'auto' });
    });
    const release = () => gsap.to(btn, { scale: 1, duration: 0.4, ease: 'elastic.out(1, 0.4)', overwrite: 'auto' });
    btn.addEventListener('mouseup', release);
    btn.addEventListener('mouseleave', release);
  });
}

function initRipple() {
  document.querySelectorAll(magneticSel).forEach((btn) => {
    btn.addEventListener('click', function (e) {
      const r = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.left = `${e.clientX - r.left}px`;
      ripple.style.top = `${e.clientY - r.top}px`;
      this.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });
}

function initGlowFollow() {
  document.querySelectorAll('.card, .contributors-card').forEach((el) => {
    const overlay = el.querySelector('.glow-follow');
    if (!overlay) return;
    el.addEventListener('mousemove', function (e) {
      const r = this.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 100;
      const y = ((e.clientY - r.top) / r.height) * 100;
      overlay.style.background = `radial-gradient(500px circle at ${x}% ${y}%, rgba(255, 248, 240, 0.08), transparent 40%)`;
      overlay.style.opacity = '1';
    });
    el.addEventListener('mouseleave', function () {
      overlay.style.opacity = '0';
    });
  });
}

function tiltEl(el, max) {
  gsap.set(el, { transformPerspective: 500, transformStyle: 'preserve-3d' });

  const quickRotX = gsap.quickTo(el, 'rotationX', { duration: 0.5, ease: 'power3.out' });
  const quickRotY = gsap.quickTo(el, 'rotationY', { duration: 0.5, ease: 'power3.out' });
  const quickScale = gsap.quickTo(el, 'scale', { duration: 0.4, ease: 'power3.out' });

  el.addEventListener('mousemove', (e) => {
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    quickRotX((y - 0.5) * max * 2);
    quickRotY((0.5 - x) * max * 2);
    quickScale(1.05);
  });
  el.addEventListener('mouseleave', () => {
    quickRotX(0);
    quickRotY(0);
    quickScale(1);
  });
}

function initCardTilt() {
  document.querySelectorAll('.card, .contributors-card').forEach((c) => tiltEl(c, 10));
}

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Lenis Smooth Scroll
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  // Micro interactions: cursor, magnetic buttons, press feedback, ripple, glow, tilt
  initCursor();
  initMagnetic();
  initButtonPress();
  initRipple();
  initGlowFollow();
  initCardTilt();

  // 2. Global click delegate for interactive controls
  //    (intentionally removed — see chat notes: audio must only ever
  //    be driven by #music-toggle's own click handler below)

  // Mobile Nav Toggle
  const siteHeader = document.querySelector('header');
  const navToggle = document.getElementById('navToggle');
  const navMobilePanel = document.getElementById('navMobilePanel');

  if (navToggle && siteHeader) {
    navToggle.addEventListener('click', () => {
      const isOpen = siteHeader.classList.toggle('nav-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    navMobilePanel?.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        siteHeader.classList.remove('nav-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 860 && siteHeader.classList.contains('nav-open')) {
        siteHeader.classList.remove('nav-open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // 3. Navigation Active State Toggle
  const navLinks = document.querySelectorAll('.nav-box a, .nav-mobile-panel a');
  const currentPath = window.location.pathname;

  navLinks.forEach((link) => {
    const linkPath = link.getAttribute('href');
    if (
      currentPath === linkPath ||
      (currentPath === '/' && linkPath.includes('index.html')) ||
      (currentPath.endsWith(linkPath) && linkPath !== '/')
    ) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // 4. GSAP Entry Animations
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  tl.fromTo(
    '.header-inner > *',
    { y: -30, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.8, stagger: 0.15 }
  )
    .fromTo(
      ['.hero-badge', '.hero-title', '.hero-description', '.hero-actions'],
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.12 },
      '-=0.4'
    )
    .fromTo(
      ['.card', '.contributors-card', '.music-toggle'],
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.2 },
      '-=0.3'
    )
    .fromTo(
      '.contributor-tag',
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.4, stagger: 0.06, ease: 'back.out(1.7)' },
      '-=0.4'
    )
    .fromTo(
      '.site-footer',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6 },
      '-=0.2'
    );

  // 5. Background Music Toggle (off by default)
  const musicToggleBtn = document.getElementById('music-toggle');
  const musicLabel = musicToggleBtn?.querySelector('.music-label');
  const musicIcon = musicToggleBtn?.querySelector('.music-icon');

  const bgMusic = new Audio('/cocoa.m4a');
  bgMusic.loop = true;
  bgMusic.volume = 0.4;

  let isMusicPlaying = false;
  let iconSpinTween = null;

  function setMusicButtonState(playing) {
    if (!musicToggleBtn) return;

    musicToggleBtn.classList.toggle('is-playing', playing);
    musicToggleBtn.setAttribute('aria-pressed', String(playing));
    if (musicLabel) musicLabel.textContent = playing ? 'Turn Off Music' : 'Turn On Music';

    if (iconSpinTween) {
      iconSpinTween.kill();
      iconSpinTween = null;
    }

    if (playing && musicIcon) {
      iconSpinTween = gsap.to(musicIcon, {
        rotation: 360,
        duration: 3,
        repeat: -1,
        ease: 'linear',
      });
    } else if (musicIcon) {
      gsap.to(musicIcon, { rotation: 0, duration: 0.4, ease: 'power2.out' });
    }
  }

  if (musicToggleBtn) {
    musicToggleBtn.addEventListener('click', () => {
      isMusicPlaying = !isMusicPlaying;

      if (isMusicPlaying) {
        bgMusic.play().catch((err) => {
          console.warn('Music play blocked or failed:', err);
          isMusicPlaying = false;
          setMusicButtonState(false);
        });
      } else {
        bgMusic.pause();
      }

      setMusicButtonState(isMusicPlaying);

      gsap.fromTo(
        musicToggleBtn,
        { scale: 0.85 },
        { scale: 1, duration: 0.45, ease: 'back.out(2.2)' }
      );
    });
  }

  // 6. Contributor Tags Active Switcher
  const contributorTags = document.querySelectorAll('.contributor-tag');

  contributorTags.forEach((tag) => {
    tag.addEventListener('click', () => {
      contributorTags.forEach((t) => t.classList.remove('active'));
      tag.classList.add('active');

      gsap.fromTo(
        tag,
        { scale: 0.9 },
        { scale: 1, duration: 0.3, ease: 'back.out(2)' }
      );
    });
  });

  initLanyardRealtime();
});

const DISCORD_USER_ID = '1467514693664116902';

function updateAvatarUI(userData) {
  if (!userData?.discord_user) return;

  const user = userData.discord_user;
  const avatarImg = document.getElementById('card-avatar');
  const decoImg = document.getElementById('avatar-deco');

  if (avatarImg && user.avatar) {
    const extension = user.avatar.startsWith('a_') ? 'gif' : 'png';
    const avatarUrl = `https://cdn.discordapp.com/avatars/${DISCORD_USER_ID}/${user.avatar}.${extension}?size=256`;

    if (avatarImg.src !== avatarUrl) {
      avatarImg.src = avatarUrl;
      gsap.fromTo(
        avatarImg,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.5)' }
      );
    }
  }

  if (decoImg) {
    const decoData = user.avatar_decoration_data;

    if (decoData && decoData.asset) {
      const decoUrl = `https://cdn.discordapp.com/avatar-decoration-presets/${decoData.asset}.png?size=256`;
      if (decoImg.src !== decoUrl) {
        decoImg.src = decoUrl;
      }
      decoImg.classList.remove('hidden');
    } else {
      decoImg.classList.add('hidden');
    }
  }
}

function initLanyardRealtime() {
  const ws = new WebSocket('wss://api.lanyard.rest/socket');

  ws.onopen = () => {
    ws.send(
      JSON.stringify({
        op: 2,
        d: { subscribe_to_id: DISCORD_USER_ID },
      })
    );
  };

  ws.onmessage = (event) => {
    const response = JSON.parse(event.data);
    if (response.t === 'INIT_STATE' || response.t === 'PRESENCE_UPDATE') {
      updateAvatarUI(response.d);
    }
  };

  ws.onerror = () => {
    fetchDiscordAvatarREST();
  };

  ws.onclose = () => {
    setTimeout(initLanyardRealtime, 5000);
  };
}

async function fetchDiscordAvatarREST() {
  try {
    const response = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`);
    const data = await response.json();

    if (data.success && data.data) {
      updateAvatarUI(data.data);
    }
  } catch (error) {
    console.error('Failed to load Lanyard avatar:', error);
  }
}