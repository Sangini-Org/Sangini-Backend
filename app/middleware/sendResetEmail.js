const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid");
const { sendBadRequest, sendJSONResponse } = require("../utils/handle");

const Transport = nodemailer.createTransport({
  service:"SendGrid",
  auth: {
    user: "apikey",
    pass: process.env.SENDGRID_API_KEY
  }
});

module.exports = (email, forgetPasswordToken) => {
  let mailOptions = {
    from: 'devkumar5436@gmail.com',
    to: email,
    subject: "Reset-password-Link",
    html: `Click  <a href="http://localhost:8080/api/auth/resetPassword/${forgetPasswordToken}"> here </a> to reset your password. Thanks`
  };

  // Transport.verify((error, success) => {
  //   if(error)
  //     console.log(error.message);
  //   else {
  //     console.log("Connection successful");
  //   }
  // });
  Transport.sendMail(mailOptions)
  .then( () => {
    console.log("Email sent.");
  })
  .catch((err) => {
    console.log("Email not sent");
    console.log(err);
  });
}
