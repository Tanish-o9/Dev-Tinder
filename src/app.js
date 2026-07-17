const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const http = require("http");
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const connectDB = require("./config/database");
const { attachSocket } = require("./socket");

require("./utils/cronjob");

const app = express();
const server = http.createServer(app);

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin(origin, cb) {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error("Origin not allowed by CORS"));
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// ── Routes ───────────────────────────────────────────────────────────────────
app.use("/", require("./routes/auth"));
app.use("/profile", require("./routes/profile"));
app.use("/", require("./routes/request"));
app.use("/", require("./routes/user"));
app.use("/chat", require("./routes/chat"));
app.use("/", require("./routes/project"));
app.use("/", require("./routes/notification"));

// ── Socket.IO ────────────────────────────────────────────────────────────────
attachSocket(server, allowedOrigins);

// ── Start ────────────────────────────────────────────────────────────────────
connectDB()
  .then(() => {
    console.log("Database connection established....");
    server.listen(process.env.PORT, () =>
      console.log(`Server started listening on port ${process.env.PORT}....`)
    );
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);
  });
