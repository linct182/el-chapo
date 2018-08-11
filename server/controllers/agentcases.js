const _ = require('lodash');
const Cases = require('../models/index').cases;
const CaseLog = require('../models/index').case_logs;
const CasePayouts = require('../models/index').case_payouts;
const PayoutRequests = require('../models/index').payout_requests;
const Users = require('../models/index').users;
const crypto = require('../services/crypto');
const config = require('../config/config.json');
const sequelize = require('sequelize');
const Websites = require('../models/index').websites;
const Feedbacks = require('../models/index').case_feedbacks;
const WebStatus = require('../models/index').website_status;
const Status = require('../models/index').case_status;
const Attachments = require('../models/index').attachments;
const CustomerPayments = require('../models/index').customer_payments;
const { Op } = require('sequelize');

const Joi = require('joi');
module.exports = {
    ResolveCase: (req, res, next) => {
        const schema = Joi.object().keys({
            caseID: Joi.string().required(),
        });

        Joi.validate(req.body, schema, (err, value) => {
            if (err) {
                console.error(err);
                return res.status(400).send(err);
            }
            return Cases.update({
                status_id: 4
            }, {
                where: {
                    case_uuid: req.body.caseID,
                    agent_id: req.user.id
                }
            }).then(() => {
                return res.status(200).send('Case Resolved!');
            }).catch((err) => {
                console.error(err);
                return res.status(400).send('invalid data');
            });
        })

    },
    ReopenCase: (req, res, next) => {
        const schema = Joi.object().keys({
            caseID: Joi.string().required(),
        });

        Joi.validate(req.body, schema, (err, value) => {
            if (err) {
                console.error(err);
                return res.status(400).send(err);
            }
            return Cases.update({
                status_id: 3
            }, {
                where: {
                    case_uuid: req.body.caseID,
                    agent_id: req.user.id
                }
            }).then(() => {
                return res.send('ok');
            }).catch((err) => {
                console.error(err);
                return res.status(400).send('invalid data');
            });
        })

    },
    // gets a random case!
    OpenCase: (req, res, next) => {
        return Cases.update({
            status_id: 3,
            agent_id: req.user.id,
            openedAt: new Date()
        }, {
            where: {
                case_uuid: req.case.case_uuid
            }
        }).then(() => {
            // put to logs.
            CaseLog.create({
                case_uuid: req.case.case_uuid,
                agent_id: req.user.id,
                details: 'open',
            });
            return res.send(req.case);
        }).catch((err) => {
            console.error(err);
            return res.status(400).send('invalid request');
        });

        return req.send({
            case: req.caseID,
        })
    },
    CountAll: (req, res, next) => {
        return Cases.findOne({
            attributes: [
                [sequelize.fn('COUNT', sequelize.col('case_uuid')), 'count']
            ],
            where: {
                status_id: 2
            }
        }).then((data) => {
            res.send(data);
        })
    },
    GetLastCase: (req, res, next) => {
        return Cases.findOne({
            where: {
                status_id: 2,
            },
            order: [
                [
                    'createdAt','ASC'
                ]
            ]
        }).then((data) => {
            if (!data) {
                return res.status(200).send({
                    message: 'no cases yet'
                })
            }
            req.case = data;
            return next();
        }).catch((err) => {
            console.error(err);
            res.status(400).send('invalid request');
        });
    },
    GetActiveCase: (req, res, next) => {
        let oData = {
            agent_id: req.user.id,
            status_id: {
                [sequelize.Op.or]: [3, 4]
            },
        };
        return Cases.findOne({
            where: oData,
            order: [
                [Attachments, 'id', 'ASC'],
            ],
            include: [
                {
                    model: Attachments,
                    as: 'attachments',
                    attributes: ['link', 'file_type', 'file_name']
                },
                {
                    model: Status,
                    as: 'status',
                    attributes: ['id', 'name', 'description']
                }],
        })
        .then(caseDetails => {
            if (!caseDetails) {
                return res.send({});
            }
            let sCaseID = crypto.generateS3KeyByUserID(caseDetails.case_uuid);
            let BASEURL = config.upload_base_url;
            
            res.status(200).send({
                caseDetails,
                base: `${BASEURL}/${sCaseID}/`
            });
        })
        .catch(error => {
            console.error(error);
            return res.status(400).send({
                message: 'There is an error'
            })
        });
    },
    GetCaseHistory: (req, res, next) => {
        const schema = Joi.object().keys({
            caseID: Joi.string().required(),
        });

        Joi.validate(req.body, schema, (err, value) => {
            if (err) {
                console.error(err);
                return res.status(400).send(err);
            }
            return CaseLog.findAll({
                case_uuid: req.params.caseID || 1,
                order: [
                    [
                        'createdAt', 'DESC'
                    ]
                ]
            }).then((data) => {
                return res.send(data);
            }).catch((err) => {
                console.error(err);
                res.status(400).send('invalid request');
            })
        });
    },
    GetAgentCasesHistory: (req, res, next) => {
        return Cases.findAll({
            where: {
                agent_id: req.user.id,
                status_id: 5
            }, include: [{
                model: Websites,
                as: 'websites',
                attributes: ['name']
            }],   
        }).then((data) => {
            return res.send(data);
        }).catch((err) => {
            console.error(err);
            return res.status(400).send('invalid data');
        })
    },
    GetAgentCasePayouts: (req, res, next) => {
        // find all 
        let iLimit = 10;
        let iOffset = 0;
        let aOrder = ['createdAt', 'DESC']
        let iPage = 1;
        let aColumns = ['case_uuid', 'forename', 'id', 'createdAt']
        let aDirs = ['ASC', 'DESC', 'desc', 'asc'];

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

        if (req.body.sort_dir) {
            if (aDirs.indexOf(req.body.sort_dir) >= 0) {
                aOrder[1] = req.body.sort_dir;
            }
        }

        return CasePayouts.findOne({
            where: { payout_request_id: null },
            attributes: [[sequelize.fn('COUNT', sequelize.col('id')), 'count']]
        }).then((data) => {
            let itemCount = parseInt(data.dataValues.count);
            let numPages = Math.ceil(itemCount / iLimit);
            
            return CasePayouts.findAll({
                where: { payout_request_id: null },
                limit: iLimit,
                offset: iOffset,
                order: [aOrder],
                include: [{
                    model: Cases,
                    as: 'case',
                    where: { agent_id: req.user.id },
                    attributes: ['agent_id'],
                    include: [{ model: Websites, as: 'websites', attributes: ['name'] }],
                }],
            }).then((result) => {

                return res.send({
                    count: itemCount,
                    pages: numPages,
                    result: result
                });

            }).catch((err) => {
                return res.status(400).send('there is an error querying for payout');
            })
        }).catch((err) => {
            return res.send('there is an error processing payouts');
        });
    },
    AgentRequestPayout: (req, res) => {
        return CasePayouts.findAll({
            where: {
                case_uuid: {
                    [Op.in]: req.body.case_uuids,
                },
                payout_request_id: {
                    [Op.eq]: null,
                },
            }
        }).then((data) => {
            if (data.length !== req.body.case_uuids.length) {
                // in cases that the selected case uuid has already been added to payment.
                return res.status(400).send({
                    field: 'case_uuids',
                    message: 'Case IDs not validated properly. Please refresh the page and try again'
                })
            }
            return PayoutRequests.sequelize.transaction(t => {
                return PayoutRequests.create({
                    agent_id: parseInt(req.user.id),
                    total_amount: req.body.total_amount,
                    payment_date: null,
                }, {
                    transaction: t
                }).then(payoutId => {
                    let promises = [];
                    _.forEach(req.body.case_uuids, value => {
                        const newPromise = CasePayouts.update({
                            payout_request_id: parseInt(payoutId.id),
                            transaction: t
                        }, {
                            where: {
                                case_uuid: value
                            },
                            transaction: t
                        });
                        promises.push(newPromise);
                    });
                    return Promise.all(promises).then(() => console.log('xxxxxxxxxxxxxxx'));
                });
            }).then(function (result) {
                // Transaction has been committed
                return res.status(200).send('Payout request sent!');
            }).catch(function (err) {
                // Transaction has been rolled back
                return res.status(400).send('Failed to send request, please try again');
            });
        }).catch((err) => {
            console.error(err);
            return res.status(400).send('There is an error validating request');
        })

    }
}
