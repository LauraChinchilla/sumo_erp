import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { supabase } from '../../supabaseClient';
import Table from '../../components/Table';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';
import CRUDProducts from './CRUDProducts';

export default function Productos() {
  const [data, setData] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [selected, setSelected] = useState([]);
  const navigate = useNavigate();
  
  const getInfo = async () => {
    const { data, error } = await supabase.from('Products').select('*');
    if (!error) setData(data);
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
  ];

  useEffect(() => {
    getInfo();
  }, []);

  return (
    <>
      <Navbar />
      <div className="dashboard-container" style={{ paddingTop: '80px' }}>
        <h2 style={{ textAlign: 'center' }}>Productos</h2>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <Button
            label="Agregar Producto"
            icon="pi pi-plus"
            className="p-button-success"
            onClick={() => setShowDialog(true)} 
          />
        </div>
        <Table columns={columns} data={data} />
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
