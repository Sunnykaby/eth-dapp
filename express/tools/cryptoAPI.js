const fs = require('fs');
const crypto = require('crypto');
const algorithm = 'aes-256-ctr';

//对称加密算法---AES 256
exports.encryptAES = (buffer,password)=>{
    let cipher = crypto.createCipher(algorithm,password)
    let crypted = Buffer.concat([cipher.update(buffer),cipher.final()]);
    return crypted;
}
exports.decryptAES = (buffer,password)=>{
    let decipher = crypto.createDecipher(algorithm,password)
    let dec = Buffer.concat([decipher.update(buffer) , decipher.final()]);
    return dec;
}