const express = require('express');
const bcrypt = require('bcrypt');
const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');

const router = express.Router();

const validatePassword = (password) => {
    const minLength = /.{11,}/;
    const upperCase = /.*[A-Z].*[A-Z]/;
    const lowerCase = /.*[a-z].*[a-z]/;
    const digits = /.*\d.*\d/;
    const specialChar = /.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?].*/;
    return minLength.test(password) &&
           upperCase.test(password) &&
           lowerCase.test(password) &&
           digits.test(password) &&
           specialChar.test(password);
};

router.post('/', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ message: "Tous les champs obligatoires doivent être renseignés." });
    }
    if (!validatePassword(password)) {
        return res.status(400).json({
            message: "Le mot de passe doit contenir au moins 11 caractères, 2 majuscules, 2 minuscules, 2 chiffres et 1 caractère spécial."
        });
    }
    try {
        const existingUser = await sequelize.query(
            'SELECT id FROM users WHERE email = :email',
            {
                type: QueryTypes.SELECT,
                replacements: { email },
            }
        );
        if (existingUser.length > 0) {
            return res.status(409).json({ message: "Cet email est déjà utilisé." });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await sequelize.query(
            'INSERT INTO users (firstName, lastName, email, password, role) VALUES (:firstName, :lastName, :email, :password, :role)',
            {
                type: QueryTypes.INSERT,
                replacements: { firstName, lastName, email, password: hashedPassword, role: 'user' },
            }
        );
        res.status(201).json({ message: "Utilisateur enregistré avec succès." });
    } catch (error) {
        console.error('Erreur lors de l\'enregistrement de l\'utilisateur :', error);
        res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
});

module.exports = router;