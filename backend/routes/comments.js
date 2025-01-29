const express = require('express');
const { authenticateToken, authorizeRole } = require('../config/token');
const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');

const router = express.Router();

router.get('/:postId', authenticateToken, authorizeRole('user'), async (req, res) => {
    const { postId } = req.params;
    try {
        const comments = await sequelize.query(
            `SELECT c.id, c.comment_text, c.created_at, u.id AS user_id, u.firstName, u.lastName, u.email
             FROM comments c
             JOIN users u ON c.user_id = u.id
             WHERE c.post_id = :postId
             ORDER BY c.created_at ASC`,
            {
                type: QueryTypes.SELECT,
                replacements: { postId },
            }
        );

        res.status(200).json(comments);
    } catch (error) {
        console.error('Erreur lors de la récupération des commentaires :', error);
        res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
});

router.post('/', authenticateToken, authorizeRole('user'), async (req, res) => {
    const { postId, userId, commentText } = req.body;
    if (!postId || !userId || !commentText) {
        return res.status(400).json({ message: "Les champs 'postId', 'userId' et 'commentText' sont obligatoires." });
    }
    try {
        await sequelize.query(
            'INSERT INTO comments (post_id, user_id, comment_text) VALUES (:postId, :userId, :commentText)',
            {
                type: QueryTypes.INSERT,
                replacements: { postId, userId, commentText },
            }
        );
        res.status(201).json({ message: "Commentaire ajouté avec succès." });
    } catch (error) {
        console.error('Erreur lors de l\'ajout du commentaire :', error);
        res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
});

router.put('/:id', authenticateToken, authorizeRole('user'), async (req, res) => {
    const { id } = req.params;
    const { userId, commentText } = req.body;
    if (!commentText) {
        return res.status(400).json({ message: "Le champ 'commentText' est obligatoire." });
    }
    try {
        const comment = await sequelize.query(
            'SELECT id, user_id FROM comments WHERE id = :id',
            {
                type: QueryTypes.SELECT,
                replacements: { id },
            }
        );
        if (comment.length === 0) {
            return res.status(404).json({ message: "Commentaire introuvable." });
        }
        if (comment[0].user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Vous n'êtes pas autorisé à modifier ce commentaire." });
        }
        await sequelize.query(
            'UPDATE comments SET comment_text = :commentText WHERE id = :id',
            {
                type: QueryTypes.UPDATE,
                replacements: { commentText, id },
            }
        );
        res.status(200).json({ message: "Commentaire mis à jour avec succès." });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du commentaire :', error);
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
        const comment = await sequelize.query(
            'SELECT id, user_id FROM comments WHERE id = :id',
            {
                type: QueryTypes.SELECT,
                replacements: { id },
            }
        );
        if (comment.length === 0) {
            return res.status(404).json({ message: "Commentaire introuvable." });
        }
        if (comment[0].user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Vous n'êtes pas autorisé à modifier ce commentaire." });
        }
        await sequelize.query(
            `UPDATE comments SET ${setClause} WHERE id = :id`,
            {
                type: QueryTypes.UPDATE,
                replacements: { ...updates, id },
            }
        );
        res.status(200).json({ message: "Commentaire mis à jour partiellement avec succès." });
    } catch (error) {
        console.error('Erreur lors de la mise à jour partielle du commentaire :', error);
        res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
});

router.delete('/:id', authenticateToken, authorizeRole('user'), async (req, res) => {
    const { id } = req.params;
    try {
        const comment = await sequelize.query(
            'SELECT id, user_id FROM comments WHERE id = :id',
            {
                type: QueryTypes.SELECT,
                replacements: { id },
            }
        );
        if (comment.length === 0) {
            return res.status(404).json({ message: "Commentaire introuvable." });
        }
        if (comment[0].user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Vous n'êtes pas autorisé à supprimer ce commentaire." });
        }
        await sequelize.query(
            'DELETE FROM comments WHERE id = :id',
            {
                type: QueryTypes.DELETE,
                replacements: { id },
            }
        );
        res.status(200).json({ message: "Commentaire supprimé avec succès." });
    } catch (error) {
        console.error('Erreur lors de la suppression du commentaire :', error);
        res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
});

router.head('/:id', authenticateToken, authorizeRole('user'), async (req, res) => {
    const { id } = req.params;
    try {
        const comment = await sequelize.query(
            'SELECT id FROM comments WHERE id = :id',
            {
                type: QueryTypes.SELECT,
                replacements: { id },
            }
        );
        if (comment.length === 0) {
            return res.status(404).end();
        }
        res.status(200).end();
    } catch (error) {
        console.error('Erreur lors de la vérification du commentaire :', error);
        res.status(500).end();
    }
});

module.exports = router;