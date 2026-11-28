const bcrypt = require('bcrypt');
const express = require('express');
const db = require('../utils/db.include');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
const passwordRounds = 12;

function publicUser(user) {
    return {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        date_of_birth: user.date_of_birth instanceof Date
            ? `${user.date_of_birth.getFullYear()}-${String(user.date_of_birth.getMonth() + 1).padStart(2, '0')}-${String(user.date_of_birth.getDate()).padStart(2, '0')}`
            : user.date_of_birth,
        profile_picture_url: user.profile_picture_url,
        created_at: user.created_at,
    };
}

function validateCredentials(body, registering) {
    const errors = [];
    const username = typeof body?.username === 'string' ? body.username.trim() : '';
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body?.password === 'string' ? body.password : '';

    if (registering && (!username || username.length > 50)) {
        errors.push('Username is required and must be 50 characters or fewer.');
    }
    if (!email || email.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push('A valid email address of 100 characters or fewer is required.');
    }
    if (registering && (password.length < 8 || Buffer.byteLength(password, 'utf8') > 72)) {
        errors.push('Password must be at least 8 characters and no more than 72 UTF-8 bytes.');
    } else if (!registering && !password) {
        errors.push('Password is required.');
    }

    if (registering) {
        const { bio, date_of_birth: dateOfBirth, profile_picture_url: pictureUrl } = body;
        if (bio != null && (typeof bio !== 'string' || bio.length > 2000)) {
            errors.push('Bio must be 2,000 characters or fewer.');
        }
        if (dateOfBirth != null && dateOfBirth !== '') {
            const parsedDate = typeof dateOfBirth === 'string' ? new Date(`${dateOfBirth}T00:00:00Z`) : null;
            if (!parsedDate || Number.isNaN(parsedDate.getTime())
                || parsedDate.toISOString().slice(0, 10) !== dateOfBirth) {
                errors.push('Date of birth must be a valid date.');
            }
        }
        if (pictureUrl != null && pictureUrl !== '') {
            let parsedUrl;
            try {
                parsedUrl = new URL(pictureUrl);
            } catch {
                errors.push('Profile picture URL must be a valid HTTP or HTTPS URL.');
            }
            if (pictureUrl.length > 255 || (parsedUrl && !['http:', 'https:'].includes(parsedUrl.protocol))) {
                errors.push('Profile picture URL must be an HTTP or HTTPS URL of 255 characters or fewer.');
            }
        }
    }

    return { errors, username, email, password };
}

router.get('/me', async (req, res) => {
    if (!req.session.userId) {
        return res.json({ user: null });
    }

    try {
        const [users] = await db.execute(
            `SELECT user_id, username, email, bio, date_of_birth, profile_picture_url, created_at
             FROM USER
             WHERE user_id = ?`,
            [req.session.userId],
        );
        if (!users.length) {
            return req.session.destroy((error) => {
                if (error) {
                    console.error('Unable to clear an invalid session:', error.code || error.message);
                    return res.status(500).json({ error: 'Unable to load the current user.' });
                }
                return res.json({ user: null });
            });
        }
        return res.json({ user: publicUser(users[0]) });
    } catch (error) {
        console.error('Unable to load the current user:', error.code || error.message);
        return res.status(500).json({ error: 'Unable to load the current user.' });
    }
});

router.put('/me', requireAuth, async (req, res) => {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const username = typeof body.username === 'string' ? body.username.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const bio = body.bio == null ? '' : body.bio;
    const dateOfBirth = body.date_of_birth == null ? '' : body.date_of_birth;
    const pictureUrl = body.profile_picture_url == null ? '' : body.profile_picture_url;
    const errors = [];

    if (!username || username.length > 50) {
        errors.push('Name is required and must be 50 characters or fewer.');
    }
    if (!email || email.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push('A valid email address of 100 characters or fewer is required.');
    }
    if (typeof bio !== 'string' || bio.length > 2000) {
        errors.push('Bio must be 2,000 characters or fewer.');
    }
    if (typeof dateOfBirth !== 'string') {
        errors.push('Date of birth must be a valid date.');
    } else if (dateOfBirth !== '') {
        const parsedDate = new Date(`${dateOfBirth}T00:00:00Z`);
        if (Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== dateOfBirth) {
            errors.push('Date of birth must be a valid date.');
        }
    }
    if (typeof pictureUrl !== 'string') {
        errors.push('Profile picture URL must be a valid HTTP or HTTPS URL.');
    } else if (pictureUrl !== '') {
        let parsedUrl;
        try {
            parsedUrl = new URL(pictureUrl);
        } catch {
            errors.push('Profile picture URL must be a valid HTTP or HTTPS URL.');
        }
        if (pictureUrl.length > 255 || (parsedUrl && !['http:', 'https:'].includes(parsedUrl.protocol))) {
            errors.push('Profile picture URL must be an HTTP or HTTPS URL of 255 characters or fewer.');
        }
    }
    if (errors.length) {
        return res.status(400).json({ error: errors[0], details: errors });
    }

    try {
        await db.execute(
            `UPDATE USER
             SET username = ?, email = ?, bio = ?, date_of_birth = ?, profile_picture_url = ?
             WHERE user_id = ?`,
            [username, email, bio.trim() || null, dateOfBirth || null, pictureUrl.trim() || null, req.session.userId],
        );
        const [users] = await db.execute(
            `SELECT user_id, username, email, bio, date_of_birth, profile_picture_url, created_at
             FROM USER
             WHERE user_id = ?`,
            [req.session.userId],
        );
        if (!users.length) {
            return res.status(404).json({ error: 'Account not found.' });
        }
        return res.json({ user: publicUser(users[0]) });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'That name or email address is already in use.' });
        }
        console.error('Unable to update user profile:', error.code || error.message);
        return res.status(500).json({ error: 'Unable to update the profile.' });
    }
});

router.delete('/me', requireAuth, async (req, res) => {
    try {
        const [result] = await db.execute(
            'DELETE FROM USER WHERE user_id = ?',
            [req.session.userId],
        );
        if (!result.affectedRows) {
            return res.status(404).json({ error: 'Account not found.' });
        }
        return req.session.destroy((error) => {
            if (error) {
                console.error('Unable to clear the deleted user session:', error.code || error.message);
                res.clearCookie('connect.sid');
                return res.status(500).json({ error: 'Account deleted, but unable to clear the session.' });
            }
            res.clearCookie('connect.sid');
            return res.json({ success: true });
        });
    } catch (error) {
        console.error('Unable to delete user account:', error.code || error.message);
        return res.status(500).json({ error: 'Unable to delete the account.' });
    }
});

router.post('/register', async (req, res) => {
    const { errors, username, email, password } = validateCredentials(req.body, true);
    if (errors.length) {
        return res.status(400).json({ error: errors[0], details: errors });
    }

    try {
        const passwordHash = await bcrypt.hash(password, passwordRounds);
        const [result] = await db.execute(
            `INSERT INTO USER (username, email, password, bio, date_of_birth, profile_picture_url)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                username,
                email,
                passwordHash,
                req.body.bio?.trim() || null,
                req.body.date_of_birth || null,
                req.body.profile_picture_url?.trim() || null,
            ],
        );
        const [users] = await db.execute(
            `SELECT user_id, username, email, bio, date_of_birth, profile_picture_url, created_at
             FROM USER
             WHERE user_id = ?`,
            [result.insertId],
        );

        return req.session.regenerate((sessionError) => {
            if (sessionError) {
                console.error('Unable to start a registration session:', sessionError.code || sessionError.message);
                return res.status(500).json({ error: 'Account created, but unable to start a session. Please sign in.' });
            }
            req.session.userId = result.insertId;
            return req.session.save((saveError) => {
                if (saveError) {
                    console.error('Unable to save a registration session:', saveError.code || saveError.message);
                    return res.status(500).json({ error: 'Account created, but unable to start a session. Please sign in.' });
                }
                return res.status(201).json({ user: publicUser(users[0]) });
            });
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'That username or email address is already in use.' });
        }
        console.error('Unable to register user:', error.code || error.message);
        return res.status(500).json({ error: 'Unable to create the account.' });
    }
});

router.post('/login', async (req, res) => {
    const { errors, email, password } = validateCredentials(req.body, false);
    if (errors.length) {
        return res.status(400).json({ error: errors[0], details: errors });
    }

    try {
        const [users] = await db.execute(
            `SELECT user_id, username, email, password, bio, date_of_birth, profile_picture_url, created_at
             FROM USER
             WHERE email = ?`,
            [email],
        );
        const user = users[0];
        if (!user) {
            return res.status(401).json({ error: 'Email or password is incorrect.' });
        }

        const isPasswordHash = /^\$2[aby]\$/.test(user.password);
        const validPassword = isPasswordHash
            ? await bcrypt.compare(password, user.password)
            : password === user.password;
        if (!validPassword) {
            return res.status(401).json({ error: 'Email or password is incorrect.' });
        }

        if (!isPasswordHash) {
            const passwordHash = await bcrypt.hash(password, passwordRounds);
            await db.execute(
                'UPDATE USER SET password = ? WHERE user_id = ? AND password = ?',
                [passwordHash, user.user_id, user.password],
            );
        }

        return req.session.regenerate((sessionError) => {
            if (sessionError) {
                console.error('Unable to start a login session:', sessionError.code || sessionError.message);
                return res.status(500).json({ error: 'Unable to start a session.' });
            }
            req.session.userId = user.user_id;
            return req.session.save((saveError) => {
                if (saveError) {
                    console.error('Unable to save a login session:', saveError.code || saveError.message);
                    return res.status(500).json({ error: 'Unable to start a session.' });
                }
                return res.json({ user: publicUser(user) });
            });
        });
    } catch (error) {
        console.error('Unable to sign in user:', error.code || error.message);
        return res.status(500).json({ error: 'Unable to sign in.' });
    }
});

router.post('/logout', (req, res) => {
    if (!req.session) {
        return res.json({ success: true });
    }

    return req.session.destroy((error) => {
        if (error) {
            console.error('Unable to end the session:', error.code || error.message);
            return res.status(500).json({ error: 'Unable to sign out.' });
        }
        res.clearCookie('connect.sid');
        return res.json({ success: true });
    });
});

module.exports = router;
