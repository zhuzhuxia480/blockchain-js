const Blockchain = require("./blockchain")
const Proofofwork = require("./proofofwork")
const { Command } = require("commander")
const Cli = require("./cli")


const blockchain = new Blockchain();
blockchain.ready().then(() => {
    const cli = new Cli();
    cli.bc = blockchain;
    cli.run();
});

console.log("end")

