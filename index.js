const Blockchain = require("./blockchain")
const Proofofwork = require("./proofofwork")



const blockchain = new Blockchain();
const proofofwork = new Proofofwork(blockchain.blocks[0]);
proofofwork.run();