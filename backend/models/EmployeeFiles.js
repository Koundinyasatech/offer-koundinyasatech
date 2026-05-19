const mongoose = require("mongoose");

const EmployeeDocumentSchema = new mongoose.Schema({

    Empid: Number,
    ActualfileName: String,
    FileName: String,
    filepath: String,
    ContentType: String,
    Data: Buffer,
    CreatedUserId:Number,
    CreatedDatetime:String,
    Islatest:Boolean
}, {
    collection: "EmployeeFiles"
});

module.exports = mongoose.model(
    "EmployeeFiles",
    EmployeeDocumentSchema
);