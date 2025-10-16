const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const History = require('../models/History');

exports.detectFromUpload = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image uploaded' });

    const imagePath = path.join(__dirname, '..', req.file.path);
    const form = new FormData();
    form.append('image', fs.createReadStream(imagePath));

    const pyUrl = process.env.PY_FACE_SERVICE_URL || 'https://smart-vision-face-service.onrender.com/detect';
    const response = await axios.post(pyUrl, form, { 
      headers: form.getHeaders(),
      timeout: 30000 // 30 seconds timeout
    });

    const { faces } = response.data || { faces: [] };

    const history = new History({
      user: req.user.id,
      imageUrl: `/${req.file.path.replace(/\\/g, '/')}`,
      faces,
      faceCount: faces.length
    });
    await history.save();

    res.json({ imageUrl: history.imageUrl, faces, faceCount: faces.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Face detection failed', error: err.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (req.user.id !== userId) return res.status(403).json({ message: 'Forbidden' });

    const records = await History.find({ user: userId }).sort({ timestamp: -1 });
    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteHistory = async (req, res) => {
  try {
    const record = await History.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Not found' });
    if (String(record.user) !== String(req.user.id)) return res.status(403).json({ message: 'Forbidden' });

    if (record.imageUrl) {
      const filePath = path.join(__dirname, '..', record.imageUrl);
      try { 
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath); 
      } catch (fileErr) {
        console.error('Failed to delete file:', fileErr.message);
      }
    }

    await record.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
