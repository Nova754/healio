const express = require('express');
const { authenticateToken, authorizeRole } = require('../config/token');
const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');

const router = express.Router();

router.get('/:userId', authenticateToken, authorizeRole('user'), async (req, res) => {
    const { userId } = req.params;
    try {
        const userChallenges = await sequelize.query(
            `SELECT uc.id, c.title, c.description, c.points_reward, uc.status, uc.completed_at
             FROM user_challenges uc
             JOIN challenges c ON uc.challenge_id = c.id
             WHERE uc.user_id = :userId
             ORDER BY uc.status DESC, uc.completed_at ASC`,
            {
                type: QueryTypes.SELECT,
                replacements: { userId },
            }
        );
        res.status(200).json(userChallenges);
    } catch (error) {
        console.error('Erreur lors de la récupération des challenges utilisateur :', error);
        res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
});

router.post('/', authenticateToken, authorizeRole('user'), async (req, res) => {
    const { userId, challengeId } = req.body;

    if (!userId || !challengeId) {
        return res.status(400).json({ message: "Les champs 'userId' et 'challengeId' sont obligatoires." });
    }
    try {
        const existingParticipation = await sequelize.query(
            'SELECT id FROM user_challenges WHERE user_id = :userId AND challenge_id = :challengeId',
            {
                type: QueryTypes.SELECT,
                replacements: { userId, challengeId },
            }
        );

        if (existingParticipation.length > 0) {
            return res.status(409).json({ message: "Utilisateur déjà inscrit à ce challenge." });
        }
        await sequelize.query(
            'INSERT INTO user_challenges (user_id, challenge_id) VALUES (:userId, :challengeId)',
            {
                type: QueryTypes.INSERT,
                replacements: { userId, challengeId },
            }
        );
        res.status(201).json({ message: "Utilisateur inscrit au challenge avec succès." });
    } catch (error) {
        console.error("Erreur lors de l'inscription au challenge :", error);
        res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
});

router.patch('/:id', authenticateToken, authorizeRole('user'), async (req, res) => {
    const { id } = req.params;
    const { status, completedAt } = req.body;
    if (!status) {
        return res.status(400).json({ message: "Le champ 'status' est obligatoire." });
    }
    try {
        const userChallenge = await sequelize.query(
            'SELECT id, user_id FROM user_challenges WHERE id = :id',
            {
                type: QueryTypes.SELECT,
                replacements: { id },
            }
        );
        if (userChallenge.length === 0) {
            return res.status(404).json({ message: "Challenge utilisateur introuvable." });
        }
        if (userChallenge[0].user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Vous n'êtes pas autorisé à modifier ce challenge." });
        }
        await sequelize.query(
            `UPDATE user_challenges
             SET status = :status, completed_at = :completedAt
             WHERE id = :id`,
            {
                type: QueryTypes.UPDATE,
                replacements: { status, completedAt, id },
            }
        );
        res.status(200).json({ message: "Challenge utilisateur mis à jour avec succès." });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du challenge utilisateur :', error);
        res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
});

router.delete('/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
    const { id } = req.params;
    try {
        const userChallenge = await sequelize.query(
            'SELECT id FROM user_challenges WHERE id = :id',
            {
                type: QueryTypes.SELECT,
                replacements: { id },
            }
        );
        if (userChallenge.length === 0) {
            return res.status(404).json({ message: "Challenge utilisateur introuvable." });
        }
        await sequelize.query(
            'DELETE FROM user_challenges WHERE id = :id',
            {
                type: QueryTypes.DELETE,
                replacements: { id },
            }
        );
        res.status(200).json({ message: "Challenge utilisateur retiré avec succès." });
    } catch (error) {
        console.error('Erreur lors de la suppression du challenge utilisateur :', error);
        res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
});

router.head('/:userId/:challengeId', authenticateToken, authorizeRole('user'), async (req, res) => {
    const { userId, challengeId } = req.params;
    try {
        const userChallenge = await sequelize.query(
            'SELECT id FROM user_challenges WHERE user_id = :userId AND challenge_id = :challengeId',
            {
                type: QueryTypes.SELECT,
                replacements: { userId, challengeId },
            }
        );
        if (userChallenge.length === 0) {
            return res.status(404).end();
        }
        res.status(200).end();
    } catch (error) {
        console.error('Erreur lors de la vérification du challenge utilisateur :', error);
        res.status(500).end();
    }
});

module.exports = router;