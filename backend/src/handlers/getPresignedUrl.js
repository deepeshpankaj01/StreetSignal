import { validatePresignInput } from '../utils/validator.js';
import { generatePresignedUploadUrl } from '../services/s3Service.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Lambda handler for POST /uploads/presign
 */
export const handler = async (event) => {
  try {
    let payload = {};
    if (event.body) {
      payload = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    } else {
      return errorResponse(400, 'Request body is required');
    }

    const { valid, errors, sanitized } = validatePresignInput(payload);
    if (!valid) {
      return errorResponse(400, 'Invalid upload parameters', errors);
    }

    const presignedData = await generatePresignedUploadUrl(sanitized);

    return successResponse(200, presignedData, 'Presigned S3 upload URL generated successfully');
  } catch (err) {
    console.error('Error in getPresignedUrl handler:', err);
    return errorResponse(500, 'Failed to generate presigned upload URL', [err.message]);
  }
};
