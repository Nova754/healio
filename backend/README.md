# HEALIO - YOWL

## Documentation de l’API Rest

### Introduction
HEALIO API est une API conçue pour gérer un **réseau social scientifique** nommé Healio, permettant aux **chercheurs** et **utilisateurs** de **publier des articles, commenter, liker, s'abonner, gérer des badges et challenges**.  
L’API permet également l’**administration** complète des utilisateurs, publications, badges et challenges du réseau social **Healio**.

---

## **🚀 Installation et Configuration**

### 1️⃣ **Prérequis**
1. **Docker** : Utilisé pour créer la base de données MySQL et phpMyAdmin.  
   👉 [Télécharger Docker](https://www.docker.com/products/docker-desktop)  
2. **Node.js** : L’API est construite avec Node.js.  
   👉 [Installer Node.js](https://nodejs.org/en)  
3. **Postman** : Utilisé pour tester les routes de l’API.  
   👉 [Télécharger Postman](https://www.postman.com/downloads/)  

---

### 2️⃣ **Installation des dépendances**
On utilise les packages suivants :
- `express` : Framework web pour Node.js.
- `bcrypt` : Sécurisation des mots de passe.
- `cors` : Middleware pour autoriser les requêtes CORS.
- `jsonwebtoken` : Gestion des tokens.
- `dotenv` : Gestion des variables d’environnement.

**Installation :**
```bash
npm init -y
npm install express sequelize bcrypt cors jsonwebtoken dotenv body-parser
```

### 3️⃣ **Configuration de MySQL et phpMyAdmin avec Docker**
Téléchargez le fichier **docker-compose.yaml** dans le dossier du projet.  
Démarrez MySQL et phpMyAdmin avec Docker :

```bash
cd backend
docker-compose up -d
```

### Accédez à phpMyAdmin

Accédez à phpMyAdmin via [http://localhost:8083](http://localhost:8083)  
**Identifiants :**
- **Nom d'utilisateur** : `root`
- **Mot de passe** : `root_password`

### Création de la base de données et des tables :

```sql
-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : mysql
-- Généré le : ven. 07 fév. 2025 à 11:12
-- Version du serveur : 9.1.0
-- Version de PHP : 8.2.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `healio_db`
--

-- --------------------------------------------------------

--
-- Structure de la table `badges`
--

CREATE TABLE `badges` (
  `id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text,
  `icon_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- --------------------------------------------------------

--
-- Structure de la table `challenges`
--

CREATE TABLE `challenges` (
  `id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `start_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `end_date` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- --------------------------------------------------------

--
-- Structure de la table `comments`
--

CREATE TABLE `comments` (
  `id` int NOT NULL,
  `post_id` int NOT NULL,
  `user_id` int NOT NULL,
  `comment_text` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- --------------------------------------------------------

--
-- Structure de la table `likes`
--

CREATE TABLE `likes` (
  `id` int NOT NULL,
  `post_id` int NOT NULL,
  `user_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- --------------------------------------------------------

--
-- Structure de la table `posts`
--

CREATE TABLE `posts` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `images` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- --------------------------------------------------------

--
-- Structure de la table `subscriptions`
--

CREATE TABLE `subscriptions` (
  `id` int NOT NULL,
  `follower_id` int NOT NULL,
  `followed_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `firstName` varchar(50) NOT NULL,
  `lastName` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `bio` text,
  `role` enum('admin','researcher','user') NOT NULL DEFAULT 'user',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- --------------------------------------------------------

--
-- Structure de la table `user_badges`
--

CREATE TABLE `user_badges` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `badge_id` int NOT NULL,
  `obtained_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `user_challenges`
--

CREATE TABLE `user_challenges` (
  `id` int NOT NULL,
  `challenge_id` int NOT NULL,
  `user_id` int NOT NULL,
  `status` enum('in_progress','completed','failed') DEFAULT 'in_progress',
  `completed_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `badges`
--
ALTER TABLE `badges`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `challenges`
--
ALTER TABLE `challenges`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `post_id` (`post_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Index pour la table `likes`
--
ALTER TABLE `likes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `post_id` (`post_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Index pour la table `posts`
--
ALTER TABLE `posts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Index pour la table `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `follower_id` (`follower_id`,`followed_id`),
  ADD KEY `followed_id` (`followed_id`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Index pour la table `user_badges`
--
ALTER TABLE `user_badges`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `badge_id` (`badge_id`);

--
-- Index pour la table `user_challenges`
--
ALTER TABLE `user_challenges`
  ADD PRIMARY KEY (`id`),
  ADD KEY `challenge_id` (`challenge_id`),
  ADD KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `badges`
--
ALTER TABLE `badges`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `challenges`
--
ALTER TABLE `challenges`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `comments`
--
ALTER TABLE `comments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT pour la table `likes`
--
ALTER TABLE `likes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=75;

--
-- AUTO_INCREMENT pour la table `posts`
--
ALTER TABLE `posts`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT pour la table `subscriptions`
--
ALTER TABLE `subscriptions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT pour la table `user_badges`
--
ALTER TABLE `user_badges`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `user_challenges`
--
ALTER TABLE `user_challenges`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `comments`
--
ALTER TABLE `comments`
  ADD CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `likes`
--
ALTER TABLE `likes`
  ADD CONSTRAINT `likes_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `likes_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `posts`
--
ALTER TABLE `posts`
  ADD CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD CONSTRAINT `subscriptions_ibfk_1` FOREIGN KEY (`follower_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `subscriptions_ibfk_2` FOREIGN KEY (`followed_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `user_badges`
--
ALTER TABLE `user_badges`
  ADD CONSTRAINT `user_badges_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_badges_ibfk_2` FOREIGN KEY (`badge_id`) REFERENCES `badges` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `user_challenges`
--
ALTER TABLE `user_challenges`
  ADD CONSTRAINT `user_challenges_ibfk_1` FOREIGN KEY (`challenge_id`) REFERENCES `challenges` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_challenges_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
```

### **4️⃣ Démarrer le Serveur API**
Une fois la base de données opérationnelle, démarrez le serveur :

```bash
cd backend
node server.js
```

L'API sera accessible à http://localhost:8081

## **🔥 Endpoints de l’API**

### 1️⃣ Gestion des Utilisateurs
- **GET /users** → Récupérer tous les utilisateurs.
- **POST /users** → Ajouter un utilisateur.  
  **Body :**
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "123456",
    "role": "user"
  }
  ```
- **PATCH /users/:id** → Modifier un utilisateur.
- **DELETE /users/:id** → Supprimer un utilisateur.

### 2️⃣ **Gestion des Publications**
- **GET /posts** → Récupérer toutes les publications.
- **POST /posts** → Ajouter une publication.  
  **Body :**
  ```json
  {
    "user_id": 1,
    "title": "Nouvelle découverte",
    "content": "Nous avons trouvé un nouveau composé chimique."
  }
  ```
- **PATCH /posts/:id** → Modifier une publication.
- **DELETE /posts/:id** → Supprimer une publication.

### 3️⃣ **Gestion des Commentaires**
- **GET /comments/:post_id** → Récupérer les commentaires d’un post.
- **POST /comments** → Ajouter un commentaire.  
  **Body :**
  ```json
  {
    "user_id": 1,
    "post_id": 10,
    "content": "C'est fascinant !"
  }
  ```
- **PATCH /comments/:id → Modifier un commentaire.**
- **DELETE /comments/:id → Supprimer un commentaire.**

### 4️⃣ **Gestion des Likes**
- **GET /likes/:post_id** → Récupérer le nombre de likes d’un post.
- **POST /likes** → Ajouter un like.  
  **Body :**
  ```json
  {
    "user_id": 1,
    "post_id": 10
  }
  ```
- **DELETE /likes/:post_id → Supprimer un like.**

### 5️⃣ **Gestion des Badges**
- **GET /badges** → Récupérer tous les badges.
- **POST /badges** → Ajouter un badge.  
  **Body :**
  ```json
  {
    "name": "Expert en Physique",
    "description": "Attribué aux chercheurs ayant publié 10 articles en physique.",
    "icon_url": "https://example.com/icon.png"
  }
  ```
- **DELETE /badges/:id → Supprimer un badge.**

### 6️⃣ **Gestion des Challenges**
- **GET /challenges** → Récupérer tous les challenges.
- **POST /challenges** → Ajouter un challenge.  
  **Body :**
  ```json
  {
    "title": "Challenge Scientifique 2024",
    "description": "Publiez 5 articles scientifiques ce mois-ci !",
    "start_date": "2024-01-01",
    "end_date": "2024-01-31"
  }
  ```
- **DELETE /challenges/:id → Supprimer un challenge.**

## 🌍 **Codes de Statut HTTP**
- **200 OK** → Succès.
- **201 Created** → Ressource créée.
- **400 Bad Request** → Mauvaise requête.
- **401 Unauthorized** → Authentification requise.
- **404 Not Found** → Ressource inexistante.
- **500 Internal Server Error** → Erreur serveur.