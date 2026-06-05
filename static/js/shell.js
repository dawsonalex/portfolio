/**
 * Gruvbox terminal shell — vanilla-JS port of the prototype's React app shell.
 *
 * Responsibilities:
 *   - theme toggle (data-mode on <body>) + persistence in localStorage['gv-mode']
 *   - live HH:MM clock in the status bar
 *   - buffer switcher popover (status bar, bottom-left)
 *   - command palette: desktop modal (filter + ↑/↓/↵/esc) and mobile bottom sheet,
 *     built from the build-time JSON in #palette-data, navigating by real URL.
 *
 * @author Alex Dawson (gruvbox redesign)
 */
(function () {
  'use strict';

  var body = document.body;
  var root = document.getElementById('cmd-root');
  var mqMobile = window.matchMedia('(max-width: 760px)');
  var GROUPS = { pages: 'Pages', posts: 'Posts', actions: 'Actions' };

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* ---------------- theme ---------------- */
  function currentMode() {
    return body.getAttribute('data-mode') === 'light' ? 'light' : 'dark';
  }
  function syncThemeLabels() {
    var label = currentMode() === 'dark' ? '◐ dark' : '◑ light';
    var els = document.querySelectorAll('[data-theme-label]');
    for (var i = 0; i < els.length; i++) { els[i].textContent = label; }
  }
  function toggleMode() {
    var next = currentMode() === 'dark' ? 'light' : 'dark';
    body.setAttribute('data-mode', next);
    try { localStorage.setItem('gv-mode', next); } catch (e) {}
    syncThemeLabels();
  }
  (function bindThemeButtons() {
    var btns = document.querySelectorAll('[data-theme-toggle]');
    for (var i = 0; i < btns.length; i++) { btns[i].addEventListener('click', toggleMode); }
    syncThemeLabels();
  })();

  /* ---------------- clock ---------------- */
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function tick() {
    var d = new Date();
    var s = pad(d.getHours()) + ':' + pad(d.getMinutes());
    var els = document.querySelectorAll('[data-clock]');
    for (var i = 0; i < els.length; i++) { els[i].textContent = s; }
  }
  tick();
  setInterval(tick, 20000);

  /* ---------------- buffer popover ---------------- */
  (function bufferSwitcher() {
    var wrap = document.querySelector('[data-path-wrap]');
    if (!wrap) return;
    var btn = wrap.querySelector('[data-path-btn]');
    var menu = wrap.querySelector('[data-path-menu]');
    var caret = btn.querySelector('.pb-caret');
    function onDoc(e) { if (!wrap.contains(e.target)) close(); }
    function onKey(e) { if (e.key === 'Escape') close(); }
    function open() {
      menu.hidden = false;
      btn.classList.add('open');
      if (caret) caret.textContent = '▾';
      document.addEventListener('mousedown', onDoc);
      document.addEventListener('keydown', onKey);
    }
    function close() {
      menu.hidden = true;
      btn.classList.remove('open');
      if (caret) caret.textContent = '▴';
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    }
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (menu.hidden) open(); else close();
    });
  })();

  /* ---------------- command palette ---------------- */
  var DATA = { pages: [], posts: [], current: location.pathname };
  try {
    var dataEl = document.getElementById('palette-data');
    if (dataEl) { DATA = JSON.parse(dataEl.textContent); }
  } catch (e) {}

  function norm(p) {
    try { p = new URL(p, location.origin).pathname; } catch (e) {}
    if (p.length > 1 && p.charAt(p.length - 1) === '/') { p = p.slice(0, -1); }
    return p || '/';
  }
  var CURRENT = norm(DATA.current || location.pathname);

  function buildItems() {
    var items = [];
    (DATA.pages || []).forEach(function (p) {
      items.push({ group: 'pages', icon: p.icon, label: p.label, hint: p.hint, url: p.url });
    });
    (DATA.posts || []).forEach(function (p) {
      items.push({ group: 'posts', icon: p.icon || '#', label: p.label, hint: p.hint, url: p.url, post: true });
    });
    items.push({
      group: 'actions', icon: '◐', action: 'theme', hint: '⌘\\',
      label: 'Toggle ' + (currentMode() === 'dark' ? 'light' : 'dark') + ' theme'
    });
    return items;
  }
  function isActive(it) { return !!it.url && norm(it.url) === CURRENT; }

  var state = { open: false, q: '', sel: 0, mobile: false };
  var currentFiltered = [];
  var desktopList = null;

  function filtered() {
    var q = state.q.trim().toLowerCase();
    var items = buildItems();
    if (!q) return items;
    return items.filter(function (it) {
      return it.label.toLowerCase().indexOf(q) > -1 ||
        (it.hint && it.hint.toLowerCase().indexOf(q) > -1);
    });
  }

  function run(it) {
    if (!it) return;
    if (it.action === 'theme') {
      toggleMode();
      if (!state.open) return;
      if (state.mobile) { render(); }
      else if (desktopList) { renderList(desktopList); }
      return;
    }
    if (it.url) { window.location.href = it.url; }
  }

  function renderList(listEl) {
    var items = filtered();
    currentFiltered = items;
    if (state.sel >= items.length) { state.sel = items.length ? items.length - 1 : 0; }
    if (!items.length) {
      listEl.innerHTML = '<div class="cmd-empty">no matches for “' + escapeHtml(state.q) + '”</div>';
      return;
    }
    var html = '', lastG = null;
    items.forEach(function (it, i) {
      if (it.group !== lastG) { html += '<div class="cmd-grp">' + GROUPS[it.group] + '</div>'; lastG = it.group; }
      html += '<div class="cmd-item' + (i === state.sel ? ' sel' : '') + '" data-i="' + i + '">' +
        '<span class="ci">' + escapeHtml(it.icon || '') + '</span>' +
        '<span class="pal-label" style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + escapeHtml(it.label) + '</span>' +
        '<span class="ck">' + escapeHtml(it.hint || '') + '</span></div>';
    });
    listEl.innerHTML = html;
  }

  function onInputKey(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      state.sel = Math.min(state.sel + 1, currentFiltered.length - 1);
      if (desktopList) renderList(desktopList);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      state.sel = Math.max(state.sel - 1, 0);
      if (desktopList) renderList(desktopList);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      run(currentFiltered[state.sel]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closePal();
    }
  }

  function buildModal() {
    var pal = document.createElement('div');
    pal.className = 'cmdpal';
    pal.innerHTML =
      '<div class="cmd-in"><span class="pfx">&gt;</span>' +
      '<input type="text" spellcheck="false" placeholder="jump to… (type to filter)"></div>' +
      '<div class="cmd-list"></div>' +
      '<div class="cmd-foot">' +
      '<span><kbd>↑↓</kbd> navigate</span>' +
      '<span><kbd>↵</kbd> open</span>' +
      '<span><kbd>esc</kbd> close</span></div>';
    var input = pal.querySelector('input');
    desktopList = pal.querySelector('.cmd-list');
    input.addEventListener('input', function () {
      state.q = input.value; state.sel = 0; renderList(desktopList);
    });
    input.addEventListener('keydown', onInputKey);
    desktopList.addEventListener('mouseover', function (e) {
      var item = e.target.closest('.cmd-item');
      if (!item) return;
      var i = parseInt(item.getAttribute('data-i'), 10);
      if (i !== state.sel) { state.sel = i; renderList(desktopList); }
    });
    desktopList.addEventListener('click', function (e) {
      var item = e.target.closest('.cmd-item');
      if (item) { run(currentFiltered[parseInt(item.getAttribute('data-i'), 10)]); }
    });
    renderList(desktopList);
    return pal;
  }

  function buildSheet() {
    var sheet = document.createElement('div');
    sheet.className = 'cmdsheet';
    var items = buildItems();
    var html =
      '<div class="sheet-grab"></div>' +
      '<div class="sheet-head"><span><span class="green">&gt; </span>jump to</span>' +
      '<button class="sheet-close" type="button" data-close>esc ✕</button></div>' +
      '<div class="sheet-list">';
    var lastG = null;
    items.forEach(function (it, i) {
      if (it.group !== lastG) { html += '<div class="sheet-grp">' + GROUPS[it.group] + '</div>'; lastG = it.group; }
      var act = isActive(it);
      html += '<button class="sheet-item' + (act ? ' active' : '') + '" type="button" data-i="' + i + '">' +
        '<span class="si-ic' + (it.post ? ' post' : '') + '">' + escapeHtml(it.icon || '') + '</span>' +
        '<span class="si-label">' + escapeHtml(it.label) + '</span>' +
        (act ? '<span class="si-cur">●</span>' : '<span class="si-hint">' + escapeHtml(it.hint || '') + '</span>') +
        '</button>';
    });
    html += '</div>';
    sheet.innerHTML = html;
    sheet.querySelector('[data-close]').addEventListener('click', closePal);
    var rows = sheet.querySelectorAll('.sheet-item');
    for (var r = 0; r < rows.length; r++) {
      (function (b) {
        b.addEventListener('click', function () { run(items[parseInt(b.getAttribute('data-i'), 10)]); });
      })(rows[r]);
    }
    return sheet;
  }

  function render() {
    root.innerHTML = '';
    desktopList = null;
    var ov = document.createElement('div');
    ov.className = 'cmd-ov' + (state.mobile ? ' sheet-ov' : '');
    ov.addEventListener('mousedown', function (e) { if (e.target === ov) closePal(); });
    ov.appendChild(state.mobile ? buildSheet() : buildModal());
    root.appendChild(ov);
    if (!state.mobile) {
      var input = ov.querySelector('.cmd-in input');
      if (input) { setTimeout(function () { input.focus(); }, 20); }
    }
  }

  function openPal() {
    if (state.open) return;
    state.open = true; state.q = ''; state.sel = 0; state.mobile = mqMobile.matches;
    render();
  }
  function closePal() {
    if (!state.open) return;
    state.open = false;
    root.innerHTML = '';
    desktopList = null;
  }

  /* triggers: ⌘K / Ctrl-K toggle, ⌘\ / Ctrl-\ theme, Esc close, [data-cmd-open] */
  window.addEventListener('keydown', function (e) {
    var meta = e.metaKey || e.ctrlKey;
    if (meta && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      if (state.open) closePal(); else openPal();
    } else if (meta && e.key === '\\') {
      e.preventDefault();
      toggleMode();
    } else if (e.key === 'Escape' && state.open) {
      e.preventDefault();
      closePal();
    }
  });

  var openers = document.querySelectorAll('[data-cmd-open]');
  for (var o = 0; o < openers.length; o++) {
    openers[o].addEventListener('click', openPal);
    openers[o].addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPal(); }
    });
  }
})();
