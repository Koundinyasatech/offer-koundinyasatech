const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
require("dotenv").config();

const EmployeeData  = require("./models/EmployeeData");
const Users         = require("./models/Users");
const EmployeeFiles = require("./models/EmployeeFiles");
const path          = require("path");
const Designation   = require("./models/Designation");

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
  filename:    function (req, file, cb) { cb(null, Date.now() + "-" + file.originalname); },
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
    console.log("Login API Hit", req.body);
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

    const userPayload = {
      Userid:      user.Userid      || user.Employeeid,
      Employeeid:  user.Employeeid  || user.Userid,
      name:        user.name        || user.Employeename || user.UserName || "",
      role,
      designation: user.designation || user.Designation || "",
      IsActive:    user.IsActive ?? false,
    };

    res.status(200).json({
      message: "Login Successful",
      token:   `${role}-${userPayload.Userid}`,
      user:    userPayload,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
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
app.get("/api/users", async (req, res) => {
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
app.get("/api/employees", async (req, res) => {


  try {
    console.log("📋 Employees API Called");
    const data = await EmployeeData.find({
      Employeeid: { $exists: true, $ne: null, $ne: "" },
    });

    const mapped = data.map((emp) => ({
      empId:       emp.Employeeid,
      name:        emp.Employeename,
      designation: emp.Designation,
      code:        emp.code,
      mobile:      emp.Mobileno,
      email:       emp.Email,
      DOJ:         emp.DOJ,
      DOE:         emp.DOE,
      status:      emp.IsActive ? "Active" : "Inactive",
    }));

    res.json(mapped);
  } catch (err) {
    console.log("❌ ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ── Generate code — MUST be before /:id ── */
app.get("/api/employees/generate-code", async (req, res) => {
  try {
    const generatedCode = generateCode();
    res.status(200).json({ success: true, code: generatedCode });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error generating code", error: error.message });
  }
});

/* ── Get files by employee — MUST be before /:id ── */
app.get("/api/employees/GetFiles", async (req, res) => {
  try {
    const { Empid } = req.query;
    if (!Empid) return res.status(400).json({ message: "Empid is required" });

    const data = await EmployeeFiles.find({ Empid });

    const mapped = data.map((emp) => ({
      Id:              emp.Id,
      Empid:           emp.Empid,
      ActualfileName:  emp.ActualfileName,
      FileName:        emp.FileName,
      CreatedDatetime: emp.CreatedDatetime,
      Islatest:        emp.Islatest,
    }));

    res.json(mapped);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ── Add employee ── */
app.post("/api/employees/add", async (req, res) => {

  try {
    const { empId, name, designation, mobile, email, DOJ, DOE, code, isActive } = req.body;

    console.log("DOJ:", DOJ, "| DOE:", DOE);

    if (!empId || !name || !designation || !mobile || !email || !DOJ || !DOE || !code) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await EmployeeData.findOne({ Employeeid: Number(empId) });
    if (existing) {
      return res.status(409).json({ message: "Employee ID already exists" });
    }

    const employee = new EmployeeData({
      Employeeid:      Number(empId),
      Employeename:    name,
      Designation:     designation,
      Mobileno:        mobile,
      Email:           email,
      code:            code,
      DOJ:             DOJ,
      DOE:             DOE,
      Createduserid:   200000,
      Createddatetime: new Date().toISOString(),
      IsActive:        isActive !== false,
    });

    await employee.save();
    res.status(200).json({ message: "Employee Saved Successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ── Update employee ── */
app.put("/api/employees/update/:id", async (req, res) => {
  try {
    const { name, designation, mobile, email, code, isActive, DOJ, DOE } = req.body;



    const updated = await EmployeeData.findOneAndUpdate(
      { Employeeid: Number(req.params.id) },
      {
        $set: {
          Employeename: name,
          Designation:  designation,
          Mobileno:     mobile,
          Email:        email,
          code:         code,
          IsActive:     isActive,
          DOJ:          DOJ,
          DOE:          DOE,
        },
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Employee not found" });
    res.json({ message: "Employee updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ── Get single employee by ID — LAST so it doesn't swallow other routes ── */
app.get("/api/employees/:id", async (req, res) => {
  try {
    const emp = await EmployeeData.findOne({ Employeeid: Number(req.params.id) });
    if (!emp) return res.status(404).json({ message: "Employee not found" });

    res.json({
      empId:       emp.Employeeid,
      name:        emp.Employeename,
      designation: emp.Designation,
      DOJ:         emp.DOJ,
      DOE:         emp.DOE,
      code:        emp.code,
      mobile:      emp.Mobileno,
      email:       emp.Email,
      status:      emp.IsActive ? "Active" : "Inactive",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ═══════════════════════════════════════════════════════════
   FILES
═══════════════════════════════════════════════════════════ */

/* ── Upload file ── */
// app.post("/api/files/upload", upload.single("file"), async (req, res) => {
//   console.log("Upload file API called.");
//   const generatedfilename =
//     Date.now() + "_" + Math.round(Math.random() * 1000000) + path.extname(req.file.originalname);

//   try {
//     const pdfPath  = req.file.path;
//     const pdfBytes = fs.readFileSync(pdfPath);

//     const employeeFile = new EmployeeFiles({
//       Empid:           req.body.employeeId,
//       ActualfileName:  req.file.originalname,
//       FileName:        generatedfilename,
//       filepath:        req.file.path,
//       ContentType:     req.file.mimetype,
//       Data:            pdfBytes,
//       CreatedUserId:   req.Userid,
//       CreatedDatetime: new Date(),
//       Islatest:        true,
//     });

//     await employeeFile.save();
//     res.status(200).json({ message: "Data Saved Successfully" });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ message: err.message });
//   }
// });



app.post("/api/files/upload", upload.single("file"), async (req, res) => {
  console.log("Upload file API called.");
  const generatedfilename =
    Date.now() + "_" + Math.round(Math.random() * 1000000) + path.extname(req.file.originalname);

  try {
    const pdfPath  = req.file.path;
    const pdfBytes = fs.readFileSync(pdfPath);

    await EmployeeFiles.findOneAndUpdate(
      { Empid: req.body.employeeId },           // find by employee ID
      {
        $set: {
          ActualfileName:  req.file.originalname,
          FileName:        generatedfilename,
          filepath:        req.file.path,
          ContentType:     req.file.mimetype,
          Data:            pdfBytes,
          CreatedDatetime: new Date(),
          Islatest:        true,
        }
      },
      { upsert: true, new: true }               // create if not exists, replace if exists
    );

    fs.unlinkSync(pdfPath);                     // clean up temp file

    res.status(200).json({ message: "File saved successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});

/* ── View PDF inline ── */
app.get("/api/viewpdf/:id", async (req, res) => {
  try {
    const file = await EmployeeFiles.findOne({ Empid: req.params.id });
    if (!file) return res.status(404).json({ message: "File not found" });

    res.setHeader("Content-Type", file.ContentType || "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${file.FileName || "document.pdf"}"`);

    const data = file.Data?.buffer
      ? Buffer.from(file.Data.buffer)
      : file.Data;

    res.send(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});

/* ── Download file ── */
app.get("/api/files/download/:id", async (req, res) => {
  try {
    const file = await EmployeeFiles.findOne({ Empid: req.params.id });
    if (!file) return res.status(404).json({ message: "File not found" });

    res.set({
      "Content-Type":        file.ContentType,
      "Content-Disposition": `attachment; filename="${file.FileName}"`,
    });

    res.end(file.Data);
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