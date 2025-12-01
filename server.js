const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();

// ✅ CORS: frontend origin ko allow karo
const corsOptions = {
  origin: "http://localhost:5176", // Vite ka URL
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
};

app.use(cors(corsOptions));
// sirf contact route ke liye preflight
app.options("/api/contact", cors(corsOptions));

app.use(express.json());

// 🔹 Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT) || 465,
  secure: process.env.MAIL_SECURE === "true",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP error:", error);
  } else {
    console.log("SMTP ready to send mails");
  }
});

// 🔹 Test route
app.get("/api/ping", (req, res) => {
  res.json({ ok: true, message: "Backend is reachable" });
});

// 🔹 Contact API route
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      return res
        .status(400)
        .json({ success: false, message: "Name, email, message required" });
    }

    await transporter.sendMail({
      from: `"ForexAlgoPlus Website" <${process.env.MAIL_USER}>`,
      to: process.env.MAIL_TO,
      subject: subject || "New enquiry from ForexAlgoPlus",
      text: `
New enquiry from contact form:

Name: ${name}
Email: ${email}
Phone: ${phone || "N/A"}
Subject: ${subject || "N/A"}

Message:
${message}
      `,
    });

    return res.json({ success: true, message: "Email sent successfully" });
  } catch (err) {
    console.error("Send mail error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Error sending email" });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log("Backend server running on port", PORT);
});
