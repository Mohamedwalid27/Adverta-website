
(() => {
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];

  // Mobile navigation
  const toggle = $('.menu-toggle');
  const nav = $('.nav-links');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    $$('.nav-links a').forEach(a => a.addEventListener('click', () => {
      nav.classList.remove('is-open'); toggle.setAttribute('aria-expanded','false');
    }));
  }

  // Scroll reveals; content remains visible when reduced motion is requested.
  const revealEls = $$('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), {threshold: .12});
    revealEls.forEach(el => observer.observe(el));
  } else revealEls.forEach(el => el.classList.add('is-visible'));

  // Count-up metrics. data-count is numeric and data-suffix keeps the display editable.
  const counters = $$('[data-count]');
  const countUp = el => {
    const end = Number(el.dataset.count || 0);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const decimals = Number(el.dataset.decimals || 0);
    const duration = 1100, start = performance.now();
    const tick = now => {
      const p = Math.min((now-start)/duration, 1);
      const eased = 1 - Math.pow(1-p, 3);
      el.textContent = prefix + (end*eased).toLocaleString('en-US',{minimumFractionDigits:decimals,maximumFractionDigits:decimals}) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { countUp(entry.target); counterObserver.unobserve(entry.target); }
    }), {threshold:.5});
    counters.forEach(el => counterObserver.observe(el));
  } else counters.forEach(countUp);

  // Shared lightbox for result screenshots and campaign evidence.
  const lightbox = $('.lightbox');
  const lightboxImg = lightbox && $('img', lightbox);
  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.classList.remove('is-open'); lightbox.setAttribute('aria-hidden','true');
    document.body.style.overflow = ''; if (lightboxImg) lightboxImg.src = '';
  };
  $$('[data-lightbox]').forEach(button => button.addEventListener('click', () => {
    if (!lightbox || !lightboxImg) return;
    const img = $('img', button) || button;
    lightboxImg.src = button.dataset.full || img.currentSrc || img.src;
    lightboxImg.alt = img.alt || 'Campaign results screenshot';
    lightbox.classList.add('is-open'); lightbox.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden'; $('.lightbox-close', lightbox)?.focus();
  }));
  $('.lightbox-close')?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

  // Tracking hooks. Configure GTM/GA4/Meta Pixel IDs in each page's <head>.
  const track = (eventName, params={}) => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({event:eventName,...params});
    if (typeof window.gtag === 'function') window.gtag('event', eventName, params);
    if (typeof window.fbq === 'function') window.fbq('trackCustom', eventName, params);
  };
  $$('[data-track]').forEach(el => el.addEventListener('click', () => track(el.dataset.track, {page:location.pathname})));
  window.AdvertaTracking = {track};

  // Time-based anti-spam field: form must be open for at least 3 seconds.
  $$('input[name="form_started"]').forEach(el => { el.value = String(Math.floor(Date.now()/1000)); });

  // Form submits to PHP and expects JSON. If PHP/mail is unavailable, WhatsApp fallback remains available.
  $$('form[data-ajax-form]').forEach(form => {
    const status = $('[data-form-status]', form);
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const submit = $('button[type="submit"]', form);
      const oldText = submit ? submit.textContent : '';
      if (submit) { submit.disabled = true; submit.textContent = 'Sending…'; }
      if (status) { status.className = 'form-status'; status.textContent = ''; }
      try {
        const response = await fetch(form.action, {method:'POST', body:new FormData(form), headers:{'Accept':'application/json'}});
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message || 'Please try again or use WhatsApp.');
        if (status) { status.className = 'form-status success is-visible'; status.textContent = result.message || 'Thank you. Your request has been sent.'; }
        form.reset();
        track(form.dataset.event || 'audit_form_submit', {form:form.id || 'contact-form'});
      } catch (err) {
        if (status) { status.className = 'form-status error is-visible'; status.textContent = (err && err.message) || 'We could not send your request. Please use WhatsApp instead.'; }
      } finally {
        if (submit) { submit.disabled = false; submit.textContent = oldText; }
      }
    });
  });

  // Preselect forms using ?type=consultation or ?type=coaching.
  const params = new URLSearchParams(location.search);
  const type = params.get('type');
  const serviceSelect = $('#request-type');
  if (type && serviceSelect && [...serviceSelect.options].some(o => o.value === type)) serviceSelect.value = type;

  // Prefilled WhatsApp fallback from form values; no personal data is sent until user opens WhatsApp.
  $$('[data-whatsapp-form]').forEach(btn => btn.addEventListener('click', () => {
    const form = $(btn.dataset.whatsappForm);
    if (!form) return;
    const fd = new FormData(form);
    const lines = ['ADVERTA website enquiry'];
    for (const [key, value] of fd.entries()) {
      if (key === 'website' || key === 'company_fax' || key === 'form_started') continue;
      if (Array.isArray(value)) continue;
      if (typeof value === 'string' && value.trim()) lines.push(`${key.replaceAll('_',' ')}: ${value.trim()}`);
    }
    const platforms = fd.getAll('platforms[]');
    if (platforms.length) lines.push(`Platforms: ${platforms.join(', ')}`);
    const url = 'https://wa.me/201148286192?text=' + encodeURIComponent(lines.join('\n'));
    track('whatsapp_click', {source:'form_fallback'});
    window.open(url, '_blank', 'noopener,noreferrer');
  }));
})();
