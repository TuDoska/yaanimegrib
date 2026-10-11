const express = require('express');
const { db } = require('../db');
const { requireAuth, requireNotBanned, hasRole } = require('../auth');
const { ah, cleanText, isValidAnimeId } = require('../utils');

const router = express.Router();

const toClient = (r, viewer) => ({
  id: r._id,
  animeId: r.animeId,
  userId: r.userId,
  username: r.username,
  rating: r.rating,
  text: r.text,
  hidden: !!r.hidden,
  createdAt: r.createdAt,
  updatedAt: r.updatedAt,
  mine: !!viewer && viewer._id === r.userId,
});

// Відгуки до аніме + середня оцінка користувачів сайту
router.get('/:animeId', ah(async (req, res) => {
  const animeId = Number(req.params.animeId);
  if (!isValidAnimeId(animeId)) return res.status(400).json({ error: 'bad_anime' });

  const canModerate = hasRole(req.user, 'moderator');
  const all = await db.reviews.find({ animeId }, { sort: { createdAt: -1 }, limit: 200 });
  const visible = all.filter((r) => !r.hidden || canModerate || r.userId === req.user?._id);
  const rated = all.filter((r) => !r.hidden);
  const average = rated.length ? rated.reduce((s, r) => s + r.rating, 0) / rated.length : null;

  res.json({
    items: visible.map((r) => toClient(r, req.user)),
    average: average && Math.round(average * 10) / 10,
    count: rated.length,
  });
}));

// Створити або оновити свій відгук (один на аніме)
router.post('/:animeId', requireAuth, requireNotBanned, ah(async (req, res) => {
  const animeId = Number(req.params.animeId);
  const rating = Number(req.body.rating);
  const text = cleanText(req.body.text, 2000);
  if (!isValidAnimeId(animeId)) return res.status(400).json({ error: 'bad_anime' });
  if (!Number.isInteger(rating) || rating < 1 || rating > 10) return res.status(400).json({ error: 'bad_rating' });
  if (text.length < 3) return res.status(400).json({ error: 'text_too_short' });

  const existing = await db.reviews.findOne({ animeId, userId: req.user._id });
  if (existing) {
    await db.reviews.update({ _id: existing._id }, { rating, text, updatedAt: new Date() });
    return res.json({ review: toClient({ ...existing, rating, text, updatedAt: new Date() }, req.user) });
  }

  const review = await db.reviews.insert({
    animeId,
    userId: req.user._id,
    username: req.user.username,
    rating,
    text,
    hidden: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  res.status(201).json({ review: toClient(review, req.user) });
}));

// Видалити: автор або модератор
router.delete('/item/:id', requireAuth, ah(async (req, res) => {
  const review = await db.reviews.findOne({ _id: req.params.id });
  if (!review) return res.status(404).json({ error: 'not_found' });
  if (review.userId !== req.user._id && !hasRole(req.user, 'moderator')) {
    return res.status(403).json({ error: 'forbidden' });
  }
  await db.reviews.remove({ _id: review._id });
  res.json({ ok: true });
}));

module.exports = router;
