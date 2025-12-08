const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PRIVATE_KEY = fs.readFileSync(path.join(__dirname, 'keys/private.pem'), 'utf8');

// Original with +
const original = "Bn9H+cy0nnSd45VyQKqioAp7L4OvFuT2zsOtKakKBWOzOQFgTKa+j0mOC16jpd1tHxIFUzhPqhvrVurKYlCjMWIYUButZieK03Hd4+6GrYogcS3V7m/Rtq+20KKyjg1j5Ui/5ES0WoqaprBw2X3c+1dCGtcJ2tucbseOZCbdpedgYI7tNg5LbevjHGr/Rkq4r7FkDF2YfKED/DFN91b+ygD/CaiM4iVfTF/DNZZDJofKrtyPH6GFAAn2mBQRXhgg2ibtgxytLH+NTt6w8lU7Eb/6cJ71p28JVCxd4NW8kwQNZ0zvVtHMKzIUVqrslznNlUR9Oz7TMubfGF2vQ/X7yg==";

// Corrupted with space
const corrupted = original.replace(/\+/g, ' ');

// Corrupted with %20
const urlEncoded = original.replace(/\+/g, '%20');

function tryDecrypt(label, payload) {
  try {
    const buffer = Buffer.from(payload, 'base64');
    const decrypted = crypto.privateDecrypt(
      {
        key: PRIVATE_KEY,
        padding: crypto.constants.RSA_PKCS1_PADDING,
      },
      buffer
    );
    console.log(`${label}: SUCCESS -> ${decrypted.toString('utf8')}`);
  } catch (error) {
    console.error(`${label}: FAIL -> ${error.message}`);
  }
}

tryDecrypt("ORIGINAL", original);
tryDecrypt("SPACE CORRUPTED", corrupted);
tryDecrypt("URL ENCODED", urlEncoded);
