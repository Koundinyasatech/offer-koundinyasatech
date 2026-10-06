const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const crypto = require("crypto");
require("dotenv").config();

const EmployeeData = require("./models/EmployeeData");
const Users = require("./models/Users");
const EmployeeFiles = require("./models/EmployeeFiles");
const path = require("path");
const Designation = require("./models/Designation");
const UserSessions = require("./models/UserSessions");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://offer.koundinyasatech.com"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    console.log("Database name:", mongoose.connection.db.databaseName);
  })
  .catch((err) => {
    console.log(err);
  });

/* ── File storage ── */
const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, "uploads/"); },
  filename: function (req, file, cb) { cb(null, Date.now() + "-" + file.originalname); },
});
const upload = multer({ storage });

/* ── Code generator ── */
const generateCode = () => {
  const chars = "012345AWBCDVEFGHIUJKMXNPLYOZRSQT6789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};

/* ═══════════════════════════════════════════════════════════
   SESSIONS — one per logged-in device (needed for "logout from all devices")
═══════════════════════════════════════════════════════════ */
const SESSION_TTL_DAYS = Number(process.env.SESSION_TTL_DAYS) || 7;   // idle time before a device is logged out
const SESSION_TTL_MS = SESSION_TTL_DAYS * 24 * 60 * 60 * 1000;
const SESSION_REFRESH_MS = 5 * 60 * 1000;                             // extend an active session at most every 5 min

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

/* ── Create a session for a device and return its random token ── */
const createSession = async (userId, role, req) => {
  const token = crypto.randomBytes(32).toString("hex");
  await UserSessions.create({
    tokenHash: hashToken(token),
    userId: String(userId),
    role,
    userAgent: String(req.get("user-agent") || "").slice(0, 300),
    expiresAt: new Date(Date.now() + SESSION_TTL_MS),
  });
  return token;
};

/* ── Auth middleware — rejects tokens that were logged out or have expired ── */
const requireAuth = async (req, res, next) => {
  try {
    const header = req.get("authorization") || "";
    const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
    if (!token) return res.status(401).json({ message: "Please log in" });

    const session = await UserSessions.findOne({
      tokenHash: hashToken(token),
      expiresAt: { $gt: new Date() },
    });
    if (!session) {
      return res.status(401).json({ message: "Your session has ended. Please log in again." });
    }

    req.auth = { sessionId: session._id, userId: session.userId, role: session.role };

    // Sliding expiry: keep devices that are in use logged in
    if (Date.now() - (session.lastSeenAt?.getTime() || 0) > SESSION_REFRESH_MS) {
      UserSessions.updateOne(
        { _id: session._id },
        { $set: { lastSeenAt: new Date(), expiresAt: new Date(Date.now() + SESSION_TTL_MS) } }
      ).catch((err) => console.log("Session refresh failed:", err.message));
    }

    next();
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

/* ═══════════════════════════════════════════════════════════
   HEALTH CHECK
═══════════════════════════════════════════════════════════ */
app.get("/", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

/* ═══════════════════════════════════════════════════════════
   AUTH
═══════════════════════════════════════════════════════════ */
app.post("/api/auth/login", async (req, res) => {
  try {
    const { Userid, code } = req.body;

    if (!Userid || !code) {
      return res.status(400).json({ message: "Userid and code are required" });
    }

    let user = null;
    let role = "";

    const adminUser = await Users.findOne({ Userid });
    if (adminUser) {
      user = adminUser;
      role = "admin";
    } else {
      const empUser = await EmployeeData.findOne({ Employeeid: Userid });
      if (!empUser) return res.status(404).json({ message: "User not found" });
      if (empUser.IsActive !== true) {
        return res.status(403).json({
          message: `Employee ID ${Userid} is inactive. Please contact Hr@koundinyasatech.com.`,
        });
      }
      user = empUser;
      role = "employee";
    }
    if (!user) return res.status(404).json({ message: "User not found" });
    if (String(user.code) !== String(code)) {
      return res.status(401).json({ message: "Invalid code" });
    }

    // ✅ Include branch in user payload
    const userPayload = {
      Userid: user.Userid || user.Employeeid,
      Employeeid: user.Employeeid || user.Userid,
      name: user.name || user.Employeename || user.UserName || "",
      role,
      designation: user.designation || user.Designation || "",
      branch: user.branch || user.Branch || "",  // ✅ NEW — Return branch
      IsActive: user.IsActive ?? false,
    };

    // ✅ Random per-device token, stored as a session (old token `${role}-${Userid}` could not be revoked)
    const token = await createSession(userPayload.Userid, role, req);

    res.status(200).json({
      message: "Login Successful",
      token,
      user: userPayload,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

/* ── Logout — this device only ── */
app.post("/api/auth/logout", requireAuth, async (req, res) => {
  try {
    await UserSessions.deleteOne({ _id: req.auth.sessionId });
    res.json({ message: "Logged out" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});

/* ── Logout from ALL devices (including this one) ── */
app.post("/api/auth/logout-all", requireAuth, async (req, res) => {
  try {
    const result = await UserSessions.deleteMany({ userId: req.auth.userId, role: req.auth.role });
    console.log(`🔒 Logout all devices | ${req.auth.role} ${req.auth.userId} | sessions removed: ${result.deletedCount}`);
    res.json({ message: "Logged out from all devices", devicesLoggedOut: result.deletedCount });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});

/* ── Session check — frontend calls this to find out if it was logged out from another device ── */
app.get("/api/auth/me", requireAuth, (req, res) => {
  res.json({ userId: req.auth.userId, role: req.auth.role });
});

/* ═══════════════════════════════════════════════════════════
   DESIGNATION
═══════════════════════════════════════════════════════════ */
app.get("/api/Designation", requireAuth, async (req, res) => {
  try {
    console.log("Designation API Called");
    const data = await Designation.find({});
    res.json(data);
  } catch (err) {
    console.log("ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ═══════════════════════════════════════════════════════════
   USERS
═══════════════════════════════════════════════════════════ */
app.get("/api/users", requireAuth, async (req, res) => {
  try {
    console.log("Users API Called");
    const data = await Users.find({});
    res.json(data);
  } catch (err) {
    console.log("ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ═══════════════════════════════════════════════════════════
   EMPLOYEES — SPECIFIC ROUTES FIRST (before /:id)
═══════════════════════════════════════════════════════════ */

/* ── GET all employees ── */
app.get("/api/employees", requireAuth, async (req, res) => {
  try {
    console.log("📋 Employees API Called");
    const data = await EmployeeData.find({
      Employeeid: { $exists: true, $ne: null, $ne: "" },
    });

    // ✅ Map response to include branch
    const mapped = data.map((emp) => ({
      empId: emp.Employeeid,
      name: emp.Employeename,
      designation: emp.Designation,
      code: emp.code,
      mobile: emp.Mobileno,
      email: emp.Email,
      branch: emp.Branch || "",  // ✅ NEW — Include branch
      DOJ: emp.DOJ,
      DOE: emp.DOE,
      status: emp.IsActive ? "Active" : "Inactive",
    }));

    res.json(mapped);
  } catch (err) {
    console.log("❌ ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/employees/generate-code", requireAuth, async (req, res) => {
  try {
    const generatedCode = generateCode();
    res.status(200).json({ success: true, code: generatedCode });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error generating code", error: error.message });
  }
});

/* ── Get files by employee — MUST be before /:id ── */
app.get("/api/employees/GetFiles", requireAuth, async (req, res) => {
  try {
    const { Empid } = req.query;
    if (!Empid) return res.status(400).json({ message: "Empid is required" });

    const data = await EmployeeFiles.find({ Empid });

    const mapped = data.map((emp) => ({
      Id: emp.Id,
      Empid: emp.Empid,
      ActualfileName: emp.ActualfileName,
      FileName: emp.FileName,
      CreatedDatetime: emp.CreatedDatetime,
      Islatest: emp.Islatest,
    }));

    res.json(mapped);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ── Add employee ── */
app.post("/api/employees/add", requireAuth, async (req, res) => {
  try {
    // ✅ Accept branch from request body
    const { empId, name, designation, mobile, email, DOJ, DOE, code, branch, isActive } = req.body;

    console.log("📝 Adding Employee | Branch:", branch);

    // ✅ Include branch in validation
    if (!empId || !name || !designation || !mobile || !email || !DOJ || !DOE || !code || !branch) {
      return res.status(400).json({ 
        message: "All fields are required (including branch)" 
      });
    }

    // ✅ Validate branch values
    const validBranches = ["Hyderabad", "Bangalore"];
    if (!validBranches.includes(branch)) {
      return res.status(400).json({ 
        message: `Branch must be either "Hyderabad" or "Bangalore"` 
      });
    }

    const existing = await EmployeeData.findOne({ Employeeid: Number(empId) });
    if (existing) {
      return res.status(409).json({ message: "Employee ID already exists" });
    }

    const employee = new EmployeeData({
      Employeeid: Number(empId),
      Employeename: name,
      Designation: designation,
      Mobileno: mobile,
      Email: email,
      code: code,
      Branch: branch,  // ✅ NEW — Save branch to database
      DOJ: DOJ,
      DOE: DOE,
      Createduserid: 200000,
      Createddatetime: new Date().toISOString(),
      IsActive: isActive !== false,
    });

    await employee.save();
    console.log("✅ Employee saved with branch:", branch);
    res.status(200).json({ message: "Employee Saved Successfully" });
  } catch (err) {
    console.log("❌ Error:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ── Update employee ── */
app.put("/api/employees/update/:id", requireAuth, async (req, res) => {
  try {
    // ✅ Accept branch from request body
    const { name, designation, mobile, email, code, branch, isActive, DOJ, DOE, status } = req.body;

    console.log("✏️ Updating Employee | Branch:", branch);

    // ✅ Validate branch if provided
    if (branch) {
      const validBranches = ["Hyderabad", "Bangalore"];
      if (!validBranches.includes(branch)) {
        return res.status(400).json({ 
          message: `Branch must be either "Hyderabad" or "Bangalore"` 
        });
      }
    }

    // ✅ Build update object with branch
    const updateData = {
      Employeename: name,
      Designation: designation,
      Mobileno: mobile,
      Email: email,
      code: code,
      IsActive: isActive !== false,
      DOJ: DOJ,
      DOE: DOE,
    };

    // ✅ Include branch if provided
    if (branch) {
      updateData.Branch = branch;
    }

    const updated = await EmployeeData.findOneAndUpdate(
      { Employeeid: Number(req.params.id) },
      { $set: updateData },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Employee not found" });
    console.log("✅ Employee updated with branch:", branch);
    res.json({ message: "Employee updated successfully" });
  } catch (err) {
    console.log("❌ Error:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ── Get single employee by ID ── */
app.get("/api/employees/:id", requireAuth, async (req, res) => {
  try {
    const emp = await EmployeeData.findOne({ Employeeid: Number(req.params.id) });
    if (!emp) return res.status(404).json({ message: "Employee not found" });

    // ✅ Return branch in response
    res.json({
      empId: emp.Employeeid,
      name: emp.Employeename,
      designation: emp.Designation,
      DOJ: emp.DOJ,
      DOE: emp.DOE,
      code: emp.code,
      mobile: emp.Mobileno,
      email: emp.Email,
      branch: emp.Branch || "",  // ✅ NEW — Include branch
      status: emp.IsActive ? "Active" : "Inactive",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ═══════════════════════════════════════════════════════════
   FILES
═══════════════════════════════════════════════════════════ */

app.post("/api/files/upload", requireAuth, upload.single("file"), async (req, res) => {
  console.log("Upload file API called.");
  const generatedfilename =
    Date.now() + "_" + Math.round(Math.random() * 1000000) + path.extname(req.file.originalname);

  try {
    const pdfPath = req.file.path;
    const pdfBytes = fs.readFileSync(pdfPath);

    // ✅ Mark all previous files as not latest
    await EmployeeFiles.updateMany(
      { Empid: req.body.employeeId },
      { $set: { Islatest: false } }
    );

    // ✅ Always insert new record — never replace
    const employeeFile = new EmployeeFiles({
      Empid: req.body.employeeId,
      ActualfileName: req.file.originalname,
      FileName: generatedfilename,
      filepath: req.file.path,
      ContentType: req.file.mimetype,
      Data: pdfBytes,
      CreatedUserId: req.Userid,
      CreatedDatetime: new Date(),
      Islatest: true,
    });

    await employeeFile.save();

    fs.unlinkSync(pdfPath);

    res.status(200).json({ message: "File uploaded successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/viewpdf/list/:id", requireAuth, async (req, res) => {
  try {
    const files = await EmployeeFiles.find(
      { Empid: req.params.id },
      { Data: 0 }
    ).sort({ CreatedDatetime: -1 });

    if (!files.length) return res.status(404).json({ message: "No files found" });

    const mapped = files.map(f => ({
      id: f._id,
      ActualfileName: f.ActualfileName,
      FileName: f.FileName,
      ContentType: f.ContentType,
      CreatedDatetime: f.CreatedDatetime,
      Islatest: f.Islatest,
    }));

    res.json(mapped);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});

// ⚠️ Still public: the View button opens this URL in a new browser tab (window.open), which cannot send the token
app.get("/api/viewpdf/:id", async (req, res) => {
  try {
    let file;

    const isMongoId = req.params.id.match(/^[a-f\d]{24}$/i);

    if (isMongoId) {
      file = await EmployeeFiles.findById(req.params.id);
    } else {
      file = await EmployeeFiles.findOne(
        { Empid: req.params.id, Islatest: true }
      );
    }

    if (!file) return res.status(404).json({ message: "File not found" });

    res.setHeader("Content-Type", file.ContentType || "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${file.ActualfileName || file.FileName || "document.pdf"}"`);

    const data = file.Data?.buffer
      ? Buffer.from(file.Data.buffer)
      : file.Data;

    res.send(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/files/download/:id", requireAuth, async (req, res) => {
  try {
    let file;

    const isMongoId = req.params.id.match(/^[a-f\d]{24}$/i);

    if (isMongoId) {
      file = await EmployeeFiles.findById(req.params.id);
    } else {
      file = await EmployeeFiles.findOne(
        { Empid: req.params.id, Islatest: true }
      );
    }

    if (!file) return res.status(404).json({ message: "File not found" });

    res.set({
      "Content-Type": file.ContentType,
      "Content-Disposition": `attachment; filename="${file.ActualfileName || file.FileName}"`,
    });

    const data = file.Data?.buffer
      ? Buffer.from(file.Data.buffer)
      : file.Data;

    res.end(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});

app.delete("/api/files/delete/:id", requireAuth, async (req, res) => {
  try {
    const isMongoId = req.params.id.match(/^[a-f\d]{24}$/i);
    if (!isMongoId) return res.status(400).json({ message: "Invalid file ID" });

    const deleted = await EmployeeFiles.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "File not found" });

    if (deleted.Islatest) {
      const next = await EmployeeFiles.findOne(
        { Empid: deleted.Empid },
        null,
        { sort: { CreatedDatetime: -1 } }
      );
      if (next) {
        await EmployeeFiles.findByIdAndUpdate(next._id, { $set: { Islatest: true } });
      }
    }

    res.json({ message: "File deleted successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});

/* ═══════════════════════════════════════════════════════════
   START SERVER
═══════════════════════════════════════════════════════════ */
app.listen(process.env.PORT, () => {
  console.log("Server Running on port", process.env.PORT);
});