const mongoose = require("mongoose");

/*
 * One document per logged-in device / browser.
 * "Logout from all devices" = delete every session of that user.
 */
const UserSessionSchema = new mongoose.Schema({

    tokenHash: { type: String, required: true, unique: true },   // sha256 of the token — the raw token is never stored
    userId: { type: String, required: true },                     // Users.Userid (admin) or EmployeeData.Employeeid (employee)
    role: { type: String, enum: ["admin", "employee"], required: true },
    userAgent: String,
    createdAt: { type: Date, default: Date.now },
    lastSeenAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true }

}, {
    collection: "UserSessions"
});

UserSessionSchema.index({ userId: 1, role: 1 });

// MongoDB deletes a session automatically once its expiresAt time has passed
UserSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("UserSessions", UserSessionSchema);
