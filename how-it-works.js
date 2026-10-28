(() => {
  const workflow = document.querySelector('.workflow');
  const flowPaths = document.querySelector('#flow-paths');
  const auditPaths = document.querySelector('#audit-paths');
  const motion = document.querySelector('#motion-toggle');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 900px)');
  const NS = 'http://www.w3.org/2000/svg';

  function path(parent, d, className) {
    const element = document.createElementNS(NS, 'path');
    element.setAttribute('d', d);
    element.setAttribute('class', className);
    if (className === 'flow-pulse') element.setAttribute('pathLength', '100');
    parent.appendChild(element);
  }

  function draw() {
    flowPaths.replaceChildren();
    auditPaths.replaceChildren();
    if (mobile.matches) return;
    const bounds = workflow.getBoundingClientRect();
    const box = id => {
      const rect = document.getElementById(id).getBoundingClientRect();
      return {left: rect.left - bounds.left, right: rect.right - bounds.left,
        bottom: rect.bottom - bounds.top, x: rect.left - bounds.left + rect.width / 2,
        y: rect.top - bounds.top + rect.height / 2};
    };
    function connect(from, to, branch = false) {
      const a = box(from), b = box(to), mid = (a.right + b.left) / 2;
      const d = branch ? `M${a.right},${a.y} H${mid} V${b.y} H${b.left - 3}`
        : `M${a.right},${a.y} L${b.left - 3},${b.y}`;
      path(flowPaths, d, 'flow-path');
      path(flowPaths, d, 'flow-pulse');
    }
    connect('request', 'planning');
    ['a', 'b', 'c'].forEach(letter => {
      connect('planning', `agent-${letter}`, true);
      connect(`agent-${letter}`, `model-${letter}`);
      connect(`model-${letter}`, 'verification', true);
    });
    connect('verification', 'answer');

    const auditTop = document.getElementById('audit-log').getBoundingClientRect().top - bounds.top;
    // Route each branch into the logging bus through the gaps between cards.
    const bus = auditTop - 22;
    const ids = ['request', 'planning', 'agent-a', 'agent-b', 'agent-c', 'model-a', 'model-b', 'model-c', 'verification', 'answer'];
    ids.forEach(id => {
      const b = box(id);
      const branch = /^(agent|model)-[ab]$/.test(id);
      const x = branch ? b.left - 8 : b.x;
      path(auditPaths, `M${b.x},${b.bottom} V${b.bottom + 8} H${x} V${bus}`, 'audit-path');
    });
    path(auditPaths, `M${box('request').x},${bus} H${box('answer').x} M${bounds.width / 2},${bus} V${auditTop}`, 'audit-path');
  }

  function setPaused(paused) {
    document.body.classList.toggle('motion-paused', paused);
    motion.textContent = paused ? 'Play pulses' : 'Pause pulses';
    motion.setAttribute('aria-pressed', String(paused));
  }
  motion.hidden = false;
  setPaused(reducedMotion.matches);
  motion.addEventListener('click', () => setPaused(!document.body.classList.contains('motion-paused')));
  reducedMotion.addEventListener('change', event => setPaused(event.matches));
  new ResizeObserver(draw).observe(workflow);
  document.fonts.ready.then(draw);
  draw();
})();
