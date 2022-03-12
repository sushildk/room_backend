const router = require('express').Router();
const multer = require('multer');
const fs = require('fs');

const roomModel = require('./../models/room.model');
const roomHelp = require('./../helper/room.help');
const authenticate = require('./../middleware/authenticate');

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './files/images/room');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '_' + file.originalname);
    }
})

var upload = multer({
    storage: storage
});

function imageFilter(req) {
    console.log('imagefiler');
    var state = false;
    for (i = 0; i < 3; i++) {
        if (req[i]) {
            if (req[i].mimetype.split('/')[0] !== 'image')
                state = true;
        }
    }
    return state;
}

function imageDelete(req) {
    console.log('req.files in imagedelete>> ', req.files);
    for (i = 0; i < 3; i++) {
        if (req[i]) {
            if (req[i].filename) {
                fs.unlink('./files/images/room/' + req[i].filename, (err, done) => { })
                /* } else {
                    fs.unlink('./files/images/room/' + req[i], (err, done) => { })
                } */
            }
        }
    }
}

router.route('/')
    .get((req, res, next) => {
        roomModel.find({}).populate('user')
            .exec((err, rooms) => {
                if (err) {
                    return next(err);
                }
                res.json(rooms);
            })
    })
    .post(authenticate, upload.array('img', 3), (req, res, next) => {
        var newRoom = new roomModel({});
        newRoom = roomHelp(req.body, newRoom);
        console.log('req.body', req.body);
        newRoom.user = req.loggedInUser._id;
        if (req.files) {
            console.log('req.files>>>>', req.files);
            var fileError = imageFilter(req.files);
            if (fileError) {
                imageDelete(req.files);
                return next({
                    message: 'Invalid File Format'
                })
            }
            for (i = 0; i < 3; i++) {
                if (req.files[i])
                    newRoom.image[i] = req.files[i].filename;
            }
        }
        console.log('newRoom>>>', newRoom);
        newRoom.save((err, done) => {
            if (err) {
                return next(err);
            }
            res.json(done);
        })
    })

router.route('/categories')
    .get(async (req, res, next) => {
        const categories = await roomModel.find({}).distinct('categories');
        const categoriesPromise = [];
        categories.forEach((categories) => {
            let p = roomModel.find({ categories: categories });
            categoriesPromise.push(p);
        })
        const data = await Promise.all([...categoriesPromise]);
        // console.log('data.............', data.length);
        let rooms = [];
        for (let i = 0; i < data.length; i++) {
            if (data[i][0].categories == "premium")
                rooms[0] = data[i];
            if (data[i][0].categories == "urgent")
                rooms[1] = data[i];
            if (data[i][0].categories == "normal")
                rooms[2] = data[i];
        }
        res.send(rooms);
    })

router.route('/eight')
    .get((req, res, next) => {
        roomModel.find({}).populate('user')
            .exec((err, rooms) => {
                if (err) {
                    return next(err);
                }
                let data = rooms.slice(0, 8);
                res.json(data);
            })
    })



router.route('/search')
    .get((req, res, next) => {
        var condition = {};
        var searchCondition = roomHelp(condition, req.query);
        roomModel.find(searchCondition)
            .exec((err, done) => {
                if (err) {
                    return next(err);
                }
                res.json(done);
            })
    })
    .post((req, res, next) => {
        var condition = {};
        var searchCondition = roomHelp(req.body, condition);
        if (req.body.minPrice) {
            searchCondition.price = {
                $gte: req.body.minPrice
            }
        }
        if (req.body.maxPrice) {
            searchCondition.price = {
                $lte: req.body.maxPrice
            }
        }
        if (req.body.minPrice && req.body.maxPrice) {
            searchCondition.price = {
                $gte: req.body.minPrice,
                $lte: req.body.maxPrice
            }
        }
        console.log('Search Condition>>>', searchCondition);
        roomModel.find(searchCondition)
            .exec((err, done) => {
                if (err) {
                    return next(err);
                }
                console.log('done>>>>', done);
                res.json(done);
            })
    })

router.route('/:id')
    .get((req, res, next) => {
        roomModel.findById(req.params.id)
            .exec((err, room) => {
                if (err) {
                    return next(err);
                }
                res.json(room);
            })
    })
    .delete(authenticate, (req, res, next) => {
        roomModel.findByIdAndDelete(req.params.id)
            .exec((err, removed) => {
                if (err) {
                    return next(err);
                }
                for (i = 0; i < 3; i++) {
                    if (removed.image[i]) {
                        fs.unlink('./files/images/room/' + removed.image[i], (err, done) => {
                            if (err) {
                                console.log('err', err);
                            }
                        })
                    }

                }
                res.json(removed);
            })
    })
    .put(authenticate, upload.array('img', 3), (req, res, next) => {
        roomModel.findById(req.params.id)
            .exec((err, room) => {
                if (err) {
                    return next(err);
                }
                if (room) {
                    var oldImage = [];
                    var image = [];
                    // console.log(req.files);
                    if (req.files) {
                        var fileError = imageFilter(req.files)
                        if (fileError) {
                            imageDelete(req.files);
                            return next({
                                message: 'Invalid File Format'
                            })
                        }
                        for (i = 0; i < 3; i++) {
                            if (req.files) {
                                if (room.image[i])
                                    oldImage[i] = room.image[i];
                            }
                            if (req.files[i])
                                image[i] = req.files[i].filename;
                        }
                        room.image = image;
                    }
                    
                    console.log('room.image', room.image);
                    console.log('room reqbody>>>', req.body);
                    room = roomHelp(req.body, room);
                    room.user = req.loggedInUser._id;
                    room.save((err, updated) => {
                        if (err) {
                            return next(err);
                        }
                        imageDelete(oldImage)
                        res.json(updated);

                    })
                }
            })
    })



module.exports = router;