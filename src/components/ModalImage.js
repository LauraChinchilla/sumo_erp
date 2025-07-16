import React from 'react';
import { Dialog } from 'primereact/dialog';

export default function ModalImage({ selected, setSelected, showDialogImage, setShowDialogImage }) {

  const handleClose = () => {
    setShowDialogImage(false);
    setSelected([]);
  };

  return (
    <Dialog
      header={`${selected[0]?.Code} - ${selected[0]?.Name}`}
      visible={showDialogImage}
      style={{ width: '50vw', maxWidth: '600px' }}
      onHide={handleClose}
      modal
      dismissableMask
    >
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
    </Dialog>
  );
}
