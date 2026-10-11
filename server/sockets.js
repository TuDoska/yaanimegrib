// Спільний перегляд: синхронізація YouTube-плеєра та чат через Socket.io
const { db } = require('./db');
const { userFromToken, tokenFromCookieHeader, hasRole } = require('./auth');
const { cleanText, parseYouTubeId } = require('./utils');

const CHAT_HISTORY = 60;
const CHAT_MAX = 300;
const CHAT_INTERVAL_MS = 700;

module.exports = function setupSockets(io, liveRooms) {
  // Стан кімнати в пам'яті: що грає, з якої секунди, хто всередині
  function getLive(room) {
    let live = liveRooms.get(room._id);
    if (!live) {
      live = {
        videoId: room.videoId,
        playing: false,
        time: 0,
        updatedAt: Date.now(),
        hostOnly: false,
        kicked: new Set(),
        users: new Map(), // socket.id → { id, username, role }
      };
      liveRooms.set(room._id, live);
    }
    return live;
  }

  // Поточна позиція з урахуванням часу, що минув
  const currentTime = (live) =>
    live.playing ? live.time + (Date.now() - live.updatedAt) / 1000 : live.time;

  const usersList = (live) => {
    const seen = new Map();
    for (const u of live.users.values()) seen.set(u.id, u);
    return [...seen.values()];
  };

  const stateOf = (live) => ({
    videoId: live.videoId,
    playing: live.playing,
    time: currentTime(live),
    hostOnly: live.hostOnly,
    serverTime: Date.now(),
  });

  io.use(async (socket, next) => {
    socket.user = await userFromToken(tokenFromCookieHeader(socket.request.headers.cookie));
    next();
  });

  io.on('connection', (socket) => {
    let roomId = null;
    let room = null;
    let lastChat = 0;

    if (socket.user) socket.join('user:' + socket.user._id);

    const me = () => (socket.user
      ? { id: socket.user._id, username: socket.user.username, role: socket.user.role }
      : { id: 'guest:' + socket.id, username: null, role: 'guest' });

    const isOwnerOrMod = () => !!socket.user && (room?.ownerId === socket.user._id || hasRole(socket.user, 'moderator'));

    const canControl = () => {
      const live = liveRooms.get(roomId);
      if (!live || !socket.user || socket.user.banned) return false;
      return !live.hostOnly || isOwnerOrMod();
    };

    socket.on('join', async ({ roomId: id } = {}, ack = () => {}) => {
      try {
        room = await db.rooms.findOne({ _id: String(id || '') });
        if (!room) return ack({ error: 'not_found' });
        const live = getLive(room);
        if (socket.user && live.kicked.has(socket.user._id)) return ack({ error: 'kicked' });

        roomId = room._id;
        socket.join(roomId);
        live.users.set(socket.id, me());

        const history = await db.messages.find({ roomId, deleted: { $ne: true } }, { sort: { createdAt: -1 }, limit: CHAT_HISTORY });
        ack({
          room: { id: room._id, name: room.name, ownerId: room.ownerId, ownerName: room.ownerName, animeId: room.animeId || null },
          state: stateOf(live),
          users: usersList(live),
          messages: history.reverse().map(toMessage),
          me: me(),
          canModerate: isOwnerOrMod(),
        });
        io.to(roomId).emit('users', usersList(live));
        db.rooms.update({ _id: roomId }, { lastActive: new Date() });
      } catch (error) {
        console.error(error);
        ack({ error: 'server' });
      }
    });

    // play / pause / seek
    socket.on('control', ({ action, time } = {}) => {
      const live = liveRooms.get(roomId);
      if (!live || !canControl()) return;
      const t = Math.max(0, Math.min(Number(time) || 0, 60 * 60 * 24));
      if (action === 'play') live.playing = true;
      else if (action === 'pause') live.playing = false;
      else if (action !== 'seek') return;
      live.time = t;
      live.updatedAt = Date.now();
      socket.to(roomId).emit('sync', { ...stateOf(live), action, by: socket.user.username });
    });

    // Новий учасник просить актуальний стан
    socket.on('request-sync', (ack = () => {}) => {
      const live = liveRooms.get(roomId);
      if (live) ack(stateOf(live));
    });

    socket.on('change-video', async ({ url } = {}, ack = () => {}) => {
      const live = liveRooms.get(roomId);
      const videoId = parseYouTubeId(url);
      if (!live || !isOwnerOrMod()) return ack({ error: 'forbidden' });
      if (!videoId) return ack({ error: 'bad_video' });
      Object.assign(live, { videoId, playing: false, time: 0, updatedAt: Date.now() });
      await db.rooms.update({ _id: roomId }, { videoId, lastActive: new Date() });
      io.to(roomId).emit('sync', { ...stateOf(live), action: 'video', by: socket.user.username });
      ack({ ok: true });
    });

    socket.on('settings', ({ hostOnly } = {}) => {
      const live = liveRooms.get(roomId);
      if (!live || !isOwnerOrMod()) return;
      live.hostOnly = !!hostOnly;
      io.to(roomId).emit('settings', { hostOnly: live.hostOnly });
    });

    socket.on('chat', async ({ text } = {}, ack = () => {}) => {
      if (!roomId) return ack({ error: 'not_joined' });
      if (!socket.user) return ack({ error: 'auth_required' });
      if (socket.user.banned) return ack({ error: 'banned' });
      const clean = cleanText(text, CHAT_MAX);
      if (!clean) return ack({ error: 'empty' });
      if (Date.now() - lastChat < CHAT_INTERVAL_MS) return ack({ error: 'too_fast' });
      lastChat = Date.now();

      const msg = await db.messages.insert({
        roomId,
        userId: socket.user._id,
        username: socket.user.username,
        role: socket.user.role,
        text: clean,
        deleted: false,
        createdAt: new Date(),
      });
      io.to(roomId).emit('chat', toMessage(msg));
      ack({ ok: true });
    });

    socket.on('delete-message', async ({ id } = {}) => {
      if (!isOwnerOrMod()) return;
      const msg = await db.messages.findOne({ _id: String(id || ''), roomId });
      if (!msg) return;
      await db.messages.update({ _id: msg._id }, { deleted: true });
      io.to(roomId).emit('message-deleted', { id: msg._id });
    });

    socket.on('kick', ({ userId } = {}) => {
      const live = liveRooms.get(roomId);
      if (!live || !isOwnerOrMod() || !userId || userId === socket.user._id || userId === room.ownerId) return;
      live.kicked.add(userId);
      for (const [sid, u] of live.users) {
        if (u.id === userId) {
          const target = io.sockets.sockets.get(sid);
          target?.emit('kicked');
          target?.leave(roomId);
          live.users.delete(sid);
        }
      }
      io.to(roomId).emit('users', usersList(live));
    });

    socket.on('disconnect', () => {
      const live = liveRooms.get(roomId);
      if (!live) return;
      live.users.delete(socket.id);
      if (live.users.size === 0) {
        // Порожня кімната: ставимо на паузу і через годину звільняємо пам'ять
        live.time = currentTime(live);
        live.playing = false;
        live.updatedAt = Date.now();
        setTimeout(() => {
          if (liveRooms.get(roomId)?.users.size === 0) liveRooms.delete(roomId);
        }, 60 * 60 * 1000).unref();
      }
      io.to(roomId).emit('users', usersList(live));
    });
  });
};

function toMessage(m) {
  return { id: m._id, userId: m.userId, username: m.username, role: m.role, text: m.text, createdAt: m.createdAt };
}
