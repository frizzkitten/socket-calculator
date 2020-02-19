const mongoose = require("mongoose");

var FoodItemSchema = new mongoose.Schema({
    name: String,
    predQty: Number,
    prodQty: Number,
    ordQty: Number
});

module.exports = mongoose.model("FoodItem", FoodItemSchema);
