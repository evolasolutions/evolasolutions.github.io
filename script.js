// Small, framework-free mobile navigation script.
const toggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.nav-links');
const icon = toggle?.querySelector('svg');
function closeMenu() {
  if (!toggle || !nav || !icon) return;
  nav.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Open navigation menu');
  document.body.classList.remove('menu-open');
  icon.innerHTML = '<path d="M4 7h16M4 12h16M4 17h16"/>';
}
if (toggle && nav && icon) {
  toggle.addEventListener('click', () => {
    const open = !nav.classList.contains('open');
    if (open) {
      nav.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Close navigation menu');
      document.body.classList.add('menu-open');
      icon.innerHTML = '<path d="M6 6l12 12M18 6 6 18"/>';
    } else closeMenu();
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !event.defaultPrevented && nav.classList.contains('open')) { closeMenu(); toggle.focus(); } });
}
document.querySelectorAll('.js-year').forEach(e => e.textContent = String(new Date().getFullYear()));


// Site-wide accessible light/dark preference, with storage fallback.
const themeToggle = document.querySelector('.theme-toggle');
function syncThemeControl() {
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  const actionLabel = isLight ? 'Switch to dark mode' : 'Switch to light mode';
  if (!themeToggle) return;
  themeToggle.setAttribute('aria-label', actionLabel);
  themeToggle.setAttribute('title', actionLabel);
  const label = themeToggle.querySelector('.theme-toggle-text');
  if (label) label.textContent = isLight ? 'Dark mode' : 'Light mode';
  const colorMeta = document.querySelector('meta[name="theme-color"]');
  if (colorMeta) colorMeta.setAttribute('content', isLight ? '#f7fbfc' : '#071523');
}
if (themeToggle) {
  syncThemeControl();
  themeToggle.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    try { window.localStorage.setItem('evola-theme', next); } catch (_) {}
    syncThemeControl();
  });
}

// Industry navigation disclosure (regular links, not an ARIA application menu).
(() => {
  const dropdown = document.querySelector('.industry-dropdown');
  const trigger = dropdown?.querySelector('.industry-trigger');
  const panel = dropdown?.querySelector('.industry-menu');
  if (!dropdown || !trigger || !panel) return;
  const links = [...panel.querySelectorAll('a')];
  const mq = window.matchMedia('(min-width: 1051px) and (hover: hover) and (pointer: fine)');
  let closeTimer;
  const setOpen = open => {
    clearTimeout(closeTimer);
    trigger.setAttribute('aria-expanded', String(open));
    panel.hidden = !open;
  };
  // Hover on desktop; tap/click disclosure on touch and keyboard.
  dropdown.addEventListener('pointerenter', event => {
    if (mq.matches && event.pointerType === 'mouse') setOpen(true);
  });
  dropdown.addEventListener('pointerleave', event => {
    if (!mq.matches || event.pointerType !== 'mouse') return;
    clearTimeout(closeTimer);
    closeTimer = setTimeout(() => {
      if (!dropdown.matches(':hover') && !dropdown.contains(document.activeElement)) setOpen(false);
    }, 180);
  });
  trigger.addEventListener('click', event => {
    if (mq.matches && event.detail > 0) setOpen(true);
    else setOpen(panel.hidden);
  });
  dropdown.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !panel.hidden) {
      event.preventDefault(); setOpen(false); trigger.focus();
    } else if (event.target === trigger && ['ArrowDown', 'ArrowUp'].includes(event.key)) {
      event.preventDefault(); setOpen(true); links[event.key === 'ArrowDown' ? 0 : links.length - 1].focus();
    } else if (!panel.hidden && links.includes(event.target) && ['ArrowDown','ArrowUp','Home','End'].includes(event.key)) {
      event.preventDefault(); const i = links.indexOf(event.target);
      links[event.key === 'Home' ? 0 : event.key === 'End' ? links.length - 1 : (i + (event.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length].focus();
    }
  });
  document.addEventListener('click', event => { if (!dropdown.contains(event.target)) setOpen(false); });
  dropdown.addEventListener('focusout', event => { if (event.relatedTarget && !dropdown.contains(event.relatedTarget)) setOpen(false); });
  links.forEach(link => link.addEventListener('click', () => setOpen(false)));
  // Reset the disclosure when the responsive navigation changes state.
  mq.addEventListener?.('change', () => setOpen(false));
  toggle?.addEventListener('click', () => { if (!nav?.classList.contains('open')) setOpen(false); });
})();
