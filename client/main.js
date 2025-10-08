import * as THREE from 'three';
import { io } from 'socket.io-client';

// Configuration des bâtiments par catégories
const BUILDING_CONFIG = {
    // CATÉGORIE RÉSIDENTIEL
    villa: {
        name: 'Villa',
        category: 'residential',
        color: 0x8B4513,
        height: 6,
        width: 8,
        depth: 10,
        roofHeight: 3,
        cost: { money: 500, materials: 300 },
        production: { 
            population: 15,
            money: 2,
            consumption: { energy: 1, water: 1 }
        },
        employees: 0,
        residents: 15,
        texture: 'brick'
    },
    studio: {
        name: 'Studio',
        category: 'residential',
        color: 0xD2B48C,
        height: 4,
        width: 4,
        depth: 5,
        roofHeight: 1,
        cost: { money: 200, materials: 100 },
        production: { 
            population: 5,
            money: 1,
            consumption: { energy: 0.5, water: 0.5 }
        },
        employees: 0,
        residents: 5,
        texture: 'plaster'
    },
    apartment: {
        name: 'Appartement',
        category: 'residential',
        color: 0x708090,
        height: 12,
        width: 8,
        depth: 10,
        floors: 4,
        cost: { money: 400, materials: 300 },
        production: { 
            population: 25,
            money: 3,
            consumption: { energy: 2, water: 2 }
        },
        employees: 0,
        residents: 25,
        texture: 'concrete'
    },
    residential_complex: {
        name: 'Complexe Résidentiel',
        category: 'residential',
        color: 0x696969,
        height: 18,
        width: 12,
        depth: 14,
        floors: 6,
        cost: { money: 800, materials: 600 },
        production: { 
            population: 50,
            money: 6,
            consumption: { energy: 4, water: 4 }
        },
        employees: 0,
        residents: 50,
        texture: 'modern'
    },

    // CATÉGORIE INDUSTRIEL
    factory: {
        name: 'Usine',
        category: 'industrial',
        color: 0x666666,
        height: 8,
        width: 12,
        depth: 14,
        roofHeight: 1,
        cost: { money: 500, materials: 300 },
        production: { 
            money: 10,
            materials: 5,
            consumption: { energy: 3, water: 2 },
            jobs: 20
        },
        employees: 0,
        residents: 0,
        texture: 'industrial'
    },
    powerplant: {
        name: 'Centrale Électrique',
        category: 'industrial',
        color: 0x444444,
        height: 12,
        width: 14,
        depth: 16,
        chimneyHeight: 20,
        cost: { money: 1000, materials: 800 },
        production: { 
            money: 15,
            energy: 50,
            consumption: { materials: 5 },
            jobs: 15
        },
        employees: 0,
        residents: 0,
        texture: 'industrial'
    },
    water_plant: {
        name: 'Usine de Traitement d\'Eau',
        category: 'industrial',
        color: 0x4682B4,
        height: 7,
        width: 10,
        depth: 10,
        cost: { money: 600, materials: 400 },
        production: { 
            money: 8,
            water: 30,
            consumption: { energy: 2 },
            jobs: 10
        },
        employees: 0,
        residents: 0,
        texture: 'industrial'
    },
    recycling_center: {
        name: 'Centre de Recyclage',
        category: 'industrial',
        color: 0x32CD32,
        height: 5,
        width: 8,
        depth: 10,
        cost: { money: 400, materials: 250 },
        production: { 
            money: 6,
            materials: 8,
            consumption: { energy: 1, water: 1 },
            jobs: 8
        },
        employees: 0,
        residents: 0,
        texture: 'industrial'
    },

    // CATÉGORIE COMMERCIAL
    supermarket: {
        name: 'Supermarché',
        category: 'commercial',
        color: 0xFF6347,
        height: 6,
        width: 10,
        depth: 12,
        cost: { money: 600, materials: 400 },
        production: { 
            money: 15,
            consumption: { energy: 2, water: 1 },
            jobs: 25
        },
        employees: 0,
        residents: 0,
        texture: 'commercial'
    },
    mall: {
        name: 'Centre Commercial',
        category: 'commercial',
        color: 0xDC143C,
        height: 8,
        width: 16,
        depth: 18,
        cost: { money: 1200, materials: 800 },
        production: { 
            money: 25,
            consumption: { energy: 4, water: 2 },
            jobs: 50
        },
        employees: 0,
        residents: 0,
        texture: 'commercial'
    },
    bakery: {
        name: 'Boulangerie',
        category: 'commercial',
        color: 0xF0E68C,
        height: 4,
        width: 5,
        depth: 6,
        cost: { money: 300, materials: 150 },
        production: { 
            money: 8,
            consumption: { energy: 1, water: 1 },
            jobs: 6
        },
        employees: 0,
        residents: 0,
        texture: 'commercial'
    },
    restaurant: {
        name: 'Restaurant',
        category: 'commercial',
        color: 0x8B0000,
        height: 4,
        width: 6,
        depth: 8,
        cost: { money: 400, materials: 200 },
        production: { 
            money: 12,
            consumption: { energy: 1, water: 2 },
            jobs: 10
        },
        employees: 0,
        residents: 0,
        texture: 'commercial'
    },

    // CATÉGORIE ÉDUCATION
    school: {
        name: 'École Primaire',
        category: 'education',
        color: 0x4682B4,
        height: 7,
        width: 14,
        depth: 10,
        roofHeight: 3,
        cost: { money: 300, materials: 200 },
        production: { 
            money: 5,
            population: 10,
            education: 20,
            consumption: { energy: 2, water: 1 },
            jobs: 15
        },
        employees: 0,
        residents: 0,
        texture: 'education'
    },
    high_school: {
        name: 'Lycée',
        category: 'education',
        color: 0x4169E1,
        height: 8,
        width: 18,
        depth: 12,
        cost: { money: 500, materials: 350 },
        production: { 
            money: 8,
            population: 15,
            education: 30,
            consumption: { energy: 3, water: 2 },
            jobs: 25
        },
        employees: 0,
        residents: 0,
        texture: 'education'
    },
    university: {
        name: 'Université',
        category: 'education',
        color: 0x000080,
        height: 12,
        width: 24,
        depth: 18,
        cost: { money: 1000, materials: 700 },
        production: { 
            money: 15,
            population: 30,
            education: 50,
            research: 20,
            consumption: { energy: 5, water: 3 },
            jobs: 40
        },
        employees: 0,
        residents: 0,
        texture: 'education'
    },
    library: {
        name: 'Bibliothèque',
        category: 'education',
        color: 0x8B4513,
        height: 6,
        width: 10,
        depth: 8,
        cost: { money: 350, materials: 250 },
        production: { 
            money: 3,
            education: 15,
            consumption: { energy: 1, water: 1 },
            jobs: 8
        },
        employees: 0,
        residents: 0,
        texture: 'education'
    },

    // INFRASTRUCTURES
    road: {
        name: 'Route',
        category: 'infrastructure',
        color: 0x333333,
        height: 0.2,
        width: 4,
        depth: 4,
        cost: { money: 50, materials: 20 },
        production: { 
            walkable: true,
            infrastructure: true
        },
        employees: 0,
        residents: 0,
        texture: 'asphalt'
    },
    sidewalk: {
        name: 'Trottoir',
        category: 'infrastructure',
        color: 0x888888,
        height: 0.1,
        width: 2,
        depth: 2,
        cost: { money: 20, materials: 10 },
        production: { 
            walkable: true,
            pedestrian: true,
            infrastructure: true
        },
        employees: 0,
        residents: 0,
        texture: 'concrete'
    },
    park: {
        name: 'Parc',
        category: 'infrastructure',
        color: 0x228B22,
        height: 0.1,
        width: 8,
        depth: 8,
        cost: { money: 150, materials: 100 },
        production: { 
            happiness: 15,
            walkable: true,
            pedestrian: true
        },
        employees: 0,
        residents: 0,
        texture: 'grass'
    },
    hospital: {
        name: 'Hôpital',
        category: 'infrastructure',
        color: 0xFFFFFF,
        height: 8,
        width: 12,
        depth: 14,
        cost: { money: 800, materials: 500 },
        production: { 
            money: 12,
            health: 30,
            consumption: { energy: 3, water: 2 },
            jobs: 35
        },
        employees: 0,
        residents: 0,
        texture: 'hospital'
    },
    police_station: {
        name: 'Poste de Police',
        category: 'infrastructure',
        color: 0x0000FF,
        height: 5,
        width: 8,
        depth: 10,
        cost: { money: 400, materials: 300 },
        production: { 
            money: 6,
            safety: 20,
            consumption: { energy: 1, water: 1 },
            jobs: 12
        },
        employees: 0,
        residents: 0,
        texture: 'public'
    }
};

// Gestionnaire de ressources
class ResourceManager {
    constructor(game) {
        this.game = game;
        this.productionInterval = 5000; // 5 secondes
        this.lastProductionTime = Date.now();
        this.employedCitizens = 0;
        this.availableJobs = 0;
        this.totalPopulation = 0;
        
        this.init();
    }

    init() {
        this.calculateEmployment();
        this.calculatePopulation();
    }

    calculateEmployment() {
        this.availableJobs = 0;
        this.employedCitizens = 0;

        this.game.buildingManager.buildings.forEach(building => {
            const config = BUILDING_CONFIG[building.type];
            if (config.production.jobs) {
                this.availableJobs += config.production.jobs;
            }
        });

        // Simuler l'emploi basé sur la population
        this.employedCitizens = Math.min(this.totalPopulation, this.availableJobs);
    }

    calculatePopulation() {
        this.totalPopulation = 0;
        this.game.buildingManager.buildings.forEach(building => {
            const config = BUILDING_CONFIG[building.type];
            if (config.residents) {
                this.totalPopulation += config.residents;
            }
        });
    }

    update() {
        const currentTime = Date.now();
        if (currentTime - this.lastProductionTime >= this.productionInterval) {
            this.produceResources();
            this.lastProductionTime = currentTime;
        }
    }

    produceResources() {
        let totalProduction = {
            money: 0,
            materials: 0,
            energy: 0,
            water: 0,
            population: 0,
            education: 0,
            happiness: 0,
            health: 0,
            safety: 0,
            research: 0
        };

        let totalConsumption = {
            money: 0,
            materials: 0,
            energy: 0,
            water: 0
        };

        // Calculer la production et consommation de chaque bâtiment
        this.game.buildingManager.buildings.forEach(building => {
            const config = BUILDING_CONFIG[building.type];
            const production = config.production;
            
            // Ajouter la production
            Object.keys(production).forEach(resource => {
                if (typeof production[resource] === 'number') {
                    totalProduction[resource] += production[resource];
                }
            });

            // Gérer la consommation
            if (production.consumption) {
                Object.keys(production.consumption).forEach(resource => {
                    totalConsumption[resource] += production.consumption[resource];
                });
            }
        });

        // Appliquer les bonus/malus basés sur l'emploi et la population
        const employmentRate = this.availableJobs > 0 ? this.employedCitizens / this.availableJobs : 0;
        const employmentBonus = employmentRate > 0.8 ? 1.2 : employmentRate > 0.5 ? 1.1 : 1.0;

        // Calculer le revenu basé sur l'emploi
        const incomeFromJobs = this.employedCitizens * 0.5;
        totalProduction.money += incomeFromJobs;

        // Appliquer les bonus
        totalProduction.money *= employmentBonus;
        totalProduction.materials *= employmentBonus;

        // Soustraire la consommation
        const netResources = {
            money: totalProduction.money - totalConsumption.money,
            materials: totalProduction.materials - totalConsumption.materials,
            energy: totalProduction.energy - totalConsumption.energy,
            water: totalProduction.water - totalConsumption.water,
            population: totalProduction.population,
            education: totalProduction.education,
            happiness: totalProduction.happiness,
            health: totalProduction.health,
            safety: totalProduction.safety,
            research: totalProduction.research
        };

        // Mettre à jour les ressources dans l'UI
        this.game.uiManager.updateResources(netResources);

        // Mettre à jour les statistiques d'emploi et population
        this.calculateEmployment();
        this.calculatePopulation();

        // Mettre à jour l'affichage des statistiques
        this.updateStatisticsDisplay();
    }

    updateStatisticsDisplay() {
        const statsPanel = document.getElementById('statistics-panel');
        if (statsPanel) {
            const employmentRate = this.availableJobs > 0 ? 
                Math.round((this.employedCitizens / this.availableJobs) * 100) : 0;

            statsPanel.innerHTML = `
                <h4>📊 Statistiques de la Ville</h4>
                <div class="stat-item">
                    <span>👥 Population:</span>
                    <span>${this.totalPopulation}</span>
                </div>
                <div class="stat-item">
                    <span>💼 Emplois:</span>
                    <span>${this.employedCitizens}/${this.availableJobs}</span>
                </div>
                <div class="stat-item">
                    <span>📈 Taux d'emploi:</span>
                    <span>${employmentRate}%</span>
                </div>
                <div class="stat-item">
                    <span>🏢 Bâtiments:</span>
                    <span>${this.game.buildingManager.buildings.size}</span>
                </div>
            `;
        }
    }

    canBuild(buildingType) {
        const config = BUILDING_CONFIG[buildingType];
        const resources = this.game.uiManager.resources;
        
        return resources.money >= config.cost.money && 
               resources.materials >= config.cost.materials;
    }

    getBuildingEfficiency(buildingType) {
        // Calculer l'efficacité d'un bâtiment basée sur les ressources disponibles
        const resources = this.game.uiManager.resources;
        let efficiency = 1.0;

        // Réduire l'efficacité si manque d'énergie ou d'eau
        if (resources.energy < 10) efficiency *= 0.7;
        if (resources.water < 10) efficiency *= 0.7;

        return efficiency;
    }
}

// Textures et matériaux améliorés
class TextureManager {
    constructor() {
        this.textures = new Map();
        this.materials = new Map();
        this.init();
    }

    init() {
        this.createTextures();
    }

    createTextures() {
        // Créer des textures procédurales de base
        this.createBrickTexture();
        this.createConcreteTexture();
        this.createGlassTexture();
        this.createGrassTexture();
        this.createAsphaltTexture();
        this.createIndustrialTexture();
    }

    createBrickTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const context = canvas.getContext('2d');

        // Fond brique
        context.fillStyle = '#8B4513';
        context.fillRect(0, 0, 256, 256);

        // Motif de briques
        context.strokeStyle = '#A0522D';
        context.lineWidth = 2;

        for (let y = 0; y < 256; y += 32) {
            for (let x = 0; x < 256; x += 64) {
                context.strokeRect(x, y, 60, 28);
            }
            for (let x = 32; x < 256; x += 64) {
                context.strokeRect(x, y + 16, 60, 28);
            }
        }

        const texture = new THREE.CanvasTexture(canvas);
        this.textures.set('brick', texture);
    }

    createConcreteTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const context = canvas.getContext('2d');

        context.fillStyle = '#708090';
        context.fillRect(0, 0, 256, 256);

        // Ajouter du bruit pour la texture
        for (let i = 0; i < 5000; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            const brightness = Math.random() * 50;
            context.fillStyle = `rgba(255, 255, 255, ${brightness / 255})`;
            context.fillRect(x, y, 1, 1);
        }

        const texture = new THREE.CanvasTexture(canvas);
        this.textures.set('concrete', texture);
    }

    createGlassTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const context = canvas.getContext('2d');

        // Verre bleu transparent
        context.fillStyle = 'rgba(135, 206, 235, 0.3)';
        context.fillRect(0, 0, 128, 128);

        // Réflexions
        context.fillStyle = 'rgba(255, 255, 255, 0.2)';
        for (let i = 0; i < 5; i++) {
            const x = Math.random() * 128;
            const y = Math.random() * 128;
            context.fillRect(x, y, 20, 2);
        }

        const texture = new THREE.CanvasTexture(canvas);
        this.textures.set('glass', texture);
    }

    createGrassTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const context = canvas.getContext('2d');

        // Herbe verte
        context.fillStyle = '#228B22';
        context.fillRect(0, 0, 256, 256);

        // Variations de vert
        for (let i = 0; i < 1000; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            const greenVariation = Math.random() * 50;
            context.fillStyle = `rgb(34, ${139 + greenVariation}, 34)`;
            context.fillRect(x, y, 2, 2);
        }

        const texture = new THREE.CanvasTexture(canvas);
        this.textures.set('grass', texture);
    }

    createAsphaltTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const context = canvas.getContext('2d');

        // Asphalte gris
        context.fillStyle = '#333333';
        context.fillRect(0, 0, 256, 256);

        // Texture granuleuse
        for (let i = 0; i < 3000; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            const brightness = Math.random() * 30;
            context.fillStyle = `rgb(${51 + brightness}, ${51 + brightness}, ${51 + brightness})`;
            context.fillRect(x, y, 1, 1);
        }

        const texture = new THREE.CanvasTexture(canvas);
        this.textures.set('asphalt', texture);
    }

    createIndustrialTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const context = canvas.getContext('2d');

        // Métal industriel
        context.fillStyle = '#666666';
        context.fillRect(0, 0, 256, 256);

        // Panneaux métalliques
        context.strokeStyle = '#555555';
        context.lineWidth = 2;
        for (let y = 0; y < 256; y += 32) {
            for (let x = 0; x < 256; x += 32) {
                context.strokeRect(x, y, 30, 30);
            }
        }

        const texture = new THREE.CanvasTexture(canvas);
        this.textures.set('industrial', texture);
    }

    getMaterial(type, color = null) {
        const key = `${type}_${color}`;
        if (this.materials.has(key)) {
            return this.materials.get(key);
        }

        let material;
        switch (type) {
            case 'brick':
                material = new THREE.MeshLambertMaterial({ 
                    map: this.textures.get('brick'),
                    color: color || 0x8B4513
                });
                break;
            case 'concrete':
                material = new THREE.MeshLambertMaterial({ 
                    map: this.textures.get('concrete'),
                    color: color || 0x708090
                });
                break;
            case 'glass':
                material = new THREE.MeshLambertMaterial({ 
                    map: this.textures.get('glass'),
                    transparent: true,
                    opacity: 0.6,
                    color: color || 0x87CEEB
                });
                break;
            case 'grass':
                material = new THREE.MeshLambertMaterial({ 
                    map: this.textures.get('grass'),
                    color: color || 0x228B22
                });
                break;
            case 'asphalt':
                material = new THREE.MeshLambertMaterial({ 
                    map: this.textures.get('asphalt'),
                    color: color || 0x333333
                });
                break;
            case 'industrial':
                material = new THREE.MeshLambertMaterial({ 
                    map: this.textures.get('industrial'),
                    color: color || 0x666666
                });
                break;
            default:
                material = new THREE.MeshLambertMaterial({ color: color || 0x888888 });
        }

        this.materials.set(key, material);
        return material;
    }
}

// Gestionnaire d'erreurs
class ErrorManager {
    constructor() {
        this.errors = [];
    }
    
    logError(context, error, severity = 'warning') {
        const errorData = {
            id: Date.now(),
            context,
            message: error.message,
            stack: error.stack,
            severity,
            timestamp: new Date().toISOString()
        };
        
        this.errors.push(errorData);
        console.error(`[${severity.toUpperCase()}] ${context}:`, error);
        
        if (this.errors.length > 100) {
            this.errors = this.errors.slice(-100);
        }
        
        return errorData;
    }
    
    showErrorToUser(message, type = 'error') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 24px;
            right: 24px;
            background: ${type === 'error' ? '#ff6b6b' : type === 'success' ? '#4cd964' : '#8b9dff'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            font-weight: 500;
        `;

        document.body.appendChild(notification);
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
}

// Gestionnaire de sauvegarde
class SaveManager {
    constructor(game) {
        this.game = game;
        this.autoSaveInterval = null;
    }
    
    saveGame(slotName = 'autosave') {
        try {
            const saveData = {
                timestamp: Date.now(),
                buildings: Array.from(this.game.buildingManager.buildings.values()).map(building => ({
                    type: building.type,
                    x: building.x,
                    z: building.z,
                    playerId: building.playerId
                })),
                resources: this.game.uiManager.resources,
                camera: {
                    position: [this.game.camera.position.x, this.game.camera.position.y, this.game.camera.position.z],
                    target: [this.game.cameraController.target.x, this.game.cameraController.target.y, this.game.cameraController.target.z]
                }
            };
            
            localStorage.setItem(`citybuilder_${slotName}`, JSON.stringify(saveData));
            console.log(`Jeu sauvegardé: ${slotName}`);
            return saveData;
        } catch (error) {
            this.game.errorManager.logError('SaveManager.saveGame', error, 'error');
            return null;
        }
    }
    
    loadGame(slotName = 'autosave') {
        try {
            const saveData = JSON.parse(localStorage.getItem(`citybuilder_${slotName}`));
            if (saveData) {
                this.game.loadGameState(saveData);
                
                if (saveData.camera) {
                    this.game.camera.position.fromArray(saveData.camera.position);
                    this.game.cameraController.target.fromArray(saveData.camera.target);
                    this.game.cameraController.updateCameraPosition();
                }
                
                console.log(`Jeu chargé: ${slotName}`);
                return true;
            }
            return false;
        } catch (error) {
            this.game.errorManager.logError('SaveManager.loadGame', error, 'error');
            return false;
        }
    }
    
    startAutoSave(interval = 60000) {
        this.autoSaveInterval = setInterval(() => {
            this.saveGame('autosave');
        }, interval);
    }
    
    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
    }
    
    getSaveSlots() {
        const slots = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('citybuilder_')) {
                try {
                    const saveData = JSON.parse(localStorage.getItem(key));
                    slots.push({
                        name: key.replace('citybuilder_', ''),
                        timestamp: saveData.timestamp,
                        buildingCount: saveData.buildings ? saveData.buildings.length : 0
                    });
                } catch (e) {
                    // Ignorer les entrées corrompues
                }
            }
        }
        return slots.sort((a, b) => b.timestamp - a.timestamp);
    }
}

// Gestionnaire de quêtes
class QuestManager {
    constructor(game) {
        this.game = game;
        this.activeQuests = new Map();
        this.completedQuests = new Set();
        this.setupDefaultQuests();
    }
    
    setupDefaultQuests() {
        this.addQuest({
            id: 'first_building',
            title: 'Première construction',
            description: 'Construisez votre premier bâtiment',
            objective: { type: 'build', buildingType: 'any', count: 1 },
            reward: { money: 500, materials: 200 },
            onComplete: () => this.game.uiManager.showMessage('Félicitations pour votre premier bâtiment!', 'success')
        });
        
        this.addQuest({
            id: 'small_town',
            title: 'Petite ville',
            description: 'Ayez une population de 50 habitants',
            objective: { type: 'population', count: 50 },
            reward: { money: 1000, materials: 500 },
            onComplete: () => this.game.uiManager.showMessage('Votre ville grandit!', 'success')
        });

        this.addQuest({
            id: 'diverse_city',
            title: 'Ville diversifiée',
            description: 'Construisez au moins un bâtiment de chaque catégorie',
            objective: { type: 'categories', categories: ['residential', 'commercial', 'industrial', 'education', 'infrastructure'], count: 1 },
            reward: { money: 2000, materials: 1000, happiness: 20 },
            onComplete: () => this.game.uiManager.showMessage('Votre ville est maintenant diversifiée!', 'success')
        });
    }
    
    addQuest(quest) {
        this.activeQuests.set(quest.id, {
            ...quest,
            progress: 0,
            completed: false
        });
        this.updateQuestDisplay();
    }
    
    updateQuestProgress(type, data) {
        for (const [questId, quest] of this.activeQuests) {
            if (quest.completed) continue;
            
            let updated = false;
            
            if (quest.objective.type === type) {
                switch (type) {
                    case 'build':
                        if (quest.objective.buildingType === 'any' || data.buildingType === quest.objective.buildingType) {
                            quest.progress++;
                            updated = true;
                        }
                        break;
                    case 'population':
                        quest.progress = this.game.resourceManager.totalPopulation;
                        updated = true;
                        break;
                    case 'categories':
                        const builtCategories = new Set();
                        this.game.buildingManager.buildings.forEach(building => {
                            const config = BUILDING_CONFIG[building.type];
                            builtCategories.add(config.category);
                        });
                        
                        quest.progress = Array.from(builtCategories).length;
                        updated = true;
                        break;
                }
                
                if (updated && quest.progress >= quest.objective.count) {
                    this.completeQuest(questId);
                }
            }
        }
        this.updateQuestDisplay();
    }
    
    completeQuest(questId) {
        const quest = this.activeQuests.get(questId);
        if (quest && !quest.completed) {
            quest.completed = true;
            this.completedQuests.add(questId);
            
            this.game.uiManager.updateResources(quest.reward);
            
            if (quest.onComplete) {
                quest.onComplete();
            }
            
            this.game.uiManager.showMessage(`Quête terminée: ${quest.title} (+${quest.reward.money}💰 +${quest.reward.materials}🔧)`, 'success');
            this.updateQuestDisplay();
        }
    }
    
    updateQuestDisplay() {
        const questPanel = document.getElementById('quest-panel');
        if (!questPanel) return;
        
        let html = '<h3>🎯 Quêtes</h3>';
        
        if (this.activeQuests.size === 0) {
            html += '<p>Aucune quête active</p>';
        } else {
            html += '<div class="quests-list">';
            this.activeQuests.forEach(quest => {
                const progress = Math.min(quest.progress, quest.objective.count);
                const percentage = (progress / quest.objective.count) * 100;
                
                html += `
                    <div class="quest-item ${quest.completed ? 'completed' : ''}">
                        <div class="quest-header">
                            <strong>${quest.title}</strong>
                            ${quest.completed ? '<span class="quest-completed">✓ Terminé</span>' : ''}
                        </div>
                        <div class="quest-description">${quest.description}</div>
                        ${!quest.completed ? `
                            <div class="quest-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${percentage}%"></div>
                                </div>
                                <span class="progress-text">${progress}/${quest.objective.count}</span>
                            </div>
                        ` : ''}
                        ${quest.completed ? `
                            <div class="quest-reward">
                                Récompense: +${quest.reward.money}💰 +${quest.reward.materials}🔧
                            </div>
                        ` : ''}
                    </div>
                `;
            });
            html += '</div>';
        }
        
        questPanel.innerHTML = html;
    }
}

// Algorithme A* optimisé avec cache
class OptimizedAStar {
    constructor(gridWidth, gridHeight) {
        this.gridWidth = gridWidth;
        this.gridHeight = gridHeight;
        this.cache = new Map();
    }

    heuristic(a, b) {
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    }

    isValidCell(x, y, grid) {
        return x >= 0 && x < this.gridWidth && 
               y >= 0 && y < this.gridHeight && 
               grid[y][x] === 0;
    }

    getNeighbors(node, grid) {
        const neighbors = [];
        const directions = [
            { x: 0, y: -1 },  { x: 1, y: 0 },   { x: 0, y: 1 },   { x: -1, y: 0 },
            { x: 1, y: -1 },  { x: 1, y: 1 },   { x: -1, y: 1 },  { x: -1, y: -1 }
        ];

        for (const dir of directions) {
            const newX = node.x + dir.x;
            const newY = node.y + dir.y;

            if (this.isValidCell(newX, newY, grid)) {
                if (Math.abs(dir.x) === 1 && Math.abs(dir.y) === 1) {
                    if (grid[node.y][newX] !== 0 || grid[newY][node.x] !== 0) {
                        continue;
                    }
                }
                neighbors.push({ x: newX, y: newY });
            }
        }

        return neighbors;
    }

    reconstructPath(cameFrom, current) {
        const path = [current];
        while (cameFrom.has(this.hashCell(current))) {
            current = cameFrom.get(this.hashCell(current));
            path.unshift(current);
        }
        return path;
    }

    hashCell(cell) {
        return `${cell.x},${cell.y}`;
    }

    getCacheKey(start, goal) {
        return `${start.x},${start.y}-${goal.x},${goal.y}`;
    }

    findPath(start, goal, grid) {
        const cacheKey = this.getCacheKey(start, goal);
        
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        const openSet = [start];
        const cameFrom = new Map();
        const gScore = new Map();
        const fScore = new Map();

        gScore.set(this.hashCell(start), 0);
        fScore.set(this.hashCell(start), this.heuristic(start, goal));

        while (openSet.length > 0) {
            let current = openSet[0];
            let currentIndex = 0;

            for (let i = 1; i < openSet.length; i++) {
                const node = openSet[i];
                const currentFScore = fScore.get(this.hashCell(current)) || Infinity;
                const nodeFScore = fScore.get(this.hashCell(node)) || Infinity;
                
                if (nodeFScore < currentFScore) {
                    current = node;
                    currentIndex = i;
                }
            }

            if (current.x === goal.x && current.y === goal.y) {
                const path = this.reconstructPath(cameFrom, current);
                this.cache.set(cacheKey, path);
                return path;
            }

            openSet.splice(currentIndex, 1);

            const neighbors = this.getNeighbors(current, grid);
            for (const neighbor of neighbors) {
                const isDiagonal = Math.abs(neighbor.x - current.x) === 1 && 
                                 Math.abs(neighbor.y - current.y) === 1;
                const moveCost = isDiagonal ? 1.4 : 1;

                const tentativeG = (gScore.get(this.hashCell(current)) || 0) + moveCost;

                if (tentativeG < (gScore.get(this.hashCell(neighbor)) || Infinity)) {
                    cameFrom.set(this.hashCell(neighbor), current);
                    gScore.set(this.hashCell(neighbor), tentativeG);
                    fScore.set(this.hashCell(neighbor), tentativeG + this.heuristic(neighbor, goal));

                    if (!openSet.some(node => node.x === neighbor.x && node.y === neighbor.y)) {
                        openSet.push(neighbor);
                    }
                }
            }
        }

        this.cache.set(cacheKey, null);
        return null;
    }

    invalidateCache() {
        this.cache.clear();
    }
}

class EntityManager {
    constructor(scene, gridSystem) {
        this.scene = scene;
        this.gridSystem = gridSystem;
        this.entities = new Map();
        this.pathfinding = new OptimizedAStar(100, 100);
        this.nextEntityId = 1;
        this.pedestrianZones = new Set();
    }

    createEntity(type = 'person', startX, startZ) {
        const entityId = `entity_${this.nextEntityId++}`;
        const worldPos = this.gridSystem.gridToWorld(startX, startZ);
        
        let mesh;
        if (type === 'person') {
            // Personnage plus détaillé
            const bodyGroup = new THREE.Group();
            
            // Corps
            const bodyGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.8, 8);
            const bodyMaterial = new THREE.MeshLambertMaterial({ 
                color: Math.random() * 0xffffff 
            });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.position.y = 0.4;
            bodyGroup.add(body);
            
            // Tête
            const headGeometry = new THREE.SphereGeometry(0.12, 8, 8);
            const headMaterial = new THREE.MeshLambertMaterial({ 
                color: 0xFFD700 
            });
            const head = new THREE.Mesh(headGeometry, headMaterial);
            head.position.y = 0.9;
            bodyGroup.add(head);
            
            // Bras
            const armGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.4, 6);
            const armMaterial = new THREE.MeshLambertMaterial({ 
                color: bodyMaterial.color 
            });
            
            const leftArm = new THREE.Mesh(armGeometry, armMaterial);
            leftArm.position.set(-0.2, 0.4, 0);
            leftArm.rotation.z = Math.PI / 4;
            bodyGroup.add(leftArm);
            
            const rightArm = new THREE.Mesh(armGeometry, armMaterial);
            rightArm.position.set(0.2, 0.4, 0);
            rightArm.rotation.z = -Math.PI / 4;
            bodyGroup.add(rightArm);

            mesh = bodyGroup;
        } else if (type === 'vehicle') {
            const bodyGeometry = new THREE.BoxGeometry(0.8, 0.4, 1.2);
            const bodyMaterial = new THREE.MeshLambertMaterial({ 
                color: 0xFF0000 
            });
            mesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
        }

        mesh.position.set(worldPos.x, 0.5, worldPos.z);
        mesh.castShadow = true;
        this.scene.add(mesh);

        const entity = {
            id: entityId,
            type: type,
            mesh: mesh,
            gridPosition: { x: startX, z: startZ },
            path: [],
            currentTargetIndex: 0,
            speed: type === 'person' ? 0.015 : 0.04,
            state: 'idle',
            color: type === 'person' ? bodyMaterial.color.getHex() : 0xFF0000,
            destination: null,
            isWorking: false
        };

        this.entities.set(entityId, entity);
        return entityId;
    }

    moveEntity(entityId, targetX, targetZ) {
        const entity = this.entities.get(entityId);
        if (!entity) return false;

        const start = { x: entity.gridPosition.x, y: entity.gridPosition.z };
        const goal = { x: targetX, y: targetZ };

        const grid = this.createNavigationGrid();
        const path = this.pathfinding.findPath(start, goal, grid);
        
        if (path && path.length > 0) {
            entity.path = path;
            entity.currentTargetIndex = 0;
            entity.state = 'moving';
            entity.destination = { x: targetX, z: targetZ };
            return true;
        } else {
            console.warn(`Aucun chemin trouvé pour l'entité ${entityId}`);
            return false;
        }
    }

    createNavigationGrid() {
        const gridSize = 100;
        const grid = Array(gridSize).fill().map(() => Array(gridSize).fill(1)); // 1 = bloqué par défaut

        for (let x = 0; x < gridSize; x++) {
            for (let z = 0; z < gridSize; z++) {
                const building = this.gridSystem.getBuildingAt(x, z);
                if (building) {
                    const config = BUILDING_CONFIG[building.type];
                    // Les personnages peuvent marcher sur les routes, trottoirs et parcs
                    if (config.production.walkable || config.production.pedestrian || config.production.infrastructure) {
                        grid[z][x] = 0; // 0 = navigable
                    } else {
                        grid[z][x] = 1; // 1 = bloqué
                    }
                } else {
                    // Cases vides = navigables
                    grid[z][x] = 0;
                }
            }
        }

        return grid;
    }

    update() {
        for (const [entityId, entity] of this.entities) {
            if (entity.state === 'moving' && entity.path.length > 0) {
                this.updateEntityMovement(entity);
            } else if (entity.state === 'idle') {
                this.assignRandomDestination(entity);
            }
        }
    }

    assignRandomDestination(entity) {
        // 20% de chance de se déplacer aléatoirement
        if (Math.random() < 0.002) {
            const gridSize = 20;
            const targetX = Math.floor(Math.random() * gridSize) - gridSize/2;
            const targetZ = Math.floor(Math.random() * gridSize) - gridSize/2;
            
            this.moveEntity(entity.id, targetX, targetZ);
        }
    }

    updateEntityMovement(entity) {
        if (entity.currentTargetIndex >= entity.path.length) {
            entity.state = 'arrived';
            
            // Si c'est un travailleur, le faire "travailler" pendant un moment
            if (entity.isWorking) {
                entity.state = 'working';
                setTimeout(() => {
                    entity.state = 'idle';
                    entity.isWorking = false;
                }, 5000); // Travaille pendant 5 secondes
            }
            return;
        }

        const targetNode = entity.path[entity.currentTargetIndex];
        const targetWorldPos = this.gridSystem.gridToWorld(targetNode.x, targetNode.y);
        const currentPos = entity.mesh.position;

        const dx = targetWorldPos.x - currentPos.x;
        const dz = targetWorldPos.z - currentPos.z;
        const distance = Math.sqrt(dx * dx + dz * dz);

        if (distance < entity.speed) {
            entity.currentTargetIndex++;
            entity.gridPosition = { x: targetNode.x, z: targetNode.y };
            
            if (entity.currentTargetIndex >= entity.path.length) {
                entity.state = 'arrived';
                console.log(`Entité ${entity.id} arrivée à destination`);
            }
        } else {
            const moveX = (dx / distance) * entity.speed;
            const moveZ = (dz / distance) * entity.speed;

            entity.mesh.position.x += moveX;
            entity.mesh.position.z += moveZ;

            if (distance > 0.1) {
                entity.mesh.lookAt(
                    currentPos.x + dx,
                    currentPos.y,
                    currentPos.z + dz
                );
            }

            if (entity.type === 'person') {
                this.animateWalking(entity, distance);
            }
        }
    }

    animateWalking(entity, distance) {
        const time = Date.now() * 0.01;
        const bounce = Math.sin(time * 10) * 0.05;
        entity.mesh.position.y = 0.5 + bounce;
        
        // Animation des bras
        if (entity.mesh.children.length > 2) {
            const leftArm = entity.mesh.children[2];
            const rightArm = entity.mesh.children[3];
            leftArm.rotation.z = Math.PI / 4 + Math.sin(time * 10) * 0.3;
            rightArm.rotation.z = -Math.PI / 4 + Math.sin(time * 10 + Math.PI) * 0.3;
        }
    }

    removeEntity(entityId) {
        const entity = this.entities.get(entityId);
        if (entity) {
            this.scene.remove(entity.mesh);
            this.entities.delete(entityId);
        }
    }

    getEntityPosition(entityId) {
        const entity = this.entities.get(entityId);
        return entity ? entity.gridPosition : null;
    }

    getEntityState(entityId) {
        const entity = this.entities.get(entityId);
        return entity ? entity.state : null;
    }

    createEntityGroup(count, startArea) {
        const entities = [];
        for (let i = 0; i < count; i++) {
            const x = startArea.x + Math.floor(Math.random() * startArea.width);
            const z = startArea.z + Math.floor(Math.random() * startArea.depth);
            const entityId = this.createEntity('person', x, z);
            entities.push(entityId);
        }
        return entities;
    }

    assignWorkersToBuildings(buildingManager) {
        let workersAssigned = 0;
        
        buildingManager.buildings.forEach(building => {
            const config = BUILDING_CONFIG[building.type];
            if (config.production.jobs && !building.workersAssigned) {
                // Assigner des travailleurs à ce bâtiment
                const workersNeeded = config.production.jobs;
                const availableWorkers = Array.from(this.entities.values())
                    .filter(e => e.type === 'person' && !e.isWorking && e.state === 'idle')
                    .slice(0, workersNeeded);
                
                availableWorkers.forEach(worker => {
                    worker.isWorking = true;
                    this.moveEntity(worker.id, building.x, building.z);
                    workersAssigned++;
                });
                
                building.workersAssigned = true;
            }
        });
        
        return workersAssigned;
    }
}

class AdvancedCameraController {
    constructor(camera, domElement) {
        this.camera = camera;
        this.domElement = domElement;
        
        this.state = 'NONE';
        this.previousMousePosition = { x: 0, y: 0 };
        
        this.rotateSpeed = 0.005;
        this.panSpeed = 0.01;
        this.zoomSpeed = 0.001;
        
        this.target = new THREE.Vector3(0, 0, 0);
        this.distance = 50;
        this.phi = Math.PI / 4;
        this.theta = Math.PI / 3;
        
        this.minDistance = 10;
        this.maxDistance = 200;
        this.minTheta = 0.1;
        this.maxTheta = Math.PI / 2 - 0.1;
        
        this.initEventListeners();
        this.updateCameraPosition();
    }

    initEventListeners() {
        this.domElement.addEventListener('mousedown', (e) => {
            e.preventDefault();
            
            if (e.button === 0) {
                this.state = 'ROTATE';
                this.domElement.style.cursor = 'grabbing';
            } else if (e.button === 2) {
                this.state = 'PAN';
                this.domElement.style.cursor = 'move';
            }
            
            this.previousMousePosition = { x: e.clientX, y: e.clientY };
        });

        this.domElement.addEventListener('mousemove', (e) => {
            e.preventDefault();
            
            const deltaX = e.clientX - this.previousMousePosition.x;
            const deltaY = e.clientY - this.previousMousePosition.y;

            if (this.state === 'ROTATE') {
                this.handleRotation(deltaX, deltaY);
            } else if (this.state === 'PAN') {
                this.handlePan(deltaX, deltaY);
            }

            this.previousMousePosition = { x: e.clientX, y: e.clientY };
        });

        this.domElement.addEventListener('mouseup', (e) => {
            e.preventDefault();
            this.state = 'NONE';
            this.domElement.style.cursor = 'grab';
        });

        this.domElement.addEventListener('mouseleave', () => {
            this.state = 'NONE';
            this.domElement.style.cursor = 'grab';
        });

        this.domElement.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        this.domElement.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.handleZoom(e);
        });

        this.domElement.style.cursor = 'grab';
    }

    handleRotation(deltaX, deltaY) {
        this.phi -= deltaX * this.rotateSpeed;
        this.theta -= deltaY * this.rotateSpeed;
        
        this.theta = Math.max(this.minTheta, Math.min(this.maxTheta, this.theta));
        this.updateCameraPosition();
    }

    handlePan(deltaX, deltaY) {
        const right = new THREE.Vector3(
            Math.cos(this.phi),
            0,
            Math.sin(this.phi)
        ).normalize();
        
        const forward = new THREE.Vector3(
            Math.sin(this.phi),
            0,
            -Math.cos(this.phi)
        ).normalize();

        this.target.add(right.multiplyScalar(-deltaX * this.panSpeed));
        this.target.add(forward.multiplyScalar(-deltaY * this.panSpeed));
        
        const limit = 100;
        this.target.x = Math.max(-limit, Math.min(limit, this.target.x));
        this.target.z = Math.max(-limit, Math.min(limit, this.target.z));
        
        this.updateCameraPosition();
    }

    handleZoom(e) {
        const zoomAmount = e.deltaY * this.zoomSpeed;
        this.distance += this.distance * zoomAmount;
        this.distance = Math.max(this.minDistance, Math.min(this.maxDistance, this.distance));
        this.updateCameraPosition();
    }

    updateCameraPosition() {
        const x = this.distance * Math.sin(this.theta) * Math.cos(this.phi);
        const y = this.distance * Math.cos(this.theta);
        const z = this.distance * Math.sin(this.theta) * Math.sin(this.phi);
        
        this.camera.position.set(
            this.target.x + x,
            this.target.y + y,
            this.target.z + z
        );
        
        this.camera.lookAt(this.target);
    }

    update() {
        // Pour les animations continues
    }
}

class GridSystem {
    constructor(size, cellSize) {
        this.size = size;
        this.cellSize = cellSize;
        this.occupiedCells = new Map();
        this.snapToGrid = true;
    }

    worldToGrid(worldX, worldZ) {
        if (this.snapToGrid) {
            const gridX = Math.round(worldX / this.cellSize);
            const gridZ = Math.round(worldZ / this.cellSize);
            return { x: gridX, z: gridZ };
        } else {
            return { x: worldX, z: worldZ };
        }
    }

    gridToWorld(gridX, gridZ) {
        if (this.snapToGrid) {
            return { 
                x: gridX * this.cellSize, 
                z: gridZ * this.cellSize 
            };
        } else {
            return { x: gridX, z: gridZ };
        }
    }

    isCellOccupied(x, z, width = 1, depth = 1) {
        for (let dx = 0; dx < width; dx++) {
            for (let dz = 0; dz < depth; dz++) {
                if (this.occupiedCells.has(`${x + dx},${z + dz}`)) {
                    return true;
                }
            }
        }
        return false;
    }

    occupyCell(x, z, buildingData, width = 1, depth = 1) {
        for (let dx = 0; dx < width; dx++) {
            for (let dz = 0; dz < depth; dz++) {
                this.occupiedCells.set(`${x + dx},${z + dz}`, buildingData);
            }
        }
    }

    freeCell(x, z, width = 1, depth = 1) {
        for (let dx = 0; dx < width; dx++) {
            for (let dz = 0; dz < depth; dz++) {
                this.occupiedCells.delete(`${x + dx},${z + dz}`);
            }
        }
    }

    isValidPosition(x, z, width = 1, depth = 1) {
        return !this.isCellOccupied(x, z, width, depth);
    }

    getBuildingAt(x, z) {
        return this.occupiedCells.get(`${x},${z}`);
    }

    isCellWalkable(x, z) {
        const building = this.getBuildingAt(x, z);
        if (!building) return true;
        
        const config = BUILDING_CONFIG[building.type];
        return config.production.walkable === true || config.production.pedestrian === true;
    }

    isCellPedestrian(x, z) {
        const building = this.getBuildingAt(x, z);
        if (!building) return false;
        
        const config = BUILDING_CONFIG[building.type];
        return config.production.pedestrian === true;
    }
}

class BuildingManager {
    constructor(scene, gridSystem, socket, uiManager, textureManager) {
        this.scene = scene;
        this.gridSystem = gridSystem;
        this.socket = socket;
        this.uiManager = uiManager;
        this.textureManager = textureManager;
        this.buildings = new Map();
        this.previewMesh = null;
        this.selectedBuildingType = null;
        this.editMode = false;
        this.buildingToEdit = null;
        this.selectionBox = null;
        this.movingBuilding = null;
        
        this.geometryCache = new Map();
        this.materialCache = new Map();
    }

    setSelectedBuilding(type) {
        this.selectedBuildingType = type;
        this.editMode = false;
        this.buildingToEdit = null;
        this.movingBuilding = null;
        this.hideSelectionBox();
        this.showPreview(0, 0, type);
    }

    clearSelection() {
        this.selectedBuildingType = null;
        this.editMode = false;
        this.buildingToEdit = null;
        this.movingBuilding = null;
        this.hidePreview();
        this.hideSelectionBox();
    }

    createEnhancedBuildingMesh(x, z, type) {
        const config = BUILDING_CONFIG[type];
        const buildingGroup = new THREE.Group();

        // Structure principale avec texture
        const geometryKey = `main_${config.width}_${config.height}_${config.depth}`;
        let geometry = this.geometryCache.get(geometryKey);
        if (!geometry) {
            geometry = new THREE.BoxGeometry(config.width, config.height, config.depth);
            this.geometryCache.set(geometryKey, geometry);
        }
        
        const material = this.textureManager.getMaterial(config.texture, config.color);
        const mainMesh = new THREE.Mesh(geometry, material);
        mainMesh.position.y = config.height / 2;
        mainMesh.castShadow = true;
        mainMesh.receiveShadow = true;
        buildingGroup.add(mainMesh);

        // Détails spécifiques selon le type de bâtiment
        switch(type) {
            case 'villa':
                this.createVillaDetails(buildingGroup, config);
                break;
            case 'studio':
                this.createStudioDetails(buildingGroup, config);
                break;
            case 'apartment':
            case 'residential_complex':
                this.createApartmentDetails(buildingGroup, config, type);
                break;
            case 'factory':
                this.createFactoryDetails(buildingGroup, config);
                break;
            case 'powerplant':
                this.createPowerplantDetails(buildingGroup, config);
                break;
            case 'water_plant':
                this.createWaterPlantDetails(buildingGroup, config);
                break;
            case 'supermarket':
            case 'mall':
                this.createCommercialDetails(buildingGroup, config, type);
                break;
            case 'bakery':
            case 'restaurant':
                this.createSmallCommercialDetails(buildingGroup, config, type);
                break;
            case 'school':
            case 'high_school':
            case 'university':
                this.createEducationDetails(buildingGroup, config, type);
                break;
            case 'library':
                this.createLibraryDetails(buildingGroup, config);
                break;
            case 'hospital':
                this.createHospitalDetails(buildingGroup, config);
                break;
            case 'police_station':
                this.createPoliceStationDetails(buildingGroup, config);
                break;
            case 'road':
                this.createRoadDetails(buildingGroup, config);
                break;
            case 'sidewalk':
                this.createSidewalkDetails(buildingGroup, config);
                break;
            case 'park':
                this.createParkDetails(buildingGroup, config);
                break;
        }

        // Éléments communs
        this.createCommonDetails(buildingGroup, config, type);

        buildingGroup.position.set(x, 0, z);
        buildingGroup.castShadow = true;
        buildingGroup.receiveShadow = true;
        buildingGroup.userData = { buildingType: type, isBuilding: true };

        return buildingGroup;
    }

    createVillaDetails(buildingGroup, config) {
        // Toit
        const roofGeometry = new THREE.ConeGeometry(config.width * 0.8, config.roofHeight, 4);
        const roofMaterial = this.textureManager.getMaterial('brick', 0x8B0000);
        const roofMesh = new THREE.Mesh(roofGeometry, roofMaterial);
        roofMesh.position.y = config.height + config.roofHeight / 2;
        roofMesh.rotation.y = Math.PI / 4;
        buildingGroup.add(roofMesh);
        
        // Piscine
        const poolGeometry = new THREE.BoxGeometry(2, 0.5, 3);
        const poolMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x00BFFF,
            transparent: true,
            opacity: 0.8
        });
        const poolMesh = new THREE.Mesh(poolGeometry, poolMaterial);
        poolMesh.position.set(-1, 0.25, -1);
        buildingGroup.add(poolMesh);
        
        // Jardin avec arbres
        this.createGarden(buildingGroup, config);
    }

    createStudioDetails(buildingGroup, config) {
        const roofGeometry = new THREE.ConeGeometry(config.width * 0.7, config.roofHeight, 4);
        const roofMaterial = this.textureManager.getMaterial('brick', 0xA52A2A);
        const roofMesh = new THREE.Mesh(roofGeometry, roofMaterial);
        roofMesh.position.y = config.height + config.roofHeight / 2;
        roofMesh.rotation.y = Math.PI / 4;
        buildingGroup.add(roofMesh);
    }

    createApartmentDetails(buildingGroup, config, type) {
        const floors = config.floors || 4;
        
        // Toit plat pour immeuble
        const roofGeometry = new THREE.BoxGeometry(config.width + 0.2, 0.5, config.depth + 0.2);
        const roofMaterial = this.textureManager.getMaterial('concrete', 0x444444);
        const roofMesh = new THREE.Mesh(roofGeometry, roofMaterial);
        roofMesh.position.y = config.height + 0.25;
        buildingGroup.add(roofMesh);

        // Balcons pour chaque étage
        for (let floor = 1; floor <= floors; floor++) {
            const balconyGeometry = new THREE.BoxGeometry(config.width + 0.4, 0.1, 1);
            const balconyMaterial = this.textureManager.getMaterial('concrete', 0x666666);
            const balconyMesh = new THREE.Mesh(balconyGeometry, balconyMaterial);
            balconyMesh.position.set(0, floor * (config.height / floors) - 1, config.depth / 2 + 0.5);
            buildingGroup.add(balconyMesh);
        }

        // Fenêtres détaillées
        for (let floor = 0; floor < floors; floor++) {
            for (let i = -1; i <= 1; i += 2) {
                this.createWindow(buildingGroup, config, i * (config.width / 2 - 0.3), 
                                floor * (config.height / floors) + 1.5, 
                                config.depth / 2 + 0.1);
            }
        }
    }

    createFactoryDetails(buildingGroup, config) {
        // Cheminées
        const chimneyGeometry = new THREE.CylinderGeometry(0.3, 0.5, 6, 8);
        const chimneyMaterial = this.textureManager.getMaterial('industrial', 0x222222);
        const chimneyMesh = new THREE.Mesh(chimneyGeometry, chimneyMaterial);
        chimneyMesh.position.set(2, config.height + 3, 1);
        buildingGroup.add(chimneyMesh);

        // Réservoirs
        const tankGeometry = new THREE.CylinderGeometry(1, 1, 3, 16);
        const tankMaterial = this.textureManager.getMaterial('industrial', 0x888888);
        const tankMesh = new THREE.Mesh(tankGeometry, tankMaterial);
        tankMesh.position.set(-2, 1.5, -2);
        buildingGroup.add(tankMesh);
    }

    createPowerplantDetails(buildingGroup, config) {
        const bigChimneyGeometry = new THREE.CylinderGeometry(1, 2, config.chimneyHeight, 16);
        const bigChimneyMaterial = this.textureManager.getMaterial('industrial', 0x333333);
        const bigChimneyMesh = new THREE.Mesh(bigChimneyGeometry, bigChimneyMaterial);
        bigChimneyMesh.position.set(3, config.chimneyHeight / 2, 2);
        buildingGroup.add(bigChimneyMesh);

        const coolingTowerGeometry = new THREE.CylinderGeometry(1.5, 2, 8, 16);
        const coolingTowerMaterial = this.textureManager.getMaterial('industrial', 0x555555);
        const coolingTowerMesh = new THREE.Mesh(coolingTowerGeometry, coolingTowerMaterial);
        coolingTowerMesh.position.set(-2, 4, -2);
        buildingGroup.add(coolingTowerMesh);
    }

    createWaterPlantDetails(buildingGroup, config) {
        const waterTowerGeometry = new THREE.SphereGeometry(2, 16, 16);
        const waterTowerMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x87CEEB,
            transparent: true,
            opacity: 0.8
        });
        const waterTowerMesh = new THREE.Mesh(waterTowerGeometry, waterTowerMaterial);
        waterTowerMesh.position.set(0, config.height + 2, 0);
        buildingGroup.add(waterTowerMesh);
    }

    createCommercialDetails(buildingGroup, config, type) {
        const signGeometry = new THREE.BoxGeometry(config.width * 0.8, 1, 0.2);
        const signMaterial = new THREE.MeshLambertMaterial({ color: 0xFFD700 });
        const signMesh = new THREE.Mesh(signGeometry, signMaterial);
        signMesh.position.set(0, config.height + 0.5, config.depth / 2 + 0.1);
        buildingGroup.add(signMesh);

        // Parkings
        this.createParkingLot(buildingGroup, config);
    }

    createSmallCommercialDetails(buildingGroup, config, type) {
        if (type === 'bakery') {
            const bakeryChimneyGeometry = new THREE.CylinderGeometry(0.2, 0.3, 2, 8);
            const bakeryChimneyMaterial = this.textureManager.getMaterial('brick', 0x8B4513);
            const bakeryChimneyMesh = new THREE.Mesh(bakeryChimneyGeometry, bakeryChimneyMaterial);
            bakeryChimneyMesh.position.set(1, config.height + 1, 1);
            buildingGroup.add(bakeryChimneyMesh);
        }
    }

    createEducationDetails(buildingGroup, config, type) {
        const schoolRoofGeometry = new THREE.ConeGeometry(config.width * 0.9, config.roofHeight, 4);
        const schoolRoofMaterial = this.textureManager.getMaterial('brick', 0x8B0000);
        const schoolRoofMesh = new THREE.Mesh(schoolRoofGeometry, schoolRoofMaterial);
        schoolRoofMesh.position.y = config.height + config.roofHeight / 2;
        schoolRoofMesh.rotation.y = Math.PI / 4;
        buildingGroup.add(schoolRoofMesh);

        if (type === 'university') {
            const bellTowerGeometry = new THREE.BoxGeometry(1, 6, 1);
            const bellTowerMaterial = this.textureManager.getMaterial('brick', 0x8B4513);
            const bellTowerMesh = new THREE.Mesh(bellTowerGeometry, bellTowerMaterial);
            bellTowerMesh.position.set(4, config.height + 3, 4);
            buildingGroup.add(bellTowerMesh);
        }

        // Terrain de sport pour les écoles
        if (type !== 'library') {
            this.createSportsField(buildingGroup, config);
        }
    }

    createLibraryDetails(buildingGroup, config) {
        const columnsGeometry = new THREE.CylinderGeometry(0.3, 0.3, config.height, 8);
        const columnsMaterial = this.textureManager.getMaterial('brick', 0x8B4513);
        
        const leftColumn = new THREE.Mesh(columnsGeometry, columnsMaterial);
        leftColumn.position.set(-config.width/2 + 0.5, config.height/2, config.depth/2 - 0.5);
        buildingGroup.add(leftColumn);
        
        const rightColumn = new THREE.Mesh(columnsGeometry, columnsMaterial);
        rightColumn.position.set(config.width/2 - 0.5, config.height/2, config.depth/2 - 0.5);
        buildingGroup.add(rightColumn);
    }

    createHospitalDetails(buildingGroup, config) {
        const crossGeometry = new THREE.BoxGeometry(0.5, 3, 0.1);
        const crossMaterial = new THREE.MeshLambertMaterial({ color: 0xFF0000 });
        const crossMesh = new THREE.Mesh(crossGeometry, crossMaterial);
        crossMesh.position.set(0, config.height + 1.5, config.depth / 2 + 0.1);
        buildingGroup.add(crossMesh);

        // Héliport sur le toit
        const helipadGeometry = new THREE.CylinderGeometry(1.5, 1.5, 0.1, 16);
        const helipadMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
        const helipadMesh = new THREE.Mesh(helipadGeometry, helipadMaterial);
        helipadMesh.position.set(0, config.height + 0.05, 0);
        buildingGroup.add(helipadMesh);
    }

    createPoliceStationDetails(buildingGroup, config) {
        const beaconGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.5, 8);
        const beaconMaterial = new THREE.MeshLambertMaterial({ color: 0x0000FF });
        const beaconMesh = new THREE.Mesh(beaconGeometry, beaconMaterial);
        beaconMesh.position.set(0, config.height + 0.25, 0);
        buildingGroup.add(beaconMesh);
    }

    createRoadDetails(buildingGroup, config) {
        // Marques routières
        const lineGeometry = new THREE.BoxGeometry(config.width * 0.8, 0.05, 0.2);
        const lineMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFF00 });
        const lineMesh = new THREE.Mesh(lineGeometry, lineMaterial);
        lineMesh.position.set(0, 0.15, 0);
        buildingGroup.add(lineMesh);
    }

    createSidewalkDetails(buildingGroup, config) {
        // Bordures de trottoir
        const curbGeometry = new THREE.BoxGeometry(config.width + 0.1, 0.2, 0.1);
        const curbMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
        
        const frontCurb = new THREE.Mesh(curbGeometry, curbMaterial);
        frontCurb.position.set(0, 0.1, config.depth/2 - 0.05);
        buildingGroup.add(frontCurb);
        
        const backCurb = new THREE.Mesh(curbGeometry, curbMaterial);
        backCurb.position.set(0, 0.1, -config.depth/2 + 0.05);
        buildingGroup.add(backCurb);
    }

    createParkDetails(buildingGroup, config) {
        // Arbres
        for (let i = 0; i < 5; i++) {
            this.createTree(buildingGroup, 
                (Math.random() - 0.5) * (config.width - 2),
                (Math.random() - 0.5) * (config.depth - 2)
            );
        }

        // Bancs de parc
        for (let i = 0; i < 3; i++) {
            this.createParkBench(buildingGroup,
                (Math.random() - 0.5) * (config.width - 3),
                (Math.random() - 0.5) * (config.depth - 3)
            );
        }
    }

    createCommonDetails(buildingGroup, config, type) {
        // Portes pour les bâtiments appropriés
        if (['villa', 'studio', 'apartment', 'residential_complex', 'supermarket', 'mall', 'bakery', 'restaurant', 
             'school', 'high_school', 'university', 'library', 'hospital', 'police_station'].includes(type)) {
            this.createDoor(buildingGroup, config);
        }

        // Fenêtres pour les bâtiments non-infrastructure
        if (!['road', 'sidewalk', 'park'].includes(type)) {
            for (let i = -1; i <= 1; i += 2) {
                this.createWindow(buildingGroup, config, 
                    i * (config.width / 2 - 0.2), 
                    1.5, 
                    config.depth / 2 + 0.1
                );
            }
        }
    }

    createWindow(buildingGroup, config, x, y, z) {
        const windowGeometry = new THREE.PlaneGeometry(0.5, 0.8);
        const windowMaterial = this.textureManager.getMaterial('glass');
        const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
        windowMesh.position.set(x, y, z);
        windowMesh.rotation.y = Math.PI;
        buildingGroup.add(windowMesh);
    }

    createDoor(buildingGroup, config) {
        const doorGeometry = new THREE.PlaneGeometry(1, 2);
        const doorMaterial = this.textureManager.getMaterial('brick', 0x8B4513);
        const doorMesh = new THREE.Mesh(doorGeometry, doorMaterial);
        doorMesh.position.set(0, 1, config.depth / 2 + 0.1);
        doorMesh.rotation.y = Math.PI;
        buildingGroup.add(doorMesh);
    }

    createGarden(buildingGroup, config) {
        for (let i = 0; i < 3; i++) {
            this.createTree(buildingGroup,
                (Math.random() - 0.5) * (config.width - 3),
                (Math.random() - 0.5) * (config.depth - 3)
            );
        }
    }

    createTree(buildingGroup, x, z) {
        const treeGroup = new THREE.Group();
        
        // Tronc
        const trunkGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1.5, 8);
        const trunkMaterial = this.textureManager.getMaterial('brick', 0x8B4513);
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        treeGroup.add(trunk);
        
        // Feuillage
        const foliageGeometry = new THREE.SphereGeometry(0.8, 8, 8);
        const foliageMaterial = this.textureManager.getMaterial('grass', 0x228B22);
        const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
        foliage.position.y = 1.2;
        treeGroup.add(foliage);
        
        treeGroup.position.set(x, 0.75, z);
        buildingGroup.add(treeGroup);
    }

    createParkBench(buildingGroup, x, z) {
        const benchGroup = new THREE.Group();
        
        // Siège
        const seatGeometry = new THREE.BoxGeometry(1.5, 0.1, 0.4);
        const seatMaterial = this.textureManager.getMaterial('brick', 0x8B4513);
        const seat = new THREE.Mesh(seatGeometry, seatMaterial);
        seat.position.y = 0.5;
        benchGroup.add(seat);
        
        // Dossiers
        const backGeometry = new THREE.BoxGeometry(1.5, 0.8, 0.1);
        const back = new THREE.Mesh(backGeometry, seatMaterial);
        back.position.set(0, 0.9, -0.15);
        benchGroup.add(back);
        
        // Pieds
        const legGeometry = new THREE.BoxGeometry(0.1, 0.5, 0.1);
        for (let i = -0.6; i <= 0.6; i += 1.2) {
            const leg = new THREE.Mesh(legGeometry, seatMaterial);
            leg.position.set(i, 0.25, 0.15);
            benchGroup.add(leg);
        }
        
        benchGroup.position.set(x, 0, z);
        buildingGroup.add(benchGroup);
    }

    createParkingLot(buildingGroup, config) {
        const parkingGroup = new THREE.Group();
        
        // Places de parking
        const spotGeometry = new THREE.BoxGeometry(2.5, 0.05, 5);
        const spotMaterial = this.textureManager.getMaterial('asphalt', 0x444444);
        
        for (let i = -1; i <= 1; i++) {
            const spot = new THREE.Mesh(spotGeometry, spotMaterial);
            spot.position.set(i * 3, 0.025, -config.depth/2 - 2.5);
            parkingGroup.add(spot);
        }
        
        buildingGroup.add(parkingGroup);
    }

    createSportsField(buildingGroup, config) {
        const fieldGeometry = new THREE.BoxGeometry(config.width * 0.6, 0.1, config.depth * 0.4);
        const fieldMaterial = this.textureManager.getMaterial('grass', 0x32CD32);
        const field = new THREE.Mesh(fieldGeometry, fieldMaterial);
        field.position.set(0, 0.05, -config.depth/2 + 1);
        buildingGroup.add(field);
    }

    createBuildingMesh(x, z, type) {
        return this.createEnhancedBuildingMesh(x, z, type);
    }

    showPreview(x, z, type) {
        this.hidePreview();
        if (!type) return;

        const config = BUILDING_CONFIG[type];
        const worldPos = this.gridSystem.gridToWorld(x, z);
        const isValid = this.gridSystem.isValidPosition(x, z, config.width / this.gridSystem.cellSize, config.depth / this.gridSystem.cellSize);
        const canAfford = this.canAffordBuilding(type);

        this.previewMesh = this.createBuildingMesh(worldPos.x, worldPos.z, type);
        
        this.previewMesh.traverse((child) => {
            if (child.isMesh) {
                child.material.transparent = true;
                child.material.opacity = 0.6;
                if (!isValid || !canAfford) {
                    child.material.color.setHex(0xff0000);
                }
            }
        });

        this.scene.add(this.previewMesh);
    }

    hidePreview() {
        if (this.previewMesh) {
            this.scene.remove(this.previewMesh);
            this.previewMesh = null;
        }
    }

    updatePreview(x, z) {
        if (this.selectedBuildingType && this.previewMesh) {
            const config = BUILDING_CONFIG[this.selectedBuildingType];
            const worldPos = this.gridSystem.gridToWorld(x, z);
            const isValid = this.gridSystem.isValidPosition(x, z, config.width / this.gridSystem.cellSize, config.depth / this.gridSystem.cellSize);
            const canAfford = this.canAffordBuilding(this.selectedBuildingType);

            this.previewMesh.position.set(worldPos.x, 0, worldPos.z);
            
            this.previewMesh.traverse((child) => {
                if (child.isMesh) {
                    if (!isValid || !canAfford) {
                        child.material.color.setHex(0xff0000);
                    } else {
                        child.material.color.setHex(BUILDING_CONFIG[this.selectedBuildingType].color);
                    }
                }
            });
        }
    }

    canAffordBuilding(type) {
        const config = BUILDING_CONFIG[type];
        const currentResources = this.uiManager.resources;
        return currentResources.money >= config.cost.money && 
               currentResources.materials >= config.cost.materials;
    }

    deductBuildingCost(type) {
        const config = BUILDING_CONFIG[type];
        const newResources = {
            money: this.uiManager.resources.money - config.cost.money,
            materials: this.uiManager.resources.materials - config.cost.materials
        };
        this.uiManager.updateResources(newResources);
    }

    placeBuilding(x, z, type, playerId) {
        const config = BUILDING_CONFIG[type];
        const gridWidth = Math.ceil(config.width / this.gridSystem.cellSize);
        const gridDepth = Math.ceil(config.depth / this.gridSystem.cellSize);

        if (!this.gridSystem.isValidPosition(x, z, gridWidth, gridDepth)) {
            throw new Error('Emplacement déjà occupé ou invalide');
        }

        if (!this.canAffordBuilding(type)) {
            throw new Error('Ressources insuffisantes pour construire ce bâtiment');
        }

        const worldPos = this.gridSystem.gridToWorld(x, z);
        const buildingMesh = this.createBuildingMesh(worldPos.x, worldPos.z, type);
        
        const buildingData = {
            id: `${playerId}_${Date.now()}`,
            type: type,
            x: x,
            z: z,
            gridWidth: gridWidth,
            gridDepth: gridDepth,
            playerId: playerId,
            mesh: buildingMesh,
            workersAssigned: false
        };

        this.deductBuildingCost(type);

        this.gridSystem.occupyCell(x, z, buildingData, gridWidth, gridDepth);
        this.buildings.set(buildingData.id, buildingData);
        this.scene.add(buildingMesh);

        // Mettre à jour les quêtes
        if (this.uiManager.game && this.uiManager.game.questManager) {
            this.uiManager.game.questManager.updateQuestProgress('build', {
                buildingType: type
            });
        }

        // Mettre à jour les statistiques de ressources
        if (this.uiManager.game && this.uiManager.game.resourceManager) {
            this.uiManager.game.resourceManager.calculateEmployment();
            this.uiManager.game.resourceManager.calculatePopulation();
        }

        this.socket.emit('placeBuilding', {
            x: x,
            z: z,
            type: type,
            playerId: playerId,
            gridWidth: gridWidth,
            gridDepth: gridDepth
        });

        return buildingData;
    }

    removeBuilding(buildingId) {
        const building = this.buildings.get(buildingId);
        if (building) {
            this.scene.remove(building.mesh);
            this.gridSystem.freeCell(building.x, building.z, building.gridWidth, building.gridDepth);
            this.buildings.delete(buildingId);
            
            // Mettre à jour les statistiques
            if (this.uiManager.game && this.uiManager.game.resourceManager) {
                this.uiManager.game.resourceManager.calculateEmployment();
                this.uiManager.game.resourceManager.calculatePopulation();
            }
            
            this.socket.emit('removeBuilding', {
                buildingId: buildingId,
                playerId: building.playerId
            });
        }
    }

    startEditBuilding(buildingId) {
        const building = this.buildings.get(buildingId);
        if (building) {
            this.editMode = true;
            this.buildingToEdit = building;
            this.selectedBuildingType = null;
            this.movingBuilding = null;
            this.hidePreview();
            this.showSelectionBox(building);
            
            const event = new CustomEvent('buildingEditStarted', { 
                detail: { building: building } 
            });
            document.dispatchEvent(event);
            
            return true;
        }
        return false;
    }

    startMoveBuilding(buildingId) {
        const building = this.buildings.get(buildingId);
        if (building) {
            this.movingBuilding = building;
            this.editMode = true;
            this.buildingToEdit = building;
            this.selectedBuildingType = building.type;
            this.hideSelectionBox();
            this.showPreview(building.x, building.z, building.type);
            
            return true;
        }
        return false;
    }

    showSelectionBox(building) {
        this.hideSelectionBox();
        
        const config = BUILDING_CONFIG[building.type];
        const worldPos = this.gridSystem.gridToWorld(building.x, building.z);
        
        const geometry = new THREE.BoxGeometry(config.width + 0.5, config.height + 0.5, config.depth + 0.5);
        const material = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            wireframe: true,
            transparent: true,
            opacity: 0.8
        });
        
        this.selectionBox = new THREE.Mesh(geometry, material);
        this.selectionBox.position.set(worldPos.x, config.height / 2, worldPos.z);
        this.scene.add(this.selectionBox);
    }

    hideSelectionBox() {
        if (this.selectionBox) {
            this.scene.remove(this.selectionBox);
            this.selectionBox = null;
        }
    }

    moveBuilding(buildingId, newX, newZ) {
        const building = this.buildings.get(buildingId);
        if (building) {
            const config = BUILDING_CONFIG[building.type];
            const gridWidth = Math.ceil(config.width / this.gridSystem.cellSize);
            const gridDepth = Math.ceil(config.depth / this.gridSystem.cellSize);

            if (building.x === newX && building.z === newZ) {
                throw new Error('Le bâtiment est déjà à cette position');
            }

            if (!this.gridSystem.isValidPosition(newX, newZ, gridWidth, gridDepth)) {
                throw new Error('Nouvel emplacement déjà occupé ou invalide');
            }

            this.gridSystem.freeCell(building.x, building.z, building.gridWidth, building.gridDepth);

            const oldX = building.x;
            const oldZ = building.z;
            
            building.x = newX;
            building.z = newZ;
            building.gridWidth = gridWidth;
            building.gridDepth = gridDepth;

            this.gridSystem.occupyCell(newX, newZ, building, gridWidth, gridDepth);

            const worldPos = this.gridSystem.gridToWorld(newX, newZ);
            building.mesh.position.set(worldPos.x, 0, worldPos.z);

            this.socket.emit('moveBuilding', {
                buildingId: buildingId,
                oldX: oldX,
                oldZ: oldZ,
                newX: newX,
                newZ: newZ,
                playerId: building.playerId
            });

            this.movingBuilding = null;
            this.editMode = false;
            this.buildingToEdit = null;
            this.selectedBuildingType = null;
            this.hidePreview();

            return building;
        }
        throw new Error('Bâtiment non trouvé');
    }

    getBuildingAtPosition(x, z) {
        const buildingData = this.gridSystem.getBuildingAt(x, z);
        if (buildingData) {
            return Array.from(this.buildings.values()).find(b => b.id === buildingData.id);
        }
        return null;
    }
}

class UIManager {
    constructor(socket, game) {
        this.socket = socket;
        this.game = game;
        this.resources = {
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
        };
        this.currentCategory = 'all';
        this.init();
    }

    init() {
        this.updateResourceDisplay();
        this.setupBuildingCategories();
        this.setupEventListeners();
        this.setupPathfindingControls();
        this.setupSaveLoadControls();
        this.setupStatisticsPanel();
    }

    setupStatisticsPanel() {
        if (!document.getElementById('statistics-panel')) {
            const statsPanel = document.createElement('div');
            statsPanel.id = 'statistics-panel';
            statsPanel.style.cssText = `
                position: fixed;
                top: 120px;
                left: 20px;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 16px;
                border-radius: 8px;
                z-index: 100;
                min-width: 200px;
                backdrop-filter: blur(10px);
            `;
            document.body.appendChild(statsPanel);
        }
    }

    updateResourceDisplay() {
        const moneyEl = document.getElementById('money');
        const materialsEl = document.getElementById('materials');
        const populationEl = document.getElementById('population');
        const energyEl = document.getElementById('energy');
        const waterEl = document.getElementById('water');
        
        if (moneyEl) moneyEl.textContent = Math.floor(this.resources.money);
        if (materialsEl) materialsEl.textContent = Math.floor(this.resources.materials);
        if (populationEl) populationEl.textContent = Math.floor(this.resources.population);
        if (energyEl) energyEl.textContent = Math.floor(this.resources.energy);
        if (waterEl) waterEl.textContent = Math.floor(this.resources.water);

        // Mettre à jour les couleurs selon les niveaux de ressources
        this.updateResourceColors();
    }

    updateResourceColors() {
        const resources = ['money', 'materials', 'energy', 'water'];
        resources.forEach(resource => {
            const element = document.getElementById(resource);
            if (element) {
                const value = this.resources[resource];
                if (value < 10) {
                    element.style.color = '#ff6b6b';
                } else if (value < 30) {
                    element.style.color = '#ffd93d';
                } else {
                    element.style.color = '#6bcf7f';
                }
            }
        });
    }

    setupBuildingCategories() {
        const categories = {
            all: 'Tous les Bâtiments',
            residential: '🏠 Résidentiel',
            commercial: '🛒 Commercial',
            industrial: '🏭 Industriel',
            education: '🎓 Éducation',
            infrastructure: '🏗️ Infrastructure'
        };

        const buildingInfo = {
            villa: { name: 'Villa', cost: '500💰 300🔧', production: '+15👥 +2💰', color: '#8B4513' },
            studio: { name: 'Studio', cost: '200💰 100🔧', production: '+5👥 +1💰', color: '#D2B48C' },
            apartment: { name: 'Appartement', cost: '400💰 300🔧', production: '+25👥 +3💰', color: '#708090' },
            residential_complex: { name: 'Complexe Résidentiel', cost: '800💰 600🔧', production: '+50👥 +6💰', color: '#696969' },
            supermarket: { name: 'Supermarché', cost: '600💰 400🔧', production: '+15💰 +25💼', color: '#FF6347' },
            mall: { name: 'Centre Commercial', cost: '1200💰 800🔧', production: '+25💰 +50💼', color: '#DC143C' },
            bakery: { name: 'Boulangerie', cost: '300💰 150🔧', production: '+8💰 +6💼', color: '#F0E68C' },
            restaurant: { name: 'Restaurant', cost: '400💰 200🔧', production: '+12💰 +10💼', color: '#8B0000' },
            factory: { name: 'Usine', cost: '500💰 300🔧', production: '+10💰 +5🔧 +20💼', color: '#666666' },
            powerplant: { name: 'Centrale Électrique', cost: '1000💰 800🔧', production: '+15💰 +50⚡ +15💼', color: '#444444' },
            water_plant: { name: 'Usine de Traitement', cost: '600💰 400🔧', production: '+8💰 +30💧 +10💼', color: '#4682B4' },
            recycling_center: { name: 'Centre de Recyclage', cost: '400💰 250🔧', production: '+6💰 +8🔧 +8💼', color: '#32CD32' },
            school: { name: 'École Primaire', cost: '300💰 200🔧', production: '+5💰 +10👥 +20🎓 +15💼', color: '#4682B4' },
            high_school: { name: 'Lycée', cost: '500💰 350🔧', production: '+8💰 +15👥 +30🎓 +25💼', color: '#4169E1' },
            university: { name: 'Université', cost: '1000💰 700🔧', production: '+15💰 +30👥 +50🎓 +20🔬 +40💼', color: '#000080' },
            library: { name: 'Bibliothèque', cost: '350💰 250🔧', production: '+3💰 +15🎓 +8💼', color: '#8B4513' },
            road: { name: 'Route', cost: '50💰 20🔧', production: 'Accès véhicules', color: '#333333' },
            sidewalk: { name: 'Trottoir', cost: '20💰 10🔧', production: 'Accès piétons', color: '#888888' },
            park: { name: 'Parc', cost: '150💰 100🔧', production: '+15😊 Zone piétonne', color: '#228B22' },
            hospital: { name: 'Hôpital', cost: '800💰 500🔧', production: '+12💰 +30❤️ +35💼', color: '#FFFFFF' },
            police_station: { name: 'Poste de Police', cost: '400💰 300🔧', production: '+6💰 +20🛡️ +12💼', color: '#0000FF' }
        };

        const buildingList = document.getElementById('building-list');
        if (buildingList) {
            buildingList.innerHTML = '';

            const categoryContainer = document.createElement('div');
            categoryContainer.className = 'category-buttons';
            categoryContainer.style.cssText = `
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                margin-bottom: 16px;
                padding: 8px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 8px;
            `;

            Object.entries(categories).forEach(([categoryId, categoryName]) => {
                const categoryBtn = document.createElement('button');
                categoryBtn.className = `category-btn ${categoryId === 'all' ? 'active' : ''}`;
                categoryBtn.textContent = categoryName;
                categoryBtn.dataset.category = categoryId;
                categoryBtn.style.cssText = `
                    padding: 8px 12px;
                    border: none;
                    border-radius: 6px;
                    background: ${categoryId === 'all' ? '#4a5568' : '#2d3748'};
                    color: white;
                    cursor: pointer;
                    font-size: 12px;
                    transition: all 0.2s;
                `;

                categoryBtn.addEventListener('click', () => {
                    this.selectCategory(categoryId);
                });

                categoryContainer.appendChild(categoryBtn);
            });

            buildingList.appendChild(categoryContainer);

            const buildingsGrid = document.createElement('div');
            buildingsGrid.className = 'buildings-grid';
            buildingsGrid.style.cssText = `
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
                gap: 8px;
                max-height: 400px;
                overflow-y: auto;
                padding: 8px;
            `;

            Object.entries(BUILDING_CONFIG).forEach(([type, config]) => {
                const info = buildingInfo[type];
                if (info) {
                    const buildingBtn = document.createElement('button');
                    buildingBtn.className = 'building-btn';
                    buildingBtn.dataset.type = type;
                    buildingBtn.dataset.category = config.category;
                    buildingBtn.style.cssText = `
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        padding: 12px 8px;
                        border: 2px solid ${info.color};
                        border-radius: 8px;
                        background: rgba(255, 255, 255, 0.1);
                        color: white;
                        cursor: pointer;
                        transition: all 0.2s;
                        min-height: 100px;
                        justify-content: center;
                    `;

                    buildingBtn.innerHTML = `
                        <div style="font-size: 20px; margin-bottom: 4px;">${this.getBuildingIcon(type)}</div>
                        <div style="font-size: 11px; font-weight: bold; text-align: center;">${config.name}</div>
                        <div style="font-size: 9px; text-align: center; margin-top: 2px; opacity: 0.8;">
                            ${info.cost}
                        </div>
                        <div style="font-size: 8px; text-align: center; margin-top: 2px; opacity: 0.9;">
                            ${info.production}
                        </div>
                    `;

                    buildingBtn.title = `${config.name}\nCoût: ${info.cost}\nProduction: ${info.production}`;

                    buildingBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const buildingType = e.currentTarget.dataset.type;
                        
                        if (e.currentTarget.classList.contains('selected')) {
                            this.deselectAllBuildings();
                        } else {
                            this.selectBuilding(buildingType);
                        }
                    });

                    buildingsGrid.appendChild(buildingBtn);
                }
            });

            buildingList.appendChild(buildingsGrid);
        }
    }

    getBuildingIcon(type) {
        const icons = {
            villa: '🏡',
            studio: '🏠',
            apartment: '🏢',
            residential_complex: '🏘️',
            supermarket: '🏪',
            mall: '🏬',
            bakery: '🥐',
            restaurant: '🍽️',
            factory: '🏭',
            powerplant: '⚡',
            water_plant: '💧',
            recycling_center: '♻️',
            school: '🏫',
            high_school: '🎓',
            university: '📚',
            library: '📖',
            road: '🛣️',
            sidewalk: '🚶',
            park: '🌳',
            hospital: '🏥',
            police_station: '🚓'
        };
        
        return icons[type] || '🏗️';
    }

    selectCategory(categoryId) {
        this.currentCategory = categoryId;
        
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.style.background = btn.dataset.category === categoryId ? '#4a5568' : '#2d3748';
        });
        
        document.querySelectorAll('.building-btn').forEach(btn => {
            if (categoryId === 'all' || btn.dataset.category === categoryId) {
                btn.style.display = 'flex';
            } else {
                btn.style.display = 'none';
            }
        });
    }

    setupEventListeners() {
        const cancelBtn = document.getElementById('cancel-placement');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.deselectAllBuildings();
            });
        }

        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.deselectAllBuildings();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.deselectAllBuildings();
            }
        });

        document.addEventListener('click', (e) => {
            if (e.target.id === 'delete-building' || e.target.closest('#delete-building')) {
                const event = new CustomEvent('deleteBuilding');
                document.dispatchEvent(event);
            }
            else if (e.target.id === 'move-building' || e.target.closest('#move-building')) {
                const event = new CustomEvent('startMoveBuilding');
                document.dispatchEvent(event);
            }
            else if (e.target.id === 'cancel-edit' || e.target.closest('#cancel-edit')) {
                const event = new CustomEvent('cancelEdit');
                document.dispatchEvent(event);
            }
            else if (e.target.id === 'test-pathfinding' || e.target.closest('#test-pathfinding')) {
                const event = new CustomEvent('testPathfinding');
                document.dispatchEvent(event);
            }
            else if (e.target.id === 'create-entities' || e.target.closest('#create-entities')) {
                const event = new CustomEvent('createEntities');
                document.dispatchEvent(event);
            }
            else if (e.target.id === 'assign-workers' || e.target.closest('#assign-workers')) {
                const event = new CustomEvent('assignWorkers');
                document.dispatchEvent(event);
            }
        });
    }

    setupPathfindingControls() {
        // Les contrôles seront ajoutés dynamiquement
    }

    setupSaveLoadControls() {
        const infoContent = document.getElementById('info-content');
        if (infoContent) {
            const saveLoadSection = document.createElement('div');
            saveLoadSection.className = 'save-load-section';
            saveLoadSection.style.cssText = `
                margin-top: 16px;
                padding-top: 16px;
                border-top: 1px solid rgba(255, 255, 255, 0.2);
            `;
            
            saveLoadSection.innerHTML = `
                <h4>💾 Sauvegarde</h4>
                <div class="save-load-buttons" style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <button id="save-game" class="save-btn" style="padding: 6px 12px; background: #2d3748; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        💾 Sauvegarder
                    </button>
                    <button id="load-game" class="load-btn" style="padding: 6px 12px; background: #4a5568; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        📂 Charger
                    </button>
                </div>
            `;
            
            infoContent.appendChild(saveLoadSection);
            
            document.getElementById('save-game').addEventListener('click', () => {
                if (this.game && this.game.saveManager) {
                    this.game.saveManager.saveGame('manual');
                    this.showMessage('Jeu sauvegardé!', 'success');
                }
            });
            
            document.getElementById('load-game').addEventListener('click', () => {
                if (this.game && this.game.saveManager) {
                    if (this.game.saveManager.loadGame('manual')) {
                        this.showMessage('Jeu chargé!', 'success');
                    } else {
                        this.showMessage('Aucune sauvegarde trouvée', 'error');
                    }
                }
            });
        }
    }

    selectBuilding(buildingType) {
        this.deselectAllBuildings();
        
        document.querySelectorAll('.building-btn').forEach(btn => {
            if (btn.dataset.type === buildingType) {
                btn.classList.add('selected');
                btn.style.background = 'rgba(74, 85, 104, 0.8)';
                btn.style.borderColor = '#63b3ed';
            }
        });
        
        const event = new CustomEvent('buildingSelected', { 
            detail: { type: buildingType } 
        });
        document.dispatchEvent(event);
    }

    deselectAllBuildings() {
        document.querySelectorAll('.building-btn').forEach(btn => {
            btn.classList.remove('selected');
            btn.style.background = 'rgba(255, 255, 255, 0.1)';
            const config = BUILDING_CONFIG[btn.dataset.type];
            if (config) {
                const buildingInfo = this.getBuildingInfo(btn.dataset.type);
                btn.style.borderColor = buildingInfo.color;
            }
        });
        
        const event = new CustomEvent('buildingCancelled');
        document.dispatchEvent(event);
        
        this.updateInfoPanel();
    }

    getBuildingInfo(type) {
        const infoMap = {
            villa: { color: '#8B4513' },
            studio: { color: '#D2B48C' },
            apartment: { color: '#708090' },
            residential_complex: { color: '#696969' },
            supermarket: { color: '#FF6347' },
            mall: { color: '#DC143C' },
            bakery: { color: '#F0E68C' },
            restaurant: { color: '#8B0000' },
            factory: { color: '#666666' },
            powerplant: { color: '#444444' },
            water_plant: { color: '#4682B4' },
            recycling_center: { color: '#32CD32' },
            school: { color: '#4682B4' },
            high_school: { color: '#4169E1' },
            university: { color: '#000080' },
            library: { color: '#8B4513' },
            road: { color: '#333333' },
            sidewalk: { color: '#888888' },
            park: { color: '#228B22' },
            hospital: { color: '#FFFFFF' },
            police_station: { color: '#0000FF' }
        };
        return infoMap[type] || { color: '#666666' };
    }

    showEditPanel(buildingData) {
        const infoContent = document.getElementById('info-content');
        if (infoContent && buildingData) {
            const config = BUILDING_CONFIG[buildingData.type];
            infoContent.innerHTML = `
                <div class="building-details">
                    <h4>${config.name} - Édition</h4>
                    <p><strong>Catégorie :</strong> ${this.getCategoryName(config.category)}</p>
                    <p><strong>Position :</strong> ${buildingData.x}, ${buildingData.z}</p>
                    <p><strong>Taille :</strong> ${config.width}x${config.depth}</p>
                    <p><strong>Coût :</strong> ${config.cost.money}💰 ${config.cost.materials}🔧</p>
                    <p><strong>Production :</strong> ${this.getProductionDescription(config)}</p>
                </div>
                <div class="edit-controls">
                    <button id="move-building" class="edit-btn move-btn">
                        <span>📦</span>
                        <span>Déplacer</span>
                    </button>
                    <button id="delete-building" class="edit-btn delete-btn">
                        <span>🗑️</span>
                        <span>Supprimer</span>
                    </button>
                    <button id="cancel-edit" class="edit-btn cancel-edit-btn">
                        <span>✖</span>
                        <span>Fermer</span>
                    </button>
                </div>
            `;
        }
    }

    getProductionDescription(config) {
        const production = config.production;
        const descriptions = [];
        
        if (production.money) descriptions.push(`+${production.money}💰`);
        if (production.materials) descriptions.push(`+${production.materials}🔧`);
        if (production.energy) descriptions.push(`+${production.energy}⚡`);
        if (production.water) descriptions.push(`+${production.water}💧`);
        if (production.population) descriptions.push(`+${production.population}👥`);
        if (production.education) descriptions.push(`+${production.education}🎓`);
        if (production.jobs) descriptions.push(`+${production.jobs}💼`);
        if (production.happiness) descriptions.push(`+${production.happiness}😊`);
        if (production.health) descriptions.push(`+${production.health}❤️`);
        if (production.safety) descriptions.push(`+${production.safety}🛡️`);
        if (production.research) descriptions.push(`+${production.research}🔬`);
        
        if (production.consumption) {
            const consumption = production.consumption;
            if (consumption.energy) descriptions.push(`-${consumption.energy}⚡`);
            if (consumption.water) descriptions.push(`-${consumption.water}💧`);
            if (consumption.materials) descriptions.push(`-${consumption.materials}🔧`);
        }
        
        return descriptions.join(' ') || 'Aucune production';
    }

    getCategoryName(category) {
        const categories = {
            residential: '🏠 Résidentiel',
            commercial: '🛒 Commercial',
            industrial: '🏭 Industriel',
            education: '🎓 Éducation',
            infrastructure: '🏗️ Infrastructure'
        };
        return categories[category] || category;
    }

    showPathfindingPanel() {
        const infoContent = document.getElementById('info-content');
        if (infoContent) {
            infoContent.innerHTML = `
                <div class="pathfinding-controls">
                    <h4>🧭 Système de Pathfinding</h4>
                    <p><em>Testez le déplacement des personnages avec l'algorithme A*</em></p>
                    
                    <div class="control-group">
                        <button id="create-entities" class="action-btn create-btn">
                            <span>👥</span>
                            <span>Créer 5 Personnages</span>
                        </button>
                        <button id="test-pathfinding" class="action-btn path-btn">
                            <span>🎯</span>
                            <span>Tester Pathfinding</span>
                        </button>
                        <button id="assign-workers" class="action-btn work-btn">
                            <span>💼</span>
                            <span>Assigner Travailleurs</span>
                        </button>
                    </div>
                    
                    <div class="pathfinding-info">
                        <p><strong>Comment tester :</strong></p>
                        <ol>
                            <li>Cliquez sur "Créer 5 Personnages"</li>
                            <li>Cliquez sur "Tester Pathfinding"</li>
                            <li>Observez les personnages se déplacer en évitant les bâtiments</li>
                            <li>Utilisez "Assigner Travailleurs" pour envoyer les personnages travailler</li>
                        </ol>
                    </div>
                </div>
            `;
        }
    }

    updateInfoPanel() {
        const infoContent = document.getElementById('info-content');
        if (infoContent) {
            infoContent.innerHTML = `
                <p><em>Sélectionnez un bâtiment pour construire ou cliquez sur un bâtiment existant pour l'éditer</em></p>
                
                <div class="controls-info">
                    <h4>Commandes</h4>
                    <ul class="controls-list">
                        <li>🖱️ Clic gauche vide : Construire</li>
                        <li>🖱️ Clic gauche bâtiment : Éditer</li>
                        <li>🖱️ Clic droit : Désélectionner</li>
                        <li>🔄 Rotation : Clic gauche + glisser</li>
                        <li>📦 Déplacement caméra : Clic droit + glisser</li>
                        <li>📜 Molette : Zoom</li>
                        <li>⎋ Echap : Annuler</li>
                    </ul>
                </div>

                <div class="pathfinding-section">
                    <button id="show-pathfinding" class="pathfinding-toggle">
                        🧭 Tester le Pathfinding A*
                    </button>
                </div>

                <button id="cancel-placement" class="cancel-btn">
                    ✖ Annuler la construction
                </button>
            `;

            const cancelBtn = document.getElementById('cancel-placement');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    this.deselectAllBuildings();
                });
            }

            const pathfindingBtn = document.getElementById('show-pathfinding');
            if (pathfindingBtn) {
                pathfindingBtn.addEventListener('click', () => {
                    this.showPathfindingPanel();
                });
            }
        }
    }

    updateResources(newResources) {
        Object.keys(newResources).forEach(key => {
            if (this.resources[key] !== undefined) {
                this.resources[key] += newResources[key];
                // Éviter les valeurs négatives
                if (this.resources[key] < 0) this.resources[key] = 0;
            }
        });
        this.updateResourceDisplay();
        
        // Mettre à jour les quêtes basées sur la population
        if (this.game && this.game.questManager) {
            this.game.questManager.updateQuestProgress('population', {});
        }
    }

    showMessage(message, type = 'info') {
        document.querySelectorAll('.notification').forEach(notification => {
            notification.remove();
        });

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 24px;
            right: 24px;
            background: ${type === 'error' ? '#ff6b6b' : type === 'success' ? '#4cd964' : '#8b9dff'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            font-weight: 500;
        `;

        document.body.appendChild(notification);
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }
}

class EnhancedCityBuilderGame {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.socket = null;
        this.gridSize = 200;
        this.cellSize = 4;
        this.cameraController = null;
        this.gridSystem = null;
        this.buildingManager = null;
        this.entityManager = null;
        this.uiManager = null;
        this.textureManager = null;
        this.currentHoverPos = null;
        this.movingBuilding = null;
        this.editingBuilding = null;
        this.testEntities = [];
        
        // Nouveaux gestionnaires
        this.errorManager = new ErrorManager();
        this.saveManager = new SaveManager(this);
        this.questManager = new QuestManager(this);
        this.resourceManager = null;
        
        this.init();
    }

    init() {
        try {
            this.initThreeJS();
            this.initSocket();
            this.initManagers();
            this.initEventListeners();
            this.setupQuestPanel();
            this.animate();
            
            this.saveManager.startAutoSave();
            this.saveManager.loadGame('autosave');
            
        } catch (error) {
            this.errorManager.logError('Game initialization', error, 'error');
        }
    }

    initThreeJS() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB);
        this.scene.fog = new THREE.Fog(0x87CEEB, 50, 200);

        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);

        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        const gameContainer = document.getElementById('gameContainer');
        if (gameContainer) {
            gameContainer.appendChild(this.renderer.domElement);
        }

        this.setupLighting();
        this.createRealisticTerrain();
    }

    setupLighting() {
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(50, 100, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -100;
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = -100;
        this.scene.add(directionalLight);
    }

    createRealisticTerrain() {
        const terrainGeometry = new THREE.PlaneGeometry(this.gridSize, this.gridSize, 1, 1);
        const terrainMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x3a7d3a,
            roughness: 0.8,
            metalness: 0.1
        });
        
        const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
        terrain.rotation.x = -Math.PI / 2;
        terrain.receiveShadow = true;
        this.scene.add(terrain);
    }

    initSocket() {
        this.socket = io('http://localhost:3000');
        
        this.socket.on('gameState', (gameState) => {
            this.loadGameState(gameState);
        });

        this.socket.on('buildingPlaced', (building) => {
            this.handleBuildingPlaced(building);
        });

        this.socket.on('buildingRemoved', (data) => {
            this.handleBuildingRemoved(data);
        });

        this.socket.on('buildingMoved', (data) => {
            this.handleBuildingMoved(data);
        });

        this.socket.on('buildingError', (error) => {
            this.uiManager.showMessage(error.message, 'error');
        });

        this.socket.on('resourcesUpdate', (resources) => {
            this.uiManager.updateResources(resources);
        });
    }

    initManagers() {
        this.textureManager = new TextureManager();
        this.gridSystem = new GridSystem(this.gridSize, this.cellSize);
        this.uiManager = new UIManager(this.socket, this);
        this.buildingManager = new BuildingManager(this.scene, this.gridSystem, this.socket, this.uiManager, this.textureManager);
        this.entityManager = new EntityManager(this.scene, this.gridSystem);
        this.cameraController = new AdvancedCameraController(this.camera, this.renderer.domElement);
        this.resourceManager = new ResourceManager(this);
    }

    setupQuestPanel() {
        if (!document.getElementById('quest-panel')) {
            const questPanel = document.createElement('div');
            questPanel.id = 'quest-panel';
            questPanel.style.cssText = `
                position: fixed;
                top: 80px;
                right: 20px;
                width: 300px;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 16px;
                border-radius: 8px;
                z-index: 100;
                max-height: 400px;
                overflow-y: auto;
                backdrop-filter: blur(10px);
            `;
            
            document.body.appendChild(questPanel);
            this.questManager.updateQuestDisplay();
        }
    }

    initEventListeners() {
        const menuToggle = document.getElementById('menu-toggle');
        const ui = document.getElementById('ui');
        
        if (menuToggle && ui) {
            menuToggle.addEventListener('click', () => {
                menuToggle.classList.toggle('active');
                ui.classList.toggle('active');
            });
        }

        document.addEventListener('buildingSelected', (e) => {
            this.buildingManager.setSelectedBuilding(e.detail.type);
            this.movingBuilding = null;
            this.editingBuilding = null;
        });

        document.addEventListener('buildingCancelled', () => {
            this.buildingManager.clearSelection();
            this.currentHoverPos = null;
            this.movingBuilding = null;
            this.editingBuilding = null;
        });

        document.addEventListener('buildingEditStarted', (e) => {
            this.editingBuilding = e.detail.building;
            this.movingBuilding = null;
            this.uiManager.showEditPanel(e.detail.building);
        });

        document.addEventListener('deleteBuilding', () => {
            if (this.buildingManager.buildingToEdit) {
                this.buildingManager.removeBuilding(this.buildingManager.buildingToEdit.id);
                this.buildingManager.clearSelection();
                this.editingBuilding = null;
                this.uiManager.showMessage('Bâtiment supprimé', 'success');
                this.uiManager.updateInfoPanel();
            }
        });

        document.addEventListener('startMoveBuilding', () => {
            if (this.buildingManager.buildingToEdit) {
                if (this.buildingManager.startMoveBuilding(this.buildingManager.buildingToEdit.id)) {
                    this.movingBuilding = this.buildingManager.buildingToEdit;
                    this.uiManager.showMessage('Cliquez sur une nouvelle position pour déplacer le bâtiment. Clic droit pour annuler.', 'info');
                }
            }
        });

        document.addEventListener('cancelEdit', () => {
            this.buildingManager.clearSelection();
            this.movingBuilding = null;
            this.editingBuilding = null;
            this.uiManager.updateInfoPanel();
        });

        document.addEventListener('createEntities', () => {
            this.createTestEntities();
        });

        document.addEventListener('testPathfinding', () => {
            this.testPathfinding();
        });

        document.addEventListener('assignWorkers', () => {
            this.assignWorkers();
        });

        this.renderer.domElement.addEventListener('mousemove', (event) => {
            this.handleMouseMove(event);
        });

        this.renderer.domElement.addEventListener('click', (event) => {
            this.handleClick(event);
        });

        this.renderer.domElement.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (this.movingBuilding) {
                this.buildingManager.clearSelection();
                this.movingBuilding = null;
                this.uiManager.showMessage('Déplacement annulé', 'info');
                this.uiManager.updateInfoPanel();
            }
        });

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        this.renderer.domElement.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        // Sauvegarde manuelle avec Ctrl+S
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.saveManager.saveGame('manual');
                this.uiManager.showMessage('Jeu sauvegardé manuellement!', 'success');
            }
        });
    }

    handleMouseMove(event) {
        const mouse = new THREE.Vector2();
        const rect = this.renderer.domElement.getBoundingClientRect();
        
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.camera);

        const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        const intersectionPoint = new THREE.Vector3();
        
        if (raycaster.ray.intersectPlane(plane, intersectionPoint)) {
            const gridPos = this.gridSystem.worldToGrid(intersectionPoint.x, intersectionPoint.z);
            
            if (!this.currentHoverPos || this.currentHoverPos.x !== gridPos.x || this.currentHoverPos.z !== gridPos.z) {
                this.currentHoverPos = gridPos;
                
                if (this.movingBuilding) {
                    this.buildingManager.updatePreview(gridPos.x, gridPos.z);
                }
                else if (this.buildingManager.selectedBuildingType) {
                    this.buildingManager.updatePreview(gridPos.x, gridPos.z);
                }
            }
        }
    }

    handleClick(event) {
        if (!this.currentHoverPos) return;

        if (this.movingBuilding) {
            try {
                this.buildingManager.moveBuilding(
                    this.movingBuilding.id,
                    this.currentHoverPos.x,
                    this.currentHoverPos.z
                );
                this.uiManager.showMessage('Bâtiment déplacé avec succès!', 'success');
                this.movingBuilding = null;
                this.uiManager.updateInfoPanel();
            } catch (error) {
                this.uiManager.showMessage(error.message, 'error');
            }
            return;
        }

        if (!this.buildingManager.selectedBuildingType) {
            const building = this.buildingManager.getBuildingAtPosition(this.currentHoverPos.x, this.currentHoverPos.z);
            if (building) {
                if (this.buildingManager.startEditBuilding(building.id)) {
                    this.editingBuilding = building;
                    this.uiManager.showEditPanel(building);
                }
                return;
            }
        }

        if (this.buildingManager.selectedBuildingType) {
            try {
                this.buildingManager.placeBuilding(
                    this.currentHoverPos.x, 
                    this.currentHoverPos.z, 
                    this.buildingManager.selectedBuildingType, 
                    this.socket.id
                );
                this.uiManager.showMessage('Bâtiment placé avec succès!', 'success');
            } catch (error) {
                this.uiManager.showMessage(error.message, 'error');
            }
        }
    }

    createTestEntities() {
        this.testEntities.forEach(entityId => {
            this.entityManager.removeEntity(entityId);
        });
        this.testEntities = [];

        const startArea = { x: -10, z: -10, width: 5, depth: 5 };
        this.testEntities = this.entityManager.createEntityGroup(5, startArea);

        this.uiManager.showMessage('5 personnages créés! Cliquez sur "Tester Pathfinding" pour les faire se déplacer.', 'success');
    }

    testPathfinding() {
        if (this.testEntities.length === 0) {
            this.uiManager.showMessage('Créez d\'abord des personnages avec le bouton "Créer 5 Personnages"', 'error');
            return;
        }

        let successCount = 0;
        this.testEntities.forEach(entityId => {
            const targetX = Math.floor(Math.random() * 20) - 10;
            const targetZ = Math.floor(Math.random() * 20) - 10;
            
            if (this.entityManager.moveEntity(entityId, targetX, targetZ)) {
                successCount++;
            }
        });

        if (successCount > 0) {
            this.uiManager.showMessage(`${successCount} personnages en mouvement vers leurs destinations!`, 'success');
        } else {
            this.uiManager.showMessage('Aucun chemin trouvé vers les destinations. Essayez de construire des routes.', 'error');
        }
    }

    assignWorkers() {
        const workersAssigned = this.entityManager.assignWorkersToBuildings(this.buildingManager);
        if (workersAssigned > 0) {
            this.uiManager.showMessage(`${workersAssigned} travailleurs assignés aux bâtiments!`, 'success');
        } else {
            this.uiManager.showMessage('Aucun travailleur disponible ou aucun bâtiment nécessitant des employés.', 'info');
        }
    }

    loadGameState(gameState) {
        this.buildingManager.buildings.forEach(building => {
            this.scene.remove(building.mesh);
        });
        this.buildingManager.buildings.clear();
        this.gridSystem.occupiedCells.clear();

        if (gameState.buildings) {
            gameState.buildings.forEach(building => {
                this.buildingManager.placeBuilding(
                    building.x, 
                    building.z, 
                    building.type, 
                    building.playerId
                );
            });
        }

        if (gameState.resources) {
            this.uiManager.updateResources(gameState.resources);
        }

        // Mettre à jour les statistiques
        if (this.resourceManager) {
            this.resourceManager.calculateEmployment();
            this.resourceManager.calculatePopulation();
        }
    }

    handleBuildingPlaced(building) {
        try {
            this.buildingManager.placeBuilding(
                building.x, 
                building.z, 
                building.type, 
                building.playerId
            );
        } catch (error) {
            console.warn('Bâtiment déjà placé:', error.message);
        }
    }

    handleBuildingRemoved(data) {
        this.buildingManager.removeBuilding(data.buildingId);
    }

    handleBuildingMoved(data) {
        const building = this.buildingManager.buildings.get(data.buildingId);
        if (building) {
            this.buildingManager.moveBuilding(data.buildingId, data.newX, data.newZ);
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (this.cameraController) {
            this.cameraController.update();
        }
        
        this.entityManager.update();
        
        if (this.resourceManager) {
            this.resourceManager.update();
        }
        
        this.renderer.render(this.scene, this.camera);
    }
}

// Démarrer le jeu
window.addEventListener('DOMContentLoaded', () => {
    new EnhancedCityBuilderGame();
});

