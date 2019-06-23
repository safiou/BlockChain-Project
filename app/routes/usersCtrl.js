const bcrypt = require('bcrypt');
const user = require('../models/user');
const transactionList = require('../models/transaction');
const jwt = require('../../chain-util');

const blc = require('../../BlockChain/blockChain');
const wallet = require('../../Wallet');
const p2pServer = require('../p2p-server');
const miner = require('../miner');
const tp = require("../../Wallet/transaction-pool");

const blockchain = new blc();
const transactionPool = new tp();
const P2pserver = new p2pServer(blockchain, transactionPool);


function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}
module.exports = {
    register: (req, res) => {
        const username = req.body.userName;
        const firstname = req.body.firstName;
        const lastname = req.body.lastName;
        const email = req.body.email;
        const password = req.body.password;
        if (username == "" || req.body.firstname == "" || lastname == "" || email == "" || password == "") {
            console.log('err')
            return res.status(400).json({ 'error': 'missing parameters' });
        }
        if (!validateEmail(email)) return res.status(400).json({ 'error': 'email incorrect' })
        user.findUser(username, (response) => {
            if (response != null) {
                res.status(400).json({
                    Success: "False",
                    Message: "this username existed please change this"
                });
            }
            else {
                bcrypt.hash(password, 5, (err, bcryptedPassword) => {
                    const User = new user(firstname, lastname, username, email, bcryptedPassword);
                    User.createUser();
                    res.status(201).json({
                        Success: "True",
                        Message: "user created successful"
                    });
                });
            }
        });
    },
    login: (req, res) => {
        const username = req.body.userName;
        const password = req.body.password;
        if (username == "" || password == "") {
            return res.status(401).json({ "error": "missing parameter" });
        }
        user.findUser(username, (response) => {
            if (response == null) res.status(400).send({ "error": "user not found" })
            bcrypt.compare(password, response.password, (err, bcryptCompare) => {
                if (!bcryptCompare) {
                    res.status(400).send({ "error": "email/password incorrect" })
                    return
                }
                const user = {
                    "userName": response.userName,
                    "firstName": response.firstName,
                    "lastName": response.lastName,
                    "email": response.email,
                    "isAdmin": response.isAdministrator,
                    "balance": response.balance,
                }
                return res.status(200).send({
                    user,
                    "token": jwt.generateToken(response)
                });
            })
        })
    },
    logout: async (req, res) => {
        var authorization = req.headers['authorization'];
        //console.log(authorization.replace('Bearer',""));

        const verifyToken = await jwt.verifyToken(authorization);
        res.send(verifyToken);
    },
    newTransaction: async (req, res) => {
        // token = req.body.token;
        // var authorization = req.headers['authorization'];
        var authorization = req.body.token;
        //console.log(authorization)
        if (authorization == null) res.status(400).send({
            Success : "false",
            message : "this request require the token"
        });
        // verification du token
        const verifyToken = await jwt.verifyToken(authorization);
        if (verifyToken.message) res.status(400).send(verifyToken);

        var senderName = verifyToken.userName;
        var recipientName = req.body.recipientName;
        // le montant à envoyer
        var amount = parseInt(req.body.amount);
        user.findUser(recipientName, (response) => {
            if (response == null) res.status(400).send({
                Success : "true",
                message : "recipient user not found please use the suggestion"
            });
            user.findUser(senderName, (result) => {
                var senderBalence = parseInt(result.balance);
                if (amount > senderBalence) res.status(400).send({
                    Success : "false",
                    message : `Amount exceceds your current balance : ${amount}`
                });

                //creation du portefeuille de l'éméteur et du receveur de la transaction
                const senderwallet = new wallet(senderBalence);
                user.findUser(recipientName, (result) => {
                    var recipientBalance = parseInt(result.balance);
                    const recipientWallet = new wallet(recipientBalance);
                    senderwallet.createTransaction(amount, recipientWallet.publicKey, transactionPool, blockchain);
                    const Miner = new miner(blockchain, transactionPool, senderwallet, P2pserver);
                    Miner.mine();
                    //var new_senderBalence = senderwallet.calculBalance(blockchain);
                    var new_senderBalence = senderBalence - amount;
                    var new_recipientBalance = recipientWallet.calculBalance(blockchain);
                    //var new_recipientBalance = recipientBalance + amount 
                    var timestamp = Date.now();
                    var newTransHistory = new transactionList(senderName, recipientName, timestamp, amount);
                    newTransHistory.insertTransaction();
                    user.updateBalance(senderName, new_senderBalence);
                    user.updateBalance(recipientName, new_recipientBalance);

                    res.status(200).json({Success : 'true',message : "transaction success"});
                })

            })
        })
        // else res.send("verifyToken");

        //creation du portefeuille du receveur de la transaction
        //senderWallet.createTransaction(amount,recipientWallet.publicKey,transactionPool,)
    },
    userTransaction: async (req, res) => {
        var authorization = req.query.token ? authorization=req.query.token : authorization=null
        if (authorization == null ) res.status(400).send({
            Success : "false",
            message : "this request require the token"
        });
        const verifyToken = await jwt.verifyToken(authorization);
        if (verifyToken.message) {
            res.status(400).send(verifyToken);
            return
        }
        var userName = verifyToken.userName;
        var sended = [];
        var receved = [];
        transactionList.getUserTransaction((transaction_List) => {
            transaction_List.filter(t => {
                if (t.senderName == userName) sended.push(t);
                if (t.recipientName == userName) receved.push(t);
            });
            var objectTransaction = {
                send: sended,
                received: receved
            }
            //console.log(objectTransaction)
            res.status(200).json(objectTransaction);
        });
    },
    blocks: async (req, res) => {
        // 
        
        res.status(200).json(blockchain.chain);
    },
    editProfil: async(req, res) => {
        var authorization = req.body.token;
        if (authorization == null) res.status(400).send({
            Success : "false",
            message : "this request require the token"
        });
        // verification du token
        const verifyToken = await jwt.verifyToken(authorization);
        if (verifyToken.message) res.status(400).send(verifyToken);
        var userName = verifyToken.userName;
        var newProfil = {
            firstName: req.body.firstName,
            firstName: req.body.lastName,
            firstName: req.body.email,
        }
        user.updateProfil(userName, newProfil);
    },
    editPassword: (req, res) => {

        var userName = "";
        var currentPassword = req.body
        var newPassword = req.body
        user.findUser(userName, (result) => {
            bcrypt.compare(currentPassword, result.password, (err, bcryptCompare) => {
                if (!bcryptCompare) res.status(400).send("the current password is incorrect");
                    bcrypt.hash(currentPassword,5,(error,bcryptedPassword) => {
                        user.updatePassword(userName,newPassword);
                    })
            })
        })
    },
    allUsers : async(req,res) =>{

        // var authorization = req.body.token;
        // if (authorization == null) res.status(400).send({
        //     Success : "false",
        //     message : "this request require the token"
        // })
        // const verifyToken = await jwt.verifyToken(authorization);
        // if (verifyToken.message) res.status(400).send(verifyToken);
        user.getAllUsers((result) => {
            var userNames = []
            result.filter((u)=>{
                userNames.push({name : u.userName})
            })
            res.status(200).send(userNames);
            
        })
    },
    depositBalance : async(req,res) => {
        // var authorization = req.body.token;        
        // if (authorization == null) res.status(400).send({
        //     Success : "false",
        //     message : "this request require the token"
        // })
        // const verifyToken = await jwt.verifyToken(authorization);
        // if (verifyToken.message) res.status(400).send(verifyToken);
        var userName = req.body.userName;    
        var depositBalance = req.body.amount;
        user.findUser(userName,(result) =>{
            var newbalance  = parseInt(result.balance) + parseInt(depositBalance);
            user.updateBalance(userName,newbalance);
            res.status(200).send({
                Success : "true",
                message : "Balance added successful"
            })
        })
    }
    
}
P2pserver.listen();