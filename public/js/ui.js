// Спільне для всіх сторінок: шапка, футер, наш API, обране, картки, таймери, повідомлення

/* ---------- Безпечний текст ---------- */
function esc(text = '') {
  return String(text ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* ---------- Наш сервер ---------- */
async function api(path, { method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetch('/api' + path, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'same-origin',
    });
  } catch {
    const err = new Error(t('common.network'));
    err.code = 'network';
    throw err;
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || 'server');
    err.code = res.status === 429 ? 'too_many' : data.error || 'server';
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

/* ---------- Поточний користувач ---------- */
const App = {
  user: null,
  favIds: new Set(),
  ready: null, // Promise, що завершується після завантаження користувача
};

const FAV_KEY = 'yag-favorites';
function localFavs() {
  try { return JSON.parse(localStorage.getItem(FAV_KEY)) || []; } catch { return []; }
}
function saveLocalFavs(list) {
  try { localStorage.setItem(FAV_KEY, JSON.stringify(list)); } catch { /* ignore */ }
}

async function loadSession() {
  try {
    const { user } = await api('/auth/me');
    App.user = user;
  } catch {
    App.user = null;
  }

  if (App.user) {
    // Мова з профілю має пріоритет
    if (App.user.lang && App.user.lang !== currentLang) setLang(App.user.lang);
    // Переносимо гостьове обране на сервер
    const local = localFavs();
    if (local.length) {
      try { await api('/favorites/sync', { method: 'POST', body: { items: local } }); saveLocalFavs([]); } catch { /* ignore */ }
    }
    try {
      const { items } = await api('/favorites');
      App.favIds = new Set(items.map((i) => i.id));
    } catch { /* ignore */ }
  } else {
    App.favIds = new Set(localFavs().map((i) => i.id));
  }
  renderUserMenu();
  document.dispatchEvent(new CustomEvent('session'));
}

/* ---------- Обране ---------- */
const animeStore = new Map();
const remember = (anime) => { if (anime) animeStore.set(anime.id, anime); return anime; };

function favPayload(a) {
  return { id: a.id, title: a.title, image: a.cover, score: a.score, format: a.format, episodes: a.episodes, year: a.year };
}

async function toggleFavorite(anime) {
  const has = App.favIds.has(anime.id);
  if (App.user) {
    if (has) await api('/favorites/' + anime.id, { method: 'DELETE' });
    else await api('/favorites', { method: 'POST', body: favPayload(anime) });
  } else {
    let list = localFavs();
    list = has ? list.filter((i) => i.id !== anime.id) : [favPayload(anime), ...list];
    saveLocalFavs(list);
  }
  has ? App.favIds.delete(anime.id) : App.favIds.add(anime.id);
  document.querySelectorAll(`[data-fav="${anime.id}"]`).forEach(updateFavButton);
  return !has;
}

function updateFavButton(btn) {
  const active = App.favIds.has(Number(btn.dataset.fav));
  btn.classList.toggle('is-active', active);
  btn.setAttribute('aria-pressed', active);
  const label = btn.querySelector('[data-fav-label]');
  if (label) label.textContent = t(active ? 'common.in_fav' : 'common.add_fav');
}

document.addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-fav]');
  if (!btn) return;
  e.preventDefault();
  const anime = animeStore.get(Number(btn.dataset.fav));
  if (!anime) return;
  btn.disabled = true;
  try { await toggleFavorite(anime); } catch (err) { toast(err.message, 'error'); }
  btn.disabled = false;
});

document.addEventListener('session', () => document.querySelectorAll('[data-fav]').forEach(updateFavButton));

/* ---------- Форматування ---------- */
const fmt = {
  format: (f) => (f ? t('format.' + f) : '—'),
  status: (s) => (s ? t('status.' + s) : '—'),
  date: (d) => new Date(d).toLocaleDateString(locale(), { day: 'numeric', month: 'short', year: 'numeric' }),
  time: (unix) => new Date(unix * 1000).toLocaleTimeString(locale(), { hour: '2-digit', minute: '2-digit' }),
  dayTime: (unix) => new Date(unix * 1000).toLocaleString(locale(), { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
  ago(unix) {
    const min = Math.max(0, Math.round((Date.now() / 1000 - unix) / 60));
    if (min < 1) return t('common.now');
    if (min < 60) return t('common.ago_m', { n: min });
    return t('common.ago_h', { n: Math.round(min / 60) });
  },
  num: (n) => Number(n || 0).toLocaleString(locale()),
};

/* ---------- Таймери зворотного відліку ----------
   <span data-countdown="UNIX_SECONDS"></span> — оновлюється щосекунди */
function countdownText(target) {
  let s = Math.floor(target - Date.now() / 1000);
  if (s <= 0) return null;
  const d = Math.floor(s / 86400); s %= 86400;
  const h = Math.floor(s / 3600); s %= 3600;
  const m = Math.floor(s / 60); s %= 60;
  const pad = (n) => String(n).padStart(2, '0');
  return (d ? `${d}${t('countdown.d')} ` : '') + `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function tickCountdowns() {
  document.querySelectorAll('[data-countdown]').forEach((el) => {
    const text = countdownText(Number(el.dataset.countdown));
    if (text) {
      el.textContent = text;
    } else if (!el.classList.contains('is-done')) {
      el.textContent = t('countdown.aired');
      el.classList.add('is-done');
      el.dispatchEvent(new CustomEvent('countdown-done', { bubbles: true }));
    }
  });
}
setInterval(tickCountdowns, 1000);

/* ---------- Картки ---------- */
function posterCard(a, { badge = '', sub = '' } = {}) {
  remember(a);
  const meta = sub || [a.year, a.episodes ? `${a.episodes} ${t('common.ep')}` : ''].filter(Boolean).join(' · ');
  return `
    <article class="card">
      <a class="card__link" href="anime.html?id=${a.id}">
        <div class="card__img" style="--tint:${esc(a.color || '#2a3a31')}">
          <img src="${esc(a.cover)}" alt="${esc(a.title)}" loading="lazy">
          ${a.score ? `<span class="chip chip--score">★ ${a.score.toFixed(1)}</span>` : ''}
          ${badge || (a.format ? `<span class="chip chip--format">${esc(fmt.format(a.format))}</span>` : '')}
        </div>
        <h3 class="card__title">${esc(a.title)}</h3>
        <p class="card__meta">${meta}</p>
      </a>
      <button class="fav ${App.favIds.has(a.id) ? 'is-active' : ''}" data-fav="${a.id}" aria-label="${esc(t('common.add_fav'))}">♥</button>
    </article>`;
}

// Картка для розкладу: серія + час або таймер
function airingCard(s, mode = 'countdown') {
  const isFuture = s.airingAt > Date.now() / 1000;
  const badge = `<span class="chip chip--ep">${esc(t('common.episode', { n: s.episode }))}</span>`;
  const sub = mode === 'ago' || !isFuture
    ? `<span class="muted">${fmt.ago(s.airingAt)}</span>`
    : `<span class="timer">⏱ <span data-countdown="${s.airingAt}">${countdownText(s.airingAt) || ''}</span></span>`;
  return posterCard(s.anime, { badge, sub });
}

function skeletons(n, kind = 'card') {
  return Array.from({ length: n }, () => `<div class="skeleton skeleton--${kind}"></div>`).join('');
}

function errorBox(container, message, retry) {
  container.innerHTML = `
    <div class="notice notice--error">
      <p>😕 ${esc(message || t('common.error'))}</p>
      ${retry ? `<button class="btn btn--small">${esc(t('common.retry'))}</button>` : ''}
    </div>`;
  if (retry) container.querySelector('button').addEventListener('click', retry);
}

/* ---------- Спливаючі повідомлення ---------- */
function toast(text, type = 'info') {
  let box = document.querySelector('.toasts');
  if (!box) {
    box = document.createElement('div');
    box.className = 'toasts';
    box.setAttribute('role', 'status');
    document.body.append(box);
  }
  const el = document.createElement('div');
  el.className = `toast toast--${type}`;
  el.textContent = text;
  box.append(el);
  setTimeout(() => el.classList.add('is-out'), 3200);
  setTimeout(() => el.remove(), 3700);
}

/* ---------- Скарга (модальне вікно) ---------- */
function openReport(targetType, targetId) {
  if (!App.user) { location.href = 'login.html?next=' + encodeURIComponent(location.pathname + location.search); return; }
  const reasons = ['spam', 'insult', 'spoiler', 'nsfw', 'piracy', 'other'];
  const dialog = document.createElement('dialog');
  dialog.className = 'modal';
  dialog.innerHTML = `
    <form method="dialog" class="modal__body">
      <h3>${esc(t('report.choose'))}</h3>
      <div class="radio-list">
        ${reasons.map((r, i) => `<label><input type="radio" name="reason" value="${r}" ${i === 0 ? 'checked' : ''}> ${esc(t('reason.' + r))}</label>`).join('')}
      </div>
      <textarea class="field" name="comment" maxlength="500" rows="2"></textarea>
      <div class="modal__actions">
        <button class="btn btn--ghost" value="cancel">${esc(t('common.cancel'))}</button>
        <button class="btn" value="send">${esc(t('common.report'))}</button>
      </div>
    </form>`;
  document.body.append(dialog);
  dialog.showModal();
  dialog.addEventListener('close', async () => {
    if (dialog.returnValue === 'send') {
      const form = dialog.querySelector('form');
      try {
        await api('/reports', { method: 'POST', body: { targetType, targetId, reason: form.reason.value, comment: form.comment.value } });
        toast(t('common.reported'), 'success');
      } catch (err) { toast(err.message, 'error'); }
    }
    dialog.remove();
  });
}

/* ---------- Шапка й футер ---------- */
const LOGO = `<svg class="logo__icon" viewBox="0 0 64 64" aria-hidden="true">
  <defs><linearGradient id="capg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff8a5c"/><stop offset="1" stop-color="#e8455a"/></linearGradient></defs>
  <path d="M8 30C8 16 19 7 32 7s24 9 24 23c0 3-2 5-5 5H13c-3 0-5-2-5-5z" fill="url(#capg)"/>
  <circle cx="22" cy="20" r="4" fill="#fff4e0"/><circle cx="38" cy="15" r="3" fill="#fff4e0"/><circle cx="45" cy="26" r="3.5" fill="#fff4e0"/>
  <path d="M22 35h20l-2 18c-.4 3-3 5-6 5h-4c-3 0-5.6-2-6-5z" fill="#fff4e0"/>
  <path d="M29 41l8 5-8 5z" fill="#e8455a"/>
</svg>`;

function renderLayout() {
  const page = location.pathname.split('/').pop().replace('.html', '') || 'index';
  const header = document.getElementById('site-header');
  if (header) {
    header.className = 'header';
    header.innerHTML = `
      <div class="container header__inner">
        <a href="./" class="logo" aria-label="YaAnimeGrib">${LOGO}<span>YaAnime<b>Grib</b></span></a>
        <nav class="nav" id="nav">
          <a href="./" data-page="index" data-i18n="nav.home"></a>
          <a href="catalog.html" data-page="catalog" data-i18n="nav.catalog"></a>
          <a href="schedule.html" data-page="schedule" data-i18n="nav.schedule"></a>
          <a href="rooms.html" data-page="rooms" data-i18n="nav.rooms"></a>
        </nav>
        <form class="search" role="search" action="catalog.html">
          <input type="search" name="q" data-i18n-placeholder="search.placeholder" data-i18n-aria="search.placeholder">
          <button type="submit" aria-label="🔍">🔍</button>
        </form>
        <div class="lang" role="group" aria-label="Language">
          ${LANGS.map((l) => `<button type="button" data-lang="${l.code}" class="${l.code === currentLang ? 'is-active' : ''}">${l.label}</button>`).join('')}
        </div>
        <div class="user-menu" id="user-menu"></div>
        <button class="burger" aria-label="Menu" aria-expanded="false"><span></span><span></span><span></span></button>
      </div>`;
    header.querySelector(`[data-page="${page}"]`)?.classList.add('is-active');

    const burger = header.querySelector('.burger');
    burger.addEventListener('click', () => {
      const open = header.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open);
    });

    header.querySelectorAll('[data-lang]').forEach((btn) => btn.addEventListener('click', async () => {
      const lang = btn.dataset.lang;
      setLang(lang);
      if (App.user) { try { await api('/auth/me', { method: 'PATCH', body: { lang } }); } catch { /* ignore */ } }
      location.reload(); // перемальовуємо все новою мовою
    }));
  }

  const footer = document.getElementById('site-footer');
  if (footer) {
    footer.className = 'footer';
    footer.innerHTML = `
      <div class="container footer__inner">
        <a href="./" class="logo logo--small">${LOGO}<span>YaAnime<b>Grib</b></span></a>
        <p data-i18n="footer.about"></p>
        <p class="footer__legal" data-i18n="footer.legal"></p>
        <p class="muted">© ${new Date().getFullYear()} YaAnimeGrib · <a href="https://anilist.co" target="_blank" rel="noopener">AniList</a></p>
      </div>`;
  }

  const toTop = document.createElement('button');
  toTop.className = 'to-top';
  toTop.textContent = '↑';
  toTop.setAttribute('aria-label', 'Top');
  toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));
  addEventListener('scroll', () => toTop.classList.toggle('is-visible', scrollY > 700), { passive: true });
  document.body.append(toTop);
}

function renderUserMenu() {
  const box = document.getElementById('user-menu');
  if (!box) return;
  const next = encodeURIComponent(location.pathname.split('/').pop() + location.search);
  if (!App.user) {
    box.innerHTML = `<a class="btn btn--small" href="login.html?next=${next}" data-i18n="nav.login"></a>`;
  } else {
    const isMod = App.user.role === 'moderator' || App.user.role === 'admin';
    box.innerHTML = `
      <details class="dropdown">
        <summary class="avatar" title="${esc(App.user.username)}">${esc(App.user.username[0].toUpperCase())}</summary>
        <div class="dropdown__menu">
          <p class="dropdown__name">${esc(App.user.username)} <span class="muted">· ${esc(t('role.' + App.user.role))}</span></p>
          <a href="profile.html" data-i18n="nav.profile"></a>
          ${isMod ? '<a href="admin.html" data-i18n="nav.admin"></a>' : ''}
          <button type="button" id="logout-btn" data-i18n="nav.logout"></button>
        </div>
      </details>`;
    box.querySelector('#logout-btn').addEventListener('click', async () => {
      try { await api('/auth/logout', { method: 'POST' }); } catch { /* ignore */ }
      location.href = './';
    });
  }
  applyI18n(box);
}

renderLayout();
applyI18n();
App.ready = loadSession();
