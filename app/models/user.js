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
      unique: true,
    },
    email: {
      type: Sequelize.STRING,
      isEmail: true,
      unique: true,
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
      defaultValue: false
    },
    spotifyPlaylistId: {
      type: Sequelize.STRING,
    },
    isProfileUpdated: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    updateState: {
        // 0: "NOTHING"
        // 1: "PROFILE"
        // 2: "PROFILE UPLOAD"
        // 3: "PLAYLIST SYNC"
        // 4: "ETC"
        // 10: "Complete"
      type: Sequelize.STRING,
      defaultValue: 0
    },
    hobbies: {
      type: Sequelize.ARRAY(Sequelize.STRING),
    }
  });


  return User;
};
