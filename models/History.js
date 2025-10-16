const mongoose = require('mongoose');

const FaceResultSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  imageUrl: { type: String },
  timestamp: { type: Date, default: Date.now },
  faces: { type: Array, default: [] },
  faceCount: { type: Number, default: 0 }
});

module.exports = mongoose.model('History', FaceResultSchema);
