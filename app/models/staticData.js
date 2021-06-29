const { Sequelize, DataTypes, Model } = require("sequelize");

module.exports = (sequelize, Sequelize) => {
  const StaticData = sequelize.define("staticData", {
    row: {
      type: Sequelize.STRING,
      primaryKey: true
    },
    genres: {
      type: Sequelize.ARRAY(Sequelize.STRING),
    },
    genders: {
      type: Sequelize.ARRAY(Sequelize.STRING),
    },
    states: {
      type: Sequelize.ARRAY(Sequelize.STRING),
    },
    tags: {
      type: Sequelize.ARRAY(Sequelize.STRING),
    },
    hobbies: {
      type: Sequelize.ARRAY(Sequelize.STRING),
    },
  });

  return StaticData;
};
