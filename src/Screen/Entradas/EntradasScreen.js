import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '../../supabaseClient';
import Table from '../../components/Table';
import { Button } from 'primereact/button';
import Loading from '../../components/Loading';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { useUser } from '../../context/UserContext';
import CRUDEntradas from './CRUDEntradas';
import getLocalDateTimeString from '../../utils/funciones';
import CalendarMonth from '../../components/CalendarMonth';
import CRUDProducts from '../Products/CRUDProducts';

export default function EntradasScreen() {
  const [data, setData] = useState([]);
  const { user } = useUser();
  const [showDialog, setShowDialog] = useState(false);
  const [showDialogProducto, setShowDialogProducto] = useState(false);
  const [showDialogStatus, setShowDialogStatus] = useState(false);
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

  const getInfo = async () => {
    setLoading(true);

    let query = supabase.from('vta_entradas').select('*').eq('IdStatus', 3);

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


  const cambiarEstadoEntrada = async () => {
    if (!selected[0]?.IdEntrada) return;

    const IdProduct = selected[0]?.IdProduct;
    const cantidadEliminar = selected[0]?.Cantidad;
    const fechaEntrada = new Date(selected[0]?.Date);
    const hoy = new Date();
    const limite = new Date(hoy);
    limite.setDate(hoy.getDate() - 3);

    if (fechaEntrada < limite) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se puede eliminar una entrada mayor a 3 días',
        life: 4000,
      });
      return;
    }

    const { data: productData, error: errorStock } = await supabase
      .from('vta_inventario')
      .select('TotalUnidades')
      .eq('IdProduct', IdProduct)
      .single();

    if (errorStock) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al consultar stock del producto',
        life: 4000,
      });
      return;
    }

    if (productData?.Stock < cantidadEliminar) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No hay suficiente cantidad en stock. No se puede eliminar.',
        life: 4000,
      });
      return;
    }

    const { error } = await supabase
      .from('Entradas')
      .update({
        IdStatus: 4,
        IdUserCreate: user?.IdUser,
        Date: getLocalDateTimeString(),
      })
      .eq('IdEntrada', selected[0].IdEntrada);

    if (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.message,
        life: 3000,
      });
      return;
    }
    setTimeout(() => {
      getInfo();
      setShowDialogStatus(false);
      setSelected([]);
    }, 800);
  };

  const columns = [
    {
      field: 'IdEntrada',
      Header: 'ID',
      center: true,
      frozen: true,
      className: 'XxSmall',
      filterMatchMode: 'equals',
    },
    {
      field: 'Date',
      Header: 'Fecha',
      center: true,
      frozen: false,
      format: 'Date',
      className: 'Medium',
      filterMatchMode: 'contains',
    },
    {
      field: 'Code',
      Header: 'Codigo',
      center: true,
      frozen: true,
      format: 'text',
      className: 'Large',
      filterMatchMode: 'equals',
      count: true
    },
    {
      field: 'ProductName',
      Header: 'Producto',
      center: false,
      frozen: false,
      format: 'text',
      filterMatchMode: 'contains',
    },
    {
      field: 'VendorName',
      Header: 'Proveedor',
      center: false,
      frozen: false,
      format: 'text',
      filterMatchMode: 'contains',
    },
    // {
    //   field: 'Description',
    //   Header: 'Descripción',
    //   center: false,
    //   frozen: false,
    //   format: 'text',
    //   filterMatchMode: 'contains',
    // },
    // {
    //   field: 'Currency',
    //   Header: 'Moneda',
    //   center: false,
    //   frozen: false,
    //   format: 'text',
    //   filterMatchMode: 'contains',
    // },
    {
      field: 'PrecioCompra',
      Header: 'Precio Compra',
      center: false,
      frozen: false,
      format: 'number',
      className: 'Small',
      filterMatchMode: 'equals',
      hidden: user?.IdRol === 1 && user?.IdRol === 2,
      prefix: 'L '
    },
    {
      field: 'ISV',
      Header: 'ISV',
      center: false,
      frozen: false,
      format: 'number',
      className: 'Small',
      filterMatchMode: 'equals',
      hidden: user?.IdRol === 1 && user?.IdRol === 2,
      suffix: ' %',
    },
    {
      field: 'PorcentajeGanancia',
      Header: 'Porcentaje Ganancia',
      center: false,
      frozen: false,
      format: 'number',
      suffix: ' %',
      className: 'Small',
      filterMatchMode: 'equals',
      hidden: user?.IdRol === 1 && user?.IdRol === 2,
    },
    {
      field: 'PrecioVenta',
      Header: 'Precio Venta',
      center: false,
      frozen: false,
      format: 'number',
      className: 'Small',
      filterMatchMode: 'equals',
      prefix: 'L '
    },
    {
      field: 'UserNameCreate',
      Header: 'Usuario Creacion',
      center: false,
      frozen: false,
      format: 'text',
      className: 'Small',
      filterMatchMode: 'contains',
    },
    {
      field: 'Cantidad',
      Header: 'Cantidad',
      center: false,
      frozen: false,
      format: 'number',
      className: 'Small',
      filterMatchMode: 'equals',
      summary: true,
    },
    {
      field: 'UnitName',
      Header: 'Unidad',
      center: false,
      frozen: false,
      format: 'text',
      className: 'XxSmall',
      filterMatchMode: 'contains',
    },
    {
      field: 'StatusName',
      Header: 'Estado',
      format: 'badge',
      center: true,
      className: 'Small',
      frozen: true,
      alignFrozen: 'right',
      valueField: 'StatusName',
      onClick: (rowData) => {
        if(rowData?.IdStatus === 3){
          setSelected([rowData]);
          setShowDialogStatus(true);
        }
      },
    }
  ];

  useEffect(() => {
    getInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangeDates]);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [data]);

  useEffect(() => {
    document.title = 'Sumo - Entradas';
  }, []);

  return (
    <>
      <div className="dashboard-container">
        <h2 style={{ textAlign: 'center' }}>Entradas</h2>
        <Toast ref={toast} />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '1rem',
          }}
        >

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
              if (e.key === 'Enter') {
                buscarProductoPorCodigo(globalFilter);
              }
            }}
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
            <Button
              label="Agregar Entrada"
              icon="pi pi-plus"
              className="p-button-success"
              severity="primary"
              onClick={() => {
                setSelected([]);
                setShowDialog(true);
              }}
            />
            <Button
              label="Agregar Producto"
              icon="pi pi-plus"
              className="p-button-success"
              severity="primary"
              onClick={() => {
                setShowDialogProducto(true)
              }}
            />
          </div>
        </div>

        <Table columns={columns} data={data} globalFilter={globalFilter} />

        {loading && <Loading message="Cargando entradas..." />}
      </div>

      {showDialogStatus && (
        <>
          <Toast ref={toast} />
          <Dialog
            visible={showDialogStatus}
            onHide={() => {
              setShowDialogStatus(false);
              setSelected([]);
            }}
            header="Cambiar Estado"
            footer={
              <>
                <Button
                  label="Aceptar"
                  icon="pi pi-check"
                  className="p-button-danger"
                  onClick={() => {
                    cambiarEstadoEntrada();
                  }}
                />
                <Button
                  label="Cancelar"
                  icon="pi pi-times"
                  className="p-button-text"
                  onClick={() => {
                    setShowDialogStatus(false);
                    setSelected([]);
                  }}
                />
              </>
            }
          >
            <h4>
              {`¿Está seguro de eliminar la entrada de: ${selected[0]?.ProductName}?`}
            </h4>
          </Dialog>
        </>
      )}

      {showDialog && (
        <CRUDEntradas
          setShowDialog={setShowDialog}
          showDialog={showDialog}
          setSelected={setSelected}
          selected={selected}
          getInfo={getInfo}
        />
      )}

      {showDialogProducto && (
        <CRUDProducts
          setShowDialog={setShowDialogProducto}
          showDialog={showDialogProducto}
          setSelected={() => {}}
          selected={[]}
          getInfo={getInfo}
        />
      )}
    </>
  );
}
