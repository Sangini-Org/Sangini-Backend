const { Sequelize, DataTypes, Model } = require("sequelize");

module.exports = (sequelize, Sequelize) => {
  const FriendRequest = sequelize.define("friendrequests", {
    senderId: {
        type: DataTypes.UUID,
        primaryKey: true
    },
    receiverId: {
        type: DataTypes.UUID,
        primaryKey: true
    },
    status: {
        // Status states
        // =============
        // 1: "pending"
        // 2: "accepted"
        // 3: "rejected"
        // 4: "blocked"

        type: DataTypes.INTEGER,
        defaultValue: 1
    }
  });

  return FriendRequest;
};
