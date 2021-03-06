const controller = require("../controllers/spotify.controller");
const { authJwt } = require("../middleware");

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
          "Access-Control-Allow-Headers",
          "x-access-token, Origin, Content-Type, Accept"
        );
        next();
      });
    app.post('/api/connect',[authJwt.verifyToken], controller.spotifyToken);
    app.get('/api/playlist/sync',[authJwt.verifyToken],controller.spotifyPlaylistSync)
}   