const Users = require('../models').users;
const Email = require('../services/email');
module.exports = {
    ListPending(req, res) {
        return Users
            .findAll({
                attributes: ['id', 'forename', 'surname', 'email', 'phone_number'],
                where: {
                    user_type_id: 2,
                    is_verified: false,
                }
            })
            .then(users => {
                if (!users) {
                    return res.status(404).send({
                        message: 'Users Not Found',
                    });
                }
                return res.status(200).send(users);
            })
            .catch(error => {
                console.error(error);
                return res.status(400).send('There is an error')
            });
    },
    Activate(req, res) {

        if (!parseInt(req.body.userID)) {
            return res.status(400).send({
                message: 'Enter valid user iD'
            });
        }

        return Users.update({
            is_verified: true
        }, {
            where: {
                // user_type_id: 2,
                id: req.body.userID,
            },
            returning: true,
            plain: true            
        }).then((affected) => {
            
            if (affected[1].dataValues.user_type_id === 3) {
                // send asynchronously
                Email.SendActivationLetter(affected[1].dataValues);
            }
            return res.send('ok');
        }).catch((err) => {
            console.error(err);
            return res.status(400).send('Something happened in the server');
        });
        // res.send('ok');
    },
    Deactivate(req, res) {
        if (!parseInt(req.body.userID)) {
            return res.status(400).send({
                message: 'Enter valid user iD'
            });
        }

        return Users.update({
            is_verified: false
        }, {
            where: {
                id: req.body.userID
            }
        }).then(() => {
            res.send('ok');
        }).catch((err) => {
            return res.status(400).send('Something happened in the server');
        });
    },
    GetAgentInfo: (req, res, next) => {
        return Users.find({
            where: {
                id: req.agent_id,
                user_type_id: 3,
            }
        }).then((data) => {
            if (!data.dataValues) {
                return res.status(400).send('user does not exist');
            }
            req.agent_email = data.dataValues.email;
            req.agent_name = data.dataValues.forename;
            return next();
        }).catch((err) => {
            console.error(err);
            return res.status(400).send('There is an error Fetching Agent Info');
        });
    }
}
