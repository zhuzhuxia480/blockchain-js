const CryptoUtil = require("./util/crypto");
const Proofofwork = require("./proofofwork")

class Block{
    constructor(index, timeStamp, txs, preBlockHash){
        this.index = index;
        this.timeStamp = timeStamp;
        this.transactions = txs;
        this.preBlockHash = preBlockHash;
        this.hash = this.calculateHash()
        this.nonce = 0;
    }

    calculateHash() {
        return CryptoUtil.hash(this.preBlockHash + JSON.stringify(this.transactions) + this.timeStamp)
    }

    static newGenesisBlock() {
        return this.newBlock(0, 1508270000000, "This is Genesis block", "");
    }

    static newBlock(index, timeStamp, txs, preBlockHash) {
        let block = new Block(index, timeStamp, txs, preBlockHash);
        let pow = new Proofofwork(block);
        let ret = pow.run();
        block.hash = ret[0];
        block.nonce = ret[1];
        return block;
    }
}

module.exports = Block
