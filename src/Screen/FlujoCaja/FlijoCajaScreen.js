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

export default function FlujoCajaScreen() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const toast = useRef(null);
  const [globalFilter, setGlobalFilter] = useState('');
  const [filteredData, setFilteredData] = useState([]);

  const getInfo = async () => {
    setLoading(true);
    const { data, error } = await supabase
    .from('vta_flujocaja')
    .select('*')
    
    if (!error) {
      setData(data);
      setFilteredData(data); 
    }
    setLoading(false);
  };


    const columns = [
        {
            field: 'Date',
            Header: 'Fecha',
            center: true,
            frozen: false,
            format: 'Date',
            className: 'XxxSmall',
            filterMatchMode: 'contains',
        },
        {
            field: 'Entradas',
            Header: 'Egreso',
            prefix: 'L ',
            format: 'number',
            className: 'XxSmall',
            summary: true,
        },
        {
            field: 'Salidas',
            Header: 'Ingreso',
            prefix: 'L ',
            format: 'number',
            className: 'XxSmall',
            summary: true,
        },
    ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    getInfo();
  }, []);


  useEffect(() => {
    document.title = 'Sumo - Fujo de Caja';
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
                onClick={getInfo}
                disabled={loading}
                severity="primary"
              />
            </div>
          </div>
        <Table columns={columns} data={filteredData} />
        {loading && <Loading message="Cargando ..." />}
      </div>
    </>
  );
}
