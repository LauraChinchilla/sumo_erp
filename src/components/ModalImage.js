import React from 'react';
import { Dialog } from 'primereact/dialog';

export default function ModalImage({ selected, setSelected, showDialogImage, setShowDialogImage, Personal=false }) {

  const handleClose = () => {
    setShowDialogImage(false);
    setSelected([]);
  };

  return (
    <Dialog
      header={Personal === true ? `${selected[0]?.Nombre} ${selected[0]?.Apellido}` :`${selected[0]?.Code} - ${selected[0]?.Name}`}
      visible={showDialogImage}
      style={{ width: '50vw', maxWidth: '600px' }}
      onHide={handleClose}
      modal
      dismissableMask
    >
      {Personal === true ? (
        <div style={{ textAlign: 'center' }}>
          {selected?.[0]?.FotoURL ? (
            <img
              src={selected[0].FotoURL}
              alt="Personal"
              style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: '10px' }}
            />
          ) : (
            <p>No hay imagen disponible</p>
          )}
        </div>
      ) : (
        <div style={{ textAlign: 'center' }}>
          {selected?.[0]?.ImageURL ? (
            <img
              src={selected[0].ImageURL}
              alt="Producto"
              style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: '10px' }}
            />
          ) : (
            <p>No hay imagen disponible</p>
          )}
        </div>
      )}
    </Dialog>
  );
}
