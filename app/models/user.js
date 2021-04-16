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
<<<<<<< HEAD:app/models/user.js
    dob: {
      type: Sequelize.DATE,
    },
    image: {
      type: Sequelize.STRING,
    },
    isVerfified: {
      type: Sequelize.BOOLEAN,
=======
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    uniqueString: {
      type: DataTypes.STRING
>>>>>>> Added Features::app/models/user.model.js
    }
  });

  return User;
};
