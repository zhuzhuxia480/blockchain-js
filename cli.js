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

    async printChain() {
        console.log("printchain :")
        let it = this.bc.iterator();
        while (true) {
            let block = await it.next();
            console.log("Pre.hash:", block.preBlockHash);
            console.log("Data:", block.data);
            console.log("Hash:", block.hash);
            console.log();
            if (block.preBlockHash.length === 0) {
                console.log("get end block");
                break;
            }

        }
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