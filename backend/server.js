// Import du module 'http' pour créer un serveur HTTP
const http = require('http');

// Import de l'application Express depuis le fichier './app.js'
const app = require('./app');

// Normalisation du port de écoutes en nombre entier (base 10)
const normalizePort = (val) => {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // Si le port n'est pas un nombre, on retourne la valeur tel quelle
    return val;
  }
  if (port >= 0) {
    // C'est le port est un nombre supérieur à zéro, on renvoie le port
    return port;
  }
  return false; // Si le port n'est pas un nombre aussi, il est négatif, La fonction retourne False.
};

// Récupérer le port d'écoute à partir des variables d'environnement ou utiliser le port 4000.
const port = normalizePort(process.env.PORT || '4000');

// Définir le port dans l'application Express
app.set('port', port);

// Vérifier les erreurs de démarrage du serveur
const errorHandler = (error) => {
  if (error.syscall !== 'listen') {
    // Si l'erreur ne concerne pas l'action 'listen' ..
    throw error; // .. on jete l'erreur
  }
  // Obtenir l'adresse d'écoute du serveur
  const address = server.address();

  // Construire le message d'erreur en fonction du type d'adresse (pipe ou port)
  const bind =
    typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;

  // Gérer les erreurs courantes liées à l'adresse d'écoute
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges.'); // Si permissions insuffisantes ..
      process.exit(1); // .. sortir du processus avec le code d'erreur 1
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use.'); // Si le Port est déjà utilisé ..
      process.exit(1); // .. sortir du processus avec le code d'erreur 1
      break;
    default:
      throw error; // Lancer une exception pour les autres erreurs inattendues
  }
};

// Créer le serveur HTTP en utilisant l'application Express
const server = http.createServer(app);

// Gérer les erreurs liées au serveur
server.on('error', errorHandler);

// Écouter l'événement 'listening' qui est émis lorsque le serveur démarre
server.on('listening', () => {
  const address = server.address(); // Obtenir l'adresse d'écoute du serveur
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port; // Construire le message de réussite d'écoute en fonction du type d'adresse (pipe ou port)
  console.log('Listening on ' + bind); // Afficher le message de réussite d'écoute
});

// Faire démarrer le serveur en écoutant sur le port défini
server.listen(port);
