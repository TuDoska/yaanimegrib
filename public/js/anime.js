// Сторінка аніме: інформація, таймер серії, серії (автооновлення), де дивитися, трейлер, відгуки
const root = document.getElementById('anime');
const animeId = Number(new URLSearchParams(location.search).get('id'));
let anime = null;
let epPage = 1;

function infoRow(label, value) {
  return value ? `<div class="info__row"><dt>${esc(label)}</dt><dd>${value}</dd></div>` : '';
}

function dateText(d) {
  if (!d?.year) return '';
  if (!d.month) return String(d.year);
  return new Date(d.year, d.month - 1, d.day || 1).toLocaleDateString(locale(), { day: 'numeric', month: 'short', year: 'numeric' });
}

function nextEpBlock(a) {
  if (a.nextEp) {
    return `
      <div class="next-ep next-ep--big" id="next-ep">
        <span>${esc(t('anime.next_ep', { n: a.nextEp.episode }))}</span>
        <strong data-countdown="${a.nextEp.airingAt}">${countdownText(a.nextEp.airingAt) || ''}</strong>
        <small class="muted">${esc(fmt.dayTime(a.nextEp.airingAt))}</small>
      </div>`;
  }
  const key = a.status === 'FINISHED' ? 'anime.finished' : a.status === 'NOT_YET_RELEASED' ? 'anime.not_yet' : '';
  return key ? `<div class="next-ep" id="next-ep"><span>${esc(t(key))}</span></div>` : '<div id="next-ep"></div>';
}

function linksBlock(a) {
  if (!a.links.length) return `<p class="notice">${esc(t('anime.where_none'))}</p>`;
  return `
    <div class="links">
      ${a.links.map((l) => `
        <a class="link-btn" href="${esc(l.url)}" target="_blank" rel="noopener nofollow" style="--brand:${esc(l.color || '#3b4d43')}">
          ${l.icon ? `<img src="${esc(l.icon)}" alt="" width="20" height="20">` : '▶'}
          <span>${esc(l.site)}</span>
          ${l.language ? `<small>${esc(l.language)}</small>` : ''}
        </a>`).join('')}
    </div>
    <p class="muted small">${esc(t('anime.where_note'))}</p>`;
}

function render(a) {
  remember(a);
  document.title = `${a.title} — YaAnimeGrib`;
  const inFav = App.favIds.has(a.id);
  const season = a.season && a.year ? `${t('season.' + a.season)} ${a.year}` : a.year;
  const aired = [dateText(a.startDate), dateText(a.endDate)].filter(Boolean).join(' – ');
  const watchTogether = a.trailerId
    ? `rooms.html?video=${a.trailerId}&anime=${a.id}&name=${encodeURIComponent(a.title)}`
    : null;

  root.innerHTML = `
    <section class="anime-hero" style="--hero-bg:url('${esc(a.banner || a.coverXL)}')">
      <div class="container anime-hero__inner">
        <div class="anime-hero__side">
          <img class="anime-hero__cover" src="${esc(a.coverXL)}" alt="${esc(a.title)}">
          <button class="btn btn--block fav-btn ${inFav ? 'is-active' : ''}" data-fav="${a.id}">♥ <span data-fav-label>${esc(t(inFav ? 'common.in_fav' : 'common.add_fav'))}</span></button>
        </div>
        <div class="anime-hero__main">
          <nav class="crumbs"><a href="./">${esc(t('nav.home'))}</a> / <a href="catalog.html">${esc(t('nav.catalog'))}</a></nav>
          <h1 class="anime-title">${esc(a.title)}</h1>
          <p class="muted">${[a.titleEnglish !== a.title ? a.titleEnglish : '', a.titleNative].filter(Boolean).map(esc).join(' · ')}</p>
          <div class="scores">
            <div class="score-box"><b>★ ${a.score ? a.score.toFixed(1) : '—'}</b><small>AniList</small></div>
            <div class="score-box score-box--site" id="site-score"><b>🍄 —</b><small>${esc(t('anime.site_score'))}</small></div>
          </div>
          ${nextEpBlock(a)}
          <dl class="info">
            ${infoRow(t('anime.info.format'), esc(fmt.format(a.format)))}
            ${infoRow(t('anime.info.episodes'), a.episodes || (a.nextEp ? `${a.nextEp.episode - 1}+` : '?'))}
            ${infoRow(t('anime.info.status'), esc(fmt.status(a.status)))}
            ${infoRow(t('anime.info.aired'), esc(aired))}
            ${infoRow(t('anime.info.season'), esc(season || ''))}
            ${infoRow(t('anime.info.studio'), esc(a.studios.join(', ')))}
            ${infoRow(t('anime.info.duration'), a.duration ? esc(t('anime.info.min', { n: a.duration })) : '')}
            ${infoRow(t('anime.info.rank'), a.rank ? '#' + a.rank : '')}
          </dl>
          <div class="tags">${a.genres.map((g) => `<a class="tag" href="catalog.html?genre=${encodeURIComponent(g)}">${esc(g)}</a>`).join('')}</div>
        </div>
      </div>
    </section>

    <div class="container anime-body">
      <section class="section" id="where">
        <h2 class="section__title">${esc(t('anime.where'))}</h2>
        ${linksBlock(a)}
      </section>

      <section class="section">
        <h2 class="section__title">${esc(t('anime.description'))}</h2>
        <p class="synopsis">${esc(a.description || '—')}</p>
        ${a.description && currentLang !== 'en' ? `<p class="muted small">${esc(t('anime.desc_lang'))}</p>` : ''}
      </section>

      <section class="section">
        <div class="section__head">
          <h2 class="section__title">${esc(t('anime.trailer'))}</h2>
          ${watchTogether ? `<a class="btn btn--small" href="${watchTogether}">${esc(t('anime.watch_together'))}</a>` : ''}
        </div>
        ${a.trailerId
          ? `<div class="video"><iframe src="https://www.youtube-nocookie.com/embed/${esc(a.trailerId)}" title="${esc(a.title)}"
               allow="encrypted-media; picture-in-picture; fullscreen" allowfullscreen loading="lazy"></iframe></div>`
          : `<p class="notice">${esc(t('anime.no_trailer'))}</p>`}
      </section>

      <section class="section">
        <div class="section__head">
          <h2 class="section__title">${esc(t('anime.episodes'))}</h2>
          <span class="muted small">${esc(t('anime.episodes_note'))}</span>
        </div>
        <ol class="episodes" id="episodes"></ol>
        <div class="center"><button class="btn btn--ghost" id="eps-more" hidden>${esc(t('common.more'))}</button></div>
      </section>

      <section class="section" id="reviews">
        <div class="section__head">
          <h2 class="section__title">${esc(t('reviews.title'))}</h2>
          <span class="muted" id="reviews-count"></span>
        </div>
        <div id="review-form"></div>
        <div class="reviews" id="reviews-list"></div>
      </section>

      <section class="section">
        <h2 class="section__title">${esc(t('anime.recommendations'))}</h2>
        <div class="grid">${a.recommendations.length ? a.recommendations.map((r) => posterCard(r)).join('') : `<p class="notice">${esc(t('common.nothing'))}</p>`}</div>
      </section>
    </div>`;
}

/* ---------- Серії ---------- */
function episodeItem(n, airingAt) {
  const isNew = airingAt && Date.now() / 1000 - airingAt < 7 * 86400;
  return `
    <li class="episode ${isNew ? 'is-new' : ''}">
      <span class="episode__num">${n}</span>
      <span class="episode__title">${esc(t('common.episode', { n }))}</span>
      ${isNew ? `<span class="chip chip--new">${esc(t('common.new'))}</span>` : ''}
      <span class="episode__date muted">${airingAt ? fmt.date(airingAt * 1000) : esc(t('anime.ep_unknown_date'))}</span>
    </li>`;
}

async function loadEpisodes({ fresh = false, append = false } = {}) {
  const list = document.getElementById('episodes');
  const more = document.getElementById('eps-more');
  if (!append) epPage = 1;
  try {
    const res = await AniList.episodes(animeId, epPage, { fresh });
    const items = res.items.filter((e) => !anime.nextEp || e.episode < anime.nextEp.episode);
    const { hasNext } = res;
    let html = '';
    if (!append && anime.nextEp) {
      html += `<li class="episode is-upcoming"><span class="episode__num">${anime.nextEp.episode}</span>
        <span class="episode__title">${esc(t('common.episode', { n: anime.nextEp.episode }))}</span>
        <span class="timer">⏱ <span data-countdown="${anime.nextEp.airingAt}">${countdownText(anime.nextEp.airingAt) || ''}</span></span></li>`;
    }
    if (res.items.length) {
      html += items.map((e) => episodeItem(e.episode, e.airingAt)).join('');
      more.hidden = !hasNext;
    } else if (!append) {
      // Для старих аніме розкладу немає — показуємо номери серій
      const total = anime.episodes || (anime.nextEp ? anime.nextEp.episode - 1 : 0);
      const shown = Math.min(total, 48);
      html += Array.from({ length: shown }, (_, i) => episodeItem(total - i, null)).join('');
      more.hidden = true;
      if (!html) html = `<li class="notice">${esc(t('common.nothing'))}</li>`;
    }
    if (append) list.insertAdjacentHTML('beforeend', html);
    else list.innerHTML = html;
  } catch (err) {
    if (!append) errorBox(list, err.message, () => loadEpisodes());
  }
}

// Автооновлення: коли таймер дійшов до нуля, і раз на 10 хвилин
async function refreshAiring() {
  try {
    const fresh = await AniList.anime(animeId, { fresh: true });
    anime = remember(fresh);
    document.getElementById('next-ep').outerHTML = nextEpBlock(fresh);
    await loadEpisodes({ fresh: true });
  } catch { /* спробуємо пізніше */ }
}

let refreshPending = false;
root.addEventListener('countdown-done', () => {
  if (refreshPending) return;
  refreshPending = true;
  setTimeout(async () => { await refreshAiring(); refreshPending = false; }, 90 * 1000);
});
setInterval(() => { if (!document.hidden && anime?.status === 'RELEASING') refreshAiring(); }, 10 * 60 * 1000);

/* ---------- Відгуки ---------- */
function reviewCard(r) {
  const canDelete = r.mine || ['moderator', 'admin'].includes(App.user?.role);
  return `
    <article class="review ${r.hidden ? 'is-hidden' : ''}" data-id="${esc(r.id)}">
      <header class="review__head">
        <span class="avatar avatar--small">${esc(r.username[0].toUpperCase())}</span>
        <b>${esc(r.username)}</b>
        <span class="chip chip--score">★ ${r.rating}/10</span>
        <time class="muted small">${fmt.date(r.updatedAt || r.createdAt)}</time>
      </header>
      ${r.hidden ? `<p class="muted small">${esc(t('reviews.hidden'))}</p>` : ''}
      <p class="review__text">${esc(r.text)}</p>
      <footer class="review__actions">
        ${App.user && !r.mine ? `<button class="link" data-report="${esc(r.id)}">${esc(t('common.report'))}</button>` : ''}
        ${canDelete ? `<button class="link link--danger" data-delete-review="${esc(r.id)}">${esc(t('common.delete'))}</button>` : ''}
      </footer>
    </article>`;
}

function renderReviewForm(mine) {
  const box = document.getElementById('review-form');
  if (!App.user) {
    box.innerHTML = `<p class="notice"><a href="login.html?next=${encodeURIComponent('anime.html?id=' + animeId)}">${esc(t('reviews.login'))}</a></p>`;
    return;
  }
  if (App.user.banned) { box.innerHTML = `<p class="notice notice--error">${esc(t('room.banned'))}</p>`; return; }
  const rating = mine?.rating || 8;
  box.innerHTML = `
    <form class="review-form" id="rf">
      <label class="review-form__rating">${esc(t('reviews.rating'))}:
        <input type="range" name="rating" min="1" max="10" value="${rating}">
        <output>${rating}</output>/10
      </label>
      <textarea class="field" name="text" rows="3" maxlength="2000" required minlength="3"
        placeholder="${esc(t('reviews.placeholder'))}">${esc(mine?.text || '')}</textarea>
      <button class="btn">${esc(t(mine ? 'reviews.update' : 'reviews.submit'))}</button>
    </form>`;
  const form = box.querySelector('form');
  form.rating.addEventListener('input', () => { form.querySelector('output').textContent = form.rating.value; });
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button');
    btn.disabled = true;
    try {
      await api('/reviews/' + animeId, { method: 'POST', body: { rating: Number(form.rating.value), text: form.text.value } });
      toast(t('reviews.saved'), 'success');
      loadReviews();
    } catch (err) {
      toast(err.code === 'banned' ? t('room.banned') : err.message, 'error');
    }
    btn.disabled = false;
  });
}

async function loadReviews() {
  const list = document.getElementById('reviews-list');
  try {
    const { items, average, count } = await api('/reviews/' + animeId);
    document.getElementById('reviews-count').textContent = count ? t('reviews.count', { n: count }) : '';
    document.querySelector('#site-score b').textContent = `🍄 ${average ?? '—'}`;
    renderReviewForm(items.find((r) => r.mine));
    list.innerHTML = items.length ? items.map(reviewCard).join('') : `<p class="notice">${esc(t('reviews.empty'))}</p>`;
  } catch (err) {
    errorBox(list, err.message, loadReviews);
  }
}

document.addEventListener('click', async (e) => {
  const report = e.target.closest('[data-report]');
  if (report) return openReport('review', report.dataset.report);
  const del = e.target.closest('[data-delete-review]');
  if (del) {
    try { await api('/reviews/item/' + del.dataset.deleteReview, { method: 'DELETE' }); loadReviews(); } catch (err) { toast(err.message, 'error'); }
  }
});

document.getElementById('anime').addEventListener('click', (e) => {
  if (e.target.id === 'eps-more') { epPage++; loadEpisodes({ append: true }); }
});

async function init() {
  if (!animeId) {
    root.innerHTML = `<div class="container page"><p class="notice">${esc(t('anime.no_id'))} <a href="catalog.html">${esc(t('nav.catalog'))} →</a></p></div>`;
    return;
  }
  try {
    anime = await AniList.anime(animeId);
    render(anime);
    loadEpisodes();
    loadReviews();
  } catch (err) {
    root.innerHTML = '<div class="container page"></div>';
    errorBox(root.firstElementChild, err.status === 404 ? t('anime.not_found') : err.message, init);
  }
}

App.ready.then(init);
