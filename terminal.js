/* =============================================================================
   Animated Aura terminal — types out an autonomous-agent ops session line by
   line with a blinking cursor, then loops. Pauses when off-screen / tab hidden.
   Pure DOM, no deps. Respects prefers-reduced-motion (shows the full log static).
============================================================================= */
(function () {
  const el = document.getElementById('ai-term');
  if (!el) return;

  // token: [text, className]. className maps to .c-acc / .c-ok / .c-muted / ''
  const LINES = [
    [['$ ', 'c-muted'], ['aura', 'c-acc'], [' deploy ops-agent --agent', '']],
    [['› ', 'c-muted'], ['building autonomous agent…', '']],
    [['✓ ', 'c-ok'], ['agent live · watching network state', '']],
    [['› ', 'c-muted'], ['drift detected on ', ''], ['node-07', 'c-acc']],
    [['✓ ', 'c-ok'], ['patched · resynced · healthy', '']],
    [['$ ', 'c-muted'], ['aura', 'c-acc'], [' agents scale --auto', '']],
    [['✓ ', 'c-ok'], ['fleet scaled · ', ''], ['+4 nodes', 'c-acc']],
    [['$ ', 'c-muted'], ['aura', 'c-acc'], [' agents ls', '']],
    [['› ', 'c-muted'], ['ops · scaler · sentinel  ', ''], ['(3 running)', 'c-acc']],
    [['✓ ', 'c-ok'], ['all green · ', ''], ['shipped on aura', 'c-acc']],
  ];

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function renderStatic() {
    el.innerHTML = '';
    for (const line of LINES) {
      const row = document.createElement('div'); row.className = 'ai-line';
      for (const [text, cls] of line) {
        const s = document.createElement('span'); s.textContent = text; if (cls) s.className = cls; row.appendChild(s);
      }
      el.appendChild(row);
    }
  }
  if (reduce) { renderStatic(); return; }

  let li = 0, ti = 0, ci = 0, curRow = null, curSpan = null, running = false, timer = 0;

  function reset() {
    el.innerHTML = ''; li = ti = ci = 0; curRow = curSpan = null;
    const cur = document.createElement('span'); cur.className = 'term-cursor'; cur.textContent = '▋';
    el.appendChild(cur);
  }
  const cursor = () => el.querySelector('.term-cursor');

  function step() {
    if (!running) return;
    if (li >= LINES.length) { timer = setTimeout(() => { reset(); step(); }, 2600); return; } // loop

    const line = LINES[li];
    if (ti === 0 && ci === 0) {                      // start a new visual row
      curRow = document.createElement('div'); curRow.className = 'ai-line';
      el.insertBefore(curRow, cursor());
    }
    const [text, cls] = line[ti];
    if (ci === 0) { curSpan = document.createElement('span'); if (cls) curSpan.className = cls; curRow.appendChild(curSpan); }
    curSpan.textContent = text.slice(0, ++ci);

    let delay = 26 + Math.random() * 34;             // per-char typing speed
    if (ci >= text.length) {                          // token done
      ci = 0; ti++;
      if (ti >= line.length) { ti = 0; li++; delay = 460; } // line done → pause
    }
    timer = setTimeout(step, delay);
  }

  function play()  { if (running) return; running = true; if (!cursor()) reset(); step(); }
  function pause() { running = false; clearTimeout(timer); }

  new IntersectionObserver(([e]) => e.isIntersecting ? play() : pause(),
    { threshold: 0.25 }).observe(el);
  document.addEventListener('visibilitychange', () => document.hidden ? pause() : play());
})();
