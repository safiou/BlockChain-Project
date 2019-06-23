const TransactionPool = require('./transaction-pool');
const Transaction = require('./transaction');
const Wallet = require('./index');
const Blockchain = require('../BlockChain/blockChain');

describe('Transaction Pool', () => {
    let tp, transaction, wallet,blockchain;
    beforeEach(() => {
        tp = new TransactionPool();
        wallet = new Wallet();
        blockchain = new Blockchain();
        // transaction = Transaction.newTransaction(50,wallet,'safiou');
        // tp.updateOrAddTransaction(transaction);
        transaction = wallet.createTransaction(50, "safiou", tp,blockchain);
    });
    it('adds the transaction to the pool', () => {
        expect(tp.transactions.find(t => t.id === transaction.id)).toEqual(transaction);
    });
    it('update a transaction in the pool', () => {
        const oldTransaction = JSON.stringify(transaction);
        const newTransaction = transaction.updateTrans(25, wallet, 'mamadou');
        tp.updateOrAddTransaction(newTransaction);
        expect(JSON.stringify(tp.transactions.find(t => t.find === newTransaction.id)))
            .not.toEqual(oldTransaction);
        //console.log(tp.transactions)
    });
    it(`clears transaction`,()=>{
        tp.clear();
        expect(tp.transactions).toEqual([]); 
    })
    describe('mixing valid and corrupt transaction', () => {
        let TransactionValid;
        beforeEach(() => {
            TransactionValid = [tp.transactions];
            for (let i = 1; i < 3; i++) {
                wallet = new Wallet();
                transaction = wallet.createTransaction(80,"saf", tp,blockchain);
                if (i % 2 == 0) {
                    transaction.input.amount = 9999;
                }
                else {
                    TransactionValid.push(transaction);
                }
            }
        });
        it(`show a difference between valid and corrupt transactions`, () => {
            expect(JSON.stringify(tp.transactions)).not.toEqual(JSON.stringify(TransactionValid));
        });
        it('grab the valid transactions', () => {
            expect(tp.transactionValid()).toEqual(TransactionValid[0]);
        });

    })
});