const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PRIVATE_KEY = fs.readFileSync(path.join(__dirname, 'keys/private.pem'), 'utf8');

const encryptedPassword = "aTsQSet1ZQBxhaiVHfUi//y8YTRUsPgGXp5ZB73wI78aww4xisev8J9GkKtmFtsCoO4C1It/Cq9G9kLh+dZV6XzijvDfCNWGAcnWoShtLs9FJAEqlCcsX6RQD2yCnI0006myoSTt/cuxSJwSU+NoOo1qXKwqH8hFSsR2AQtiI7SxiUjkFmw+fOXciHVEL46uh5B7uweaEbMgikrD/lNH8FKLps4XSxLw1SZA5x0S7bRUy9Pi6uYI+QJO6v7s6g3Iind4QYA3VfbJ+MSclVZS8j1iIdMaPY7xxwW0zDSg2tR4tYqXA6P5yBS5h8Xiq4IAXc+Pn1M1YonN+0qYLUGXCg==";

try {
  const buffer = Buffer.from(encryptedPassword, 'base64');
  const decrypted = crypto.privateDecrypt(
    {
      key: PRIVATE_KEY,
      padding: crypto.constants.RSA_PKCS1_PADDING,
    },
    buffer
  );
  console.log("SUCCESS: Decrypted password is:", decrypted.toString('utf8'));
} catch (error) {
  console.error("FAIL: Decryption error:", error.message);
}
