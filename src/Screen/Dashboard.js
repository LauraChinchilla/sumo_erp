
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'primeicons/primeicons.css';
import { useUser } from '../context/UserContext';
import { Button } from 'primereact/button';

export default function Dashboard() {
  const { user, loading } = useUser();
  const navigate = useNavigate();
  const [selectedIndex, setSelectedIndex] = useState(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
    document.title = 'Sumo - Dashboard';
  }, [user, loading, navigate]);

  if (loading) return null;

  const cards = [
    {
      icon: 'pi pi-box',
      title: 'Inventario',
      description: 'Consulta general del inventario disponible en el sistema.',
      ruta: '/inventory',
    },
    {
      icon: 'pi pi-tags',
      title: 'Productos',
      description: 'Gestión de productos: creación, edición y eliminación.',
      ruta: '/products',
    },
    {
      icon: 'pi pi-sign-in',
      title: 'Entradas',
      description: 'Registro de ingreso de productos al inventario.',
      ruta: '/entradas',
    },
    {
      icon: 'pi pi-sign-out',
      title: 'Salidas',
      description: 'Registro de salidas de productos por ventas o bajas.',
      ruta: '/salidas',
    },
    {
      icon: 'pi pi-money-bill',
      title: 'Flujo de Caja',
      description: 'Control de ingresos y gastos del negocio.',
      ruta: '/caja',
    },
    {
      icon: 'pi pi-list',
      title: 'Mov. de Caja',
      description: 'Consulta detallada del historial de movimientos en caja.',
      ruta: '/cajamovimientos',
    },
    {
      icon: 'pi pi-exclamation-triangle',
      title: 'Stock Bajo',
      description: 'Productos con inventario crítico o en cero.',
      ruta: '/stockBajo',
    },
    {
      icon: 'pi pi-credit-card',
      title: 'Créditos',
      description: 'Gestión de cuentas por cobrar y créditos a clientes.',
      ruta: '/creditos',
    },
    {
      icon: 'pi pi-history',
      title: 'Movimientos',
      description: 'Historial completo de entradas, salidas y ajustes.',
      ruta: '/movimientos',
    },
    {
      icon: 'pi pi-chart-line',
      title: 'KPIs',
      description:'Indicadores clave de mi Empresa',
      ruta:'/KPIs'
    },
    {
      icon: 'pi pi-cog',
      title: 'Maestros',
      description: 'Gestión de clientes, proveedores, usuarios, empresa y más.',
      ruta: '/maestros', // ajusta esta ruta si usas una diferente
    },
    {
      icon: 'pi pi-wallet',
      title: 'Retiros',
      description: 'Registro de retiros por ganancias o capital.',
      ruta: '/retiros',
    },
    {
      icon: 'pi pi-users',
      title: 'Personal',
      description: 'Gestión de pagos a empleados y sueldos.',
      ruta: '/personal',
    },
  ];

  return (
    <div
      style={{
        // backgroundImage: 'url(https://mdexqdspobjpmzactfow.supabase.co/storage/v1/object/public/fondosumo//Fonfo2.avif)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '87.9vh',
        padding: '1rem'
      }}
    >
      <div className="dashboard-container">
        <h2 style={{ color: '#08314d' }}>
          Bienvenido, {user?.UserName}
        </h2>
        <div className="card-grid">
          {cards
            .filter(card => {
              if (card.title === 'Movimientos' || card.title === 'KPIs' || card.title === 'Créditos'  || card.top === 'Retiros' || card.title === 'Mov. de Caja' || card.title === 'Personal') {
                return user?.IdRol === 1 || user?.IdRol === 2;
              }
              return true;
            })
            .map((card, index) => (
              <div
                key={index}
                className={`dashboard-card ${selectedIndex === index ? 'card-selected' : ''}`}
                style={{ position: 'relative' }}
                onClick={() => {
                  setSelectedIndex(index);
                  navigate(card.ruta);
                }}
              >
                <Button
                  icon="pi pi-external-link"
                  className="p-button-text p-button-sm"
                  onClick={(e) => {
                    e.stopPropagation(); 
                    window.open(card.ruta, '_blank');
                  }}
                  style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    zIndex: 1,
                    color: '#555'
                  }}
                />

                <i className={`card-icon ${card.icon}`} />
                <div>
                  <h3 style={{ margin: 0 }}>{card.title}</h3>
                  <p   
                    style={{
                      marginTop: '0.5rem',
                      fontSize: '14px',
                      color: 'var(--text-description)',
                    }}>
                    {card.description}
                  </p>
                </div>
              </div>
            ))}
        </div>

      </div>
    </div>
  );
}
