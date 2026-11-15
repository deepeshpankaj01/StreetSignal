import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { 
  validateReportInput, 
  validatePresignInput, 
  VALID_CATEGORIES, 
  MAX_IMAGE_SIZE_BYTES 
} from '../src/utils/validator.js';

describe('Report Input Validation', () => {
  test('should accept valid report data for all official categories', () => {
    for (const category of VALID_CATEGORIES) {
      const input = {
        category,
        locality: 'Indiranagar 100ft Road',
        description: 'Deep pothole right in front of bus stop, causing sudden braking.'
      };
      const result = validateReportInput(input);
      assert.equal(result.valid, true);
      assert.equal(result.sanitized.category, category);
      assert.equal(result.sanitized.locality, 'Indiranagar 100ft Road');
    }
  });

  test('should reject invalid or unsupported category', () => {
    const input = {
      category: 'NoisePollution',
      locality: 'Indiranagar',
      description: 'Loud music at midnight'
    };
    const result = validateReportInput(input);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => e.includes('Invalid category')));
  });

  test('should reject short locality under 2 characters', () => {
    const input = {
      category: 'Potholes',
      locality: 'A',
      description: 'A serious road issue needing fix'
    };
    const result = validateReportInput(input);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => e.includes('Locality must be at least 2 characters')));
  });

  test('should reject short description under 5 characters', () => {
    const input = {
      category: 'Potholes',
      locality: 'MG Road',
      description: 'Bad'
    };
    const result = validateReportInput(input);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => e.includes('Description must be at least 5 characters')));
  });

  test('should reject excessively long description exceeding 1500 chars', () => {
    const input = {
      category: 'Garbage',
      locality: 'Koramangala',
      description: 'X'.repeat(1501)
    };
    const result = validateReportInput(input);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => e.includes('cannot exceed 1500 characters')));
  });
});

describe('Presigned S3 Upload Validation', () => {
  test('should accept valid image MIME types and safe file name', () => {
    const input = {
      fileName: 'pothole-photo.jpg',
      contentType: 'image/jpeg',
      fileSize: 1024 * 500 // 500 KB
    };
    const result = validatePresignInput(input);
    assert.equal(result.valid, true);
    assert.equal(result.sanitized.contentType, 'image/jpeg');
    assert.equal(result.sanitized.fileName, 'pothole-photo.jpg');
  });

  test('should reject disallowed file types (e.g. application/pdf or text/plain)', () => {
    const input = {
      fileName: 'document.pdf',
      contentType: 'application/pdf',
      fileSize: 1024 * 100
    };
    const result = validatePresignInput(input);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => e.includes('Invalid content type')));
  });

  test('should reject file size exceeding 5MB limit', () => {
    const input = {
      fileName: 'huge-image.png',
      contentType: 'image/png',
      fileSize: MAX_IMAGE_SIZE_BYTES + 1000
    };
    const result = validatePresignInput(input);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => e.includes('exceeds maximum allowed limit')));
  });
});
