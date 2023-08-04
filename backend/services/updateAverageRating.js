// updateAverageRating.js
const Book = require('../models/book-model'); 

const updateAverageRating = (bookId, ratings) => {
  return new Promise((resolve, reject) => {
    Book.findOne({ _id: bookId })
      .then((book) => {
        // on recalcule la moyenne
        const somme = ratings.reduce(
          (acc, rating) => acc + rating.grade,
          0
        );
        book.averageRating =
          Math.round((somme / ratings.length) * 10) / 10;

        Book.updateOne(
          { _id: bookId },
          { averageRating: book.averageRating }
        )
          .then(() => resolve(book.averageRating))
          .catch((error) => reject(error));
      })
      .catch((error) => reject(error));
  });
};

module.exports = updateAverageRating;
