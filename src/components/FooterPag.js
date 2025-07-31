import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { Button } from 'primereact/button';
import { confirmDialog } from 'primereact/confirmdialog';
import { ConfirmDialog } from 'primereact/confirmdialog';
import DrawerResumen from '../Screen/CajaMovimientos/DrawerResumen';

export default function FooterPag({ onLogout }) {
  const { user } = useUser();
  const [showDialog, setShowDialog] = useState(false)

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


        <div style={{ display: 'flex', gap: '1rem' }}>
          {(user?.IdRol === 1 || user?.IdRol === 2) && (
            <Button
              icon="pi pi-wallet"
              className="p-button-sm"
              onClick={() => setShowDialog(true)}
              tooltip='Resumen de Caja'
              tooltipOptions={{
                position: 'top'
              }}
            />
          )}

          <Button
            icon="pi pi-sign-out"
            className="p-button-sm"
            onClick={confirmCerrarSesion}
          />
        </div>
      </footer>

      <ConfirmDialog />
      {showDialog && (
        <DrawerResumen setShowDialog={setShowDialog} showDialog={showDialog}/>
      )}
    </>
  );
}
