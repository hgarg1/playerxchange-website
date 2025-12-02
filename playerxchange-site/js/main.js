const body = document.body;
const html = document.documentElement;
const navToggle = document.querySelector('[data-nav-toggle]');
const navMenu = document.querySelector('[data-primary-nav]');
const themeToggle = document.querySelector('[data-theme-toggle]');
const toast = document.querySelector('[data-toast]');
const STORAGE_KEY = 'px-theme';
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// Apply theme to both html and body elements
const applyTheme = (theme, { persist = true } = {}) => {
  html.setAttribute('data-theme', theme);
  body.setAttribute('data-theme', theme);
  if (persist) {
    localStorage.setItem(STORAGE_KEY, theme);
  }
  themeToggle?.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
};

// Initialize theme
const storedTheme = localStorage.getItem(STORAGE_KEY);
if (storedTheme) {
  applyTheme(storedTheme);
} else {
  applyTheme(prefersDark.matches ? 'dark' : 'light', { persist: false });
}

// Listen for system theme changes
prefersDark.addEventListener('change', (event) => {
  if (!localStorage.getItem(STORAGE_KEY)) {
    applyTheme(event.matches ? 'dark' : 'light', { persist: false });
  }
});

// Navigation toggle
navToggle?.addEventListener('click', () => {
  const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', String(!isExpanded));
  navMenu?.setAttribute('data-open', String(!isExpanded));
});

// Close mobile nav when clicking links
navMenu?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    if (window.innerWidth < 992) {
      navToggle?.setAttribute('aria-expanded', 'false');
      navMenu?.setAttribute('data-open', 'false');
    }
  });
});

// Active nav link highlighting
const currentPath = window.location.pathname.split('/').pop() || 'index.html';
const aliasMap = { 'athlete.html': 'athletes.html' };
const current = aliasMap[currentPath] || currentPath;
document.querySelectorAll('[data-primary-nav] .nav-link').forEach(link => {
  const href = link.getAttribute('href');
  if (href === current || (href === 'index.html' && current === '')) {
    link.classList.add('active');
  }
});

// Scroll animations
const revealTargets = document.querySelectorAll('[data-observe]');
if (revealTargets.length) {
  const showImmediately = () => {
    revealTargets.forEach(el => el.classList.add('is-visible'));
  };
  
  if (prefersReducedMotion.matches || !('IntersectionObserver' in window)) {
    showImmediately();
  } else {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
    );
    revealTargets.forEach(el => revealObserver.observe(el));
  }
  
  prefersReducedMotion.addEventListener('change', (event) => {
    if (event.matches) showImmediately();
  });
}

// Ambient effects
document.querySelectorAll('[data-ambient]').forEach(surface => {
  const ambient = document.createElement('div');
  ambient.className = 'page-ambient';
  ambient.setAttribute('aria-hidden', 'true');
  ambient.innerHTML = `
    <div class="page-ambient__grid"></div>
    <div class="page-ambient__orb page-ambient__orb--primary"></div>
    <div class="page-ambient__orb page-ambient__orb--accent"></div>
    <div class="page-ambient__ring"></div>
    <span class="page-ambient__spark"></span>
    <span class="page-ambient__spark"></span>
    <span class="page-ambient__spark"></span>
    <span class="page-ambient__spark"></span>
  `;
  surface.insertBefore(ambient, surface.firstChild);
});

// Theme toggle
themeToggle?.addEventListener('click', () => {
  const currentTheme = body.getAttribute('data-theme') || 'dark';
  const next = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(next, { persist: true });
});

// Parallax effects
const parallaxRoot = document.querySelector('[data-parallax-root]');
const parallaxItems = [...document.querySelectorAll('[data-parallax]')];
let pointerX = 0, pointerY = 0, targetX = 0, targetY = 0, scrollStrength = 0;
let parallaxFrame, parallaxActive = false;

const applyParallax = () => {
  if (!parallaxActive || prefersReducedMotion.matches) return;
  targetX += 0.08 * (pointerX - targetX);
  targetY += 0.08 * (pointerY - targetY);
  parallaxItems.forEach(el => {
    const depth = parseFloat(el.dataset.depth || '0.2');
    const translateX = targetX * depth * 30;
    const translateY = targetY * depth * 30 + scrollStrength * depth * 45;
    el.style.setProperty('--parallax-x', `${translateX}px`);
    el.style.setProperty('--parallax-y', `${translateY}px`);
  });
  parallaxFrame = requestAnimationFrame(applyParallax);
};

const resetPointer = () => {
  pointerX = 0;
  pointerY = 0;
};

const handlePointer = (event) => {
  if (!parallaxRoot || prefersReducedMotion.matches) return;
  const rect = parallaxRoot.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const x = (event.clientX - rect.left) / rect.width;
  const y = (event.clientY - rect.top) / rect.height;
  pointerX = (x - 0.5) * 2;
  pointerY = (y - 0.5) * 2;
};

const updateScroll = () => {
  if (!parallaxRoot) return;
  const rect = parallaxRoot.getBoundingClientRect();
  const viewport = window.innerHeight || 1;
  const midpoint = rect.top + rect.height / 2;
  const offset = (midpoint - viewport / 2) / (viewport / 2 || 1);
  scrollStrength = Math.max(-1, Math.min(1, -offset));
};

const initParallax = () => {
  if (parallaxActive || prefersReducedMotion.matches || !parallaxRoot || !parallaxItems.length) return;
  parallaxActive = true;
  resetPointer();
  parallaxRoot.addEventListener('pointermove', handlePointer);
  parallaxRoot.addEventListener('pointerleave', resetPointer);
  window.addEventListener('scroll', updateScroll, { passive: true });
  window.addEventListener('resize', updateScroll);
  updateScroll();
  parallaxFrame = requestAnimationFrame(applyParallax);
};

const teardownParallax = () => {
  if (!parallaxActive) return;
  parallaxActive = false;
  cancelAnimationFrame(parallaxFrame);
  parallaxFrame = undefined;
  pointerX = 0;
  pointerY = 0;
  targetX = 0;
  targetY = 0;
  scrollStrength = 0;
  parallaxItems.forEach(el => {
    el.style.setProperty('--parallax-x', '0px');
    el.style.setProperty('--parallax-y', '0px');
  });
  resetPointer();
  parallaxRoot?.removeEventListener('pointermove', handlePointer);
  parallaxRoot?.removeEventListener('pointerleave', resetPointer);
  window.removeEventListener('scroll', updateScroll);
  window.removeEventListener('resize', updateScroll);
};

if (parallaxRoot && parallaxItems.length) {
  initParallax();
  prefersReducedMotion.addEventListener('change', (event) => {
    if (event.matches) {
      teardownParallax();
    } else {
      initParallax();
    }
  });
}

// Toast notifications
export const showToast = (message, type = 'info') => {
  if (!toast) return;
  toast.textContent = message;
  toast.dataset.open = 'true';
  toast.setAttribute('data-type', type);
  clearTimeout(showToast._timeout);
  showToast._timeout = setTimeout(() => {
    toast.dataset.open = 'false';
  }, 4000);
};

// Close nav on Escape key
window.addEventListener('keydown', (evt) => {
  if (evt.key === 'Escape' && navMenu?.dataset.open === 'true') {
    navToggle?.click();
  }
});
