// Impport du module Mongoose
const mongoose = require('mongoose');
// Import du plugin unique Validator (pour avoir 1 user par adresse mail)
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

userSchema.plugin(uniqueValidator);

//Exportation du model User
module.exports = mongoose.model('User', userSchema);
