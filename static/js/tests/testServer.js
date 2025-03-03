const express = require('express')
const cors = require('cors')
const { createProxyMiddleware } = require('http-proxy-middleware')
const app = express()

// Enable CORS for our test environment
app.use(cors())

// Add request logging middleware
const logRequest = (req, res, next) => {
  console.log(`${new Date().toISOString()} | ${req.method} ${req.originalUrl}`)
  next()
}
  
app.use('/api', logRequest)
  
// Modern proxy configuration without deprecated features
const apiProxy = createProxyMiddleware({
  target: 'http://localhost:5000',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/api'
  },
  logLevel: 'error',
  // Add onProxyReq handler to log proxy details
  onProxyReq: (proxyReq, req, res) => {
    console.log('-> Proxying request:', {
      path: req.originalUrl,
      target: proxyReq.path,
      method: proxyReq.method
    })
  },

  onProxyRes: (proxyRes, req, res) => {
    // Simple logging without modifying the response stream
    proxyRes.on('end', () => {
      console.log('<- Response completed:', {
        path: req.originalUrl,
        statusCode: proxyRes.statusCode
      })
    })
  },
  onError: (err, req, res) => {
    console.error('Proxy Error:', err)
    if (!res.headersSent) {
      res.writeHead(500, {
        'Content-Type': 'application/json'
      })
      res.end(JSON.stringify({ error: 'Proxy Error' }))
    }
  }
})

app.use('/api', apiProxy)

// Start server
const server = app.listen(5001, () => {
  console.log('Test server running on port 5001')
})

// Proper server cleanup
process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Test server stopped')
  })
})

module.exports = server
