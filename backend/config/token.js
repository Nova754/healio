const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

function generateToken(user) {
    return jwt.sign(
        {
            id: user.id,
            role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION }
    );
}

function authenticateToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ message: 'Accès non autorisé : aucun token fourni.' });
    }
    jwt.verify(token.split(' ')[1], process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token invalide ou expiré.' });
        }
        req.user = user;
        next();
    });
}

function authorizeRole(requiredRole) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Accès non autorisé.' });
        }
        const rolesHierarchy = ['user', 'researcher', 'admin'];
        const userRoleIndex = rolesHierarchy.indexOf(req.user.role);
        const requiredRoleIndex = rolesHierarchy.indexOf(requiredRole);
        if (userRoleIndex < requiredRoleIndex) {
            return res.status(403).json({ message: `Accès refusé : rôle '${requiredRole}' requis.` });
        }

        next();
    };
}

module.exports = {
    generateToken,
    authenticateToken,
    authorizeRole,
};