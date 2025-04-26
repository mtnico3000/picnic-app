const mongoose = require('mongoose');

// Define the amenity schema
const AmenitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  emoji: {
    type: String,
    required: true
  },
  color: {
    type: String,
    required: true
  },
  enabled: {
    type: Boolean,
    default: true
  },
  queryKey: {
    type: String,
    required: true
  }
});

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
  amenities: {
    type: [AmenitySchema],
    default: [
      { name: 'Fire Pits', emoji: '🔥', color: '#dc3545', enabled: true, queryKey: 'firepit' },
      { name: 'BBQs', emoji: '🍖', color: '#fd7e14', enabled: true, queryKey: 'bbq' },
      { name: 'Drinking Water', emoji: '💧', color: '#0d6efd', enabled: true, queryKey: 'water' },
      { name: 'Picnic Sites', emoji: '🧺', color: '#198754', enabled: true, queryKey: 'picnicSite' },
      { name: 'Picnic Tables', emoji: '🪑', color: '#6610f2', enabled: true, queryKey: 'picnicTable' },
      { name: 'Toilets', emoji: '🚻', color: '#6c757d', enabled: true, queryKey: 'toilets' },
      { name: 'Showers', emoji: '🚿', color: '#20c997', enabled: true, queryKey: 'shower' },
      { name: 'Waste Baskets', emoji: '🗑️', color: '#ffc107', enabled: true, queryKey: 'wasteBasket' },
      { name: 'Waste Disposal', emoji: '♻️', color: '#adb5bd', enabled: true, queryKey: 'wasteDisposal' },
      { name: 'Recycling', emoji: '♻️', color: '#007bff', enabled: true, queryKey: 'recycling' },
      { name: 'Shelters', emoji: '⛺', color: '#6f42c1', enabled: true, queryKey: 'shelter' },
      { name: 'Benches', emoji: '🪑', color: '#17a2b8', enabled: true, queryKey: 'bench' },
      { name: 'Camp Sites', emoji: '🏕️', color: '#28a745', enabled: true, queryKey: 'campSite' },
      { name: 'Viewpoints', emoji: '🏞️', color: '#e83e8c', enabled: true, queryKey: 'viewpoint' }
    ]
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
