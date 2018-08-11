const Braintree = require('../services/braintree');
const braintree = require('braintree');
const CustomerPayments = require('../models/index').customer_payments;
const Cases = require('../models/index').cases;
const Config = require('../config/config.json');
const WebHooks = require('../models/index').web_hooks;
const Redis = require('../utils/redis');

// Queuer requires redis.
const Queuer = require('../../batch/index')(Redis);
module.exports = {
    CreateTestUser: (req, res) => {
        return Braintree.CreateUser({
            forename: "Thetest",
            surname: "Thesurname",
            email: "email@gmail.com"
        }, (err, resp) => {
            return res.send(resp);
        });
    },
    SaveWebHook: (req, res, next) => {
        let hook_type = 'PAYPAL_WEBHOOK';
        if (req.body.bt_signature && req.body.bt_payload) {
            hook_type = 'BRAINTREE_WEBHOOK';            
        }

        WebHooks.create({
            hook_name: 'PAYPAL_WEBHOOK',
            raw_data: JSON.stringify(req.body),
        });

        next();
    },
    GenerateTestToken: (req, res) => {
        if (typeof req.user !== 'undefined' && req.user.braintree_customer_id ) {
            return Braintree.GenerateToken(req.user.braintree_customer_id, (err, token) => {
                if (err) {
                    console.error(err);
                    return res.status(400).send('');
                }
                return res.send(token);
            });
        }
        return res.status(400).send('You are not allowed to have a payment token');
    },
    CreateTestWebhook: (req, res) => {
        if (Config.version === 'ABC') {
            const sampleNotification = Braintree.transaction.gateway.webhookTesting.sampleNotification(
                braintree.WebhookNotification.Kind.Disbursement,
                "asdad1231"
            );
            return Braintree.transaction.gateway.webhookNotification.parse(
                sampleNotification.bt_signature,
                sampleNotification.bt_payload,
                (err, webhookNotification) => {
                    // "myId"
                    console.log(webhookNotification);
                    return res.send('ok');
                }
            );
        }
        res.send('Test completed.');
    },
    StartTransaction: (req, res) => {
        // res.send(req.body);
        return Braintree.transaction.sale({
            amount: "10.00",
            paymentMethodNonce: req.body.nonce,
                options: {
                submitForSettlement: true,
                threeDSecure: {
                    required: true
                },
            }
        }, function (err, result) {
            if (result.success === false) {
                return res.status(400).send({
                    message: result.message
                });
            }
            if (result.transaction.threeDSecureInfo.liabilityShifted === true) {
                return res.send('OK')
            }
            return res.send('Fine');
        });
    },
    ReceiveDisbursement: (req, res) => {
        return Braintree.receiveWebHooks(req.body.bt_signature, req.body.bt_payload, (err, resp) => {
            if (resp.kind === 'disbursement') {
                let { transactionIds } = resp.subject.disbursement;
                for (let i = 0; i < transactionIds.length; i++) {
                    // Prevent the same key from being added again.
                    Redis.exists(`queuer:transaction:bt-pending:blocker:${transactionIds[i]}`, (err, exists) => {
                        if (exists === 1) {
                            return false;
                        }
                        return Queuer.queue('bt-pending', transactionIds[i]);
                    });
                }
            }
            res.end('ok');
        });      
    },
    ReceivePaypalWebHook: (req, res) => {
        // Get paypal ID from db.
        // id is the paypal captureID
        // parent payment is the transaction id saved.
        let { parent_payment, id, transaction_fee } = req.body.resource;
        let amount = parseFloat(req.body.resource.amount.total);
        let fee = 0;
        if (typeof transaction_fee === 'object') {
            fee = parseFloat(transaction_fee.value);
        }

        // do let it be.
        // save payment id.
        return CustomerPayments.findOne({
            where: {
                transaction_id: `${parent_payment}:${id}`
            }
        }).then((data) => {
            if (!data || typeof data.id === 'undefined') {
                return res.send('ok');
            }
            // subtract the transaction fee from the total amount to get the current payment
            let actual_payment = amount - fee;

            return CustomerPayments.update({
                actual_payment: parseFloat(actual_payment)
            }, {
                where: {
                    id: data.id
                }
            }).then(() => {
                Cases.update({
                    status_id: 2
                }, {
                    where: {
                        case_uuid: data.case_uuid
                    }
                });
                return res.send('ok');
            }).catch(err => {
                console.log(err);
                res.send('ok');
            });
        }).catch((error) => {
            console.log(error);
            res.send('ok');
        });
    },
    PaypalRefundWebHook: (req, res) => {
        let { parent_payment, id, transaction_fee } = req.body.resource;

        return CustomerPayments.findOne({
            where: {
                transaction_id: `${parent_payment}:${id}`,
            }
        }).then((data) => {
            if (!data || typeof data.id === 'undefined') {
                return res.send('ok');
            }

            let _amount = req.body.resource.amount.total || req.body.resource.amount

            return CustomerPayments.update({
                refunded: Math.abs(_amount)
            }, {
                where: {
                    id: data.id
                }
            }).then(() => {
                res.send('ok');
            }).catch(err => {
                console.log(err);
                res.send('ok');
            });            
        })
    },
    GetTransactionInfo:(req, res) => {
        console.log(req.body);
        return Braintree.transaction.find(req.body.transID, (err, resp) => {
            console.log(resp.status, resp.amount);
            res.send('ok');
        })
    }
}