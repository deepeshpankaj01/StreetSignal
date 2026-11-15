import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { handler as createReportHandler } from './handlers/createReport.js';
import { handler as getReportsHandler } from './handlers/getReports.js';
import { handler as getReportByIdHandler } from './handlers/getReportById.js';
import { handler as getAnalyticsHandler } from './handlers/getAnalytics.js';
import { handler as getPresignedUrlHandler } from './handlers/getPresignedUrl.js';
import { handler as updateReportStatusHandler } from './handlers/updateReportStatus.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.raw({ type: ['image/*', 'application/octet-stream'], limit: '10mb' }));

// Helper to convert Express req/res to/from AWS Lambda Event/Response
const adaptLambdaHandler = (lambdaHandler) => async (req, res) => {
  try {
    const event = {
      body: JSON.stringify(req.body),
      queryStringParameters: req.query || {},
      pathParameters: req.params || {},
      headers: req.headers || {},
      requestContext: {
        http: {
          method: req.method,
          path: req.path
        }
      }
    };

    const response = await lambdaHandler(event);
    
    // Set headers
    if (response.headers) {
      for (const [key, val] of Object.entries(response.headers)) {
        res.setHeader(key, val);
      }
    }

    res.status(response.statusCode).send(response.body);
  } catch (error) {
    console.error('Local server error:', error);
    res.status(500).json({
      success: false,
      message: 'Local server execution failure',
      error: error.message
    });
  }
};

// Healthcheck & metadata
app.get('/', (req, res) => {
  res.json({
    service: 'StreetSignal API Gateway Mock / Local Server',
    status: 'ONLINE',
    version: '1.0.0',
    endpoints: [
      'POST /reports',
      'GET /reports',
      'GET /reports/:id',
      'GET /analytics',
      'POST /uploads/presign',
      'PATCH /reports/:id/status'
    ]
  });
});

// Mock S3 upload endpoint for local testing when AWS S3 is not active
app.put(['/uploads/mock-upload', '/api/uploads/mock-upload'], (req, res) => {
  console.log(`[Mock S3] Received mock image upload for key: ${req.query.key || 'unknown'}`);
  res.status(200).send();
});

// Map routes (both with and without /api prefix for flexibility)
const routes = [
  { method: 'post', path: '/reports', handler: createReportHandler },
  { method: 'get', path: '/reports', handler: getReportsHandler },
  { method: 'get', path: '/reports/:id', handler: getReportByIdHandler },
  { method: 'get', path: '/analytics', handler: getAnalyticsHandler },
  { method: 'post', path: '/uploads/presign', handler: getPresignedUrlHandler },
  { method: 'patch', path: '/reports/:id/status', handler: updateReportStatusHandler },
];

routes.forEach(({ method, path, handler }) => {
  // direct route
  app[method](path, adaptLambdaHandler(handler));
  // /api prefixed route
  app[method](`/api${path}`, adaptLambdaHandler(handler));
});

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 StreetSignal Local Server running on port ${PORT}`);
  console.log(`   Health Check: http://localhost:${PORT}/`);
  console.log(`   API Base URL: http://localhost:${PORT}/api/reports`);
  console.log(`   Analytics:    http://localhost:${PORT}/api/analytics`);
  console.log(`======================================================\n`);
});
