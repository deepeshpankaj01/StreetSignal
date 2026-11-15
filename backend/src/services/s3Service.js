import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'node:crypto';

const REGION = process.env.AWS_REGION || 'us-east-1';
const BUCKET_NAME = process.env.BUCKET_NAME || 'streetsignal-report-uploads';

const s3Client = new S3Client({ region: REGION });

/**
 * Generates an S3 Presigned URL for direct secure client upload
 * @param {object} params
 * @param {string} params.fileName - sanitized original file name
 * @param {string} params.contentType - validated image MIME type
 * @returns {Promise<{ uploadUrl: string, fileKey: string, publicUrl: string, expiresIn: number }>}
 */
export async function generatePresignedUploadUrl({ fileName, contentType }) {
  const fileExtension = fileName.split('.').pop() || 'jpg';
  const uniqueKey = crypto.randomBytes(8).toString('hex');
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  
  // Structured file key: uploads/YYYY/MM/<unique-hash>-<sanitized-name>
  const fileKey = `uploads/${year}/${month}/${uniqueKey}-${fileName}`;
  const expiresIn = 900; // 15 minutes

  // Check if we are running in local mock mode
  if (process.env.USE_MOCK_S3 === 'true') {
    const mockUploadUrl = `http://localhost:5001/api/uploads/mock-upload?key=${encodeURIComponent(fileKey)}`;
    const mockPublicUrl = `https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80`;
    return {
      uploadUrl: mockUploadUrl,
      fileKey,
      publicUrl: mockPublicUrl,
      expiresIn
    };
  }

  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
      ContentType: contentType,
      // Metadata or tags can be added here if needed
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn });
    const publicUrl = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${fileKey}`;

    return {
      uploadUrl,
      fileKey,
      publicUrl,
      expiresIn
    };
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[S3 Fallback] Generating local development simulated URL: ${error.message}`);
      return {
        uploadUrl: `http://localhost:5001/api/uploads/mock-upload?key=${encodeURIComponent(fileKey)}`,
        fileKey,
        publicUrl: `https://images.unsplash.com/photo-1584466977773-e625c37cdd50?auto=format&fit=crop&w=800&q=80`,
        expiresIn
      };
    }
    throw error;
  }
}
