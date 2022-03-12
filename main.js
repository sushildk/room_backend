const express = require('express')();
const app = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path')

const config = require('./config/index');
require('./config/dbConnection');

const authenticate = require('./middleware/authenticate');
const authRoutes = require('./controllers/auth.routes');
const userRoutes = require('./controllers/user.routes');
const roomRoutes = require('./controllers/room.routes');
const cartRoutes = require('./controllers/cart.routes');
const bookingRoutes = require('./controllers/booking.routes');
const commentRoutes = require('./controllers/comment.routes');

express.use(bodyParser.urlencoded({ extended: false }));
express.use(bodyParser.json());
express.use(morgan('dev'));
express.use(cors());

express.use('/files/images', app.static(path.join(__dirname, 'files/images')));


express.use('/auth', authRoutes);
express.use('/user', authenticate, userRoutes);
express.use('/room', roomRoutes);
express.use('/cart', authenticate, cartRoutes);
express.use('/book', bookingRoutes);
express.use('/comment', commentRoutes);

express.use((req, res, next) => {
    next({
        message: '404 Page Not Found'
    })
})

express.use((err, req, res, next) => {
    res.status(err.status || 400);
    res.json({
        message: err.message || err
    })
})


// express.listen(config.port, (err, done) => {
//     if (err) {
//         console.log('Connection Failed');
//     } else {
//         console.log('Connection listening at ', config.port);
//     }
// })
express.listen(config.port, (err, done) => {
    if (err) {
        console.log('Server Connection Failed');
    } else {
        console.log('Server Listening at ', config.port);
    }
})