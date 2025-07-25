import React, { useEffect, useRef, useState } from 'react';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { confirmDialog } from 'primereact/confirmdialog';
import { TabView, TabPanel } from 'primereact/tabview';

import { supabase } from '../../supabaseClient';
import Table from '../../components/Table';
import Loading from '../../components/Loading';
import { useUser } from '../../context/UserContext';
import CalendarMonth from '../../components/CalendarMonth';
import getLocalDateTimeString from '../../utils/funciones';

export default function CreditosScreen() {
  const [data, setData] = useState([]);
  const [dataPagados, setDataPagados] = useState([]);
  const { user } = useUser();
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

  const getInfo = async () => {
    setLoading(true);

    let query = supabase.from('vta_creditos').select('*').eq('IdStatus', 5);
    let query1 = supabase.from('vta_creditos_pagados').select('*');

    if (rangeDates && rangeDates[0] && rangeDates[1]) {
      const from = new Date(rangeDates[0]);
      const to = new Date(rangeDates[1]);
      to.setHours(23, 59, 59, 999);

      query = query.gte('Date', from.toISOString()).lte('Date', to.toISOString());
      query1 = query1.gte('Date', from.toISOString()).lte('Date', to.toISOString());
    }

    const { data, error } = await query;
    const { data: data1 } = await query1;
    setDataPagados(data1)

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
        detail: `No se encontró un producto con código: ${codigo}`,
        life: 3000,
      });
      return;
    }
  };

  const columns = [
    { field: 'IdSalida', Header: 'ID', center: true, className: 'XxSmall', filterMatchMode: 'equals', hidden: user?.IdRol !== 1 },
    { field: 'Date', Header: 'Fecha', center: true, format: 'Date', className: 'Medium', filterMatchMode: 'contains' },
    { field: 'Code', Header: 'Código', center: true, format: 'text', className: 'Medium', filterMatchMode: 'equals', count: true },
    { field: 'Name', Header: 'Producto', center: false, format: 'text', className: 'XxLarge', filterMatchMode: 'contains' },
    { field: 'NombreCompleto', Header: 'Cliente', center: false, format: 'text', filterMatchMode: 'contains', className: 'XxLarge' },
    { field: 'UserName', Header: 'Usuario', center: false, format: 'text', filterMatchMode: 'contains', className: 'XxSmall' },
    { field: 'CantidadSalida', Header: 'Cantidad', center: true, format: 'number', className: 'Small', filterMatchMode: 'equals', summary: true },
    { field: 'UnitName', Header: 'Unidad', className: 'Small', filterMatchMode: 'equals', summary: true },
    { field: 'PrecioVenta', Header: 'Precio Venta', center: true, format: 'number', prefix: 'L ', className: 'Small', filterMatchMode: 'equals' },
    { field: 'SubTotal', Header: 'SubTotal', center: true, format: 'number', prefix: 'L ', className: 'Small', filterMatchMode: 'equals', summary: true },
    { field: 'ISVQty', Header: 'ISV', center: true, format: 'number', className: 'Small', prefix: 'L ', filterMatchMode: 'equals', summary: true },
    { field: 'Total', Header: 'Total', center: true, format: 'number', className: 'Small', prefix: 'L ', filterMatchMode: 'equals', summary: true },
    {
      field: 'actions',
      isIconColumn: true,
      icon: 'pi pi-dollar',
      center: true,
      className: 'XxxSmall',
      frozen: true,
      filter: false,
      onClick: (rowData) => {
        confirmDialog({
          message: (
            <>
              ¿Estás seguro que quieres pagar el crédito del cliente <strong>{rowData?.NombreCompleto}</strong>?<br />
              Cantidad: <strong>L {rowData?.Total}</strong>
            </>
          ),
          header: 'Confirmar Pago',
          icon: 'pi pi-exclamation-triangle',
          acceptLabel: 'Aceptar',
          rejectLabel: 'Cancelar',
          accept: async () => {
            pagarCredito(rowData);
          },
        });
      },
    },
  ];
  
  const columnsPagados = [
    { field: 'IdSalida', Header: 'ID', center: true, className: 'XxSmall', filterMatchMode: 'equals', hidden: user?.IdRol !== 1 },
    { field: 'Date', Header: 'Fecha', center: true, format: 'Date', className: 'Medium', filterMatchMode: 'contains' },
    { field: 'Code', Header: 'Código', center: true, format: 'text', className: 'Medium', filterMatchMode: 'equals', count: true },
    { field: 'Name', Header: 'Producto', center: false, format: 'text', className: 'XxLarge', filterMatchMode: 'contains' },
    { field: 'NombreCompleto', Header: 'Cliente', center: false, format: 'text', filterMatchMode: 'contains', className: 'XxLarge' },
    { field: 'UserName', Header: 'Usuario', center: false, format: 'text', filterMatchMode: 'contains', className: 'XxSmall' },
    { field: 'CantidadSalida', Header: 'Cantidad', center: true, format: 'number', className: 'Small', filterMatchMode: 'equals', summary: true },
    { field: 'UnitName', Header: 'Unidad', className: 'Small', filterMatchMode: 'equals', summary: true },
    { field: 'PrecioVenta', Header: 'Precio Venta', center: true, format: 'number', prefix: 'L ', className: 'Small', filterMatchMode: 'equals' },
    { field: 'SubTotal', Header: 'SubTotal', center: true, format: 'number', prefix: 'L ', className: 'Small', filterMatchMode: 'equals', summary: true },
    { field: 'ISVQty', Header: 'ISV', center: true, format: 'number', className: 'Small', prefix: 'L ', filterMatchMode: 'equals', summary: true },
    { field: 'Total', Header: 'Total', center: true, format: 'number', className: 'Small', prefix: 'L ', filterMatchMode: 'equals', summary: true },
    {
      field: 'StatusName',
      Header: 'Estado',
      format: 'badge',
      center: true,
      className: 'Small',
    },
  ];

  const pagarCredito = async (rowData) => {
    setLoading(true);

    const Datos = {
      IdProduct: rowData?.IdProduct,
      PrecioVenta: rowData?.PrecioVenta,
      IdStatus: 5,
      IdUserEdit: user?.IdUser,
      Date: getLocalDateTimeString(),
      CantidadSalida: rowData?.CantidadSalida,
      IdTipoSalida: 1,
      SubTotal: rowData?.SubTotal,
      Total: rowData?.Total,
      ISVQty: rowData?.ISVQty,
      IdCliente: rowData?.IdCliente,
      IdCurrency: 1,
      IdSalidaCredito: rowData?.IdSalida,
      PagoCredito: true,
    };

    const DatosSalidaA = {
      IdStatus: 7,
      IdUserEdit: user?.IdUser,
      Date: getLocalDateTimeString(),
    };

    const { error: errorUpdate } = await supabase.from('Salidas').update(DatosSalidaA).eq('IdSalida', rowData?.IdSalida);
    const { error } = await supabase.from('Salidas').insert([Datos]);

    if (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo guardar el pago',
        life: 4000,
      });
    } else {
      toast.current?.show({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Pago guardado correctamente',
        life: 4000,
      });
      getInfo();
    }

    setLoading(false);
  };

  useEffect(() => {
    getInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangeDates]);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [data]);

  useEffect(() => {
    document.title = 'Sumo - Créditos';
  }, []);

  return (
    <div>
      <Toast ref={toast} />
      <TabView style={{marginTop: '3rem'}}>
        <TabPanel header="Créditos">
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
              <Button icon="pi pi-refresh" className="p-button-success" severity="primary" onClick={getInfo} disabled={loading} />
            </div>
          </div>

          <Table columns={columns} data={data} globalFilter={globalFilter} />
          {loading && <Loading message="Cargando..." />}
        </TabPanel>

        <TabPanel header="Créditos Pagados">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <InputText
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Buscar por código"
              className="p-inputtext-sm"
              style={{ width: '300px' }}
            />
            <CalendarMonth
              rangeDates={rangeDates}
              setRangeDates={setRangeDates}
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonth}
            />

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button icon="pi pi-refresh"  className="p-button-success" severity='primary' onClick={getInfo} disabled={loading} />
            </div>
          </div>

          <Table columns={columnsPagados} data={dataPagados} globalFilter={globalFilter} />
        </TabPanel>
      </TabView>
    </div>
  );
}
