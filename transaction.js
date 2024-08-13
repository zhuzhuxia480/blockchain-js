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
        this.ID = crypto.hash(JSON.stringify(this));
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

class TXInput {
    constructor(txid, vout, scriptSig) {
        this.txid = txid;
        this.scriptSig = scriptSig;
        this.vout = vout;
    }

}

class TXOutput {
    constructor(value, scriptSig) {
        this.value = value;
        this.scriptSig = scriptSig;
    }
}


module.exports = Transaction;