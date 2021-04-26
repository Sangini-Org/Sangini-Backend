const { Sequelize, DataTypes, Model } = require("sequelize");

module.exports = (sequelize, Sequelize) => {
  const usertrack = sequelize.define("usertracks", {  
    tracklist:{
        type:Sequelize.ARRAY(Sequelize.STRING)
    }
  });


  return usertrack;
};
