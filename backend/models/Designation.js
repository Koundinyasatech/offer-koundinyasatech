const mongoose = require("mongoose");

const Designation = new mongoose.Schema({

    Id: Number,
    Role: String
}, {
    collection: "Designation"
});

module.exports = mongoose.model("Designation", Designation);