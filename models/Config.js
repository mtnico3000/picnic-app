const mongoose = require('mongoose');

const ConfigSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    default: 'Picnic Guru'
  },
  password: {
    type: String,
    required: true,
    trim: true,
    default: 'passw0rd'
  },
  amenitiesDistance: {
    type: Number,
    required: true,
    min: 20,
    max: 1500,
    default: 1000
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
ConfigSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Config', ConfigSchema);
