const chainUtil = require('../chain-util').chainUtil;
const {DIFFICULTY,MINE_RATE} = require('../config')
//const Difficulty = 2;
class Block{
    constructor(timestamp,lastHash,hash,data,nonce,difficulty){
        this.timestamp = timestamp;
        this.lastHash = lastHash;
        this.hash = hash;
        this.difficulty = difficulty || DIFFICULTY;
        this.nonce = nonce;
        this.data = data;
    }

    toString() {
        return `Block - 
        Timestamp : ${this.timestamp}
        LastHash  : ${this.lastHash.substring(0 , 10)}
        Hash      : ${this.hash.substring(0 , 10)}
        Nonce     : ${this.nonce}
        difficulty: ${this.difficulty}
        Data      : ${this.data}`;
    }

    static genesis(){
        return new this('Genesis Time','-------'
        ,'gd4v-ec58',[],0,DIFFICULTY);
    }
    static mineBlock(lastBlock,data){
        
        let nonce = 0;
        let timestamp,hash; 
        let {difficulty} = lastBlock;
        const lastHash = lastBlock.hash;
        do{
            nonce ++;
            timestamp = Date.now();
            difficulty = Block.adjustDifficulty(lastBlock,timestamp);
            hash = Block.hash(timestamp,lastHash,data,nonce,difficulty);
        }while(hash.substring(0,4) !== '0'.repeat(4));

        return new this(timestamp,lastHash,hash,data,nonce,difficulty);
    }
    static hash(timestamp,lastHash,data,nonce,difficulty){
        return chainUtil.hash(`${timestamp}${lastHash}${data}${nonce}${difficulty}`).toString();
    }
    static blockHash(block){
        const {timestamp,lastHash,data,nonce,difficulty} = block;
        return Block.hash(timestamp,lastHash,data,nonce,difficulty);
    }
    static adjustDifficulty(lastBlock,currentTime){
        let {difficulty} = lastBlock;
        difficulty = lastBlock.timestamp + MINE_RATE > currentTime ? difficulty + 1 : difficulty - 1;
        return difficulty
    }

}
module.exports= Block;