// const Blockchain = require("./blockchain.js")
// const Proofofwork = require("./proofofwork.js")
// const { Command } = require("commander")
// const Cli = require("./cli")

import Blockchain from "./blockchain.js";
import Proofofworker from "./proofofwork.js";
import {Command} from "commander";
import Cli from "./cli.js";


const cli = new Cli();
cli.run();

console.log("end")

