const controller = require("../controllers/user.controller");
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
  app.patch('/api/user/edit/:id',[authJwt.verifyToken], controller.editUser);
};
