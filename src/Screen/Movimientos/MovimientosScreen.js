import React, { useEffect, useRef, useState } from 'react';
import Navbar from '../../components/Navbar';
import Table from '../../components/Table';
import { supabase } from '../../supabaseClient';
import { useUser } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';
import Loading from '../../components/Loading';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';

export default function MovimientosScreen() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const toast = useRef(null);
  const [globalFilter, setGlobalFilter] = useState('');
  const [filteredData, setFilteredData] = useState([]);

  const getInventario = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('vta_movimientos').select('*');
    if (!error) {
      setData(data);
      setFilteredData(data); // <- esto
    }
    setLoading(false);
  };

  const columns = [
    {
      field: 'Tipo',
      Header: 'Tipo',
      format: 'text',
      className: 'XxSmall',
      center: true,
    },
    {
      field: 'Date',
      Header: 'Fecha',
      format: 'Date',
      className: 'Medium',
      center: true,
    },
    {
      field: 'CodigoProducto',
      Header: 'Código',
      format: 'text',
      className: 'XxSmall',
    },
    {
      field: 'Producto',
      Header: 'Producto',
      format: 'text',
      className: 'Large',
    },
    {
      field: 'Cantidad',
      Header: 'Cantidad',
      format: 'number',
      className: 'XxSmall',
      summary: true,
    },
    {
      field: 'PrecioUnitario',
      Header: 'Precio Unitario',
      format: 'number',
      className: 'Small',
      prefix: 'L ',
    },
    {
      field: 'Total',
      Header: 'Total',
      format: 'number',
      className: 'Small',
      summary: true,
      prefix: 'L ',
    },
    {
      field: 'Usuario',
      Header: 'Usuario',
      format: 'text',
      className: 'Small',
    },
    {
      field: 'Description',
      Header: 'Descripción',
      format: 'text',
      className: 'Large',
    },
  ];


  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    getInventario();
  }, []);

  useEffect(() => {
    if (!globalFilter.trim()) {
      setFilteredData(data); // Mostrar todo si el filtro está vacío
    } else {
      const filtered = data.filter(p =>
        p.Code?.toString().toLowerCase().includes(globalFilter.toLowerCase())
      );
      setFilteredData(filtered);
    }
  }, [globalFilter, data]);


  useEffect(() => {
    document.title = 'Sumo - Movimientos';
  }, []);

  return (
    <>
      <Navbar onLogaut={handleLogout} />
      <Toast ref={toast} />
      <div className="dashboard-container" style={{ paddingTop: '50px' }}>
        <h2 style={{ textAlign: 'center' }}>Inventario</h2>

          {/* Buscador y botones */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <InputText
              inputRef={inputRef}
              type="search"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Buscar por código (lector)"
              style={{ width: '300px' }}
            />

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button
                icon="pi pi-refresh"
                className="p-button-success"
                onClick={getInventario}
                disabled={loading}
                severity="primary"
              />
            </div>
          </div>
        <Table columns={columns} data={filteredData} />
        {loading && <Loading message="Cargando..." />}
      </div>


    </>
  );
}
