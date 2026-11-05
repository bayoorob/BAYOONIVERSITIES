async function startPresentation() {
  if (typeof Reveal === 'undefined' || typeof mermaid === 'undefined') {
    document.body.textContent = 'Required dependencies are missing. Run npm ci in the code directory and reload the page.';
    return;
  }

  if (location.protocol === 'file:') {
    throw new Error('Slide files must be served over HTTP');
  }

  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'strict',
    theme: 'base',
    themeVariables: {
      fontFamily: 'Consolas, Courier New, monospace',
      fontSize: '24px',
      primaryColor: '#252c35',
      primaryTextColor: '#f6f7f9',
      primaryBorderColor: '#8591a5',
      lineColor: '#a9b2c0',
      textColor: '#f6f7f9',
      edgeLabelBackground: '#15191e',
      tertiaryColor: '#252c35'
    },
    flowchart: { htmlLabels: false, curve: 'linear', nodeSpacing: 36, rankSpacing: 70, padding: 20 }
  });

  const slideFiles = [
    '01-titel.html',
    '02-das-problem.html',
    '03-definition.html',
    '04-architekturregeln.html',
    '05-frameworks.html',
    '06-schichten.html',
    '07-test.html',
    '08-demo.html',
    '09-ci.html',
    '10-praxis.html',
    '11-grenzen.html',
    '12-einstieg.html',
    '13-fazit.html',
    '14-diskussion.html',
    '15-vertraege.html',
    '16-modultest.html',
    '17-module.html',
    '18-konventionen.html'
  ];
  const slides = await Promise.all(slideFiles.map(async (filename) => {
    const response = await fetch(`slides/${filename}`);
    if (!response.ok) {
      throw new Error(`Failed to load slide ${filename} (HTTP ${response.status})`);
    }
    const template = document.createElement('template');
    template.innerHTML = await response.text();
    if (template.content.children.length !== 1 || !template.content.firstElementChild.matches('section')) {
      throw new Error(`Slide ${filename} must contain exactly one section element`);
    }
    return template.content;
  }));
  document.querySelector('.slides').prepend(...slides);

  for (const [index, diagram] of [...document.querySelectorAll('.mermaid')].entries()) {
    const { svg } = await mermaid.render(`architecture-${index}`, diagram.textContent);
    diagram.innerHTML = svg;
    diagram.dataset.rendered = 'true';
  }

  for (const code of document.querySelectorAll('pre code[data-trim]')) {
    code.textContent = code.textContent.trim();
  }

  window.addEventListener('message', (event) => {
    if (event.origin !== location.origin || typeof event.data !== 'string') {
      return;
    }
    try {
      const message = JSON.parse(event.data);
      if (message?.namespace !== 'reveal-notes' || !['connected', 'heartbeat'].includes(message.type)) {
        return;
      }
      const presenterDocument = event.source?.document;
      if (!presenterDocument || presenterDocument === document || presenterDocument.getElementById('presenter-styles')) {
        return;
      }
      const stylesheet = presenterDocument.createElement('link');
      stylesheet.id = 'presenter-styles';
      stylesheet.rel = 'stylesheet';
      stylesheet.href = new URL('presenter.css', location.href).href;
      presenterDocument.head.append(stylesheet);
    } catch {
      return;
    }
  });

  await Reveal.initialize({
    width: 1200,
    height: 675,
    margin: 0.06,
    minScale: 0.1,
    maxScale: 1.5,
    hash: true,
    controls: true,
    controlsTutorial: false,
    progress: true,
    slideNumber: 'c',
    keyboard: { 37: 'prev', 38: 'prev', 39: 'next', 40: 'next' },
    touch: true,
    navigationMode: 'linear',
    scrollActivationWidth: null,
    center: false,
    transition: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'none' : 'fade',
    plugins: [RevealNotes, RevealHighlight]
  });
  document.body.classList.remove('deck-loading');
}

startPresentation().catch((error) => {
  document.body.classList.remove('deck-loading');
  document.body.textContent = `Failed to load the presentation: ${error.message}. Run npm start from the code directory and open http://127.0.0.1:4173/.`;
  console.error(error);
});