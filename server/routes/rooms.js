const express = require('express');
const { db } = require('../db');
const { requireAuth, requireNotBanned, hasRole } = require('../auth');
const { ah, cleanText, parseYouTubeId, roomCode } = require('../utils');

module.exports = function roomsRouter(io, liveRooms) {
  const router = express.Router();

  const toClient = (r) => ({
    id: r._id,
    name: r.name,
    videoId: r.videoId,
    animeId: r.animeId || null,
    ownerId: r.ownerId,
    ownerName: r.ownerName,
    isPublic: r.isPublic,
    createdAt: r.createdAt,
    online: liveRooms.get(r._id)?.users.size || 0,
  });

  // Публічні кімнати: спершу ті, де зараз є люди
  router.get('/', ah(async (req, res) => {
    const rooms = await db.rooms.find({ isPublic: true }, { sort: { lastActive: -1 }, limit: 50 });
    const items = rooms.map(toClient).sort((a, b) => b.online - a.online);
    res.json({ items });
  }));

  router.get('/mine', requireAuth, ah(async (req, res) => {
    const rooms = await db.rooms.find({ ownerId: req.user._id }, { sort: { createdAt: -1 }, limit: 20 });
    res.json({ items: rooms.map(toClient) });
  }));

  router.get('/:id', ah(async (req, res) => {
    const room = await db.rooms.findOne({ _id: req.params.id });
    if (!room) return res.status(404).json({ error: 'not_found' });
    res.json({ room: toClient(room) });
  }));

  router.post('/', requireAuth, requireNotBanned, ah(async (req, res) => {
    const name = cleanText(req.body.name, 60);
    const videoId = parseYouTubeId(req.body.url);
    const animeId = Number(req.body.animeId) || null;
    if (name.length < 2) return res.status(400).json({ error: 'bad_name' });
    if (!videoId) return res.status(400).json({ error: 'bad_video' });

    // Не більше 5 кімнат на користувача
    if ((await db.rooms.count({ ownerId: req.user._id })) >= 5) {
      const oldest = await db.rooms.find({ ownerId: req.user._id }, { sort: { lastActive: 1 }, limit: 1 });
      if (oldest[0]) await db.rooms.remove({ _id: oldest[0]._id });
    }

    let id = roomCode();
    while (await db.rooms.findOne({ _id: id })) id = roomCode();

    const room = await db.rooms.insert({
      _id: id,
      name,
      videoId,
      animeId,
      ownerId: req.user._id,
      ownerName: req.user.username,
      isPublic: req.body.isPublic !== false,
      createdAt: new Date(),
      lastActive: new Date(),
    });
    res.status(201).json({ room: toClient(room) });
  }));

  router.delete('/:id', requireAuth, ah(async (req, res) => {
    const room = await db.rooms.findOne({ _id: req.params.id });
    if (!room) return res.status(404).json({ error: 'not_found' });
    if (room.ownerId !== req.user._id && !hasRole(req.user, 'moderator')) return res.status(403).json({ error: 'forbidden' });
    await db.rooms.remove({ _id: room._id });
    await db.messages.remove({ roomId: room._id });
    io.to(room._id).emit('room-closed');
    liveRooms.delete(room._id);
    res.json({ ok: true });
  }));

  return router;
};
