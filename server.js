const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();
const PORT = process.env.PORT;

// CORS
app.use(cors());

const services = {
  "/users": process.env.USER_SERVICE_URL, // user service
  "/posts": process.env.POST_SERVICE_URL, // post service
  "/replies": process.env.REPLY_SERVICE_URL, // reply service
  "/history": process.env.HISTORY_SERVICE_URL, // history service
  "/messages": process.env.MESSAGE_SERVICE_URL, // message service (Node)
  "/auth": process.env.AUTH_SERVICE_URL, // auth service
  "/email": process.env.EMAIL_SERVICE_URL, // email service
  "/files": process.env.FILE_SERVICE_URL, // file upload service
};

// Create proxy
Object.entries(services).forEach(([route, target]) => {
  if (target) {
    app.use(route, createProxyMiddleware({
      target,
      changeOrigin: true,
      logLevel: "debug",
      pathRewrite: (path, req) => {
        const rewrittenPath = path.replace(new RegExp(`^${route}`), ""); // **去掉 /users, /posts 等前缀**
        console.log(`🔄 Proxying: ${req.method} ${path} -> ${rewrittenPath} @ ${target}`);
        return rewrittenPath;
      },
      onProxyReq: (proxyReq, req, res) => {
        console.log(`🛠️ Forwarding ${req.method} ${req.originalUrl} -> ${proxyReq.getHeader('host')}${proxyReq.path}`);
      },
      onError: (err, req, res) => {
        console.error(`❌ Proxy error for ${req.originalUrl}:`, err.message);
        res.status(500).json({ message: "Proxy error", error: err.message });
      }
    }));
    console.log(`✅ Proxy set for ${route} -> ${target}`);
  }
});

// Healthy check
app.get("/", (req, res) => {
  res.json({ message: "API Gateway is running" });
});

// Global error handling
app.use((err, req, res, next) => {
  console.error("Proxy error:", err.message);
  res.status(500).json({ message: "Internal Server Error" });
});

// app running
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
