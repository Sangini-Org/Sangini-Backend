const { Sequelize, DataTypes, Model } = require("sequelize");

module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("users", {
    id: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    username: {
      type: Sequelize.STRING,
    },
    email: {
      type: Sequelize.STRING,
    },
    password: {
      type: Sequelize.STRING,
    },
    firstName: {
      type: Sequelize.STRING,
    },
    lastName: {
      type: Sequelize.STRING,
    },
    state: {
      type: Sequelize.STRING,
    },
    city: {
      type: Sequelize.STRING,
    },
    gender: {
      type: Sequelize.STRING,
    },
    bio: {
      type: Sequelize.TEXT,
    },
    dob: {
      type: Sequelize.DATE,
    },
    image: {
      type: Sequelize.STRING,
    },
    isVerfified: {
      type: Sequelize.BOOLEAN,
    }
  });


  return User;
};
