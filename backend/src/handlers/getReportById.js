import { getReportById } from '../services/dynamoService.js';
import { isValidReportId } from '../utils/idGenerator.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Lambda handler for GET /reports/{id}
 */
export const handler = async (event) => {
  try {
    const reportId = event.pathParameters?.id || event.pathParameters?.reportId;

    if (!reportId) {
      return errorResponse(400, 'Report ID path parameter is required');
    }

    const cleanId = reportId.trim().toUpperCase();
    if (!isValidReportId(cleanId)) {
      return errorResponse(400, `Invalid report ID format "${reportId}". Must be in format SIG-XXXXXX`);
    }

    const report = await getReportById(cleanId);

    if (!report) {
      return errorResponse(404, `No civic report found with ID: ${cleanId}`);
    }

    return successResponse(200, report, 'Report retrieved successfully');
  } catch (err) {
    console.error('Error in getReportById handler:', err);
    return errorResponse(500, 'Failed to fetch report details', [err.message]);
  }
};
