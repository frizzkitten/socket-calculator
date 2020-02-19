const mongoose = require("mongoose");

var CalculationSchema = new mongoose.Schema({
    equation: String
});

module.exports = mongoose.model("calculation", CalculationSchema);
