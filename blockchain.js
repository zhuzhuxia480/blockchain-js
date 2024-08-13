const Block = require("./block.js")
const rocksdb = require("rocksdb")

const dbFile = "blockchain.db"

class Blockchain {
    constructor() {
        this.db = rocksdb(dbFile);
    }

    async ready() {
        await new Promise((resolve, reject) => {
            this.db.open((err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
        let lastHash;
        try {
            lastHash = await new Promise((resolve, reject) => {
                this.db.get("l", (err, data) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(data);
                    }
                });
            });
        } catch (e) {
            //初始化创建
            if (e.message === "NotFound: ") {
                console.log("no block in chain, create first");
                let block = Block.newGenesisBlock();
                await new Promise((resolve, reject) => {
                    this.db.put(block.hash, JSON.stringify(block), (err) => {
                        if (err)
                            reject(err);
                        else {
                            resolve();
                        }
                    });
                });

                await new Promise((resolve, reject) => {
                    this.db.put("l", block.hash, (err) => {
                        if (err) {
                            reject(err);
                        } else {
                            this.tip = block.hash;
                            resolve();
                        }
                    });
                });
                this.tip = block.hash;
            }
        }
        this.tip = lastHash.toString();
    }

    async addBlock(data) {
        let lastHash = await new Promise((resolve, reject) => {
            this.db.get("l", (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
        let lastBlockData = await new Promise((resolve, reject) => {
            this.db.get(lastHash, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });

        let lastBlock = JSON.parse(lastBlockData);
        console.log("get lastHash:", lastBlock.hash);
        let newBlock = Block.newBlock(lastBlock.index + 1, new Date().getTime() / 1000, data, lastBlock.hash);

        await new Promise((resolve, reject) => {
            this.db.put(newBlock.hash, JSON.stringify(newBlock), (err) => {
                if (err)
                    reject(err);
                else {
                    resolve();
                }
            });
        });

        await new Promise((resolve, reject) => {
            this.db.put("l", newBlock.hash, (err) => {
                if (err) {
                    reject(err);
                } else {
                    this.tip = newBlock.hash;
                    resolve();
                }
            });
        });

        console.log("after add block index:", lastBlock.index + 1);
    }

    async findUnspentTransactions(address) {
        let unspentTXs = []
        let spentTXOs = new Map();
        let it = this.iterator();
        while (true) {
            let block = await it.next();
            for (const tx of block.transactions) {
                let txID = tx.id;
                Outputs:
                    for (let i = 0; i < tx.vout.length; i++) {
                        if (spentTXOs[txID] !== undefined) {
                            for (const spendOut of spentTXOs[txID]) {
                                if (spendOut === i) {
                                    console.log("this output has been used")
                                    continue Outputs
                                }
                            }
                        }

                        let out = tx.vout[i];
                        if (out.canBeUnlockedWith(address)) {
                            unspentTXs.push(tx.vout[i]);
                        }
                    }
                if (tx.isCoinbase() === false) {
                    for (const vin of tx.vin) {
                        if (vin.canUnlockOutputWith(address)) {
                            if (!spentTXOs.has(vin.txid)) {
                                spentTXOs[vin.txid] = [];
                            }
                            spentTXOs[vin.txid].push(vin.vout);
                        }
                    }
                }
            }

            if (block.preBlockHash.length === 0) {
                break;
            }
        }
        return unspentTXs;
    }

    async findSpendableOutputs(address, amount) {
        let unspentOutputs = new Map();
        let unspentTXs = await this.findUnspentTransactions(address);
        let accumulate = 0;

        work:
            for (const tx of unspentTXs) {
                for (const out of tx.vout) {
                    if (out.canBeUnlockedWith(address) && accumulate < amount) {
                        accumulate += out.value;
                        if (!unspentOutputs.has(tx.id)) {
                            unspentOutputs[tx.id] = [];
                        }
                        unspentOutputs[tx.id].push();
                    }
                    if (accumulate >= amount) {
                        break work;
                    }
                }
            }
        return {accumulate: accumulate, unspentOutputs: unspentOutputs};
    }

    iterator() {
        return new BlockchainIterator(this.tip, this.db);
    }
}

class BlockchainIterator {
    constructor(hash, db) {
        this.currentHash = hash;
        this.db = db;
    }

    async next() {
        let block;
        await new Promise((resolve, reject) => {
            this.db.get(this.currentHash, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    block = JSON.parse(data);
                    resolve(block);
                }
            });
        });

        this.currentHash = block.preBlockHash;
        return block
    }
}


module.exports = Blockchain;

// // test
// let blockchain = new Blockchain();
// blockchain.ready().then(() => {
//     let it = blockchain.iterator();
//     let block = it.next().then((block) => {
//         console.log("get next block:", JSON.stringify(block));
//     });
// });
//




