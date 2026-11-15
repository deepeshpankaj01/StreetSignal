import { updateReportStatus } from '../services/dynamoService.js';
import { VALID_STATUSES } from '../utils/validator.js';
import { isValidReportId } from '../utils/idGenerator.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Lambda handler for PATCH /reports/{id}/status
 */
export const handler = async (event) => {
  try {
    const reportId = event.pathParameters?.id || event.pathParameters?.reportId;

    if (!reportId) {
      return errorResponse(400, 'Report ID is required');
    }

    const cleanId = reportId.trim().toUpperCase();
    if (!isValidReportId(cleanId)) {
      return errorResponse(400, `Invalid report ID format "${reportId}"`);
    }

    let payload = {};
    if (event.body) {
      payload = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    }

    const { status, note } = payload;
    if (!status || !VALID_STATUSES.includes(status)) {
      return errorResponse(400, `Valid status is required. Allowed: ${VALID_STATUSES.join(', ')}`);
    }

    const updated = await updateReportStatus(cleanId, status, note);

    if (!updated) {
      return errorResponse(404, `Report ${cleanId} not found`);
    }

    return successResponse(200, updated, `Status of report ${cleanId} updated to ${status}`);
  } catch (err) {
    console.error('Error in updateReportStatus handler:', err);
    return errorResponse(500, 'Failed to update report status', [err.message]);
  }
};
