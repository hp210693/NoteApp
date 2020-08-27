var RSAKey = require('react-native-rsa');
var rsa;

/**
 * @return {*The public key is json encoded string} publicKey
 * @return {*The private key is json encoded string}} privateKey
 */
function generateRSAKeys() {
  const bits = 1024;
  const exponent = '10001'; // must be a string
  rsa = new RSAKey();
  var r = rsa.generate(bits, exponent);
  var publicKey = rsa.getPublicString(); // return json encoded string
  var privateKey = rsa.getPrivateString(); // return json encoded string
  return [publicKey, privateKey];
}

/**
 *
 * @param {*The message can be decrypted} cipherText
 * @param {*The private key is string} privateKey
 * @return {*The encrypted message to be decrypted.} decrypted
 */
function decryptRSA(cipherText, privateKey) {
  rsa.setPrivateString(privateKey);
  var decrypted = rsa.decrypt(cipherText); // decrypted == originText
  return decrypted;
}

module.exports = { generateRSAKeys, decryptRSA };
