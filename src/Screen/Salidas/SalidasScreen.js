import React, { useEffect, useRef, useState } from 'react';
import Navbar from '../../components/Navbar';
import { supabase } from '../../supabaseClient';
import Table from '../../components/Table';
import { Button } from 'primereact/button';
import Loading from '../../components/Loading';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { useUser } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';
import CalendarMonth from '../../components/CalendarMonth';

export default function SalidasScreen() {
  const [data, setData] = useState([]);
  const { user, logout } = useUser();
  const [showDialog, setShowDialog] = useState(false);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rangeDates, setRangeDates] = useState(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return [firstDay, lastDay];
  });
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [globalFilter, setGlobalFilter] = useState('');
  const inputRef = useRef(null);
  const toast = useRef(null);
  const navigate = useNavigate();

  const getInfo = async () => {
    setLoading(true);

    let query = supabase.from('vta_salidas').select('*').eq('IdStatus', 3);

    if (rangeDates && rangeDates[0] && rangeDates[1]) {
      const from = new Date(rangeDates[0]);
      const to = new Date(rangeDates[1]);
      to.setHours(23, 59, 59, 999);

      query = query.gte('Date', from.toISOString()).lte('Date', to.toISOString());
    }

    const { data, error } = await query;

    if (!error) setData(data);
    else {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.message,
        life: 3000,
      });
    }

    setLoading(false);
  };

  const buscarProductoPorCodigo = async (codigo) => {
    const { data: producto, error } = await supabase
      .from('vta_products')
      .select('*')
      .eq('Code', codigo.trim())
      .eq('IdStatus', 1)
      .single();

    if (error || !producto) {
      toast.current?.show({
        severity: 'warn',
        summary: 'No encontrado',
        detail: `No se encontró el producto con código: ${codigo}`,
        life: 3000,
      });
      return;
    }

    setSelected([producto]);
    setShowDialog(true);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const columns = [
    { field: 'IdSalida', Header: 'ID', center: true, className: 'XxSmall', filterMatchMode: 'equals',  hidden: user?.IdRol !==1 },
    { field: 'Date', Header: 'Fecha', center: true, format: 'Date', className: 'Medium', filterMatchMode: 'contains' },
    { field: 'Code', Header: 'Código', center: true, format: 'text', className: 'Large', filterMatchMode: 'equals' },
    { field: 'ProductName', Header: 'Producto', center: false, format: 'text', filterMatchMode: 'contains' },
    { field: 'NombreCompleto', Header: 'Cliente', center: false, format: 'text', filterMatchMode: 'contains' },
    { field: 'UserName', Header: 'Usuario', center: false, format: 'text', filterMatchMode: 'contains' },
    { field: 'Descripcion', Header: 'Descripción', center: false, format: 'text', filterMatchMode: 'contains' },
    { field: 'CantidadSalida', Header: 'Cantidad', center: true, format: 'number', className: 'Small', filterMatchMode: 'equals' },
    { field: 'PrecioVenta', Header: 'Precio Venta', center: true, format: 'money', className: 'Small', filterMatchMode: 'equals' },
    // { field: 'PrecioVentaEntrada', Header: 'Precio Entrada', center: true, format: 'money', className: 'Small', filterMatchMode: 'equals' },
  ];

  useEffect(() => {
    getInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangeDates]);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [data]);

  useEffect(() => {
    document.title = 'Sumo - Salidas';
  }, []);

  return (
    <>
      <Navbar onLogout={handleLogout} />
      <div className="dashboard-container" style={{ paddingTop: '50px' }}>
        <h2 style={{ textAlign: 'center' }}>Salidas</h2>
        <Toast ref={toast} />

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <InputText
            inputRef={inputRef}
            type="search"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Buscar por código (lector)"
            className="p-inputtext-sm"
            style={{ width: '300px' }}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') buscarProductoPorCodigo(globalFilter);
            }}
          />

          <CalendarMonth
            rangeDates={rangeDates}
            setRangeDates={setRangeDates}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
          />

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button icon="pi pi-refresh"  className="p-button-success" severity='primary' onClick={getInfo} disabled={loading} />
            <Button
              label="Agregar Salida"
              icon="pi pi-plus"
              severity='primary'
              className="p-button-success"
              onClick={() => {
                setSelected([]);
                setShowDialog(true);
              }}
            />
          </div>
        </div>

        <Table columns={columns} data={data} globalFilter={globalFilter} />

        {loading && <Loading message="Cargando salidas..." />}
      </div>

      {/* Dialogo para CRUD de salidas (comentado) */}
      {showDialog && (
        <>
          {/* 
          <CRUDSalidas
            setShowDialog={setShowDialog}
            showDialog={showDialog}
            setSelected={setSelected}
            selected={selected}
            getInfo={getInfo}
          /> 
          */}
        </>
      )}
    </>
  );
}
