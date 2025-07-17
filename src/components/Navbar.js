import React, { useRef } from 'react';
import { Menu } from 'primereact/menu';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';
import 'primeicons/primeicons.css';

export default function Navbar({ onLogout }) {
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const menuItems = [
    {
      label: 'Inicio',
      icon: 'pi pi-home',
      command: () => navigate('/dashboard'),
    },
    {
      label: 'Inventario',
      icon: 'pi pi-box',
      command: () => navigate('/inventory'),
    },
    {
      label: 'Productos',
      icon: 'pi pi-tags',
      command: () => navigate('/products'),
    },
    {
      label: 'Entradas',
      icon: 'pi pi-sign-in',
      command: () => navigate('/entradas'),
    },
    {
      label: 'Salidas',
      icon: 'pi pi-sign-out',
      command: () => navigate('/salidas'),
    },
    {
      separator: true,
    },
    {
      label: 'Configuraciones',
      icon: 'pi pi-cog',
      command: () => navigate('/config'),
    },
    {
      label: 'Cerrar sesión',
      icon: 'pi pi-sign-out',
      command: onLogout,
    },
  ];

  return (
    <div className="navbar">
      <div className="navbar-logo">
        <img 
          width={140}
          src="https://mdexqdspobjpmzactfow.supabase.co/storage/v1/object/sign/sumologo/SumoLogo.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8yMGZkZDY3Yy0xODQ0LTRmZTktOTUwNS1mYTMyYjc2NzlhZjEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzdW1vbG9nby9TdW1vTG9nby5wbmciLCJpYXQiOjE3NTI2MDk5MDUsImV4cCI6MjA2Nzk2OTkwNX0.Q8pIdnjrePwj7RqyLLjHsQ7av4KhylSJVNZBC05s0fY" 
          alt="Logo"
          onClick={() => {navigate('/Dashboard')}} 
        />
      </div>

      <div>
        <Menu model={menuItems} popup ref={menuRef} />
        <Button
          icon="pi pi-bars"
          className="p-button-text navbar-menu-button"
          onClick={(e) => menuRef.current.toggle(e)}
          aria-label="Opciones"
        />
      </div>
    </div>
  );
}
