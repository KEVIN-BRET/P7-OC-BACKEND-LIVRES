// Impport du module Mongoose
const mongoose = require('mongoose');
// Import du plugin unique Validator (pour avoir un seul user par adresse mail)
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    // On ajoute l'option unique pour s'assurer qu'il n'y a pas de doublons dans la base de données
    unique: true,
    // On ajoute un validateur pour vérifier que le format de l'adresse e-mail est correct
    validate: {
      validator: function (value) {
        // On utilise une expression régulière pour valider le format de l'adresse e-mail
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      },
      message: 'Le format de l\'adresse e-mail est incorrect',
    },
  },
  password: { type: String, required: true },
});

// On applique uniqueValidator au schema
userSchema.plugin(uniqueValidator);

//Exportation du model User
module.exports = mongoose.model('User', userSchema);
