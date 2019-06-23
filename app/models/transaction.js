const {MongoClient,url,dataBase_Name} = require('../../config');
const moment = require('moment')

const collection = "transactionbyusers";

class TransactionList{
    constructor(senderName,recipientName,timestamp,amount){
        this.senderName = senderName;
        this.recipientName = recipientName;
        this.timestamp = moment(timestamp).locale('fr').format('LLLL');
        this.amount = amount;
    }
    insertTransaction(){
        MongoClient.connect(url,(err,db) => {
            if (err) throw err ;
            const dbo = db.db(dataBase_Name);
            var transaction = {
                senderName : this.senderName,
                recipientName : this.recipientName,
                timestamp: this.timestamp,
                amount : this.amount
            }
            dbo.collection(collection).insertOne(transaction,(err,res)=>{
                if (err) throw err;
                console.log('1 transaction inserted');
                db.close(); 
            });
        })
    }
    static getUserTransaction(success){
        MongoClient.connect(url,(err,db) => {
            if (err) throw err;
            const dbo = db.db(dataBase_Name);
            dbo.collection(collection).find({}).toArray(function(err, result) {
                if (err) throw err;
                //db.close();
                success(result);
              });
            
            
        })
    }

}
module.exports = TransactionList
