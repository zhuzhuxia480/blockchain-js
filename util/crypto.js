const crypto = require('crypto');


class CryptoUtil {
    static hash(data) {
        let hash = crypto.createHash('sha256');
        let jsonData= typeof data === 'string' ? data.toString() : JSON.stringify(data);
        return hash.update(jsonData).digest('hex')
    }
}

module.exports = CryptoUtil;