require('dotenv').config();

const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const db = require('./utils/db.include');
const authApiRoute = require('./controllers/authapi.route');
const recipesApiRoute = require('./controllers/recipesapi.route');

const app = express();
const port = Number(process.env.PORT || 9000);
const webOrigin = process.env.WEB_ORIGIN || 'http://localhost:5173';
const isProduction = process.env.NODE_ENV === 'production';
const sessionSecret = process.env.SESSION_SECRET
    || (isProduction ? null : crypto.randomBytes(32).toString('hex'));

if (!sessionSecret) {
    throw new Error('SESSION_SECRET must be configured when NODE_ENV is production.');
}

app.use(cors({ credentials: true, origin: webOrigin }));
app.use(express.json());
app.use(session({
    name: 'connect.sid',
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: isProduction,
        maxAge: 7 * 24 * 60 * 60 * 1000,
    },
}));

app.get('/api/v1/health', async (_req, res) => {
    try {
        await db.query('SELECT 1');
        return res.json({ status: 'ok', database: 'connected' });
    } catch (error) {
        console.error('Database health check failed:', error.code || error.message);
        return res.status(503).json({ status: 'error', database: 'unavailable' });
    }
});

app.use('/recipesapi', recipesApiRoute);
app.use('/authapi', authApiRoute);

if (require.main === module) {
    app.listen(port, () => {
        console.log(`Serveur démarré sur http://localhost:${port}`);
    });
}

module.exports = app;