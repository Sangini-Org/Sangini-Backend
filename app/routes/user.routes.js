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
  app.put('/api/user/edit',[authJwt.verifyToken], controller.editUser);
<<<<<<< HEAD
  app.get('/api/users',[authJwt.verifyToken], controller.getAllUser);
=======
  app.post('/api/user/register', controller.registerUser);
  app.get('/api/user/verify/:uniqueString', [authJwt.verifyToken], controller.verifyUser);
>>>>>>> New environment for pull requests
};
