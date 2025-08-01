import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Card } from 'primereact/card';

export default function Users() {
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    const { data, error } = await supabase.from("Users").select("*");
    if (error) console.error(error);
    else setUsuarios(data);
  };
  return (
    <div style={{ padding: "2rem" }}>
      <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Usuarios</h2>
      {usuarios.map((user) => (
        <Card
          key={user.IdUser}
          title={user.UserName}
          style={{ marginBottom: "1rem" }}
        >
          <p>
            <strong>Usuario:</strong> {user.Usuario}
          </p>
          <p>
            <strong>Creado:</strong>{" "}
            {new Date(user.DateCreate).toLocaleDateString()}
          </p>
        </Card>
      ))}
    </div>
  );
}
