// Панель модерації (модератор і адмін)
const express = require('express');
const { db } = require('../db');
const { requireRole, hasRole, ROLES, publicUser } = require('../auth');
const { ah, cleanText } = require('../utils');

module.exports = function adminRouter(io) {
  const router = express.Router();
  router.use(requireRole('moderator'));

  router.get('/stats', ah(async (req, res) => {
    const [users, reviews, rooms, openReports, banned] = await Promise.all([
      db.users.count({}), db.reviews.count({}), db.rooms.count({}),
      db.reports.count({ status: 'open' }), db.users.count({ banned: true }),
    ]);
    res.json({ users, reviews, rooms, openReports, banned });
  }));

  router.get('/reports', ah(async (req, res) => {
    const status = req.query.status === 'resolved' ? 'resolved' : 'open';
    const items = await db.reports.find({ status }, { sort: { createdAt: -1 }, limit: 100 });
    res.json({ items: items.map(({ _id, ...r }) => ({ id: _id, ...r })) });
  }));

  // Рішення по скарзі: dismiss | hide | delete (+ ban опційно)
  router.post('/reports/:id/resolve', ah(async (req, res) => {
    const report = await db.reports.findOne({ _id: req.params.id });
    if (!report) return res.status(404).json({ error: 'not_found' });
    const action = ['dismiss', 'hide', 'delete'].includes(req.body.action) ? req.body.action : 'dismiss';

    if (action !== 'dismiss') {
      if (report.targetType === 'review') {
        if (action === 'hide') await db.reviews.update({ _id: report.targetId }, { hidden: true });
        else await db.reviews.remove({ _id: report.targetId });
      } else if (report.targetType === 'message') {
        await db.messages.update({ _id: report.targetId }, { deleted: true });
        const msg = await db.messages.findOne({ _id: report.targetId });
        if (msg) io.to(msg.roomId).emit('message-deleted', { id: msg._id });
      } else if (report.targetType === 'room') {
        if (action === 'delete') {
          await db.rooms.remove({ _id: report.targetId });
          io.to(report.targetId).emit('room-closed');
        } else {
          await db.rooms.update({ _id: report.targetId }, { isPublic: false });
        }
      }
    }

    // Закриваємо всі відкриті скарги на цей самий об'єкт
    await db.reports.update(
      { targetType: report.targetType, targetId: report.targetId, status: 'open' },
      { status: 'resolved', action, resolvedBy: req.user.username, resolvedAt: new Date() },
      { multi: true },
    );
    res.json({ ok: true });
  }));

  router.post('/reviews/:id/hide', ah(async (req, res) => {
    await db.reviews.update({ _id: req.params.id }, { hidden: !!req.body.hidden });
    res.json({ ok: true });
  }));

  router.get('/users', ah(async (req, res) => {
    const q = cleanText(req.query.q, 20).toLowerCase();
    const query = req.query.banned === '1' ? { banned: true } : {};
    let users = await db.users.find(query, { sort: { createdAt: -1 }, limit: q ? 2000 : 100 });
    if (q) users = users.filter((u) => u.usernameLower.includes(q)).slice(0, 100);
    res.json({ items: users.map(publicUser) });
  }));

  router.post('/users/:id/ban', ah(async (req, res) => {
    const target = await db.users.findOne({ _id: req.params.id });
    if (!target) return res.status(404).json({ error: 'not_found' });
    // Модератор не може банити модераторів і адмінів
    if (target._id === req.user._id || (hasRole(target, 'moderator') && !hasRole(req.user, 'admin'))) {
      return res.status(403).json({ error: 'forbidden' });
    }
    const banned = req.body.banned !== false;
    await db.users.update({ _id: target._id }, {
      banned,
      banReason: banned ? cleanText(req.body.reason, 200) : '',
      bannedBy: banned ? req.user.username : '',
    });
    if (banned) io.to('user:' + target._id).emit('banned', { reason: cleanText(req.body.reason, 200) });
    res.json({ ok: true });
  }));

  router.post('/users/:id/role', requireRole('admin'), ah(async (req, res) => {
    const role = req.body.role;
    if (!ROLES.includes(role) || req.params.id === req.user._id) return res.status(400).json({ error: 'bad_role' });
    await db.users.update({ _id: req.params.id }, { role });
    res.json({ ok: true });
  }));

  return router;
};
