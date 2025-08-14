import React, { useEffect, useRef, useState } from "react";
import { supabase } from "../../supabaseClient";
import Table from "../../components/Table";
import { Button } from "primereact/button";
import Loading from "../../components/Loading";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { useUser } from "../../context/UserContext";
import CalendarMonth from "../../components/CalendarMonth";
import CRUDSalidas from "./CRUDSalidas";
import { confirmDialog } from "primereact/confirmdialog";
import getLocalDateTimeString from "../../utils/funciones";
import CRUDSalidaMultiple from "./CRUDSalidaMultiple";
import SalidasReporte from "./SalidasReporte";

export default function SalidasScreen() {
  const [data, setData] = useState([]);
  const { user } = useUser();
  const [showDialog, setShowDialog] = useState(false);
  const [showDialog2, setShowDialog2] = useState(false);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rangeDates, setRangeDates] = useState(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return [firstDay, lastDay];
  });
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const inputRef = useRef(null);
  const toast = useRef(null);
  const [showDialogReporte, setShowDialogReporte] = useState(false);

  const getInfo = async () => {
    setLoading(true);

    let query = supabase.from("vta_salidas").select("*").eq("IdStatus", 5).order('IdSalida', { ascending: true });

    if (rangeDates && rangeDates[0] && rangeDates[1]) {
      const from = new Date(rangeDates[0]);
      const to = new Date(rangeDates[1]);
      to.setHours(23, 59, 59, 999);

      query = query
        .gte("Date", from.toISOString())
        .lte("Date", to.toISOString());
    }

    const { data, error } = await query;

    if (!error) setData(data);
    else {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error.message,
        life: 3000,
      });
    }

    setLoading(false);
  };

  const buscarProductoPorCodigo = async (codigo) => {
    const { data: producto, error } = await supabase
      .from("vta_products")
      .select("*")
      .eq("Code", codigo.trim())
      .eq("IdStatus", 1)
      .single();

    if (error || !producto) {
      toast.current?.show({
        severity: "warn",
        summary: "No encontrado",
        detail: `No se encontró un producto con código: ${codigo}`,
        life: 3000,
      });
      return;
    }

    setSelected([producto]);
    setShowDialog(true);
  };

  const columns = [
    {
      field: "IdSalida",
      Header: "ID",
      center: true,
      className: "XxSmall",
      filterMatchMode: "equals",
      hidden: user?.IdRol !== 1,
    },
    {
      field: "Date",
      Header: "Fecha",
      center: true,
      format: "Date",
      className: "Medium",
      filterMatchMode: "contains",
    },
    {
      field: "TipoSalida",
      Header: "Tipo de Salida",
      center: true,
      format: "text",
      className: "Medium",
      filterMatchMode: "equals",
    },
    {
      field: "Code",
      Header: "Código",
      center: true,
      format: "text",
      className: "Large",
      filterMatchMode: "equals",
      count: true,
    },
    {
      field: "Name",
      Header: "Producto",
      center: false,
      format: "text",
      filterMatchMode: "contains",
    },
    {
      field: "NombreCompleto",
      Header: "Cliente",
      center: false,
      format: "text",
      filterMatchMode: "contains",
    },
    {
      field: "Descripcion",
      Header: "Descripción",
      center: false,
      format: "text",
      filterMatchMode: "contains",
    },
    {
      field: "UserName",
      Header: "Usuario",
      center: false,
      format: "text",
      filterMatchMode: "contains",
      className: "XxSmall",
    },
    {
      field: "CantidadSalida",
      Header: "Cantidad",
      center: true,
      format: "number",
      className: "Small",
      filterMatchMode: "equals",
      summary: true,
    },
    {
      field: "UnitName",
      Header: "Unidad",
      className: "Small",
      filterMatchMode: "equals",
    },
    {
      field: "PrecioVenta",
      Header: "Precio Venta",
      center: true,
      format: "number",
      prefix: "L ",
      className: "Small",
      filterMatchMode: "equals",
    },
    {
      field: "SubTotal",
      Header: "SubTotal",
      center: true,
      format: "number",
      prefix: "L ",
      className: "Small",
      filterMatchMode: "equals",
      summary: true,
    },
    {
      field: "ISVQty",
      Header: "ISV",
      center: true,
      format: "number",
      className: "Small",
      prefix: "L ",
      filterMatchMode: "equals",
      summary: true,
    },
    {
      field: "Total",
      Header: "Total",
      center: true,
      format: "number",
      className: "Small",
      prefix: "L ",
      filterMatchMode: "equals",
      summary: true,
    },
    {
      field: "PagoCredito",
      Header: "Pagado",
      frozen: true,
      alignFrozen: "right",
      center: true,
      format: "checkbox",
      className: "Small",
      filterMatchMode: "equals",
    },
    {
      field: "actions",
      isIconColumn: true,
      icon: "pi pi-trash",
      center: true,
      className: "XxxSmall",
      filter: false,
      onClick: (rowData) => {
        const IdSalida = rowData?.IdSalida;
        const fechaEntrada = new Date(rowData?.Date);
        const hoy = new Date();
        const limite = new Date(hoy);
        limite.setDate(hoy.getDate() - 3);

        if (fechaEntrada < limite) {
          toast.current?.show({
            severity: "error",
            summary: "Error",
            detail: "No se puede eliminar una entrada mayor a 3 días",
            life: 4000,
          });
          return;
        }

        if (rowData?.IdTipoSalida === 3 && rowData?.PagoCredito === true) {
          toast.current?.show({
            severity: "warn",
            summary: "No permitido",
            detail: "No se puede eliminar una salida de crédito ya pagada.",
            life: 4000,
          });
          return;
        }

        confirmDialog({
          message: "¿Estás seguro que quieres eliminar la salida?",
          header: "Confirmar eliminación",
          icon: "pi pi-exclamation-triangle",
          acceptLabel: "Aceptar",
          rejectLabel: "Cancelar",
          accept: async () => {
            const { error } = await supabase
              .from("Salidas")
              .update({
                IdStatus: 6,
                IdUserEdit: user?.IdUser,
                Date: getLocalDateTimeString(),
              })
              .eq("IdSalida", IdSalida);

            if (error) {
              toast.current?.show({
                severity: "error",
                summary: "Error",
                detail: "Error al eliminar la salida",
                life: 3000,
              });
              return;
            }
            // Si es venta, también actualizar el movimiento de caja
            if (rowData?.IdTipoSalida === 1) {
              const { data: data5, error: movError } = await supabase
                .from("CajaMovimientos")
                .update({
                  IdStatus: 9,
                  IdUser: user?.IdUser,
                  Date: getLocalDateTimeString(),
                })
                .eq("IdReferencia", IdSalida)
                .eq("IdCategoria", 5);

              if (movError) {
                toast.current?.show({
                  severity: "warn",
                  summary: "Atención",
                  detail:
                    "La salida fue eliminada, pero el movimiento de caja no se actualizó.",
                  life: 4000,
                });
              }
            }
            toast.current?.show({
              severity: "success",
              summary: "Éxito",
              detail: "Salida eliminada correctamente",
              life: 3000,
            });

            getInfo();
          },
        });
      },
    },
  ];

  useEffect(() => {
    getInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangeDates]);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [data]);

  useEffect(() => {
    document.title = "Sumo - Salidas";
  }, []);

  return (
    <>
      <div className="dashboard-container">
        <h2 style={{ textAlign: "center" }}>Salidas</h2>
        <Toast ref={toast} />

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
            <Button
              icon="pi pi-print"
              className="p-button-success"
              onClick={()=> setShowDialogReporte(true)}
              disabled={loading}
              severity="primary"
              tooltip='Imprimir'
              tooltipOptions={{position: 'left'}}
            />
            <Button
              icon="pi pi-external-link"
              label="Ver Creditos"
              className="p-button-success"
              severity="primary"
              onClick={(e) => {
                e.stopPropagation(); 
                window.open('/Creditos', '_blank');
              }}
              disabled={loading}
            />
            <Button
              icon="pi pi-plus"
              label="Salida Multiple"
              tooltip="Agregar"
              className="p-button-success"
              severity="primary"
              onClick={(e) => {
                setShowDialog2(true)
              }}
              tooltipOptions={{ position: 'top'}}
              disabled={loading}
            />
            <Button
              label="Agregar Salida"
              icon="pi pi-plus"
              severity="primary"
              className="p-button-success"
              onClick={() => {
                setSelected([]);
                setShowDialog(true);
              }}
            />
          </div>
        </div>
        <Table columns={columns} data={data} globalFilter={globalFilter} />
        {loading && <Loading message="Cargando salidas..." />}
      </div>

      {showDialog && (
        <CRUDSalidas
          setShowDialog={setShowDialog}
          showDialog={showDialog}
          setSelected={setSelected}
          selected={selected}
          getInfo={getInfo}
        />
      )}

      {showDialog2 && (
        <CRUDSalidaMultiple
          setShowDialog={setShowDialog2}
          showDialog={showDialog2}
          setSelected={setSelected}
          selected={selected}
          getInfo={getInfo}
        />
      )}

      {showDialogReporte && (
        <SalidasReporte
          showDialog={showDialogReporte}
          setShowDialog={setShowDialogReporte}
          data={data}
          rangeDates={rangeDates}
        />
      )}


    </>
  );
}
