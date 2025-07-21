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
  const { login } = useUser(); // Contexto de usuario

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
      login(data); // Guardamos el usuario en el contexto
      navigate('/Dashboard');
    }
  };

  return (
    <div className="login-wrapper">
      <Card className="login-card">
        <div className="login-header">
          <img
            src="https://www.gstatic.com/images/branding/product/1x/googleg_32dp.png"
            alt="logo"
            className="login-logo"
          />
          <h2 className="login-title">Iniciar Sesión</h2>
          <p style={{ color: '#555', fontSize: '14px' }}>
            Accede a tu cuenta de Sumo ERP
          </p>
        </div>

        <div className="p-field mb-3" style={{ marginBottom: '1rem' }}>
          <label htmlFor="username" className="login-label">Usuario</label>
          <InputText
            id="username"
            placeholder="Ingresa tu usuario"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            className="login-input"
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
            className="login-input"
          />
        </div>

        {error && <p className="login-error">{error}</p>}

        <Button
          label="Ingresar"
          icon="pi pi-sign-in"
          onClick={handleLogin}
          className="p-button-primary"
          style={{ width: '100%' }}
          severity="primary"
        />
      </Card>
    </div>
  );
}
