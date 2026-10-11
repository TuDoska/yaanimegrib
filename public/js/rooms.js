// Список кімнат і створення нової
const $list = document.getElementById('rooms');
const $mine = document.getElementById('my-rooms');
const $mineSection = document.getElementById('my-rooms-section');
const $create = document.getElementById('create-box');
const q = new URLSearchParams(location.search);

function roomCard(r) {
  return `
    <a class="room-card" href="room.html?id=${encodeURIComponent(r.id)}">
      <div class="room-card__thumb">
        <img src="https://i.ytimg.com/vi/${esc(r.videoId)}/hqdefault.jpg" alt="" loading="lazy">
        <span class="chip chip--live ${r.online ? '' : 'is-off'}">● ${esc(t('rooms.online', { n: r.online }))}</span>
      </div>
      <div class="room-card__body">
        <h3>${esc(r.name)}</h3>
        <p class="muted">${esc(t('rooms.by', { name: r.ownerName }))}</p>
      </div>
    </a>`;
}

function renderCreate() {
  if (!App.user) {
    $create.innerHTML = `<p class="notice"><a href="login.html?next=${encodeURIComponent('rooms.html' + location.search)}">${esc(t('rooms.login'))}</a></p>`;
    return;
  }
  const video = q.get('video');
  $create.innerHTML = `
    <form class="create-room" id="create-form">
      <h2>${esc(t('rooms.create'))}</h2>
      <label class="label">${esc(t('rooms.name'))}
        <input class="field" name="name" required minlength="2" maxlength="60" value="${esc(q.get('name') || '')}">
      </label>
      <label class="label">${esc(t('rooms.url'))}
        <input class="field" name="url" required placeholder="https://www.youtube.com/watch?v=…"
          value="${video ? 'https://www.youtube.com/watch?v=' + esc(video) : ''}">
        <small class="muted">${esc(t('rooms.url_hint'))}</small>
      </label>
      <label class="check"><input type="checkbox" name="isPublic" checked> ${esc(t('rooms.public'))}</label>
      <button class="btn">${esc(t('rooms.create_btn'))}</button>
    </form>`;
  const form = $create.querySelector('form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button');
    btn.disabled = true;
    try {
      const { room } = await api('/rooms', {
        method: 'POST',
        body: { name: form.name.value, url: form.url.value, isPublic: form.isPublic.checked, animeId: Number(q.get('anime')) || null },
      });
      location.href = 'room.html?id=' + encodeURIComponent(room.id);
    } catch (err) {
      const map = { bad_video: t('rooms.url'), bad_name: t('rooms.name'), banned: t('room.banned') };
      toast(map[err.code] ? `⚠ ${map[err.code]}` : err.message, 'error');
      btn.disabled = false;
    }
  });
}

async function load() {
  $list.innerHTML = skeletons(4, 'room');
  try {
    const { items } = await api('/rooms');
    $list.innerHTML = items.length ? items.map(roomCard).join('') : `<p class="notice">${esc(t('rooms.empty'))}</p>`;
  } catch (err) {
    errorBox($list, err.message, load);
  }
  if (App.user) {
    try {
      const { items } = await api('/rooms/mine');
      $mineSection.hidden = !items.length;
      $mine.innerHTML = items.map(roomCard).join('');
    } catch { /* ignore */ }
  }
}

App.ready.then(() => { renderCreate(); load(); });
setInterval(() => { if (!document.hidden) load(); }, 30 * 1000);
