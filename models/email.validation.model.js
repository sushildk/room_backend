const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var emailValidationSchema = new Schema({
    email: String,
    token: Number,
    validity:Date,
    valid: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true
})

var emailValidationModel = mongoose.model('emailValidation', emailValidationSchema);
module.exports = emailValidationModel;