const Users = require('../models').users;
const UserTypes = require('../models').user_types;

module.exports = {
  listCustomers(req, res) {
    return UserTypes
      .findById(req.params.userTypeId, {
        include: [{
          model: Users,
          as: 'members',
          attributes: ['id', 'forename', 'surname', 'email', 'phone_number']
        }],
        attributes: ['id', 'role']
      })
      .then(users => {
        if (!users) {
          return res.status(404).send({
            message: 'Users Not Found',
          });
        }
        return res.status(200).send(users);
      })
      .catch(error => res.status(400).send(error));
  }
}