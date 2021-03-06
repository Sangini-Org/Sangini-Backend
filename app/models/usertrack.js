const { Sequelize, DataTypes, Model } = require("sequelize");

module.exports = (sequelize, Sequelize) => {
  const usertrack = sequelize.define("usertracks", {
    tracklist: {
      type: Sequelize.ARRAY(Sequelize.STRING)
    },
    artistList: {
      type: Sequelize.ARRAY(Sequelize.STRING)
    },
    artistCount: {
      type: Sequelize.INTEGER
    }
  });


  return usertrack;
};
