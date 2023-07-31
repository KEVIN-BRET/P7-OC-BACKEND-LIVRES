// Import du module multer (gestion de l'envoi de fichiers dans Express)
const multer = require("multer");

// Définition d'un objet MIME_TYPES pour mapper les types MIME (format de fichiers) aux extensions de fichiers correspondantes
const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

// Configuration de la destination et du nom des fichiers téléchargés
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "images");   // Les fichiers seront stockés dans le répertoire "images"
  },
  filename: (req, file, callback) => {
    const extension = MIME_TYPES[file.mimetype];
    const name = file.originalname
      .split(" ")
      .join("_")
      .replace(`.${extension}`, "");
    callback(null, name + Date.now() + "." + extension);
  },
});

// Exportation du middleware
// On precise qu'une seule image sera importée à la fois
module.exports = multer({ storage: storage }).single("image");
