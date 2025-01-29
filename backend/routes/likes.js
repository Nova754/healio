const express = require('express');
const { authenticateToken, authorizeRole } = require('../config/token');
const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');

const router = express.Router();

router.get('/:postId', authenticateToken, authorizeRole('user'), async (req, res) => {
    const { postId } = req.params;
    try {
        const likes = await sequelize.query(
            `SELECT l.id, l.created_at, u.id AS user_id, u.firstName, u.lastName, u.email
             FROM likes l
             JOIN users u ON l.user_id = u.id
             WHERE l.post_id = :postId`,
            {
                type: QueryTypes.SELECT,
                replacements: { postId },
            }
        );
        res.status(200).json(likes);
    } catch (error) {
        console.error('Erreur lors de la récupération des likes :', error);
        res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
});

router.post('/', authenticateToken, authorizeRole('user'), async (req, res) => {
    const { postId, userId } = req.body;
    if (!postId || !userId) {
        return res.status(400).json({ message: "Les champs 'postId' et 'userId' sont obligatoires." });
    }
    try {
        const existingLike = await sequelize.query(
            'SELECT id FROM likes WHERE post_id = :postId AND user_id = :userId',
            {
                type: QueryTypes.SELECT,
                replacements: { postId, userId },
            }
        );
        if (existingLike.length > 0) {
            return res.status(409).json({ message: "Vous avez déjà aimé cette publication." });
        }
        await sequelize.query(
            'INSERT INTO likes (post_id, user_id) VALUES (:postId, :userId)',
            {
                type: QueryTypes.INSERT,
                replacements: { postId, userId },
            }
        );
        res.status(201).json({ message: "Like ajouté avec succès." });
    } catch (error) {
        console.error('Erreur lors de l\'ajout du like :', error);
        res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
});

router.delete('/', authenticateToken, authorizeRole('user'), async (req, res) => {
    const { postId, userId } = req.body;
    if (!postId || !userId) {
        return res.status(400).json({ message: "Les champs 'postId' et 'userId' sont obligatoires." });
    }
    try {
        const deleted = await sequelize.query(
            'DELETE FROM likes WHERE post_id = :postId AND user_id = :userId',
            {
                type: QueryTypes.DELETE,
                replacements: { postId, userId },
            }
        );
        if (deleted[0] === 0) {
            return res.status(404).json({ message: "Aucun like trouvé pour cette publication." });
        }
        res.status(200).json({ message: "Like supprimé avec succès." });
    } catch (error) {
        console.error('Erreur lors de la suppression du like :', error);
        res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
});

router.head('/', authenticateToken, authorizeRole('user'), async (req, res) => {
    const { postId, userId } = req.body;
    if (!postId || !userId) {
        return res.status(400).end();
    }
    try {
        const like = await sequelize.query(
            'SELECT id FROM likes WHERE post_id = :postId AND user_id = :userId',
            {
                type: QueryTypes.SELECT,
                replacements: { postId, userId },
            }
        );
        if (like.length === 0) {
            return res.status(404).end();
        }
        res.status(200).end();
    } catch (error) {
        console.error('Erreur lors de la vérification du like :', error);
        res.status(500).end();
    }
});

module.exports = router;