const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const cors = require('cors');
const mongoose = require('mongoose');
const Tesseract = require('tesseract.js');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Set up storage for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/imageAnalysis', { useNewUrlParser: true, useUnifiedTopology: true });

const imageSchema = new mongoose.Schema({
  text: String,
  analysisResult: String,
});

const Image = mongoose.model('Image', imageSchema);

// Endpoint to handle image and text input
app.post('/analyze', upload.single('image'), (req, res) => {
  const { text } = req.body;
  const imageBuffer = req.file.buffer;

  Tesseract.recognize(imageBuffer, 'eng', { logger: m => console.log(m) })
    .then(({ data: { text: imageText } }) => {
      const newImage = new Image({
        text,
        analysisResult: imageText,
      });

      newImage.save().then(() => {
        res.json({ success: true, text, imageText });
      });
    })
    .catch(err => {
      res.status(500).json({ success: false, message: 'Error processing image', error: err });
    });
});

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
