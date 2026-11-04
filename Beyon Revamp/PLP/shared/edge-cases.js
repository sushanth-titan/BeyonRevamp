/* Prototype-only edge-case switcher (bottom-left pill). Drop this file + edge-cases.css for production.
   Usage: EdgeCases.init({ reset, cases: [{ id, group, label, desc, run }] }) — first case is the default.
   Deep link: ?case=<id> */
window.EdgeCases = {
  init({ cases, reset }) {
    const groups = [...new Set(cases.map(c => c.group))];
    const root = document.createElement('div');
    root.className = 'ec';
    root.innerHTML = `
      <div class="ec-panel" id="ecPanel" role="group" aria-label="Edge-case preview">
        <div class="ec-head"><strong>Edge-case preview</strong><span>prototype only</span></div>
        <select class="ec-select" aria-label="Case">${groups.map(g => `<optgroup label="${g}">${cases.map((c, i) => c.group === g ? `<option value="${i}">${c.label}</option>` : '').join('')}</optgroup>`).join('')}</select>
        <p class="ec-desc"></p>
        <div class="ec-ctrls">
          <button type="button" data-step="-1" aria-label="Previous case">‹</button>
          <button type="button" data-act="replay">Replay</button>
          <button type="button" data-act="reset">Reset</button>
          <button type="button" data-step="1" aria-label="Next case">›</button>
        </div>
        <p class="ec-meta"></p>
      </div>
      <button type="button" class="ec-pill" aria-expanded="false" aria-controls="ecPanel">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 3h6M10 3v6L4.5 18.5A1.6 1.6 0 0 0 5.9 21h12.2a1.6 1.6 0 0 0 1.4-2.5L14 9V3"/></svg>
        <span class="ec-name"></span><i class="ec-dot" aria-hidden="true"></i>
      </button>`;
    document.body.append(root);

    const $ = s => root.querySelector(s);
    const pill = $('.ec-pill'), select = $('.ec-select'), html = document.documentElement;
    let idx = 0;

    const show = () => {
      const c = cases[idx];
      select.value = idx;
      $('.ec-name').textContent = c.label;
      $('.ec-desc').textContent = c.desc;
      $('.ec-meta').textContent = `${idx + 1} of ${cases.length} · ${c.group}`;
      root.dataset.group = groups.indexOf(c.group);
    };

    const go = i => {
      idx = (i + cases.length) % cases.length;
      show();
      const url = new URL(location.href);
      idx ? url.searchParams.set('case', cases[idx].id) : url.searchParams.delete('case');
      history.replaceState(null, '', url);
      html.classList.add('ec-instant');
      reset();
      requestAnimationFrame(() => {
        html.classList.remove('ec-instant');
        void html.offsetWidth; // commit the reset state so the case's transitions start fresh
        cases[idx].run?.();
      });
    };

    const toggle = open => { root.toggleAttribute('data-expanded', open); pill.setAttribute('aria-expanded', open); };
    pill.onclick = () => toggle(!root.hasAttribute('data-expanded'));
    select.onchange = () => go(+select.value);
    root.addEventListener('click', e => {
      const b = e.target.closest('[data-step],[data-act]');
      if (!b) return;
      if (b.dataset.step) go(idx + +b.dataset.step);
      else go(b.dataset.act === 'reset' ? 0 : idx);
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') toggle(false); });
    document.addEventListener('pointerdown', e => { if (!root.contains(e.target)) toggle(false); });

    const start = cases.findIndex(c => c.id === new URLSearchParams(location.search).get('case'));
    start > 0 ? go(start) : show();
  }
};
