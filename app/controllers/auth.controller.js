const db = require("../models");
const config = require("../config/auth.config");

// To send the email to the user
const sendUserEmail = require("../middleware/sendUserEmail");
const sendResetEmail = require("../middleware/sendResetEmail");
const User = db.users;
const { sendJSONResponse, sendBadRequest, generateRandomString } = require("../utils/handle")
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.signup = async (req, res) => {
  // Save User to Database
  try {
    let uniqueString = generateRandomString('hex');

    let user = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 8),
      uniqueString: uniqueString
    });

    if (user) {
      sendUserEmail(req.body.email, uniqueString);
      return sendJSONResponse(res, 200, 'User Registered Successfully');
    }
  }
  catch (err) {
    return sendBadRequest(res, 500, err.message);
  }
};

exports.signin = async (req, res) => {
  try {
    const user = await User.findOne({
      where: {
        username: req.body.username,
      },
    })
    if (!user) {
      return sendBadRequest(res, 404, "User Not Found");
    }
    const passwordIsValid = bcrypt.compareSync(
      req.body.password,
      user.password
    );
    if (!passwordIsValid) {
      return sendBadRequest(res, 401, "Invalid Password!");
    }
    const token = jwt.sign({ id: user.id }, config.secret, {
      expiresIn: 86400, // 24 hours
    });
    return sendJSONResponse(res, 200, "Signed In", {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      accessToken: token,
    })
  }
  catch (err) {
    return sendBadRequest(res, 500, `${err.message}`)
  }
};

exports.verifyUserEmail = async (req, res) => {
  try {
    const user = await User.findOne({ uniqueString: req.params.uniqueString });
    console.log(user);
    const date = new Date(user.updatedAt)
    if (!user)
      return sendBadRequest(res, 404, "User not found!");
    if (user.isVerified)
      return sendBadRequest(res, 401, "Invalid operation");

    let timeElapsed = (Date.now() - date.getTime()) / 1000;
    timeElapsed /= (60 * 60);
    timeElapsed = Math.abs(Math.round(timeElapsed));
    if (timeElapsed < 24) {
      user.isVerified = true;
      await user.save();
      return sendJSONResponse(res, 200, 'User Verified');
    }else {
      return sendJSONResponse(res, 200, 'Link Expired');
    }
  } catch (err) {
    return sendBadRequest(res, 401, err.message);
  }
}

// Resends the verification email if time limit of the verification link has passed
exports.resendVerificationEmail = async (req, res) => {
  try {
    const user = await User.findOne({ uniqueString: req.params.uniqueString });
    let uniqueString = generateRandomString('hex');

    user.uniqueString = uniqueString;
    await user.save();

    sendUserEmail(user.email, uniqueString);

    return sendJSONResponse(res, 200, "Email Resent");
  } catch (err) {
    return sendBadRequest(res, 401, "Invalid access");
  }
}
//to reset Password
exports.forgotPassword = async (req,res) => { 
  try{
    const user = await User.findOne({ email: req.body.email });
   // console.log(user);
    if (!user)
      return sendBadRequest(res, 404, "Invalid Email!");
    else{
      const forgetPasswordToken = jwt.sign({ user: user.email }, 
       config.resetSecret, { expiresIn: '10m' });
      user.forgetPasswordToken = forgetPasswordToken;
      
      await user.save();  
      sendResetEmail(user.email, forgetPasswordToken);
      return sendJSONResponse(res, 200, "Reset link sent");
    }
  } catch (err) {
    return sendBadRequest(res, 401, "Invalid access");
  }
}
exports.resetPassword = async(req,res) =>{
  const resetToken = req.params.token;
  const newPassword = req.body;

  if(resetToken) {
    jwt.verify(resetToken, config.resetSecret, (error, decodedToken) => {
         if(error) {
          return sendBadRequest(res, 404, "Token Invalid or Expired");
         }
    })
  }

  try{
    const user = await User.findOne({
      where:{ forgetPasswordToken:resetToken }
    });
   
    if(!user) {
      return sendBadRequest(res, 404, "We could not find a match for this!");
    }
    const hashPassword = bcrypt.hashSync(newPassword.password, 8);
    newPassword.password = hashPassword;
    //update password
    user.password=newPassword.password;
    user.forgetPasswordToken = null;
    await user.save();

    return sendJSONResponse(res, 200, "Password Updated");   
  }
  catch{
    return sendBadRequest(res, 401, "Invalid access");
  }

}