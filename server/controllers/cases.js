const _ = require('lodash');
const Joi = require('joi');
const Cases = require('../models').cases;
const CasePayouts = require('../models').case_payouts;
const CustomerPayments = require('../models').customer_payments;
const Promises = require('bluebird');
const sequelize = require('sequelize');


module.exports = {
    ListActiveCases: (req, res) => {
        return Cases.findAll({
            where: {
                status: 'Queued'
            },
            order: [['createdAt', 'DESC']],
            attributes: ['case_uuid', 'title', 'status', 'createdAt']
        }).then((data) => {
            return res.send(data);
        }).catch((err) => {
            console.error(err);
            return res.send('There is an error');
        }) 
    },
    IsCaseOwnedByAgent: (req, res, next) => {
        return Cases.findOne({
            where: {
                case_uuid: req.body.caseID,

            },
            attributes: ['agent_id']
        }).then((data) => {
            if (req.user.id !== data.agent_id) {
                return res.status(403).send('Not Allowed');
            }
            res.send('ok');
        }).catch((err) => {
            console.err(err);
            return res.status(400).send('Error');
        });
    },
    ConfirmCase: (req, res) => {
        if (req.caseInfo.status_id === 4) {
            return CasePayouts.sequelize.transaction(t => {
                return Cases.update({
                            status_id: 5,
                            closedAt: new Date()
                            },
                            { where: { case_uuid: req.body.caseID },
                            transaction: t
                        }).then(() => {
                            return CustomerPayments.find({
                                where: {
                                    case_uuid: req.body.caseID
                                },
                                transaction: t
                            }).then(result => {
                                return CasePayouts.create({
                                    case_uuid: req.body.caseID,
                                    amount: result.amount / 5,
                                    transaction: t
                                })
                            })
                        })
            }).then(function (result) {
                // Transaction has been committed
                return res.status(200).send('ok')
            }).catch(function (err) {
                // Transaction has been rolled back
                return res.status(400).send(err);
            });
        }
        return res.status(400).send('invalid case request');     
    },
    CountCases:(req, res) => {
        return Promises.map([1,2,3,4,5], (iStatusID) => {
            let oParams = {
                attributes: [
                    [sequelize.fn('COUNT', sequelize.col('case_uuid')), 'count'],
                ],
            };
            if (iStatusID > 0) {
                oParams.where = {
                    status_id: iStatusID
                }
            }
            return Cases.findOne(oParams);
        }, {
            concurrency: 2
        }).then((data) => {

            const aData = {
                queued: data[0].dataValues.count,
                verified: data[1].dataValues.count,
                active: data[2].dataValues.count,
                resolved: data[3].dataValues.count,
                closed: data[4].dataValues.count
            }
            return res.send(aData);
        }).catch((err) => {
            console.error(err);
            res.status(400).send('error');
        });

    }
}
