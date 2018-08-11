const CasePayments = require('../models/index').case_payouts;
const Users = require('../models/index').users;
const CustomerPayment = require('../models/index').customer_payments;
const PayoutRequests = require('../models/index').payout_requests;
const SQLize = require('sequelize');
const Email = require('../services/email');
const { sequelize } = require('../models/index');

module.exports = {
    ListRequests: (req, res) => {
        // find all 
        let iLimit = 10;
        let iOffset = 0;
        let aOrder = ['createdAt', 'DESC']
        let iPage = 1;
        let aColumns = ['total_amount', 'createdAt', 'payment_date']
        let aDirs = ['ASC', 'DESC', 'desc', 'asc'];

        let oUserParams = {};
        let oPayoutParams = {
            is_paid: true,
        };

        let aParams = [];

        let sEmailQuery = '';

        // check items per page  - define limit first to determine offset
        if (parseInt(req.body.items_per_page) > 0) {
            if (req.body.items_per_page < 100) {
                iLimit = req.body.items_per_page
            }
        }

        // determine offset.
        if (parseInt(req.body.page) > 1) {
            iPage = parseInt(req.body.page);
            iOffset = (iPage - 1) * iLimit;
        }

        if (req.body.order) {
            if (aColumns.indexOf(req.body.order) >= 0) {
                aOrder[0] = req.body.order;
            }
        }

        // check items per page  - define limit first to determine offset
        if (parseInt(req.body.items_per_page) > 0) {
            if (req.body.items_per_page < 100) {
                iLimit = req.body.items_per_page
            }
        }

        if (req.body.sort_dir) {
            if (aDirs.indexOf(req.body.sort_dir) >= 0) {
                aOrder[1] = req.body.sort_dir;
            }
        }

        if (req.body.is_paid) {
            oPayoutParams = { is_paid: req.body.is_paid };
        }
        
        aParams.push(oPayoutParams.is_paid);

        if (req.body.search_key) {
            oUserParams.email = {
                // iLike for Postgres ONLY!
                [SQLize.Op.iLike]: `%${req.body.search_key}%`
            }
            
            aParams.push('%' + req.body.search_key + '%');
            sEmailQuery = `AND "email" iLike ?`
        }
        
        return sequelize.query(`select COUNT(*) as "count" from (
            SELECT "payout_requests"."id"
            FROM "payout_requests" AS "payout_requests" 
            INNER JOIN "users" AS "agent" ON 
                "payout_requests"."agent_id" = "agent"."id"
            WHERE "payout_requests"."is_paid" = ? 
            ${sEmailQuery}
            ) as x
        `, {
            replacements: aParams
        }).then((data) => {
            let itemCount = parseInt(data[0][0].count);
            let numPages = Math.ceil(itemCount / iLimit );
            let hasNext = false;
            let hasPrev = false;

            // if the current page != || < numpages
            if (iPage < numPages) {
                hasNext = true;
            }

            if (iPage > 1) {
                hasPrev = true;
            }
            return PayoutRequests.findAll({
                where: oPayoutParams,
                limit: iLimit,
                offset: iOffset,
                order: [aOrder],
                include: [{
                    model: Users,
                    as: 'agent',
                    where : oUserParams,
                    attributes: ['forename', 'surname', 'email', 'phone_number', 'bank_no']
                }]
            }).then((result) => {
                return res.send({
                    count: itemCount,
                    pages: numPages,
                    hasNext: hasNext,
                    hasPrev: hasPrev,
                    result: result
                });
            }).catch((err) => {
                console.error(err);
                return res.status(400).send('There is an error fetching Payouts');
            })
        }).catch((err) => {
            console.error(err);
            return res.send('There is an error counting results');
        })
    },
    SetAsPaid: (req, res, next) => {
        return PayoutRequests.update({
            payment_date: new Date(),
            is_paid: true,
        }, {
            where: {
                id: req.body.request_id,
            },  
            returning: true,
        }).then((data) => {
            req.total_amount = data[1][0].dataValues.total_amount;
            req.agent_id = data[1][0].dataValues.agent_id;
            next();
        }).catch((err) => {
            console.error(err);
            return res.status(400).send('There is an error updating payout request');
        })
    },
    SendApprovalEmail: (req, res, next) => {
        // console.log('something');
        // console.log(req.total_amount);
        // console.log(req.agent_email);
        // console.log(req.agent_name);
        Email.SendMessage(req.agent_email, `Please be advised that we've transferred <strong>USD ${Math.abs(req.total_amount).toFixed(2)}</strong> into your bank`, req.agent_name, "Payout Request Confirmation")
        return res.send('ok');
    }
}