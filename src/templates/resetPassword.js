const resetPasswordLink = (resetUrl, name) => `<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Mot de passe oublié</title>

    <!-- Poppins Font -->
    <link
      href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />
  </head>

  <body
    style="
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
      font-family: 'Poppins', Arial, Helvetica, sans-serif;
    "
  >
    <div style="padding: 30px 0">
      <div
        style="
          max-width: 600px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        "
      >
        <!-- Header -->
        <div style="background: #054175; padding: 25px; text-align: center">
          <img
            src="https://res.cloudinary.com/dwitb5w7x/image/upload/v1766306271/Layer_1_guppaa.png"
            alt="SwiftGoma Logo"
            style="max-width: 160px; height: auto"
          />
        </div>

        <!-- Body -->
        <div style="padding: 30px; color: #000000">
          <h2 style="margin-top: 0; font-size: 20px; font-weight: 600">
            Mot de passe oublié
          </h2>

          <p style="font-size: 15px; line-height: 1.7">Bonjour, ${name},</p>

          <p style="font-size: 15px; line-height: 1.7">
            Vous avez demandé à réinitialiser votre mot de passe. Voici un code reinnitialisation pour créer un nouveau mot de passe :
          </p>

          

          <div style="text-align: center; margin: 30px 0">
            <span
              style="
                display: inline-block;
                background: #054175;
                color: #ffffff;
                padding: 15px 35px;
                font-size: 28px;
                letter-spacing: 6px;
                font-weight: 700;
                border-radius: 6px;
              "
            >
              ${resetUrl}
            </span>
          </div>

          <p style="font-size: 14px; font-weight: 500">
            ⏳ Ce lien est valide pendant <strong>05 minutes</strong>.
          </p>

          <p style="font-size: 14px; color: #555555">
            Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail en toute sécurité.
          </p>
        </div>

        <!-- Footer -->
        <div
          style="
            background: #054175;
            padding: 15px;
            text-align: center;
            font-size: 12px;
            color: #ffffff;
          "
        >
          © ${new Date().getFullYear()} EduBooster. Tous droits réservés.
        </div>
      </div>
    </div>
  </body>
</html>
`;

const passwordReseted = (name) => `<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Mot de passe réinitialisé</title>

    <!-- Poppins Font -->
    <link
      href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />
  </head>

  <body
    style="
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
      font-family: 'Poppins', Arial, Helvetica, sans-serif;
    "
  >
    <div style="padding: 30px 0">
      <div
        style="
          max-width: 600px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        "
      >
        <!-- Header -->
        <div style="background: #054175; padding: 25px; text-align: center">
          <img
            src="https://res.cloudinary.com/dwitb5w7x/image/upload/v1766306271/Layer_1_guppaa.png"
            alt="SwiftGoma Logo"
            style="max-width: 160px; height: auto"
          />
        </div>

        <!-- Body -->
        <div style="padding: 30px; color: #000000">
          <h2 style="margin-top: 0; font-size: 20px; font-weight: 600">
            Mot de passe réinitialisé
          </h2>

          <p style="font-size: 15px; line-height: 1.7">Bonjour, ${name},</p>

          <p style="font-size: 15px; line-height: 1.7">
            Votre mot de passe a été mis à jour. Vous pouvez désormais vous
            connecter à EduBooster avec votre nouveau mot de passe. Toutes les
            sessions précédentes ont été fermées et vous serez invité à vous
            reconnecter avec vos nouvelles informations.
          </p>
        </div>

        <!-- Footer -->
        <div
          style="
            background: #054175;
            padding: 15px;
            text-align: center;
            font-size: 12px;
            color: #ffffff;
          "
        >
          © ${new Date().getFullYear()} EduBooster. Tous droits réservés.
        </div>
      </div>
    </div>
  </body>
</html>
`;

module.exports = {
  resetPasswordLink,
  passwordReseted,
};
