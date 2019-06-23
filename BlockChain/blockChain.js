const Block = require('./block');

class BlockChain {
    constructor(){
        this.chain = [Block.genesis()];
    }
    
    addBlock(data){
        const LastBlock  = this.chain[this.chain.length -1];
        const block = Block.mineBlock(LastBlock,data);
        this.chain.push(block);

        return block;
    }
    chainIsValid(chain){
        if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) return false;

        for (let i = 1 ; i < chain.length; i++){
            const block = chain[i];
            const LastBlock = chain[i - 1];

            if (block.lastHash !== LastBlock.hash ||
                block.hash !== Block.blockHash(block)){
                    return false;
                }
        }
        return true;
    }
    updateChain(newChain) {
        if (newChain.length <= this.chain.length) {
          console.log('Received chain is not longer than the current chain.');
          return;
        } else if (!this.chainIsValid(newChain)) {
          console.log('The received chain is not valid.');
          return;
        }
      
        console.log('Replacing blockchain with the new chain.');
        this.chain = newChain;
      }
}

module.exports = BlockChain;