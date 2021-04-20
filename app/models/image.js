const { Sequelize, DataTypes, Model } = require("sequelize");

module.exports = (sequelize, Sequelize) => {
  const Image = sequelize.define("images", {
    publicId: {
        type: Sequelize.STRING,
        required: true,
        primaryKey: true
    },
    url: {
        type: Sequelize.STRING,
        required: true
    },
    imgType: {
        type: Sequelize.STRING,
        values: ['profile', 'gallery']
    }
  });

  return Image;
};