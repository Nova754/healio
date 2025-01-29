const express = require('express');
const { authenticateToken, authorizeRole } = require('../config/token');
const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');

const router = express.Router();

router.get('/:userId', authenticateToken, authorizeRole('user'), async (req, res) => {
    const { userId } = req.params;
    try {
        const userBadges = await sequelize.query(
            `SELECT ub.id, b.name, b.description, b.icon_url, ub.obtained_at
             FROM user_badges ub
             JOIN badges b ON ub.badge_id = b.id
             WHERE ub.user_id = :userId
             ORDER BY ub.obtained_at DESC`,
            {
                type: QueryTypes.SELECT,
                replacements: { userId },
            }
        );
        res.status(200).json(userBadges);
    } catch (error) {
        console.error('Erreur lors de la récupération des badges utilisateur :', error);
        res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
});

router.post('/', authenticateToken, authorizeRole('admin'), async (req, res) => {
    const { userId, badgeId } = req.body;

    if (!userId || !badgeId) {
        return res.status(400).json({ message: "Les champs 'userId' et 'badgeId' sont obligatoires." });
    }
    try {
        const existingBadge = await sequelize.query(
            'SELECT id FROM user_badges WHERE user_id = :userId AND badge_id = :badgeId',
            {
                type: QueryTypes.SELECT,
                replacements: { userId, badgeId },
            }
        );
        if (existingBadge.length > 0) {
            return res.status(409).json({ message: "Badge déjà attribué à cet utilisateur." });
        }
        await sequelize.query(
            'INSERT INTO user_badges (user_id, badge_id) VALUES (:userId, :badgeId)',
            {
                type: QueryTypes.INSERT,
                replacements: { userId, badgeId },
            }
        );
        res.status(201).json({ message: "Badge attribué avec succès." });
    } catch (error) {
        console.error('Erreur lors de l\'attribution du badge :', error);
        res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
});

router.patch('/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    if (!updates || Object.keys(updates).length === 0) {
        return res.status(400).json({ message: "Aucune donnée à mettre à jour." });
    }
    const setClause = Object.keys(updates).map((key) => `${key} = :${key}`).join(', ');
    try {
        const userBadge = await sequelize.query(
            'SELECT id FROM user_badges WHERE id = :id',
            {
                type: QueryTypes.SELECT,
                replacements: { id },
            }
        );
        if (userBadge.length === 0) {
            return res.status(404).json({ message: "Badge utilisateur introuvable." });
        }
        await sequelize.query(
            `UPDATE user_badges SET ${setClause} WHERE id = :id`,
            {
                type: QueryTypes.UPDATE,
                replacements: { ...updates, id },
            }
        );
        res.status(200).json({ message: "Badge utilisateur mis à jour partiellement avec succès." });
    } catch (error) {
        console.error('Erreur lors de la mise à jour partielle du badge utilisateur :', error);
        res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
});

router.delete('/', authenticateToken, authorizeRole('admin'), async (req, res) => {
    const { userId, badgeId } = req.body;
    if (!userId || !badgeId) {
        return res.status(400).json({ message: "Les champs 'userId' et 'badgeId' sont obligatoires." });
    }
    try {
        const deleted = await sequelize.query(
            'DELETE FROM user_badges WHERE user_id = :userId AND badge_id = :badgeId',
            {
                type: QueryTypes.DELETE,
                replacements: { userId, badgeId },
            }
        );
        if (deleted[0] === 0) {
            return res.status(404).json({ message: "Badge non trouvé pour cet utilisateur." });
        }
        res.status(200).json({ message: "Badge retiré avec succès." });
    } catch (error) {
        console.error('Erreur lors de la suppression du badge :', error);
        res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
});

router.head('/:userId/:badgeId', authenticateToken, authorizeRole('user'), async (req, res) => {
    const { userId, badgeId } = req.params;
    try {
        const badge = await sequelize.query(
            'SELECT id FROM user_badges WHERE user_id = :userId AND badge_id = :badgeId',
            {
                type: QueryTypes.SELECT,
                replacements: { userId, badgeId },
            }
        );
        if (badge.length === 0) {
            return res.status(404).end();
        }
        res.status(200).end();
    } catch (error) {
        console.error('Erreur lors de la vérification du badge utilisateur :', error);
        res.status(500).end();
    }
});

module.exports = router;