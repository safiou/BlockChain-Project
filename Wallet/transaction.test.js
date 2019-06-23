const Transaction = require('./transaction');
const Wallet = require('./index');
const {REWARD_MINER} = require('../config');

describe('Transaction',() => {
    let transaction,wallet,recipient,amount;

    beforeEach(() => {
        wallet = new Wallet();
        amount = 50;
        recipient = 'soudais';
        transaction = Transaction.newTransaction(50,wallet, recipient);
    });
    it('ouputs the `amount` subtracted from the wallet balance', () => {
        expect(transaction.outputs[0].find(output => output.address === wallet.publicKey).amount)
          .toEqual(wallet.balance - amount);
      });
    it('valid transaction',()=>{
        expect(Transaction.verifyTransaction(transaction)).toBe(true);
    });
    it('invalid transaction',()=>{
        transaction.outputs[0][0].amount = 451;
        expect(Transaction.verifyTransaction(transaction)).toBe(false);
    });
    it('input',()=>{
        expect(transaction.input.amount)
            .toEqual(wallet.balance);
    })
    it('outputs the `amount` added to the recipient', () => {
        expect(transaction.outputs[0].find(output => output.address === recipient).amount)
          .toEqual(amount);
      });
    describe('Transaction',() => {
        let nextRecipient,nextAmount;
        beforeEach(()=>{
            nextRecipient = 'safiou';
            nextAmount = 50;
            transaction = transaction.updateTrans(nextAmount,wallet,nextRecipient);
        });
       
        it(`update the next amount from the sender's output`, () => {
            expect(transaction.outputs[0].find(output => output.address === wallet.publicKey).amount)
              .toEqual(wallet.balance - amount - nextAmount);
              //console.log(transaction.input)
        });
        it(`output an amount for the next recipient`, () => {
             expect(transaction.outputs.find(output => output.address === nextRecipient).amount)
               .toEqual(nextAmount);
        });
    });
    describe('creating a reward transaction',()=>{
        beforeEach(()=>{
            transaction = Transaction.rewardTransaction(wallet,Wallet.blockchainWallet()); 
        });
        it(`reward the miner's wallet`,()=>{
            expect(transaction.outputs[0].find(output => output.address = wallet.publicKey).amount)
                .toEqual(REWARD_MINER);
        })
    })
});