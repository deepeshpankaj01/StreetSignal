/**
 * Input validation for StreetSignal civic issue reporting platform
 */

export const VALID_CATEGORIES = [
  'Potholes',
  'Garbage',
  'Road Dust',
  'Water Leakage',
  'Streetlights'
];

export const VALID_STATUSES = [
  'Submitted',
  'Under Review',
  'In Progress',
  'Resolved'
];

export const VALID_PRIORITIES = [
  'Low',
  'Medium',
  'High',
  'Critical'
];

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/jpg'
];

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Validates report creation payload
 * @param {object} payload 
 * @returns {{ valid: boolean, errors: string[], sanitized: object }}
 */
export function validateReportInput(payload = {}) {
  const errors = [];
  const sanitized = {};

  // Category validation
  if (!payload.category || typeof payload.category !== 'string') {
    errors.push(`Category is required and must be one of: ${VALID_CATEGORIES.join(', ')}.`);
  } else {
    const trimmedCategory = payload.category.trim();
    const matchedCategory = VALID_CATEGORIES.find(
      c => c.toLowerCase() === trimmedCategory.toLowerCase()
    );
    if (!matchedCategory) {
      errors.push(`Invalid category "${payload.category}". Allowed: ${VALID_CATEGORIES.join(', ')}.`);
    } else {
      sanitized.category = matchedCategory;
    }
  }

  // Locality validation
  if (!payload.locality || typeof payload.locality !== 'string') {
    errors.push('Locality is required.');
  } else {
    const trimmedLocality = payload.locality.trim();
    if (trimmedLocality.length < 2) {
      errors.push('Locality must be at least 2 characters.');
    } else if (trimmedLocality.length > 120) {
      errors.push('Locality cannot exceed 120 characters.');
    } else {
      sanitized.locality = trimmedLocality;
    }
  }

  // Description validation
  if (!payload.description || typeof payload.description !== 'string') {
    errors.push('Description is required.');
  } else {
    const trimmedDesc = payload.description.trim();
    if (trimmedDesc.length < 5) {
      errors.push('Description must be at least 5 characters to provide meaningful context.');
    } else if (trimmedDesc.length > 1500) {
      errors.push('Description cannot exceed 1500 characters.');
    } else {
      sanitized.description = trimmedDesc;
    }
  }

  // Optional photograph / S3 image URL or key
  if (payload.imageUrl && typeof payload.imageUrl === 'string') {
    sanitized.imageUrl = payload.imageUrl.trim();
  } else {
    sanitized.imageUrl = null;
  }

  // Optional coordinates
  if (payload.latitude !== undefined && payload.longitude !== undefined) {
    const lat = Number(payload.latitude);
    const lng = Number(payload.longitude);
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      sanitized.coordinates = { latitude: lat, longitude: lng };
    }
  }

  // Priority (default based on category or payload)
  if (payload.priority && VALID_PRIORITIES.includes(payload.priority)) {
    sanitized.priority = payload.priority;
  } else {
    // Default smart severity based on category
    if (sanitized.category === 'Water Leakage' || sanitized.category === 'Potholes') {
      sanitized.priority = 'High';
    } else {
      sanitized.priority = 'Medium';
    }
  }

  // Optional citizen contact / email / phone
  if (payload.reporterName && typeof payload.reporterName === 'string') {
    sanitized.reporterName = payload.reporterName.trim().slice(0, 80);
  } else {
    sanitized.reporterName = 'Anonymous Citizen';
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitized
  };
}

/**
 * Validates presigned URL request
 * @param {object} payload 
 * @returns {{ valid: boolean, errors: string[], sanitized: object }}
 */
export function validatePresignInput(payload = {}) {
  const errors = [];
  const sanitized = {};

  if (!payload.contentType || typeof payload.contentType !== 'string') {
    errors.push('Content-Type is required.');
  } else {
    const cType = payload.contentType.trim().toLowerCase();
    if (!ALLOWED_IMAGE_TYPES.includes(cType)) {
      errors.push(`Invalid content type "${payload.contentType}". Allowed: ${ALLOWED_IMAGE_TYPES.join(', ')}.`);
    } else {
      sanitized.contentType = cType;
    }
  }

  if (!payload.fileName || typeof payload.fileName !== 'string') {
    errors.push('File name is required.');
  } else {
    const safeName = payload.fileName.trim().replace(/[^a-zA-Z0-9._-]/g, '_');
    sanitized.fileName = safeName;
  }

  if (payload.fileSize !== undefined) {
    const size = Number(payload.fileSize);
    if (isNaN(size) || size <= 0) {
      errors.push('File size must be a positive number.');
    } else if (size > MAX_IMAGE_SIZE_BYTES) {
      errors.push(`File size exceeds maximum allowed limit of ${MAX_IMAGE_SIZE_BYTES / (1024 * 1024)}MB.`);
    } else {
      sanitized.fileSize = size;
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitized
  };
}
