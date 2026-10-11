// Переклади інтерфейсу: українська, англійська, російська
const I18N = {
  uk: {
    'nav.home': 'Головна', 'nav.catalog': 'Каталог', 'nav.schedule': 'Розклад', 'nav.rooms': 'Кімнати',
    'nav.profile': 'Профіль', 'nav.admin': 'Модерація', 'nav.login': 'Увійти', 'nav.logout': 'Вийти',
    'nav.favorites': 'Обране', 'search.placeholder': 'Пошук аніме…',

    'common.loading': 'Завантаження…', 'common.error': 'Щось пішло не так', 'common.retry': 'Спробувати ще раз',
    'common.more': 'Показати ще', 'common.all': 'Усі', 'common.see_all': 'Дивитися всі →', 'common.nothing': 'Тут поки порожньо',
    'common.ep': 'еп.', 'common.episode': 'Серія {n}', 'common.add_fav': 'В обране', 'common.in_fav': 'В обраному',
    'common.details': 'Детальніше', 'common.cancel': 'Скасувати', 'common.save': 'Зберегти', 'common.delete': 'Видалити',
    'common.report': 'Поскаржитися', 'common.reported': 'Скаргу надіслано', 'common.network': 'Немає з\'єднання з сервером',
    'common.ago_h': '{n} год тому', 'common.ago_m': '{n} хв тому', 'common.now': 'щойно', 'common.new': 'NEW',

    'countdown.d': 'д', 'countdown.in': 'через', 'countdown.aired': 'вже вийшла',

    'format.TV': 'ТБ-серіал', 'format.TV_SHORT': 'Короткий', 'format.MOVIE': 'Фільм', 'format.SPECIAL': 'Спешл',
    'format.OVA': 'OVA', 'format.ONA': 'ONA', 'format.MUSIC': 'Кліп',
    'status.RELEASING': 'Виходить', 'status.FINISHED': 'Завершено', 'status.NOT_YET_RELEASED': 'Анонс',
    'status.CANCELLED': 'Скасовано', 'status.HIATUS': 'Перерва',
    'season.WINTER': 'Зима', 'season.SPRING': 'Весна', 'season.SUMMER': 'Літо', 'season.FALL': 'Осінь',
    'day.0': 'Пн', 'day.1': 'Вт', 'day.2': 'Ср', 'day.3': 'Чт', 'day.4': 'Пт', 'day.5': 'Сб', 'day.6': 'Нд',
    'dayfull.0': 'Понеділок', 'dayfull.1': 'Вівторок', 'dayfull.2': 'Середа', 'dayfull.3': 'Четвер',
    'dayfull.4': 'П\'ятниця', 'dayfull.5': 'Субота', 'dayfull.6': 'Неділя',

    'home.hero_label': '🔥 У тренді зараз', 'home.next_ep': 'Серія {n} через',
    'home.new_eps': 'Нові серії за добу', 'home.soon': 'Скоро вийдуть', 'home.season': 'Аніме сезону',
    'home.rooms': 'Дивляться разом', 'home.rooms_cta': 'Створити кімнату',
    'home.rooms_empty': 'Зараз відкритих кімнат немає. Створи першу й поклич друзів!',

    'catalog.title': 'Каталог аніме', 'catalog.search': 'Назва аніме…', 'catalog.genre_all': 'Усі жанри',
    'catalog.type_all': 'Усі типи', 'catalog.status_all': 'Будь-який статус', 'catalog.sort_popularity': 'За популярністю',
    'catalog.sort_score': 'За рейтингом', 'catalog.sort_trending': 'У тренді', 'catalog.sort_new': 'Спочатку нові',
    'catalog.reset': 'Скинути', 'catalog.found': 'Знайдено: {n}', 'catalog.nothing': 'Нічого не знайдено. Спробуй змінити фільтри.',
    'catalog.ongoing': 'Онгоінги', 'catalog.top': 'Топ за рейтингом',

    'schedule.title': 'Розклад виходу серій', 'schedule.subtitle': 'Час показано у твоєму часовому поясі. Таймери оновлюються самі.',
    'schedule.today': 'Сьогодні', 'schedule.empty': 'Цього дня нових серій немає.',

    'anime.next_ep': 'Серія {n} вийде через', 'anime.finished': 'Усі серії вже вийшли',
    'anime.not_yet': 'Дата виходу ще невідома', 'anime.where': 'Де дивитися легально',
    'anime.where_note': 'Офіційні платформи, які мають права на показ. Доступність залежить від країни.',
    'anime.where_none': 'Офіційних платформ для цього аніме поки не знайдено.',
    'anime.trailer': 'Трейлер', 'anime.no_trailer': 'Офіційного трейлера немає', 'anime.watch_together': '🍿 Дивитися трейлер разом',
    'anime.episodes': 'Серії', 'anime.episodes_note': 'Список оновлюється автоматично, щойно виходить нова серія.',
    'anime.ep_soon': 'скоро', 'anime.ep_unknown_date': 'дата невідома',
    'anime.recommendations': 'Схожі аніме', 'anime.description': 'Опис', 'anime.desc_lang': 'Опис доступний англійською',
    'anime.info.format': 'Тип', 'anime.info.episodes': 'Серій', 'anime.info.status': 'Статус', 'anime.info.aired': 'Вихід',
    'anime.info.season': 'Сезон', 'anime.info.studio': 'Студія', 'anime.info.duration': 'Тривалість', 'anime.info.min': '{n} хв',
    'anime.info.rank': 'Місце в рейтингу', 'anime.site_score': 'Оцінка глядачів YaAnimeGrib', 'anime.no_id': 'Аніме не вибране.',
    'anime.not_found': 'Такого аніме не знайдено.',

    'reviews.title': 'Відгуки', 'reviews.yours': 'Твій відгук', 'reviews.rating': 'Оцінка',
    'reviews.placeholder': 'Що скажеш про це аніме? Без спойлерів 🙂', 'reviews.submit': 'Опублікувати',
    'reviews.update': 'Оновити відгук', 'reviews.login': 'Увійди, щоб залишити відгук.', 'reviews.empty': 'Відгуків ще немає. Будь першим!',
    'reviews.hidden': 'Приховано модератором', 'reviews.count': '{n} відгуків', 'reviews.saved': 'Відгук збережено',

    'rooms.title': 'Кімнати спільного перегляду',
    'rooms.subtitle': 'Дивіться YouTube-відео синхронно з друзями: пауза й перемотка в усіх одночасно, плюс чат.',
    'rooms.create': 'Нова кімната', 'rooms.name': 'Назва кімнати', 'rooms.url': 'Посилання на YouTube-відео',
    'rooms.url_hint': 'Лише легальні відео: офіційні трейлери та канали правовласників.',
    'rooms.public': 'Показувати у списку кімнат', 'rooms.create_btn': 'Створити і відкрити',
    'rooms.empty': 'Публічних кімнат поки немає.', 'rooms.online': '{n} онлайн', 'rooms.open': 'Увійти',
    'rooms.login': 'Увійди, щоб створити кімнату.', 'rooms.mine': 'Мої кімнати', 'rooms.by': 'від {name}',

    'room.share': 'Скопіювати посилання', 'room.copied': 'Посилання скопійовано!', 'room.chat': 'Чат',
    'room.chat_placeholder': 'Написати повідомлення…', 'room.send': 'Надіслати', 'room.login_chat': 'Увійди, щоб писати в чат.',
    'room.users': 'Глядачі', 'room.host_only': 'Керує лише власник', 'room.change_video': 'Змінити відео',
    'room.change': 'Змінити', 'room.kicked': 'Тебе вилучили з кімнати.', 'room.closed': 'Кімнату закрито.',
    'room.not_found': 'Кімнату не знайдено.', 'room.guest': 'Гість', 'room.kick': 'Вилучити', 'room.owner': 'власник',
    'room.sync': 'Синхронізувати', 'room.event_play': '{name} запустив(ла) відео', 'room.event_pause': '{name} поставив(ла) паузу',
    'room.event_seek': '{name} перемотав(ла)', 'room.event_video': '{name} змінив(ла) відео', 'room.no_control': 'Зараз керує лише власник кімнати',
    'room.too_fast': 'Не так швидко 🙂', 'room.banned': 'Твій акаунт заблоковано', 'room.close': 'Закрити кімнату',
    'room.report': 'Поскаржитися на кімнату',

    'auth.login': 'Вхід', 'auth.register': 'Реєстрація', 'auth.username': 'Ім\'я користувача', 'auth.password': 'Пароль',
    'auth.login_btn': 'Увійти', 'auth.register_btn': 'Створити акаунт',
    'auth.username_hint': '3–20 символів: латиниця, цифри, _', 'auth.password_hint': 'Щонайменше 6 символів',
    'auth.welcome': 'Вітаємо в YaAnimeGrib! 🍄',
    'auth.err.bad_username': 'Ім\'я: 3–20 символів, латиниця, цифри або _', 'auth.err.bad_password': 'Пароль має бути від 6 символів',
    'auth.err.username_taken': 'Це ім\'я вже зайняте', 'auth.err.bad_credentials': 'Неправильне ім\'я або пароль',
    'auth.err.too_many': 'Забагато спроб. Спробуй пізніше.',

    'profile.title': 'Профіль', 'profile.since': 'З нами з {date}', 'profile.role': 'Роль', 'profile.lang': 'Мова інтерфейсу',
    'profile.favorites': 'Обране', 'profile.empty_favs': 'Натискай ♥ на картках, щоб зберігати аніме.',
    'profile.guest': 'Ти не увійшов. Обране зберігається лише в цьому браузері.', 'profile.banned': 'Акаунт заблоковано: {reason}',
    'role.user': 'Глядач', 'role.moderator': 'Модератор', 'role.admin': 'Адміністратор',

    'admin.title': 'Панель модерації', 'admin.users': 'Користувачі', 'admin.reviews': 'Відгуки', 'admin.rooms': 'Кімнати',
    'admin.open_reports': 'Відкриті скарги', 'admin.banned': 'Заблоковані', 'admin.reports': 'Скарги',
    'admin.status_open': 'Нові', 'admin.status_resolved': 'Розглянуті', 'admin.dismiss': 'Відхилити', 'admin.hide': 'Приховати',
    'admin.delete': 'Видалити', 'admin.ban': 'Заблокувати', 'admin.unban': 'Розблокувати', 'admin.reason': 'Причина',
    'admin.search_users': 'Пошук за іменем…', 'admin.no_reports': 'Скарг немає 🎉', 'admin.from': 'від {name}',
    'admin.against': 'на {name}', 'admin.target.review': 'Відгук', 'admin.target.message': 'Повідомлення в чаті',
    'admin.target.user': 'Користувач', 'admin.target.room': 'Кімната', 'admin.resolved_by': 'Розглянув: {name}',
    'admin.forbidden': 'Сторінка доступна лише модераторам.',

    'reason.spam': 'Спам', 'reason.insult': 'Образи', 'reason.spoiler': 'Спойлери', 'reason.nsfw': '18+',
    'reason.piracy': 'Піратський контент', 'reason.other': 'Інше', 'report.choose': 'Причина скарги',

    'footer.about': 'Розклад серій, таймери, відгуки та спільний перегляд легальних відео.',
    'footer.legal': 'YaAnimeGrib не зберігає й не розповсюджує серії. Дані — AniList, відео — офіційні YouTube-канали.',
    'notfound.title': 'Сторінку не знайдено', 'notfound.text': 'Здається, цей гриб уже хтось зірвав.', 'notfound.home': 'На головну',
  },

  en: {
    'nav.home': 'Home', 'nav.catalog': 'Catalog', 'nav.schedule': 'Schedule', 'nav.rooms': 'Rooms',
    'nav.profile': 'Profile', 'nav.admin': 'Moderation', 'nav.login': 'Log in', 'nav.logout': 'Log out',
    'nav.favorites': 'Favorites', 'search.placeholder': 'Search anime…',

    'common.loading': 'Loading…', 'common.error': 'Something went wrong', 'common.retry': 'Try again',
    'common.more': 'Show more', 'common.all': 'All', 'common.see_all': 'See all →', 'common.nothing': 'Nothing here yet',
    'common.ep': 'ep.', 'common.episode': 'Episode {n}', 'common.add_fav': 'Add to favorites', 'common.in_fav': 'In favorites',
    'common.details': 'Details', 'common.cancel': 'Cancel', 'common.save': 'Save', 'common.delete': 'Delete',
    'common.report': 'Report', 'common.reported': 'Report sent', 'common.network': 'Can\'t reach the server',
    'common.ago_h': '{n} h ago', 'common.ago_m': '{n} min ago', 'common.now': 'just now', 'common.new': 'NEW',

    'countdown.d': 'd', 'countdown.in': 'in', 'countdown.aired': 'already aired',

    'format.TV': 'TV series', 'format.TV_SHORT': 'TV short', 'format.MOVIE': 'Movie', 'format.SPECIAL': 'Special',
    'format.OVA': 'OVA', 'format.ONA': 'ONA', 'format.MUSIC': 'Music',
    'status.RELEASING': 'Airing', 'status.FINISHED': 'Finished', 'status.NOT_YET_RELEASED': 'Upcoming',
    'status.CANCELLED': 'Cancelled', 'status.HIATUS': 'On hiatus',
    'season.WINTER': 'Winter', 'season.SPRING': 'Spring', 'season.SUMMER': 'Summer', 'season.FALL': 'Fall',
    'day.0': 'Mon', 'day.1': 'Tue', 'day.2': 'Wed', 'day.3': 'Thu', 'day.4': 'Fri', 'day.5': 'Sat', 'day.6': 'Sun',
    'dayfull.0': 'Monday', 'dayfull.1': 'Tuesday', 'dayfull.2': 'Wednesday', 'dayfull.3': 'Thursday',
    'dayfull.4': 'Friday', 'dayfull.5': 'Saturday', 'dayfull.6': 'Sunday',

    'home.hero_label': '🔥 Trending now', 'home.next_ep': 'Episode {n} in',
    'home.new_eps': 'New episodes (24 h)', 'home.soon': 'Coming soon', 'home.season': 'This season',
    'home.rooms': 'Watching together', 'home.rooms_cta': 'Create a room',
    'home.rooms_empty': 'No open rooms right now. Create the first one and invite friends!',

    'catalog.title': 'Anime catalog', 'catalog.search': 'Anime title…', 'catalog.genre_all': 'All genres',
    'catalog.type_all': 'All types', 'catalog.status_all': 'Any status', 'catalog.sort_popularity': 'Most popular',
    'catalog.sort_score': 'Top rated', 'catalog.sort_trending': 'Trending', 'catalog.sort_new': 'Newest first',
    'catalog.reset': 'Reset', 'catalog.found': 'Found: {n}', 'catalog.nothing': 'Nothing found. Try other filters.',
    'catalog.ongoing': 'Currently airing', 'catalog.top': 'Top rated',

    'schedule.title': 'Airing schedule', 'schedule.subtitle': 'Times are shown in your time zone. Timers update live.',
    'schedule.today': 'Today', 'schedule.empty': 'No new episodes on this day.',

    'anime.next_ep': 'Episode {n} airs in', 'anime.finished': 'All episodes have aired',
    'anime.not_yet': 'Release date unknown yet', 'anime.where': 'Where to watch legally',
    'anime.where_note': 'Official platforms that hold the streaming rights. Availability depends on your country.',
    'anime.where_none': 'No official platforms found for this anime yet.',
    'anime.trailer': 'Trailer', 'anime.no_trailer': 'No official trailer', 'anime.watch_together': '🍿 Watch the trailer together',
    'anime.episodes': 'Episodes', 'anime.episodes_note': 'The list updates automatically as soon as a new episode airs.',
    'anime.ep_soon': 'soon', 'anime.ep_unknown_date': 'date unknown',
    'anime.recommendations': 'Similar anime', 'anime.description': 'Synopsis', 'anime.desc_lang': 'Synopsis is available in English',
    'anime.info.format': 'Format', 'anime.info.episodes': 'Episodes', 'anime.info.status': 'Status', 'anime.info.aired': 'Aired',
    'anime.info.season': 'Season', 'anime.info.studio': 'Studio', 'anime.info.duration': 'Duration', 'anime.info.min': '{n} min',
    'anime.info.rank': 'Rank', 'anime.site_score': 'YaAnimeGrib viewers\' score', 'anime.no_id': 'No anime selected.',
    'anime.not_found': 'Anime not found.',

    'reviews.title': 'Reviews', 'reviews.yours': 'Your review', 'reviews.rating': 'Rating',
    'reviews.placeholder': 'What do you think about this anime? No spoilers 🙂', 'reviews.submit': 'Publish',
    'reviews.update': 'Update review', 'reviews.login': 'Log in to leave a review.', 'reviews.empty': 'No reviews yet. Be the first!',
    'reviews.hidden': 'Hidden by a moderator', 'reviews.count': '{n} reviews', 'reviews.saved': 'Review saved',

    'rooms.title': 'Watch-together rooms',
    'rooms.subtitle': 'Watch YouTube videos in sync with friends: pause and seek for everyone at once, plus chat.',
    'rooms.create': 'New room', 'rooms.name': 'Room name', 'rooms.url': 'YouTube video link',
    'rooms.url_hint': 'Legal videos only: official trailers and rights holders\' channels.',
    'rooms.public': 'Show in the room list', 'rooms.create_btn': 'Create and open',
    'rooms.empty': 'No public rooms yet.', 'rooms.online': '{n} online', 'rooms.open': 'Join',
    'rooms.login': 'Log in to create a room.', 'rooms.mine': 'My rooms', 'rooms.by': 'by {name}',

    'room.share': 'Copy link', 'room.copied': 'Link copied!', 'room.chat': 'Chat',
    'room.chat_placeholder': 'Write a message…', 'room.send': 'Send', 'room.login_chat': 'Log in to chat.',
    'room.users': 'Viewers', 'room.host_only': 'Only the owner controls', 'room.change_video': 'Change video',
    'room.change': 'Change', 'room.kicked': 'You were removed from the room.', 'room.closed': 'The room was closed.',
    'room.not_found': 'Room not found.', 'room.guest': 'Guest', 'room.kick': 'Remove', 'room.owner': 'owner',
    'room.sync': 'Sync', 'room.event_play': '{name} pressed play', 'room.event_pause': '{name} paused',
    'room.event_seek': '{name} skipped', 'room.event_video': '{name} changed the video', 'room.no_control': 'Only the room owner controls playback now',
    'room.too_fast': 'Slow down 🙂', 'room.banned': 'Your account is banned', 'room.close': 'Close room',
    'room.report': 'Report room',

    'auth.login': 'Log in', 'auth.register': 'Sign up', 'auth.username': 'Username', 'auth.password': 'Password',
    'auth.login_btn': 'Log in', 'auth.register_btn': 'Create account',
    'auth.username_hint': '3–20 characters: latin letters, digits, _', 'auth.password_hint': 'At least 6 characters',
    'auth.welcome': 'Welcome to YaAnimeGrib! 🍄',
    'auth.err.bad_username': 'Username: 3–20 latin letters, digits or _', 'auth.err.bad_password': 'Password must be at least 6 characters',
    'auth.err.username_taken': 'This username is taken', 'auth.err.bad_credentials': 'Wrong username or password',
    'auth.err.too_many': 'Too many attempts. Try again later.',

    'profile.title': 'Profile', 'profile.since': 'Member since {date}', 'profile.role': 'Role', 'profile.lang': 'Interface language',
    'profile.favorites': 'Favorites', 'profile.empty_favs': 'Tap ♥ on cards to save anime.',
    'profile.guest': 'You are not logged in. Favorites are stored in this browser only.', 'profile.banned': 'Account banned: {reason}',
    'role.user': 'Viewer', 'role.moderator': 'Moderator', 'role.admin': 'Administrator',

    'admin.title': 'Moderation panel', 'admin.users': 'Users', 'admin.reviews': 'Reviews', 'admin.rooms': 'Rooms',
    'admin.open_reports': 'Open reports', 'admin.banned': 'Banned', 'admin.reports': 'Reports',
    'admin.status_open': 'New', 'admin.status_resolved': 'Resolved', 'admin.dismiss': 'Dismiss', 'admin.hide': 'Hide',
    'admin.delete': 'Delete', 'admin.ban': 'Ban', 'admin.unban': 'Unban', 'admin.reason': 'Reason',
    'admin.search_users': 'Search by username…', 'admin.no_reports': 'No reports 🎉', 'admin.from': 'from {name}',
    'admin.against': 'against {name}', 'admin.target.review': 'Review', 'admin.target.message': 'Chat message',
    'admin.target.user': 'User', 'admin.target.room': 'Room', 'admin.resolved_by': 'Resolved by: {name}',
    'admin.forbidden': 'This page is for moderators only.',

    'reason.spam': 'Spam', 'reason.insult': 'Insults', 'reason.spoiler': 'Spoilers', 'reason.nsfw': 'NSFW',
    'reason.piracy': 'Pirated content', 'reason.other': 'Other', 'report.choose': 'Report reason',

    'footer.about': 'Episode schedule, timers, reviews and watch parties for legal videos.',
    'footer.legal': 'YaAnimeGrib does not host or distribute episodes. Data by AniList, videos from official YouTube channels.',
    'notfound.title': 'Page not found', 'notfound.text': 'Looks like someone already picked this mushroom.', 'notfound.home': 'Go home',
  },

  ru: {
    'nav.home': 'Главная', 'nav.catalog': 'Каталог', 'nav.schedule': 'Расписание', 'nav.rooms': 'Комнаты',
    'nav.profile': 'Профиль', 'nav.admin': 'Модерация', 'nav.login': 'Войти', 'nav.logout': 'Выйти',
    'nav.favorites': 'Избранное', 'search.placeholder': 'Поиск аниме…',

    'common.loading': 'Загрузка…', 'common.error': 'Что-то пошло не так', 'common.retry': 'Попробовать снова',
    'common.more': 'Показать ещё', 'common.all': 'Все', 'common.see_all': 'Смотреть все →', 'common.nothing': 'Здесь пока пусто',
    'common.ep': 'эп.', 'common.episode': 'Серия {n}', 'common.add_fav': 'В избранное', 'common.in_fav': 'В избранном',
    'common.details': 'Подробнее', 'common.cancel': 'Отмена', 'common.save': 'Сохранить', 'common.delete': 'Удалить',
    'common.report': 'Пожаловаться', 'common.reported': 'Жалоба отправлена', 'common.network': 'Нет соединения с сервером',
    'common.ago_h': '{n} ч назад', 'common.ago_m': '{n} мин назад', 'common.now': 'только что', 'common.new': 'NEW',

    'countdown.d': 'д', 'countdown.in': 'через', 'countdown.aired': 'уже вышла',

    'format.TV': 'ТВ-сериал', 'format.TV_SHORT': 'Короткий', 'format.MOVIE': 'Фильм', 'format.SPECIAL': 'Спешл',
    'format.OVA': 'OVA', 'format.ONA': 'ONA', 'format.MUSIC': 'Клип',
    'status.RELEASING': 'Выходит', 'status.FINISHED': 'Завершено', 'status.NOT_YET_RELEASED': 'Анонс',
    'status.CANCELLED': 'Отменено', 'status.HIATUS': 'Перерыв',
    'season.WINTER': 'Зима', 'season.SPRING': 'Весна', 'season.SUMMER': 'Лето', 'season.FALL': 'Осень',
    'day.0': 'Пн', 'day.1': 'Вт', 'day.2': 'Ср', 'day.3': 'Чт', 'day.4': 'Пт', 'day.5': 'Сб', 'day.6': 'Вс',
    'dayfull.0': 'Понедельник', 'dayfull.1': 'Вторник', 'dayfull.2': 'Среда', 'dayfull.3': 'Четверг',
    'dayfull.4': 'Пятница', 'dayfull.5': 'Суббота', 'dayfull.6': 'Воскресенье',

    'home.hero_label': '🔥 Сейчас в тренде', 'home.next_ep': 'Серия {n} через',
    'home.new_eps': 'Новые серии за сутки', 'home.soon': 'Скоро выйдут', 'home.season': 'Аниме сезона',
    'home.rooms': 'Смотрят вместе', 'home.rooms_cta': 'Создать комнату',
    'home.rooms_empty': 'Сейчас открытых комнат нет. Создай первую и позови друзей!',

    'catalog.title': 'Каталог аниме', 'catalog.search': 'Название аниме…', 'catalog.genre_all': 'Все жанры',
    'catalog.type_all': 'Все типы', 'catalog.status_all': 'Любой статус', 'catalog.sort_popularity': 'По популярности',
    'catalog.sort_score': 'По рейтингу', 'catalog.sort_trending': 'В тренде', 'catalog.sort_new': 'Сначала новые',
    'catalog.reset': 'Сбросить', 'catalog.found': 'Найдено: {n}', 'catalog.nothing': 'Ничего не найдено. Попробуй изменить фильтры.',
    'catalog.ongoing': 'Онгоинги', 'catalog.top': 'Топ по рейтингу',

    'schedule.title': 'Расписание выхода серий', 'schedule.subtitle': 'Время указано в твоём часовом поясе. Таймеры обновляются сами.',
    'schedule.today': 'Сегодня', 'schedule.empty': 'В этот день новых серий нет.',

    'anime.next_ep': 'Серия {n} выйдет через', 'anime.finished': 'Все серии уже вышли',
    'anime.not_yet': 'Дата выхода пока неизвестна', 'anime.where': 'Где смотреть легально',
    'anime.where_note': 'Официальные платформы с правами на показ. Доступность зависит от страны.',
    'anime.where_none': 'Официальных платформ для этого аниме пока не найдено.',
    'anime.trailer': 'Трейлер', 'anime.no_trailer': 'Официального трейлера нет', 'anime.watch_together': '🍿 Смотреть трейлер вместе',
    'anime.episodes': 'Серии', 'anime.episodes_note': 'Список обновляется автоматически, как только выходит новая серия.',
    'anime.ep_soon': 'скоро', 'anime.ep_unknown_date': 'дата неизвестна',
    'anime.recommendations': 'Похожие аниме', 'anime.description': 'Описание', 'anime.desc_lang': 'Описание доступно на английском',
    'anime.info.format': 'Тип', 'anime.info.episodes': 'Серий', 'anime.info.status': 'Статус', 'anime.info.aired': 'Выход',
    'anime.info.season': 'Сезон', 'anime.info.studio': 'Студия', 'anime.info.duration': 'Длительность', 'anime.info.min': '{n} мин',
    'anime.info.rank': 'Место в рейтинге', 'anime.site_score': 'Оценка зрителей YaAnimeGrib', 'anime.no_id': 'Аниме не выбрано.',
    'anime.not_found': 'Такое аниме не найдено.',

    'reviews.title': 'Отзывы', 'reviews.yours': 'Твой отзыв', 'reviews.rating': 'Оценка',
    'reviews.placeholder': 'Что скажешь об этом аниме? Без спойлеров 🙂', 'reviews.submit': 'Опубликовать',
    'reviews.update': 'Обновить отзыв', 'reviews.login': 'Войди, чтобы оставить отзыв.', 'reviews.empty': 'Отзывов пока нет. Будь первым!',
    'reviews.hidden': 'Скрыто модератором', 'reviews.count': '{n} отзывов', 'reviews.saved': 'Отзыв сохранён',

    'rooms.title': 'Комнаты совместного просмотра',
    'rooms.subtitle': 'Смотрите YouTube-видео синхронно с друзьями: пауза и перемотка у всех одновременно, плюс чат.',
    'rooms.create': 'Новая комната', 'rooms.name': 'Название комнаты', 'rooms.url': 'Ссылка на YouTube-видео',
    'rooms.url_hint': 'Только легальные видео: официальные трейлеры и каналы правообладателей.',
    'rooms.public': 'Показывать в списке комнат', 'rooms.create_btn': 'Создать и открыть',
    'rooms.empty': 'Публичных комнат пока нет.', 'rooms.online': '{n} онлайн', 'rooms.open': 'Войти',
    'rooms.login': 'Войди, чтобы создать комнату.', 'rooms.mine': 'Мои комнаты', 'rooms.by': 'от {name}',

    'room.share': 'Скопировать ссылку', 'room.copied': 'Ссылка скопирована!', 'room.chat': 'Чат',
    'room.chat_placeholder': 'Написать сообщение…', 'room.send': 'Отправить', 'room.login_chat': 'Войди, чтобы писать в чат.',
    'room.users': 'Зрители', 'room.host_only': 'Управляет только владелец', 'room.change_video': 'Сменить видео',
    'room.change': 'Сменить', 'room.kicked': 'Тебя удалили из комнаты.', 'room.closed': 'Комната закрыта.',
    'room.not_found': 'Комната не найдена.', 'room.guest': 'Гость', 'room.kick': 'Удалить', 'room.owner': 'владелец',
    'room.sync': 'Синхронизировать', 'room.event_play': '{name} запустил(а) видео', 'room.event_pause': '{name} поставил(а) паузу',
    'room.event_seek': '{name} перемотал(а)', 'room.event_video': '{name} сменил(а) видео', 'room.no_control': 'Сейчас управляет только владелец комнаты',
    'room.too_fast': 'Не так быстро 🙂', 'room.banned': 'Твой аккаунт заблокирован', 'room.close': 'Закрыть комнату',
    'room.report': 'Пожаловаться на комнату',

    'auth.login': 'Вход', 'auth.register': 'Регистрация', 'auth.username': 'Имя пользователя', 'auth.password': 'Пароль',
    'auth.login_btn': 'Войти', 'auth.register_btn': 'Создать аккаунт',
    'auth.username_hint': '3–20 символов: латиница, цифры, _', 'auth.password_hint': 'Минимум 6 символов',
    'auth.welcome': 'Добро пожаловать в YaAnimeGrib! 🍄',
    'auth.err.bad_username': 'Имя: 3–20 символов, латиница, цифры или _', 'auth.err.bad_password': 'Пароль должен быть от 6 символов',
    'auth.err.username_taken': 'Это имя уже занято', 'auth.err.bad_credentials': 'Неверное имя или пароль',
    'auth.err.too_many': 'Слишком много попыток. Попробуй позже.',

    'profile.title': 'Профиль', 'profile.since': 'С нами с {date}', 'profile.role': 'Роль', 'profile.lang': 'Язык интерфейса',
    'profile.favorites': 'Избранное', 'profile.empty_favs': 'Нажимай ♥ на карточках, чтобы сохранять аниме.',
    'profile.guest': 'Ты не вошёл. Избранное хранится только в этом браузере.', 'profile.banned': 'Аккаунт заблокирован: {reason}',
    'role.user': 'Зритель', 'role.moderator': 'Модератор', 'role.admin': 'Администратор',

    'admin.title': 'Панель модерации', 'admin.users': 'Пользователи', 'admin.reviews': 'Отзывы', 'admin.rooms': 'Комнаты',
    'admin.open_reports': 'Открытые жалобы', 'admin.banned': 'Заблокированы', 'admin.reports': 'Жалобы',
    'admin.status_open': 'Новые', 'admin.status_resolved': 'Рассмотренные', 'admin.dismiss': 'Отклонить', 'admin.hide': 'Скрыть',
    'admin.delete': 'Удалить', 'admin.ban': 'Заблокировать', 'admin.unban': 'Разблокировать', 'admin.reason': 'Причина',
    'admin.search_users': 'Поиск по имени…', 'admin.no_reports': 'Жалоб нет 🎉', 'admin.from': 'от {name}',
    'admin.against': 'на {name}', 'admin.target.review': 'Отзыв', 'admin.target.message': 'Сообщение в чате',
    'admin.target.user': 'Пользователь', 'admin.target.room': 'Комната', 'admin.resolved_by': 'Рассмотрел: {name}',
    'admin.forbidden': 'Страница доступна только модераторам.',

    'reason.spam': 'Спам', 'reason.insult': 'Оскорбления', 'reason.spoiler': 'Спойлеры', 'reason.nsfw': '18+',
    'reason.piracy': 'Пиратский контент', 'reason.other': 'Другое', 'report.choose': 'Причина жалобы',

    'footer.about': 'Расписание серий, таймеры, отзывы и совместный просмотр легальных видео.',
    'footer.legal': 'YaAnimeGrib не хранит и не распространяет серии. Данные — AniList, видео — официальные YouTube-каналы.',
    'notfound.title': 'Страница не найдена', 'notfound.text': 'Кажется, этот гриб уже кто-то сорвал.', 'notfound.home': 'На главную',
  },
};

const LANGS = [
  { code: 'uk', label: 'UA' },
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
];
const LOCALES = { uk: 'uk-UA', en: 'en-GB', ru: 'ru-RU' };

function detectLang() {
  try {
    const saved = localStorage.getItem('yag-lang');
    if (I18N[saved]) return saved;
  } catch { /* ignore */ }
  const nav = (navigator.language || 'uk').slice(0, 2);
  return I18N[nav] ? nav : 'uk';
}

let currentLang = detectLang();
document.documentElement.lang = currentLang;

function t(key, params = {}) {
  const text = I18N[currentLang][key] ?? I18N.uk[key] ?? key;
  return text.replace(/\{(\w+)\}/g, (_, name) => (params[name] ?? ''));
}

const locale = () => LOCALES[currentLang];

// Переклад статичних елементів з атрибутами data-i18n*
function applyI18n(root = document) {
  root.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  root.querySelectorAll('[data-i18n-placeholder]').forEach((el) => { el.placeholder = t(el.dataset.i18nPlaceholder); });
  root.querySelectorAll('[data-i18n-title]').forEach((el) => { el.title = t(el.dataset.i18nTitle); });
  root.querySelectorAll('[data-i18n-aria]').forEach((el) => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
}

function setLang(lang) {
  if (!I18N[lang]) return;
  currentLang = lang;
  try { localStorage.setItem('yag-lang', lang); } catch { /* ignore */ }
  document.documentElement.lang = lang;
  applyI18n();
  document.dispatchEvent(new CustomEvent('langchange', { detail: lang }));
}
