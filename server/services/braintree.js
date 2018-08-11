const Braintree = require('braintree');
const Config = require('../config/config.json')['braintree'];
const redis = require('../utils/redis');
const gateway = Braintree.connect(Object.assign(Config, {
    environment: Braintree.Environment[Config.environment]
}));

module.exports = {
    CreateUser: (oInfo, next) => {
        return gateway.customer.create({
            firstName: oInfo.forename,
            lastName: oInfo.surname,
            company: "Data Privacy Rights",
            email: oInfo.email,
        }, (err, result) => {
            if (err) throw err;
            if (result.success === true) {
                return next(null, result.customer.id);
            }
            return next(true, null);
        });
    },
    GenerateToken: (iCustomeriD, next) => {
        return gateway.clientToken.generate({
            customerId: iCustomeriD
        }, (err, clientToken) => {
            if (err) {
                console.error(err);
                return next(true, null);
            }
            next(null, clientToken);
        });
    },
    transaction: gateway.transaction,
    receiveWebHooks: (btSignature, btPayload, fCallback) => {
        return gateway.webhookNotification.parse(btSignature, btPayload, (err, webhookNotification) => {
            return fCallback(null, webhookNotification);        
        });
    },
    getTransactionInfo: (sTransactionID, fCallback) => {
        return gateway.transaction.find(sTransactionID, fCallback);
    },
}
