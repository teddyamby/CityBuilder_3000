const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  resources: {
    money: {
      type: Number,
      default: 1000
    },
    materials: {
      type: Number,
      default: 500
    },
    population: {
      type: Number,
      default: 0
    }
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Player', playerSchema);