import React from 'react';
import { useUser } from '../context/UserContext';

export default function FooterPag() {
  const { user } = useUser();

  return (
    <footer
      style={{
        backgroundColor: '#c5bebeff',
        padding: '10px 20px',
        textAlign: 'right',
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
      Usuario: <strong>{user?.UserName + '         ' || 'No identificado'}</strong>
      Rol: <strong>{user?.Rol || 'No identificado'}</strong>
    </footer>
  );
}
