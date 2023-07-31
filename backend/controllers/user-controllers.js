// Importation des modules nécessaires
const bcrypt = require('bcrypt'); // Pour le hachage des mots de passe
const jwt = require('jsonwebtoken'); // Pour la création des tokens

const User = require('../models/users-model'); // Modèle utilisateur Mongoose
const dotenv = require('dotenv').config(); // Gestion des variables d'environnement

// Fonction d'inscription d'un utilisateur
exports.signup = (req, res, next) => {
  // Hashage du mot de passe avec bcrypt, ("salt" de 10 tours)
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      // Création d'un nouvel objet utilisateur avec le modèle User
      const user = new User({
        email: req.body.email,
        password: hash, // Utilisation du mot de passe hashé
      });
      // Sauvegarde de l'utilisateur dans la base de données
      user
        .save()
        .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

// Fonction de connexion d'un utilisateur
exports.login = (req, res, next) => {
  // Recherche de l'utilisateur dans la base de données par email
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ error: 'Utilisateur non trouvé !' });
      }
      // Comparaison du mot de passe entré avec le mot de passe hashé stocké
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res.status(401).json({ error: 'Mot de passe incorrect !' });
          }
                    // Création d'un token JWT avec une durée de validité de 12 heures
          res.status(200).json({
            userId: user._id,
            token: jwt.sign({ userId: user._id }, `${process.env.SECRET_KEY}`, {
              expiresIn: '12h',
            }),
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};
