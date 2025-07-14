import React, { useRef } from 'react';
import { Menu } from 'primereact/menu';
import { Button } from 'primereact/button';
import 'primeicons/primeicons.css';

export default function Navbar({ onLogout }) {
  const menuRef = useRef(null);

  const menuItems = [
    {
      label: 'Configuraciones',
      icon: 'pi pi-cog',
      command: () => alert('Ir a configuraciones... (puedes personalizarlo)')
    },
    {
      label: 'Cerrar sesión',
      icon: 'pi pi-sign-out',
      command: onLogout
    }
  ];

  return (
    <div className="navbar">
      <div className="navbar-logo">
        <img src="https://www.gstatic.com/images/branding/product/1x/googleg_32dp.png" alt="Logo" width={30} />
        Sumo ERP
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
