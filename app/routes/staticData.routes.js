const staticDataController = require("../controllers/staticData.controller");

module.exports = function (app) {
    app.post('/api/staticdata', staticDataController.initalize);
    app.put('/api/staticdata', staticDataController.update);
    app.get('/api/staticdata', staticDataController.getData);
    app.delete('/api/staticdata', staticDataController.reset);

}