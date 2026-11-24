(() => {
  const stage = document.querySelector('.ev-activate-stage');
  if (!stage) return;
  const button = stage.querySelector('.ev-activate-trigger');
  const menu = stage.querySelector('.ev-capabilities');
  const detail = stage.querySelector('.ev-capability-detail');
  const spin = stage.querySelector('.ev-logo-spin');
  const text = button.querySelector('.ev-activate-text');
  const sign = button.querySelector('.ev-activate-sign');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const defaultDetail = 'Choose a service to explore what we can do for you.';
  let transition;
  function setExpanded(on) {
    if (stage.dataset.expanded === String(on)) return;
    const before = getComputedStyle(spin).transform;
    transition?.cancel();
    if (!on && menu.contains(document.activeElement)) button.focus();
    stage.dataset.expanded = String(on);
    button.setAttribute('aria-expanded', String(on));
    menu.inert = !on;
    if (on) { menu.removeAttribute('aria-hidden'); detail.removeAttribute('aria-hidden'); }
    else { menu.setAttribute('aria-hidden','true'); detail.setAttribute('aria-hidden','true'); }
    text.textContent = on ? 'Close Evola' : 'Activate Evola';
    sign.textContent = on ? '\u2212' : '+';
    detail.textContent = defaultDetail;
    if (on && !motion.matches && typeof spin.animate === 'function' && before !== 'none') {
      transition = spin.animate([{transform:before},{transform:'rotateY(0deg) rotateX(5deg)'}], {duration:650,easing:'cubic-bezier(.22,.8,.25,1)'});
    }
  }
  button.disabled = false;
  button.addEventListener('click', () => setExpanded(stage.dataset.expanded !== 'true'));
  stage.addEventListener('keydown', e => { if (e.key === 'Escape' && stage.dataset.expanded === 'true') { e.preventDefault(); setExpanded(false); button.focus(); } });
  menu.querySelectorAll('a').forEach(link => {
    const show = () => { detail.textContent = link.dataset.description; };
    const reset = () => { if (!link.matches(':focus')) detail.textContent = defaultDetail; };
    link.addEventListener('pointerenter', show);
    link.addEventListener('pointerleave', reset);
    link.addEventListener('focus', show);
    link.addEventListener('blur', () => { if (!link.matches(':hover')) detail.textContent = defaultDetail; });
  });
})();
