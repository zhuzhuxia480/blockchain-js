const Block = require("./block.js")

class Blockchain {
    constructor() {
        this.blocks = [Block.newGenesisBlock()]
    }

    addBlock(data) {
        let preBlock = this.blocks[this.blocks.length - 1]
        let newBlock = new Block(preBlock.index + 1, new Date().getTime() / 1000, data, preBlock.hash);
        this.blocks.push(newBlock)
    }
}

