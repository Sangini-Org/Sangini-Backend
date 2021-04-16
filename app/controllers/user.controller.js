const { user } = require("../models");
const db = require("../models");
const User = db.users;
const { sendJSONResponse, sendBadRequest } = require("../utils/handle")

const Op = db.Sequelize.Op;

const getPagination = (page, offlimit) => {
  const limit = offlimit ? +offlimit : 5;
  const offset = page ? (page - 1) * limit : 0;
  return { limit, offset };
};

const getPagingData = (data, page, limit) => {
  const { count: totalItems, rows: users } = data;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);
  users.forEach(element => {
    delete element["dataValues"]["password"];
  });
  return { totalItems, users, totalPages, currentPage };
};

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

    const { page, offlimit, city, gender, name } = req.query;
    var condition ={};
    Object.assign(condition,city ? { city: { [Op.like]: `%${city}%` } } : null); 
    Object.assign(condition,gender ? { gender: { [Op.like]: `%${gender}%` } } : null); 
    Object.assign(condition,name ? { name: { [Op.like]: `%${name}%` } } : null); 

    const { limit, offset } = getPagination(page, offlimit);
    User.findAndCountAll({ where: condition, limit, offset })
      .then(data => {
          if (!data) {return sendBadRequest(res, 404, "Users Not Found");}
          else{
          const response = getPagingData(data, page, limit);
          res.send(response);
          }    
      })
    }
  catch (err) {
    return sendBadRequest(res, 500, `${err.message}`)
  }
};