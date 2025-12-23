const verificationCodeTemplate = (code, name) => `
<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Email Verification</title>

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
            Vérification de votre compte
          </h2>

          <p style="font-size: 15px; line-height: 1.7">Bonjour, ${name}</p>

          <p style="font-size: 15px; line-height: 1.7">
            Pour finaliser la création de votre compte, veuillez utiliser le
            code de vérification ci-dessous :
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
              ${code}
            </span>
          </div>

          <p style="font-size: 14px; font-weight: 500">
            ⏳ Ce code est valide pendant <strong>10 minutes</strong>.
          </p>

          <p style="font-size: 14px; color: #555555">
            Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer
            cet e-mail en toute sécurité.
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

const newVerificationCodeTemplate = (code, name) => `
<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>New Verification Code</title>

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
            Nouveau code de Verification
          </h2>

          <p style="font-size: 15px; line-height: 1.7">Bonjour, ${name}</p>

          <p style="font-size: 15px; line-height: 1.7">
            Vous avez demander un nouveau code, veuillez le code ci-dessous :
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
              ${code}
            </span>
          </div>

          <p style="font-size: 14px; font-weight: 500">
            ⏳ Ce code est valide pendant <strong>10 minutes</strong>.
          </p>

          <p style="font-size: 14px; color: #555555">
            Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer
            cet e-mail en toute sécurité.
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

module.exports = { verificationCodeTemplate, newVerificationCodeTemplate };
