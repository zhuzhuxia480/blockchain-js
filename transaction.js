const crypto = require("./util/crypto");
const sprintf = require("sprintf-js").sprintf;

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
        this.id = crypto.hash(JSON.stringify(this));
    }
}

function NewCoinbaseTX(to, data) {
    if (data === "") {
        data = sprintf("Reward to '%s'", to);
    }
    let txInput = new TXInput("", -1, data);
    let txOutput = new TXOutput(subsidy, to);
    return new Transaction(null, [txOutput], [txInput]);
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
            inputs.push(new TXOutput(txid), out, from);
        }
    }
    outputs.push(new TXOutput(amount, to));
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

}

class TXOutput {
    constructor(value, scriptSig) {
        this.value = value;
        this.scriptSig = scriptSig;
    }

    canBeUnlockedWith(unlockingData) {
        return this.scriptSig === unlockingData;
    }

}


module.exports = Transaction;