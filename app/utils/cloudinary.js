require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'dwor7apdy',
  api_key: '953492358161521',
  api_secret: 'RnClK3wKMWOac9gTF2O7CMUmvLw'
});

module.exports ={ cloudinary };