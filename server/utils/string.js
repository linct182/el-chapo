const config = require('../config/config.json');
module.exports = {
    Truncate: (sString, prepend) => {
        let MaxChars = 64;
        if (sString.length > MaxChars) {
            return sString.substr(0, MaxChars/2).trim() + prepend + sString.substr(sString.length - (MaxChars/2), (sString.length - 1)).trim();
        }else if(sString.length === 0) {
            return 'Untitled';
        }else {
            return sString;
        }
    }
}

