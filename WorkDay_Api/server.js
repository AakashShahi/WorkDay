require("dotenv").config();
const https = require("https");
const fs = require("fs");
const path = require("path");
const { Server } = require("socket.io");
const app = require("./index");

const startJobExpiryCron = require("./controllers/job/jobStatusSchedule");
const startWorkerAvailabilityCron = require("./controllers/job/startWorkerAvailabiliyCron");

// Path to certificates (root of the whole project)
const certsDir = path.join(__dirname, "..", "certs");
const options = {
    key: fs.readFileSync(path.join(certsDir, "server.key")),
    cert: fs.readFileSync(path.join(certsDir, "server.crt")),
};

// 1. Create HTTPS server from Express app
const server = https.createServer(options, app);

// 2. Initialize Socket.IO instance
const io = new Server(server, {
    cors: {
        cors: {
            origin: process.env.CLIENT_URL || "https://localhost:5173", // <--- Updated to use strict env var
            methods: ["GET", "POST"],
            credentials: true // <--- IMPORTANT: Add this to explicitly allow credentials
        },
    }
});

// 3. Attach `io` instance to Express app so it can be accessed globally (e.g., in controllers)
app.set("io", io);

// 4. Handle Socket.IO events
io.on("connection", (socket) => {
    console.log("🟢 New user connected:", socket.id);

    socket.on("joinRoom", ({ jobId }) => {
        if (jobId) {
            socket.join(jobId);
            console.log(`User joined room: ${jobId}`);
        }
    });

    socket.on("sendMessage", (message) => {
        if (message?.jobId) {
            io.to(message.jobId).emit("receiveMessage", message);
        }
    });

    socket.on("disconnect", () => {
        console.log("🔴 User disconnected:", socket.id);
    });
});

// 5. Start scheduled background tasks (cron jobs)
startJobExpiryCron();
startWorkerAvailabilityCron();

// 6. Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on https://localhost:${PORT}`);
});