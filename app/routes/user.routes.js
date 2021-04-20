const controller = require("../controllers/user.controller");
const iController = require("../controllers/image.controller");
const { authJwt } = require("../middleware");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get('/api/user/:id',[authJwt.verifyToken], controller.getUserById);
  app.put('/api/user/edit',[authJwt.verifyToken], controller.editUser);
  app.get('/api/users',[authJwt.verifyToken], controller.getAllUser);
  app.put('/api/upload',[authJwt.verifyToken], iController.addImage);
  app.get('/api/image',[authJwt.verifyToken], iController.getImage);
};
