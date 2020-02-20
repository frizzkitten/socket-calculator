const mongoose = require("mongoose");

var CalculationSchema = new mongoose.Schema({
    equation: String,
    date: Date
});

module.exports = mongoose.model("calculation", CalculationSchema);
