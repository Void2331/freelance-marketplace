const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");
const jobRoutes = require("./src/routes/jobRoutes");
const proposalRoutes = require("./src/routes/proposalRoutes");
const milestoneRoutes = require("./src/routes/milestoneRoute");
const projectRoutes = require("./src/routes/projectRoutes");
const paymentRoutes =  require("./src/routes/paymentRoutes");
const walletRoutes =  require("./src/routes/walletRoutes");
const withdrawalRoutes = require("./src/routes/withdrawalRoutes");
const paymentWebhookRoutes = require(  "./src/routes/paymentWebhookRoutes");
const workroomRoutes = require("./src/routes/workroomRoutes");
const reviewRoutes = require("./src/routes/reviewRoutes");
const messageRoutes = require("./src/routes/messageRoutes");
const disputeRoutes = require("./src/routes/disputeRoutes");
const notificationRoutes = require("./src/routes/notificationRoutes");
const uploadRoutes = require("./src/routes/uploadRoutes");
const aiRoutes = require("./src/routes/aiRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const contractRoutes = require("./src/routes/contractRoutes");
const walletTransactionRoutes = require("./src/routes/walletTransactionRoutes");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./src/config/swagger");


const errorHandler = require("./src/middleware/errorMiddleware");

const app = express();
// Needed on Render/Railway/Heroku so rate limiting sees the real client IP.
app.set("trust proxy", 1);

/*
|--------------------------------------------------------------------------
| Swagger / OpenAPI Documentation
|--------------------------------------------------------------------------
*/

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    explorer: true,
    customSiteTitle: "Freelance Marketplace API Docs",
  })
);

app.get("/api-docs/openapi.json", (req, res) => {
  res.json(swaggerDocument);
});

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Freelance Marketplace API is running"
  });
});

/*
  General limiter for the whole API.
  Webhooks are excluded since Paystack, not a
  browser, is the caller there.
*/
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

/*
  Stricter limiter for auth endpoints
  (login/register/forgot-password) to slow down
  brute-force / credential-stuffing attempts.
*/
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts. Please try again later.",
  },
});
app.use("/api/webhooks", paymentWebhookRoutes);

app.use("/api", apiLimiter);

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api", proposalRoutes);
app.use("/api", milestoneRoutes);
app.use("/api", projectRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/wallets", walletRoutes);
app.use("/api/wallets", withdrawalRoutes);
app.use("/api/wallets", walletTransactionRoutes);
app.use("/api/contracts", contractRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/admin", adminRoutes); 

app.use("/api", workroomRoutes);
app.use("/api",  reviewRoutes);
app.use("/api", messageRoutes);
app.use("/api", disputeRoutes);
app.use("/api", notificationRoutes);
app.use("/api", uploadRoutes);
app.use(
  "/uploads",
  express.static(
    path.join(process.cwd(), "uploads"),
  ),
);

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

app.use(errorHandler);

module.exports = app;