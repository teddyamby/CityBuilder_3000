const mongoose = require('mongoose');

const buildingSchema = new mongoose.Schema({
  x: {
    type: Number,
    required: true
  },
  z: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['house', 'road', 'factory', 'powerplant', 'school']
  },
  playerId: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index pour éviter les doublons de position
buildingSchema.index({ x: 1, z: 1 }, { unique: true });

module.exports = mongoose.model('Building', buildingSchema);