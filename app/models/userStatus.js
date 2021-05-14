const { Sequelize, DataTypes, Model } = require("sequelize");

module.exports = (sequelize, Sequelize) => {
  const userStatus  = sequelize.define("userStatus", {  
    trackId: {
      type: Sequelize.STRING,
    },
    emoji: {
      type: Sequelize.STRING,
    },
    songLine: {
      type: Sequelize.STRING,
    },
    like: {
      type:Sequelize.ARRAY(Sequelize.STRING),
    }
  });
  return userStatus;
};
