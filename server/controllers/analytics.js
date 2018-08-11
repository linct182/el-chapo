const {
    sequelize
} = require('../models/index');

module.exports = {
    GetMonthlySales: (req, res) => {

        let oData = {
            months : {
                Jan: 0,
                Feb: 0,
                Mar: 0,
                Jun: 0,
                Jul: 0,
                Aug: 0,
                Sep: 0,
                Oct: 0,
                Nov: 0,
                Dec: 0,
            },
            total_sales: 0,
        };

        let BaseYear = 2018;

        if (parseInt(req.query.year) > 2000) {
            BaseYear = parseInt(req.query.year);
        }

        let lowerLimit = new Date(BaseYear.toString());
        let upperLimit = new Date(new Date((BaseYear + 1).toString()) - 1);

        return sequelize.query(`select 
                to_char("createdAt", 'Mon') as month,
                extract(year from "createdAt") as year,
                sum("amount") as "sales"
            from "customer_payments"
            where "createdAt" > ? AND "createdAt" < ?
            group by 1,2
        `, {
            replacements: [lowerLimit, upperLimit]
        }).then((data) => {
            let aMonths = [];
            let iTotalSales = 0;
            for (let i = 0; i < data[0].length; i++) {
                // return res.send(data[0]);
                let _oData = data[0][i];
                oData.months[_oData.month.trim()] = parseFloat(_oData.sales);
                iTotalSales = iTotalSales + parseFloat(_oData.sales);
            }
            
            oData.total_sales = iTotalSales;

            return res.send(oData);
        }).catch((err) => {
            console.error(err);
            return res.status(400).send('There is an error Getting Monthly sales');
        });
    },
    ExtractYear: (req, res) => {
        let baseYear = 2018;
        let aData = [];
        let now = new Date();
        if (now.getFullYear() >= baseYear) {
            for (let i = baseYear; i <= now.getFullYear(); i++) {
                aData.push(i);
            }
        }
        return res.send(aData);
    }
}
