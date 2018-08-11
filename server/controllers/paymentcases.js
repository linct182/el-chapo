const CasePayments = require('../models/index').case_payouts;
const CustomerPayment = require('../models/index').customer_payments;
const PayoutRequests = require('../models/index').payout_requests;
const SQLize = require('sequelize');

module.exports = {
    GetCases(req, body) {
        let oParams = {};
        let iLimit = 10;
        let iOffset = 0;
        let aOrder = ['createdAt', 'DESC'];
        let iPage = 1;
        let aColumns = ['createdAt'];
        let aDirs = ['ASC', 'DESC', 'desc', 'asc'];

        if (req.body.caseID) {
            oParams.case_uuid = req.body.caseID;
        }

        if (parseInt(req.body.page) > 1) {
            iPage = parseInt(req.body.page);
            iOffset = (iPage - 1) * iLimit;
        }

        if (req.body.order) {
            if (aColumns.indexOf(req.body.order) >= 0) {
                aOrder[0] = req.body.order;
            }
        }

        if (req.body.sort_dir) {
            if (aDirs.indexOf(req.body.sort_dir) >= 0) {
                aOrder[1] = req.body.sort_dir;
            }
        }

        return CasePayments.findOne({
            where: oParams,
            attributes: [[SQLize.fn('COUNT', SQLize.col('id')), 'count']]
        }).then((data) => {
            let itemCount = parseInt(data.dataValues.count);
            let hasNextPage = false;
            let numPages = 1 + parseInt(itemCount / iLimit);
            let hasNext = false;
            let hasPrev = false;

            if (iPage < numPages) {
                hasNext = true;
            }

            if (iPage > 1) {
                hasPrev = true;
            }

            return CasePayments.findAll({
                where: oParams,
                limit: iLimit,
                offset: iOffset,
                order: [aOrder],
            }).then((result) => {
                return res.send({
                    count: itemCount,
                    pages: numPages,
                    hasNext: hasNext,
                    hasPrev: hasPrev,
                    result: result,
                })
            }).catch((err) => {
                console.error(err);
                return res.status(400).send('There is an error fetching cases')
            })
        })
    },
    SetAsPaid: (req, res, next) => {
        return CasePayments.update({
            is_paid: true,
        }, {
            where: {
                payout_request_id: req.body.request_id
            }
        }).then((data) => {
            return next();
        }).catch((err) => {
            console.error(err);
            return res.status(400).send('There is an error updating casePayments');
        });
    },
    CreatePayoutRequest: (req, res) => {
        if (req.body.caseIDs > 10) {
            return res.status(400).send('Maximum cases per payout has already been reached.');
        }
        // verify 
        return CasePayments.findAll({
            where: {
                case_uuid: {
                    [SQLize.Op.in]: req.body.caseIDs
                }
            },
            attributes: [[SQLize.fn('SUM', SQLize.col('amount')), 'sum']]
        }).then((data) => {
            let { sum } = data.dataValues;

            // let payout = sum * 0.2;
            return PayoutRequests.create({
                total_amount: sum,
                agent_id: req.user.id,
            }).then((data) => {
                return CasePayments.update({
                    payout_request_id: data.id,
                }, {
                    where: {
                        case_uuid: {
                            [SQLize.Op.in]: req.body.caseIDs
                        }
                    }
                }).catch((err) => {
                    console.error(err);
                    return res.status(400).send('Error Updating Request');
                });
            }).catch((err) => {
                console.error(err);
                return res.status(400).send('Error creating payout');
            });

        }).catch((err) => {
            console.error(err);
            return res.status(400).send('Error Computing total payment');
        });
    }
}