const router = require('express').Router();
const userModel = require('./../models/user.model');
var userHelp = require('./../helper/user.help');
const multer = require('multer');
const fs = require('fs');
const authentication = require('./../middleware/authenticate')

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './files/images/user/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '_' + file.originalname);
    }
})

function imageFilter(req, file, cb) {
    if (file.mimetype.split('/')[0] == 'image') {
        cb(null, true);
    } else {
        req.fileError = true;
        cb(null, true);
    }
}

function imageDelete(fileName) {
    fs.unlink('./files/images/user/' + fileName, (err, done) => {
        if (err) {
            console.log('File removing failed', err);
        } else {
            console.log('File Removing Success');
        }
    })
}
var upload = multer({
    storage: storage,
    fileFilter: imageFilter
})

router.route('/')
    .get((req, res, next) => {
        userModel.find({})
            .sort({ _id: -1 })
            .limit(10)
            .exec((err, users) => {
                if (err) {
                    return next(err);
                }
                res.json(users);
            })
    })

router.route('/edit/:id')
    .put((req, res, next) => {
        userModel.findById(req.params.id)
            .exec((err, user) => {
                if (err)
                    return next(err)
                if (req.body.roomAddress)
                    user.roomAddress = req.body.roomAddress
                user.save((err, saved) => {
                    if (err)
                        return next(err)
                    res.send(saved);
                })
            })
    })

router.route('/:id')
    .get((req, res, next) => {
        userModel.findById(req.params.id)
            .exec((err, user) => {
                if (err) {
                    return next(err);
                }
                res.json(user);
            })
    })
    .delete((req, res, next) => {
        userModel.findByIdAndDelete(req.params.id)
            .exec((err, removed) => {
                if (err) {
                    console.log('err');
                    return next(err);
                }
                console.log('removeddd.....', removed);
                res.json(removed);
            })
    })
    .put(authentication, upload.single('img'), (req, res, next) => {
        console.log('req.body', req.body);
        if (req.fileError) {
            imageDelete(req.file.filename);
            return next({
                message: 'Invalid File Format'
            })
        }
        userModel.findById(req.params.id)
            .exec((err, user) => {
                if (err) {
                    return next(err)
                }
                if (user) {
                    var oldImage = user.image;
                    console.log('old image>>>'.oldImage);
                    var updatedUser = userHelp(req.body, user);
                    console.log('updated user', updatedUser);
                    if (req.file) {
                        updatedUser.image = req.file.filename;
                        imageDelete(oldImage);
                    }
                    updatedUser.save((err, saved) => {
                        if (err) {
                            return next(err);
                        }
                        console.log('this.save>>>', saved)
                        res.json(saved);
                    })
                }
            })
    })


module.exports = router;