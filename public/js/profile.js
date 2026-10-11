// Профіль: інформація, мова, обране
const $info = document.getElementById('profile-info');
const $favs = document.getElementById('favs');

function renderInfo() {
  if (!App.user) {
    $info.innerHTML = `<p class="notice">${esc(t('profile.guest'))} <a href="login.html?next=profile.html">${esc(t('nav.login'))} →</a></p>`;
    return;
  }
  const u = App.user;
  $info.innerHTML = `
    <div class="profile-card">
      <span class="avatar avatar--big">${esc(u.username[0].toUpperCase())}</span>
      <div>
        <h1 class="page__title">${esc(u.username)}</h1>
        <p class="muted">${esc(t('profile.since', { date: fmt.date(u.createdAt) }))} · ${esc(t('role.' + u.role))}</p>
        ${u.banned ? `<p class="notice notice--error">${esc(t('profile.banned', { reason: u.banReason || '—' }))}</p>` : ''}
      </div>
      <label class="label profile-card__lang">${esc(t('profile.lang'))}
        <select class="field" id="lang-select">
          ${LANGS.map((l) => `<option value="${l.code}" ${l.code === currentLang ? 'selected' : ''}>${l.label}</option>`).join('')}
        </select>
      </label>
    </div>`;
  document.getElementById('lang-select').addEventListener('change', async (e) => {
    setLang(e.target.value);
    try { await api('/auth/me', { method: 'PATCH', body: { lang: e.target.value } }); } catch { /* ignore */ }
    location.reload();
  });
}

async function loadFavs() {
  $favs.innerHTML = skeletons(6);
  try {
    let items;
    if (App.user) items = (await api('/favorites')).items;
    else items = localFavs();
    // Приводимо до формату картки
    const cards = items.map((i) => ({
      id: i.id, title: i.title, cover: i.image, coverXL: i.image, score: i.score,
      format: i.format, episodes: i.episodes, year: i.year, genres: [],
    }));
    $favs.innerHTML = cards.length ? cards.map((a) => posterCard(a)).join('') : `<p class="notice">${esc(t('profile.empty_favs'))}</p>`;
  } catch (err) {
    errorBox($favs, err.message, loadFavs);
  }
}

// Прибрали ♥ на цій сторінці — оновлюємо список
$favs.addEventListener('click', (e) => {
  if (e.target.closest('[data-fav]')) setTimeout(loadFavs, 400);
});

App.ready.then(() => { renderInfo(); loadFavs(); });
