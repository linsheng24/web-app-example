const express = require('express');
const client = require('prom-client'); // Prometheus 客戶端

const app = express();
const port = 3000;

// 初始化 Prometheus 指標
const register = new client.Registry();
client.collectDefaultMetrics({ register }); // 收集預設指標

// 自定義指標範例
const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
});
register.registerMetric(httpRequestCounter);

// 基本路由
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// 中間件：記錄每個請求的指標
app.use((req, res, next) => {
  res.on('finish', () => {
    httpRequestCounter.labels(req.method, req.path, res.statusCode).inc();
  });
  next();
});

// 啟動伺服器
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
  console.log(`Prometheus metrics available at http://localhost:${port}/metrics`);
});