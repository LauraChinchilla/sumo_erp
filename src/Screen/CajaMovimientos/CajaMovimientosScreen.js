import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';

import { supabase } from '../../supabaseClient';

import Table from '../../components/Table';
import Loading from '../../components/Loading';
import CalendarMonth from '../../components/CalendarMonth';
import CRUDMovimientos from './CRUDMovimientos';
import { confirmDialog } from 'primereact/confirmdialog';

export default function CajaMovimientosScreen() {
  const [data, setData] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rangeDates, setRangeDates] = useState(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return [firstDay, lastDay];
  });
  const [selectedMonth, setSelectedMonth] = useState(null);
  const inputRef = useRef(null);
  const toast = useRef(null);

  const getInfo = async () => {
    setLoading(true);

    let query = supabase.from('vta_cajamovimientos').select('*').eq('IdStatus', 8);

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

  const columns = [
    {
      field: 'IdMovimiento',
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
      field: 'Movimiento',
      Header: 'Tipo Movimiento',
      center: false,
      frozen: false,
      format: 'text',
      filterMatchMode: 'contains',
    },
    {
      field: 'Categoria',
      Header: 'Categoria',
      center: false,
      frozen: false,
      format: 'text',
      filterMatchMode: 'contains',
    },
    {
      field: 'Descripcion',
      Header: 'Descripcion',
      center: false,
      frozen: false,
      format: 'text',
      filterMatchMode: 'contains',
    },
    {
      field: 'UserName',
      Header: 'Usuario',
      center: false,
      frozen: false,
      format: 'text',
      className: 'Small',
      filterMatchMode: 'contains',
    },
    {
      field: 'Monto',
      Header: 'Monto',
      center: false,
      frozen: false,
      format: 'number',
      className: 'Small',
      preffix: 'L ',
      filterMatchMode: 'equals',
      summary: true,
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
        if(rowData?.IdStatus === 8){
          if(rowData?.IdCategoria === 4 || rowData.IdCategoria === 5 || rowData?.IdCategoria === 6){
              toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: `No se puede eliminar este movimiento. Viene de ${rowData?.Categoria}`,
                life: 3000,
              });
            return
          }
          confirmDialog({
            message: `¿Estás seguro de eliminar el movimiento?`,
            header: "Confirmar",
            icon: "pi pi-exclamation-triangle",
            acceptLabel: "Aceptar",
            rejectLabel: "Cancelar",
            accept: async () => {
              const { error } = await supabase.from('CajaMovimientos').update({ IdStatus: 9 }).eq('IdMovimiento', rowData.IdMovimiento);
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
                  detail: `Movimiento eliminado correctamente`,
                  life: 3000,
                });

                getInfo();
              }
            },
          });
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
    document.title = 'Sumo - Mov. Caja';
  }, []);

  return (
    <>
      <div className="dashboard-container">
        <h2 style={{ textAlign: 'center' }}>Movimientos de Caja</h2>
        <Toast ref={toast} />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '1rem',
          }}
        >

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
              label="Agregar Movimiento"
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

        <Table columns={columns} data={data}/>

        {loading && <Loading message="Cargando..." />}
      </div>

      {showDialog && (
        <CRUDMovimientos
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
