const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const config = require('../config/config.json');
const saltRounds = require('../config/config.json')['salt-rounds'];
module.exports ={
  randomTester(req, res) {
    try {
      const token = require('crypto').randomBytes(48);
      res.json(token.toString('hex'));
      // kahit ano
    } catch (error) {
      res.json(error);
    }
  },
  generatePassword(password) {
    const hash = crypto.createHash('sha384')
      .update(password)
      .digest('hex');

    const salt = bcrypt.genSaltSync(parseInt(saltRounds));
    return bcrypt.hashSync(hash, salt);
  },
  generateRedis(key) {
      if(config.encrypt === "yes") {
        const hash = crypto.createHash('sha384')
          .update(key.toString())
          .digest('hex');
        
          return hash;
      }

      return key;
  },
  generateRandomString() {
      const token = require('crypto').randomBytes(48);
      return token.toString('hex');
  },
  hashString(myString) {
    const hash = crypto.createHash('sha384')
          .update(myString.toString())
          .digest('hex');
          
    return hash;
  },
  generateS3KeyByUserID(iId) {
    return crypto.createHash('sha384').update(`${iId.toString()}:WITH_KEY:${config.upload_secret}`).digest('hex');
  }
}