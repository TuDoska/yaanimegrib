const express = require('express');
const { db } = require('../db');
const { requireAuth } = require('../auth');
const { ah, cleanText, isValidAnimeId } = require('../utils');

const router = express.Router();
router.use(requireAuth);

const MAX_FAVORITES = 1000;

// Беремо з клієнта лише безпечні поля картки
function pickAnime(raw = {}) {
  const animeId = Number(raw.id);
  if (!isValidAnimeId(animeId)) return null;
  const image = cleanText(raw.image, 500);
  return {
    animeId,
    title: cleanText(raw.title, 200) || '—',
    image: /^https:\/\//.test(image) ? image : '',
    score: Number.isFinite(raw.score) ? raw.score : null,
    format: cleanText(raw.format, 20),
    episodes: Number.isInteger(raw.episodes) ? raw.episodes : null,
    year: Number.isInteger(raw.year) ? raw.year : null,
  };
}

const toClient = (f) => ({
  id: f.animeId, title: f.title, image: f.image, score: f.score,
  format: f.format, episodes: f.episodes, year: f.year, addedAt: f.createdAt,
});

router.get('/', ah(async (req, res) => {
  const items = await db.favorites.find({ userId: req.user._id }, { sort: { createdAt: -1 } });
  res.json({ items: items.map(toClient) });
}));

async function addFavorite(userId, anime) {
  const exists = await db.favorites.findOne({ userId, animeId: anime.animeId });
  if (exists) return false;
  if ((await db.favorites.count({ userId })) >= MAX_FAVORITES) return false;
  await db.favorites.insert({ userId, ...anime, createdAt: new Date() });
  return true;
}

router.post('/', ah(async (req, res) => {
  const anime = pickAnime(req.body);
  if (!anime) return res.status(400).json({ error: 'bad_anime' });
  await addFavorite(req.user._id, anime);
  res.status(201).json({ ok: true });
}));

// Злиття «гостьового» обраного з localStorage після входу
router.post('/sync', ah(async (req, res) => {
  const items = Array.isArray(req.body.items) ? req.body.items.slice(0, 200) : [];
  let added = 0;
  for (const raw of items) {
    const anime = pickAnime(raw);
    if (anime && (await addFavorite(req.user._id, anime))) added++;
  }
  res.json({ added });
}));

router.delete('/:animeId', ah(async (req, res) => {
  await db.favorites.remove({ userId: req.user._id, animeId: Number(req.params.animeId) });
  res.json({ ok: true });
}));

module.exports = router;
