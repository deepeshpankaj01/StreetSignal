import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';

process.env.USE_MOCK_DB = 'true';
process.env.USE_MOCK_S3 = 'true';
process.env.NODE_ENV = 'test';

import { handler as createReportHandler } from '../src/handlers/createReport.js';
import { handler as getReportsHandler } from '../src/handlers/getReports.js';
import { handler as getReportByIdHandler } from '../src/handlers/getReportById.js';
import { handler as getAnalyticsHandler } from '../src/handlers/getAnalytics.js';
import { handler as getPresignedUrlHandler } from '../src/handlers/getPresignedUrl.js';

describe('Lambda Handlers End-to-End', () => {
  let createdReportId = null;

  test('POST /reports - should successfully create a new civic report', async () => {
    const event = {
      body: JSON.stringify({
        category: 'Water Leakage',
        locality: 'Brigade Road Junction',
        description: 'Main fresh water pipe burst overflowing onto street.',
        reporterName: 'Sunita Rao'
      })
    };

    const res = await createReportHandler(event);
    assert.equal(res.statusCode, 201);
    
    const body = JSON.parse(res.body);
    assert.equal(body.success, true);
    assert.ok(body.data.reportId);
    assert.match(body.data.reportId, /^SIG-[0-9]{6}$/);
    assert.equal(body.data.category, 'Water Leakage');
    assert.equal(body.data.status, 'Submitted');
    
    createdReportId = body.data.reportId;
  });

  test('POST /reports - should reject invalid category', async () => {
    const event = {
      body: JSON.stringify({
        category: 'FakeCategory',
        locality: 'Brigade Road',
        description: 'Testing validation error'
      })
    };

    const res = await createReportHandler(event);
    assert.equal(res.statusCode, 400);
    const body = JSON.parse(res.body);
    assert.equal(body.success, false);
    assert.ok(body.errors.length > 0);
  });

  test('GET /reports - should list reports including newly created one', async () => {
    const event = {
      queryStringParameters: {}
    };

    const res = await getReportsHandler(event);
    assert.equal(res.statusCode, 200);
    
    const body = JSON.parse(res.body);
    assert.equal(body.success, true);
    assert.ok(body.data.reports.length > 0);
    assert.equal(body.data.count, body.data.reports.length);
  });

  test('GET /reports/{id} - should retrieve created report by ID', async () => {
    const event = {
      pathParameters: {
        id: createdReportId
      }
    };

    const res = await getReportByIdHandler(event);
    assert.equal(res.statusCode, 200);
    
    const body = JSON.parse(res.body);
    assert.equal(body.success, true);
    assert.equal(body.data.reportId, createdReportId);
    assert.equal(body.data.locality, 'Brigade Road Junction');
  });

  test('GET /reports/{id} - should return 404 for non-existent report ID', async () => {
    const event = {
      pathParameters: {
        id: 'SIG-999999'
      }
    };

    const res = await getReportByIdHandler(event);
    assert.equal(res.statusCode, 404);
    const body = JSON.parse(res.body);
    assert.equal(body.success, false);
  });

  test('GET /analytics - should return aggregated counts and distribution', async () => {
    const event = {};
    const res = await getAnalyticsHandler(event);
    assert.equal(res.statusCode, 200);

    const body = JSON.parse(res.body);
    assert.equal(body.success, true);
    assert.ok(body.data.totalReports >= 1);
    assert.ok(body.data.categoryCounts);
    assert.ok(body.data.statusCounts);
    assert.ok(Array.isArray(body.data.topLocalities));
  });

  test('POST /uploads/presign - should generate signed upload URL for valid image', async () => {
    const event = {
      body: JSON.stringify({
        fileName: 'broken-pipe.jpg',
        contentType: 'image/jpeg',
        fileSize: 1024 * 200
      })
    };

    const res = await getPresignedUrlHandler(event);
    assert.equal(res.statusCode, 200);

    const body = JSON.parse(res.body);
    assert.equal(body.success, true);
    assert.ok(body.data.uploadUrl);
    assert.ok(body.data.fileKey);
    assert.ok(body.data.publicUrl);
  });
});
