const CryptoUtil = require("./util/crypto");

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
        return new Block(0, 1508270000000, "This is Genesis block", "")
    }
}

module.exports = Block
