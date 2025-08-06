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
import { FloatLabel } from 'primereact/floatlabel';
import { Dropdown } from 'primereact/dropdown';
import formatNumber from '../../utils/funcionesFormatNumber';

export default function CreditosScreen() {
  const [data, setData] = useState([]);
  const [dataPagados, setDataPagados] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [data2, setData2] = useState([]);
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
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const toast = useRef(null);

  const getInfo = async () => {
    setLoading(true);

    if(activeIndex === 1 || activeIndex === 0){
      let query = supabase.from('vta_creditos').select('*').eq('IdStatus', 5).eq('PagoCredito', false);
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
    }else if(activeIndex === 2){
      if(!clienteSeleccionado){
        toast.current?.show({
          severity: 'warn',
          summary: 'Advertencia',
          detail: 'Seleccione el cliente',
          life: 4000,
        });
      }
      let query = supabase.from('vta_clientes_deudores').select('*');
      const { data, error } = await query;
      if(!error) setClientes(data)
 
      if(data.length <= 0){
        toast.current?.show({
          severity: 'warn',
          summary: 'Advertencia',
          detail: 'No tienes facturas pendientes para cobrar a ningun cliente',
          life: 4000,
        });
      }
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
    { field: 'UnitName', Header: 'Unidad', className: 'Small', filterMatchMode: 'equals' },
    { field: 'PrecioVenta', Header: 'Precio Venta', center: true, format: 'number', prefix: 'L ', className: 'Small', filterMatchMode: 'equals' },
    { field: 'SubTotal', Header: 'SubTotal', center: true, format: 'number', prefix: 'L ', className: 'Small', filterMatchMode: 'equals', summary: true },
    { field: 'ISVQty', Header: 'ISV', center: true, format: 'number', className: 'Small', prefix: 'L ', filterMatchMode: 'equals', summary: true },
    { field: 'Total', Header: 'Total', center: true, format: 'number', className: 'Small', prefix: 'L ', filterMatchMode: 'equals', summary: true },
    // {
    //   field: 'actions',
    //   isIconColumn: true,
    //   icon: 'pi pi-dollar',
    //   center: true,
    //   className: 'XxxSmall',
    //   frozen: true,
    //   filter: false,
    //   onClick: (rowData) => {
    //     confirmDialog({
    //       message: (
    //         <>
    //           ¿Estás seguro que quieres pagar el crédito del cliente <strong>{rowData?.NombreCompleto}</strong>?<br />
    //           Cantidad: <strong>L {rowData?.Total}</strong>
    //         </>
    //       ),
    //       header: 'Confirmar Pago',
    //       icon: 'pi pi-exclamation-triangle',
    //       acceptLabel: 'Aceptar',
    //       rejectLabel: 'Cancelar',
    //       accept: async () => {
    //         pagarCredito(rowData);
    //       },
    //     });
    //   },
    // },
  ];
  
  const columnsPagados = [
    { field: 'IdSalida', Header: 'ID', center: true, className: 'XxSmall', filterMatchMode: 'equals', hidden: user?.IdRol !== 1 },
    { field: 'Date', Header: 'Fecha', center: true, format: 'Date', className: 'Medium', filterMatchMode: 'contains' },
    { field: 'Code', Header: 'Código', center: true, format: 'text', className: 'Medium', filterMatchMode: 'equals', count: true },
    { field: 'Name', Header: 'Producto', center: false, format: 'text', className: 'XxLarge', filterMatchMode: 'contains' },
    { field: 'NombreCompleto', Header: 'Cliente', center: false, format: 'text', filterMatchMode: 'contains', className: 'XxLarge' },
    { field: 'UserName', Header: 'Usuario', center: false, format: 'text', filterMatchMode: 'contains', className: 'XxSmall' },
    { field: 'CantidadSalida', Header: 'Cantidad', center: true, format: 'number', className: 'Small', filterMatchMode: 'equals', summary: true },
    { field: 'UnitName', Header: 'Unidad', className: 'Small', filterMatchMode: 'equals' },
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


  const buscarSalidasPorCliente = async () => {
    let IdCliente = clienteSeleccionado
    let query = supabase.from('vta_salidas').select('*').eq('IdCliente', IdCliente).eq('IdStatus', 5).eq('IdTipoSalida', 3);
    const { data, error } = await query;
    if (!error) setData2(data);
    else {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.message,
        life: 3000,
      });
    }
  }

  const cobrarACliente = async () => {
    const NombreCompleto = data2[0]?.NombreCompleto || 'Proveedor';
    const cantidadFacturas = data2.length;
    const TotalAPagar = data2.reduce((acc, item) => acc + (parseFloat(item?.Total) || 0), 0);

    confirmDialog({
      message: `¿Está seguro que desea cobrar a **${NombreCompleto}** un total de ${cantidadFacturas} factura(s) por **L ${formatNumber(TotalAPagar)}**?`,
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: async () => {
        const IdSalidas = data2.map(i => i?.IdSalida);

        const { error } = await supabase
          .from('Salidas')
          .update({
            PagoCredito: true,
            IdUserCobro: user?.IdUser,
            Date: getLocalDateTimeString()
          })
          .in('IdSalida', IdSalidas);

        if (error) {
          console.error('Error al actualizar salidas:', error.message);
          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo completar el cobro',
            life: 4000,
          });
          return;
        }

        const datos = {
          IdTipoMovimiento: 2,
          IdCategoria: 6,
          Descripcion: `Cobro a cliente. Id: ${clienteSeleccionado} Nombre: ${NombreCompleto}`,
          Monto: TotalAPagar,
          IdStatus: 8,
          Date: getLocalDateTimeString(),
          IdUser: user?.IdUser,
        };
        const { error: error4 } = await supabase.from('CajaMovimientos').insert([datos]);
        if(error4){
          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: 'Se efectuo el cobro pero no se registro el movimiento de caja. Comunicate con soporte.',
            life: 3000,
          });
        }

        toast.current?.show({
          severity: 'success',
          summary: 'Cobro registrado',
          detail: 'Facturas marcadas como pagadas',
          life: 3000,
        });

        getInfo();
        setClienteSeleccionado(null);
        setData2([])
      },
    });
  }

  const columns2 = [
    { field: 'IdSalida', Header: 'ID', center: true, className: 'XxSmall', filterMatchMode: 'equals', hidden: user?.IdRol !== 1 },
    { field: 'Date', Header: 'Fecha', center: true, format: 'Date', className: 'Medium', filterMatchMode: 'contains' },
    { field: 'Code', Header: 'Código', center: true, format: 'text', className: 'Medium', filterMatchMode: 'equals', count: true },
    { field: 'Name', Header: 'Producto', center: false, format: 'text', className: 'XxLarge', filterMatchMode: 'contains' },
    { field: 'NombreCompleto', Header: 'Cliente', center: false, format: 'text', filterMatchMode: 'contains', className: 'XxLarge' },
    { field: 'UserName', Header: 'Usuario', center: false, format: 'text', filterMatchMode: 'contains', className: 'XxSmall' },
    { field: 'CantidadSalida', Header: 'Cantidad', center: true, format: 'number', className: 'Small', filterMatchMode: 'equals', summary: true },
    { field: 'UnitName', Header: 'Unidad', className: 'Small', filterMatchMode: 'equals' },
    { field: 'PrecioVenta', Header: 'Precio Venta', center: true, format: 'number', prefix: 'L ', className: 'Small', filterMatchMode: 'equals' },
    { field: 'SubTotal', Header: 'SubTotal', center: true, format: 'number', prefix: 'L ', className: 'Small', filterMatchMode: 'equals', summary: true },
    { field: 'ISVQty', Header: 'ISV', center: true, format: 'number', className: 'Small', prefix: 'L ', filterMatchMode: 'equals', summary: true },
    { field: 'Total', Header: 'Total', center: true, format: 'number', className: 'Small', prefix: 'L ', filterMatchMode: 'equals', summary: true },
  ];

  useEffect(() => {
    getInfo();
    setClienteSeleccionado(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangeDates, activeIndex]);

  
  useEffect(() => {
    if(clienteSeleccionado){
      buscarSalidasPorCliente()
    }else{
      setData2([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clienteSeleccionado]);
  

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [data]);

  useEffect(() => {
    document.title = 'Sumo - Créditos';
  }, []);

  return (
    <div>
      <Toast ref={toast} />
      <TabView
        style={{ marginTop: "3rem" }}
        activeIndex={activeIndex}
        onTabChange={(e) => setActiveIndex(e.index)}
      >
        <TabPanel header="Créditos">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "1rem",
            }}
          >
            <InputText
              inputRef={inputRef}
              type="search"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Buscar por código (lector)"
              className="p-inputtext-sm"
              style={{ width: "300px" }}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") buscarProductoPorCodigo(globalFilter);
              }}
            />

            <CalendarMonth
              rangeDates={rangeDates}
              setRangeDates={setRangeDates}
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonth}
            />

            <div style={{ display: "flex", gap: "0.5rem" }}>
              <Button
                icon="pi pi-refresh"
                className="p-button-success"
                severity="primary"
                onClick={getInfo}
                disabled={loading}
              />
            </div>
          </div>

          <Table columns={columns} data={data} globalFilter={globalFilter} />
          {loading && <Loading message="Cargando..." />}
        </TabPanel>

        <TabPanel header="Créditos Pagados">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "1rem",
            }}
          >
            <InputText
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Buscar por código"
              className="p-inputtext-sm"
              style={{ width: "300px" }}
            />
            <CalendarMonth
              rangeDates={rangeDates}
              setRangeDates={setRangeDates}
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonth}
            />

            <div style={{ display: "flex", gap: "0.5rem" }}>
              <Button
                icon="pi pi-refresh"
                className="p-button-success"
                severity="primary"
                onClick={getInfo}
                disabled={loading}
              />
            </div>
          </div>

          <Table
            columns={columnsPagados}
            data={dataPagados}
            globalFilter={globalFilter}
          />
        </TabPanel>

        <TabPanel header="Créditos por Clientes">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "1rem",
            }}
          >
            <div
              style={{ display: "flex", gap: "2rem", alignItems: "flex-end" }}
            >
              <div style={{ flex: 1 }}>
                <FloatLabel>
                  <Dropdown
                    id="IdCliente"
                    value={clienteSeleccionado}
                    options={clientes}
                    onChange={(e) => setClienteSeleccionado(e.value)}
                    placeholder="Seleccione un cliente"
                    required
                    optionLabel="NombreCompleto"
                    optionValue="IdCliente"
                    style={{ width: "100%" }}
                    showClear
                  />
                  <label htmlFor="IdCliente">Cliente</label>
                </FloatLabel>
              </div>

              <Button
                icon="pi pi-dollar"
                label="Cobrar"
                className="p-button-success"
                onClick={cobrarACliente}
                disabled={data2?.length <= 0}
                severity="primary"
              />
            </div>

            <div style={{ display: "flex", gap: "0.5rem" }}>
              <Button
                icon="pi pi-refresh"
                className="p-button-success"
                onClick={getInfo}
                disabled={loading}
                severity="primary"
              />
            </div>
          </div>

          <Table columns={columns2} data={data2}/>

          {loading && <Loading message="Cargando..." />}
        </TabPanel>
      </TabView>
    </div>
  );
}
