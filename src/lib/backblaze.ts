import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Configuración de Backblaze B2 usando API S3 compatible
const s3Client = new S3Client({
  region: process.env.BACKBLAZE_REGION || 'us-east-005',
  endpoint: process.env.BACKBLAZE_ENDPOINT || 'https://s3.us-east-005.backblazeb2.com',
  credentials: {
    accessKeyId: process.env.BACKBLAZE_KEY_ID || '',
    secretAccessKey: process.env.BACKBLAZE_APPLICATION_KEY || '',
  },
  forcePathStyle: true,
});

// Bucket name de DanZar
export const BUCKET_NAME = 'danzar';

// Endpoint público
export const PUBLIC_ENDPOINT = 'https://s3.us-east-005.backblazeb2.com';

// Función para subir una imagen
export const uploadImage = async (file: File, fileName: string, folder: string = 'images'): Promise<string> => {
  try {
    // Convertir archivo a buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Comando para subir archivo
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `${folder}/${fileName}`,
      Body: buffer,
      ContentType: file.type,
      ACL: 'public-read', // Hacer el archivo público
    });
    
    // Subir archivo
    await s3Client.send(command);
    
    // Retornar URL pública
    return `${PUBLIC_ENDPOINT}/${BUCKET_NAME}/${folder}/${fileName}`;
  } catch (error) {
    console.error('Error subiendo imagen:', error);
    throw error;
  }
};

// Función para eliminar una imagen
export const deleteImage = async (fileName: string): Promise<boolean> => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `images/${fileName}`,
    });
    
    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error('Error eliminando imagen:', error);
    throw error;
  }
};

// Función para obtener URL pública de una imagen
export const getImageUrl = (fileName: string): string => {
  return `${PUBLIC_ENDPOINT}/${BUCKET_NAME}/images/${fileName}`;
};

// Función para obtener URL firmada (para archivos privados)
export const getSignedImageUrl = async (fileName: string, expiresIn: number = 3600): Promise<string> => {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `images/${fileName}`,
    });
    
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return signedUrl;
  } catch (error) {
    console.error('Error obteniendo URL firmada:', error);
    throw error;
  }
};

export default s3Client;
