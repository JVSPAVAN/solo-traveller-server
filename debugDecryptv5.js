const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PRIVATE_KEY = fs.readFileSync(path.join(__dirname, 'keys/private.pem'), 'utf8');

const encryptedPassword = "C8jesHdF8eKp1As/SDt4sl6RMJWEYm9vTRpOxL2EZZhN4pTAYmefzCJYMIv8mIQrPGrrtvognbXdMNcJGb7KxJyUXymd1CWvEThQSU05E7NCgjuOolngFBJpvgNg8+tD3V2LFgc3tlnSUgHM5vBBuR+/zXtFVEfAxLsHsZInpMsZeC3FAtfmHImjtLoFkLkvwLGcndu5eL1+Gr1iLS05vrGp+VH8FSOUcP0KawJnKOVDpsbRnHAXoEQafcr19cWjsmwFdzRvGiJuYI1xwitTTyuS25YKbyKO89Y4R1yDc/X/Sazg12EQJCbn1DB1nqI8BDKko5sRB1Ysmb8I+aYasA==";

try {
  // Simulate the fix I added
  const safePassword = encryptedPassword.replace(/ /g, '+');
  
  const buffer = Buffer.from(safePassword, 'base64');
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
  console.log("Payload Length:", encryptedPassword.length);
}
