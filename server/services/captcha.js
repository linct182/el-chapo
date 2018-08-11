const config = require('../config/config.json');
const Axios = require('axios');

module.exports = {
    verify: (req, res, next) => {
        // disable recaptcha on localhost
        if(req.connection.remoteAddress === '::1') {
            delete (req.body.captcha_key);
            return next();
        }
        let sCaptchaKey = req.body.captcha_key;
        let verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + config.captcha_private + "&response=" + sCaptchaKey + "&remoteip=" + req.connection.remoteAddress;
        return Axios.get(verificationUrl).then((data) => {
            if (data.data.success === true) {
                delete(req.body.captcha_key);
                return next();
            }
            return res.status(400).send({
                message: 'captcha'
            });
        });
    }
}