'use client';

import React, { useRef, useState } from 'react';
import { useImageUpload } from '@/hooks/useImageUpload';

interface ImageUploadProps {
  onImageUpload: (url: string) => void;
  currentImage?: string;
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUpload,
  currentImage,
  className = ''
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploading, uploadProgress, uploadImageToB2 } = useImageUpload();
  const [preview, setPreview] = useState<string | null>(currentImage || null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('El archivo debe ser menor a 5MB');
      return;
    }

    try {
      // Crear preview
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      // Subir imagen
      const imageUrl = await uploadImageToB2(file);
      
      // Limpiar preview temporal
      URL.revokeObjectURL(previewUrl);
      
      // Establecer imagen final
      setPreview(imageUrl);
      onImageUpload(imageUrl);
      
    } catch (error) {
      console.error('Error uploading image:', error);
      setPreview(null);
      alert('Error al subir la imagen. Intenta nuevamente.');
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`image-upload-container ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      
      <div
        onClick={handleClick}
        style={{
          border: '2px dashed #d1d5db',
          borderRadius: '8px',
          padding: '20px',
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: '#f9fafb',
          transition: 'all 0.2s ease',
          minHeight: '200px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#3b82f6';
          e.currentTarget.style.backgroundColor = '#f0f9ff';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#d1d5db';
          e.currentTarget.style.backgroundColor = '#f9fafb';
        }}
      >
        {preview ? (
          <div style={{ position: 'relative' }}>
            <img
              src={preview}
              alt="Preview"
              style={{
                maxWidth: '100%',
                maxHeight: '300px',
                borderRadius: '4px'
              }}
            />
            {uploading && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px'
                }}
              >
                <div style={{ color: 'white', textAlign: 'center' }}>
                  <div>Subiendo... {uploadProgress}%</div>
                  <div style={{
                    width: '100px',
                    height: '4px',
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    borderRadius: '2px',
                    marginTop: '8px',
                    overflow: 'hidden'
                  }}>
                    <div
                      style={{
                        width: `${uploadProgress}%`,
                        height: '100%',
                        backgroundColor: 'white',
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📷</div>
            <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>
              {uploading ? 'Subiendo imagen...' : 'Haz clic para subir una imagen'}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              PNG, JPG, GIF hasta 5MB
            </div>
            {uploading && (
              <div style={{ marginTop: '16px', width: '200px' }}>
                <div style={{ fontSize: '14px', marginBottom: '4px' }}>
                  Progreso: {uploadProgress}%
                </div>
                <div style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: '#e5e7eb',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div
                    style={{
                      width: `${uploadProgress}%`,
                      height: '100%',
                      backgroundColor: '#3b82f6',
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};


