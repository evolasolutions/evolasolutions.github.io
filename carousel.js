(() => {
  const root = document.querySelector('.lp-carousel');
  if (!root) return;
  const slides = Array.from(root.querySelectorAll('.lp-slide'));
  const dots = Array.from(root.querySelectorAll('.lp-slide-dot'));
  const count = root.querySelector('.lp-slide-count');
  const status = root.querySelector('.lp-carousel-status');
  const controls = root.querySelector('.lp-carousel-controls');
  const delay = 6000;
  if (slides.length < 2) return;
  let active = 0;
  let timer;
  function readingSlide() {
    return slides[active].contains(document.activeElement);
  }
  function schedule() {
    clearTimeout(timer);
    if (document.hidden || readingSlide() || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    timer = setTimeout(() => show(active + 1), delay);
  }
  function show(index, manual = false) {
    active = (index + slides.length) % slides.length;
    root.dataset.active = String(active);
    slides.forEach((slide, i) => {
      const on = i === active;
      slide.classList.toggle('is-active', on);
      slide.inert = !on;
      if (on) slide.removeAttribute('aria-hidden');
      else slide.setAttribute('aria-hidden', 'true');
      if (dots[i]) {
        if (on) dots[i].setAttribute('aria-current', 'true');
        else dots[i].removeAttribute('aria-current');
      }
    });
    if (count) count.textContent = `${String(active + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    if (manual && status) status.textContent = slides[active].getAttribute('aria-label');
    schedule();
  }
  dots.forEach((dot, i) => dot.addEventListener('click', () => show(i, true)));
  // Do not hide the link currently being used by a keyboard or screen reader.
  root.addEventListener('focusin', schedule);
  root.addEventListener('focusout', () => Promise.resolve().then(schedule));
  document.addEventListener('visibilitychange', schedule);
  window.addEventListener('pageshow', schedule);
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener?.('change', schedule);
  if (controls) controls.hidden = false;
  show(0);
})();
