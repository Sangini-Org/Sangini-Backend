const { Sequelize, DataTypes, Model } = require("sequelize");

module.exports = (sequelize, Sequelize) => {
  const userStatus  = sequelize.define("userStatus", {  
    trackId: {
      type: Sequelize.STRING,
      require:true
    },
    emoji: {
      type: Sequelize.STRING,
      require:true
    },
    songLine: {
      type: Sequelize.STRING,
      require:true
    },
    like: {
      type:Sequelize.ARRAY(Sequelize.STRING),
    },
    likeCount:{
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
  });
  return userStatus;
};
