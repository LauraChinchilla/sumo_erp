import React, { useEffect, useRef, useState } from "react";
import { Toast } from "primereact/toast";
import { TabPanel, TabView } from "primereact/tabview";
import { Button } from "primereact/button";
import { confirmDialog } from "primereact/confirmdialog";

import Loading from "../../components/Loading";
import Table from "../../components/Table";

import { supabase } from "../../supabaseClient";
import { useUser } from "../../context/UserContext";
import CRUDPersonal from "./CRUDPersonal";
import ModalImage from "../../components/ModalImage";
import CRUDNominas from "./CRUDNominas";

export default function PersonalScreen() {
  const [data, setData] = useState([]);
  const [showDialog, setShowDialog] = useState(false)
  const [showDialog2, setShowDialog2] = useState(false)
  const [selected, setSelected] = useState([])
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showDialogImage, setShowDialogImage] = useState(false);
  const { user } = useUser();
  const toast = useRef(null);

  const getInfo = async () => {
    setLoading(true);
    if (activeIndex === 0) {
      const { data, error } = await supabase.from("vta_personal").select("*").order("IdPersonal", { ascending: true });
      if (!error) {
        setData(data);
      }
    } else if(activeIndex === 1){
      const { data, error } = await supabase.from("vta_nominas").select("*").order("IdNomina", { ascending: true });
      if (!error) {
        setData(data);
      }
    } 
    setLoading(false);
  };

  const colums1 = [
    {
      field: "IdPersonal",
      Header: "ID",
      center: true,
      frozen: true,
      className: "XxSmall",
      filterMatchMode: "equals",
      hidden: user?.IdRol !== 1,
    },
    {
      field: 'CodigoPersonal',
      Header: 'Codigo',
      center: true,
      frozen: true,
      format: 'text',
      className: 'XxxSmall',
      filterMatchMode: 'equals',
      count: true,
    },
    {
      field: 'FechaIngreso',
      Header: 'Fecha de Ingreso',
      center: true,
      frozen: false,
      format: 'Date',
      className: 'XxxSmall',
      filterMatchMode: 'contains',
    },
    {
      field: "Nombre",
      Header: "Nombre",
      format: "text",
      className: "Medium",
    },
    {
      field: "Apellido",
      Header: "Apellido",
      format: "text",
      className: "Medium",
    },
    {
      field: "Identidad",
      Header: "Identidad",
      center: false,
      frozen: false,
      format: "text",
      className: "XxSmall",
      filterMatchMode: "contains",
    },
    {
      field: "TipoPlanilla",
      Header: "Tipo de Planilla",
      center: false,
      frozen: false,
      format: "text",
      className: "Medium",
      filterMatchMode: "contains",
    },
    {
      field: "Cargo",
      Header: "Cargo",
      center: false,
      frozen: false,
      format: "text",
      className: "Medium",
      filterMatchMode: "contains",
    },
    { field: 'SueldoFijo', Header: 'Sueldo Fijo', format: 'number', className: 'Small', summary: true, prefix: 'L ' },
    {
      field: "StatusName",
      Header: "Estado",
      format: "badge",
      center: true,
      className: "XxxSmall",
      onClick: (rowData) => {
        confirmDialog({
          message: `¿Estás seguro de cambiar el estado del empleado "${rowData.Nombre}  ${rowData.Apellido}"?`,
          header: "Confirmar cambio de estado",
          icon: "pi pi-exclamation-triangle",
          acceptLabel: "Sí",
          rejectLabel: "Cancelar",
          accept: () => cambiarEstado("Personal", "IdPersonal", rowData),
        });
      },
    },
    {
      field: 'actions',
      isIconColumn: true,
      icon: 'pi pi-pencil',
      center: true,
      className: 'XxxSmall',
      tooltip: 'Editar',
      filter: false,
      onClick: (rowData) => {
        if(rowData?.IdStatus === 1){
          setSelected([rowData])
          setShowDialog(true)
        }else{
          toast.current?.show({
            severity: 'warn',
            summary: 'Error',
            detail: 'No se puede editar personal Inactivo',
            life: 4000
          });
        }
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

  const colums2 = [
    {
      field: "IdNomina",
      Header: "ID",
      center: true,
      frozen: true,
      className: "XxSmall",
      filterMatchMode: "equals",
      hidden: user?.IdRol !== 1,
    },
    {
      field: 'Date',
      Header: 'Fecha',
      center: true,
      frozen: false,
      format: 'Date',
      className: 'XxxSmall',
      filterMatchMode: 'contains',
    },
    {
      field: 'CodigoPersonal',
      Header: 'Codigo',
      center: true,
      frozen: true,
      format: 'text',
      className: 'XxxSmall',
      filterMatchMode: 'equals',
      count: true,
    },
    {
      field: "NombreCompleto",
      Header: "Empleado",
      format: "text",
      className: "Medium",
    },
    {
      field: "Identidad",
      Header: "Identidad",
      center: false,
      frozen: false,
      format: "text",
      className: "XxSmall",
      filterMatchMode: "contains",
    },
    {
      field: "TipoPlanilla",
      Header: "Tipo de Planilla",
      center: false,
      frozen: false,
      format: "text",
      className: "Medium",
      filterMatchMode: "contains",
    },
    { field: 'SueldoFijo', Header: 'Sueldo Fijo', format: 'number', className: 'Small', summary: true, prefix: 'L ' },
    { field: 'Monto', Header: 'Monto Pagado', format: 'number', className: 'Small', summary: true, prefix: 'L ' },
    {
      field: "StatusName",
      Header: "Estado",
      format: "badge",
      center: true,
      className: "XxxSmall",
      onClick: (rowData) => {
        if(rowData?.IdStatus === 10){
          confirmDialog({
            message: `¿Estás seguro de eliminar la nomina pagada a "${rowData.NombreCompleto}"?`,
            header: "Confirmar cambio de estado",
            icon: "pi pi-exclamation-triangle",
            acceptLabel: "Sí",
            rejectLabel: "Cancelar",
            accept: () => cambiarEstado("Nominas", "IdNomina", rowData),
          });
        }
      },
    },
  ];

  const cambiarEstado = async (tabla, idCampo, rowData) => {
    const nuevoEstado = rowData.IdStatus === 10 ? 11 : 10;
    const textoEstado = nuevoEstado === 1 ? 'activado' : 'inactivado';

    const { error } = await supabase.from(tabla).update({ IdStatus: nuevoEstado }).eq(idCampo, rowData[idCampo]);

    if (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: `No se pudo actualizar el estado: ${error.message}`,
        life: 3000,
      });
    } else {
      toast.current?.show({
        severity: 'success',
        summary: 'Estado actualizado',
        detail: `Registro ${textoEstado} correctamente`,
        life: 3000,
      });
      getInfo();
    }
  };

  useEffect(() => {
    getInfo();
    setSelected([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  useEffect(() => {
    document.title = "Sumo - Personal";
  }, []);

  return (
    <>
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

          <TabPanel header="Personal">
            {loading && <Loading message="Cargando..." />}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
              <Button
                icon="pi pi-refresh"
                className="p-button-success"
                onClick={getInfo}
                disabled={loading}
                severity="primary"
              />
              <Button
                icon="pi pi-plus"
                label="Agregar Personal"
                severity='primary'
                className="p-button-success"
                onClick={() => {
                  setSelected([])
                  setShowDialog(true)
                }}
              />
            </div>
            <Table columns={colums1} data={data} />
          </TabPanel>

          <TabPanel header="Pago de Nominas">
            {loading && <Loading message="Cargando..." />}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
              <Button
                icon="pi pi-refresh"
                className="p-button-success"
                onClick={getInfo}
                disabled={loading}
                severity="primary"
              />
              <Button
                icon="pi pi-plus"
                label="Nuevo Pago"
                severity='primary'
                className="p-button-success"
                onClick={() => {
                  setSelected([])
                  setShowDialog2(true)
                }}
              />
            </div>
            <Table columns={colums2} data={data} />
          </TabPanel>

          {/* <TabPanel header="Usuarios">
            {loading && <Loading message="Cargando..." />}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
              <Button
                icon="pi pi-refresh"
                className="p-button-success"
                onClick={getInfo}
                disabled={loading}
                severity="primary"
              />
            </div>
            <Table columns={columnsUsers} data={dataUsers} />
          </TabPanel>

          <TabPanel header="Categorias">
            {loading && <Loading message="Cargando..." />}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
              <Button
                icon="pi pi-refresh"
                className="p-button-success"
                onClick={getInfo}
                disabled={loading}
                severity="primary"
              />
              <Button
                icon="pi pi-plus"
                label="Nueva Categoria"
                severity='primary'
                className="p-button-success"
                onClick={() => {
                  setSelected([])
                  setShowDialogCategorias(true)
                }}
              />
            </div>
            <Table columns={columnsCat} data={dataCategorias} />
          </TabPanel>

          <TabPanel header="Unidades">
            {loading && <Loading message="Cargando..." />}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
              <Button
                icon="pi pi-refresh"
                className="p-button-success"
                onClick={getInfo}
                disabled={loading}
                severity="primary"
              />
              <Button
                icon="pi pi-plus"
                label="Nueva Unidad"
                severity='primary'
                className="p-button-success"
                onClick={() => {
                  setSelected([])
                  setShowDialogUnits(true)
                }}
              />
            </div>
            <Table columns={columnsUnits} data={dataUnidades} />
          </TabPanel> */}
        </TabView>

        {showDialog && (
          <CRUDPersonal
            setShowDialog={setShowDialog}
            showDialog={showDialog}
            setSelected={setSelected}
            selected={selected}
            getInfo={getInfo}
            setActiveIndex={setActiveIndex}
          />
        )}

        {showDialogImage && (
          <ModalImage
            selected={selected}
            setSelected={setSelected}
            showDialogImage={showDialogImage}
            setShowDialogImage={setShowDialogImage}
            Personal={true}
          />
        )}

        {showDialog2 && (
          <CRUDNominas
            setShowDialog={setShowDialog2}
            showDialog={showDialog2}
            setSelected={setSelected}
            selected={selected}
            getInfo={getInfo}
            setActiveIndex={setActiveIndex}
          />
        )}

      
      </div>
    </>
  );
}
