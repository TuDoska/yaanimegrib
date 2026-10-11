// Кімната спільного перегляду: YouTube IFrame API + Socket.io
const roomId = new URLSearchParams(location.search).get('id');
const $page = document.getElementById('room');
const socket = io({ autoConnect: false });

let player = null;
let playerReady = false;
let me = null;
let canModerate = false;
let ownerId = null;
let hostOnly = false;
let applyingRemote = false; // щоб не відправляти назад зміни, які прийшли з сервера
let lastKnownTime = 0;
let pendingState = null;

/* ---------- Розмітка ---------- */
function renderShell(room) {
  document.title = `${room.name} — YaAnimeGrib`;
  $page.innerHTML = `
    <div class="room-layout">
      <section class="room-main">
        <div class="room-head">
          <div>
            <h1 class="room-title">${esc(room.name)}</h1>
            <p class="muted">${esc(t('rooms.by', { name: room.ownerName }))}
              ${room.animeId ? ` · <a href="anime.html?id=${room.animeId}">${esc(t('common.details'))} →</a>` : ''}</p>
          </div>
          <div class="room-head__actions">
            <button class="btn btn--small" id="share">🔗 ${esc(t('room.share'))}</button>
            <button class="btn btn--small btn--ghost" id="resync">⟳ ${esc(t('room.sync'))}</button>
          </div>
        </div>
        <div class="video video--room"><div id="player"></div></div>
        <p class="room-event muted small" id="event"></p>
        <div class="room-owner" id="owner-tools" hidden>
          <label class="check"><input type="checkbox" id="host-only"> ${esc(t('room.host_only'))}</label>
          <form id="video-form" class="inline-form">
            <input class="field" name="url" placeholder="${esc(t('room.change_video'))}: https://youtu.be/…">
            <button class="btn btn--small">${esc(t('room.change'))}</button>
          </form>
          <button class="btn btn--small btn--danger" id="close-room">${esc(t('room.close'))}</button>
        </div>
        <p class="muted small"><button class="link" id="report-room">${esc(t('room.report'))}</button> · ${esc(t('rooms.url_hint'))}</p>
      </section>

      <aside class="room-side">
        <section class="panel">
          <h2 class="panel__title">👥 ${esc(t('room.users'))} <span id="users-count" class="muted"></span></h2>
          <ul class="users" id="users"></ul>
        </section>
        <section class="panel chat">
          <h2 class="panel__title">💬 ${esc(t('room.chat'))}</h2>
          <ol class="chat__list" id="chat"></ol>
          <div id="chat-form-box"></div>
        </section>
      </aside>
    </div>`;
}

function fatal(message) {
  $page.innerHTML = `<div class="container page"><div class="notice notice--error"><p>${esc(message)}</p>
    <a class="btn" href="rooms.html">${esc(t('nav.rooms'))}</a></div></div>`;
  try { player?.destroy(); } catch { /* ignore */ }
  socket.disconnect();
}

/* ---------- Учасники й чат ---------- */
function renderUsers(users) {
  document.getElementById('users-count').textContent = `(${users.length})`;
  document.getElementById('users').innerHTML = users.map((u) => `
    <li class="user">
      <span class="avatar avatar--small">${esc((u.username || '?')[0].toUpperCase())}</span>
      <span>${esc(u.username || t('room.guest'))}</span>
      ${u.id === ownerId ? `<span class="chip chip--owner">${esc(t('room.owner'))}</span>` : ''}
      ${u.role === 'moderator' || u.role === 'admin' ? `<span class="chip">${esc(t('role.' + u.role))}</span>` : ''}
      ${canModerate && u.username && u.id !== me?.id && u.id !== ownerId
        ? `<button class="link link--danger" data-kick="${esc(u.id)}">${esc(t('room.kick'))}</button>` : ''}
    </li>`).join('');
}

function messageHtml(m) {
  const mod = canModerate ? `<button class="link link--danger" data-del-msg="${esc(m.id)}" title="${esc(t('common.delete'))}">✕</button>` : '';
  const report = App.user && m.userId !== App.user.id ? `<button class="link" data-report-msg="${esc(m.id)}" title="${esc(t('common.report'))}">⚑</button>` : '';
  return `
    <li class="msg ${m.userId === me?.id ? 'is-mine' : ''}" data-msg="${esc(m.id)}">
      <b class="msg__name ${m.role === 'admin' || m.role === 'moderator' ? 'is-staff' : ''}">${esc(m.username)}</b>
      <span class="msg__text">${esc(m.text)}</span>
      <span class="msg__tools">${report}${mod}</span>
    </li>`;
}

function addMessages(msgs) {
  const list = document.getElementById('chat');
  const nearBottom = list.scrollHeight - list.scrollTop - list.clientHeight < 80;
  list.insertAdjacentHTML('beforeend', msgs.map(messageHtml).join(''));
  if (nearBottom || msgs.length > 1) list.scrollTop = list.scrollHeight;
}

function renderChatForm() {
  const box = document.getElementById('chat-form-box');
  if (!App.user) {
    box.innerHTML = `<p class="notice small"><a href="login.html?next=${encodeURIComponent('room.html?id=' + roomId)}">${esc(t('room.login_chat'))}</a></p>`;
    return;
  }
  box.innerHTML = `
    <form class="chat__form" id="chat-form">
      <input class="field" name="text" maxlength="300" autocomplete="off" placeholder="${esc(t('room.chat_placeholder'))}">
      <button class="btn btn--small" aria-label="${esc(t('room.send'))}">➤</button>
    </form>`;
  const form = box.querySelector('form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = form.text.value.trim();
    if (!text) return;
    socket.emit('chat', { text }, (res) => {
      if (res?.ok) form.text.value = '';
      else if (res?.error === 'too_fast') toast(t('room.too_fast'));
      else if (res?.error === 'banned') toast(t('room.banned'), 'error');
    });
  });
}

function showEvent(text) {
  const el = document.getElementById('event');
  if (!el) return;
  el.textContent = text;
  clearTimeout(showEvent.timer);
  showEvent.timer = setTimeout(() => { el.textContent = ''; }, 4000);
}

/* ---------- Плеєр ---------- */
function expectedTime(state) {
  // Додаємо час, що минув від відправки сервером
  return state.playing ? state.time + Math.max(0, (Date.now() - state.serverTime) / 1000) : state.time;
}

function applyState(state) {
  if (!playerReady) { pendingState = state; return; }
  applyingRemote = true;
  const current = player.getVideoData?.().video_id;
  const target = expectedTime(state);
  if (current !== state.videoId) {
    if (state.playing) player.loadVideoById(state.videoId, target);
    else player.cueVideoById(state.videoId, target);
  } else {
    if (Math.abs(player.getCurrentTime() - target) > 1.5) player.seekTo(target, true);
    if (state.playing) player.playVideo(); else player.pauseVideo();
  }
  lastKnownTime = target;
  setTimeout(() => { applyingRemote = false; }, 900);
}

function canControl() {
  return !!App.user && !App.user.banned && (!hostOnly || canModerate);
}

function onPlayerState(e) {
  if (applyingRemote) return;
  const YTS = YT.PlayerState;
  const time = player.getCurrentTime();
  if (!canControl()) {
    // Глядач без прав: повертаємо до спільного стану
    if (e.data === YTS.PLAYING || e.data === YTS.PAUSED) {
      showEvent(App.user ? t('room.no_control') : t('room.login_chat'));
      socket.emit('request-sync', applyState);
    }
    return;
  }
  if (e.data === YTS.PLAYING) socket.emit('control', { action: 'play', time });
  else if (e.data === YTS.PAUSED) socket.emit('control', { action: 'pause', time });
  lastKnownTime = time;
}

// Перемотку YouTube не повідомляє окремою подією — ловимо стрибки часу
setInterval(() => {
  if (!playerReady || applyingRemote) return;
  const time = player.getCurrentTime();
  const playing = player.getPlayerState() === YT.PlayerState.PLAYING;
  const expected = lastKnownTime + (playing ? 1 : 0);
  if (Math.abs(time - expected) > 2.5 && canControl()) {
    socket.emit('control', { action: 'seek', time });
    if (playing) socket.emit('control', { action: 'play', time });
  }
  lastKnownTime = time;
}, 1000);

// Раз на 15 секунд звіряємося з сервером (на випадок розсинхрону)
setInterval(() => {
  if (playerReady && socket.connected && !applyingRemote) {
    socket.emit('request-sync', (state) => {
      if (!state) return;
      const drift = Math.abs(player.getCurrentTime() - expectedTime(state));
      const playing = player.getPlayerState() === YT.PlayerState.PLAYING;
      if (drift > 3 || playing !== state.playing) applyState(state);
    });
  }
}, 15000);

function createPlayer(state) {
  const make = () => {
    player = new YT.Player('player', {
      videoId: state.videoId,
      host: 'https://www.youtube-nocookie.com',
      playerVars: { start: Math.floor(expectedTime(state)), rel: 0, modestbranding: 1, playsinline: 1 },
      events: {
        onReady: () => {
          playerReady = true;
          applyState(pendingState || state);
          pendingState = null;
        },
        onStateChange: onPlayerState,
      },
    });
  };
  if (window.YT?.Player) make();
  else {
    window.onYouTubeIframeAPIReady = make;
    const s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    document.head.append(s);
  }
}

/* ---------- Сокет ---------- */
socket.on('connect', () => {
  socket.emit('join', { roomId }, (res) => {
    if (res.error) return fatal(t(res.error === 'kicked' ? 'room.kicked' : 'room.not_found'));
    const first = !document.getElementById('player');
    me = res.me;
    canModerate = res.canModerate;
    ownerId = res.room.ownerId;
    hostOnly = res.state.hostOnly;
    if (first) {
      renderShell(res.room);
      renderChatForm();
      bindRoomUi();
      createPlayer(res.state);
    } else {
      applyState(res.state);
      document.getElementById('chat').innerHTML = '';
    }
    document.getElementById('owner-tools').hidden = !canModerate;
    document.getElementById('host-only').checked = hostOnly;
    renderUsers(res.users);
    addMessages(res.messages);
  });
});

socket.on('sync', (state) => {
  hostOnly = state.hostOnly;
  applyState(state);
  const key = { play: 'room.event_play', pause: 'room.event_pause', seek: 'room.event_seek', video: 'room.event_video' }[state.action];
  if (key && state.by) showEvent(t(key, { name: state.by }));
});
socket.on('users', renderUsers);
socket.on('chat', (m) => addMessages([m]));
socket.on('message-deleted', ({ id }) => document.querySelector(`[data-msg="${CSS.escape(id)}"]`)?.remove());
socket.on('settings', (s) => {
  hostOnly = s.hostOnly;
  const box = document.getElementById('host-only');
  if (box) box.checked = hostOnly;
});
socket.on('kicked', () => fatal(t('room.kicked')));
socket.on('room-closed', () => fatal(t('room.closed')));
socket.on('banned', () => { toast(t('room.banned'), 'error'); if (App.user) App.user.banned = true; });

function bindRoomUi() {
  document.getElementById('share').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(location.href); toast(t('room.copied'), 'success'); } catch { toast(location.href); }
  });
  document.getElementById('resync').addEventListener('click', () => socket.emit('request-sync', applyState));
  document.getElementById('host-only').addEventListener('change', (e) => socket.emit('settings', { hostOnly: e.target.checked }));
  document.getElementById('video-form').addEventListener('submit', (e) => {
    e.preventDefault();
    socket.emit('change-video', { url: e.target.url.value }, (res) => {
      if (res?.ok) e.target.url.value = '';
      else toast(`⚠ ${t('rooms.url')}`, 'error');
    });
  });
  document.getElementById('close-room').addEventListener('click', async () => {
    try { await api('/rooms/' + encodeURIComponent(roomId), { method: 'DELETE' }); location.href = 'rooms.html'; } catch (err) { toast(err.message, 'error'); }
  });
  document.getElementById('report-room').addEventListener('click', () => openReport('room', roomId));

  $page.addEventListener('click', (e) => {
    const kick = e.target.closest('[data-kick]');
    if (kick) socket.emit('kick', { userId: kick.dataset.kick });
    const del = e.target.closest('[data-del-msg]');
    if (del) socket.emit('delete-message', { id: del.dataset.delMsg });
    const rep = e.target.closest('[data-report-msg]');
    if (rep) openReport('message', rep.dataset.reportMsg);
  });
}

App.ready.then(() => {
  if (!roomId) return fatal(t('room.not_found'));
  socket.connect();
});
