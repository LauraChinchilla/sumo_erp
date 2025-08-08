import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { FloatLabel } from 'primereact/floatlabel';
import { Dropdown } from 'primereact/dropdown';
import { confirmDialog } from 'primereact/confirmdialog';
import { TabPanel, TabView } from 'primereact/tabview';

import { supabase } from '../../supabaseClient';

import Table from '../../components/Table';
import CalendarMonth from '../../components/CalendarMonth';
import Loading from '../../components/Loading';
import getLocalDateTimeString from '../../utils/funciones';
import formatNumber from "../../utils/funcionesFormatNumber";

import { useUser } from '../../context/UserContext';
import CRUDProducts from '../Products/CRUDProducts';
import CRUDEntradas from './CRUDEntradas';
import ProveedoresCRUD from '../Maestros/ProveedoresCRUD';

export default function EntradasScreen() {
  const [data, setData] = useState([]);
  const [data2, setData2] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
  const { user } = useUser();
  const [showDialog, setShowDialog] = useState(false);
  const [showDialogProducto, setShowDialogProducto] = useState(false);
  const [showDialogProveedores, setShowDialogProveedores] = useState(false);
  const [showDialogStatus, setShowDialogStatus] = useState(false);
  const [selected, setSelected] = useState([]);
  const [selected1, setSelected1] = useState([]);
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
    if(activeIndex === 0){
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

    }else if(activeIndex === 1){
      if(!proveedorSeleccionado){
        toast.current?.show({
          severity: 'warn',
          summary: 'Advertencia',
          detail: 'Seleccione el proveedor',
          life: 4000,
        });
      }
      let query = supabase.from('vta_proveedores_pendientes_pago').select('*');
      const { data, error } = await query;
      if(!error) setProveedores(data)
 
      if(data.length <= 0){
        toast.current?.show({
          severity: 'warn',
          summary: 'Advertencia',
          detail: 'No tienes facturas pendientes para pagar con ningun proveedor',
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
      
    if (error || !producto) {confirmDialog({
      message: (
        <>
          No se encontró el producto con código: <strong>{codigo}</strong>,<br />
          ¿Desea agregarlo?
        </>
      ),
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: async () => {
        // Acción cuando acepta
        setShowDialogProducto(true)
      },
    });

      return;
    }

    setSelected([producto]);
    setShowDialog(true);
  };

  const buscarEntradasPorProveedor = async () => {
    let IdVendor = proveedorSeleccionado
    let query = supabase.from('vta_entradas').select('*').eq('IdVendor', IdVendor).eq('IdStatus', 3);
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

  const pagarFacturas = async () => {
    const VendorName = data2[0]?.VendorName || 'Proveedor';
    const cantidadFacturas = data2.length;
    const TotalAPagar = data2.reduce((acc, item) => acc + (parseFloat(item?.Total) || 0), 0);


    confirmDialog({
      message: `¿Está seguro que desea pagarle a **${VendorName}** un total de ${cantidadFacturas} factura(s) por **L ${formatNumber(TotalAPagar)}**?`,
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: async () => {
        const { data: data3, error: error3 } = await supabase.from('vta_resumen_caja').select('*');
        if (error3) {
          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo obtener el Saldo Actual',
            life: 4000,
          });
          return;
        }

        const SaldoActual = parseFloat(data3[0]?.SaldoActual || 0);
        const TotalAPagar = data2.reduce((acc, item) => acc + (parseFloat(item?.Total) || 0), 0);
        if (TotalAPagar > SaldoActual) {
          toast.current?.show({
            severity: 'warn',
            summary: 'Fondos insuficientes',
            detail: `El total a pagar (L ${TotalAPagar.toFixed(2)}) excede el saldo actual (L ${SaldoActual.toFixed(2)})`,
            life: 5000,
          });
          return;
        }

        const IdEntradas = data2.map(i => i?.IdEntrada);

        const { error } = await supabase
          .from('Entradas')
          .update({
            Pagado: true,
            IdUserPago: user?.IdUser,
          })
          .in('IdEntrada', IdEntradas);

        if (error) {
          console.error('Error al actualizar entradas:', error.message);
          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo completar el pago',
            life: 4000,
          });
          return;
        }

        const datos = {
          IdTipoMovimiento: 1,
          IdCategoria: 4,
          Descripcion: `Pago a proveedor. Id: ${proveedorSeleccionado}`,
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
            detail: 'Se efectuo el pago pero no se registro el movimiento de caja. Comunicate con soporte.',
            life: 3000,
          });
        }

        toast.current?.show({
          severity: 'success',
          summary: 'Pago registrado',
          detail: 'Facturas marcadas como pagadas',
          life: 3000,
        });

        getInfo();
        setProveedorSeleccionado(null);
        setData2([])
      },
    });
  };

  const columns = [
    {
      field: 'IdEntrada',
      Header: 'ID',
      center: true,
      frozen: true,
      className: 'XxSmall',
      filterMatchMode: 'equals',
      hidden: user?.IdRol === 1
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
      className: 'Xxxxxlarge',
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
      field: 'SubTotal',
      Header: 'SubTotal',
      center: false,
      frozen: false,
      format: 'number',
      summary: true,
      className: 'Small',
      filterMatchMode: 'equals',
      hidden: user?.IdRol === 1 && user?.IdRol === 2,
      prefix: 'L '
    },
    {
      field: 'Total',
      Header: 'Total',
      center: false,
      frozen: false,
      format: 'number',
      className: 'Small',
      summary: true,
      filterMatchMode: 'equals',
      hidden: user?.IdRol === 1 && user?.IdRol === 2,
      prefix: 'L '
    },
    {
      field: 'Pagado',
      Header: 'Pagado',
      frozen: true,
      alignFrozen: 'right',
      center: true,
      format: 'checkbox',
      className: 'Small',
      filterMatchMode: 'equals',
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

  const columns2 = [
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
      field: 'SubTotal',
      Header: 'SubTotal',
      center: false,
      frozen: false,
      format: 'number',
      summary: true,
      className: 'Small',
      filterMatchMode: 'equals',
      hidden: user?.IdRol === 1 && user?.IdRol === 2,
      prefix: 'L '
    },
    {
      field: 'Total',
      Header: 'Total',
      center: false,
      frozen: false,
      format: 'number',
      className: 'Small',
      summary: true,
      filterMatchMode: 'equals',
      hidden: user?.IdRol === 1 && user?.IdRol === 2,
      prefix: 'L '
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
    setProveedorSeleccionado(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangeDates, activeIndex]);

  useEffect(() => {
    if(proveedorSeleccionado){
      buscarEntradasPorProveedor()
    }else{
      setData2([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proveedorSeleccionado]);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [data]);

  useEffect(() => {
    document.title = 'Sumo - Entradas';
  }, []);

  return (
    <>
      <div>
        <Toast ref={toast} />
        <div         
          style={{
            paddingTop: "45px",
            paddingLeft: "10px",
            paddingRight: "10px",
          }}
        >

          <TabView 
            activeIndex={activeIndex}
            onTabChange={(e) => setActiveIndex(e.index)}
          >
            <TabPanel header="Entradas">
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
                    tooltip='Cargar'
                    tooltipOptions={{position: 'top'}}
                    disabled={loading}
                    severity="primary"
                  />
                  <Button
                    icon="pi pi-box"
                    tooltip='Agregar Producto'
                    tooltipOptions={{position: 'top'}}
                    className="p-button-success"
                    severity="primary"
                    onClick={() => {
                      setShowDialogProducto(true)
                    }}
                  />
                  <Button
                    icon="pi pi-truck"
                    tooltip='Agregar Proveedor'
                    className="p-button-success"
                    tooltipOptions={{position: 'top'}}
                    severity="primary"
                    onClick={() => {
                      setShowDialogProveedores(true)
                    }}
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
                </div>
              </div>

              <Table columns={columns} data={data} globalFilter={globalFilter} />

              {loading && <Loading message="Cargando entradas..." />}
            </TabPanel>

            <TabPanel header='Pagos a Proveedores'>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '1rem',
                }}
              > 

                <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-end' }}>
                  <div style={{ flex: 1 }}>
                    <FloatLabel>
                      <Dropdown
                        id="IdVendor"
                        value={proveedorSeleccionado}
                        options={proveedores}
                        onChange={(e) => setProveedorSeleccionado(e.value)}
                        placeholder="Seleccione un proveedor"
                        required
                        optionLabel="VendorName"
                        optionValue="IdVendor"
                        style={{ width: '100%' }}
                        showClear
                      />
                      <label htmlFor="IdVendor">Proveedor</label>
                    </FloatLabel>
                  </div>

                  <Button
                    icon="pi pi-dollar"
                    label='Pagar'
                    className="p-button-success"
                    onClick={pagarFacturas}
                    disabled={data2?.length <= 0}
                    severity="primary"
                  />
                </div>


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

              <Table columns={columns2} data={data2}/>

              {loading && <Loading message="Cargando..." />}

            </TabPanel>

          </TabView>


        </div>
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
          Code={globalFilter}
        />
      )}

      {showDialogProveedores && (
        <ProveedoresCRUD
          showDialog={showDialogProveedores}
          setShowDialog={setShowDialogProveedores}
          setSelected={setSelected}
          selected={selected}
          getInfo={getInfo}
          editable={true}
        />
      )}

    </>
  );
}
