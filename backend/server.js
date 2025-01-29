const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const { Sequelize } = require('sequelize');

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const { sequelize } = require('./config/database');
(async () => {
    try {
        await sequelize.authenticate();
        console.log('Connexion à la base de données réussie');
    } catch (error) {
        console.error('Erreur de connexion à la base de données :', error);
    }
})();

const userRoutes = require('./routes/users');

app.use('/api/users', userRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ message: 'Une erreur est survenue !', error: err.message });
});

app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
});