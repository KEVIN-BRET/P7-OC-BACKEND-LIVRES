const { error } = require("console");
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

  if (req.file) filename = await sharpConfig.optimizeImage(req.file);

  const bookObject = req.file // si la requette contient un fichier ...)
    ? {
        ...JSON.parse(req.body.book), // on recupere nootre objet en parsant la chaine de caractere
        imageUrl: `${req.protocol}://${req.get("host")}/${filename}`,
      }
    : { ...req.body };

  delete bookObject._userId;

  // on cherche l'obet dans la bdd
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
