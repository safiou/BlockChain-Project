const {MongoClient,url,dataBase_Name} = require('../../config');
const collection = 'users';
class user{
    constructor(firstName,lastName,userName,email,password){
        this.firstName = firstName;
        this.lastName = lastName;
        this.userName = userName;
        this.password = password;
        this.email = email;
        this.isAdministrator = false;
        this.balance = 0;
    }
    createUser(){
        MongoClient.connect(url,(err,db)=>{
            if(err) throw err;
            const dbo =  db.db(dataBase_Name);
            const user ={
                firstName : this.firstName,
                lastName  : this.lastName,
                userName  : this.userName,
                password  : this.password,
                email     : this.email,
                balance   : this.balance,
                isAdministrator : this.isAdministrator
            }
            dbo.collection(collection).insertOne(user,(err,res)=>{
                if (err) throw err;
                console.log('1 user inserted');
                db.close(); 
            })
        })
    }
    static findUser(username,success){
        MongoClient.connect(url,async(err,db)=>{
            if (err) throw err ;
            const dbo = db.db(dataBase_Name);
            var query = {
                userName : username
            };
            var user = await dbo.collection(collection).findOne(query);
            success (user);   
        });
    }
    static updateBalance(username,newBalence){
        MongoClient.connect(url,(err,db)=>{
            if (err) throw err;
            const dbo = db.db(dataBase_Name);
            var query = {
                userName : username
            };
            var newValue = {
                $set:{balance : newBalence}
            }
            dbo.collection(collection).updateOne(query,newValue,(error,result) => {
                if (error) throw error;  
                console.log("update successful");
            })
        })
    }
    static updateProfil(userName,newProfil){
        MongoClient.connect(url,(err,db) => {
            if (err) throw err;
            const dbo = db.db(dataBase_Name);
            var query = {
                userName : userName
            };
            var newValues = {
                $set:{ 
                    firstName : newProfil.firstName, 
                    lastName  : newProfil.lastName,
                    email     : newProfil.email,
                }
            }
            dbo.collection(collection).updateOne(query,newValues,(error,result) => {
                if (error) throw error;  
                console.log("update successful");
            });
        });
    }
    static updatePassword(userName,newPassword){
        MongoClient.connect(url,(err,db) => {
            if (err) throw err;
            const dbo = db.db(dataBase_Name);
            var query = {
                userName : userName
            };
            var newValues = {
                $set:{ 
                    password : newPassword
                }
            }
            dbo.collection(collection).updateOne(query,newValues,(error,result) => {
                if (error) throw error;  
                console.log("update successful");
            });
        });
    }
    static getAllUsers(success){
        MongoClient.connect(url, async(err,db)=>{
            if (err) throw err ;
            const dbo = db.db(dataBase_Name);
            var allUsers = await dbo.collection(collection).find().toArray((err,result)=>{
                success(result);
            });
            
        })
    }
}
module.exports = user;