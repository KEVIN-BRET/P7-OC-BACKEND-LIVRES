// Importer le module 'express' pour créer des routes
const express = require('express');

// Créer un objet de routeur pour gérer les routes relatives aux livres
const router = express.Router();

// Importer le contrôleur pour les utilisateurs
const userCtrl = require('../controllers/user-controllers');

// Définition des routes utilisateurs
router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);

// Exporter l'objet de routeur
module.exports = router;
