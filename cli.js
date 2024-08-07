const {Command} = require("commander");
const program = new Command();

class Cli {
    printUsage() {
        console.log("Usage:");
        console.log("    addblock -data BLOCK_DATA -add a block with data");
        console.log("    printchain - print all blcoks in the blockchain");
    }

    validArgs() {
        if (process.argv.length < 3) {
            this.printUsage();
            process.exit(1);
        }
    }

    addBlock(data) {
        this.bc.addBlock(data);
    }

    printChain() {
        console.log("printchain :")
        this.bc.printChain();
    }

    run() {
        this.validArgs();
        program.command("addblock")
            .description("add a new block with data")
            .requiredOption("-data <data>", "block data")
            .action((data) => {
            this.addBlock(data);
        })
        program.command("printchain")
            .description("prints blockchain")
            .action(()=>this.printChain())
        program.parse(process.argv);
    }
}

module.exports = Cli