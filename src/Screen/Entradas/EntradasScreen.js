import React, { useEffect, useRef, useState } from 'react';
import Navbar from '../../components/Navbar';
import { supabase } from '../../supabaseClient';
import Table from '../../components/Table';
import { Button } from 'primereact/button';
import Loading from '../../components/Loading';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { useUser } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';

export default function EntradasScreen() {
  const [data, setData] = useState([]);
  const [showDialog, setShowDialog] = useState(false); // Para edición/creación futura
  const [showDialogStatus, setShowDialogStatus] = useState(false); // Para cambio de estado
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState('');
  const inputRef = useRef(null);
  const toast = useRef(null);
  const { logout } = useUser();
  const navigate = useNavigate();

  const getInfo = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('vta_entradas').select('*');
    if (!error) setData(data);
    else
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.message,
        life: 3000,
      });
    setLoading(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const cambiarEstadoEntrada = async () => {
    if (!selected[0]?.IdEntrada) return;

    const nuevoEstado = selected[0].IdStatus === 3 ? 4 : 3;
    const estadoTexto = nuevoEstado === 1 ? 'Ingresado' : 'Eliminado';

    const { error } = await supabase
      .from('Entradas')
      .update({ IdStatus: nuevoEstado })
      .eq('IdEntrada', selected[0].IdEntrada);

    if (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.message,
        life: 3000,
      });
    } else {
      toast.current?.show({
        severity: 'success',
        summary: 'Éxito',
        detail: `Entrada ${selected[0].IdEntrada} ${estadoTexto} correctamente`,
        life: 3000,
      });

      setTimeout(() => {
        getInfo();
        setShowDialogStatus(false);
        setSelected([]);
      }, 800);
    }
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
      format: 'text',
      className: 'Small',
      filterMatchMode: 'contains',
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
      field: 'Cantidad',
      Header: 'Cantidad',
      center: false,
      frozen: false,
      format: 'number',
      className: 'Small',
      filterMatchMode: 'equals',
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
      field: 'Description',
      Header: 'Descripción',
      center: false,
      frozen: false,
      format: 'text',
      filterMatchMode: 'contains',
    },
    {
      field: 'StatusName',
      Header: 'Estado',
      format: 'badge',
      center: true,
      className: 'Small',
      onClick: (rowData) => {
        setSelected([rowData]);
        setShowDialogStatus(true);
      },
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
        // Aquí puedes implementar la edición futura
        setSelected([rowData]);
        setShowDialog(true);
      },
    },
  ];

  useEffect(() => {
    getInfo();
  }, []);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [data]);

  return (
    <>
      <Navbar onLogout={handleLogout} />
      <div className="dashboard-container" style={{ paddingTop: '50px' }}>
        <h2 style={{ textAlign: 'center' }}>Entradas</h2>

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
            placeholder="Buscar por producto, proveedor, etc."
            className="p-inputtext-sm"
            style={{ width: '300px' }}
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
                // Aquí podrías abrir un modal para crear entrada
                setSelected([]);
                setShowDialog(true);
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
              {selected[0]?.IdStatus === 1
                ? `¿Está seguro de inactivar la entrada ID: ${selected[0]?.IdEntrada}?`
                : `¿Está seguro de activar nuevamente la entrada ID: ${selected[0]?.IdEntrada}?`}
            </h4>
          </Dialog>
        </>
      )}

      {showDialog && (
        <Dialog
          visible={showDialog}
          onHide={() => {
            setShowDialog(false);
            setSelected([]);
          }}
          header={selected.length ? 'Editar Entrada' : 'Nueva Entrada'}
          footer={
            <Button
              label="Cerrar"
              icon="pi pi-times"
              onClick={() => {
                setShowDialog(false);
                setSelected([]);
              }}
              className="p-button-text"
            />
          }
        >
          {/* Aquí podrías poner tu componente CRUD de Entradas */}
          <p>Funcionalidad de edición/creación pendiente.</p>
        </Dialog>
      )}
    </>
  );
}
