// Importer les modules nécessaires
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv').config();

// Importer les routes pour les livres et les utilisateurs
const bookRoutes = require('./routes/book-route');
const userRoutes = require('./routes/user-route');

// Connexion à la bdd MongoDB avec des identifiants dans les variables d'environnement
mongoose
  .connect(
    `mongodb+srv://${process.env.ID_MONGODB}:${process.env.MDP_MOGODB}@cluster0.drhwbhs.mongodb.net/?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

// Créer l'application Express
const app = express();

// Permettre des requêtes cross-origin et empêcher des erreurs CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, PATCH, OPTIONS'
  );
  next();
});

// Pour traiter/parser les données JSON dans les requêtes http entrantes
app.use(bodyParser.json());

// Routes importées sur leurs chemins respectifs.
app.use('/api/books', bookRoutes);
app.use('/api/auth', userRoutes);

// Middleware pour servir les images statiques
app.use('/images', express.static(path.join(__dirname, 'images')));

// Exporter l'application Express pour l'utiliser ailleurs
module.exports = app;
