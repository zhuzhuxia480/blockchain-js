// const Block = require("./block.js")
// const rocksdb = require("rocksdb")
// const fs = require("node:fs");
// const [Transaction, NewCoinbaseTX] = require("./transaction")

import rocksdb from 'rocksdb'
import fs from 'fs'
import {NewCoinbaseTX} from './transaction.js'
import Block from "./block.js";

const dbFile = "blockchain.db"


let dbIsOpen = false;
let db = rocksdb(dbFile);

class DB {
    static dbExists() {
        return fs.existsSync(dbFile);
    }

    static async open() {
        if (dbIsOpen) {
            return
        }
        await new Promise((resolve, reject) => {
            db.open((err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
        dbIsOpen = true;
    }

    static async get(key) {
        if (dbIsOpen === false) {
            await DB.open();
        }

        return await new Promise((resolve, reject) => {
            db.get(key, (err, data) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(data);
                }
            });
        });
    }

    static async put(key, value) {
        if (dbIsOpen === false) {
            await DB.open();
        }

        await new Promise((resolve, reject) => {
            db.put(key, value, (err) => {
                if (err)
                    reject(err);
                else {
                    resolve();
                }
            });
        });
    }
}


class Blockchain {
    constructor(tip) {
        this.tip = tip;
    }

    async mineBlock(txs) {
        let lastHash = await DB.get("l")

        let lastBlockData = await DB.get(lastHash);

        let lastBlock = JSON.parse(lastBlockData);
        let newBlock = Block.newBlock(lastBlock.index+1, new Date().getTime()/1000, txs, lastBlock.hash);
        await DB.put(newBlock.hash, toJson(newBlock));
        await DB.put("l", newBlock.hash);
        console.log(`add new block, index: ${lastBlock.index}, hash: ${lastBlock.hash}`);
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
                            unspentTXs.push(tx);
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

    async findUTXO(address) {
        let UTXOs = []
        let unspentTransactions = await this.findUnspentTransactions(address);
        for (const tx of unspentTransactions) {
            for (const out of tx.vout) {
                UTXOs.push(out);
            }
        }
        return UTXOs;
    }

    static async newBlockchain(address) {
        if (DB.dbExists() === false) {
            console.log("Db not exist");
            process.exit(1);
        }
        let tip = await DB.get("l");
        return new Blockchain(tip);
    }

    static async createBlockchain(address) {
        if (DB.dbExists()) {
            console.log("Blockchain exists");
            return;
        }

        //create genesis block
        let cbtx = NewCoinbaseTX(address, "");
        let genesis = Block.newGenesisBlock(cbtx);
        await DB.put(genesis.hash, JSON.stringify(genesis));
        await DB.put("l", genesis.hash);
        return new Blockchain(genesis.hash);
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
        let block = Block.fromJson(await DB.get(this.currentHash));
        this.currentHash = block.preBlockHash;
        return block
    }
}

// module.exports = Blockchain;
export default Blockchain




