// YaAnimeGrib — сервер
const path = require('path');
const http = require('http');
const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');

// Локально підхоплюємо .env (без зовнішніх бібліотек)
try { process.loadEnvFile?.(path.join(__dirname, '..', '.env')); } catch { /* немає .env — ок */ }

const { connect } = require('./db');
const { loadUser } = require('./auth');

async function createApp() {
  await connect();

  const app = express();
  const server = http.createServer(app);
  const io = new Server(server, { maxHttpBufferSize: 1e5 });
  const liveRooms = new Map();

  app.set('trust proxy', 1); // Render стоїть за проксі

  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'https://www.youtube.com', 'https://s.ytimg.com'],
        frameSrc: ['https://www.youtube.com', 'https://www.youtube-nocookie.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'https://graphql.anilist.co', 'wss:', 'ws:'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());
  app.use(loadUser);

  // Простий захист від CSRF: змінювати дані можна лише зі свого сайту
  app.use('/api', (req, res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
    const origin = req.get('origin');
    if (origin && new URL(origin).host !== req.get('host')) return res.status(403).json({ error: 'bad_origin' });
    next();
  });

  app.use('/api', rateLimit({ windowMs: 60 * 1000, limit: 300, standardHeaders: true, legacyHeaders: false }));
  const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false });

  app.get('/api/health', (req, res) => res.json({ ok: true }));
  app.use('/api/auth', authLimiter, require('./routes/auth'));
  app.use('/api/favorites', require('./routes/favorites'));
  app.use('/api/reviews', require('./routes/reviews'));
  app.use('/api/reports', require('./routes/reports'));
  app.use('/api/rooms', require('./routes/rooms')(io, liveRooms));
  app.use('/api/admin', require('./routes/admin')(io));
  app.use('/api', (req, res) => res.status(404).json({ error: 'not_found' }));

  app.use(express.static(path.join(__dirname, '..', 'public'), { extensions: ['html'], maxAge: '1h' }));
  app.use((req, res) => res.status(404).sendFile(path.join(__dirname, '..', 'public', '404.html')));

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'bad_json' });
    console.error(err);
    res.status(500).json({ error: 'server' });
  });

  require('./sockets')(io, liveRooms);
  return { app, server, io };
}

if (require.main === module) {
  createApp().then(({ server }) => {
    const port = Number(process.env.PORT) || 3000;
    server.listen(port, () => console.log(`🍄 YaAnimeGrib: http://localhost:${port}`));
  }).catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = { createApp };
