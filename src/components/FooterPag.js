import React from 'react';
import { useUser } from '../context/UserContext';
import { Button } from 'primereact/button';
import { confirmDialog } from 'primereact/confirmdialog';
import { ConfirmDialog } from 'primereact/confirmdialog';

export default function FooterPag({ onLogout }) {
  const { user } = useUser();

  const confirmCerrarSesion = () => {
    confirmDialog({
      message: '¿Está seguro que desea cerrar sesión?',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: onLogout,
    });
  };

  return (
    <>
      <footer
        style={{
          backgroundColor: '#c5bebeff',
          padding: '10px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          borderTop: '1px solid #ccc',
          fontSize: '14px',
          color: '#333',
          zIndex: 100,
        }}
      >
        <div>
          Usuario: <strong>{user?.UserName || 'No identificado'}</strong>{' '}
          Rol: <strong>{user?.Rol || 'No identificado'}</strong>
        </div>
        <Button
          icon="pi pi-sign-out"
          className="p-button-sm"
          onClick={confirmCerrarSesion}
        />
      </footer>

      {/* Render del diálogo de confirmación */}
      <ConfirmDialog />
    </>
  );
}
