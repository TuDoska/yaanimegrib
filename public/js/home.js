// Головна сторінка
const $hero = document.getElementById('hero');
const $newEps = document.getElementById('new-eps');
const $soon = document.getElementById('soon');
const $season = document.getElementById('season');
const $rooms = document.getElementById('rooms-list');

const nowSec = () => Math.floor(Date.now() / 1000);

/* ---------- Hero-слайдер ---------- */
let heroItems = [];
let heroIndex = 0;
let heroTimer;

function renderHero(i) {
  const a = heroItems[i];
  if (!a) return;
  heroIndex = i;
  remember(a);
  $hero.style.setProperty('--hero-bg', `url("${a.banner || a.coverXL}")`);
  $hero.querySelector('.hero__inner').innerHTML = `
    <div class="hero__content">
      <p class="eyebrow">${esc(t('home.hero_label'))}</p>
      <h1 class="hero__title">${esc(a.title)}</h1>
      <ul class="meta-row">
        ${a.score ? `<li class="score">★ ${a.score.toFixed(1)}</li>` : ''}
        <li>${esc(fmt.format(a.format))}</li>
        ${a.year ? `<li>${a.year}</li>` : ''}
        ${a.episodes ? `<li>${a.episodes} ${esc(t('common.ep'))}</li>` : ''}
      </ul>
      <div class="tags">${a.genres.slice(0, 4).map((g) => `<a class="tag" href="catalog.html?genre=${encodeURIComponent(g)}">${esc(g)}</a>`).join('')}</div>
      ${a.nextEp ? `
        <div class="next-ep">
          <span>${esc(t('home.next_ep', { n: a.nextEp.episode }))}</span>
          <strong data-countdown="${a.nextEp.airingAt}">${countdownText(a.nextEp.airingAt) || ''}</strong>
        </div>` : ''}
      <div class="hero__actions">
        <a class="btn" href="anime.html?id=${a.id}">${esc(t('common.details'))}</a>
        <button class="btn btn--ghost fav-btn ${App.favIds.has(a.id) ? 'is-active' : ''}" data-fav="${a.id}">♥ <span data-fav-label>${esc(t(App.favIds.has(a.id) ? 'common.in_fav' : 'common.add_fav'))}</span></button>
      </div>
      <div class="dots">${heroItems.map((_, k) => `<button class="dot ${k === i ? 'is-active' : ''}" data-dot="${k}" aria-label="${k + 1}"></button>`).join('')}</div>
    </div>
    <a class="hero__poster" href="anime.html?id=${a.id}"><img src="${esc(a.coverXL)}" alt="${esc(a.title)}"></a>`;
}

function startHero() {
  clearInterval(heroTimer);
  heroTimer = setInterval(() => renderHero((heroIndex + 1) % heroItems.length), 8000);
}

$hero.addEventListener('click', (e) => {
  const dot = e.target.closest('[data-dot]');
  if (dot) { renderHero(Number(dot.dataset.dot)); startHero(); }
});

async function loadHero() {
  try {
    const { items } = await AniList.trending(6);
    heroItems = items;
    renderHero(0);
    startHero();
  } catch (err) {
    $hero.querySelector('.hero__inner').innerHTML = '';
    $hero.classList.add('hero--empty');
  }
}

/* ---------- Нові серії / скоро ---------- */
async function loadNewEpisodes(fresh = false) {
  if (!fresh) $newEps.innerHTML = skeletons(6);
  try {
    const list = await AniList.airing(nowSec() - 86400, nowSec(), { fresh });
    const top = list.sort((a, b) => b.anime.popularity - a.anime.popularity).slice(0, 12)
      .sort((a, b) => b.airingAt - a.airingAt);
    $newEps.innerHTML = top.length ? top.map((s) => airingCard(s, 'ago')).join('') : `<p class="notice">${esc(t('common.nothing'))}</p>`;
  } catch (err) {
    errorBox($newEps, err.message, () => loadNewEpisodes());
  }
}

async function loadSoon(fresh = false) {
  if (!fresh) $soon.innerHTML = skeletons(6);
  try {
    const list = await AniList.airing(nowSec(), nowSec() + 86400, { fresh });
    const top = list.sort((a, b) => b.anime.popularity - a.anime.popularity).slice(0, 12)
      .sort((a, b) => a.airingAt - b.airingAt);
    $soon.innerHTML = top.length ? top.map((s) => airingCard(s)).join('') : `<p class="notice">${esc(t('common.nothing'))}</p>`;
  } catch (err) {
    errorBox($soon, err.message, () => loadSoon());
  }
}

// Коли таймер дійшов до нуля — за хвилину оновлюємо обидва списки
let refreshScheduled = false;
$soon.addEventListener('countdown-done', () => {
  if (refreshScheduled) return;
  refreshScheduled = true;
  setTimeout(() => { refreshScheduled = false; loadNewEpisodes(true); loadSoon(true); }, 60 * 1000);
});
setInterval(() => { if (!document.hidden) { loadNewEpisodes(true); loadSoon(true); } }, 10 * 60 * 1000);

/* ---------- Сезон ---------- */
async function loadSeason() {
  $season.innerHTML = skeletons(12);
  try {
    const { items } = await AniList.season(12);
    $season.innerHTML = items.map((a) => posterCard(a)).join('');
  } catch (err) {
    errorBox($season, err.message, loadSeason);
  }
}

/* ---------- Кімнати ---------- */
function roomCard(r) {
  return `
    <a class="room-card" href="room.html?id=${encodeURIComponent(r.id)}">
      <div class="room-card__thumb">
        <img src="https://i.ytimg.com/vi/${esc(r.videoId)}/hqdefault.jpg" alt="" loading="lazy">
        <span class="chip chip--live">● ${esc(t('rooms.online', { n: r.online }))}</span>
      </div>
      <div class="room-card__body">
        <h3>${esc(r.name)}</h3>
        <p class="muted">${esc(t('rooms.by', { name: r.ownerName }))}</p>
      </div>
    </a>`;
}

async function loadRooms() {
  try {
    const { items } = await api('/rooms');
    $rooms.innerHTML = items.length
      ? items.slice(0, 4).map(roomCard).join('')
      : `<p class="notice">${esc(t('home.rooms_empty'))}</p>`;
  } catch {
    $rooms.innerHTML = `<p class="notice">${esc(t('home.rooms_empty'))}</p>`;
  }
}

App.ready.then(() => {
  loadHero();
  loadNewEpisodes();
  loadSoon();
  loadSeason();
  loadRooms();
});
