import { listReports } from '../services/dynamoService.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Lambda handler for GET /reports
 */
export const handler = async (event) => {
  try {
    const queryParams = event.queryStringParameters || {};
    const category = queryParams.category || undefined;
    const locality = queryParams.locality || undefined;
    const status = queryParams.status || undefined;
    const search = queryParams.search || undefined;
    const limit = queryParams.limit ? parseInt(queryParams.limit, 10) : 50;

    const reports = await listReports({ category, locality, status, search, limit });

    return successResponse(200, {
      count: reports.length,
      reports
    }, 'Reports retrieved successfully');
  } catch (err) {
    console.error('Error in getReports handler:', err);
    return errorResponse(500, 'Failed to fetch reports', [err.message]);
  }
};
