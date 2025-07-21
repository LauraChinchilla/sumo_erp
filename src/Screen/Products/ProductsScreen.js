import React, { useEffect, useRef, useState } from 'react';
import Navbar from '../../components/Navbar';
import { supabase } from '../../supabaseClient';
import Table from '../../components/Table';
import { Button } from 'primereact/button';
import CRUDProducts from './CRUDProducts';
import Loading from '../../components/Loading';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { useUser } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';
import ModalImage from '../../components/ModalImage';


export default function Productos() {
  const [data, setData] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [showDialogImage, setShowDialogImage] = useState(false);
  const [showDialogStatus, setShowDialogStatus] = useState(false);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState('');
  const inputRef = useRef(null);
  const toast = useRef(null);
  const { user, logout } = useUser();
  const navigate = useNavigate();

  const getInfo = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('vta_products').select('*').order('IdProduct', { ascending: true });
    if (!error) setData(data);
    setLoading(false);
  };


  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const cambiarEstadoProducto = async () => {
    if (!selected[0]?.IdProduct) return;

    const nuevoEstado = selected[0].IdStatus === 1 ? 2 : 1;
    const estadoTexto = nuevoEstado === 1 ? 'activado' : 'inactivado';

    const { error } = await supabase
      .from('Products')
      .update({ IdStatus: nuevoEstado })
      .eq('IdProduct', selected[0].IdProduct);

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
        detail: `Producto ${selected[0].Name} ${estadoTexto} correctamente`,
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
      field: 'IdProduct',
      Header: 'ID',
      center: true,
      frozen: true,
      className: 'XxSmall',
      filterMatchMode: 'equals',
      hidden: user?.IdRol !==1
    },
    {
      field: 'Code',
      Header: 'Codigo',
      center: true,
      frozen: true,
      format: 'text',
      className: 'Large',
      filterMatchMode: 'equals',
      count: true,
    },
    {
      field: 'Name',
      Header: 'Nombre',
      center: false,
      frozen: false,
      format: 'text',
      className: 'Xxxxlarge',
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
      field: 'categoryname',
      Header: 'Categoria',
      center: false,
      frozen: false,
      filterMatchMode: 'contains',
      format: 'text',
      className: 'XxSmall'
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
      field: 'StockMinimo',
      Header: 'Stock Minimo',
      center: false,
      frozen: false,
      filterMatchMode: 'contains',
      format: 'number',
      className: 'XxSmall'
    },
    {
      field: 'StockMaximo',
      Header: 'Stock Maximo',
      center: false,
      frozen: false,
      filterMatchMode: 'contains',
      format: 'number',
      className: 'XxSmall'
    },
    {
      field: 'StatusName',
      Header: 'Estado',
      format: 'badge',
      center: true,
      className: 'Small',
      onClick: (rowData) => {
        setSelected([rowData])
        setShowDialogStatus(true)
      }
    },
    {
      field: 'actions',
      // Header: 'Acciones',
      isIconColumn: true,
      icon: 'pi pi-pencil',
      center: true,
      className: 'XxxSmall',
      tooltip: 'Editar',
      filter: false,
      onClick: (rowData) => {
        setSelected([rowData]);
        setShowDialog(true);
      }
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

  useEffect(() => {
    getInfo();
  }, []);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [data]);

  useEffect(() => {
    document.title = 'Sumo - Productos';
  }, []);

  return (
    <>
      <Navbar onLogout={handleLogout} />
      <div className="dashboard-container" style={{ paddingTop: '50px' }}>
        <h2 style={{ textAlign: 'center' }}>Productos</h2>

        {/* Buscador y botones */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <InputText
            inputRef={inputRef}
            type="search"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Buscar por código (lector)"
            className="p-inputtext-sm"
            style={{ width: '300px' }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const match = data.find(p => p.Code?.toString().trim() === globalFilter.trim());
                if (match) {
                  setSelected([match]);
                  setShowDialog(true);
                }
              }
            }}
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
              label="Agregar Producto"
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
                    cambiarEstadoProducto()
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
                ? `¿Está seguro de pasar a inactivo el producto: ${selected[0]?.Name}?`
                : `¿Está seguro de activar nuevamente el producto: ${selected[0]?.Name}?`}
            </h4>
          </Dialog>
        </>
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
