import React, { useEffect, useRef, useState } from 'react';
import Table from '../../components/Table';
import { supabase } from '../../supabaseClient';
import Loading from '../../components/Loading';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import ModalImage from '../../components/ModalImage';
import { Toast } from 'primereact/toast';
import StockBajoReporte from './StockBajoReporte';

export default function StockBajoScreen() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const toast = useRef(null);
  const [globalFilter, setGlobalFilter] = useState('');
  const [selected, setSelected] = useState([]);
  const [showDialogImage, setShowDialogImage] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [showDialogReporte, setShowDialogReporte] = useState(false);

  const getInfo = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('vta_productos_bajo_stock').select('*')
    
    if (!error) {
      setData(data);
      setFilteredData(data); 
    }
    setLoading(false);
  };


  const columns = [
    {
      field: 'Code',
      Header: 'Código',
      center: true,
      frozen: true,
      format: 'text',
      className: 'XxxSmall',
      filterMatchMode: 'equals',
      count: true,
    },
    {
      field: 'Name',
      Header: 'Producto',
      format: 'text',
      className: 'Xxlarge',
    },
    {
      field: 'categoryname',
      Header: 'Categoría',
      center: false,
      frozen: false,
      format: 'text',
      className: 'XxxSmall',
      filterMatchMode: 'contains',
    },
    {
      field: 'TotalUnidades',
      Header: 'Stock',
      format: 'number',
      className: 'XxSmall',
      styleEvaluator: (row) =>
        row.TotalUnidades < 5
          ? { backgroundColor: '#ffe0e0', color: 'red' }
          : undefined,
      summary: true,
    },
    {
      field: 'UnitName',
      Header: 'Unidad',
      format: 'text',
      className: 'XxxSmall',
    },
    {
      field: 'actions',
      isIconColumn: true,
      icon: 'pi pi-image',
      center: true,
      className: 'XxxSmall',
      tooltip: 'Ver imagen',
      filter: false,
      onClick: (rowData) => {
        setSelected([rowData]);
        setShowDialogImage(true);
      },
    },
  ];

  useEffect(() => {
    getInfo();
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
    document.title = 'Sumo - StockBajo';
  }, []);

  return (
    <>
      <Toast ref={toast} />
      <div className="dashboard-container">
        <h2 style={{ textAlign: 'center' }}>Stock Bajo</h2>

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
                icon="pi pi-print"
                className="p-button-success"
                onClick={()=> setShowDialogReporte(true)}
                disabled={loading}
                severity="primary"
                tooltip='Imprimir'
                tooltipOptions={{position: 'left'}}
              />
              <Button
                icon="pi pi-refresh"
                className="p-button-success"
                onClick={getInfo}
                disabled={loading}
                severity="primary"
                tooltip='Recargar'
                tooltipOptions={{position: 'left'}}
              />
            </div>
          </div>
        <Table columns={columns} data={filteredData} />
        {loading && <Loading message="Cargando inventario..." />}
      </div>

      {showDialogImage && (
        <ModalImage
          selected={selected}
          setSelected={setSelected}
          showDialogImage={showDialogImage}
          setShowDialogImage={setShowDialogImage}
        />
      )}

      {showDialogReporte && (
        <StockBajoReporte
          showDialog={showDialogReporte}
          setShowDialog={setShowDialogReporte}
          data={data}
        />
      )}
    </>
  );
}
