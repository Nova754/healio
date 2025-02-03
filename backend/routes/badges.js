const express = require('express');
const { authenticateToken, authorizeRole } = require('../config/token');
const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');

const router = express.Router();

router.get('/', authenticateToken, authorizeRole('user'), async (req, res) => {
    try {
        const badges = await sequelize.query(
            `SELECT id, name, description, icon_url
             FROM badges
             ORDER BY id ASC`,
            {
                type: QueryTypes.SELECT,
            }
        );
        res.status(200).json(badges);
    } catch (error) {
        console.error('Erreur lors de la récupération des badges :', error);
        res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
});

router.get('/:id', authenticateToken, authorizeRole('user'), async (req, res) => {
    const { id } = req.params;
    try {
        const badge = await sequelize.query(
            `SELECT id, name, description, icon_url
             FROM badges
             WHERE id = :id`,
            {
                type: QueryTypes.SELECT,
                replacements: { id },
            }
        );
        if (badge.length === 0) {
            return res.status(404).json({ message: "Badge introuvable." });
        }
        res.status(200).json(badge[0]);
    } catch (error) {
        console.error('Erreur lors de la récupération du badge :', error);
        res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
});

router.post('/', authenticateToken, authorizeRole('admin'), async (req, res) => {
    const { name, description, icon_url } = req.body;
    if (!name) {
        return res.status(400).json({ message: "Le champ 'name' est obligatoire." });
    }
    try {
        await sequelize.query(
            'INSERT INTO badges (name, description, icon_url) VALUES (:name, :description, :icon_url)',
            {
                type: QueryTypes.INSERT,
                replacements: { name, description, icon_url },
            }
        );
        res.status(201).json({ message: "Badge créé avec succès." });
    } catch (error) {
        console.error('Erreur lors de la création du badge :', error);
        res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
});

router.put('/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
    const { id } = req.params;
    const { name, description, icon_url } = req.body;
    if (!name && !description && !icon_url) {
        return res.status(400).json({ message: "Au moins un des champs ('name', 'description', 'icon_url') doit être fourni pour la mise à jour." });
    }
    try {
        const badge = await sequelize.query(
            'SELECT id FROM badges WHERE id = :id',
            {
                type: QueryTypes.SELECT,
                replacements: { id },
            }
        );
        if (badge.length === 0) {
            return res.status(404).json({ message: "Badge introuvable." });
        }
        await sequelize.query(
            'UPDATE badges SET name = COALESCE(:name, name), description = COALESCE(:description, description), icon_url = COALESCE(:icon_url, icon_url) WHERE id = :id',
            {
                type: QueryTypes.UPDATE,
                replacements: { name, description, icon_url, id },
            }
        );
        res.status(200).json({ message: "Badge mis à jour avec succès." });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du badge :', error);
        res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
});

router.patch('/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    const allowedFields = ['name', 'description', 'icon_url'];
    for (const key in updates) {
        if (!allowedFields.includes(key)) {
            delete updates[key];
        }
    }
    if (!updates || Object.keys(updates).length === 0) {
        return res.status(400).json({ message: "Aucune donnée à mettre à jour." });
    }
    const setClause = Object.keys(updates).map(key => `${key} = :${key}`).join(', ');
    try {
        const badge = await sequelize.query(
            'SELECT id FROM badges WHERE id = :id',
            {
                type: QueryTypes.SELECT,
                replacements: { id },
            }
        );
        if (badge.length === 0) {
            return res.status(404).json({ message: "Badge introuvable." });
        }
        await sequelize.query(
            `UPDATE badges SET ${setClause} WHERE id = :id`,
            {
                type: QueryTypes.UPDATE,
                replacements: { ...updates, id },
            }
        );
        res.status(200).json({ message: "Badge mis à jour partiellement avec succès." });
    } catch (error) {
        console.error('Erreur lors de la mise à jour partielle du badge :', error);
        res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
});

router.delete('/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
    const { id } = req.params;
    try {
        const badge = await sequelize.query(
            'SELECT id FROM badges WHERE id = :id',
            {
                type: QueryTypes.SELECT,
                replacements: { id },
            }
        );
        if (badge.length === 0) {
            return res.status(404).json({ message: "Badge introuvable." });
        }
        await sequelize.query(
            'DELETE FROM badges WHERE id = :id',
            {
                type: QueryTypes.DELETE,
                replacements: { id },
            }
        );
        res.status(200).json({ message: "Badge supprimé avec succès." });
    } catch (error) {
        console.error('Erreur lors de la suppression du badge :', error);
        res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
});

router.head('/:id', authenticateToken, authorizeRole('user'), async (req, res) => {
    const { id } = req.params;
    try {
        const badge = await sequelize.query(
            'SELECT id FROM badges WHERE id = :id',
            {
                type: QueryTypes.SELECT,
                replacements: { id },
            }
        );
        if (badge.length === 0) {
            return res.status(404).end();
        }
        res.status(200).end();
    } catch (error) {
        console.error('Erreur lors de la vérification du badge :', error);
        res.status(500).end();
    }
});

module.exports = router;