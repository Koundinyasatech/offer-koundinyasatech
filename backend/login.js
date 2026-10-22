const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
require("dotenv").config();

const EmployeeData = require("./models/EmployeeData");
const Users = require("./models/Users");
const EmployeeFiles = require("./models/EmployeeFiles");
const path = require("path");
const Designation = require("./models/Designation");

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
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

/* ── JWT config ── */
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
if (!JWT_SECRET) {
  console.error("❌ JWT_SECRET is missing in .env — server cannot start");
  process.exit(1);
}

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

/* ── Shape of the user object sent to the client (login + /auth/me) ── */
const buildUserPayload = (user, role) => ({
  Userid: user.Userid || user.Employeeid,
  Employeeid: user.Employeeid || user.Userid,
  name: user.name || user.Employeename || user.UserName || "",
  role,
  designation: user.designation || user.Designation || "",
  branch: user.branch || user.Branch || "",
  IsActive: user.IsActive ?? false,
});

/* ── CTC parser: optional field. Empty → null, otherwise a non-negative number ── */
const parseCtc = (value) => {
  if (value === undefined || value === null || String(value).trim() === "") {
    return { ok: true, value: null };
  }
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return { ok: false };
  return { ok: true, value: n };
};

/* ═══════════════════════════════════════════════════════════
   AUTH MIDDLEWARE
   Token carries { sub, role, tv }. "tv" is the account's
   tokenVersion at login time. Logout-all bumps tokenVersion in
   the DB, so every older token fails the check below.
═══════════════════════════════════════════════════════════ */
const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ message: "Authentication required", code: "NO_TOKEN" });
    }

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch {
      return res.status(401).json({ message: "Invalid or expired token", code: "INVALID_TOKEN" });
    }

    const account =
      payload.role === "admin"
        ? await Users.findOne({ Userid: payload.sub })
        : await EmployeeData.findOne({ Employeeid: payload.sub });

    if (!account) {
      return res.status(401).json({ message: "Account not found", code: "INVALID_TOKEN" });
    }

    if ((account.tokenVersion || 0) !== payload.tv) {
      return res.status(401).json({
        message: "Session expired. Please log in again.",
        code: "SESSION_REVOKED",
      });
    }

    if (payload.role === "employee" && account.IsActive !== true) {
      return res.status(403).json({ message: "Account is inactive", code: "INACTIVE" });
    }

    req.auth = { userId: payload.sub, role: payload.role };
    req.account = account;
    next();
  } catch (err) {
    console.log("Auth middleware error:", err);
    res.status(500).json({ message: "Authentication failed" });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.auth?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

/* Protect every /api route except login */
app.use("/api", (req, res, next) => {
  if (req.path === "/auth/login") return next();
  return authenticate(req, res, next);
});

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

    const userPayload = buildUserPayload(user, role);

    // ✅ Signed token bound to the account's current tokenVersion
    const token = jwt.sign(
      { sub: String(userPayload.Userid), role, tv: user.tokenVersion || 0 },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

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

/* ── Logout from ALL devices (invalidates every token issued so far) ── */
app.post("/api/auth/logout-all", async (req, res) => {
  try {
    const { userId, role } = req.auth;

    const result =
      role === "admin"
        ? await Users.updateOne({ Userid: userId }, { $inc: { tokenVersion: 1 } })
        : await EmployeeData.updateOne({ Employeeid: userId }, { $inc: { tokenVersion: 1 } });

    if (!result.matchedCount) {
      return res.status(404).json({ message: "Account not found" });
    }

    console.log(`🔒 Logged out all devices for ${role} ${userId}`);
    res.json({ message: "Logged out from all devices" });
  } catch (err) {
    console.log("❌ Logout-all error:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ── Logout this device ──
   Tokens are stateless, so the client simply discards its token. (Use
   logout-all to invalidate every issued token on the server.) */
app.post("/api/auth/logout", (req, res) => {
  res.json({ message: "Logged out" });
});

/* ── Current session check — authenticate() already rejects revoked tokens with 401 ── */
app.get("/api/auth/me", (req, res) => {
  res.json({ user: buildUserPayload(req.account, req.auth.role) });
});

/* ═══════════════════════════════════════════════════════════
   DESIGNATION
═══════════════════════════════════════════════════════════ */
app.get("/api/Designation", async (req, res) => {
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
app.get("/api/users", requireAdmin, async (req, res) => {
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
app.get("/api/employees", requireAdmin, async (req, res) => {
  try {
    console.log("📋 Employees API Called");
    const data = await EmployeeData.find({
      Employeeid: { $exists: true, $ne: null, $ne: "" },
    });

    const mapped = data.map((emp) => ({
      empId: emp.Employeeid,
      name: emp.Employeename,
      designation: emp.Designation,
      code: emp.code,
      mobile: emp.Mobileno,
      email: emp.Email,
      branch: emp.Branch || "",
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

app.get("/api/employees/generate-code", requireAdmin, async (req, res) => {
  try {
    const generatedCode = generateCode();
    res.status(200).json({ success: true, code: generatedCode });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error generating code", error: error.message });
  }
});

/* ── CTC visibility: protected by a separate CTC password (CTC_PASSWORD in .env) ──
   CTC is never included in the normal employee responses; it is only
   returned here after the password is verified server-side. */
const CTC_PASSWORD = process.env.CTC_PASSWORD;
if (!CTC_PASSWORD) {
  console.warn("⚠️  CTC_PASSWORD is not set in .env — CTC cannot be unlocked until it is");
}
const sha256 = (v) => crypto.createHash("sha256").update(String(v)).digest();
const ctcPasswordMatches = (input) =>
  Boolean(CTC_PASSWORD) && crypto.timingSafeEqual(sha256(input), sha256(CTC_PASSWORD));

const ctcAttempts = new Map(); // userId -> { count, lockedUntil }
const CTC_MAX_ATTEMPTS = 5;
const CTC_LOCK_MS = 5 * 60 * 1000;

app.post("/api/employees/ctc", requireAdmin, async (req, res) => {
  try {
    const { password } = req.body;
    if (!CTC_PASSWORD) {
      return res.status(503).json({ message: "CTC password is not configured on the server" });
    }
    if (!password) return res.status(400).json({ message: "Password is required" });

    const key = String(req.auth.userId);
    const state = ctcAttempts.get(key) || { count: 0, lockedUntil: 0 };

    if (state.lockedUntil > Date.now()) {
      const mins = Math.ceil((state.lockedUntil - Date.now()) / 60000);
      return res.status(429).json({ message: `Too many attempts. Try again in ${mins} min.` });
    }

    if (!ctcPasswordMatches(password)) {
      state.count += 1;
      if (state.count >= CTC_MAX_ATTEMPTS) {
        state.count = 0;
        state.lockedUntil = Date.now() + CTC_LOCK_MS;
      }
      ctcAttempts.set(key, state);
      // 403 (not 401) so a wrong password never looks like an expired session
      return res.status(403).json({ message: "Incorrect password", code: "WRONG_PASSWORD" });
    }

    ctcAttempts.delete(key);

    const rows = await EmployeeData.find(
      { Employeeid: { $exists: true, $ne: null } },
      { Employeeid: 1, CTC: 1 }
    );
    const ctc = {};
    rows.forEach((r) => { ctc[r.Employeeid] = r.CTC ?? null; });

    res.json({ ctc });
  } catch (err) {
    console.log("❌ CTC unlock error:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ── Get files by employee — MUST be before /:id ── */
app.get("/api/employees/GetFiles", async (req, res) => {
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
app.post("/api/employees/add", requireAdmin, async (req, res) => {
  try {
    const { empId, name, designation, mobile, email, DOJ, DOE, code, branch, ctc, isActive } = req.body;

    console.log("📝 Adding Employee | Branch:", branch);

    if (!empId || !name || !designation || !mobile || !email || !DOJ || !DOE || !code || !branch) {
      return res.status(400).json({
        message: "All fields are required (including branch)"
      });
    }

    const validBranches = ["Hyderabad", "Bangalore"];
    if (!validBranches.includes(branch)) {
      return res.status(400).json({
        message: `Branch must be either "Hyderabad" or "Bangalore"`
      });
    }

    // CTC is optional — validate only when provided
    const ctcResult = parseCtc(ctc);
    if (!ctcResult.ok) {
      return res.status(400).json({ message: "CTC must be a non-negative number" });
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
      Branch: branch,
      CTC: ctcResult.value,
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
app.put("/api/employees/update/:id", requireAdmin, async (req, res) => {
  try {
    const { name, designation, mobile, email, code, branch, ctc, isActive, DOJ, DOE, status } = req.body;

    console.log("✏️ Updating Employee | Branch:", branch);

    if (branch) {
      const validBranches = ["Hyderabad", "Bangalore"];
      if (!validBranches.includes(branch)) {
        return res.status(400).json({
          message: `Branch must be either "Hyderabad" or "Bangalore"`
        });
      }
    }

    // CTC is optional — validate only when the client sends it
    const ctcResult = parseCtc(ctc);
    if (ctc !== undefined && !ctcResult.ok) {
      return res.status(400).json({ message: "CTC must be a non-negative number" });
    }

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

    if (branch) {
      updateData.Branch = branch;
    }

    if (ctc !== undefined) {
      updateData.CTC = ctcResult.value;
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
app.get("/api/employees/:id", async (req, res) => {
  try {
    // Employees may only read their own record
    if (req.auth.role !== "admin" && String(req.auth.userId) !== String(req.params.id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const emp = await EmployeeData.findOne({ Employeeid: Number(req.params.id) });
    if (!emp) return res.status(404).json({ message: "Employee not found" });

    res.json({
      empId: emp.Employeeid,
      name: emp.Employeename,
      designation: emp.Designation,
      DOJ: emp.DOJ,
      DOE: emp.DOE,
      code: emp.code,
      mobile: emp.Mobileno,
      email: emp.Email,
      branch: emp.Branch || "",
      status: emp.IsActive ? "Active" : "Inactive",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ═══════════════════════════════════════════════════════════
   FILES
═══════════════════════════════════════════════════════════ */

app.post("/api/files/upload", requireAdmin, upload.single("file"), async (req, res) => {
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
      CreatedUserId: req.auth.userId,
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

app.get("/api/viewpdf/list/:id", async (req, res) => {
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

app.get("/api/files/download/:id", async (req, res) => {
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

app.delete("/api/files/delete/:id", requireAdmin, async (req, res) => {
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