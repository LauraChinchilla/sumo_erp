import React, { useEffect, useRef, useState } from "react";
import Table from "../../components/Table";
import { supabase } from "../../supabaseClient";
import Loading from "../../components/Loading";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import CalendarMonth from "../../components/CalendarMonth";

export default function FlujoCajaScreen() {
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);
  const [filteredData, setFilteredData] = useState([]);
  const [rangeDates, setRangeDates] = useState(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return [firstDay, lastDay];
  });
  const [selectedMonth, setSelectedMonth] = useState(null);

  
  const getInfo = async () => {
    setLoading(true);

    let query = supabase.from('vta_flujocaja').select('*');

    if (rangeDates && rangeDates[0] && rangeDates[1]) {
      const from = new Date(rangeDates[0]);
      const to = new Date(rangeDates[1]);
      to.setHours(23, 59, 59, 999);

      query = query.gte('Date', from.toISOString()).lte('Date', to.toISOString());
    }

    const { data, error } = await query;

    if (!error) setFilteredData(data);
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
      field: "Date",
      Header: "Fecha",
      center: true,
      frozen: false,
      format: "Date",
      className: "XxxSmall",
      filterMatchMode: "contains",
    },
    {
      field: "Entradas",
      Header: "Egreso",
      prefix: "L ",
      format: "number",
      className: "XxSmall",
      summary: true,
    },
    {
      field: "Salidas",
      Header: "Ingreso",
      prefix: "L ",
      format: "number",
      className: "XxSmall",
      summary: true,
    },
  ];

  useEffect(() => {
    getInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangeDates]);

  useEffect(() => {
    document.title = "Sumo - Fujo de Caja";
  }, []);

  return (
    <>
      <Toast ref={toast} />
      <div className="dashboard-container" >
        <h2 style={{ textAlign: "center" }}>Flujo de Caja</h2>

        {/* Buscador y botones */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "1rem",
          }}
        >

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
              onClick={getInfo}
              disabled={loading}
              severity="primary"
            />
          </div>
        </div>
        <Table columns={columns} data={filteredData} />
        {loading && <Loading message="Cargando ..." />}
      </div>
    </>
  );
}
