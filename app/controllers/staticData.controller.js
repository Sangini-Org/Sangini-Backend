let csc = require("country-state-city").default;
const db = require("../models");
const StaticData = db.staticData;
const CityCountry = db.cityCountry;

const { sendJSONResponse, sendBadRequest } = require("../utils/handle");

const assign = async (userId) => {
  try {
    let countryList = [];
    let allcountry = csc.getAllCountries();
    for (let c of allcountry) {
      let cityList = [];
      let allcity = csc.getCitiesOfCountry(c.isoCode);
      for (let city of allcity) {
        cityList.push(city.name);
      }
      let result = await CityCountry.create({
        country: c.name,
        city: cityList,
      });
      countryList.push(result.country);
    }
    return countryList;
  } catch (err) {
    console.log("Error while getting country-state-city " + err);
  }
};

exports.initalize = async (req, res) => {
  try {
    let countryList = [];
    countryList = await assign();
    console.log("1", countryList);

    let result = await StaticData.create({
      genres: ["Pop", "Rap", "Rock", "Hip Hop", "Jazz"],
      genders: ["Male", "Female", "Other"],
      countries: countryList,
      tags: ["New", "BestOf2019"],
      hobbies: ["Blogging", "Cycling", "Photography", "Programming"],
    });
    if (result) {
      return sendJSONResponse(res, 200, "staticData Added Successfully");
    }
  } catch (err) {
    return sendBadRequest(res, 500, err.message);
  }
};

exports.update = async (req, res) => {
  try {
    const { genres, genders, countries, tags, hobbies } = req.body;
    const data = { genres, genders, countries, tags, hobbies };

    let result = await StaticData.update(data);
    if (result) {
      return sendJSONResponse(res, 200, "staticData Updated Successfully");
    }
  } catch (err) {
    return sendBadRequest(res, 500, err.message);
  }
};

exports.getData = async (req, res) => {
  try {
    const { type, location } = req.query;

    let static = await StaticData.findAll({ attribute: type });
    let loc = await CityCountry.findAll({ attribute: location });

    if (static || loc) {
      return sendJSONResponse(res, 200, { static, loc });
    }
    return sendBadRequest(res, 404, "Failed to get static Data ");
  } catch (err) {
    return sendBadRequest(res, 500, err.message);
  }
};

exports.reset = async (req, res) => {
  try {

    let static = await StaticData.destroy();
    let loc = await CityCountry.destroy();

    if (static && loc) {
      return sendJSONResponse(res, 200,"Deleted");
    }
    return sendBadRequest(res, 404, "Failed ");
  } catch (err) {
    return sendBadRequest(res, 500, err.message);
  }
};
