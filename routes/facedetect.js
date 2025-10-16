const express = require('express');
const multer = require('multer');
const path = require('path');
const authMiddleware = require('../middleware/authMiddleware');
const faceController = require('../controllers/faceController');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, process.env.UPLOAD_DIR || 'uploads'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

// Accept only image files
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.test(ext)) return cb(null, true);
    cb(new Error('Only images are allowed'));
  }
});

router.post('/facedetect', authMiddleware, upload.single('image'), faceController.detectFromUpload);
router.get('/history/:userId', authMiddleware, faceController.getHistory);
router.delete('/history/:id', authMiddleware, faceController.deleteHistory);

module.exports = router;
