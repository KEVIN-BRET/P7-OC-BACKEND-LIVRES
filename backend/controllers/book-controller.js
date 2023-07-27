const Book = require("../models/book-model");
const fs = require("fs");

const sharpConfig = require("../services/sharp-config");

exports.createBook = async (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  const filename = await sharpConfig.optimizeImage(req.file);
  delete bookObject._id;
  delete bookObject._userID;
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/${filename}`,
  });

  book
    .save()
    .then(() => {
      res.status(201).json({ message: "Objet enregistré !" });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.modifyBook = async (req, res, next) => {
  let filename;
  // si la requette contient un fichier
  if (req.file) filename = await sharpConfig.optimizeImage(req.file);
  const bookObject = req.file // si la requette contient un fichier ...)
    ? {
        ...JSON.parse(req.body.book), // on recupere notre objet en parsant la chaine de caractere
        imageUrl: `${req.protocol}://${req.get("host")}/${filename}`,
      }
    : { ...req.body };

  delete bookObject._userId;

  // on cherche l'objet dans la bdd
  Book.findOne({ _id: req.params.id }).then((book) => {
    if (book.userId != req.auth.userId) {
      res.status(401).json({ message: "Non autorisé" });
    } else {
      // si une nouvelle image est fournie, suppression de l'ancienne
      if (req.file && book.imageUrl) {
        const filename = book.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, (err) => {
          if (err) console.log(err);
        });
      }

      Book.updateOne({ _id: req.params.id }, { ...bookObject })
        .then(() => res.status(200).json({ message: "Livre modifié !" }))
        .catch((error) => res.status(401).json({ error }));
    }
  });
};

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Non autorisé" });
      } else {
        const filename = book.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: "Livre supprimé !" });
            })
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })

    .catch((error) => {
      res.status(500).json({ error });
    });
};

exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(400).json({ error }));
};

exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

exports.addRating = (req, res, next) => {
  // La requette du front envoie une note contenue dans "rating:",
  // or en base de données, la note doit être contenu dans "grade":

  // Donc :

  // On créé une constante ratingObject qui est un objet contenant les informations contenues dans le corps de la requête
  const ratingObject = req.body;
  // On ajoute une propriété "grade" qui contient la valeur de "rating"
  ratingObject.grade = ratingObject.rating;
  // On supprime la propriété "rating", car remplacée par "grade" et devenue inutile
  delete ratingObject.rating;

  // On cherche le livre dont l'_id correspond à l'id de la requette
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (!book) {
        // si le livre n'est pas trouvé, on renvoi une erreur
        res.status(404).json({ message: "Livre inconnu" });
      } else {
        // On vérifie si l'utilisateur a déja noté le livre (si l'id de l'utilisateur est inclu dans le tableau des notes)
        const userRating = book.ratings.includes(
          (rating) => rating.userId == req.body.userId
        );
        if (userRating) {
          // si c'est le cas, on renvoi un msg d'erreur
          res.status(404).json({ message: "Vous avez déja noté ce livre" });
        } else {
          // sinon on ajoute la note au tableau "ratings"
          Book.updateOne(
            { _id: req.params.id },
            { $push: { ratings: ratingObject } }
          )
            .then(() => {
              Book.findOne({ _id: req.params.id })
                .then((book) => {
                  // on recalcule la moyenne
                  const somme = book.ratings.reduce(
                    (acc, rating) => acc + rating.grade,
                    0
                  );
                  book.averageRating =
                    Math.round((somme / book.ratings.length) * 10) / 10;

                  Book.updateOne(
                    { _id: req.params.id },
                    { averageRating: book.averageRating }
                  )
                    // une fois la moyenne mise à jour, on renvoi le livre
                    .then(() => {
                      Book.findOne({ _id: req.params.id })
                        .then((book) => {
                          res.status(200).json(book);
                        })
                        .catch((error) => res.status(404).json({ error }));
                    })
                    .catch((error) => res.status(401).json({ error }));
                })
                .catch((error) => res.status(404).json({ error }));
            })
            .catch((error) => res.status(400).json({ error }));
        }
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

exports.getBestRatedBooks = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 })
    .limit(3) // Limite les résultats aux 3 premiers livres
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};
