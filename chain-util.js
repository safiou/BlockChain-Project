const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const uuidV1 = require('uuid/v1');
const SHA256 = require('crypto-js/sha256');
const jwt = require('jsonwebtoken');

class chainUtil{
    static genKeyPair(){
        return ec.genKeyPair();
    }
    static uuid(){
        return uuidV1()
    }
    static hash(data){
        return SHA256(JSON.stringify(data)).toString();
    }
    static verifySignature(signature,publicKey,dataHash){
        return ec.keyFromPublic(publicKey ,'hex').verify(dataHash,signature);
    }
}
const JWT_SIGN_SECRET = "nvjvqkvnzkejgnvqzzdiaubfvluq@164183186nlc!!!!!!qsqjdfqybfaazdul"
const generateToken = (user) => {
    return jwt.sign({
        "userName" : user.userName,
        "isAdmin"  : user.isAdministrator,
    },JWT_SIGN_SECRET,{
        expiresIn : "1h"
    })
}
const parseAuthorization = (authorization) => {
    return authorization != null ? authorization.replace('Bearer ','') : null;
}
const verifyToken = async (authorization) => {
    var userName = "1";
    //var token = module.exports.parseAuthorization(authorization);
    var token = authorization;
    //console.log(token);
    if (token != null){
        try{
            var jwtToken = await jwt.verify(token,JWT_SIGN_SECRET);
            
        }catch(err){
            return err
        }
    }
    return jwtToken;
}
module.exports = {chainUtil,generateToken,verifyToken,parseAuthorization};