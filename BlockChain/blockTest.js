const Block = require('./block');

describe('block',()=>{
    let data,lastBlock,block;

    beforeEach(()=>{
        data = 'bar';
        lastBlock = Block.genesis();
        block = Block.mineBlock(lastBlock,data);
    });
    it('sets the `data` to match thr input',()=>{
        expect(block.data).toEqual(data);
    });
    it('sets the `lastHash` ',()=>{
        expect(block.lastHash).toEqual(lastBlock.hash)
    })
})