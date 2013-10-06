var nodemailer = require("nodemailer");

function isEmpty(str) {
  return (!str || 0 === str.length);
}

// send mail with defined transport object

exports.sendMyMail = function(mailOptions, transportOptions) {

  if(transportOptions.isEmpty) {
    console.error("Invalid transport options");
    return;
  }

  if (mailOptions.isEmpty) {
    console.error("Invalid mailing options");
    return;
  }

 // create reusable transport method (opens pool of SMTP connections)
  smtpTransport = nodemailer.createTransport("SMTP", transportOptions);
  
  smtpTransport.sendMail(mailOptions, function(error, response) {
    if(error) {
      console.log(error);
    } else {
      console.log("Message sent: " + response.message);
    }
  
    smtpTransport.close(); // shut down the connection pool, no more messages
    if (error) {
      return false;
    }
    return true;
  });
}
