const mongoose = require('mongoose');

const PicnicSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  coordinates: {
    lat: {
      type: Number,
      required: true,
      default: 0
    },
    lng: {
      type: Number,
      required: true,
      default: 0
    }
  },
  zoomLevel: {
    type: Number,
    default: 13
  },
  description: {
    type: String,
    trim: true
  },
  amenities: {
    type: String,
    trim: true
  },
  items: [{
    name: {
      type: String,
      trim: true
    },
    list: {
      type: String,
      trim: true
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Picnic', PicnicSchema);
