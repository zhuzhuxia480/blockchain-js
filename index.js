const Blockchain = require("./blockchain")
const Proofofwork = require("./proofofwork")


const blockchain = new Blockchain();
blockchain.addBlock("send 1 BTC to Ivan")
blockchain.addBlock("send 2 more BTC to Ivan")

for (const block of blockchain.blocks) {
    console.log("Pre.hash:", block.preBlockHash);
    console.log("Data:", block.data);
    console.log("Hash:", block.hash);
    console.log();
}

