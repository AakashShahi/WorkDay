//imports
require("dotenv").config()
const express = require('express')
const connectDB = require("./config/db")
const userRouter = require("./routes/userRoutes")
const adminUserRoutes = require("./routes/admin/adminUserRoute")
const adminProfessionRoutes = require("./routes/admin/adminProfessionRoute")
const customerJobRouter = require("./routes/customer/customerJobRoute")
const workerJobRouter = require("./routes/worker/workerJobRoute")
const workerProfileRouter = require("./routes/worker/workerProfileRoute")
const workerProfessionRouter = require("./routes/worker/workerProfessionRoute")
const workerReviewRouter = require("./routes/worker/workerReviewRoute")
const adminVerificationRouter = require("./routes/admin/adminVerifiicationRoute")
const adminReviewRouter = require("./routes/admin/adminReviewRoue")
const adminRoute = require("./routes/admin/adminRoute")
const customerProfessionRouter = require("./routes/customer/customerProfessionRoute")
const customerWorkerRouter = require("./routes/customer/customerWorkerRoute")
const chatRoutes = require("./routes/chat/chatRoute");
const customerRoute = require("./routes/customer/customerRoute")
const customerReviewRoute = require("./routes/customer/customerReviewRoute")
const adminJobRoutes = require("./routes/admin/adminJobRoute")
const customerNotificationRoute = require("./routes/customer/customerNotificationRoute")
const paymentRoutes = require("./routes/paymentRoutes")


const path = require("path")
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const inputSanitizer = require("./middlewares/inputSanitizer");

//Cors Setup
const cors = require("cors")
const app = express();

// Security Middleware: Helmet
app.use(
    helmet({
        crossOriginEmbedderPolicy: false, // Allow external resources like Google Fonts/Images
        crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow frontend to fetch images
    })
);

app.use(
    helmet.contentSecurityPolicy({
        useDefaults: true,
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", process.env.CLIENT_URL, "https://khalti.com", "https://*.khalti.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            imgSrc: ["'self'", "data:", "blob:", "https://*.googleusercontent.com", "https://*.facebook.com", "https://platform-lookaside.fbsbx.com", "https://khalti.com", "https://*.khalti.com"], // Allow social login profile pics
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            connectSrc: ["'self'", process.env.CLIENT_URL, "https://www.googleapis.com", "https://graph.facebook.com", "https://khalti.com", "https://*.khalti.com"], // Allow OAuth and Khalti calls
            frameSrc: ["'self'", "https://www.google.com", "https://khalti.com", "https://*.khalti.com"], // Allow reCAPTCHA and Khalti
            objectSrc: ["'none'"],
            upgradeInsecureRequests: [],
        },
    })
);

// Extra Security Headers
app.use(helmet.referrerPolicy({ policy: "no-referrer" }));
app.use(helmet.frameguard({ action: "deny" })); // Prevent Clickjacking

// Cors Setup
let corsOptions = {
    origin: process.env.CLIENT_URL || "https://localhost:5173", // Strict Whitelist
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}
app.use(cors(corsOptions))

//Connect Db part
connectDB()

//Accept Json in request
app.use(express.json())

// Global Input Sanitization (XSS Protection)
app.use(inputSanitizer);


// Secure Asset Serving (Hides Directory Structure)
app.get("/api/media/:filename", (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, "uploads", filename);

    // Prevent Path Traversal
    if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
        // Generic Error for Security
        return res.status(400).json({ success: false, message: "Bad Request" });
    }

    res.sendFile(filePath, (err) => {
        if (err) {
            console.error("File download error:", err);
            // Generic Error for Security (Don't reveal if file exists or not)
            res.status(400).json({ success: false, message: "Bad Request" });
        }
    });
});

// BLOCK direct access to /uploads/ and return 400 Bad Request
app.use("/uploads", (req, res) => {
    res.status(400).json({ success: false, message: "Bad Request" });
});
// app.use("/uploads", express.static(path.join(__dirname, "uploads"))) // DISABLED: Direct static access

// Rate Limiter for Auth Routes
// Rate Limiter for Auth Routes: Protects against brute-force and credential stuffing
// by limiting the number of requests from a single IP to 10 every 15 minutes.
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per windowMs
    message: { success: false, message: "Too many login/registration attempts, please try again after 15 minutes" },
    standardHeaders: true,
    legacyHeaders: false,
});

//User rgistration/login Route
app.use("/api/auth", authLimiter, userRouter)

//Admin Management
app.use("/api/admin/users", adminUserRoutes)
app.use("/api/admin/profession", adminProfessionRoutes)
app.use("/api/admin/verification", adminVerificationRouter)
app.use("/api/admin/review", adminReviewRouter)
app.use("/api/admin/profile", adminRoute)
app.use("/api/admin/job", adminJobRoutes)

//Worker CRUD route
app.use("/api/worker", workerJobRouter)
app.use("/api/worker/profile", workerProfileRouter)
app.use("/api/worker/profession", workerProfessionRouter)
app.use("/api/worker/reviews", workerReviewRouter)


//Customer CRUD route
app.use("/api/customer", customerJobRouter)
app.use("/api/customer/profession", customerProfessionRouter)
app.use("/api/customer/worker", customerWorkerRouter)
app.use("/api/customer", customerRoute)
app.use("/api/customer/review", customerReviewRoute)
app.use("/api/customer/notifications", customerNotificationRoute)


//chat
app.use("/api/chat", chatRoutes);

// payment
app.use("/api/payment", paymentRoutes);


module.exports = app