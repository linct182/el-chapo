const CustomerPayments = require('../models/index').customer_payments;
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

module.exports = {
    /**
     * Shows a list of all the users who paid within a certain month
     * @param {object} req 
     * @param {object} res 
     */
    ShowList(req, res) {
        let year = parseInt(req.query.year);
        let month = parseInt(req.query.month);

        if (!year) {
            year = new Date().getFullYear();
        }

        // Subtract month if it is from user input to match month offset
        if (!month) {
            month = new Date().getMonth();
        } else {
            month--;
        }

        var date = new Date(year, month);
        var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        var lastDay = new Date(Date.parse(new Date(date.getFullYear(), date.getMonth() + 1)) - 1);
        
        return CustomerPayments.findAll({
            attributes: ['id', 'transaction_id', 'actual_payment', 'gateway', 'case_uuid', 'createdAt'],
            where: {
                refunded: {
                    [Op.eq]: null
                },
                actual_payment: {
                    [Op.ne]: null
                },
                createdAt: {
                    [Op.gt]: firstDay,
                    [Op.lt]: lastDay
                },
            }
        }).then((data) => {
            return res.send(data);
        }).catch((err) => {
            console.error(err);
            return res.status(400).send('There is an error showing list');
        })
    },
    /**
     * Returns total income this month
     * @param {object} req 
     * @param {object} res 
     */
    ShowTotalIncome(req, res) {
        let year = parseInt(req.query.year) ;
        let month = parseInt(req.query.month);

        if (!year) {
            year = new Date().getFullYear();
        }

        // Subtract month if it is from user input to match month offset
        if (!month) {
            month = new Date().getMonth();
        }else {
            month--;
        }

        var date = new Date(year, month);
        var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        var lastDay = new Date(Date.parse(new Date(date.getFullYear(), date.getMonth() + 1)) - 1);

        return CustomerPayments.findOne({
            attributes: [
                [Sequelize.fn('SUM', Sequelize.col('actual_payment')), 'total']
            ],
            where: {
                refunded: {
                    [Op.eq]: null
                },
                actual_payment: {
                    [Op.ne]: null
                },
                createdAt: {
                    [Op.gt]: firstDay,
                    [Op.lt]: lastDay
                },
            }
        }).then((data) => {
            return res.send(data);
        }).catch((err) => {
            console.error(err);
            return res.status(400).send('There is an error counting payments');
        });
    }
}