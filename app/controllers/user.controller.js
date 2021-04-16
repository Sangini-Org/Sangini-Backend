const { user } = require("../models");
const db = require("../models");
const User = db.users;
const { sendJSONResponse, sendBadRequest } = require("../utils/handle")
const { getPagingData, getPagination } = require("../controller/paginate.js");

const Op = db.Sequelize.Op;

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
    await User.update({
        firstName,
        lastName,
        bio,
        state,
        city,
        gender
      },
      {
        where: {
          id: req.userId,
        },
      }
    );  
    return sendJSONResponse(res, 200, "profile updated successfully")
  }
  catch (err) {
    return sendBadRequest(res, 500, `${err.message}`)
  }
};

exports.getAllUser = async (req, res) => {
  try {
    const { page, offlimit, city, gender, username, state, firstName, lastName } = req.query;
    var condition = {};
    const filters = { city, gender, username, state, firstName, lastName };

    Object.entries(filters).forEach(filter => {
      Object.assign(condition, filter[1] ? { [filter[0]]: { [Op.like]: `%${filter[1]}%` } } : null);
    })
    const { limit, offset } = getPagination(page, offlimit);
    User.findAndCountAll({ where: condition, limit, offset })
      .then(data => {
        if (!data) { return sendBadRequest(res, 404, "Users Not Found"); }
        else {
          const response = getPagingData(data, page, limit);
          response.users.forEach(element => {
            delete element["dataValues"]["password"];
          });
          res.send(response);
        }
      })
  }
  catch (err) {
    return sendBadRequest(res, 500, 'Error while getting users list ' + err.message)
  }
};
