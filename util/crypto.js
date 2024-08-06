const crypto = require('crypto');
var hash = crypto.createHash('sha256');

class CryptoUtil {
    static hash(data) {
        let jsonData= typeof data === 'string' ? data.toString() : JSON.stringify(data);
        return hash.update(jsonData).digest('hex')
    }
}

module.exports = CryptoUtil;