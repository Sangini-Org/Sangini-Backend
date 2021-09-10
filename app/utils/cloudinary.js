require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'ranjitkshah',
  api_key: '194328725957486',
  api_secret: '9pfsKrHhdxOMjxwl1ADjgZTB2Eg'
});

module.exports ={ cloudinary };