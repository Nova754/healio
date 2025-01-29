const express = require('express');
const bcrypt = require('bcrypt');
const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');
const { generateToken } = require('../config/token');

const router = express.Router();

router.post('/', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Email et mot de passe sont requis." });
    }
    try {
        const user = await sequelize.query(
            'SELECT id, firstName, lastName, email, password, role FROM users WHERE email = :email',
            {
                type: QueryTypes.SELECT,
                replacements: { email },
            }
        );

        if (user.length === 0) {
            return res.status(404).json({ message: "Utilisateur introuvable." });
        }
        const foundUser = user[0];
        const isPasswordValid = await bcrypt.compare(password, foundUser.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Mot de passe incorrect." });
        }
        const token = generateToken({ id: foundUser.id, role: foundUser.role });
        res.status(200).json({
            message: "Connexion réussie.",
            token,
            user: {
                id: foundUser.id,
                firstName: foundUser.firstName,
                lastName: foundUser.lastName,
                email: foundUser.email,
                role: foundUser.role,
            },
        });
    } catch (error) {
        console.error('Erreur lors de la connexion de l\'utilisateur :', error);
        res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
});

module.exports = router;