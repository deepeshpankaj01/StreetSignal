import { getAnalyticsSummary } from '../services/dynamoService.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Lambda handler for GET /analytics
 */
export const handler = async (event) => {
  try {
    const summary = await getAnalyticsSummary();
    return successResponse(200, summary, 'Analytics summary generated successfully');
  } catch (err) {
    console.error('Error in getAnalytics handler:', err);
    return errorResponse(500, 'Failed to compute analytics summary', [err.message]);
  }
};
