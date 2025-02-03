const express = require('express');
const { authenticateToken, authorizeRole } = require('../config/token');
const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');
const bcrypt = require('bcrypt');

const router = express.Router();

router.get('/', authenticateToken, authorizeRole('user'), async (req, res) => {
    try {
        const users = await sequelize.query(
            'SELECT id, firstName, lastName, email, bio, role, created_at FROM users',
            { type: QueryTypes.SELECT }
        );
        res.status(200).json(users);
    } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs :', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
});

router.get('/:id', authenticateToken, authorizeRole('user'), async (req, res) => {
    const { id } = req.params;
    try {
        const user = await sequelize.query(
            'SELECT id, firstName, lastName, email, bio, role, created_at FROM users WHERE id = :id',
            {
                type: QueryTypes.SELECT,
                replacements: { id },
            }
        );
        if (user.length === 0) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }
        res.status(200).json(user[0]);
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur :', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
});

router.post('/', authenticateToken, authorizeRole('admin'), async (req, res) => {
    const { firstName, lastName, email, password, bio, role } = req.body;
    if (!firstName || !lastName || !email || !password || !role) {
        return res.status(400).json({ message: "Tous les champs obligatoires doivent être renseignés." });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await sequelize.query(
            'INSERT INTO users (firstName, lastName, email, password, bio, role) VALUES (:firstName, :lastName, :email, :password, :bio, :role)',
            {
                type: QueryTypes.INSERT,
                replacements: { firstName, lastName, email, password: hashedPassword, bio, role },
            }
        );
        res.status(201).json({ message: "Utilisateur créé avec succès." });
    } catch (error) {
        console.error('Erreur lors de la création de l\'utilisateur :', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
});

router.put('/:id', authenticateToken, authorizeRole('user'), async (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, email, bio, password } = req.body;
    if (req.user.id !== parseInt(id, 10) && req.user.role !== 'admin') {
        return res.status(403).json({ message: "Vous ne pouvez modifier que vos propres informations." });
    }
    try {
        const [updated] = await sequelize.query(
            'UPDATE users SET firstName = :firstName, lastName = :lastName, email = :email, bio = :bio, password = :password WHERE id = :id',
            {
                type: QueryTypes.UPDATE,
                replacements: { firstName, lastName, email, bio, password, id },
            }
        );
        if (updated === 0) {
            return res.status(404).json({ message: "Utilisateur non trouvé ou aucune modification effectuée." });
        }
        res.status(200).json({ message: "Informations mises à jour avec succès." });
    } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'utilisateur :', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
});

router.patch('/:id', authenticateToken, authorizeRole('user'), async (req, res) => {
    console.log("Données reçues pour la mise à jour :", req.body);
    const updates = req.body;
    if (!updates || Object.keys(updates).length === 0) {
        return res.status(400).json({ message: "Aucune donnée à mettre à jour." });
    }
    if (updates.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(updates.email)) {
            return res.status(400).json({ message: "Email invalide." });
        }
    }
    if (updates.password) {
        if (updates.password.length < 6) {
            return res.status(400).json({ message: "Le mot de passe doit contenir au moins 6 caractères." });
        }
        updates.password = await bcrypt.hash(updates.password, 10);
    }
    const setClause = Object.keys(updates)
        .map(key => `${key} = :${key}`)
        .join(', ');
    try {
        const [updated] = await sequelize.query(
            `UPDATE users SET ${setClause} WHERE id = :id`,
            {
                type: QueryTypes.UPDATE,
                replacements: { ...updates, id: req.params.id }
            }
        );
        if (updated === 0) {
            return res.status(404).json({ message: "Utilisateur non trouvé ou aucune modification effectuée." });
        }
        res.status(200).json({ message: "Informations mises à jour avec succès." });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du profil:', error);
        res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
});

router.delete('/:id', authenticateToken, authorizeRole('user'), async (req, res) => {
    const { id } = req.params;
    if (req.user.id !== parseInt(id, 10) && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Vous ne pouvez supprimer que votre propre compte." });
    }
    try {
      const result = await sequelize.query(
        'DELETE FROM users WHERE id = :id',
        {
          replacements: { id }
        }
      );
      if (result[1].affectedRows === 0) {
        return res.status(404).json({ message: "Utilisateur non trouvé." });
      }
      res.status(200).json({ message: "Compte utilisateur supprimé avec succès." });
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur :', error);
      res.status(500).json({ message: 'Erreur interne du serveur' });
    }
});  

router.head('/:id', authenticateToken, authorizeRole('user'), async (req, res) => {
    const { id } = req.params;
    try {
        const user = await sequelize.query(
            'SELECT id FROM users WHERE id = :id',
            {
                type: QueryTypes.SELECT,
                replacements: { id },
            }
        );
        if (user.length === 0) {
            return res.status(404).end();
        }
        res.status(200).end();
    } catch (error) {
        console.error('Erreur lors de la vérification de l\'utilisateur :', error);
        res.status(500).end();
    }
});

module.exports = router;