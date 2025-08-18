import React from 'react';
import { useNavigate } from 'react-router-dom';
import './NotFound.css';

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="notfound-wrapper">
      <div className="notfound-content">
        {/* Logo arriba */}
        <img
            src="https://mdexqdspobjpmzactfow.supabase.co/storage/v1/object/sign/sumologo/SumoLogo.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8yMGZkZDY3Yy0xODQ0LTRmZTktOTUwNS1mYTMyYjc2NzlhZjEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzdW1vbG9nby9TdW1vTG9nby5wbmciLCJpYXQiOjE3NTI2MDk5MDUsImV4cCI6MjA2Nzk2OTkwNX0.Q8pIdnjrePwj7RqyLLjHsQ7av4KhylSJVNZBC05s0fY"
          alt="Logo"
          className="notfound-logo"
        />

        <h1 className="notfound-title">404</h1>
        <p className="notfound-subtitle">¡Oops! No pudimos encontrar la página que buscas.</p>
        <button className="notfound-button" onClick={() => navigate('/')}>
          Volver al inicio
        </button>
      </div>
      <div className="notfound-stars">
        {[...Array(50)].map((_, i) => (
          <span key={i} className="star"></span>
        ))}
      </div>
    </div>
  );
}

export default NotFound;
