const { number, string, boolean } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/*     var commentSchema = new Schema({
        comment:String,
        user:{
            type:Schema.Types.ObjectId,
            ref:'user'
        }
    }) */

var roomSchema = new Schema(
  {
    price: Number,
    image: [String],
    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    categories: {
      type: String,
      enum: ["premium", "urgent", "normal"],
    },
    phoneNumber: {
      type: String,
      require: true,
    },
    numberOfRoom: Number,
    carParking: {
      type: Boolean,
      default: false,
    },
    bikeParking: {
      type: Boolean,
      default: false,
    },
    booked: Boolean,
    bookedUser: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    address: String,
    description: String,
  },
  {
    timestamps: true,
  }
);

var roomModel = mongoose.model("room", roomSchema);

module.exports = roomModel;
