const Cases = require('../models/index').cases;
const sequelize = require('sequelize');
const config = require('../config/config.json');
module.exports = {
    /**
     * Returns 403 if the user is not an agent
     */
    IsAgent: (req, res, next) => {
        if (req.user.user_type_id !== 3) {
            return res.status(403).send({
                message: 'Agents only'
            });
        }
        next();
    },
    /**
     * Return 403 if case is not owned by agent
     */
    IsCaseOwnedByAgent: (req, res, next) => {
        let case_id = req.body.caseID;

        if (!case_id) {
            case_id = req.params.caseID;
        }

        if (!case_id) {
            return res.status(400).send({
                message: 'case_id is required'
            });
        }

        return Cases.findOne({
            where: {
                case_uuid: case_id,
                agent_id: req.user.id,
                
            }
        }).then((_case) => {
            // case is automatically filtered to user id.
            if (!_case) {
                return res.status(403).send({
                    message: 'Permission Denied'
                });
            }

            req.case = _case.dataValues;
            
            return next();
        }).catch((err) => {
            console.error(err);
            return res.send(400).send({
                message: 'Error',
            })
        })
    },
    HasActiveCase: (req, res, next) => {
        return Cases.findOne({
            attributes: [
                [sequelize.fn('COUNT', sequelize.col('case_uuid')), 'count']
            ],
            where: {
                agent_id: req.user.id,
                status_id: 3
            }
        }).then((data) => {
            let { count } = data.dataValues;
            if (count >= config.maxActiveCases) {
                return res.status(400).send({
                    message: 'You have exceeded your limit.'
                });
            }
            next();
        }).catch((err) => {
            console.error(err);
            return res.status(400).send({
                message: 'You have an error'
            })
        })
    }
}
