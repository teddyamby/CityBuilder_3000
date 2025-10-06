import * as THREE from 'three';
import { io } from 'socket.io-client';

// Configuration des bâtiments réalistes
const BUILDING_CONFIG = {
    house: {
        name: 'Maison',
        color: 0x8B4513,
        height: 3,
        width: 4,
        depth: 5,
        roofHeight: 2,
        cost: { money: 100, materials: 50 },
        production: { population: 10 }
    },
    road: {
        name: 'Route',
        color: 0x333333,
        height: 0.2,
        width: 4,
        depth: 4,
        cost: { money: 50, materials: 20 },
        production: {}
    },
    factory: {
        name: 'Usine',
        color: 0x666666,
        height: 6,
        width: 8,
        depth: 10,
        roofHeight: 1,
        cost: { money: 500, materials: 300 },
        production: { money: 5, materials: 2 }
    },
    powerplant: {
        name: 'Centrale Électrique',
        color: 0x444444,
        height: 8,
        width: 10,
        depth: 12,
        chimneyHeight: 15,
        cost: { money: 1000, materials: 800 },
        production: { money: 10 }
    },
    school: {
        name: 'École',
        color: 0x4682B4,
        height: 5,
        width: 12,
        depth: 8,
        roofHeight: 3,
        cost: { money: 300, materials: 200 },
        production: { money: 3, population: 5 }
    },
    apartment: {
        name: 'Appartement',
        color: 0x708090,
        height: 8,
        width: 6,
        depth: 8,
        floors: 4,
        cost: { money: 400, materials: 300 },
        production: { population: 25 }
    }
};

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
}

class BuildingManager {
    constructor(scene, gridSystem, socket) {
        this.scene = scene;
        this.gridSystem = gridSystem;
        this.socket = socket;
        this.buildings = new Map();
        this.previewMesh = null;
        this.selectedBuildingType = null;
        this.editMode = false;
        this.buildingToEdit = null;
        this.selectionBox = null;
    }

    setSelectedBuilding(type) {
        this.selectedBuildingType = type;
        this.editMode = false;
        this.buildingToEdit = null;
        this.hideSelectionBox();
        this.showPreview(0, 0, type);
    }

    clearSelection() {
        this.selectedBuildingType = null;
        this.editMode = false;
        this.buildingToEdit = null;
        this.hidePreview();
        this.hideSelectionBox();
    }

    createBuildingMesh(x, z, type) {
        const config = BUILDING_CONFIG[type];
        const buildingGroup = new THREE.Group();

        // Corps principal du bâtiment
        const mainGeometry = new THREE.BoxGeometry(config.width, config.height, config.depth);
        const mainMaterial = new THREE.MeshLambertMaterial({ 
            color: config.color
        });
        const mainMesh = new THREE.Mesh(mainGeometry, mainMaterial);
        mainMesh.position.y = config.height / 2;
        mainMesh.castShadow = true;
        mainMesh.receiveShadow = true;
        buildingGroup.add(mainMesh);

        // Détails architecturaux
        switch(type) {
            case 'house':
                const roofGeometry = new THREE.ConeGeometry(config.width * 0.8, config.roofHeight, 4);
                const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x8B0000 });
                const roofMesh = new THREE.Mesh(roofGeometry, roofMaterial);
                roofMesh.position.y = config.height + config.roofHeight / 2;
                roofMesh.rotation.y = Math.PI / 4;
                buildingGroup.add(roofMesh);
                break;

            case 'factory':
                const chimneyGeometry = new THREE.CylinderGeometry(0.3, 0.5, 4, 8);
                const chimneyMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
                const chimneyMesh = new THREE.Mesh(chimneyGeometry, chimneyMaterial);
                chimneyMesh.position.set(2, config.height + 2, 1);
                buildingGroup.add(chimneyMesh);
                break;

            case 'powerplant':
                const bigChimneyGeometry = new THREE.CylinderGeometry(1, 2, config.chimneyHeight, 16);
                const bigChimneyMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
                const bigChimneyMesh = new THREE.Mesh(bigChimneyGeometry, bigChimneyMaterial);
                bigChimneyMesh.position.set(3, config.chimneyHeight / 2, 2);
                buildingGroup.add(bigChimneyMesh);
                break;

            case 'school':
                const schoolRoofGeometry = new THREE.ConeGeometry(config.width * 0.9, config.roofHeight, 4);
                const schoolRoofMaterial = new THREE.MeshLambertMaterial({ color: 0x8B0000 });
                const schoolRoofMesh = new THREE.Mesh(schoolRoofGeometry, schoolRoofMaterial);
                schoolRoofMesh.position.y = config.height + config.roofHeight / 2;
                schoolRoofMesh.rotation.y = Math.PI / 4;
                buildingGroup.add(schoolRoofMesh);
                break;

            case 'apartment':
                // Ajouter des fenêtres pour l'appartement
                for (let floor = 0; floor < (config.floors || 4); floor++) {
                    for (let i = -1; i <= 1; i += 2) {
                        const windowGeometry = new THREE.PlaneGeometry(0.8, 1);
                        const windowMaterial = new THREE.MeshLambertMaterial({ 
                            color: 0x87CEEB,
                            transparent: true,
                            opacity: 0.7
                        });
                        const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
                        windowMesh.position.set(
                            i * (config.width / 2 - 0.3),
                            floor * 2 + 1.5,
                            config.depth / 2 + 0.1
                        );
                        windowMesh.rotation.y = Math.PI;
                        buildingGroup.add(windowMesh);
                    }
                }
                break;
        }

        // Porte pour les bâtiments résidentiels
        if (['house', 'school', 'apartment'].includes(type)) {
            const doorGeometry = new THREE.PlaneGeometry(1, 2);
            const doorMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
            const doorMesh = new THREE.Mesh(doorGeometry, doorMaterial);
            doorMesh.position.set(0, 1, config.depth / 2 + 0.1);
            doorMesh.rotation.y = Math.PI;
            buildingGroup.add(doorMesh);
        }

        buildingGroup.position.set(x, 0, z);
        buildingGroup.castShadow = true;
        buildingGroup.receiveShadow = true;

        // Stocker le type de bâtiment dans le mesh pour la sélection
        buildingGroup.userData = { buildingType: type, isBuilding: true };

        return buildingGroup;
    }

    showPreview(x, z, type) {
        this.hidePreview();
        if (!type) return;

        const config = BUILDING_CONFIG[type];
        const worldPos = this.gridSystem.gridToWorld(x, z);
        const isValid = this.gridSystem.isValidPosition(x, z, config.width / this.gridSystem.cellSize, config.depth / this.gridSystem.cellSize);

        this.previewMesh = this.createBuildingMesh(worldPos.x, worldPos.z, type);
        
        // Rendre l'aperçu semi-transparent
        this.previewMesh.traverse((child) => {
            if (child.isMesh) {
                child.material.transparent = true;
                child.material.opacity = 0.6;
                if (!isValid) {
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

            this.previewMesh.position.set(worldPos.x, 0, worldPos.z);
            
            this.previewMesh.traverse((child) => {
                if (child.isMesh) {
                    if (!isValid) {
                        child.material.color.setHex(0xff0000);
                    } else {
                        child.material.color.setHex(BUILDING_CONFIG[this.selectedBuildingType].color);
                    }
                }
            });
        }
    }

    placeBuilding(x, z, type, playerId) {
        const config = BUILDING_CONFIG[type];
        const gridWidth = Math.ceil(config.width / this.gridSystem.cellSize);
        const gridDepth = Math.ceil(config.depth / this.gridSystem.cellSize);

        if (!this.gridSystem.isValidPosition(x, z, gridWidth, gridDepth)) {
            throw new Error('Emplacement déjà occupé ou invalide');
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
            mesh: buildingMesh
        };

        this.gridSystem.occupyCell(x, z, buildingData, gridWidth, gridDepth);
        this.buildings.set(buildingData.id, buildingData);
        this.scene.add(buildingMesh);

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
            this.hidePreview();
            this.showSelectionBox(building);
        }
    }

    showSelectionBox(building) {
        this.hideSelectionBox();
        
        const config = BUILDING_CONFIG[building.type];
        const worldPos = this.gridSystem.gridToWorld(building.x, building.z);
        
        // Créer une boîte de sélection
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

            // Vérifier si la nouvelle position est valide
            if (!this.gridSystem.isValidPosition(newX, newZ, gridWidth, gridDepth)) {
                throw new Error('Nouvel emplacement invalide');
            }

            // Libérer l'ancienne position
            this.gridSystem.freeCell(building.x, building.z, building.gridWidth, building.gridDepth);

            // Mettre à jour la position
            building.x = newX;
            building.z = newZ;
            building.gridWidth = gridWidth;
            building.gridDepth = gridDepth;

            // Occuper la nouvelle position
            this.gridSystem.occupyCell(newX, newZ, building, gridWidth, gridDepth);

            // Mettre à jour la position visuelle
            const worldPos = this.gridSystem.gridToWorld(newX, newZ);
            building.mesh.position.set(worldPos.x, 0, worldPos.z);

            // Mettre à jour la boîte de sélection si elle est visible
            if (this.selectionBox) {
                this.selectionBox.position.set(worldPos.x, config.height / 2, worldPos.z);
            }

            this.socket.emit('moveBuilding', {
                buildingId: buildingId,
                newX: newX,
                newZ: newZ,
                playerId: building.playerId
            });

            return building;
        }
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
    constructor(socket) {
        this.socket = socket;
        this.resources = {
            money: 1000,
            materials: 500,
            population: 0
        };
        this.init();
    }

    init() {
        this.updateResourceDisplay();
        this.setupBuildingInfo();
        this.setupEventListeners();
        this.setupEditControls();
    }

    updateResourceDisplay() {
        const moneyEl = document.getElementById('money');
        const materialsEl = document.getElementById('materials');
        const populationEl = document.getElementById('population');
        
        if (moneyEl) moneyEl.textContent = this.resources.money;
        if (materialsEl) materialsEl.textContent = this.resources.materials;
        if (populationEl) populationEl.textContent = this.resources.population;
    }

    setupBuildingInfo() {
        const buildingInfo = {
            house: { name: 'Maison', cost: '100💰 50🔧', production: '+10👥', color: '#8B4513' },
            road: { name: 'Route', cost: '50💰 20🔧', production: 'Accès', color: '#333333' },
            factory: { name: 'Usine', cost: '500💰 300🔧', production: '+5💰 +2🔧/min', color: '#666666' },
            powerplant: { name: 'Centrale', cost: '1000💰 800🔧', production: '+10💰/min', color: '#444444' },
            school: { name: 'École', cost: '300💰 200🔧', production: '+3💰 +5👥/min', color: '#4682B4' },
            apartment: { name: 'Appartement', cost: '400💰 300🔧', production: '+25👥', color: '#708090' }
        };

        document.querySelectorAll('.building-btn').forEach(btn => {
            const type = btn.dataset.type;
            const info = buildingInfo[type];
            if (info) {
                btn.title = `${info.name}\nCoût: ${info.cost}\nProduction: ${info.production}`;
                btn.style.borderLeft = `4px solid ${info.color}`;
            }
        });
    }

    setupEventListeners() {
        // Gestion de la sélection des bâtiments
        document.querySelectorAll('.building-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const buildingType = e.target.dataset.type;
                
                if (e.target.classList.contains('selected')) {
                    this.deselectAllBuildings();
                } else {
                    this.selectBuilding(buildingType);
                }
            });
        });

        // Boutons d'édition
        const deleteBtn = document.getElementById('delete-building');
        const moveBtn = document.getElementById('move-building');
        const cancelEditBtn = document.getElementById('cancel-edit');

        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                const event = new CustomEvent('deleteBuilding');
                document.dispatchEvent(event);
            });
        }

        if (moveBtn) {
            moveBtn.addEventListener('click', () => {
                const event = new CustomEvent('startMoveBuilding');
                document.dispatchEvent(event);
            });
        }

        if (cancelEditBtn) {
            cancelEditBtn.addEventListener('click', () => {
                const event = new CustomEvent('cancelEdit');
                document.dispatchEvent(event);
            });
        }

        // Clic droit pour déselectionner
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.deselectAllBuildings();
        });

        // Touche Echap pour déselectionner
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.deselectAllBuildings();
            }
        });
    }

    setupEditControls() {
        // Ces contrôles seront affichés quand un bâtiment est sélectionné
    }

    selectBuilding(buildingType) {
        this.deselectAllBuildings();
        
        document.querySelectorAll('.building-btn').forEach(btn => {
            if (btn.dataset.type === buildingType) {
                btn.classList.add('selected');
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
        });
        
        const event = new CustomEvent('buildingCancelled');
        document.dispatchEvent(event);
        
        this.updateInfoPanel();
    }

    showEditPanel(buildingData) {
        const infoContent = document.getElementById('info-content');
        if (infoContent && buildingData) {
            const config = BUILDING_CONFIG[buildingData.type];
            infoContent.innerHTML = `
                <div class="building-details">
                    <h4>${config.name} - Édition</h4>
                    <p><strong>Position :</strong> ${buildingData.x}, ${buildingData.z}</p>
                    <p><strong>Taille :</strong> ${config.width}x${config.depth}</p>
                </div>
                <div class="edit-controls">
                    <button id="move-building" class="edit-btn move-btn">📦 Déplacer</button>
                    <button id="delete-building" class="edit-btn delete-btn">🗑️ Supprimer</button>
                    <button id="cancel-edit" class="edit-btn cancel-btn">✖ Annuler</button>
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
                        <li>🖱️ Clic gauche : Sélectionner / Placer</li>
                        <li>🖱️ Clic droit : Désélectionner</li>
                        <li>🖱️ Clic sur bâtiment : Éditer</li>
                        <li>🔄 Rotation : Clic gauche + glisser</li>
                        <li>📦 Déplacement : Clic droit + glisser</li>
                        <li>📜 Molette : Zoom</li>
                        <li>⎋ Echap : Annuler</li>
                    </ul>
                </div>
            `;
        }
    }

    updateResources(newResources) {
        this.resources = { ...this.resources, ...newResources };
        this.updateResourceDisplay();
    }

    showMessage(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 24px;
            right: 24px;
            background: ${type === 'error' ? '#ff6b6b' : '#4ecdc4'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            font-weight: 500;
        `;

        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
}

class CityBuilderGame {
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
        this.uiManager = null;
        this.currentHoverPos = null;
        this.movingBuilding = null;
        
        this.init();
    }

    init() {
        this.initThreeJS();
        this.initSocket();
        this.initManagers();
        this.initEventListeners();
        this.animate();
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
        this.gridSystem = new GridSystem(this.gridSize, this.cellSize);
        this.buildingManager = new BuildingManager(this.scene, this.gridSystem, this.socket);
        this.cameraController = new AdvancedCameraController(this.camera, this.renderer.domElement);
        this.uiManager = new UIManager(this.socket);
    }

    initEventListeners() {
        // Événements de sélection de bâtiment
        document.addEventListener('buildingSelected', (e) => {
            this.buildingManager.setSelectedBuilding(e.detail.type);
        });

        document.addEventListener('buildingCancelled', () => {
            this.buildingManager.clearSelection();
            this.currentHoverPos = null;
            this.movingBuilding = null;
        });

        // Événements d'édition
        document.addEventListener('deleteBuilding', () => {
            if (this.buildingManager.buildingToEdit) {
                this.buildingManager.removeBuilding(this.buildingManager.buildingToEdit.id);
                this.buildingManager.clearSelection();
                this.uiManager.showMessage('Bâtiment supprimé', 'success');
            }
        });

        document.addEventListener('startMoveBuilding', () => {
            if (this.buildingManager.buildingToEdit) {
                this.movingBuilding = this.buildingManager.buildingToEdit;
                this.uiManager.showMessage('Cliquez sur une nouvelle position pour déplacer le bâtiment', 'info');
            }
        });

        document.addEventListener('cancelEdit', () => {
            this.buildingManager.clearSelection();
            this.movingBuilding = null;
        });

        // Gestion du survol de la souris
        this.renderer.domElement.addEventListener('mousemove', (event) => {
            this.handleMouseMove(event);
        });

        // Gestion du clic
        this.renderer.domElement.addEventListener('click', (event) => {
            this.handleClick(event);
        });

        // Redimensionnement
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Empêcher le menu contextuel
        this.renderer.domElement.addEventListener('contextmenu', (e) => {
            e.preventDefault();
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
                
                // Mode déplacement de bâtiment
                if (this.movingBuilding) {
                    this.buildingManager.updatePreview(gridPos.x, gridPos.z, this.movingBuilding.type);
                }
                // Mode construction normale
                else if (this.buildingManager.selectedBuildingType) {
                    this.buildingManager.updatePreview(gridPos.x, gridPos.z);
                }
            }
        }
    }

    handleClick(event) {
        if (!this.currentHoverPos) return;

        // Mode déplacement de bâtiment
        if (this.movingBuilding) {
            try {
                this.buildingManager.moveBuilding(
                    this.movingBuilding.id,
                    this.currentHoverPos.x,
                    this.currentHoverPos.z
                );
                this.uiManager.showMessage('Bâtiment déplacé avec succès!', 'success');
                this.movingBuilding = null;
                this.buildingManager.clearSelection();
            } catch (error) {
                this.uiManager.showMessage(error.message, 'error');
            }
            return;
        }

        // Vérifier si on clique sur un bâtiment existant
        const building = this.buildingManager.getBuildingAtPosition(this.currentHoverPos.x, this.currentHoverPos.z);
        if (building) {
            // Éditer le bâtiment existant
            this.buildingManager.startEditBuilding(building.id);
            this.uiManager.showEditPanel(building);
            return;
        }

        // Mode construction normale
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
        
        this.renderer.render(this.scene, this.camera);
    }
}

// Démarrer le jeu
window.addEventListener('DOMContentLoaded', () => {
    new CityBuilderGame();
});