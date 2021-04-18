const { Sequelize, DataTypes, Model } = require("sequelize");

module.exports = (sequelize, Sequelize) => {
  const userPlaylist = sequelize.define("userPlaylist", {
    playlistId: {
        type: Sequelize.STRING,
        primaryKey: true,
    },  
    trackId: {
      type: Sequelize.STRING,
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


  return userPlaylist;
};
