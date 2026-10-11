// Каталог: пошук, фільтри, «Показати ще»
const form = document.getElementById('filters');
const grid = document.getElementById('grid');
const info = document.getElementById('info');
const moreBtn = document.getElementById('more');
const title = document.getElementById('title');

const FIELDS = ['q', 'genre', 'format', 'status', 'sort'];
let page = 1;
let requestId = 0;

const params = new URLSearchParams(location.search);
FIELDS.forEach((f) => { if (params.has(f)) form.elements[f].value = params.get(f); });

function filters() {
  const d = new FormData(form);
  return Object.fromEntries(FIELDS.map((f) => [f, String(d.get(f) || '').trim()]));
}

function syncUrlAndTitle(f) {
  const p = new URLSearchParams();
  Object.entries(f).forEach(([k, v]) => { if (v && !(k === 'sort' && v === 'POPULARITY_DESC')) p.set(k, v); });
  history.replaceState(null, '', 'catalog.html' + (p.toString() ? '?' + p : ''));
  if (f.q) title.textContent = `«${f.q}»`;
  else if (f.status === 'RELEASING' && !f.genre) title.textContent = t('catalog.ongoing');
  else if (f.sort === 'SCORE_DESC' && !f.genre && !f.format) title.textContent = t('catalog.top');
  else if (f.genre) title.textContent = f.genre;
  else title.textContent = t('catalog.title');
  document.title = `${title.textContent} — YaAnimeGrib`;
}

async function load(append = false) {
  const f = filters();
  const id = ++requestId;
  if (!append) {
    page = 1;
    syncUrlAndTitle(f);
    grid.innerHTML = skeletons(12);
    info.textContent = '';
  }
  moreBtn.disabled = true;
  try {
    const res = await AniList.search({ ...f, sort: f.sort || 'POPULARITY_DESC', page });
    if (id !== requestId) return;
    const html = res.items.map((a) => posterCard(a)).join('');
    if (append) grid.insertAdjacentHTML('beforeend', html);
    else grid.innerHTML = html || `<p class="notice">${esc(t('catalog.nothing'))}</p>`;
    info.textContent = res.total ? t('catalog.found', { n: fmt.num(res.total) }) : '';
    moreBtn.hidden = !res.hasNext;
  } catch (err) {
    if (id !== requestId) return;
    if (append) toast(err.message, 'error');
    else errorBox(grid, err.message, () => load());
  } finally {
    moreBtn.disabled = false;
  }
}

let typing;
form.elements.q.addEventListener('input', () => { clearTimeout(typing); typing = setTimeout(() => load(), 600); });
form.addEventListener('change', (e) => { if (e.target.name !== 'q') load(); });
form.addEventListener('submit', (e) => { e.preventDefault(); clearTimeout(typing); load(); });
form.addEventListener('reset', () => setTimeout(() => load(), 0));
moreBtn.addEventListener('click', () => { page++; load(true); });

async function loadGenres() {
  try {
    const genres = await AniList.genres();
    const select = form.elements.genre;
    select.insertAdjacentHTML('beforeend', genres.map((g) => `<option value="${esc(g)}">${esc(g)}</option>`).join(''));
    select.value = params.get('genre') || '';
  } catch { /* без жанрів теж працює */ }
}

App.ready.then(() => { load(); loadGenres(); });
