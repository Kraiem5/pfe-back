const nodemailer = require('nodemailer');

// Fonction pour envoyer l'e-mail à l'utilisateur
const sendEmailToUser = async (email, password) => {

  try {
    // Configuration du transporteur de messagerie
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'tragedela@gmail.com', // Remplacez par votre adresse e-mail
        pass: 'sxuqodqvepdjxpyl' // Remplacez par votre mot de passe
      }
    });
    // Définir les informations de l'e-mail
    const mailOptions = {
      from: 'kraiemabid300@gmail.com', // Remplacez par votre adresse e-mail
      to: email, // Adresse e-mail de l'utilisateur
      subject: 'Détails de connexion',
      html: `<p><b>Cher(e) membre</b>,</p>
         <p>Voici vos informations de compte pour accéder à nos services :</p>
         <p>Adresse e-mail : ${email}</p>
         <p>Mot de passe : ${password}</p>
         <p>Lors de votre première connexion, n'oubliez pas de changer votre mot de passe pour des raisons de sécurité. Assurez-vous de choisir un mot de passe fort et confidentiel.</p>
         <p>Si vous avez besoin d'une assistance supplémentaire ou si vous avez des questions, n'hésitez pas à nous contacter. Nous sommes là pour vous aider.</p>
         <p>Cordialement,</p>
         <p><strong>Tragedel</strong></p>
         <img src="https://www.tragedel.com/_next/image?url=%2FtragedelBlack.png&w=256&q=75" alt="Logo de l'entreprise" width="256" height="75">`
    };

    // Envoyer l'e-mail
    const info = await transporter.sendMail(mailOptions);
    console.log('E-mail envoyé :', info.response);
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'e-mail :', error);
  }
}

module.exports = { sendEmailToUser: sendEmailToUser }