// this program will run indefinitely every 30 seconds. or 30 seconds after the query has been executed
let redis = require('../server/utils/redis');
let braintree = require('../server/services/braintree');
let CustomerPayments = require('../server/models/index').customer_payments;

module.exports = () => {
    let value = 0;
    let processor = require('./index')(redis);
    let oProcesses = {};

    // Runner will run..
    let Runner = (iDuration) => {
        // Process each task here.
        let RunNext = () => {
            // make sure to make a 1 second delay before next loop starts again
            setTimeout(() => {
                Runner(iDuration);
            }, iDuration);
        }

        if (value === 1) {
            return processor.get('bt-pending', (err, stransactionID) => {
                if (stransactionID === null || !stransactionID) {
                    return RunNext();
                }

                return braintree.getTransactionInfo(stransactionID, (err, res) => {
                    if (err) {
                        return RunNext();
                    }

                    // check if transactionInfo === 'ok';
                    if (res.status === 'settled' || res.status === 'Settled') {
                        // get the transaction from payment and extract case_uuid
                        return CustomerPayments.findOne({
                            where: {
                                transaction_id: stransactionID
                            }
                        }).then((data) => {
                            if (data === null || stransactionID === null || !stransactionID) {
                                return RunNext();
                            }

                            // Update Transaction!
                            CustomerPayments.update({
                                actual_payment: res.amount
                            }, {
                                where: {
                                    transaction_id: stransactionID
                                }
                            }).then(() => {
                                // put it to pending updates aftewards.
                                processor.queue('activate-pending', data.case_uuid);
                                return RunNext();
                            });
                        });                      
                    }else if (res.status === 'voided') {
                        return CustomerPayments.findOne({
                            where: {
                                transaction_id: stransactionID
                            }
                        }).then((data) => {
                            if (stransactionID === null || !stransactionID) {
                                return RunNext();
                            }
                            CustomerPayments.update({
                                refunded: res.amount
                            }, {
                                where: {
                                    transaction_id: stransactionID
                                }
                            }).then(() => {
                                // Do not queue this as this one is pending.
                                RunNext();
                            })
                        })
                    }

                    // requeue it to 1 hour.
                    console.log('Queueing this transaction', stransactionID);
                    processor.queue('bt-pending', stransactionID, 3600);
                    return RunNext();
                });
            });
 
        }
    }

    return {
        /**
         * Stops the runner.
         */
        stop: () => {
            console.log('Runner Stopped');
            value = 0;
        },
        /**
         * Starts the runner.
         */
        start: (iDuration) => {
            console.log('Runner started');
            value = 1;
            Runner(iDuration);
        }
    }
}