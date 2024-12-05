const express = require('express');
const app = express();
const mongoose = require('mongoose');
const upload = require('./multer-config');
const cloudinary = require('cloudinary').v2;
const path = require('path');
const IDCard = require('./models/IDCard');

const dotenv = require('dotenv');
dotenv.config();

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Mongoose configuration
mongoose.connect('mongodb://localhost:27017/idCardsDB')
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("Could not connect to MongoDB", err));

// Render upload page
app.get('/upload', (req, res) => {
  res.render('upload.ejs');
});

// Handle form submission
app.post('/upload', upload.single('filename'), (req, res) => {
  try {
    const stream = cloudinary.uploader.upload_stream({ folder: 'uploads' }, async (error, result) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error uploading image to Cloudinary' });
      }
      // Save ID Card info to MongoDB
      const { name, position, idNumber, email } = req.body;
      const newIDCard = new IDCard({
        name,
        position,
        idNumber,
        email,
        imageUrl: result.secure_url//result defines the object which contains the more characteristics like secure_url and many more.
      });

      await newIDCard.save();
      // Redirect to the ID card display page
      res.redirect(`/idcard/${newIDCard._id}`);
    });

    stream.end(req.file.buffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error uploading image to Cloudinary' });
  }
});

// Display ID card
app.get("/idcard/:id", async (req, res) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send('Invalid ID');
  }
  const idCard = await IDCard.findById(id);
  res.render("idcard", { idCard });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
