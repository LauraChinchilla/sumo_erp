import React, { useEffect, useRef, useState } from "react";
import Table from "../../components/Table";
import { supabase } from "../../supabaseClient";
import { useUser } from "../../context/UserContext";
import Loading from "../../components/Loading";
import { Toast } from "primereact/toast";
import { TabPanel, TabView } from "primereact/tabview";
import { Button } from "primereact/button";

export default function MaestrosScreen() {
  const [dataClientes, setDataClientes] = useState([]);
  const [dataProveedores, setDataProveedores] = useState([]);
  const [dataUsers, setDataUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const toast = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const getInfo = async () => {
    setLoading(true);
    if(activeIndex === 0){
        const { data, error } = await supabase.from("vta_clientes").select("*");
        if (!error) {
          setDataClientes(data);
        }
    }else if(activeIndex === 1){
        const { data, error } = await supabase.from("vta_clientes").select("*");
        if (!error) {
          setDataClientes(data);
        }
    }else if(activeIndex === 2){
        const { data, error } = await supabase.from("vta_proveedores").select("*");
        if (!error) {
          setDataProveedores(data);
        }
    }else if(activeIndex === 3){
        const { data, error } = await supabase.from("vta_users").select("*");
        if (!error) {
          setDataUsers(data);
        }
    }else if(activeIndex === 4){
        const { data, error } = await supabase.from("vta_users").select("*");
        if (!error) {
          setDataUsers(data);
        }
    }
    setLoading(false);
  };

  const columnsClientes = [
    {
      field: 'IdCliente',
      Header: 'ID',
      center: true,
      frozen: true,
      className: 'XxSmall',
      filterMatchMode: 'equals',
      hidden: user?.IdRol !==1
    },
    {
      field: "NombreCompleto",
      Header: "Cliente",
      format: "text",
      className: "Xxlarge",
    },
    {
      field: "Identificacion",
      Header: "Identidad",
      center: false,
      frozen: false,
      format: "text",
      className: "XxSmall",
      filterMatchMode: "contains",
    },
    {
      field: "RTN",
      Header: "RTN",
      center: false,
      frozen: false,
      format: "text",
      className: "XxSmall",
      filterMatchMode: "contains",
    },
    {
      field: "Comentario",
      Header: "Comentario",
      center: false,
      frozen: false,
      format: "text",
      className: "Medium",
      filterMatchMode: "contains",
    },
    {
      field: 'StatusName',
      Header: 'Estado',
      format: 'badge',
      center: true,
      className: 'XxxSmall',
      onClick: (rowData) => {
        // setSelected([rowData])
        // setShowDialogStatus(true)
      }
    },
  ];

  const columnsProveedores = [
    {
      field: 'IdVendor',
      Header: 'ID',
      center: true,
      frozen: true,
      className: 'XxSmall',
      filterMatchMode: 'equals',
      hidden: user?.IdRol !==1
    },
    {
      field: "VendorName",
      Header: "Cliente",
      format: "text",
      className: "Xxlarge",
    },
    {
      field: "RTN",
      Header: "RTN",
      center: false,
      frozen: false,
      format: "text",
      className: "XxSmall",
      filterMatchMode: "contains",
    },
    {
      field: "Description",
      Header: "Comentario",
      center: false,
      frozen: false,
      format: "text",
      className: "Large",
      filterMatchMode: "contains",
    },
    {
      field: 'StatusName',
      Header: 'Estado',
      format: 'badge',
      center: true,
      className: 'XxxSmall',
      onClick: (rowData) => {
        // setSelected([rowData])
        // setShowDialogStatus(true)
      }
    },
  ];

  const columnsUsers = [
    {
      field: 'IdUser',
      Header: 'ID',
      center: true,
      frozen: true,
      className: 'XxSmall',
      filterMatchMode: 'equals',
      hidden: user?.IdRol !==1
    },
    { field: 'DateCreate', Header: 'Fecha Creacion', center: true, format: 'Date', className: 'Small', filterMatchMode: 'contains' },
    {
      field: "UserName",
      Header: "Nombre Completo",
      format: "text",
      className: "Xxlarge",
    },
    {
      field: "Usuario",
      Header: "Usuario",
      format: "text",
      className: "Xxlarge",
    },
    {
      field: "Rol",
      Header: "Rol",
      center: false,
      frozen: false,
      format: "text",
      className: "Small",
      filterMatchMode: "contains",
    },
    {
      field: 'StatusName',
      Header: 'Estado',
      format: 'badge',
      center: true,
      className: 'XxxSmall',
      onClick: (rowData) => {
        // setSelected([rowData])
        // setShowDialogStatus(true)
      }
    },
  ];

  useEffect(() => {
    getInfo();
  }, [activeIndex]);

  useEffect(() => {
    document.title = "Sumo - Inventario";
  }, []);

  return (
    <>
      <Toast ref={toast} />
      <div style={{ paddingTop: "45px", paddingLeft: "10px", paddingRight: "10px" }}>
        <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
            <TabPanel header="Mi Empresa">
                {loading && <Loading message="Cargando..." />}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button
                    icon="pi pi-refresh"
                    className="p-button-success"
                    onClick={getInfo}
                    disabled={loading}
                    severity="primary"
                    />
                </div>
                <p className="m-0">
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem...
                </p>
            </TabPanel>
            <TabPanel header="Clientes">
                {loading && <Loading message="Cargando..." />}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button
                        icon="pi pi-refresh"
                        className="p-button-success"
                        onClick={getInfo}
                        disabled={loading}
                        severity="primary"
                    />
                </div>
                <Table columns={columnsClientes} data={dataClientes} />
            </TabPanel>
            <TabPanel header="Proveedores">
                {loading && <Loading message="Cargando..." />}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button
                        icon="pi pi-refresh"
                        className="p-button-success"
                        onClick={getInfo}
                        disabled={loading}
                        severity="primary"
                    />
                </div>
                <Table columns={columnsProveedores} data={dataProveedores} />
            </TabPanel>
            <TabPanel header="Usuarios">
                {loading && <Loading message="Cargando..." />}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
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
                <p className="m-0">Sed ut perspiciatis unde omnis iste natus error sit...</p>
            </TabPanel>
        </TabView>

      </div>

      {/* <div className="dashboard-container" style={{ paddingTop: "50px" }}>
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
            style={{ width: "300px" }}
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
        {loading && <Loading message="Cargando..." />}
      </div> */}
    </>
  );
}
