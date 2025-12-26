const sendNewSubscriptionToAdmin = (
  userName,
  plan,
  key,
  date
) => `<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Nouvelle Souscription</title>

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
            alt="EduBooster Logo"
            style="max-width: 160px; height: auto"
          />
        </div>

        <!-- Body -->
        <div style="padding: 30px; color: #000000">
          <h2 style="margin-top: 0; font-size: 20px; font-weight: 600">
            Nouvelle souscription
          </h2>

          <p style="font-size: 15px; line-height: 1.7">Bonjour, Admin,</p>

          <p style="font-size: 15px; line-height: 1.7">
            L'utilisateur <strong>${userName}</strong> vient de souscrire à la
            plateforme EduBooster.
          </p>

          <p style="font-size: 15px; line-height: 1.7">
            <strong>Plan :</strong> ${plan}<br />
            <strong>Activation Key :</strong> ${key}<br />
            <strong>Date :</strong> ${date}
          </p>

          <p style="font-size: 15px; line-height: 1.7">
            Veuillez vérifier et suivre la souscription si nécessaire.
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
const sendNewSubscriptionKeyToAdmin = (
  userName,
  plan,
  key,
  date
) => `<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Nouvelle demande de clé d'activation</title>

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
            alt="EduBooster Logo"
            style="max-width: 160px; height: auto"
          />
        </div>

        <!-- Body -->
        <div style="padding: 30px; color: #000000">
          <h2 style="margin-top: 0; font-size: 20px; font-weight: 600">
            Nouvelle demande de clé d'activation
          </h2>

          <p style="font-size: 15px; line-height: 1.7">Bonjour, Admin,</p>

          <p style="font-size: 15px; line-height: 1.7">
            L'utilisateur <strong>${userName}</strong> a demandé une nouvelle
            clé d'activation pour accéder à la plateforme EduBooster.
          </p>

          <p style="font-size: 15px; line-height: 1.7">
            <strong>Plan :</strong> ${plan}<br />
            <strong>Activation Key :</strong> ${key}<br />
            <strong>Date d'expiration :</strong> ${date}
          </p>

          <p style="font-size: 15px; line-height: 1.7">
            Veuillez envoyer cette clé à l'utilisateur pour lui permettre
            d'activer son compte.
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

const activationKeEmail = (userName, key, date) => `<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Activation de votre compte EduBooster</title>

    <!-- Poppins Font -->
    <link
      href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />
    <style>
      .key-container {
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #f0f0f0;
        padding: 10px;
        border-radius: 4px;
        font-weight: 600;
        font-size: 16px;
      }
      .copy-btn {
        margin-left: 10px;
        padding: 5px 10px;
        font-size: 14px;
        cursor: pointer;
        border: none;
        border-radius: 4px;
        background-color: #054175;
        color: white;
      }
    </style>
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
            alt="EduBooster Logo"
            style="max-width: 160px; height: auto"
          />
        </div>

        <!-- Body -->
        <div style="padding: 30px; color: #000000">
          <h2 style="margin-top: 0; font-size: 20px; font-weight: 600">
            Activation de votre compte
          </h2>

          <p style="font-size: 15px; line-height: 1.7">Bonjour, ${userName},</p>

          <p style="font-size: 15px; line-height: 1.7">
            Votre compte EduBooster a été créé avec succès. Pour accéder à la
            plateforme, veuillez utiliser la clé d'activation ci-dessous :
          </p>

          <!-- Activation key with copy button -->
          <div class="key-container">
            <span id="activationKey">${key}</span>
            <button class="copy-btn" onclick="copyKey()">Copier</button>
          </div>

          <p style="font-size: 15px; line-height: 1.7">
            Cette clé est valable jusqu'au :
            <strong>${date}</strong>
          </p>

          <p style="font-size: 15px; line-height: 1.7">
            Si vous n'avez pas créé de compte, veuillez ignorer cet e-mail.
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

    <script>
      function copyKey() {
        const key = document.getElementById("activationKey").innerText;
        navigator.clipboard.writeText(key).then(() => {
          alert("Clé d'activation copiée !");
        });
      }
    </script>
  </body>
</html>
`;

module.exports = {
  sendNewSubscriptionToAdmin,
  activationKeEmail,
  sendNewSubscriptionKeyToAdmin,
};
