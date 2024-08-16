// const CryptoUtil = require("./util/crypto");
// const Proofofwork = require("./proofofwork")

import Proofofwork from './proofofwork.js'
import {CryptoUtil} from './util/crypto.js';
import {Transaction} from "./transaction.js";


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

    static newGenesisBlock(coinbase) {
        return this.newBlock(0, 1508270000000, [coinbase], "");
    }

    static newBlock(index, timeStamp, txs, preBlockHash) {
        let block = new Block(index, timeStamp, txs, preBlockHash);
        let pow = new Proofofwork(block);
        let ret = pow.run();
        block.hash = ret[0];
        block.nonce = ret[1];
        return block;
    }

    static fromJson(data) {
        let block = new Block();
        let obj = JSON.parse(data);
        Object.entries(obj).forEach(([key, value]) => {
            if (key === "transactions") {
                block[key] = Transaction.fromJSON(value);
            } else {
                block[key] = value;
            }
        });
        return block;
    }
}

export default Block
