const express = require('express');
const db = require('../utils/db.include');
const { requireAuth } = require('../middleware/auth');
const { positiveInteger } = require('../utils/validation');

const router = express.Router();
router.use(requireAuth);

function validColor(color) {
    return typeof color === 'string' && /^#[0-9a-fA-F]{6}$/.test(color);
}

router.get('/', async (req, res) => {
    try {
        const [albums] = await db.execute(
            `SELECT album_id, user_id, name, color, created_at
             FROM ALBUM
             WHERE user_id = ?
             ORDER BY created_at DESC, album_id DESC`,
            [req.session.userId],
        );
        if (!albums.length) return res.json([]);

        const albumIds = albums.map((album) => album.album_id);
        const placeholders = albumIds.map(() => '?').join(', ');
        const [recipes] = await db.execute(
            `SELECT ar.album_id, r.recipe_id, r.title, r.category, r.description,
                    r.photo_url, r.preparation_time, r.glass_name, r.capacity_cl
             FROM ALBUM_RECIPE ar
             JOIN ALBUM a ON a.album_id = ar.album_id
             JOIN RECIPE r ON r.recipe_id = ar.recipe_id
             WHERE a.user_id = ? AND ar.album_id IN (${placeholders})
             ORDER BY r.created_at DESC, r.recipe_id DESC`,
            [req.session.userId, ...albumIds],
        );
        return res.json(albums.map((album) => ({
            ...album,
            recipes: recipes.filter((recipe) => recipe.album_id === album.album_id),
        })));
    } catch (error) {
        console.error('Unable to load albums:', error.code || error.message);
        return res.status(500).json({ error: 'Unable to load albums.' });
    }
});

router.post('/', async (req, res) => {
    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
    const color = req.body?.color ?? '#f4a261';
    const errors = [];
    if (!name || name.length > 40) {
        errors.push('Album name is required and must be 40 characters or fewer.');
    }
    if (!validColor(color)) {
        errors.push('Album color must be a hexadecimal color such as #f4a261.');
    }
    if (errors.length) {
        return res.status(400).json({ error: errors[0], details: errors });
    }

    try {
        const [result] = await db.execute(
            'INSERT INTO ALBUM (user_id, name, color) VALUES (?, ?, ?)',
            [req.session.userId, name, color],
        );
        const [albums] = await db.execute(
            `SELECT album_id, user_id, name, color, created_at
             FROM ALBUM
             WHERE album_id = ? AND user_id = ?`,
            [result.insertId, req.session.userId],
        );
        return res.status(201).json({ ...albums[0], recipes: [] });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'You already have an album with that name.' });
        }
        console.error('Unable to create album:', error.code || error.message);
        return res.status(500).json({ error: 'Unable to create album.' });
    }
});

router.delete('/:albumId', async (req, res) => {
    const albumId = positiveInteger(req.params.albumId);
    if (!albumId) {
        return res.status(400).json({ error: 'Album id must be a positive integer.' });
    }

    try {
        const [result] = await db.execute(
            'DELETE FROM ALBUM WHERE album_id = ? AND user_id = ?',
            [albumId, req.session.userId],
        );
        if (!result.affectedRows) {
            return res.status(404).json({ error: 'Album not found.' });
        }
        return res.json({ success: true, album_id: albumId });
    } catch (error) {
        console.error('Unable to delete album:', error.code || error.message);
        return res.status(500).json({ error: 'Unable to delete album.' });
    }
});

router.post('/:albumId/recipes', async (req, res) => {
    const albumId = positiveInteger(req.params.albumId);
    const recipeId = positiveInteger(req.body?.recipe_id);
    if (!albumId || !recipeId) {
        return res.status(400).json({ error: 'Album id and recipe_id must be positive integers.' });
    }

    try {
        const [albums] = await db.execute(
            'SELECT album_id FROM ALBUM WHERE album_id = ? AND user_id = ?',
            [albumId, req.session.userId],
        );
        if (!albums.length) {
            return res.status(404).json({ error: 'Album not found.' });
        }

        const [recipes] = await db.execute(
            'SELECT recipe_id FROM RECIPE WHERE recipe_id = ? AND user_id = ?',
            [recipeId, req.session.userId],
        );
        if (!recipes.length) {
            return res.status(404).json({ error: 'Recipe not found in your account.' });
        }

        await db.execute(
            'INSERT INTO ALBUM_RECIPE (album_id, recipe_id) VALUES (?, ?)',
            [albumId, recipeId],
        );
        return res.status(201).json({ success: true, album_id: albumId, recipe_id: recipeId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'This recipe is already in the album.' });
        }
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(404).json({ error: 'Album or recipe not found.' });
        }
        console.error('Unable to add recipe to album:', error.code || error.message);
        return res.status(500).json({ error: 'Unable to add recipe to album.' });
    }
});

router.delete('/:albumId/recipes/:recipeId', async (req, res) => {
    const albumId = positiveInteger(req.params.albumId);
    const recipeId = positiveInteger(req.params.recipeId);
    if (!albumId || !recipeId) {
        return res.status(400).json({ error: 'Album id and recipe id must be positive integers.' });
    }

    try {
        const [result] = await db.execute(
            `DELETE ar FROM ALBUM_RECIPE ar
             JOIN ALBUM a ON a.album_id = ar.album_id
             WHERE ar.album_id = ? AND ar.recipe_id = ? AND a.user_id = ?`,
            [albumId, recipeId, req.session.userId],
        );
        if (!result.affectedRows) {
            return res.status(404).json({ error: 'Recipe not found in this album.' });
        }
        return res.json({ success: true, album_id: albumId, recipe_id: recipeId });
    } catch (error) {
        console.error('Unable to remove recipe from album:', error.code || error.message);
        return res.status(500).json({ error: 'Unable to remove recipe from album.' });
    }
});

module.exports = router;
