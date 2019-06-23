const Wallet = require('./index');
const TransactionPool = require('./transaction-pool');
const Blockchain = require('../BlockChain/blockChain');
const { INITIAL_BALANCE } = require('../config');

describe('Wallet', () => {
    let wallet, tp, blockchain;

    beforeEach(() => {
        wallet = new Wallet();
        tp = new TransactionPool();
        blockchain = new Blockchain();
    });

    describe('creating a transaction', () => {
        let transaction, sendAmount, recipient;
        beforeEach(() => {
            sendAmount = 50;
            recipient = 'safiou';
            transaction = wallet.createTransaction(sendAmount, recipient, tp, blockchain);
        })
        describe('and doing the same transaction', () => {
            beforeEach(() => {
                wallet.createTransaction(sendAmount, recipient, tp, blockchain);
            });
            it('doubles the `sendAmount` subtracted from the wallet balance', () => {
                // console.log(transaction.outputs[0].find(output => output.address = wallet.publicKey).amount);
                // console.log(wallet.balance - sendAmount*2);
                expect(transaction.outputs[0].find(output => output.address = wallet.publicKey).amount)
                    .toEqual(wallet.balance - sendAmount * 2);
            });
            it('clones the `sendAmount` output for the recipient', () => {
                // console.log(transaction.outputs.filter(output => output.address === recipient)
                // .map(output => output.amount));
                expect(
                    transaction.outputs.filter(output => output.address === recipient)
                        .map(output => output.amount)
                ).toEqual([sendAmount]);
            });
        });
    });
    describe('calculating a balance', () => {
        let addBalance, repeatAdd, senderWallet,recipientWallet;

        beforeEach(() => {
            senderWallet = new Wallet(500);
            recipientWallet = new Wallet(500);
            addBalance = 100;
            repeatAdd = 3;
            let i = 0;
            for (i= 0; i < repeatAdd; i++) {
                senderWallet.createTransaction(addBalance,recipientWallet.publicKey, tp, blockchain);
            }
            blockchain.addBlock(tp.transactions);
        })
        it('calculates the balance for the bc matching the recipient', () => {
            console.log(recipientWallet.calculBalance(blockchain));
            expect(recipientWallet.calculBalance(blockchain)).toEqual(INITIAL_BALANCE + (addBalance * repeatAdd));
        });
        it('calculates the balance for the bc transaction matching the sender', () => {
            console.log(INITIAL_BALANCE - (addBalance * repeatAdd));
            console.log(senderWallet.calculBalance(blockchain));
            expect(senderWallet.calculBalance(blockchain)).toEqual(INITIAL_BALANCE - (addBalance * repeatAdd));
        })
    })
});