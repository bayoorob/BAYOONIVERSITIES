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
    '06-architekturbeispiel-backend.html',
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
  const diagramSources = new Map();

  async function loadDiagramSource(diagram) {
    const sourcePath = diagram.dataset.src;
    if (!sourcePath) {
      return diagram.textContent;
    }
    if (!diagramSources.has(sourcePath)) {
      diagramSources.set(sourcePath, fetch(sourcePath).then(async (response) => {
        if (!response.ok) {
          throw new Error(`Failed to load diagram ${sourcePath} (HTTP ${response.status})`);
        }
        return response.text();
      }));
    }
    return diagramSources.get(sourcePath);
  }

  function getMarkedEdgeIndexes(source, markerName) {
    const startMarker = `%% ${markerName}-start`;
    const endMarker = `%% ${markerName}-end`;
    const start = source.indexOf(startMarker);
    const end = source.indexOf(endMarker);
    if (start < 0 || end < start) {
      throw new Error(`Diagram is missing the ${markerName} section markers`);
    }
    const sectionStart = source.lastIndexOf('\n', start) + 1;
    const sectionEnd = source.lastIndexOf('\n', end);
    const countEdges = (text) => (text.match(/(?:-->|-\.->|\.->|==>|--[ox]|<--|<-.|<==|~~~)/g) || []).length;
    const firstEdge = countEdges(source.slice(0, sectionStart));
    const edgeCount = countEdges(source.slice(sectionStart, sectionEnd));
    if (edgeCount === 0) {
      throw new Error(`Diagram has no edges in the ${markerName} section`);
    }
    return Array.from({ length: edgeCount }, (_, index) => firstEdge + index);
  }

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
    const source = await loadDiagramSource(diagram);
    const toggle = [...document.querySelectorAll('[data-hide-forbidden]')]
      .find((control) => control.dataset.hideForbidden === diagram.id);
    const { svg } = await mermaid.render(`architecture-${index}`, source);
    diagram.innerHTML = svg;
    diagram.dataset.rendered = 'true';

    if (toggle) {
      const edgePaths = [...diagram.querySelectorAll('.edgePaths path')];
      const forbiddenIndexes = getMarkedEdgeIndexes(source, 'forbidden');
      const forbiddenPaths = forbiddenIndexes.map((edgeIndex) => edgePaths[edgeIndex]);
      const forbiddenLabels = [...diagram.querySelectorAll('.edgeLabel')]
        .filter((label) => label.textContent.trim() === 'verboten');
      if (forbiddenPaths.some((path) => !path) || forbiddenLabels.length !== forbiddenIndexes.length) {
        throw new Error('Could not locate all forbidden edges in the rendered diagram');
      }

      for (const element of [...forbiddenPaths, ...forbiddenLabels]) {
        element.classList.add('forbidden-access');
      }
      const updateForbiddenVisibility = () => {
        diagram.classList.toggle('hide-forbidden', toggle.checked);
      };
      toggle.addEventListener('change', updateForbiddenVisibility);
      updateForbiddenVisibility();
    }
  }

  for (const code of document.querySelectorAll('pre code[data-trim]')) {
    code.textContent = code.textContent.trim();
  }

  function installPresenterNoteCards(presenterDocument) {
    const notes = presenterDocument.querySelector('.speaker-controls-notes .value');
    if (!notes || notes.dataset.sentenceCards === 'true') {
      return;
    }
    notes.dataset.sentenceCards = 'true';

    let observer;
    const renderNotes = () => {
      const sentences = notes.textContent
        .split(/\n\s*\n/)
        .map((sentence) => sentence.trim())
        .filter(Boolean);

      observer.disconnect();
      notes.replaceChildren(...sentences.map((sentence) => {
        const card = presenterDocument.createElement('p');
        card.className = 'note-sentence';
        card.textContent = sentence;
        return card;
      }));
      observer.observe(notes, { childList: true, subtree: true, characterData: true });
    };

    observer = new presenterDocument.defaultView.MutationObserver(renderNotes);
    observer.observe(notes, { childList: true, subtree: true, characterData: true });
    renderNotes();
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
      if (!presenterDocument || presenterDocument === document) {
        return;
      }
      if (!presenterDocument.getElementById('presenter-styles')) {
        const stylesheet = presenterDocument.createElement('link');
        stylesheet.id = 'presenter-styles';
        stylesheet.rel = 'stylesheet';
        stylesheet.href = new URL('presenter.css', location.href).href;
        presenterDocument.head.append(stylesheet);
      }
      installPresenterNoteCards(presenterDocument);
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