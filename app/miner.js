const Transaction = require('../Wallet/transaction');
const Wallet = require('../Wallet');

class Miner{
    constructor(blockChain,transactionPool,wallet,p2pServer){
        this.blockChain = blockChain;
        this.transactionPool = transactionPool;
        this.wallet = wallet;
        this.p2pServer =p2pServer;
    }
    mine(){
        const transactionValid = this.transactionPool.transactionValid();
        transactionValid.push(
            Transaction.rewardTransaction(this.wallet,Wallet.blockchainWallet())
        );
        const block =  this.blockChain.addBlock(transactionValid);
        this.p2pServer.syncChains();
        this.transactionPool.clear();
        this.p2pServer.broadcastClearTransaction();

        return block 
    }
}

module.exports = Miner;