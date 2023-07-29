// Importation du module jsonwebtoken (jwt)
const jwt = require('jsonwebtoken');

// Importation du module dotenv et chargement des variables d'environnement depuis le fichier .env
const dotenv = require('dotenv').config();

// (Exportation d'un) middleware d'authentification :
module.exports = (req, res, next) => {
  try {
    // Extraction du token JWT de l'en-tête d'autorisation de la requête
    const token = req.headers.authorization.split(' ')[1];
    // Vérification du token en utilisant la clé secrète stockée dans les variables d'environnement
    const decodedToken = jwt.verify(token, `${process.env.SECRET_KEY}`);
    // Extraction de l'userId du token décodé
    const userId = decodedToken.userId;
    // Ajout de l'userId à l'objet de requête
    req.auth = {
      userId: userId,
    };
    next();
  } catch (error) {
    res.status(401).json({ error });
  }
};
