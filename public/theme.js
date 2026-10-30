(() => {
  const root = document.documentElement;
  const preference = matchMedia('(prefers-color-scheme: dark)');
  let explicit = false;
  try { explicit = ['light', 'dark'].includes(localStorage.getItem('bella-theme')); } catch {}
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'theme-toggle';
  toggle.innerHTML = '<svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M20 15.5A9 9 0 0 1 8.5 4a9 9 0 1 0 11.5 11.5Z"/></svg><svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></svg><span></span>';
  document.querySelector('.nav').insertBefore(toggle, document.querySelector('.menu'));
  function sync() {
    const dark = root.dataset.theme === 'dark';
    toggle.querySelector('span').textContent = dark ? 'Light' : 'Night';
    toggle.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to night theme');
    toggle.title = dark ? 'Switch to light theme' : 'Switch to night theme';
  }
  toggle.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    explicit = true;
    try { localStorage.setItem('bella-theme', root.dataset.theme); } catch {}
    sync();
  });
  preference.addEventListener('change', e => {
    if (!explicit) { root.dataset.theme = e.matches ? 'dark' : 'light'; sync(); }
  });
  sync();
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const targets = document.querySelectorAll('.intro-grid>div,.section-head,.tile,.experience-grid>*,.quote .wrap,.contact-grid>*');
  let observer;
  function stopReveals() {
    observer?.disconnect();
    targets.forEach(el => el.classList.remove('reveal-pending', 'reveal-visible'));
  }
  if (!motion.matches && 'IntersectionObserver' in window) {
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('reveal-pending');
          entry.target.classList.add('reveal-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {threshold:0.08});
    targets.forEach((el, i) => {
      el.style.setProperty('--reveal-delay', `${(i % 2) * 70}ms`);
      el.classList.add('reveal-pending');
      observer.observe(el);
    });
    // Keyboard navigation must never land on an invisible link or button.
    document.addEventListener('focusin', e => {
      const target = e.target.closest('.reveal-pending');
      if (target) { target.classList.remove('reveal-pending'); observer.unobserve(target); }
    });
  }
  motion.addEventListener('change', e => { if (e.matches) stopReveals(); });
  document.querySelectorAll('.mobile-panel a').forEach(link => link.addEventListener('click', () => document.querySelector('.menu').setAttribute('aria-expanded', 'false')));
})();
