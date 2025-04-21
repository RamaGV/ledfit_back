import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// AWS S3 Configuration
export const s3Config = {
  region: process.env.AWS_REGION || 'sa-east-1',
  // These credentials should be loaded from environment variables
  // Never hardcode credentials in your code
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
  bucketName: process.env.S3_BUCKET_NAME || 'ledfit',
};

// Function to validate S3 configuration
export const validateS3Config = (): boolean => {
  const { region, credentials, bucketName } = s3Config;
  
  if (!region) {
    console.error('Missing AWS_REGION in environment variables');
    return false;
  }
  
  if (!credentials.accessKeyId) {
    console.error('Missing AWS_ACCESS_KEY_ID in environment variables');
    return false;
  }
  
  if (!credentials.secretAccessKey) {
    console.error('Missing AWS_SECRET_ACCESS_KEY in environment variables');
    return false;
  }
  
  if (!bucketName) {
    console.error('Missing S3_BUCKET_NAME in environment variables');
    return false;
  }
  
  return true;
};

// Export S3 URL helper function
export const getS3Url = (key: string): string => {
  return `https://${s3Config.bucketName}.s3.${s3Config.region}.amazonaws.com/${key}`;
}; 