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
const registerRoutes = require('./routes/register');
const loginRoutes = require('./routes/login');
const postsRoutes = require('./routes/posts');
const subscriptionsRoutes = require('./routes/subscriptions');
const commentsRoutes = require('./routes/comments');
const likesRoutes = require('./routes/likes');
const badgesRoutes = require('./routes/badges');

app.use('/api/users', userRoutes);
app.use('/api/register', registerRoutes);
app.use('/api/login', loginRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/likes', likesRoutes);
app.use('/api/badges', badgesRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ message: 'Une erreur est survenue !', error: err.message });
});

app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
});