class Block{
    constructor(timeStamp, data, preBlockHash, hash){
        this.timeStamp = timeStamp;
        this.data = data;
        this.preBlockHash = preBlockHash;
        //TODO caculate the hash sum
        this.hash = hash;
    }


}