const db = require("../models");
const User = db.user;
const { sendJSONResponse, sendBadRequest } = require("../utils/handle")

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findOne({
      where: {
        id: req.params.id,
      },
    })
    if (!user) {
      return sendBadRequest(res, 404, "User Not Found");
    }
    delete user["dataValues"]["password"];
    return sendJSONResponse(res, 200, "User exists", {
      user
    })
  }
  catch (err) {
    return sendBadRequest(res, 500, `${err.message}`)
  }
};

exports.editUser = async (req, res) => {
  try {
    const {firstName, lastName, bio, state, city, gender} = req.body;
    const user = await User.update({
        firstName,
        lastName,
        bio,
        state,
        city,
        gender
      },
      {
        where: {
          id: req.params.id,
        },
      }
    );
    if (!user) {
      return sendBadRequest(res, 404, "User Not Found");
    }
    console.log(user);
    delete user["dataValues"]["password"];
    return sendJSONResponse(res, 200, "User updated", {
      user
    })
  }
  catch (err) {
    return sendBadRequest(res, 500, `${err.message}`)
  }
};
