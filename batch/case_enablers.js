// this program will run indefinitely every 30 seconds. or 30 seconds after the query has been executed
let redis = require('../server/utils/redis');
let braintree = require('../server/services/braintree');
let CustomerCases = require('../server/models/index').cases;

module.exports = (sDuration) => {
    let value = 0;
    let processor = require('./index')(redis);

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
            return processor.get('activate-pending', (err, sCaseID) => {

                if (sCaseID === null || !sCaseID) {
                    return RunNext();
                }
       
                // Get case information to verify if it exists.
                return CustomerCases.findOne({
                    where: {
                        case_uuid: sCaseID
                    }
                }).then((data) => {
                    // if the case is undefined, then skip
                    if (typeof data !== 'undefined' && data) {
                        // check customer case and make sure it 1.
                        if (data.status_id === 1) {
                            return CustomerCases.update({
                                status_id: 2,
                            }, {
                                where: {
                                    case_uuid: sCaseID
                                }
                            }).then(() => {
                                // make sure to run it again AFTER the update has taken effect
                                return RunNext();
                            });
                        }
                    }

                    return RunNext();
                }).catch((err) => {
                    console.error(err);
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