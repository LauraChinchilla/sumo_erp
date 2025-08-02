import React, { useEffect, useRef, useState } from 'react';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';

import { supabase } from '../../supabaseClient';
import Table from '../../components/Table';
import Loading from '../../components/Loading';
import CalendarMonth from '../../components/CalendarMonth';
import RetirosCRUD from './RetirosCRUD';
import { confirmDialog } from 'primereact/confirmdialog';
import getLocalDateTimeString from '../../utils/funciones';
import { useUser } from '../../context/UserContext';

export default function RetirosScreen() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [selected, setSelected] = useState([]);
  const [rangeDates, setRangeDates] = useState(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return [firstDay, lastDay];
  });
  const [selectedMonth, setSelectedMonth] = useState(null);
  const toast = useRef(null);
  const { user } = useUser();
  

  const getInfo = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('vta_retiros').select('*').eq('IdStatus', 1);
    if (!error) {
      setData(data);
      setFilteredData(data);
    } else {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar retiros' });
    }
    setLoading(false);
  };

  useEffect(() => {
    getInfo();
    document.title = 'Sumo - Retiros';
  }, []);

  const columns = [
    { field: 'Date', Header: 'Fecha', format: 'date', className: 'XxSmall' },
    { field: 'Comentario', Header: 'Descripción', format: 'text', className: 'Large' },
    { field: 'TipoRetiro', Header: 'Tipo', format: 'text', className: 'Small' },
    { field: 'UserName', Header: 'Registrado por', format: 'text', className: 'Small' },
    { field: 'Monto', Header: 'Monto', format: 'number', className: 'Small', summary: true },
    {
      field: 'actions',
      isIconColumn: true,
      icon: 'pi pi-trash',
      center: true,
      className: 'XxxSmall',
      filter: false,
      frozen: true,
      onClick: (rowData) => {
        const IdRetiro = rowData?.IdRetiro;
        const fechaEntrada = new Date(rowData?.Date);
        const hoy = new Date();
        const limite = new Date(hoy);
        limite.setDate(hoy.getDate() - 3);

        if (fechaEntrada < limite) {
          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: 'No se puede eliminar un retiro 3 días despues de realizar el movimiento',
            life: 4000,
          });
          return;
        }

        confirmDialog({
          message: '¿Estás seguro que quieres eliminar el retiro?',
          header: 'Confirmar eliminación',
          icon: 'pi pi-exclamation-triangle',
          acceptLabel: 'Aceptar',
          rejectLabel: 'Cancelar',
          accept: async () => {
            const { error } = await supabase
              .from('Retiros')
              .update({
                IdStatus: 2,
                IdUserEdit: user?.IdUser,
                Date: getLocalDateTimeString(),
              })
              .eq('IdRetiro', IdRetiro);

            if (error) {
              toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al eliminar el retiro',
                life: 3000,
              });
              return;
            }
           
            const { data: data5, error: movError } = await supabase
              .from('CajaMovimientos')
              .update({
                IdStatus: 9,
                IdUser: user?.IdUser,
                Date: getLocalDateTimeString(),
              })
              .eq('IdReferencia', IdRetiro)
              .eq('IdCategoria', 7);

              if (movError) {
                toast.current?.show({
                  severity: 'warn',
                  summary: 'Atención',
                  detail: 'El retiro fue eliminado, pero el movimiento de caja no se actualizó.',
                  life: 4000,
                });
              }
         
            toast.current?.show({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Retiro eliminada correctamente',
              life: 3000,
            });

            getInfo();
          },
        });
      }

    }
  ];

  return (
    <>
      <Toast ref={toast} />
      <div className="dashboard-container" style={{ paddingTop: '50px' }}>
        <h2 style={{ textAlign: 'center' }}>Retiros de Dinero</h2>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
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
              label="Agregar Retiro"
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

        <Table columns={columns} data={filteredData} />
        {loading && <Loading message="Cargando ..." />}
      </div>
    
       {showDialog && (
          <RetirosCRUD
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
