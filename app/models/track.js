const { Sequelize, DataTypes, Model } = require("sequelize");

module.exports = (sequelize, Sequelize) => {
  const track = sequelize.define("tracks", {  
    trackId: {
      type: Sequelize.STRING,
      primaryKey: true
    },
    trackImg: {
      type: Sequelize.STRING,
    },
    trackPreview: {
      type: Sequelize.STRING,
    },
    trackName: {
      type: Sequelize.STRING,
    }
  });


  return track;
};
