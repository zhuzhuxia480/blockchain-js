const CryptoUtil = require("./util/crypto");
const Proofofwork = require("./proofofwork")

class Block{
    constructor(index, timeStamp, data, preBlockHash){
        this.index = index;
        this.timeStamp = timeStamp;
        this.data = data;
        this.preBlockHash = preBlockHash;
        this.hash = this.calculateHash()
        this.nonce = 0;
    }

    calculateHash() {
        return CryptoUtil.hash(this.preBlockHash + this.data + this.timeStamp)
    }

    static newGenesisBlock() {
        return this.newBlock(0, 1508270000000, "This is Genesis block", "");
    }

    static newBlock(index, timeStamp, data, preBlockHash) {
        let block = new Block(index, timeStamp, data, preBlockHash);
        let pow = new Proofofwork(block);
        let ret = pow.run();
        block.hash = ret[0];
        block.nonce = ret[1];
        return block;
    }
}

module.exports = Block
