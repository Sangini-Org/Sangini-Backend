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
    isVerfified: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    uniqueString: {
      type: DataTypes.STRING
    },
    spotifyRefreshToken: {
      type: Sequelize.STRING,
    },
    isSpotifyConnected: {
      type: Sequelize.BOOLEAN, 
    },
    spotifyPlaylistId: {
      type: Sequelize.STRING,
    },
    isProfileUpdated: {
      type: Sequelize.BOOLEAN, 
    }
  });


  return User;
};
