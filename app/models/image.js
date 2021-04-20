const { Sequelize, DataTypes, Model } = require("sequelize");

module.exports = (sequelize, Sequelize) => {
  const Image = sequelize.define("images", {
    publicId: {
        type: DataTypes.STRING,
        required: true,
        primaryKey: true
    },
    url: {
        type: DataTypes.STRING,
        required: true
    },
    type: {
        type: DataTypes.ENUM,
        values: ['profile', 'gallery']
    }
  });

  return Image;
};