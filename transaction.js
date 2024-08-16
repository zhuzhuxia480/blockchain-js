// const crypto = require("./util/crypto");
// const sprintf = require("sprintf-js").sprintf;

import crypto from "crypto";
import {sprintf} from "sprintf-js";
import {CryptoUtil} from "./util/crypto.js";

const subsidy = 10

class Transaction {
    constructor(id, vin, vout) {
        this.id = id;
        this.vin = vin;
        this.vout = vout;
    }
    isCoinbase() {
        return this.vin.length === 1 && this.vin[0].txid.length === 0 && this.vin[0].vout === -1;
    }

    setID() {
        this.id = CryptoUtil.hash(JSON.stringify(this));
    }

    static fromJSON(obj) {
        let txs = [];
        for (const txObj of obj) {
            let tx = new Transaction();
            tx.id = txObj.id;
            tx.vout = TXOutput.fromJSON(txObj.vout);
            tx.vin = TXInput.fromJSON(txObj.vin);
            txs.push(tx);
        }
        return txs;
    }
}

function NewCoinbaseTX(to, data) {
    if (data === "") {
        data = sprintf("Reward to '%s'", to);
    }
    let txInput = new TXInput("", -1, data);
    let txOutput = new TXOutput(subsidy, to);

    let tx = new Transaction(null, [txInput], [txOutput]);
    tx.setID();
    return tx;
}

async function NewUTXOTransaction(from, to, amount, bc) {
    let inputs = []
    let outputs = []
    const {accumulate, unspentOutputs} = await bc.findSpendableOutputs(from, amount);
    if (accumulate < amount) {
        console.log("ERROR :no enough funds");
        throw new Error("ERROR :no enough funds");
    }
    for (const [txid, outs] of unspentOutputs) {
        for (const out of outs) {
            inputs.push(new TXInput(txid, out, from));
        }
    }
    outputs.push(new TXOutput(Number(amount), to));
    if (accumulate > amount) {
        outputs.push(new TXOutput(accumulate - amount, from));
    }
    let tx = new Transaction("", inputs, outputs);
    tx.setID();
    return tx;
}

class TXInput {
    constructor(txid, vout, scriptSig) {
        this.txid = txid;
        this.scriptSig = scriptSig;
        this.vout = vout;
    }

    canUnlockOutputWith(unlockingData) {
        return this.scriptSig === unlockingData;
    }

    static fromJSON(json) {
        let input = [];
        for (const obj of json) {
            let txinput = new TXInput();
            Object.entries(obj).forEach(([key, value]) => {
                txinput[key] = value;
            });
            input.push(txinput);
        }
        return input;
    }

}

class TXOutput {
    constructor(value, scriptSig) {
        this.value = value;
        this.scriptSig = scriptSig;
    }

    canBeUnlockedWith(unlockingData) {
        return this.scriptSig === unlockingData;
    }

    static fromJSON(json) {
        let output = [];
        for (const obj of json) {
            let txout = new TXOutput();
            Object.entries(obj).forEach(([key, value]) => {
                txout[key] = value;
            });
            output.push(txout);
        }
        return output;
    }
}


export {Transaction, NewCoinbaseTX, NewUTXOTransaction};