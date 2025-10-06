const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Connexion MongoDB
mongoose.connect('mongodb://localhost:27017/citybuilder3000', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Modèles de données
const Building = require('./models/Building');
const Player = require('./models/Player');

// État du jeu en mémoire pour performances
let gameState = {
  buildings: [],
  players: [],
  resources: {}
};

// Routes
app.get('/', (req, res) => {
  res.send('CityBuilder 3000 Server');
});

// Gestion des connexions Socket.io
io.on('connection', (socket) => {
  console.log('Nouveau joueur connecté:', socket.id);

  // Envoyer l'état actuel du jeu au nouveau joueur
  socket.emit('gameState', gameState);

  // Gestion du placement de bâtiments
  socket.on('placeBuilding', async (data) => {
    try {
      const { x, z, type, playerId } = data;
      
      // Vérifier si la case est libre
      const existingBuilding = gameState.buildings.find(b => b.x === x && b.z === z);
      if (existingBuilding) {
        socket.emit('buildingError', { message: 'Case déjà occupée' });
        return;
      }

      // Créer le bâtiment
      const newBuilding = {
        id: Date.now().toString(),
        x,
        z,
        type,
        playerId,
        createdAt: new Date()
      };

      // Sauvegarder en base
      const buildingDoc = new Building(newBuilding);
      await buildingDoc.save();

      // Mettre à jour l'état du jeu
      gameState.buildings.push(newBuilding);

      // Diffuser à tous les joueurs
      io.emit('buildingPlaced', newBuilding);
      
    } catch (error) {
      console.error('Erreur placement bâtiment:', error);
      socket.emit('buildingError', { message: 'Erreur lors du placement' });
    }
  });

  // Gestion des mouvements d'entités
  socket.on('moveEntity', (data) => {
    // Valider le mouvement côté serveur
    io.emit('entityMoved', data);
  });

  // Gestion de la déconnexion
  socket.on('disconnect', () => {
    console.log('Joueur déconnecté:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Serveur CityBuilder 3000 démarré sur le port ${PORT}`);
});