import {showToast} from './main.js';

const params = new URLSearchParams(window.location.search);
const athleteId = params.get('id');
const detailSection = document.querySelector('[data-athlete-detail]');
const buyButton = document.querySelector('[data-buy-button]');
const loadingState = document.querySelector('[data-loading]');
const heroFigure = document.querySelector('[data-hero-figure]');

if (!athleteId) {
  window.location.replace('404.html');
}

fetch('data/athletes.json')
  .then((resp) => {
    if (!resp.ok) throw new Error('Unable to load roster');
    return resp.json();
  })
  .then((data) => {
    const athlete = data.find((item) => item.id === athleteId);
    if (!athlete) {
      window.location.replace('404.html');
      return;
    }
    renderAthlete(athlete);
  })
  .catch(() => {
    loadingState?.classList.add('hidden');
    detailSection?.classList.add('hidden');
    showToast('We could not load that athlete right now.', 'error');
  });

function getInitials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function createPortraitSVG(athlete, {idSuffix = 'card', className = 'athlete-portrait'} = {}) {
  const palette = athlete.palette ?? {};
  const start = palette.start ?? '#0B5FFF';
  const end = palette.end ?? '#00D4A6';
  const accent = palette.accent ?? '#16213F';
  const initials = getInitials(athlete.name);
  const gradientId = `portrait-${athlete.id}-${idSuffix}`;
  const titleId = `${gradientId}-title`;

  return `
    <svg class="${className}" viewBox="0 0 400 300" role="img" aria-labelledby="${titleId}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <title id="${titleId}">${athlete.name} stylized illustration</title>
      <defs>
        <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${start}"/>
          <stop offset="100%" stop-color="${end}"/>
        </linearGradient>
      </defs>
      <rect width="400" height="300" rx="36" fill="#0F152A"/>
      <circle cx="320" cy="72" r="68" fill="${accent}" opacity="0.32"/>
      <circle cx="110" cy="230" r="150" fill="url(#${gradientId})" opacity="0.85"/>
      <path d="M50 70h120l-34 58H28Z" fill="url(#${gradientId})" opacity="0.45"/>
      <path d="M340 260c-32-22-82-30-112-8 28-54 94-76 128-104Z" fill="${accent}" opacity="0.3"/>
      <text x="50%" y="56%" font-family="'Inter',system-ui,sans-serif" font-size="96" font-weight="700" text-anchor="middle" fill="#F7FAFF" letter-spacing="6">${initials}</text>
    </svg>
  `;
}

function renderAthlete(athlete) {
  loadingState?.classList.add('hidden');
  detailSection?.classList.remove('hidden');
  document.title = `${athlete.name} | PlayerXChange`;

  if (heroFigure) {
    heroFigure.innerHTML = createPortraitSVG(athlete, {
      idSuffix: 'hero',
      className: 'athlete-portrait hero-portrait'
    });
  }

  const nameEl = document.querySelector('[data-athlete-name]');
  const schoolEl = document.querySelector('[data-athlete-school]');
  const sportEl = document.querySelector('[data-athlete-sport]');
  const supplyEl = document.querySelector('[data-athlete-supply]');
  const royaltyEl = document.querySelector('[data-athlete-royalty]');
  const blurbEl = document.querySelector('[data-athlete-blurb]');
  const perksList = document.querySelector('[data-athlete-perks]');
  const disclosuresList = document.querySelector('[data-athlete-disclosures]');
  const overviewPanel = document.querySelector('#overview');
  const statsList = document.querySelector('[data-athlete-stats]');

  if (nameEl) nameEl.textContent = athlete.name;
  if (schoolEl) schoolEl.textContent = athlete.school;
  if (sportEl) sportEl.textContent = athlete.sport;
  if (supplyEl) supplyEl.textContent = `${athlete.supply.toLocaleString()} digital shares`;
  if (royaltyEl) royaltyEl.textContent = `${(athlete.royaltyBps / 100).toFixed(1)}% lifetime athlete royalty`;
  if (blurbEl) blurbEl.textContent = athlete.blurb;

  if (perksList) {
    perksList.innerHTML = '';
    athlete.perks?.forEach((perk) => {
      const li = document.createElement('li');
      li.textContent = perk;
      perksList.appendChild(li);
    });
  }

  if (disclosuresList) {
    disclosuresList.innerHTML = '';
    athlete.disclosures?.forEach((item) => {
      const li = document.createElement('li');
      li.textContent = item;
      disclosuresList.appendChild(li);
    });
  }

  if (statsList) {
    statsList.innerHTML = '';
    const entries = athlete.stats ? Object.entries(athlete.stats) : [];
    if (entries.length) {
      statsList.classList.remove('hidden');
      entries.forEach(([label, value]) => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${label.toUpperCase()}</strong><span>${value}</span>`;
        statsList.appendChild(li);
      });
    } else {
      statsList.classList.add('hidden');
    }
  }

  if (overviewPanel && !overviewPanel.dataset.enhanced) {
    const note = document.createElement('p');
    note.className = 'mt-3';
    note.textContent = 'Every purchase routes through our compliance engine and Athlete Royalties vault. Real settlement rails plug in via API keys your ops team controls.';
    overviewPanel.appendChild(note);
    overviewPanel.dataset.enhanced = 'true';
  }

  buyButton?.addEventListener('click', () => {
    showToast('Trading opens at launch. Join the waitlist to be first in line.');
  });
}

const tabButtons = document.querySelectorAll('[role="tab"]');

function activateTab(target) {
  tabButtons.forEach((btn) => {
    const isActive = btn === target;
    btn.setAttribute('aria-selected', String(isActive));
    btn.setAttribute('tabindex', isActive ? '0' : '-1');
    const controls = btn.getAttribute('aria-controls');
    const panel = controls ? document.getElementById(controls) : null;
    if (panel) {
      if (isActive) {
        panel.removeAttribute('hidden');
        panel.setAttribute('tabindex', '0');
      } else {
        panel.setAttribute('hidden', '');
        panel.removeAttribute('tabindex');
      }
    }
  });
}

tabButtons.forEach((btn, index) => {
  btn.addEventListener('click', () => activateTab(btn));
  btn.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      const offset = event.key === 'ArrowRight' ? 1 : -1;
      const buttons = [...tabButtons];
      const nextIndex = (index + offset + buttons.length) % buttons.length;
      activateTab(buttons[nextIndex]);
      buttons[nextIndex].focus();
    }
  });
});

if (tabButtons.length) {
  activateTab(tabButtons[0]);
}
