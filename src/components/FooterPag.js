import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { Button } from 'primereact/button';
import { confirmDialog } from 'primereact/confirmdialog';
import { ConfirmDialog } from 'primereact/confirmdialog';
import DrawerResumen from '../Screen/CajaMovimientos/DrawerResumen';
import { useTheme } from '../context/ThemeContext';

export default function FooterPag({ onLogout }) {
  const { user } = useUser();
  const [showDialog, setShowDialog] = useState(false);
  const { toggleTheme, theme } = useTheme();

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
          backgroundColor: 'var(--bg-footer)',
          padding: '0.8rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          borderTop: '1px solid var(--border-color)',
          fontSize: '14px',
          color: 'var(--text-color)',
          zIndex: 100,
          boxShadow: '0 -1px 6px var(--footer-shadow)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <span>
            <strong>{user?.UserName || 'Usuario no identificado'}</strong>
          </span>
          <span style={{ fontSize: '12px', color: '#888' }}>
            Rol: {user?.Rol || 'No identificado'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
          <Button
            icon={theme === 'light' ? 'pi pi-moon' : 'pi pi-sun'}
            className="p-button-text p-button-rounded"
            onClick={toggleTheme}
            tooltip="Cambiar tema"
            tooltipOptions={{ position: 'top' }}
          />

          {(user?.IdRol === 1 || user?.IdRol === 2) && (
            <Button
              icon="pi pi-wallet"
              className="p-button-text p-button-rounded p-button-secondary"
              onClick={() => setShowDialog(true)}
              tooltip="Resumen de Caja"
              tooltipOptions={{ position: 'top' }}
            />
          )}

          <Button
            icon="pi pi-sign-out"
            className="p-button-text p-button-rounded p-button-danger"
            onClick={confirmCerrarSesion}
            tooltip="Cerrar sesión"
            tooltipOptions={{ position: 'top' }}
          />
        </div>
      </footer>

      <ConfirmDialog />

      {showDialog && (
        <DrawerResumen setShowDialog={setShowDialog} showDialog={showDialog} />
      )}
    </>
  );
}
