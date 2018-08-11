const Plans = require('../models').case_plans;
module.exports = {
    ListCases(req, res) {
        return Plans.findAll({
            attributes: ['id', 'title', 'description', 'amount', 'min', 'max']
        }).then(plans => {
            res.send(plans);
        }).catch(err => {
            console.log(err);
            res.status(400).send('Error');
        });
    },
    UpdateCasePlans(req, res) {
        return Plans.update({
            title: req.body.title,
            description: req.body.description,
            amount: req.body.amount,
            min: req.body.min,
            max: req.body.max,
        }, {
            where: {
                id: req.body.id
            }
        }).then(()=> {
            return res.send('ok');
        }).catch((err) => {
            console.error(err);
            return res.status(400).send({
                success: false,
                message: 'There is an error while updating the plan',
            })
        });
    },
    CreatePlan(req, res) {
        return Plans.create({
            title: req.body.title,
            description: req.body.description,
            amount: req.body.amount,
            min: req.body.min,
            max: req.body.max,
        }).then(() => {
            return res.send('ok');
        }).catch((err) => {
            console.error(err);
            return res.status(400).send({
                success: false,
                message: 'There is an error while updating the plan',
            })
        });
    },
    RemovePlan(req, res) {
        return Plans.destroy({
            where: {
                id: req.body.id
            }
        }).then(() => {
            return res.send('ok');
        }).catch((err) => {
            console.error(err);
            return res.status(400).send({
                success: false,
                message: 'Error deleting Plan'
            });
        })
    }
}
