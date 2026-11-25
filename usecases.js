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
  function makeDraft() {
    if (!form.reportValidity()) return null;
    const data = new FormData(form);
    const label = name => form.elements[name]?.selectedOptions?.[0]?.textContent?.trim() || 'Not specified';
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();
    const message = String(data.get('message') || '').trim();
    if (!name || !email || !message) return null;
    const interest = label('use_case') === 'Choose an example (optional)' ? 'General enquiry' : label('use_case');
    const subject = 'Evola enquiry - ' + interest;
    const body = [
      'Hello Evola,','',
      'I would like to discuss a business workflow.','',
      'Name: ' + name,
      'Email: ' + email,
      'Industry / team: ' + label('industry'),
      'Service area: ' + label('service'),
      'Use case: ' + interest,'',
      'My challenge / requirements:',message
    ].join('\n');
    return {subject,body};
  }
  form.addEventListener('submit', e => {
    e.preventDefault();
    const draft = makeDraft();
    if (!draft) return;
    const url = 'mailto:evolasolutions@outlook.com?subject=' + encodeURIComponent(draft.subject) + '&body=' + encodeURIComponent(draft.body);
    if (feedback) feedback.textContent = 'Your email app should open with a draft. Review it and press Send in your email app; this website has not sent anything.';
    window.location.href = url;
  });
  document.getElementById('copy-enquiry')?.addEventListener('click', async () => {
    const draft = makeDraft();
    if (!draft) return;
    try {
      await navigator.clipboard.writeText(draft.subject + '\n\n' + draft.body);
      if (feedback) feedback.textContent = 'Enquiry copied. Paste it into an email to evolasolutions@outlook.com and send it yourself.';
    } catch (_) {
      if (feedback) feedback.textContent = 'Your browser blocked clipboard access. Please use the email button or copy your message manually.';
    }
  });
})();
