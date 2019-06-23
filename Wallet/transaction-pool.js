const Transaction = require('../Wallet/transaction');

class TransactionPool{
    constructor(){
        this.transactions = [];
    }
    updateOrAddTransaction(transaction){
        let transactionWidthId = this.transactions.find(t => t.id === transaction.id);

        if (transactionWidthId) 
            this.transactions [this.transactions.indexOf(transactionWidthId)] = transaction;
        else 
            this.transactions.push(transaction)
    }
    existingTransaction(address){
        return this.transactions.find(t => t.input.address === address);
    }
    clear(){
        this.transactions = [];
    }
    transactionValid(){
        return this.transactions.filter( transaction =>{
            
            const outputTotal = transaction.outputs[0].reduce((total,output)=>{
                return total + output.amount;
            },0);
            console.log(transaction.input.amount +'   '+outputTotal);
            if(transaction.input.amount !== outputTotal){
                console.log(`invalid transaction from ${transaction.input.address}.`);
                return [];
            }
            if(!Transaction.verifyTransaction(transaction)){
                console.log(`invalid signature from ${transaction.input.address}.`);
                return [];
            }
            
            return transaction;
        });
    }
}


module.exports = TransactionPool;