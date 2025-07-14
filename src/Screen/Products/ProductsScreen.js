import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { supabase } from '../../supabaseClient';
import Table from '../../components/Table';
import { Button } from 'primereact/button';
import CRUDProducts from './CRUDProducts';
import Loading from '../../components/Loading';  // Importa Loading

export default function Productos() {
  const [data, setData] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const getInfo = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('Products').select('*');
    if (!error) setData(data);
    setLoading(false);
  };

  const columns = [
    {
      field: 'IdProduct',
      Header: 'ID',
      center: true,
      frozen: true,
      format: 'number',
      className: 'XxSmall',
      filterMatchMode: 'equals',
    },
    {
      field: 'Code',
      Header: 'Codigo',
      center: true,
      frozen: true,
      format: 'text',
      className: 'Xxlarge',
      filterMatchMode: 'equals',
    },
    {
      field: 'Name',
      Header: 'Nombre',
      center: false,
      frozen: false,
      format: 'text',
      className: 'Xxlarge',
      filterMatchMode: 'contains',
    },
    {
      field: 'Description',
      Header: 'Descripcion',
      center: false,
      frozen: false,
      filterMatchMode: 'contains',
      format: 'text',
    },
    {
      field: 'actions',
      Header: 'Acciones',
      isIconColumn: true,
      icon: 'pi pi-pencil',
      center: true,
      className: 'Xsmall',
      filter: false,
      onClick: (rowData) => {
        setSelected([rowData]);
        setShowDialog(true);
      }
    }
  ];

  useEffect(() => {
    getInfo();
  }, []);

  return (
    <>
      <Navbar />
      <div className="dashboard-container" style={{ paddingTop: '50px' }}>
        <h2 style={{ textAlign: 'center' }}>Productos</h2>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem', gap: '0.5rem' }}>
          <Button
            icon="pi pi-refresh"
            className="p-button-success"
            onClick={getInfo} 
          />

          <Button
            label="Agregar Producto"
            icon="pi pi-plus"
            className="p-button-success"
            onClick={() => setShowDialog(true)} 
          />
        </div>

        <Table columns={columns} data={data} />

        {loading && <Loading message="Cargando productos..." />}
      </div>

      {showDialog && (
        <CRUDProducts
          setShowDialog={setShowDialog}
          showDialog={showDialog}
          setSelected={setSelected}
          selected={selected}
          getInfo={getInfo}
        />
      )}
    </>
  );
}
