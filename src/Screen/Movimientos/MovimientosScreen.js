import React, { useEffect, useRef, useState } from 'react';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';

import Table from '../../components/Table';
import { supabase } from '../../supabaseClient';
import Loading from '../../components/Loading';
import CalendarMonth from '../../components/CalendarMonth';

export default function MovimientosScreen() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState('');
  const inputRef = useRef(null);
  const toast = useRef(null);
  const [rangeDates, setRangeDates] = useState(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return [firstDay, lastDay];
  });
  const [selectedMonth, setSelectedMonth] = useState(null);

  const getInfo = async () => {
    setLoading(true);

    let query = supabase.from('vta_movimientos').select('*');

    if (rangeDates && rangeDates[0] && rangeDates[1]) {
      const from = new Date(rangeDates[0]);
      const to = new Date(rangeDates[1]);
      to.setHours(23, 59, 59, 999);

      query = query.gte('Date', from.toISOString()).lte('Date', to.toISOString());
    }

    const { data, error } = await query;
    if (!error) {
      setData(data);
      setFilteredData(data);
    } else {
      toast.current?.show({
        severity: 'error',
        summary: 'Error al cargar datos',
        detail: error.message,
        life: 3000,
      });
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

  // 🧠 Filtro por texto
  useEffect(() => {
    if (!globalFilter.trim()) {
      setFilteredData(data);
    } else {
      const filtered = data.filter((p) =>
        p.CodigoProducto?.toString().toLowerCase().includes(globalFilter.toLowerCase())
      );
      setFilteredData(filtered);
    }
  }, [globalFilter, data]);

  useEffect(() => {
    getInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangeDates]);

  useEffect(() => {
    document.title = 'Sumo - Movimientos';
  }, []);

  return (
    <>
      <Toast ref={toast} />
      <div className="dashboard-container">
        <h2 style={{ textAlign: 'center' }}>Movimientos</h2>

        {/* Filtros */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <InputText
            inputRef={inputRef}
            type="search"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Buscar por código (lector)"
            style={{ width: '300px' }}
          />

          <CalendarMonth
            rangeDates={rangeDates}
            setRangeDates={setRangeDates}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
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
        {loading && <Loading message="Cargando..." />}
      </div>
    </>
  );
}
