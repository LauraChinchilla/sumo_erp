// src/components/MainLayout.jsx
import React from 'react';
import Navbar from './Navbar';
import FooterPag from './FooterPag';

export default function MainLayout({ children, onLogout }) {
  return (
    <>
      <Navbar onLogout={onLogout} />
      <div style={{ paddingTop: '55px', paddingBottom: '60px' }}>
        {children}
      </div>
      <FooterPag onLogout={onLogout} />
    </>
  );
}
