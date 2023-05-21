const nodemailer = require('nodemailer');

// Fonction pour envoyer l'e-mail à l'utilisateur
const sendEmailToUser = async (email, password) => {
  try {
    // Configuration du transporteur de messagerie
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'belkhiriaahmed617@gmail.com', // Remplacez par votre adresse e-mail
        pass: 'lgliydhcthrvgnep' // Remplacez par votre mot de passe
      }
    });

    // Définir les informations de l'e-mail
    const mailOptions = {
      from: 'kraiemabid300@gmail.com', // Remplacez par votre adresse e-mail
      to: email, // Adresse e-mail de l'utilisateur
      subject: 'Détails de connexion',
      text: `Cher utilisateur,\n\nVoici vos informations de connexion :\n\nAdresse e-mail : ${email}\nMot de passe : ${password}\n\nCordialement,\nVotre entreprise`
    };

    // Envoyer l'e-mail
    const info = await transporter.sendMail(mailOptions);
    console.log('E-mail envoyé :', info.response);
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'e-mail :', error);
  }
}

// Exemple d'utilisation
const utilisateurEmail = 'utilisateur@example.com'; // Adresse e-mail de l'utilisateur
const utilisateurMotDePasse = 'MotDePasseSecret'; // Mot de passe de l'utilisateur

sendEmailToUser(utilisateurEmail, utilisateurMotDePasse);
module.exports = { sendEmailToUser: sendEmailToUser }