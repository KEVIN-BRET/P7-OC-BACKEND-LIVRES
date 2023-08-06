// Importation du modèle de livre
const Book = require('../models/book-model'); 

// Mise à jour de la note moyenne d'un livre
function updateAverageRating(bookId) {
  return new Promise((resolve, reject) => {
    Book.findOne({ _id: bookId })
      .then((book) => {
        const totalGrade = book.ratings.reduce(
          (acc, rating) => acc + rating.grade,
          0
        );
        const averageRating =
          Math.round((totalGrade / book.ratings.length) * 10) / 10;

        Book.updateOne({ _id: bookId }, { averageRating: averageRating })
          .then(() => resolve(averageRating))
          .catch((error) => reject(error));
      })
      .catch((error) => reject(error));
  });
}

module.exports = updateAverageRating;
