const express = require('express');
const { authenticateToken, authorizeRole } = require('../config/token');
const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const posts = await sequelize.query(
            `SELECT p.id, p.title, p.content, p.images, p.created_at, 
                    u.id AS user_id, u.firstName, u.lastName, u.email
             FROM posts p
             JOIN users u ON p.user_id = u.id
             ORDER BY p.created_at DESC`,
            {
                type: QueryTypes.SELECT,
            }
        );
        res.status(200).json(posts);
    } catch (error) {
        console.error('Erreur lors de la récupération des publications :', error);
        res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const post = await sequelize.query(
            `SELECT p.id, p.title, p.content, p.images, p.created_at, 
                    u.id AS user_id, u.firstName, u.lastName, u.email
             FROM posts p
             JOIN users u ON p.user_id = u.id
             WHERE p.id = :id`,
            {
                type: QueryTypes.SELECT,
                replacements: { id },
            }
        );
        if (post.length === 0) {
            return res.status(404).json({ message: "Publication introuvable." });
        }
        res.status(200).json(post[0]);
    } catch (error) {
        console.error('Erreur lors de la récupération de la publication :', error);
        res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
});

router.post('/', authenticateToken, authorizeRole('user'), async (req, res) => {
    console.log("Données reçues pour la publication :", req.body);
    let { userId, title, content, images } = req.body;
    if (!userId || !title || !content) {
        return res.status(400).json({ message: "Les champs 'userId', 'title' et 'content' sont obligatoires." });
    }
    try {
        await sequelize.query(
            'INSERT INTO posts (user_id, title, content, images) VALUES (:userId, :title, :content, :images)',
            {
                type: QueryTypes.INSERT,
                replacements: { userId, title, content, images },
            }
        );
        res.status(201).json({ message: "Publication créée avec succès." });
    } catch (error) {
        console.error('Erreur lors de la création de la publication :', error);
        res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
});

router.put('/:id', authenticateToken, authorizeRole('user'), async (req, res) => {
    const { id } = req.params;
    const { title, content, images } = req.body;
    if (!title && !content && !images) {
        return res.status(400).json({ message: "Au moins un des champs 'title', 'content' ou 'images' doit être fourni pour la mise à jour." });
    }
    try {
        const post = await sequelize.query(
            'SELECT id, user_id FROM posts WHERE id = :id',
            {
                type: QueryTypes.SELECT,
                replacements: { id },
            }
        );
        if (post.length === 0) {
            return res.status(404).json({ message: "Publication introuvable." });
        }
        if (post[0].user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Vous n'êtes pas autorisé à modifier cette publication." });
        }
        await sequelize.query(
            'UPDATE posts SET title = COALESCE(:title, title), content = COALESCE(:content, content), images = COALESCE(:images, images) WHERE id = :id',
            {
                type: QueryTypes.UPDATE,
                replacements: { title, content, images, id },
            }
        );
        res.status(200).json({ message: "Publication mise à jour avec succès." });
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la publication :', error);
        res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
});

router.patch('/:id', authenticateToken, authorizeRole('user'), async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    if (!updates || Object.keys(updates).length === 0) {
        return res.status(400).json({ message: "Aucune donnée à mettre à jour." });
    }
    const setClause = Object.keys(updates).map((key) => `${key} = :${key}`).join(', ');
    try {
        const post = await sequelize.query(
            'SELECT id, user_id FROM posts WHERE id = :id',
            {
                type: QueryTypes.SELECT,
                replacements: { id },
            }
        );
        if (post.length === 0) {
            return res.status(404).json({ message: "Publication introuvable." });
        }
        if (post[0].user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Vous n'êtes pas autorisé à modifier cette publication." });
        }
        await sequelize.query(
            `UPDATE posts SET ${setClause} WHERE id = :id`,
            {
                type: QueryTypes.UPDATE,
                replacements: { ...updates, id },
            }
        );
        res.status(200).json({ message: "Publication mise à jour partiellement avec succès." });
    } catch (error) {
        console.error('Erreur lors de la mise à jour partielle de la publication :', error);
        res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
});

router.delete('/:id', authenticateToken, authorizeRole('user'), async (req, res) => {
    const { id } = req.params;
    try {
        const post = await sequelize.query(
            'SELECT id, user_id FROM posts WHERE id = :id',
            {
                type: QueryTypes.SELECT,
                replacements: { id },
            }
        );
        if (post.length === 0) {
            return res.status(404).json({ message: "Publication introuvable." });
        }
        if (post[0].user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Vous n'êtes pas autorisé à supprimer cette publication." });
        }
        await sequelize.query(
            'DELETE FROM posts WHERE id = :id',
            {
                type: QueryTypes.DELETE,
                replacements: { id },
            }
        );
        res.status(200).json({ message: "Publication supprimée avec succès." });
    } catch (error) {
        console.error('Erreur lors de la suppression de la publication :', error);
        res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
});

router.head('/:id', authenticateToken, authorizeRole('user'), async (req, res) => {
    const { id } = req.params;
    try {
        const post = await sequelize.query(
            'SELECT id FROM posts WHERE id = :id',
            {
                type: QueryTypes.SELECT,
                replacements: { id },
            }
        );
        if (post.length === 0) {
            return res.status(404).end();
        }
        res.status(200).end();
    } catch (error) {
        console.error('Erreur lors de la vérification de la publication :', error);
        res.status(500).end();
    }
});

module.exports = router;