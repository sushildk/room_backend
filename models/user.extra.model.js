const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var userExtraSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    passwordResetExpiry: {
        type: Date,
        default: null
    },
    emailVerify: {
        type: Boolean,
        default: false
    },
    phoneVerify: {
        type: Boolean,
        default: false
    }
});

var userExtraModel = mongoose.model('userExtra', userExtraSchema);
module.exports = userExtraModel;