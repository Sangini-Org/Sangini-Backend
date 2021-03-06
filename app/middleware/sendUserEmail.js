const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid");
const { sendBadRequest, sendJSONResponse } = require("../utils/handle");

const Transport = nodemailer.createTransport({
  service:'SendGrid',
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY
  }
});

module.exports = (email, uniqueString) => {
  let mailOptions = {
    from: 'devkumar5436@gmail.com',
    to: email,
    subject: "Email confirmation",
    html: `Press <a href="http://localhost:8080/api/auth/verify/${uniqueString}"> here </a> to verify your email. Thanks`
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
