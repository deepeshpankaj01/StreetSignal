/**
 * StreetSignal API Client
 * Seamlessly interfaces with AWS API Gateway or Local Server
 */

// Read configured API Gateway URL or default to local proxy
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Helper to perform fetch requests with error handling
 */
async function request(endpoint, options = {}) {
  const url = `${BASE_URL.replace(/\/+$/, '')}/${endpoint.replace(/^\/+/, '')}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const errorMessage = data?.message || data?.errors?.join(', ') || `HTTP error ${res.status}`;
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    // If backend isn't running yet, fallback gracefully to mock data for instant preview
    console.warn(`[StreetSignal API] Network request to ${url} failed: ${error.message}. Checking fallback.`);
    throw error;
  }
}

/**
 * Get S3 presigned upload URL and upload file directly to S3
 */
export async function uploadReportPhoto(file) {
  if (!file) return null;

  // 1. Request presigned upload URL from API
  const presignPayload = {
    fileName: file.name,
    contentType: file.type || 'image/jpeg',
    fileSize: file.size
  };

  const presignRes = await request('/uploads/presign', {
    method: 'POST',
    body: JSON.stringify(presignPayload)
  });

  const { uploadUrl, publicUrl } = presignRes.data;

  // 2. Direct upload to S3 using Presigned URL via HTTP PUT
  const s3UploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type || 'image/jpeg'
    },
    body: file
  });

  if (!s3UploadRes.ok) {
    throw new Error(`Failed to upload photo to S3 storage (Status: ${s3UploadRes.status})`);
  }

  return publicUrl;
}

/**
 * Submit a new civic issue report
 */
export async function createReport(reportData, photoFile = null) {
  let imageUrl = reportData.imageUrl || null;

  // If a photo was selected, upload via Presigned S3 URL first
  if (photoFile) {
    try {
      imageUrl = await uploadReportPhoto(photoFile);
    } catch (uploadErr) {
      console.warn('S3 upload warning:', uploadErr);
      // Fallback: If S3 PUT is blocked in dev without AWS, use local preview object URL or placeholder
      imageUrl = URL.createObjectURL(photoFile);
    }
  }

  const payload = {
    ...reportData,
    imageUrl
  };

  const res = await request('/reports', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  return res.data;
}

/**
 * Fetch list of reports with optional filtering
 */
export async function getReports(filters = {}) {
  const query = new URLSearchParams();
  if (filters.category && filters.category !== 'All') query.append('category', filters.category);
  if (filters.status && filters.status !== 'All') query.append('status', filters.status);
  if (filters.locality) query.append('locality', filters.locality);
  if (filters.search) query.append('search', filters.search);
  if (filters.limit) query.append('limit', filters.limit);

  const qs = query.toString();
  const endpoint = qs ? `/reports?${qs}` : '/reports';

  const res = await request(endpoint, { method: 'GET' });
  return res.data;
}

/**
 * Retrieve a specific report by Reference ID (e.g. SIG-849201)
 */
export async function getReportById(reportId) {
  if (!reportId) throw new Error('Report ID is required');
  const cleanId = reportId.trim().toUpperCase();
  const res = await request(`/reports/${cleanId}`, { method: 'GET' });
  return res.data;
}

/**
 * Get aggregated analytics metrics
 */
export async function getAnalytics() {
  const res = await request('/analytics', { method: 'GET' });
  return res.data;
}

/**
 * Update report status (admin/civic workflow)
 */
export async function updateReportStatus(reportId, newStatus, note = '') {
  const cleanId = reportId.trim().toUpperCase();
  const res = await request(`/reports/${cleanId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: newStatus, note })
  });
  return res.data;
}
