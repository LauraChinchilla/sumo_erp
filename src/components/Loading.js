import React from 'react';
import { ProgressSpinner } from 'primereact/progressspinner';

export default function Loading({ message = 'Cargando...' }) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.7)',
        zIndex: 9999,
        flexDirection: 'column',
        fontSize: '1.2rem',
        color: '#333',
      }}
    >
      <ProgressSpinner style={{ width: '50px', height: '50px' }} />
      <div style={{ marginTop: '1rem' }}>{message}</div>
    </div>
  );
}
