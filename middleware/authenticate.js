const jwt = require('jsonwebtoken');
const config = require('./../config/index');
const userModel = require('./../models/user.model');

module.exports = (req, res, next) => {
    var token;
    if (req.headers['authorization'])
        token = req.headers['authorization'];
    if (req.headers['x-access-token'])
        token = req.headers['x-access-token'];
    if (req.headers['token'])
        token = req.headers['token'];
    if (req.query.token)
        token = req.query.token;
        console.log('token aayooo',token)
    if (token) {
        jwt.verify(token, config.jwtSecretKey, (err, done) => {
            if (err) {
                return next(err);
            }
            console.log(done.id);
            userModel.findById(done.id)
                .exec((err, user) => {
                    if (err) {
                        return next(err);
                    }
                    if (user) {
                        req.loggedInUser = user;
                        return next();
                    } else {
                        return next({
                            message: 'User with token is removed from system'
                        })
                    }
                })
        })
    } else {
        console.log(req.headers);
        return next({
            message: 'Token not provided'
        })
    }
}