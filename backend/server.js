require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const helmet = require("helmet");
const cors = require("cors");
const path = require("path");

const app = express();

if (!process.env.MONGO_URI) {
  throw new Error("❌ MONGO_URI is not defined in environment variables.");
}
if (!process.env.SESSION_SECRET) {
  throw new Error("❌ SESSION_SECRET is not defined in environment variables.");
}

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 2, // 2 hours
    },
  })
);

app.use(express.static(path.join(__dirname, "../frontend")));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/materials", require("./routes/materials"));
app.use("/api/students", require("./routes/students"));
app.use("/api/announcements", require("./routes/announcements"));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
