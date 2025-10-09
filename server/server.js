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
app.use(express.static(path.join(__dirname, 'public')));

// Configuration du jeu
const GAME_CONFIG = {
  initialResources: {
    money: 2000,
    materials: 1000,
    population: 0,
    energy: 50,
    water: 50,
    education: 0,
    happiness: 50,
    health: 50,
    safety: 50,
    research: 0
  },
  buildingIncomeInterval: 300000, // 5 minutes
  productionInterval: 5000, // 5 secondes
  refundRate: 0.5 // 50% de remboursement
};

// Connexion MongoDB
mongoose.connect('mongodb://localhost:27017/citybuilder3000', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

<<<<<<< HEAD


=======
>>>>>>> 6861acf8b1e6576a4c0888c3e942d1d9c0cadfcf
// Schémas et modèles
const buildingSchema = new mongoose.Schema({
  id: String,
  type: String,
  x: Number,
  z: Number,
  playerId: String,
  gridWidth: Number,
  gridDepth: Number,
  createdAt: { type: Date, default: Date.now }
});

const playerSchema = new mongoose.Schema({
  socketId: String,
  resources: Object,
  buildings: [String],
  connected: { type: Boolean, default: true },
  lastActive: { type: Date, default: Date.now }
});

const gameStateSchema = new mongoose.Schema({
  buildings: [Object],
  resources: Object,
  statistics: Object,
  lastUpdate: { type: Date, default: Date.now }
});

const Building = mongoose.model('Building', buildingSchema);
const Player = mongoose.model('Player', playerSchema);
const GameState = mongoose.model('GameState', gameStateSchema);

// État du jeu en mémoire pour performances
let gameState = {
  buildings: [],
  players: new Map(),
  resources: GAME_CONFIG.initialResources,
  statistics: {
    totalPopulation: 0,
    employedCitizens: 0,
    availableJobs: 0,
    totalBuildings: 0,
    employmentRate: 0
  }
};

// Configuration des bâtiments (identique au client)
const BUILDING_CONFIG = {
  villa: {
    name: 'Villa',
    category: 'residential',
    cost: { money: 500, materials: 300 },
    production: { 
      population: 4,
      money: 2,
      consumption: { energy: 1, water: 1 }
    },
    residents: 4
  },
  studio: {
    name: 'Studio',
    category: 'residential',
    cost: { money: 200, materials: 100 },
    production: { 
      population: 2,
      money: 1,
      consumption: { energy: 0.5, water: 0.5 }
    },
    residents: 2
  },
  apartment: {
    name: 'Appartement',
    category: 'residential',
    cost: { money: 400, materials: 300 },
    production: { 
      population: 16,
      money: 3,
      consumption: { energy: 2, water: 2 }
    },
    residents: 16
  },
  factory: {
    name: 'Usine',
    category: 'industrial',
    cost: { money: 500, materials: 300 },
    production: { 
      money: 10,
      materials: 5,
      consumption: { energy: 3, water: 2 },
      jobs: 8
    }
  },
  powerplant: {
    name: 'Centrale Électrique',
    category: 'industrial',
    cost: { money: 1000, materials: 800 },
    production: { 
      money: 15,
      energy: 50,
      consumption: { materials: 5 },
      jobs: 6
    }
  },
  water_plant: {
    name: 'Usine de Traitement d\'Eau',
    category: 'industrial',
    cost: { money: 600, materials: 400 },
    production: { 
      money: 8,
      water: 30,
      consumption: { energy: 2 },
      jobs: 4
    }
  },
  road: {
    name: 'Route',
    category: 'infrastructure',
    cost: { money: 50, materials: 20 },
    production: { 
      walkable: true,
      infrastructure: true
    }
  },
  park: {
    name: 'Parc',
    category: 'infrastructure',
    cost: { money: 150, materials: 100 },
    production: { 
      happiness: 15,
      walkable: true,
      pedestrian: true
    }
  }
};

// Fonctions utilitaires
class GameManager {
  static isPositionFree(x, z, gridWidth = 1, gridDepth = 1, buildings) {
    for (let dx = 0; dx < gridWidth; dx++) {
      for (let dz = 0; dz < gridDepth; dz++) {
        const occupied = buildings.find(b => 
          b.x === x + dx && b.z === z + dz
        );
        if (occupied) return false;
      }
    }
    return true;
  }

  static calculateBuildingIncome(buildings) {
    let totalIncome = { money: 0, materials: 0 };
    
    buildings.forEach(building => {
      const config = BUILDING_CONFIG[building.type];
      if (config && config.cost) {
        // 10% du coût toutes les 5 minutes
        totalIncome.money += config.cost.money * 0.1;
        totalIncome.materials += config.cost.materials * 0.1;
      }
    });
    
    return totalIncome;
  }

  static calculateStatistics(buildings) {
    let totalPopulation = 0;
    let availableJobs = 0;
    
    buildings.forEach(building => {
      const config = BUILDING_CONFIG[building.type];
      if (config) {
        if (config.residents) {
          totalPopulation += config.residents;
        }
        if (config.production.jobs) {
          availableJobs += config.production.jobs;
        }
      }
    });
    
    const employedCitizens = Math.min(totalPopulation, availableJobs);
    const employmentRate = availableJobs > 0 ? (employedCitizens / availableJobs) * 100 : 0;
    
    return {
      totalPopulation,
      employedCitizens,
      availableJobs,
      totalBuildings: buildings.length,
      employmentRate: Math.round(employmentRate)
    };
  }

  static getRefundAmount(buildingType) {
    const config = BUILDING_CONFIG[buildingType];
    if (!config || !config.cost) return { money: 0, materials: 0 };
    
    return {
      money: Math.round(config.cost.money * GAME_CONFIG.refundRate),
      materials: Math.round(config.cost.materials * GAME_CONFIG.refundRate)
    };
  }
}

// Routes API
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/game-state', (req, res) => {
  res.json({
    buildings: gameState.buildings,
    resources: gameState.resources,
    statistics: gameState.statistics
  });
});

app.get('/api/server-info', (req, res) => {
  res.json({
    players: gameState.players.size,
    buildings: gameState.buildings.length,
    uptime: process.uptime(),
    version: '1.0.0'
  });
});

// Initialisation du jeu
async function initializeGame() {
  try {
    // Nettoyer les données existantes au démarrage
    await Building.deleteMany({});
    await Player.deleteMany({});
    await GameState.deleteMany({});
    
    console.log('Jeu initialisé avec les valeurs par défaut');
  } catch (error) {
    console.error('Erreur initialisation:', error);
  }
}

// Gestion des connexions Socket.io
io.on('connection', (socket) => {
  console.log('Nouveau joueur connecté:', socket.id);

  // Initialiser le joueur
  gameState.players.set(socket.id, {
    socketId: socket.id,
    resources: { ...GAME_CONFIG.initialResources },
    buildings: [],
    connected: true,
    lastActive: new Date()
  });

  // Envoyer l'état actuel du jeu au nouveau joueur
  socket.emit('gameState', {
    buildings: gameState.buildings,
    resources: gameState.resources,
    statistics: gameState.statistics
  });

  // Gestion du placement de bâtiments
  socket.on('placeBuilding', async (data) => {
    try {
      const { x, z, type, playerId, gridWidth, gridDepth } = data;
      
      // Vérifier si la position est libre
      if (!GameManager.isPositionFree(x, z, gridWidth, gridDepth, gameState.buildings)) {
        socket.emit('buildingError', { message: 'Case déjà occupée' });
        return;
      }

      // Vérifier les ressources
      const config = BUILDING_CONFIG[type];
      const player = gameState.players.get(socket.id);
      
      if (!player || player.resources.money < config.cost.money || player.resources.materials < config.cost.materials) {
        socket.emit('buildingError', { message: 'Ressources insuffisantes' });
        return;
      }

      // Créer le bâtiment
      const newBuilding = {
        id: `${socket.id}_${Date.now()}`,
        x,
        z,
        type,
        playerId: socket.id,
        gridWidth,
        gridDepth,
        createdAt: new Date()
      };

      // Déduire le coût
      player.resources.money -= config.cost.money;
      player.resources.materials -= config.cost.materials;

      // Sauvegarder en base
      const buildingDoc = new Building(newBuilding);
      await buildingDoc.save();

      // Mettre à jour l'état du jeu
      gameState.buildings.push(newBuilding);
      player.buildings.push(newBuilding.id);

      // Recalculer les statistiques
      gameState.statistics = GameManager.calculateStatistics(gameState.buildings);

      // Diffuser à tous les joueurs
      io.emit('buildingPlaced', newBuilding);
      io.emit('resourcesUpdate', player.resources);
      io.emit('statisticsUpdate', gameState.statistics);
      
      console.log(`Bâtiment ${type} placé à (${x}, ${z}) par ${socket.id}`);
      
    } catch (error) {
      console.error('Erreur placement bâtiment:', error);
      socket.emit('buildingError', { message: 'Erreur lors du placement' });
    }
  });

  // Gestion de la suppression de bâtiments
  socket.on('removeBuilding', async (data) => {
    try {
      const { buildingId, playerId } = data;
      
      // Trouver le bâtiment
      const buildingIndex = gameState.buildings.findIndex(b => b.id === buildingId);
      if (buildingIndex === -1) {
        socket.emit('buildingError', { message: 'Bâtiment non trouvé' });
        return;
      }

      const building = gameState.buildings[buildingIndex];
      
      // Vérifier la propriété
      if (building.playerId !== socket.id) {
        socket.emit('buildingError', { message: 'Vous ne possédez pas ce bâtiment' });
        return;
      }

      // Rembourser 50%
      const refund = GameManager.getRefundAmount(building.type);
      const player = gameState.players.get(socket.id);
      
      if (player) {
        player.resources.money += refund.money;
        player.resources.materials += refund.materials;
      }

      // Supprimer de la base
      await Building.deleteOne({ id: buildingId });

      // Mettre à jour l'état du jeu
      gameState.buildings.splice(buildingIndex, 1);
      
      // Recalculer les statistiques
      gameState.statistics = GameManager.calculateStatistics(gameState.buildings);

      // Diffuser
      io.emit('buildingRemoved', { buildingId, playerId: socket.id });
      io.emit('resourcesUpdate', player.resources);
      io.emit('statisticsUpdate', gameState.statistics);
      
      console.log(`Bâtiment ${building.type} supprimé par ${socket.id}, remboursement: ${refund.money}💰 ${refund.materials}🔧`);
      
    } catch (error) {
      console.error('Erreur suppression bâtiment:', error);
      socket.emit('buildingError', { message: 'Erreur lors de la suppression' });
    }
  });

  // Gestion du déplacement de bâtiments
  socket.on('moveBuilding', async (data) => {
    try {
      const { buildingId, oldX, oldZ, newX, newZ, playerId } = data;
      
      // Trouver le bâtiment
      const building = gameState.buildings.find(b => b.id === buildingId);
      if (!building) {
        socket.emit('buildingError', { message: 'Bâtiment non trouvé' });
        return;
      }

      // Vérifier la propriété
      if (building.playerId !== socket.id) {
        socket.emit('buildingError', { message: 'Vous ne possédez pas ce bâtiment' });
        return;
      }

      // Vérifier la nouvelle position
      if (!GameManager.isPositionFree(newX, newZ, building.gridWidth, building.gridDepth, gameState.buildings)) {
        socket.emit('buildingError', { message: 'Nouvelle position déjà occupée' });
        return;
      }

      // Mettre à jour la position
      building.x = newX;
      building.z = newZ;

      // Sauvegarder en base
      await Building.updateOne(
        { id: buildingId },
        { $set: { x: newX, z: newZ } }
      );

      // Diffuser
      io.emit('buildingMoved', data);
      
      console.log(`Bâtiment ${building.type} déplacé de (${oldX}, ${oldZ}) à (${newX}, ${newZ}) par ${socket.id}`);
      
    } catch (error) {
      console.error('Erreur déplacement bâtiment:', error);
      socket.emit('buildingError', { message: 'Erreur lors du déplacement' });
    }
  });

  // Mise à jour des ressources
  socket.on('updateResources', (resources) => {
    const player = gameState.players.get(socket.id);
    if (player) {
      player.resources = resources;
      socket.emit('resourcesUpdate', player.resources);
    }
  });

  // Gestion de la déconnexion
  socket.on('disconnect', () => {
    console.log('Joueur déconnecté:', socket.id);
    
    const player = gameState.players.get(socket.id);
    if (player) {
      player.connected = false;
      player.lastActive = new Date();
    }
    
    gameState.players.delete(socket.id);
  });
});

// Système de production automatique
setInterval(() => {
  // Calculer le revenu des bâtiments
  const buildingIncome = GameManager.calculateBuildingIncome(gameState.buildings);
  
  // Distribuer le revenu à tous les joueurs connectés
  gameState.players.forEach((player, socketId) => {
    if (player.connected) {
      player.resources.money += buildingIncome.money;
      player.resources.materials += buildingIncome.materials;
      
      // Notifier le joueur
      const playerSocket = io.sockets.sockets.get(socketId);
      if (playerSocket) {
        playerSocket.emit('resourcesUpdate', player.resources);
        if (buildingIncome.money > 0 || buildingIncome.materials > 0) {
          playerSocket.emit('buildingIncome', {
            money: buildingIncome.money,
            materials: buildingIncome.materials
          });
        }
      }
    }
  });
  
  console.log(`Revenus distribués: ${buildingIncome.money}💰 ${buildingIncome.materials}🔧`);
}, GAME_CONFIG.buildingIncomeInterval);

// Sauvegarde périodique de l'état du jeu
setInterval(async () => {
  try {
    const gameStateDoc = new GameState({
      buildings: gameState.buildings,
      resources: gameState.resources,
      statistics: gameState.statistics,
      lastUpdate: new Date()
    });
    
    await gameStateDoc.save();
    console.log('État du jeu sauvegardé');
  } catch (error) {
    console.error('Erreur sauvegarde état du jeu:', error);
  }
}, 60000); // Toutes les minutes

// Démarrage du serveur
const PORT = process.env.PORT || 3000;

async function startServer() {
  await initializeGame();
  
  server.listen(PORT, () => {
    console.log(`🚀 Serveur CityBuilder 3000 démarré sur le port ${PORT}`);
    console.log(`📊 Configuration:`);
    console.log(`   - Revenus bâtiments: 10% du coût toutes les 5 minutes`);
    console.log(`   - Remboursement: 50% à la suppression`);
    console.log(`   - Ressources initiales: ${GAME_CONFIG.initialResources.money}💰 ${GAME_CONFIG.initialResources.materials}🔧`);
  });
}

startServer().catch(console.error);

// Gestion propre de l'arrêt
process.on('SIGINT', async () => {
  console.log('\n🛑 Arrêt du serveur...');
  
  // Sauvegarder l'état final
  try {
    const gameStateDoc = new GameState({
      buildings: gameState.buildings,
      resources: gameState.resources,
      statistics: gameState.statistics,
      lastUpdate: new Date()
    });
    
    await gameStateDoc.save();
    console.log('État final sauvegardé');
  } catch (error) {
    console.error('Erreur sauvegarde finale:', error);
  }
  
  process.exit(0);
});