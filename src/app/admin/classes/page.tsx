'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface DanceClass {
  id: string;
  title: string;
  description: string;
  instructor: string;
  instructorId: string;
  style: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // en minutos
  maxStudents: number;
  enrolledStudents: number;
  price: number;
  schedule: {
    day: string;
    time: string;
  };
  status: 'active' | 'inactive' | 'cancelled';
  createdAt: string;
  imageUrl?: string;
}

const AdminClassesPage = () => {
  const router = useRouter();
  const [classes, setClasses] = useState<DanceClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [styleFilter, setStyleFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Datos de ejemplo
  useEffect(() => {
    const mockClasses: DanceClass[] = [
      {
        id: '1',
        title: 'Salsa Intermedio',
        description: 'Clase de salsa para estudiantes con experiencia básica',
        instructor: 'Carlos Mendoza',
        instructorId: '2',
        style: 'Salsa',
        level: 'intermediate',
        duration: 90,
        maxStudents: 20,
        enrolledStudents: 15,
        price: 45,
        schedule: { day: 'Lunes y Miércoles', time: '19:00 - 20:30' },
        status: 'active',
        createdAt: '2024-01-15'
      },
      {
        id: '2',
        title: 'Bachata Principiante',
        description: 'Aprende los pasos básicos de bachata',
        instructor: 'María González',
        instructorId: '3',
        style: 'Bachata',
        level: 'beginner',
        duration: 60,
        maxStudents: 15,
        enrolledStudents: 12,
        price: 40,
        schedule: { day: 'Martes y Jueves', time: '18:00 - 19:00' },
        status: 'active',
        createdAt: '2024-01-20'
      },
      {
        id: '3',
        title: 'Hip Hop Avanzado',
        description: 'Coreografías complejas y técnicas avanzadas',
        instructor: 'Alex Rivera',
        instructorId: '4',
        style: 'Hip Hop',
        level: 'advanced',
        duration: 90,
        maxStudents: 12,
        enrolledStudents: 10,
        price: 50,
        schedule: { day: 'Viernes', time: '20:00 - 21:30' },
        status: 'active',
        createdAt: '2024-02-01'
      },
      {
        id: '4',
        title: 'Merengue Básico',
        description: 'Introducción al merengue dominicano',
        instructor: 'Sofia Martínez',
        instructorId: '5',
        style: 'Merengue',
        level: 'beginner',
        duration: 60,
        maxStudents: 18,
        enrolledStudents: 8,
        price: 35,
        schedule: { day: 'Sábados', time: '10:00 - 11:00' },
        status: 'active',
        createdAt: '2024-02-10'
      },
      {
        id: '5',
        title: 'Reggaeton Intermedio',
        description: 'Moviendo el cuerpo al ritmo del reggaeton',
        instructor: 'Carlos Mendoza',
        instructorId: '2',
        style: 'Reggaeton',
        level: 'intermediate',
        duration: 75,
        maxStudents: 16,
        enrolledStudents: 14,
        price: 42,
        schedule: { day: 'Domingos', time: '17:00 - 18:15' },
        status: 'inactive',
        createdAt: '2024-02-15'
      }
    ];

    setTimeout(() => {
      setClasses(mockClasses);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredClasses = classes.filter(danceClass => {
    const matchesSearch = danceClass.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         danceClass.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         danceClass.style.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStyle = styleFilter === 'all' || danceClass.style === styleFilter;
    const matchesLevel = levelFilter === 'all' || danceClass.level === levelFilter;
    const matchesStatus = statusFilter === 'all' || danceClass.status === statusFilter;
    
    return matchesSearch && matchesStyle && matchesLevel && matchesStatus;
  });

  const getLevelBadge = (level: string) => {
    const colors = {
      beginner: { bg: '#dcfce7', text: '#166534', label: 'Principiante' },
      intermediate: { bg: '#fef3c7', text: '#92400e', label: 'Intermedio' },
      advanced: { bg: '#fee2e2', text: '#dc2626', label: 'Avanzado' }
    };
    
    const color = colors[level as keyof typeof colors];
    
    return (
      <span style={{
        backgroundColor: color.bg,
        color: color.text,
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: '600'
      }}>
        {color.label}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: { bg: '#dcfce7', text: '#166534', label: 'Activa' },
      inactive: { bg: '#fef3c7', text: '#92400e', label: 'Inactiva' },
      cancelled: { bg: '#fee2e2', text: '#dc2626', label: 'Cancelada' }
    };
    
    const color = colors[status as keyof typeof colors];
    
    return (
      <span style={{
        backgroundColor: color.bg,
        color: color.text,
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: '600'
      }}>
        {color.label}
      </span>
    );
  };

  const getEnrollmentPercentage = (enrolled: number, max: number) => {
    return Math.round((enrolled / max) * 100);
  };

  if (loading) {
    return (
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>Cargando clases...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 20px 40px 20px'
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
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              🎵 Gestión de Clases
            </h1>
            <p style={{ color: '#6b7280', fontSize: '16px' }}>
              Administra las clases de baile y sus horarios
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button style={{
              backgroundColor: '#10b981',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#059669';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#10b981';
            }}>
              + Nueva Clase
            </button>
            
            <button
              onClick={() => router.push('/admin')}
              style={{
                backgroundColor: 'transparent',
                color: '#374151',
                padding: '10px 20px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              ← Volver al Panel
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '20px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
              {classes.length}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Total Clases</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
              {classes.filter(c => c.status === 'active').length}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Activas</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
              {classes.reduce((sum, c) => sum + c.enrolledStudents, 0)}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Estudiantes</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
              ${classes.reduce((sum, c) => sum + (c.price * c.enrolledStudents), 0)}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Ingresos</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '30px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto auto auto',
          gap: '20px',
          alignItems: 'end'
        }}>
          {/* Search */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Buscar clase
            </label>
            <input
              type="text"
              placeholder="Título, instructor o estilo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
              }}
            />
          </div>

          {/* Style Filter */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Estilo
            </label>
            <select
              value={styleFilter}
              onChange={(e) => setStyleFilter(e.target.value)}
              style={{
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px',
                backgroundColor: 'white',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="all">Todos</option>
              <option value="Salsa">Salsa</option>
              <option value="Bachata">Bachata</option>
              <option value="Hip Hop">Hip Hop</option>
              <option value="Merengue">Merengue</option>
              <option value="Reggaeton">Reggaeton</option>
            </select>
          </div>

          {/* Level Filter */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Nivel
            </label>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              style={{
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px',
                backgroundColor: 'white',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="all">Todos</option>
              <option value="beginner">Principiante</option>
              <option value="intermediate">Intermedio</option>
              <option value="advanced">Avanzado</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Estado
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px',
                backgroundColor: 'white',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="all">Todos</option>
              <option value="active">Activas</option>
              <option value="inactive">Inactivas</option>
              <option value="cancelled">Canceladas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Classes Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '24px'
      }}>
        {filteredClasses.map((danceClass) => (
          <div
            key={danceClass.id}
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e5e7eb',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05)';
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '16px'
            }}>
              <div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#1f2937',
                  marginBottom: '4px'
                }}>
                  {danceClass.title}
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  marginBottom: '8px'
                }}>
                  {danceClass.instructor}
                </p>
              </div>
              {getStatusBadge(danceClass.status)}
            </div>

            {/* Description */}
            <p style={{
              fontSize: '14px',
              color: '#374151',
              lineHeight: '1.5',
              marginBottom: '16px'
            }}>
              {danceClass.description}
            </p>

            {/* Info Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              marginBottom: '16px'
            }}>
              <div>
                <div style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  marginBottom: '4px'
                }}>
                  Estilo
                </div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1f2937'
                }}>
                  {danceClass.style}
                </div>
              </div>
              <div>
                <div style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  marginBottom: '4px'
                }}>
                  Nivel
                </div>
                <div>
                  {getLevelBadge(danceClass.level)}
                </div>
              </div>
              <div>
                <div style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  marginBottom: '4px'
                }}>
                  Duración
                </div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1f2937'
                }}>
                  {danceClass.duration} min
                </div>
              </div>
              <div>
                <div style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  marginBottom: '4px'
                }}>
                  Precio
                </div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1f2937'
                }}>
                  ${danceClass.price}
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div style={{
              backgroundColor: '#f8fafc',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '16px'
            }}>
              <div style={{
                fontSize: '12px',
                color: '#6b7280',
                marginBottom: '4px'
              }}>
                Horario
              </div>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#1f2937'
              }}>
                {danceClass.schedule.day}
              </div>
              <div style={{
                fontSize: '14px',
                color: '#6b7280'
              }}>
                {danceClass.schedule.time}
              </div>
            </div>

            {/* Enrollment */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <div>
                <div style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  marginBottom: '4px'
                }}>
                  Inscripciones
                </div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1f2937'
                }}>
                  {danceClass.enrolledStudents} / {danceClass.maxStudents}
                </div>
              </div>
              <div style={{
                width: '60px',
                height: '8px',
                backgroundColor: '#e5e7eb',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${getEnrollmentPercentage(danceClass.enrolledStudents, danceClass.maxStudents)}%`,
                  height: '100%',
                  backgroundColor: getEnrollmentPercentage(danceClass.enrolledStudents, danceClass.maxStudents) > 80 ? '#ef4444' : '#10b981',
                  borderRadius: '4px'
                }}></div>
              </div>
            </div>

            {/* Actions */}
            <div style={{
              display: 'flex',
              gap: '8px'
            }}>
              <button style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '8px 16px',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                flex: 1,
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#2563eb';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#3b82f6';
              }}>
                Editar
              </button>
              
              <button style={{
                backgroundColor: danceClass.status === 'active' ? '#ef4444' : '#10b981',
                color: 'white',
                padding: '8px 16px',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                flex: 1,
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = danceClass.status === 'active' ? '#dc2626' : '#059669';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = danceClass.status === 'active' ? '#ef4444' : '#10b981';
              }}>
                {danceClass.status === 'active' ? 'Desactivar' : 'Activar'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredClasses.length === 0 && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '60px 20px',
          textAlign: 'center',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎵</div>
          <h3 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '8px'
          }}>
            No se encontraron clases
          </h3>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>
            Intenta con otros filtros o términos de búsqueda
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminClassesPage;


