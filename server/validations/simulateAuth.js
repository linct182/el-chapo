module.exports = {
    // Fills up a user with this dummy user :)
    DummyUser(req, res, next) {
        req.user = {
            id: 1,
            user_type_id: 3,
        }
        next();
    }
}