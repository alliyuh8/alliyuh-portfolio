/*
 * Temporary freehand annotations for the portfolio.
 * Homepage: draw only on empty background.
 * Project pages: draw over static images and copy, but never over controls.
 */
(function () {
  'use strict';

  // Avoid accidental drawing while scrolling on touchscreens.
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  var page = decodeURIComponent(window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
  var isHome = page === 'index.html';
  var excludedPages = ['about.html', 'contact.html', 'services.html', 'works.html'];
  if (excludedPages.indexOf(page) !== -1) return;

  var HOLD_MS = 8000;
  var FADE_MS = 2000;
  var STROKE_COLOR = '#737373';
  var STROKE_WIDTH = 2.5;
  var strokes = [];
  var activeStroke = null;
  var frameRequested = false;

  var canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.className = 'portfolio-drawing-overlay';
  Object.assign(canvas.style, {
    position: 'fixed',
    inset: '0',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: '2147483000'
  });
  document.body.appendChild(canvas);

  var ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.remove();
    return;
  }

  function resize() {
    var pixelRatio = window.devicePixelRatio || 1;
    canvas.width = Math.round(window.innerWidth * pixelRatio);
    canvas.height = Math.round(window.innerHeight * pixelRatio);
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    requestRender();
  }

  function isDrawableTarget(target) {
    if (!(target instanceof Element)) return false;

    // Preserve navigation, filters, embeds, accessible controls, and lightboxes.
    if (target.closest(
      'a, button, input, select, textarea, label, summary, [role="button"], ' +
      '[contenteditable], [data-toggle], nav, footer, iframe, video, audio, ' +
      '.burger, .fancybox, .owl-nav, .owl-dots'
    )) return false;

    if (isHome) {
      // Only blank homepage space, never portfolio tiles or their hover effects.
      if (target.closest(
        '.item, .item-wrap, #filters, .work-info, .thumbnail-container, ' +
        'img, picture, svg, p, h1, h2, h3, h4, h5, h6, span, small, strong, em'
      )) return false;
      return !!target.closest('main, .site-portfolio');
    }

    // On project pages, static text and images can be annotated.
    return !!target.closest('main');
  }

  function point(event) {
    return { x: event.pageX, y: event.pageY };
  }

  function requestRender() {
    if (frameRequested) return;
    frameRequested = true;
    window.requestAnimationFrame(render);
  }

  function render(now) {
    frameRequested = false;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    strokes = strokes.filter(function (stroke) {
      return stroke === activeStroke || now < stroke.finishedAt + HOLD_MS + FADE_MS;
    });

    ctx.save();
    ctx.translate(-window.scrollX, -window.scrollY);
    ctx.strokeStyle = STROKE_COLOR;
    ctx.fillStyle = STROKE_COLOR;
    ctx.lineWidth = STROKE_WIDTH;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    strokes.forEach(function (stroke) {
      var opacity = 1;
      if (stroke.finishedAt !== null) {
        opacity = Math.max(0, Math.min(1,
          (stroke.finishedAt + HOLD_MS + FADE_MS - now) / FADE_MS
        ));
      }
      ctx.globalAlpha = 0.9 * opacity;
      var points = stroke.points;
      ctx.beginPath();
      if (points.length === 1) {
        ctx.arc(points[0].x, points[0].y, STROKE_WIDTH / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.moveTo(points[0].x, points[0].y);
        for (var i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();
      }
    });

    ctx.restore();
    if (strokes.length || activeStroke) requestRender();
  }

  document.addEventListener('pointerdown', function (event) {
    if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
    if (event.button !== 0 || activeStroke || !isDrawableTarget(event.target)) return;

    event.preventDefault(); // No text selection or image drag while sketching.
    activeStroke = { pointerId: event.pointerId, points: [point(event)], finishedAt: null };
    strokes.push(activeStroke);
    requestRender();
  }, { capture: true, passive: false });

  window.addEventListener('pointermove', function (event) {
    if (!activeStroke || event.pointerId !== activeStroke.pointerId) return;
    var next = point(event);
    var points = activeStroke.points;
    var last = points[points.length - 1];
    if (Math.hypot(next.x - last.x, next.y - last.y) >= 0.7 && points.length < 4000) {
      points.push(next);
      requestRender();
    }
  });

  function finishStroke(event) {
    if (!activeStroke || (event && event.pointerId !== undefined && event.pointerId !== activeStroke.pointerId)) return;
    activeStroke.finishedAt = performance.now();
    activeStroke = null;
    requestRender();
  }
  window.addEventListener('pointerup', finishStroke);
  window.addEventListener('pointercancel', finishStroke);
  window.addEventListener('blur', finishStroke);
  window.addEventListener('resize', resize);
  window.addEventListener('scroll', requestRender, { passive: true });

  resize();
})();
