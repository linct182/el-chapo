module.exports = {
    IsAdmin(req, res, next) {
        if (req.user.user_type_id !== 1) {
            return res.status(403).send({
                message: 'Admins only'
            });
        }
        next();
    }
}
