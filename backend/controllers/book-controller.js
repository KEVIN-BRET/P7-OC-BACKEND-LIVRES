const Book = require('../models/book-model'); // Import du modèle de livre mongoose
const fs = require('fs'); // Importat du module de système de fichiers

const sharpConfig = require('../services/sharp-config'); // Import de la configuration pour l'optimisation d'image
const updateAverageRating = require('../services/updateAverageRating'); // Assurez-vous que le chemin d'importation est correct

// Créer un livre :
exports.createBook = async (req, res, next) => {
  const bookObject = JSON.parse(req.body.book); // Analyser l'objet livre à partir de la requête
  const filename = await sharpConfig.optimizeImage(req.file); // Optimiser l'image associée
  delete bookObject._id; // Supprimer la propriété _id
  delete bookObject._userID; // Supprimer la propriété _userID
  // Créer et enregistrer le livre
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/${filename}`, // Générer l'URL de l'image
  });
  // Enregistrement dans la base de données
  book
    .save()
    .then(() => {
      res.status(201).json({ message: 'Livre enregistré !' });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

// Modifier un livre :
exports.modifyBook = async (req, res, next) => {
  let filename;
  // si la requette contient un fichier ..
  if (req.file) filename = await sharpConfig.optimizeImage(req.file); // on l'optimise
  const bookObject = req.file // si la requette contient un fichier ...
    ? {
        ...JSON.parse(req.body.book), // on recupere notre objet en parsant la chaine de caractere
        imageUrl: `${req.protocol}://${req.get('host')}/${filename}`,
      }
    : { ...req.body };

  delete bookObject._userId;

  // on cherche l'objet dans la bdd
  Book.findOne({ _id: req.params.id }).then((book) => {
    if (book.userId != req.auth.userId) {
      res.status(401).json({ message: 'Non autorisé' });
    } else {
      // si une nouvelle image est fournie, suppression de l'ancienne
      if (req.file && book.imageUrl) {
        const filename = book.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, (err) => {
          if (err) console.log(err);
        });
      }

      Book.updateOne({ _id: req.params.id }, { ...bookObject })
        .then(() => res.status(200).json({ message: 'Livre modifié !' }))
        .catch((error) => res.status(401).json({ error }));
    }
  });
};

// Supprimer un livre :
exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: 'Non autorisé' });
      } else {
        const filename = book.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: 'Livre supprimé !' });
            })
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })

    .catch((error) => {
      res.status(500).json({ error });
    });
};

// Obtenir un livre :
exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(400).json({ error }));
};

// Obtenir les notes d'un livre :
exports.getBookRatings = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book.ratings))
    .catch((error) => res.status(400).json({ error }));
};

// Obtenir tous les livres :
exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

// Obtenir les 3 meilleurs livres :
exports.getBestRatedBooks = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 })
    .limit(3) // Limite les résultats aux 3 premiers livres
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

// Noter un livre :
exports.addRating = (req, res, next) => {
  const ratingObject = { ...req.body, grade: req.body.rating };
  delete ratingObject.rating;

  function hasUserAlreadyRated(userId, ratings) {
    return ratings.some((rating) => rating.userId == userId);
  }

  Book.findOne({ _id: req.params.id })
    .then((book) => {
      // Vérifier si l'utilisateur a déjà noté ce livre
      const userRating = hasUserAlreadyRated(req.body.userId, book.ratings);
      if (userRating) {
        res.status(404).json({ message: 'Vous avez déjà noté ce livre' });
      } else {
        // Ajouter la note à la liste des notes du livre
        Book.updateOne(
          { _id: req.params.id },
          { $push: { ratings: ratingObject } }
        )
          .then(() => {
            // Mettre à jour la note moyenne du livre
            updateAverageRating(req.params.id)
              .then(() => {
                // Renvoyer le livre mis à jour
                Book.findOne({ _id: req.params.id })
                  .then((book) => {
                    res.status(200).json(book);
                  })
                  .catch((error) => res.status(404).json({ error }));
              })
              .catch((error) => res.status(401).json({ error }));
          })
          .catch((error) => res.status(400).json({ error }));
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};
