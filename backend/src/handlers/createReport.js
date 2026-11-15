import { validateReportInput } from '../utils/validator.js';
import { generateReportId } from '../utils/idGenerator.js';
import { saveReport } from '../services/dynamoService.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Lambda handler for POST /reports
 */
export const handler = async (event) => {
  try {
    let payload = {};
    if (event.body) {
      payload = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    } else {
      return errorResponse(400, 'Request body is required');
    }

    const { valid, errors, sanitized } = validateReportInput(payload);
    if (!valid) {
      return errorResponse(400, 'Validation failed', errors);
    }

    const reportId = generateReportId();
    const newReport = {
      reportId,
      ...sanitized,
      status: 'Submitted',
      createdAt: new Date().toISOString()
    };

    const saved = await saveReport(newReport);

    return successResponse(201, saved, `Civic issue report created with ID: ${reportId}`);
  } catch (err) {
    console.error('Error in createReport handler:', err);
    return errorResponse(500, 'Internal Server Error while saving report', [err.message]);
  }
};
