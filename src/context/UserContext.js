import React, { createContext, useState, useEffect, useContext } from 'react';

// Crear el contexto
const UserContext = createContext(null);

// Componente proveedor
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Al iniciar, cargamos el usuario del localStorage si existe
  useEffect(() => {
    const storedUser = localStorage.getItem('usuario');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Función para iniciar sesión
  const login = (userData) => {
    localStorage.setItem('usuario', JSON.stringify(userData));
    setUser(userData);
  };

  // Función para cerrar sesión
  const logout = () => {
    localStorage.removeItem('usuario');
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

// Hook personalizado para usarlo más fácil
export const useUser = () => useContext(UserContext);
