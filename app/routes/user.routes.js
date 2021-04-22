const userController = require("../controllers/user.controller");
const userimageController = require("../controllers/userImage.controller");
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

  app.get('/api/user/:id',[authJwt.verifyToken], userController.getUserById);
  app.put('/api/user/edit',[authJwt.verifyToken], userController.editUser);
  app.get('/api/users',[authJwt.verifyToken], userController.getAllUser);
  app.post('/api/user/image/upload',[authJwt.verifyToken], userimageController.addUserImage);
  app.put('/api/user/image/update',[authJwt.verifyToken], userimageController.updateUserImage);
  app.delete('/api/user/image/delete', [authJwt.verifyToken], userimageController.deleteUserImage);
  app.get('/api/user/image/all',[authJwt.verifyToken], userimageController.getUserImage);
  app.get('/api/user/:id/playlist', userController.getPlaylist);
  app.post('/api/user/create/friendrequest', [authJwt.verifyToken], controller.createFriendRequest);
  app.put('/api/user/update/friendrequest', [authJwt.verifyToken], controller.updateFriendRequest);
  app.delete('/api/user/delete/friendrequest', [authJwt.verifyToken], controller.deleteFriendRequest);
};
 
