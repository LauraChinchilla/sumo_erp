import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { useUser } from '../context/UserContext';

export default function Login() {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useUser();

  const handleLogin = async () => {
    setError('');

    const { data, error: queryError } = await supabase
      .from('vta_users')
      .select('*')
      .eq('Usuario', usuario)
      .eq('Password', password)
      .single();

    if (queryError || !data) {
      setError('Credenciales incorrectas');
    } else {
      login(data);
      navigate('/Dashboard');
    }
  };

  return (
    <div
      className="login-wrapper"
    >
      <Card className="login-card">
        <div className="login-header" style={{ textAlign: 'center' }}>
          <img
            alt="logo"
            src="https://mdexqdspobjpmzactfow.supabase.co/storage/v1/object/sign/sumologo/SumoLogo.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8yMGZkZDY3Yy0xODQ0LTRmZTktOTUwNS1mYTMyYjc2NzlhZjEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzdW1vbG9nby9TdW1vTG9nby5wbmciLCJpYXQiOjE3NTI2MDk5MDUsImV4cCI6MjA2Nzk2OTkwNX0.Q8pIdnjrePwj7RqyLLjHsQ7av4KhylSJVNZBC05s0fY"
            className="login-logo"
          />
          <h2 className="login-title">Iniciar Sesión</h2>
          <p style={{ color: '#555', fontSize: '14px' }}>
            Accede a tu cuenta de Sumo ERP
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="p-field mb-3" style={{ marginBottom: '1rem' }}>
              <label htmlFor="username" className="login-label">Usuario</label>
              <InputText
                id="username"
                placeholder="Ingresa tu usuario"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                className="login-input"
                style={{ width: 280 }}
              />
            </div>

            <div className="p-field mb-3" style={{ marginBottom: '1rem' }}>
              <label htmlFor="password" className="login-label">Contraseña</label>
              <Password
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                toggleMask
                feedback={false}
                className="login-pass"
                style={{ width: 280 }}
              />
            </div>

            {error && (
              <p style={{ color: 'red', fontSize: '13px', textAlign: 'center' }}>{error}</p>
            )}

            <Button
              label="Ingresar"
              icon="pi pi-sign-in"
              onClick={handleLogin}
              className="p-button-primary"
              style={{ width: 280, marginTop: '2rem' }}
            />
          </div>
        </div>
      </Card>

    </div>
  );
}