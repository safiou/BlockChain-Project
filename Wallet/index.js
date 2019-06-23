const {INITIAL_BALANCE} = require('../config');
const chainUtil = require('../chain-util').chainUtil;
const Transaction = require('./transaction');

class wallet{
    constructor(balance){
        this.balance = balance;
        //this.userWallet  = userName;
        this.keyPair = chainUtil.genKeyPair();
        this.publicKey = this.keyPair.getPublic().encode('hex');
    }
    toString(){
        return `Wallet- 
        Public Key : ${this.publicKey}
        Balance    : ${this.balance}`
    }
    sign(dataHash){
        return this.keyPair.sign(dataHash);
    }
    calculBalance(blockchain){
        let balance  = this.balance; 
        let transactions = [];
        blockchain.chain.forEach( block => block.data.forEach(transaction => {
            transactions.push(transaction);
        }));
        // console.log(blockchain.chain)
        const walletInputTransc = transactions.filter(transaction => transaction.input.address
            === this.publicKey);
        let actualTime = 0;
        
        if( walletInputTransc.length > 0){
            const InputRecentT = walletInputTransc.reduce((prev,current)=>{
                prev.input.timestamp > current.input.timestamp ? prev : current ;
            });

            balance = InputRecentT.outputs[0].find(output => output.address === this.publicKey).amount;
            actualTime = InputRecentT.input.timestamp;
        }
        transactions.forEach(transaction => {
            if (transaction.input.timestamp > actualTime){
                //console.log(transaction.outputs[0].address);
                transaction.outputs[0].find(output =>{
                    //console.log(output)
                    //console.log(this.publicKey);
                    if (output.address === this.publicKey){
                         //console.log(output.amount);
                        balance += output.amount;
                    }
                })
            }
        })
        return balance;
    }
    createTransaction(amount,recipient,transactionPool,blockchain){
        this.balance = this.calculBalance(blockchain);
        //console.log(this.balance);
        if (amount > this.balance){
           
            return `Amount : ${amount} exceceds current balance : ${this.balance}`;
            
        }
        let transaction = transactionPool.existingTransaction(this.publicKey);

        if (transaction){
            transaction.updateTrans(amount,this,recipient )
        }
        else{
            transaction = Transaction.newTransaction(amount,this,recipient);
            transactionPool.updateOrAddTransaction(transaction);
        }
        return transaction;
    }
    static blockchainWallet(){
        const blockchainWallet = new this();
        blockchainWallet.address = 'blockchain-wallet';
        return blockchainWallet; 
    }
}

module.exports = wallet;