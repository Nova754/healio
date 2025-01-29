const express = require('express');
const { authenticateToken, authorizeRole } = require('../config/token');
const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');

const router = express.Router();

router.get('/:userId', authenticateToken, authorizeRole('user'), async (req, res) => {
    const { userId } = req.params;
    try {
        const subscriptions = await sequelize.query(
            `SELECT u.id, u.firstName, u.lastName, u.email, u.bio, u.role, s.created_at
             FROM subscriptions s
             JOIN users u ON s.followed_id = u.id
             WHERE s.follower_id = :userId`,
            {
                type: QueryTypes.SELECT,
                replacements: { userId },
            }
        );
        res.status(200).json(subscriptions);
    } catch (error) {
        console.error('Erreur lors de la récupération des abonnements :', error);
        res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
});

router.post('/', authenticateToken, authorizeRole('user'), async (req, res) => {
    const { followerId, followedId } = req.body;
    if (!followerId || !followedId) {
        return res.status(400).json({ message: "Les champs 'followerId' et 'followedId' sont obligatoires." });
    }
    if (followerId === followedId) {
        return res.status(400).json({ message: "Un utilisateur ne peut pas s'abonner à lui-même." });
    }
    try {
        const existingSubscription = await sequelize.query(
            'SELECT id FROM subscriptions WHERE follower_id = :followerId AND followed_id = :followedId',
            {
                type: QueryTypes.SELECT,
                replacements: { followerId, followedId },
            }
        );
        if (existingSubscription.length > 0) {
            return res.status(409).json({ message: "Vous êtes déjà abonné à cet utilisateur." });
        }
        await sequelize.query(
            'INSERT INTO subscriptions (follower_id, followed_id) VALUES (:followerId, :followedId)',
            {
                type: QueryTypes.INSERT,
                replacements: { followerId, followedId },
            }
        );
        res.status(201).json({ message: "Abonnement ajouté avec succès." });
    } catch (error) {
        console.error('Erreur lors de l\'ajout de l\'abonnement :', error);
        res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
});

router.delete('/', authenticateToken, authorizeRole('user'), async (req, res) => {
    const { followerId, followedId } = req.body;
    if (!followerId || !followedId) {
        return res.status(400).json({ message: "Les champs 'followerId' et 'followedId' sont obligatoires." });
    }
    try {
        const deleted = await sequelize.query(
            'DELETE FROM subscriptions WHERE follower_id = :followerId AND followed_id = :followedId',
            {
                type: QueryTypes.DELETE,
                replacements: { followerId, followedId },
            }
        );
        if (deleted[0] === 0) {
            return res.status(404).json({ message: "Abonnement introuvable." });
        }
        res.status(200).json({ message: "Abonnement supprimé avec succès." });
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'abonnement :', error);
        res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
});

router.head('/', authenticateToken, authorizeRole('user'), async (req, res) => {
    const { followerId, followedId } = req.body;
    if (!followerId || !followedId) {
        return res.status(400).end();
    }
    try {
        const subscription = await sequelize.query(
            'SELECT id FROM subscriptions WHERE follower_id = :followerId AND followed_id = :followedId',
            {
                type: QueryTypes.SELECT,
                replacements: { followerId, followedId },
            }
        );

        if (subscription.length === 0) {
            return res.status(404).end();
        }
        res.status(200).end();
    } catch (error) {
        console.error('Erreur lors de la vérification de l\'abonnement :', error);
        res.status(500).end();
    }
});

module.exports = router;