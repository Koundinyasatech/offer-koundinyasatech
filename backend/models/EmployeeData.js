const mongoose = require("mongoose");

const EmployeeSchema = new mongoose.Schema({


    Employeeid: Number,
    Employeename: String,
    Designation: String,
    Mobileno: String,
    Email: String,
    code: String,
    Createduserid: Number,
    Createddatetime: String,
    IsActive: Boolean

}, {
    collection: "EmployeeData"
});
const EmployeeData = mongoose.model("EmployeeData", EmployeeSchema);

module.exports = EmployeeData;