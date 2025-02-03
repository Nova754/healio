const express = require('express');
const { authenticateToken, authorizeRole } = require('../config/token');
const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');

const router = express.Router();

router.get('/', authenticateToken, authorizeRole('user'), async (req, res) => {
    try {
        const challenges = await sequelize.query(
            `SELECT id, title, description, start_date, end_date
             FROM challenges
             ORDER BY start_date DESC`,
            {
                type: QueryTypes.SELECT,
            }
        );
        res.status(200).json(challenges);
    } catch (error) {
        console.error('Erreur lors de la récupération des challenges :', error);
        res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
});

router.get('/:id', authenticateToken, authorizeRole('user'), async (req, res) => {
    const { id } = req.params;
    try {
        const challenge = await sequelize.query(
            `SELECT id, title, description, start_date, end_date
             FROM challenges
             WHERE id = :id`,
            {
                type: QueryTypes.SELECT,
                replacements: { id },
            }
        );
        if (challenge.length === 0) {
            return res.status(404).json({ message: "Challenge introuvable." });
        }
        res.status(200).json(challenge[0]);
    } catch (error) {
        console.error('Erreur lors de la récupération du challenge :', error);
        res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
});

router.post('/', authenticateToken, authorizeRole('admin'), async (req, res) => {
    const { title, description, start_date, end_date } = req.body;

    if (!title) {
        return res.status(400).json({ message: "Le champ 'title' est obligatoire." });
    }
    try {
        await sequelize.query(
            'INSERT INTO challenges (title, description, start_date, end_date) VALUES (:title, :description, :start_date, :end_date)',
            {
                type: QueryTypes.INSERT,
                replacements: { title, description, start_date, end_date },
            }
        );
        res.status(201).json({ message: "Challenge créé avec succès." });
    } catch (error) {
        console.error('Erreur lors de la création du challenge :', error);
        res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
});

router.put('/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
    const { id } = req.params;
    const { title, description, start_date, end_date } = req.body;

    if (!title && !description && !start_date && !end_date) {
        return res.status(400).json({ message: "Au moins un champ doit être fourni pour la mise à jour." });
    }
    try {
        const challenge = await sequelize.query(
            'SELECT id FROM challenges WHERE id = :id',
            {
                type: QueryTypes.SELECT,
                replacements: { id },
            }
        );
        if (challenge.length === 0) {
            return res.status(404).json({ message: "Challenge introuvable." });
        }
        await sequelize.query(
            `UPDATE challenges
             SET title = COALESCE(:title, title),
                 description = COALESCE(:description, description),
                 start_date = COALESCE(:start_date, start_date),
                 end_date = COALESCE(:end_date, end_date)
             WHERE id = :id`,
            {
                type: QueryTypes.UPDATE,
                replacements: { title, description, start_date, end_date, id },
            }
        );
        res.status(200).json({ message: "Challenge mis à jour avec succès." });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du challenge :', error);
        res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
});

router.patch('/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    const allowedFields = ['title', 'description', 'start_date', 'end_date'];
    for (const key in updates) {
        if (!allowedFields.includes(key)) {
            delete updates[key];
        }
    }
    if (!updates || Object.keys(updates).length === 0) {
        return res.status(400).json({ message: "Aucune donnée à mettre à jour." });
    }
    const setClause = Object.keys(updates).map((key) => `${key} = :${key}`).join(', ');
    try {
        const challenge = await sequelize.query(
            'SELECT id FROM challenges WHERE id = :id',
            {
                type: QueryTypes.SELECT,
                replacements: { id },
            }
        );
        if (challenge.length === 0) {
            return res.status(404).json({ message: "Challenge introuvable." });
        }
        await sequelize.query(
            `UPDATE challenges SET ${setClause} WHERE id = :id`,
            {
                type: QueryTypes.UPDATE,
                replacements: { ...updates, id },
            }
        );
        res.status(200).json({ message: "Challenge mis à jour partiellement avec succès." });
    } catch (error) {
        console.error('Erreur lors de la mise à jour partielle du challenge :', error);
        res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
});

router.delete('/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
    const { id } = req.params;
    try {
        const challenge = await sequelize.query(
            'SELECT id FROM challenges WHERE id = :id',
            {
                type: QueryTypes.SELECT,
                replacements: { id },
            }
        );
        if (challenge.length === 0) {
            return res.status(404).json({ message: "Challenge introuvable." });
        }
        await sequelize.query(
            'DELETE FROM challenges WHERE id = :id',
            {
                type: QueryTypes.DELETE,
                replacements: { id },
            }
        );
        res.status(200).json({ message: "Challenge supprimé avec succès." });
    } catch (error) {
        console.error('Erreur lors de la suppression du challenge :', error);
        res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
});

router.head('/:id', authenticateToken, authorizeRole('user'), async (req, res) => {
    const { id } = req.params;
    try {
        const challenge = await sequelize.query(
            'SELECT id FROM challenges WHERE id = :id',
            {
                type: QueryTypes.SELECT,
                replacements: { id },
            }
        );
        if (challenge.length === 0) {
            return res.status(404).end();
        }
        res.status(200).end();
    } catch (error) {
        console.error('Erreur lors de la vérification du challenge :', error);
        res.status(500).end();
    }
});

module.exports = router;