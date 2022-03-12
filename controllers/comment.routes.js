const router = require('express').Router();

const authenticate = require('../middleware/authenticate');
const roomModel = require('./../models/room.model');

router.route('/:id')
    .get((req, res, next) => {
        roomModel.findById(req.params.id)
            .exec((err, room) => {
                if (err)
                    return next(err)
                res.send(room);
            })
    })
    .put(authenticate, (req, res, next) => {
        roomModel.findById(req.params.id)
            .exec((err, room) => {
                if (err)
                    return next(err);
                if (room) {
                    room.price = 123;
                    room.comment.comment = req.body.comment;
                    room.comment.user = req.loggedInUser._id;
                    console.log('aayoo', req.body.comment + ' yeta' + req.loggedInUser._id);
                    room.save((err, saved) => {
                        if (err)
                            return next(err);
                        res.send(saved);
                    })
                }
            })
    })

module.exports = router;