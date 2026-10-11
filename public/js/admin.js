// Панель модерації
const $root = document.getElementById('admin');
let reportStatus = 'open';

function stat(label, value, accent = false) {
  return `<div class="stat ${accent ? 'stat--accent' : ''}"><b>${fmt.num(value)}</b><span>${esc(label)}</span></div>`;
}

function shell() {
  $root.innerHTML = `
    <h1 class="page__title">🛡 ${esc(t('admin.title'))}</h1>
    <div class="stats" id="stats"></div>
    <div class="admin-grid">
      <section class="panel">
        <div class="section__head">
          <h2 class="panel__title">${esc(t('admin.reports'))}</h2>
          <div class="segmented">
            <button data-status="open" class="is-active">${esc(t('admin.status_open'))}</button>
            <button data-status="resolved">${esc(t('admin.status_resolved'))}</button>
          </div>
        </div>
        <div id="reports"></div>
      </section>
      <section class="panel">
        <h2 class="panel__title">${esc(t('admin.users'))}</h2>
        <input class="field" id="user-search" type="search" placeholder="${esc(t('admin.search_users'))}">
        <ul class="admin-users" id="users"></ul>
      </section>
    </div>`;
}

async function loadStats() {
  const s = await api('/admin/stats');
  document.getElementById('stats').innerHTML = [
    stat(t('admin.open_reports'), s.openReports, s.openReports > 0),
    stat(t('admin.users'), s.users), stat(t('admin.reviews'), s.reviews),
    stat(t('admin.rooms'), s.rooms), stat(t('admin.banned'), s.banned),
  ].join('');
}

function reportCard(r) {
  const open = r.status === 'open';
  const canHide = r.targetType === 'review' || r.targetType === 'room';
  return `
    <article class="report" data-id="${esc(r.id)}">
      <header>
        <span class="chip">${esc(t('admin.target.' + r.targetType))}</span>
        <span class="chip chip--warn">${esc(t('reason.' + r.reason))}</span>
        <span class="muted small">${esc(t('admin.from', { name: r.reporterName }))} · ${esc(t('admin.against', { name: r.targetUsername || '—' }))} · ${fmt.date(r.createdAt)}</span>
      </header>
      ${r.snapshot ? `<blockquote>${esc(r.snapshot)}</blockquote>` : ''}
      ${r.comment ? `<p class="small">💬 ${esc(r.comment)}</p>` : ''}
      ${open ? `
        <div class="report__actions">
          <button class="btn btn--small btn--ghost" data-resolve="dismiss">${esc(t('admin.dismiss'))}</button>
          ${canHide ? `<button class="btn btn--small btn--ghost" data-resolve="hide">${esc(t('admin.hide'))}</button>` : ''}
          ${r.targetType !== 'user' ? `<button class="btn btn--small btn--danger" data-resolve="delete">${esc(t('admin.delete'))}</button>` : ''}
          ${r.targetUserId ? `<button class="btn btn--small btn--danger" data-ban-user="${esc(r.targetUserId)}">${esc(t('admin.ban'))}</button>` : ''}
        </div>` : `<p class="muted small">${esc(t('admin.resolved_by', { name: r.resolvedBy || '—' }))} · ${esc(r.action || '')}</p>`}
    </article>`;
}

async function loadReports() {
  const box = document.getElementById('reports');
  box.innerHTML = skeletons(3, 'row');
  try {
    const { items } = await api('/admin/reports?status=' + reportStatus);
    box.innerHTML = items.length ? items.map(reportCard).join('') : `<p class="notice">${esc(t('admin.no_reports'))}</p>`;
  } catch (err) { errorBox(box, err.message, loadReports); }
}

function userRow(u) {
  const isAdmin = App.user.role === 'admin';
  const self = u.id === App.user.id;
  return `
    <li class="admin-user ${u.banned ? 'is-banned' : ''}">
      <span class="avatar avatar--small">${esc(u.username[0].toUpperCase())}</span>
      <div class="admin-user__info">
        <b>${esc(u.username)}</b>
        <span class="muted small">${esc(t('role.' + u.role))}${u.banned ? ' · ⛔ ' + esc(u.banReason || '') : ''}</span>
      </div>
      ${isAdmin && !self ? `
        <select class="field field--small" data-role="${esc(u.id)}">
          ${['user', 'moderator', 'admin'].map((r) => `<option value="${r}" ${r === u.role ? 'selected' : ''}>${esc(t('role.' + r))}</option>`).join('')}
        </select>` : ''}
      ${!self ? (u.banned
        ? `<button class="btn btn--small btn--ghost" data-unban="${esc(u.id)}">${esc(t('admin.unban'))}</button>`
        : `<button class="btn btn--small btn--danger" data-ban-user="${esc(u.id)}">${esc(t('admin.ban'))}</button>`) : ''}
    </li>`;
}

async function loadUsers(q = '') {
  const list = document.getElementById('users');
  try {
    const { items } = await api('/admin/users?q=' + encodeURIComponent(q));
    list.innerHTML = items.map(userRow).join('');
  } catch (err) { errorBox(list, err.message); }
}

// Бан із полем для причини (без системних prompt-вікон)
function askBan(userId) {
  const dialog = document.createElement('dialog');
  dialog.className = 'modal';
  dialog.innerHTML = `
    <form method="dialog" class="modal__body">
      <h3>${esc(t('admin.ban'))}</h3>
      <label class="label">${esc(t('admin.reason'))}<input class="field" name="reason" maxlength="200" required></label>
      <div class="modal__actions">
        <button class="btn btn--ghost" value="cancel" formnovalidate>${esc(t('common.cancel'))}</button>
        <button class="btn btn--danger" value="ok">${esc(t('admin.ban'))}</button>
      </div>
    </form>`;
  document.body.append(dialog);
  dialog.showModal();
  dialog.addEventListener('close', async () => {
    if (dialog.returnValue === 'ok') {
      try {
        await api(`/admin/users/${userId}/ban`, { method: 'POST', body: { banned: true, reason: dialog.querySelector('input').value } });
        refresh();
      } catch (err) { toast(err.message, 'error'); }
    }
    dialog.remove();
  });
}

function refresh() {
  loadStats();
  loadReports();
  loadUsers(document.getElementById('user-search').value);
}

function bind() {
  $root.addEventListener('click', async (e) => {
    const seg = e.target.closest('[data-status]');
    if (seg) {
      reportStatus = seg.dataset.status;
      $root.querySelectorAll('[data-status]').forEach((b) => b.classList.toggle('is-active', b === seg));
      return loadReports();
    }
    const resolve = e.target.closest('[data-resolve]');
    if (resolve) {
      const id = resolve.closest('[data-id]').dataset.id;
      try { await api(`/admin/reports/${id}/resolve`, { method: 'POST', body: { action: resolve.dataset.resolve } }); refresh(); } catch (err) { toast(err.message, 'error'); }
      return;
    }
    const ban = e.target.closest('[data-ban-user]');
    if (ban) return askBan(ban.dataset.banUser);
    const unban = e.target.closest('[data-unban]');
    if (unban) {
      try { await api(`/admin/users/${unban.dataset.unban}/ban`, { method: 'POST', body: { banned: false } }); refresh(); } catch (err) { toast(err.message, 'error'); }
    }
  });
  $root.addEventListener('change', async (e) => {
    const role = e.target.closest('[data-role]');
    if (!role) return;
    try { await api(`/admin/users/${role.dataset.role}/role`, { method: 'POST', body: { role: role.value } }); toast('✔', 'success'); } catch (err) { toast(err.message, 'error'); }
  });
  let typing;
  document.getElementById('user-search').addEventListener('input', (e) => {
    clearTimeout(typing);
    typing = setTimeout(() => loadUsers(e.target.value), 400);
  });
}

App.ready.then(() => {
  if (!App.user || !['moderator', 'admin'].includes(App.user.role)) {
    $root.innerHTML = `<p class="notice notice--error">${esc(t('admin.forbidden'))}</p>`;
    return;
  }
  shell();
  bind();
  refresh();
});
