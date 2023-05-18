const nodemailer = require('nodemailer');

const send = (x = "", sendto, subjects, htmls) => {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: "belkhiriaahmed617@gmail.com",
      pass: Mailer_Password = "lgliydhcthrvgnep"
    }
  });
  let mailOptions = {
    from: "kraiemabid300@gmail.com",
    to: sendto,
    subject: subjects,
    html: "<b> salut</b>" +
      `<br> votre lien de recuperation <a href="http://localhost:4200/reset-password/${htmls}"> http://localhost:4200/reset-password/${htmls}</a>`
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent:' + info.response);
    }
  });
}
module.exports = { send: send }