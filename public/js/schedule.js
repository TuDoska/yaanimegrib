// Розклад на тиждень з таймерами
const tabs = document.getElementById('day-tabs');
const list = document.getElementById('schedule-list');

const today = new Date();
const todayIdx = (today.getDay() + 6) % 7; // 0 = понеділок
let activeDay = Number(new URLSearchParams(location.search).get('day') ?? todayIdx);
if (!(activeDay >= 0 && activeDay <= 6)) activeDay = todayIdx;

function dayRange(idx) {
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() + (idx - todayIdx));
  const from = Math.floor(start.getTime() / 1000);
  return { from, to: from + 86400, date: start };
}

function renderTabs() {
  tabs.innerHTML = Array.from({ length: 7 }, (_, i) => {
    const { date } = dayRange(i);
    return `<button class="day-tab ${i === activeDay ? 'is-active' : ''}" data-day="${i}">
      <span>${esc(i === todayIdx ? t('schedule.today') : t('day.' + i))}</span>
      <small>${date.toLocaleDateString(locale(), { day: 'numeric', month: 'short' })}</small>
    </button>`;
  }).join('');
}

function row(s) {
  remember(s.anime);
  const future = s.airingAt > Date.now() / 1000;
  return `
    <li class="sched-row ${future ? '' : 'is-aired'}">
      <time class="sched-row__time">${fmt.time(s.airingAt)}</time>
      <a class="sched-row__img" href="anime.html?id=${s.anime.id}"><img src="${esc(s.anime.cover)}" alt="" loading="lazy"></a>
      <div class="sched-row__body">
        <a href="anime.html?id=${s.anime.id}" class="sched-row__title">${esc(s.anime.title)}</a>
        <p class="muted">${esc(t('common.episode', { n: s.episode }))}${s.anime.episodes ? ` / ${s.anime.episodes}` : ''} · ${esc(fmt.format(s.anime.format))}</p>
      </div>
      <div class="sched-row__timer">
        ${future
          ? `<span class="timer">⏱ <span data-countdown="${s.airingAt}">${countdownText(s.airingAt) || ''}</span></span>`
          : `<span class="chip chip--ep">${esc(t('countdown.aired'))}</span>`}
      </div>
      <button class="fav ${App.favIds.has(s.anime.id) ? 'is-active' : ''}" data-fav="${s.anime.id}" aria-label="${esc(t('common.add_fav'))}">♥</button>
    </li>`;
}

async function load(fresh = false) {
  const { from, to } = dayRange(activeDay);
  if (!fresh) list.innerHTML = skeletons(6, 'row');
  try {
    const items = await AniList.airing(from, to, { fresh, maxPages: 4 });
    list.innerHTML = items.length ? items.map(row).join('') : `<li class="notice">${esc(t('schedule.empty'))}</li>`;
  } catch (err) {
    errorBox(list, err.message, () => load());
  }
}

tabs.addEventListener('click', (e) => {
  const tab = e.target.closest('[data-day]');
  if (!tab) return;
  activeDay = Number(tab.dataset.day);
  history.replaceState(null, '', `schedule.html?day=${activeDay}`);
  renderTabs();
  load();
});

// Серія вийшла — перемальовуємо рядок
list.addEventListener('countdown-done', () => setTimeout(() => load(true), 5000));

App.ready.then(() => { renderTabs(); load(); });
