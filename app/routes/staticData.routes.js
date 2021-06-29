const staticDataController = require("../controllers/staticData.controller");

module.exports = function (app) {
    app.put('/api/staticdata', staticDataController.update);
    app.get('/api/staticdata', staticDataController.getData);
}