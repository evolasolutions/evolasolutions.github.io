/* Evola | Use-case industry filters and contact enquiry composer.
   No backend, no tracking, no third-party script. */
(() => {
  const groupButtons = Array.from(document.querySelectorAll('[data-uc-filter]'));
  const groups = Array.from(document.querySelectorAll('[data-uc-industry]'));
  const search = document.getElementById('uc-search');
  const status = document.getElementById('uc-status');
  const empty = document.getElementById('uc-empty');
  const reset = document.getElementById('uc-reset');
  const validIndustry = new Set(groups.map(group => group.dataset.ucIndustry));
  let current = 'all';
  function updateCatalog() {
    if (!groups.length) return;
    const q = (search?.value || '').trim().toLocaleLowerCase();
    let found = 0;
    groups.forEach(group => {
      const groupActive = current === 'all' || group.dataset.ucIndustry === current;
      let groupFound = 0;
      group.querySelectorAll('[data-uc-card]').forEach(card => {
        const show = groupActive && (!q || card.textContent.toLocaleLowerCase().includes(q));
        card.hidden = !show;
        if (show) {found++;groupFound++;}
      });
      group.hidden = groupFound === 0;
    });
    groupButtons.forEach(button => {
      const active = button.dataset.ucFilter === current;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    if (status) status.textContent = `Showing ${found} of 21 use case${found === 1 ? '' : 's'}${current === 'all' ? '' : ' · ' + (groupButtons.find(b => b.dataset.ucFilter === current)?.textContent || '').replace(/\s*3\s*$/, '').trim()}`;
    document.querySelectorAll('[data-industry-link]').forEach(link => {
      if (link.dataset.industryLink === current) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
    if (empty) empty.hidden = found > 0;
  }
  if (groups.length) {
    const params = new URLSearchParams(location.search);
    const chosen = params.get('industry') || (validIndustry.has(location.hash.slice(1)) ? location.hash.slice(1) : 'all');
    current = validIndustry.has(chosen) ? chosen : 'all';
    groupButtons.forEach(button => button.addEventListener('click', () => {
      current = button.dataset.ucFilter || 'all';
      const url = new URL(location.href);
      if (current === 'all') url.searchParams.delete('industry');
      else url.searchParams.set('industry', current);
      url.hash = '';
      history.replaceState(null, '', url);
      updateCatalog();
    }));
    search?.addEventListener('input', updateCatalog);
    reset?.addEventListener('click', () => {current = 'all';if(search)search.value='';const url = new URL(location.href);url.searchParams.delete('industry');url.hash='';history.replaceState(null,'',url);updateCatalog();search?.focus();});
    window.addEventListener('hashchange', () => { const params = new URLSearchParams(location.search); const choice = params.get('industry') || location.hash.slice(1); current = validIndustry.has(choice) ? choice : 'all'; updateCatalog(); });
    updateCatalog();
  }

  const form = document.getElementById('uc-enquiry-form');
  if (!form) return;
  const industry = document.getElementById('enquiry-industry');
  const useCase = document.getElementById('enquiry-use-case');
  const service = document.getElementById('enquiry-service');
  const feedback = document.getElementById('uc-form-feedback');
  const params = new URLSearchParams(location.search);
  const selectIfValid = (el, value) => {
    if (el && value && Array.from(el.options).some(o => o.value === value)) el.value = value;
  };
  selectIfValid(industry, params.get('industry'));
  selectIfValid(useCase, params.get('use_case'));
  selectIfValid(service, params.get('service'));
  if (useCase && useCase.value) {
    const option = useCase.selectedOptions[0];
    selectIfValid(industry, option?.dataset.industry);
  }
  useCase?.addEventListener('change', () => {
    const option = useCase.selectedOptions[0];
    if (option?.dataset.industry) selectIfValid(industry, option.dataset.industry);
  });
  const submitButton = form.querySelector('button[type="submit"]');
  let submitting = false;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (submitting || !form.reportValidity()) return;
    submitting = true;
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting…';
    feedback.textContent = 'Sending your enquiry…';
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });
      if (!response.ok) throw new Error('Submission failed');
      form.reset();
      feedback.textContent = 'Thank you! Your enquiry has been submitted successfully. We’ll be in touch soon.';
    } catch (_) {
      feedback.textContent = 'We could not confirm your submission. Please try again or email evolasolutions@outlook.com directly.';
    } finally {
      submitting = false;
      submitButton.disabled = false;
      submitButton.textContent = 'Submit';
    }
  });
})();
