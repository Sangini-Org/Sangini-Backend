const { Sequelize, DataTypes, Model } = require("sequelize");

module.exports = (sequelize, Sequelize) => {
  const CityCountry = sequelize.define("cityCountry", {
    country: {
      type: Sequelize.STRING,
    },
    cities: {
      type: Sequelize.ARRAY(Sequelize.STRING),
      defaultValue:[],
    },
  });
  return CityCountry;
};