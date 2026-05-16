const express = require('express');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const cors = require('cors');

const app = express();
// Middleware para permitir que el frontend se comunique con este backend
app.use(cors());
app.use(express.json());

// Variable en memoria para guardar el secreto temporalmente
let secret = null;

// ENDPOINT 1: Generar secreto y código QR
app.get('/generate', async (req, res) => {
  // Genera el secreto de TOTP
  secret = speakeasy.generateSecret({
    name: "Práctica MFA UNIDAD 5"
  });

  // Convierte la URL del secreto a una imagen QR en Base64
  const qrImage = await qrcode.toDataURL(secret.otpauth_url);

  // Envía el QR y el secreto al cliente
  res.json({
    secret: secret.base32,
    qr: qrImage
  });
});

// ENDPOINT 2: Validar el token que ingrese el usuario
app.post('/validate', (req, res) => {
  const { token } = req.body;

  // Verifica si el token ingresado coincide con el código actual del secreto
  const verified = speakeasy.totp.verify({
    secret: secret.base32,
    encoding: 'base32',
    token: token,
    window: 1 // Permite un margen de error de 30 segundos
  });

  res.json({ valid: verified });
});

// Iniciar el servidor en el puerto 4000
app.listen(4000, () => console.log("Servidor Node.js MFA corriendo en http://localhost:4000"));