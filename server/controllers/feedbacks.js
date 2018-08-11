const Feedbacks = require('../models/index').case_feedbacks;
const Users = require('../models/index').users;

module.exports = {
    CreateFeedback(req, res) {
        return Feedbacks.create({
            feedback: req.body.feedback,
            case_uuid: req.body.caseID,
            user_id: req.user.id
        }).then((data) => {
            return res.send('ok');
        }).catch((err) => {
            console.error(err);
            return res.status(400).send("There is an error while saving the feedback");
        })
    },
    RemoveFeedback(req, res) {
        return Feedbacks.destroy({
            where: {
                id: req.body.feedbackID
            }
        }).then((data) => {
            return res.send('ok');
        }).catch((err) => {
            console.log(err);
            return res.status(400).send("There is an error when deleting this feedback.");
        });
    },
    LoadFeedbacks(req, res) {
        return Feedbacks.findAll({
            where: {
                case_uuid: req.params.caseid
            },
            order: [['id', 'ASC']],
            include: [{
                model: Users,
                as: 'user',
                attributes: ['forename', 'surname'],
            }]
        }).then((data) => {
            return res.send(data);
        }).catch((err) => {
            console.error(err);
            return res.status(400).send("There is an error loading feedbacks.");
        })
    }
}
