// Вхід і реєстрація
const next = new URLSearchParams(location.search).get('next') || './';
const safeNext = /^[\w./?=&%-]*$/.test(next) && !next.startsWith('//') ? next : './';
const tabs = document.querySelectorAll('[data-tab]');
const form = document.getElementById('auth-form');
const errorEl = document.getElementById('auth-error');
let mode = location.hash === '#register' ? 'register' : 'login';

function setMode(m) {
  mode = m;
  tabs.forEach((tab) => tab.classList.toggle('is-active', tab.dataset.tab === m));
  form.querySelector('button').textContent = t(m === 'login' ? 'auth.login_btn' : 'auth.register_btn');
  form.password.autocomplete = m === 'login' ? 'current-password' : 'new-password';
  document.querySelectorAll('.hint').forEach((h) => { h.hidden = m === 'login'; });
  errorEl.textContent = '';
}

tabs.forEach((tab) => tab.addEventListener('click', () => setMode(tab.dataset.tab)));

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorEl.textContent = '';
  const btn = form.querySelector('button');
  btn.disabled = true;
  try {
    await api('/auth/' + mode, {
      method: 'POST',
      body: { username: form.username.value.trim(), password: form.password.value, lang: currentLang },
    });
    if (mode === 'register') toast(t('auth.welcome'), 'success');
    location.href = safeNext;
  } catch (err) {
    const key = 'auth.err.' + err.code;
    errorEl.textContent = t(key) !== key ? t(key) : err.message;
    btn.disabled = false;
  }
});

App.ready.then(() => {
  if (App.user) location.href = safeNext;
  setMode(mode);
});
