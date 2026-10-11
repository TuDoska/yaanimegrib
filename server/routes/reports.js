const express = require('express');
const { db } = require('../db');
const { requireAuth, requireNotBanned } = require('../auth');
const { ah, cleanText } = require('../utils');

const router = express.Router();
const TYPES = ['review', 'message', 'user', 'room'];
const REASONS = ['spam', 'insult', 'spoiler', 'nsfw', 'piracy', 'other'];

// Скарга на відгук, повідомлення в чаті, користувача або кімнату
router.post('/', requireAuth, requireNotBanned, ah(async (req, res) => {
  const targetType = req.body.targetType;
  const targetId = cleanText(req.body.targetId, 64);
  const reason = REASONS.includes(req.body.reason) ? req.body.reason : 'other';
  const comment = cleanText(req.body.comment, 500);
  if (!TYPES.includes(targetType) || !targetId) return res.status(400).json({ error: 'bad_target' });

  // Знімок вмісту, щоб модератор бачив його навіть після редагування
  let snapshot = '';
  let targetUserId = null;
  let targetUsername = '';
  if (targetType === 'review') {
    const r = await db.reviews.findOne({ _id: targetId });
    if (!r) return res.status(404).json({ error: 'not_found' });
    snapshot = r.text; targetUserId = r.userId; targetUsername = r.username;
  } else if (targetType === 'message') {
    const m = await db.messages.findOne({ _id: targetId });
    if (!m) return res.status(404).json({ error: 'not_found' });
    snapshot = m.text; targetUserId = m.userId; targetUsername = m.username;
  } else if (targetType === 'user') {
    const u = await db.users.findOne({ _id: targetId });
    if (!u) return res.status(404).json({ error: 'not_found' });
    targetUserId = u._id; targetUsername = u.username;
  } else if (targetType === 'room') {
    const room = await db.rooms.findOne({ _id: targetId });
    if (!room) return res.status(404).json({ error: 'not_found' });
    snapshot = `${room.name} — youtube.com/watch?v=${room.videoId}`;
    targetUserId = room.ownerId; targetUsername = room.ownerName;
  }

  // Одна відкрита скарга від користувача на один об'єкт
  const duplicate = await db.reports.findOne({ targetType, targetId, reporterId: req.user._id, status: 'open' });
  if (duplicate) return res.json({ ok: true, duplicate: true });

  await db.reports.insert({
    targetType, targetId, targetUserId, targetUsername, reason, comment, snapshot,
    reporterId: req.user._id,
    reporterName: req.user.username,
    status: 'open',
    createdAt: new Date(),
  });
  res.status(201).json({ ok: true });
}));

module.exports = router;
