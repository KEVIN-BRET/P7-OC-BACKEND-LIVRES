// Impport du module Mongoose
const mongoose = require('mongoose');
// Import du plugin unique Validator (pour avoir un seul user par adresse mail)
const uniqueValidator = require('mongoose-unique-validator');

// Création du schema pour les utilisateurs :
const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// On applique uniqueValidator au schema
userSchema.plugin(uniqueValidator);

//Exportation du model User
module.exports = mongoose.model('User', userSchema);
