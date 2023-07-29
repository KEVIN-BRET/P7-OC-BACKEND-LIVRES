// Importer le module 'express' pour créer des routes
const express = require('express');

// Créer un objet de routeur pour gérer les routes relatives aux livres
const router = express.Router();

// Importer les middlewares nécessaires
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

// Importer le contrôleur pour les livres
const bookCtrl = require('../controllers/book-controller');

// Définition des routes, appels des middlewares ..)
router.post('/', auth, multer, bookCtrl.createBook);
router.post('/:id/rating', auth, bookCtrl.addRating);
router.put('/:id', auth, multer, bookCtrl.modifyBook);
router.delete('/:id', auth, bookCtrl.deleteBook);
router.get('/bestrating', bookCtrl.getBestRatedBooks);
router.get('/:id', bookCtrl.getOneBook);
router.get('/', bookCtrl.getAllBooks);

// Exporter l'objet de routeur
module.exports = router;
