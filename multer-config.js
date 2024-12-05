// multer-config.js

const multer = require('multer');
const storage = multer.memoryStorage();  // store image in memory
const upload = multer({ storage: storage });

module.exports = upload;