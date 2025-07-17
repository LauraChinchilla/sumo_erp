import React, { useEffect, useRef, useState } from 'react';
import Navbar from '../components/Navbar';
import Table from '../components/Table';
import { supabase } from '../supabaseClient';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import Loading from '../components/Loading';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import CRUDProducts from './Products/CRUDProducts';
import ModalImage from '../components/ModalImage';
import { Toast } from 'primereact/toast';

export default function InventarioScreen() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { logout } = useUser();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const toast = useRef(null);
  const [globalFilter, setGlobalFilter] = useState('');
  const [selected, setSelected] = useState([]);
  const [showDialogImage, setShowDialogImage] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [filteredData, setFilteredData] = useState([]);

  const getInventario = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('vta_products').select('*');
    if (!error) {
      setData(data);
      setFilteredData(data); // <- esto
    }
    setLoading(false);
  };

  const columns = [
    {
      field: 'Code',
      Header: 'Codigo',
      center: true,
      frozen: true,
      format: 'text',
      className: 'XxxSmall',
      filterMatchMode: 'equals',
    },
    { field: 'Name', Header: 'Producto', format: 'text', className: 'Xxlarge' },
    {
      field: 'Stock',
      Header: 'Disponible',
      format: 'number',
      className: 'Small',
      styleEvaluator: (row) =>
        row.Stock < 5
          ? { backgroundColor: '#ffe0e0', color: 'red' }
          : undefined,
    },
    { field: 'UnitName', Header: 'Unidad', format: 'text', className: 'Small' },
    {
      field: 'categoryname',
      Header: 'Categoria',
      center: false,
      frozen: false,
      filterMatchMode: 'contains',
      format: 'text',
      className: 'XxxSmall',
    },
    {
      field: 'actions',
      // Header: 'Acciones',
      isIconColumn: true,
      icon: 'pi pi-image',
      center: true,
      className: 'XxxSmall',
      tooltip: 'Ver imagen',
      filter: false,
      onClick: (rowData) => {
        setSelected([rowData]);
        setShowDialogImage(true);
      }
    }
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
        {loading && <Loading message="Cargando inventario..." />}
      </div>


      {showDialog && (
        <CRUDProducts
          setShowDialog={setShowDialog}
          showDialog={showDialog}
          setSelected={setSelected}
          selected={selected}
          getInfo={getInventario}
          editable={false}
        />
      )}

      {showDialogImage && (
        <ModalImage
          selected={selected}
          setSelected={setSelected}
          showDialogImage={showDialogImage}
          setShowDialogImage={setShowDialogImage}
        />
      )}
    </>
  );
}
