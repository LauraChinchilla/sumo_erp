import React, { useEffect, useRef, useState } from "react";
import Table from "../../components/Table";
import { supabase } from "../../supabaseClient";
import { useUser } from "../../context/UserContext";
import Loading from "../../components/Loading";
import { Toast } from "primereact/toast";
import { TabPanel, TabView } from "primereact/tabview";
import { Button } from "primereact/button";
import ClientesCRUD from "./ClientesCRUD";
import ProveedoresCRUD from "./ProveedoresCRUD";
import CategoriasCRUD from "./CategoriasCRUD";
import { confirmDialog } from "primereact/confirmdialog";
import useForm from "../useForm";
import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import { FileUpload } from "primereact/fileupload";

export default function MaestrosScreen() {
  const [dataClientes, setDataClientes] = useState([]);
  const [dataProveedores, setDataProveedores] = useState([]);
  const [dataUsers, setDataUsers] = useState([]);
  const [dataCategorias, setDataCategorias] = useState([]);
  const [showDialogClientes, setShowDialogClientes] = useState(false)
  const [showDialogProveedores, setShowDialogProveedores] = useState(false)
  const [showDialogCategorias, setShowDialogCategorias] = useState(false)
  const [selected, setSelected] = useState([])
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const fileUploadRef = useRef(null);
  const toast = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [editable, setEditable] = useState(false);

  const { values, setValues, handleChange, errors } = useForm({});
  

  const getInfo = async () => {
    setLoading(true);
    if (activeIndex === 0) {
      const { data, error } = await supabase
        .from("InformacionEmpresa")
        .select("*");
      if (!error) {
        setValues(data[0])
      }
    } else if (activeIndex === 1) {
      const { data, error } = await supabase.from("vta_clientes").select("*");
      if (!error) {
        setDataClientes(data);
      }
    } else if (activeIndex === 2) {
      const { data, error } = await supabase.from("vta_proveedores").select("*");
      if (!error) {
        setDataProveedores(data);
      }
    } else if (activeIndex === 3) {
      const { data, error } = await supabase.from("vta_users").select("*");
      if (!error) {
        setDataUsers(data);
      }
    } else if (activeIndex === 4) {
      const { data, error } = await supabase.from("vta_categorias").select("*");
      if (!error) {
        setDataCategorias(data);
      }
    }
    setLoading(false);
  };

  const columnsClientes = [
    {
      field: "IdCliente",
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
      field: "NombreCompleto",
      Header: "Cliente",
      format: "text",
      className: "Xxxlarge",
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
      field: "StatusName",
      Header: "Estado",
      format: "badge",
      center: true,
      className: "XxxSmall",
      onClick: (rowData) => {
        confirmDialog({
          message: `¿Estás seguro de cambiar el estado del cliente "${rowData.NombreCompleto}"?`,
          header: "Confirmar cambio de estado",
          icon: "pi pi-exclamation-triangle",
          acceptLabel: "Sí",
          rejectLabel: "Cancelar",
          accept: () => cambiarEstado("Clientes", "IdCliente", rowData),
        });
      },
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
        if(rowData?.IdStatus === 1){
          setSelected([rowData])
          setShowDialogClientes(true)
        }else{
          toast.current?.show({
            severity: 'warn',
            summary: 'Error',
            detail: 'No se puede editar un proveedor Inactivo',
            life: 4000
          });
        }
      }
    },
  ];

  const columnsProveedores = [
    {
      field: "IdVendor",
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
      field: "StatusName",
      Header: "Estado",
      format: "badge",
      center: true,
      className: "XxxSmall",
      onClick: (rowData) => {
        confirmDialog({
          message: `¿Deseas cambiar el estado del proveedor "${rowData.VendorName}"?`,
          header: "Cambiar estado del proveedor",
          icon: "pi pi-exclamation-triangle",
          accept: () => cambiarEstado("Vendors", "IdVendor", rowData),
          rejectLabel: "Cancelar",
        });
      },
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
        if(rowData?.IdStatus === 1){
          setSelected([rowData])
          setShowDialogProveedores(true)
        }else{
          toast.current?.show({
            severity: 'warn',
            summary: 'Error',
            detail: 'No se puede editar un proveedor Inactivo',
            life: 4000
          });
        }
      }
    },
  ];

  const columnsUsers = [
    {
      field: "IdUser",
      Header: "ID",
      center: true,
      frozen: true,
      className: "XxSmall",
      filterMatchMode: "equals",
      hidden: user?.IdRol !== 1,
    },
    {
      field: "DateCreate",
      Header: "Fecha Creacion",
      center: true,
      format: "Date",
      className: "Small",
      filterMatchMode: "contains",
    },
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
      field: "StatusName",
      Header: "Estado",
      format: "badge",
      center: true,
      className: "XxxSmall",
      onClick: (rowData) => {
        toast.current?.show({
          severity: 'warn',
          summary: 'Advertencia',
          detail: 'Comunicate con soporte para cambiar el estado de los usuarios.',
          life: 4000
        });
      },
    },
  ];

  const columnsCat = [
    {
      field: "IdCategory",
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
      className: 'XxxxSmall',
      filterMatchMode: 'contains',
    },
    {
      field: "Name",
      Header: "Categoria",
      format: "text",
      className: "Xxlarge",
    },
    {
      field: "Description",
      Header: "Descripcion",
      center: false,
      frozen: false,
      format: "text",
      className: "Large",
      filterMatchMode: "contains",
    },
    {
      field: "StatusName",
      Header: "Estado",
      format: "badge",
      center: true,
      className: "XxxSmall",
      onClick: (rowData) => {
        confirmDialog({
          message: `¿Deseas cambiar el estado de la categoría "${rowData.Name}"?`,
          header: "Confirmar cambio de estado",
          icon: "pi pi-exclamation-triangle",
          accept: () => cambiarEstado("Categories", "IdCategory", rowData),
          rejectLabel: "Cancelar",
        });
      },
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
        if(rowData?.IdStatus === 1){
          setSelected([rowData])
          setShowDialogCategorias(true)
        }else{
          toast.current?.show({
            severity: 'warn',
            summary: 'Error',
            detail: 'No se puede editar una categoria Inactiva',
            life: 4000
          });
        }
      }
    },
  ];

  const cambiarEstado = async (tabla, idCampo, rowData) => {
    const nuevoEstado = rowData.IdStatus === 1 ? 2 : 1;
    const textoEstado = nuevoEstado === 1 ? 'activado' : 'inactivado';

    const { error } = await supabase
      .from(tabla)
      .update({ IdStatus: nuevoEstado })
      .eq(idCampo, rowData[idCampo]);

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

  const handleUpload = async ({ files }) => {
    const file = files[0];
    if (!file) return;

    // Validar tamaño máximo (ej: 1 MB = 1_000_000 bytes)
    const maxSize = 1000000; // 1 MB
    if (file.size > maxSize) {
      toast.current.show({
        severity: 'warn',
        summary: 'Archivo demasiado grande',
        detail: 'El tamaño máximo permitido es 1 MB.',
        life: 4000,
      });

      // Limpiar el FileUpload para que permita volver a seleccionar
      if (fileUploadRef.current) fileUploadRef.current.clear();
      return;
    }

    const code = 'logoEmpresa';
    const extension = file.name.split('.').pop().toLowerCase();
    const fileName = `${code}.${extension}`;

    const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, file, { upsert: true });

    if (uploadError) {
      toast.current.show({
        severity: 'error',
        summary: 'Error al subir imagen',
        detail: uploadError.message,
      });
      return;
    }

    const { data: urlData, error: urlError } = supabase.storage.from('product-images').getPublicUrl(fileName);

    if (urlError) {
      toast.current.show({
        severity: 'error',
        summary: 'Error al obtener URL pública',
        detail: urlError.message,
      });
      return;
    }

    const imageUrl = urlData?.publicUrl;

    if (fileUploadRef.current) fileUploadRef.current.clear();

    const { error: updateError } = await supabase.from('InformacionEmpresa').update({ Logo: imageUrl }).eq('IdEmpresa', 1);

    if (updateError) {
      toast.current.show({
        severity: 'error',
        summary: 'Error al actualizar empresa',
        detail: updateError.message,
      });
      return;
    }

    toast.current.show({
      severity: 'success',
      summary: 'Imagen subida',
      detail: 'Imagen asignada correctamente.',
    });

    getInfo();
  };

  const confirmarEliminarImagen = () => {
    confirmDialog({
      message: '¿Estás seguro que quieres eliminar la imagen?',
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Aceptar',
      rejectLabel: 'Cancelar',
      accept: eliminarImagen,
    });
  };

  const eliminarImagen = async () => {
    try {
      const urlParts = values.Logo.split('/');
      const fileName = urlParts[urlParts.length - 1];

      const { error: deleteError } = await supabase.storage.from('product-images').remove([fileName]);

      if (deleteError) {
        toast.current.show({
          severity: 'error',
          summary: 'Error al eliminar imagen',
          detail: deleteError.message,
          life: 4000,
        });
        return;
      }

      const { error: updateError } = await supabase.from('InformacionEmpresa').update({ Logo: null }).eq('IdEmpresa', 1);

      if (updateError) {
        toast.current.show({
          severity: 'error',
          summary: 'Error al actualizar',
          detail: updateError.message,
          life: 4000,
        });
        return;
      }

      toast.current.show({
        severity: 'success',
        summary: 'Imagen eliminada',
        detail: 'Imagen eliminada y informacion actualizada correctamente',
        life: 3000,
      });

      getInfo();
    } catch (err) {
      toast.current.show({
      severity: 'error',
      summary: 'Error inesperado',
      detail: err.message || 'Algo salió mal',
      life: 4000,
      });
    }
  };

  useEffect(() => {
    getInfo();
    setSelected([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  useEffect(() => {
    document.title = "Sumo - Maestros";
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
          <TabPanel header="Mi Empresa">
            {loading && <Loading message="Cargando..." />}
 
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <h3>Informacion de mi Empresa</h3>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button icon="pi pi-refresh"  className="p-button-success" severity='primary' onClick={getInfo} disabled={loading} />
                <Button icon="pi pi-pencil"  className="p-button-success" severity='primary' onClick={() => { setEditable(!editable)}} disabled={loading} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', gap: '2rem' }}>
              <div style={{ flex: 1 }}>
                <FloatLabel>
                  <InputText
                    id="NombreLargo"
                    value={values?.NombreLargo}
                    onChange={(e) => handleChange('NombreLargo', e.target.value)}
                    style={{ width: '100%' }}
                    disabled={!editable}
                    className={errors.NombreLargo ? 'p-invalid' : ''}
                  />
                  <label htmlFor="NombreLargo">Nombre Completo</label>
                </FloatLabel>
              </div>

              <div style={{ flex: 1 }}>
                <FloatLabel>
                  <InputText
                    id="NombreCorto"
                    value={values?.NombreCorto}
                    onChange={(e) => handleChange('NombreCorto', e.target.value)}
                    style={{ width: '100%' }}
                    disabled={!editable}
                    className={errors.NombreCorto ? 'p-invalid' : ''}
                  />
                  <label htmlFor="NombreCorto">Nombre Corto</label>
                </FloatLabel>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', gap: '2rem' }}>
              <div style={{ flex: 1 }}>
                <FloatLabel>
                  <InputText
                    id="RTN"
                    value={values?.RTN}
                    onChange={(e) => handleChange('RTN', e.target.value)}
                    style={{ width: '100%' }}
                    disabled={!editable}
                    className={errors.RTN ? 'p-invalid' : ''}
                  />
                  <label htmlFor="RTN">RTN</label>
                </FloatLabel>
              </div>

              <div style={{ flex: 1 }}>
                <FloatLabel>
                  <InputText
                    id="Eslogan"
                    value={values?.Eslogan}
                    onChange={(e) => handleChange('Eslogan', e.target.value)}
                    style={{ width: '100%' }}
                    disabled={!editable}
                    className={errors.Eslogan ? 'p-invalid' : ''}
                  />
                  <label htmlFor="Eslogan">Eslogan</label>
                </FloatLabel>
              </div>
            </div>

            <div style={{ flex: 1, marginTop: '2rem' }}>
              <FileUpload
                ref={fileUploadRef}
                mode="basic"
                name="file"
                accept="image/*"
                maxFileSize={1000000}
                customUpload
                uploadHandler={handleUpload}
                chooseLabel="Agregar Imagen"
                auto
                disabled={values?.Logo}
              />

              <div
                className="p-card"
                style={{
                  marginTop: '2rem',
                  padding: '1rem',
                  border: '1px solid #ccc',
                  borderRadius: '10px',
                  width: 500,
                  position: 'relative',
                }}
              >
                {/* Botón X */}
                {values.Logo && (
                  <Button
                  icon="pi pi-times"
                  className="p-button-rounded p-button-danger p-button-sm"
                  style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    zIndex: 1,
                  }}
                  onClick={confirmarEliminarImagen}
                  tooltip="Eliminar imagen"
                  />
                )}

                <h5>Logo</h5>

                {values.Logo ? (
                  <img
                    src={values.Logo}
                    alt="Logo"
                    style={{
                      width: '100%',
                      borderRadius: '10px',
                      objectFit: 'contain',
                      maxHeight: 250,
                    }}
                  />
                ) : (
                  <h4 style={{ height: 200 }}>No se encontró la imagen</h4>
                )}
              </div>
            </div>

          </TabPanel>

          <TabPanel header="Clientes">
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
                label="Nuevo Cliente"
                severity='primary'
                className="p-button-success"
                onClick={() => {
                  setSelected([])
                  setShowDialogClientes(true)
                }}
              />
            </div>
            <Table columns={columnsClientes} data={dataClientes} />
          </TabPanel>
          <TabPanel header="Proveedores">
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
                label="Nuevo Proveedor"
                severity='primary'
                className="p-button-success"
                onClick={() => {
                  setSelected([])
                  setShowDialogProveedores(true)
                }}
              />
            </div>
            <Table columns={columnsProveedores} data={dataProveedores} />
          </TabPanel>
          <TabPanel header="Usuarios">
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
        </TabView>


        {showDialogClientes && (
          <ClientesCRUD
            showDialog={showDialogClientes}
            setShowDialog={setShowDialogClientes}
            setSelected={setSelected}
            selected={selected}
            getInfo={getInfo}
            editable={true}
            setActiveIndex={setActiveIndex}
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
            setActiveIndex={setActiveIndex}
          />
        )}

        {showDialogCategorias && (
          <CategoriasCRUD
            showDialog={showDialogCategorias}
            setShowDialog={setShowDialogCategorias}
            setSelected={setSelected}
            selected={selected}
            getInfo={getInfo}
            editable={true}
            setActiveIndex={setActiveIndex}
          />
        )}
      </div>
    </>
  );
}
