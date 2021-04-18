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

    app.get('/api/connect', [authJwt.verifyToken], controller.authorizeSpotify);
    app.get('/api/callback',[authJwt.verifyToken], controller.spotifyToken);
    // app.get('/api/refreshtoken',[authJwt.verifyToken], controller.spotifyRefreshToken);
    app.get('/api/playlist/sync', controller.spotifyPlaylistSync)
}   