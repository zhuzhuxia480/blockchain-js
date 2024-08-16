// const {Command} = require("commander");
// const program = new Command();
// const Blockchain = require("./blockchain.js")
// const [Transaction, NewCoinbaseTX, NewUTXOTransaction] = require("./transaction");

import {Command} from "commander";

const program = new Command();
import Blockchain from "./blockchain.js";
import {NewUTXOTransaction} from './transaction.js'


class Cli {
    printUsage() {
        console.log("Usage:");
        console.log("    getbalance -address ADDRESS -get balance of address");
        console.log("    createblockchain -address ADDRESS -create a blockchain and send genesis reward to address");
        console.log("    printchain - print all blcoks in the blockchain");
        console.log("    send -from FROM -to TO -amount AMOUNT - send amount fo coins from FROM to TO");
    }

    validArgs() {
        if (process.argv.length < 3) {
            this.printUsage();
            process.exit(1);
        }
    }

    async createBlockchain(address) {
        await Blockchain.createBlockchain(address);
        console.log("Create blockchain done");
    }

    async getBalance(address) {
        let bc = await Blockchain.newBlockchain(address);
        let balance = 0;
        let UTXOs = await bc.findUTXO(address);
        for (const out of UTXOs) {
            balance += out.value;
        }
        console.log(`{address} get balance: ${balance}`);
    }

    async printChain() {
        console.log("printchain :")
        let bc = await Blockchain.newBlockchain("");
        let it = bc.iterator();
        while (true) {
            let block = await it.next();
            console.log("Pre.hash:", block.preBlockHash);
            console.log("Transaction:", JSON.stringify(block.transactions));
            console.log("Hash:", block.hash);
            console.log();
            if (block.preBlockHash.length === 0) {
                console.log("get end block");
                break;
            }

        }
    }

    async send(from, to, amount) {
        let bc = await Blockchain.newBlockchain(from);
        let tx = await NewUTXOTransaction(from, to, amount, bc);
        await bc.mineBlock([tx]);
        console.log("Success!");
    }

    run() {
        this.validArgs();
        program.command("createblockchain")
            .description("create blockchain")
            .requiredOption("-address <address>", "address")
            .action((address) => this.createBlockchain(address.Address));

        program.command("getbalance")
            .description("get balance")
            .requiredOption("-address <address>", "address")
            .action((address) => this.getBalance(address.Address));

        program.command("send")
            .description("sed coins")
            .requiredOption("-from <from>", "sender")
            .requiredOption("-to <to>", "receiver")
            .requiredOption("-amount <amount>", "amount")
            .action((param) => this.send(param.From, param.To, param.Amount));

        program.command("printchain")
            .description("prints blockchain")
            .action(() => this.printChain())
        program.parse(process.argv);
    }
}

export default Cli;