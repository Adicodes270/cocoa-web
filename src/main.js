import { gsap } from 'gsap';
import Lenis from 'lenis';

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

  // 2. Direct Public Audio Instance
  const clickAudio = new Audio('/cocoa.m4a');
  clickAudio.volume = 0.25;

  function playClickSound() {
    // Clone node so rapid consecutive clicks overlap cleanly
    const soundInstance = clickAudio.cloneNode();
    soundInstance.volume = 0.25;
    soundInstance.play().catch((err) => {
      console.warn('Audio play blocked or failed:', err);
    });
  }

  // Global click delegate for interactive controls
  document.addEventListener('click', (event) => {
    const target = event.target.closest('a, button:not(#music-toggle), .contributor-tag, .card, .contributors-card');
    if (target) {
      playClickSound();
    }
  });

  // 3. Navigation Active State Toggle
  const navLinks = document.querySelectorAll('.nav-box a');
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