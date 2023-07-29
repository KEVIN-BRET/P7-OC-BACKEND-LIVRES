// Impport du module Mongoose
const mongoose = require('mongoose');

// Création du schema pour les livres :
const bookSchema = mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  author: { type: String, required: true },
  imageUrl: { type: String, required: true },
  year: { type: Number, required: true },
  genre: { type: String, required: true },
  ratings: [
    {
      _id: false,
      userId: { type: String, required: true },
      grade: { type: Number, min: 1, required: true },
    },
  ],
  averageRating: { type: Number },
});

// Exportation du modèle Book
module.exports = mongoose.model('Book', bookSchema);
