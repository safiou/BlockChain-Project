const chainUtil = require('../chain-util').chainUtil;
const {REWARD_MINER} = require('../config');

class Transaction {
    constructor(){
        this.id = chainUtil.uuid();
        this.input = null;
        this.outputs = [];
    }
    static newTransaction(amount,senderWallet,recipient){
        if (amount > senderWallet.balance){
            console.log();
            return `amount : ${amount} exceeds balance`;
        }
        return Transaction.transactionWithOutputs(senderWallet,[
            {amount : senderWallet.balance - amount,address: senderWallet.publicKey},
            {amount , address : recipient}
        ]);
    }
    static transactionWithOutputs(senderWallet,outputs){
        const transaction = new this;
        transaction.outputs.push(outputs);
        Transaction.signTransaction(senderWallet,transaction);
        return transaction;
    }
    static rewardTransaction(minerWallet,blockchainWallet){
        return Transaction.transactionWithOutputs(blockchainWallet,[{
            amount : REWARD_MINER, address : minerWallet.publicKey
        }]);
    }
    updateTrans(amount,senderWallet,recipient){
        const senderOutput = this.outputs[0].find(output => output.address === senderWallet.publicKey)
        
        if (amount > senderOutput.amount){
            console.log(`Amount  : ${amount} exceeds balance`);
            return;
        }
        senderOutput.amount = senderOutput.amount - amount;
        this.outputs.push({amount,address : recipient});
        Transaction.signTransaction(senderWallet,this);
        return this;
    }
    static signTransaction(senderWallet,transaction){
        transaction.input = {
            timestamp : Date.now(),
            amount : senderWallet.balance,
            address : senderWallet.publicKey,
            signature : senderWallet.sign(chainUtil.hash(transaction.outputs))
        }
    }
    static verifyTransaction(transaction){
        return chainUtil.verifySignature(
            transaction.input.signature,
            transaction.input.address,
            chainUtil.hash(transaction.outputs)
        )
    }
}



module.exports = Transaction;