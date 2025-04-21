import { s3Config, validateS3Config, getS3Url } from '../config/s3';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

/**
 * Generates an S3 URL for an image
 * @param path The path within the bucket
 * @returns The complete S3 URL
 */
export function getImageUrl(path: string): string {
  // Validate config first
  if (!validateS3Config()) {
    console.warn('S3 configuration is incomplete. Using placeholder URL.');
    return '/placeholder.webp'; // Return a default placeholder
  }
  
  // Clean the path (remove any leading slash)
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  
  // Generate the S3 URL
  return getS3Url(cleanPath);
}

/**
 * Converts a local file path to an S3 URL
 * @param localPath The local file path
 * @param folderPrefix The folder prefix in S3 (e.g., 'images/ejercicios')
 * @returns The S3 URL
 */
export function localPathToS3Url(localPath: string, folderPrefix: string = 'images'): string {
  // Extract filename from path
  const filename = localPath.split(/[\\/]/).pop() || '';
  
  // Create the S3 path
  const s3Path = `${folderPrefix}/${filename}`;
  
  // Return the full S3 URL
  return getImageUrl(s3Path);
}

/**
 * Returns the base S3 URL for the bucket
 * @returns The base S3 URL
 */
export function getS3BaseUrl(): string {
  if (!validateS3Config()) {
    return '';
  }
  
  return `https://${s3Config.bucketName}.s3.${s3Config.region}.amazonaws.com`;
}

export default {
  getImageUrl,
  localPathToS3Url,
  getS3BaseUrl
}; 