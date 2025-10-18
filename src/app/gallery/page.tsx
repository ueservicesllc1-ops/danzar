'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Camera, Play, Heart, Calendar } from 'lucide-react';

interface GalleryItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  type: 'photo' | 'video';
  createdAt: string;
  likes: number;
  tags: string[];
}

const GalleryPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  // Datos de ejemplo
  const mockItems: GalleryItem[] = [
    {
      id: '1',
      title: 'Showcase de Salsa 2024',
      description: 'Increíble presentación de nuestros estudiantes de salsa en el evento anual.',
      imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
      type: 'photo',
      createdAt: '2024-03-15',
      likes: 45,
      tags: ['salsa', 'showcase', 'evento']
    },
    {
      id: '2',
      title: 'Clase de Bachata',
      description: 'Momentos especiales de nuestra clase de bachata para principiantes.',
      imageUrl: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=800&h=600&fit=crop',
      type: 'video',
      createdAt: '2024-03-14',
      likes: 32,
      tags: ['bachata', 'clase', 'principiante']
    },
    {
      id: '3',
      title: 'Workshop de Hip Hop',
      description: 'Intenso workshop de hip hop con coreografías increíbles.',
      imageUrl: 'https://images.unsplash.com/photo-1547153760-18fc86324498?w=800&h=600&fit=crop',
      type: 'photo',
      createdAt: '2024-03-12',
      likes: 67,
      tags: ['hip-hop', 'workshop', 'coreografia']
    },
    {
      id: '4',
      title: 'Competencia de Reggaeton',
      description: 'Nuestros estudiantes participando en la competencia regional de reggaeton.',
      imageUrl: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=600&fit=crop',
      type: 'video',
      createdAt: '2024-03-10',
      likes: 89,
      tags: ['reggaeton', 'competencia', 'regional']
    },
    {
      id: '5',
      title: 'Clase de Merengue',
      description: 'Aprendiendo los pasos básicos del merengue dominicano.',
      imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=600&fit=crop',
      type: 'photo',
      createdAt: '2024-03-08',
      likes: 28,
      tags: ['merengue', 'basico', 'dominicano']
    },
    {
      id: '6',
      title: 'Festival de Danza',
      description: 'Gran festival anual con todas las academias de la ciudad.',
      imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop',
      type: 'photo',
      createdAt: '2024-03-05',
      likes: 156,
      tags: ['festival', 'anual', 'ciudad']
    }
  ];

  const filters = [
    { id: 'all', label: 'Todos', count: mockItems.length },
    { id: 'photos', label: 'Fotos', count: mockItems.filter(item => item.type === 'photo').length },
    { id: 'videos', label: 'Videos', count: mockItems.filter(item => item.type === 'video').length }
  ];

  const filteredItems = mockItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = selectedFilter === 'all' ||
                         (selectedFilter === 'photos' && item.type === 'photo') ||
                         (selectedFilter === 'videos' && item.type === 'video');
    
    return matchesSearch && matchesFilter;
  });

  if (!user) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        paddingTop: '100px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#1f2937' }}>
            Acceso no autorizado
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>
            Necesitas iniciar sesión para acceder a la galería.
          </p>
          <button 
            onClick={() => router.push('/auth/login')}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#3b82f6';
            }}
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      paddingTop: '120px',
      paddingBottom: '40px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px'
      }}>
        
        {/* Header */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '30px',
          marginBottom: '30px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e5e7eb'
        }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '8px'
          }}>
            <Camera size={24} style={{ marginRight: '8px' }} />
            Galería
          </h1>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>
            Descubre los mejores momentos de DanZar
          </p>
        </div>

        {/* Search and Filters */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '30px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e5e7eb'
        }}>
          {/* Search Bar */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Buscar en la galería..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 40px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  (e.target as HTMLButtonElement).style.borderColor = '#3b82f6';
                }}
                onBlur={(e) => {
                  (e.target as HTMLButtonElement).style.borderColor = '#e5e7eb';
                }}
              />
              <span style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#6b7280',
                fontSize: '20px'
              }}>
                🔍
              </span>
            </div>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                style={{
                  backgroundColor: selectedFilter === filter.id ? '#3b82f6' : 'transparent',
                  color: selectedFilter === filter.id ? 'white' : '#374151',
                  padding: '8px 16px',
                  border: selectedFilter === filter.id ? 'none' : '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  if (selectedFilter !== filter.id) {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6';
                    (e.target as HTMLButtonElement).style.borderColor = '#d1d5db';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedFilter !== filter.id) {
                    (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
                    (e.target as HTMLButtonElement).style.borderColor = '#e5e7eb';
                  }
                }}
              >
                {filter.label}
                <span style={{
                  backgroundColor: selectedFilter === filter.id ? 'rgba(255,255,255,0.2)' : '#e5e7eb',
                  color: selectedFilter === filter.id ? 'white' : '#6b7280',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {filter.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '24px',
          marginBottom: '40px'
        }}>
          {filteredItems.map((item) => (
            <div
              key={item.id}
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                border: '1px solid #e5e7eb',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onClick={() => setSelectedItem(item)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05)';
              }}
            >
              {/* Image */}
              <div style={{ position: 'relative' }}>
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover'
                  }}
                />
                
                {/* Type Badge */}
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px'
                }}>
                  <span style={{
                    backgroundColor: item.type === 'video' ? '#ef4444' : '#3b82f6',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {item.type === 'video' ? <Play size={16} /> : <Camera size={16} />}
                    {item.type === 'video' ? 'Video' : 'Foto'}
                  </span>
                </div>

                {/* Likes */}
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px'
                }}>
                  <span style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Heart size={16} style={{ marginRight: '4px' }} />
                    {item.likes}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div style={{ padding: '20px' }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '8px',
                  lineHeight: '1.4'
                }}>
                  {item.title}
                </h3>
                
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  marginBottom: '16px',
                  lineHeight: '1.5'
                }}>
                  {item.description}
                </p>

                {/* Date */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginBottom: '12px',
                  fontSize: '12px',
                  color: '#9ca3af'
                }}>
                  <Calendar size={16} style={{ marginRight: '4px' }} />
                  {new Date(item.createdAt).toLocaleDateString('es-ES')}
                </div>

                {/* Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {item.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      style={{
                        backgroundColor: '#f3f4f6',
                        color: '#374151',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '500'
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '60px 20px',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📷</div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '8px'
            }}>
              No se encontraron elementos
            </h3>
            <p style={{ color: '#6b7280', fontSize: '16px' }}>
              Intenta con otros términos de búsqueda o filtros
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedItem && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: '20px'
          }}
          onClick={() => setSelectedItem(null)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              maxWidth: '800px',
              maxHeight: '90vh',
              overflow: 'auto',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedItem(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '16px',
                zIndex: 10
              }}
            >
              ✕
            </button>

            {/* Image */}
            <img
              src={selectedItem.imageUrl}
              alt={selectedItem.title}
              style={{
                width: '100%',
                height: '400px',
                objectFit: 'cover',
                borderRadius: '12px 12px 0 0'
              }}
            />

            {/* Content */}
            <div style={{ padding: '24px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '16px'
              }}>
                <div>
                  <h2 style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: '#1f2937',
                    marginBottom: '8px'
                  }}>
                    {selectedItem.title}
                  </h2>
                  <p style={{
                    fontSize: '16px',
                    color: '#6b7280',
                    lineHeight: '1.5'
                  }}>
                    {selectedItem.description}
                  </p>
                </div>
                
                <span style={{
                  backgroundColor: selectedItem.type === 'video' ? '#ef4444' : '#3b82f6',
                  color: 'white',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {selectedItem.type === 'video' ? <Play size={16} /> : <Camera size={16} />}
                  {selectedItem.type === 'video' ? 'Video' : 'Foto'}
                </span>
              </div>

              {/* Info */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                marginBottom: '20px',
                fontSize: '14px',
                color: '#6b7280'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={16} style={{ marginRight: '4px' }} />
                  {new Date(selectedItem.createdAt).toLocaleDateString('es-ES')}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Heart size={16} style={{ marginRight: '4px' }} />
                  {selectedItem.likes} me gusta
                </div>
              </div>

              {/* Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {selectedItem.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      padding: '4px 12px',
                      borderRadius: '16px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div style={{
                display: 'flex',
                gap: '12px',
                marginTop: '24px'
              }}>
                <button style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#3b82f6';
                }}>
                  📥 Descargar
                </button>
                
                <button style={{
                  backgroundColor: 'transparent',
                  color: '#374151',
                  padding: '10px 20px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
                }}>
                  📤 Compartir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;