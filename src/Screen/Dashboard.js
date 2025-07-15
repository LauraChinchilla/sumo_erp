import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import 'primeicons/primeicons.css';
import { useUser } from '../context/UserContext';

export default function Dashboard() {
  const { user, logout, loading } = useUser();
  const navigate = useNavigate();
  const [selectedIndex, setSelectedIndex] = useState(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
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
    },
    {
      icon: 'pi pi-sign-out',
      title: 'Salidas',
      description: 'Registro de salidas de productos por ventas o bajas.',
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  }

  return (
    <>
      <Navbar onLogout={handleLogout} />
      <div className="dashboard-container" style={{ paddingTop: '100px' }}>
        <h2>Bienvenido, {user?.UserName}</h2>
        <div className="card-grid">
          {cards.map((card, index) => (
            <div
              key={index}
              className={`dashboard-card ${selectedIndex === index ? 'card-selected' : ''}`}
              onClick={() => {
                setSelectedIndex(index);
                navigate(card.ruta);
              }}
            >
              <i className={`card-icon ${card.icon}`} />
              <div>
                <h3 style={{ margin: 0 }}>{card.title}</h3>
                <p style={{ marginTop: '0.5rem', fontSize: '14px', color: '#555' }}>
                  {card.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
