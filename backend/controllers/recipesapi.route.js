const express = require('express');
const router = express.Router();
const db = require('../utils/db.include');

router.get('/list', (req, res) => {
    db.query('SELECT * FROM recipes', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});
module.exports = router;