const { Sequelize, DataTypes, Model } = require("sequelize");

module.exports = (sequelize, Sequelize) => {
  const StaticData = sequelize.define("staticData", {
    genres: {
      type: Sequelize.ARRAY(Sequelize.STRING),
    },
    genders: {
      type: Sequelize.ARRAY(Sequelize.STRING),
    },
    countries: {
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
