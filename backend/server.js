require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('./utils/db.include');
const recipesApiRoute = require('./controllers/recipesapi.route');

const app = express();
const port = Number(process.env.PORT || 9000);
const webOrigin = process.env.WEB_ORIGIN || 'http://localhost:5173';

app.use(cors({ credentials: true, origin: webOrigin }));
app.use(express.json());

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

if (require.main === module) {
    app.listen(port, () => {
        console.log(`Serveur démarré sur http://localhost:${port}`);
    });
}

module.exports = app;