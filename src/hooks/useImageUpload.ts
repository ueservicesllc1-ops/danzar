import { useState } from 'react';
import { uploadImage, deleteImage } from '@/lib/backblaze';

export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadImageToB2 = async (file: File): Promise<string> => {
    setUploading(true);
    setUploadProgress(0);

    try {
      // Generar nombre único para el archivo
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExtension = file.name.split('.').pop();
      const fileName = `${timestamp}_${randomString}.${fileExtension}`;

      // Simular progreso (Backblaze B2 no tiene progreso real en tiempo real)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 100);

      const imageUrl = await uploadImage(file, fileName);
      
      setUploadProgress(100);
      clearInterval(progressInterval);
      
      return imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const deleteImageFromB2 = async (imageUrl: string): Promise<boolean> => {
    try {
      // Extraer nombre del archivo de la URL
      const fileName = imageUrl.split('/').pop();
      if (!fileName) {
        throw new Error('No se pudo extraer el nombre del archivo');
      }

      return await deleteImage(fileName);
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  };

  return {
    uploading,
    uploadProgress,
    uploadImageToB2,
    deleteImageFromB2,
  };
};


