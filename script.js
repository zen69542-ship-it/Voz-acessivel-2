// ==========================================================================
// OuviLer — script.js — compartilhado por todas as páginas
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Menu mobile ---------- */
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open);
    });
    document.querySelectorAll('.navlinks a').forEach(a => a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }));
  }

  /* ---------- Painel de acessibilidade: abrir/fechar ---------- */
  const fab = document.getElementById('a11yFab');
  const panel = document.getElementById('a11yPanel');
  const closeBtn = document.getElementById('a11yClose');
  if (fab && panel) {
    fab.addEventListener('click', () => {
      const open = panel.classList.toggle('open');
      fab.setAttribute('aria-expanded', open);
    });
    if (closeBtn) closeBtn.addEventListener('click', () => {
      panel.classList.remove('open');
      fab.setAttribute('aria-expanded', 'false');
    });
  }

  const root = document.documentElement;

  /* ---------- Toggles simples (alto contraste, dislexia, links, cliques, reduzir movimento) ---------- */
  document.querySelectorAll('[data-toggle]').forEach(btn => {
    btn.addEventListener('click', () => {
      root.classList.toggle(btn.dataset.toggle);
      btn.classList.toggle('active');
    });
  });

  /* ---------- Modo epilepsia / fotossensibilidade ---------- */
  /* Aplica: sem animação/transição em nada, imagens dessaturadas e mais escuras,
     cores de acento neutralizadas, elementos puramente decorativos ocultos. */
  const epilepsyBtn = document.getElementById('epilepsyToggle');
  const epilepsyBanner = document.getElementById('epilepsyBannerText');
  if (epilepsyBtn) {
    epilepsyBtn.addEventListener('click', () => {
      const isActive = root.classList.toggle('epilepsy-safe');
      root.classList.toggle('epilepsy-active', isActive);
      epilepsyBtn.classList.toggle('active', isActive);
      if (isActive && epilepsyBanner) {
        epilepsyBanner.textContent = 'Modo epilepsia/fotossensibilidade ativo — animações, transições e cores fortes foram removidas de toda a página, inclusive das imagens.';
      }
      // Garante que nenhum modo de daltonismo fique competindo por cor ao mesmo tempo
      if (isActive) {
        window.speechSynthesis && null; // no-op, mantém isolado de outras rotinas
      }
    });
  }

  /* ---------- Paletas de daltonismo (7 tipos, mutuamente exclusivas) ---------- */
  const cbClasses = ['cb-protanopia','cb-protanomalia','cb-deuteranopia','cb-deuteranomalia','cb-tritanopia','cb-tritanomalia','cb-acromatopsia'];
  const cbBannerText = document.getElementById('cbBannerText');
  const cbRow = document.getElementById('cbRow');
  if (cbRow) {
    cbRow.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        cbClasses.forEach(c => root.classList.remove(c));
        cbRow.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        if (btn.dataset.cb !== 'none') {
          root.classList.add(btn.dataset.cb);
          root.classList.add('cb-active');
          if (cbBannerText) cbBannerText.textContent = 'Paleta ativa: ' + btn.textContent + ' — as cores do site foram adaptadas';
        } else {
          root.classList.remove('cb-active');
        }
        btn.classList.add('active');
      });
    });
  }

  /* ---------- Tamanho da fonte ---------- */
  let scale = 1;
  const fontInc = document.getElementById('fontInc');
  const fontDec = document.getElementById('fontDec');
  const fontReset = document.getElementById('fontReset');
  if (fontInc) fontInc.addEventListener('click', () => { scale = Math.min(1.5, scale + 0.1); root.style.setProperty('--font-scale', scale); });
  if (fontDec) fontDec.addEventListener('click', () => { scale = Math.max(0.85, scale - 0.1); root.style.setProperty('--font-scale', scale); });
  if (fontReset) fontReset.addEventListener('click', () => { scale = 1; root.style.setProperty('--font-scale', scale); });

  /* ---------- Restaurar tudo ---------- */
  const resetBtn = document.getElementById('a11yReset');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      ['high-contrast','dyslexia-mode','reduce-motion','big-click','link-highlight','cb-active','epilepsy-safe','epilepsy-active', ...cbClasses].forEach(c => root.classList.remove(c));
      document.querySelectorAll('.a11y-row button').forEach(b => b.classList.remove('active'));
      if (cbRow) { const noneBtn = cbRow.querySelector('button[data-cb="none"]'); if (noneBtn) noneBtn.classList.add('active'); }
      scale = 1; root.style.setProperty('--font-scale', 1);
    });
  }

  /* ---------- Narrador: lê a página inteira em voz alta, seção por seção ---------- */
  const sections = Array.from(document.querySelectorAll('#main [data-narrate]'));
  const narratorBar = document.getElementById('narratorBar');
  const nbText = document.getElementById('nbText');
  const nbPlayPause = document.getElementById('nbPlayPause');
  const nbStop = document.getElementById('nbStop');
  let isPlaying = false;

  function clearHighlight(){ sections.forEach(s => s.classList.remove('reading-now')); }

  function speakSection(i){
    if (!sections.length) return;
    if (i >= sections.length){ stopNarration(); return; }
    const el = sections[i];
    clearHighlight();
    el.classList.add('reading-now');
    const behavior = root.classList.contains('epilepsy-safe') ? 'auto' : 'smooth';
    el.scrollIntoView({ behavior, block:'start' });
    if (nbText) nbText.textContent = el.dataset.narrate;
    if (narratorBar) narratorBar.classList.add('active');
    if (nbPlayPause){ nbPlayPause.textContent = '⏸'; nbPlayPause.setAttribute('aria-label','Pausar leitura'); }
    const text = el.dataset.narrate + '. ' + el.innerText;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'pt-BR';
    utter.rate = 0.98;
    utter.onend = () => { if (isPlaying) speakSection(i + 1); };
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  }

  function startNarration(fromIndex){
    if (!('speechSynthesis' in window)) { alert('Seu navegador não suporta leitura por voz.'); return; }
    isPlaying = true;
    speakSection(fromIndex || 0);
  }
  function stopNarration(){
    isPlaying = false;
    window.speechSynthesis.cancel();
    if (narratorBar) narratorBar.classList.remove('active');
    clearHighlight();
  }
  function togglePause(){
    if (!isPlaying) return;
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused){
      window.speechSynthesis.pause();
      if (nbPlayPause){ nbPlayPause.textContent = '▶'; nbPlayPause.setAttribute('aria-label','Retomar leitura'); }
    } else if (window.speechSynthesis.paused){
      window.speechSynthesis.resume();
      if (nbPlayPause){ nbPlayPause.textContent = '⏸'; nbPlayPause.setAttribute('aria-label','Pausar leitura'); }
    }
  }

  const heroListen = document.getElementById('heroListen');
  const a11yListen = document.getElementById('a11yListen');
  if (heroListen) heroListen.addEventListener('click', () => startNarration(0));
  if (a11yListen) a11yListen.addEventListener('click', () => { if (panel) panel.classList.remove('open'); startNarration(0); });
  if (nbPlayPause) nbPlayPause.addEventListener('click', togglePause);
  if (nbStop) nbStop.addEventListener('click', stopNarration);

});
