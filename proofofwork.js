// const cryptoUtils = require('./util/crypto');
// const Blockchain = require('./blockchain.js');

import {CryptoUtil} from "./util/crypto.js";

const targetBits = 16n
const maxNonce = Number.MAX_VALUE

class Proofofwork {
    constructor(block) {
        let target = BigInt(1) << (256n-targetBits);
        this.block = block;
        this.target = target;
        // console.log("get target:", target.toString(16));
    }

    prepareData(nonce) {
        return this.block.preBlockHash + JSON.stringify(this.block.transactions) + this.block.timeStamp + targetBits.toString() + nonce.toString();
    }

    run() {
        for (let nonce = 0; nonce < maxNonce; nonce++) {
            let data = this.prepareData(nonce);
            let hash = CryptoUtil.hash(data)
            let hashInt = BigInt('0x' + hash);
            if (hashInt < this.target) {
                console.log("get new hash, nonce:", nonce, "hash: ", hash)
                return [hash, nonce];
            }
        }
    }
}


export default Proofofwork;