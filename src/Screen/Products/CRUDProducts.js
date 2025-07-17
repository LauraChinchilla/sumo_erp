import { Dialog } from 'primereact/dialog';
import React, { useEffect, useRef, useState } from 'react';
import useForm from '../../components/useForm';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { FloatLabel } from 'primereact/floatlabel';
import { Dropdown } from 'primereact/dropdown';
import { supabase } from '../../supabaseClient';
import { Toast } from 'primereact/toast';
import { FileUpload } from 'primereact/fileupload';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

const CRUDProducts = ({setShowDialog, showDialog, setSelected, selected, getInfo, editable= true}) => {
    const [categorias, setCategorias] = useState([]);
    const [unidades, setUnidades] = useState([]);
    const toast = useRef(null);
    const fileUploadRef = useRef(null);
    const [loading, setLoading] = useState(false);

    const initialValues = {
        IdProduct: -1,
        Name: '',
        Code: '',
        Description: '',
    };

    const { values, setValues, handleChange, validateForm, errors } = useForm(initialValues);

    const rules = {
        Code: { required: true, message: 'El código es obligatorio' },
        Name: { required: true, message: 'El nombre es obligatorio' },
        IdCategory: { required: true, message: 'Debe seleccionar una categoría' },
        IdUnit: { required: true, message: 'Debe seleccionar una unidad' },
    };

    const getValoresIniciales = async () => {
        setLoading(true)
        const { data, error } = await supabase.from('Categories').select('*').eq('IdStatus',1);
        if (!error) setCategorias(data);

        const { data: unitsTempo  } = await supabase.from('Units').select('*').eq('IdStatus',1);
        setUnidades(unitsTempo);

        if(selected.length > 0){
            setValues(selected[0]);
        } else {
            setValues(initialValues);
        }
        setLoading(false)
    };

    const guardarDatos = async (e) => {
        e.preventDefault();

        if (!validateForm(rules)) {
            console.log('Formulario con errores', errors);
            return;
        }

        setLoading(true);

        const Datos = {
            Code: values.Code,
            Name: values.Name,
            Description: values.Description,
            IdCategory: values.IdCategory,
            IdStatus: values?.IdStatus ? values?.IdStatus : 1,
            ImageURL: values.ImageURL || null,
            IdUnit: values?.IdUnit,
        };

        let error;

        if (values?.IdProduct > 0) {
            ({ error } = await supabase.from('Products').update(Datos).eq('IdProduct', values.IdProduct));
        } else {
            ({ error } = await supabase.from('Products').insert([Datos]));
        }

        setLoading(false);

        if (error) {
            console.error('Error al guardar producto:', error.message);
            toast.current.show({ severity: 'error', summary: 'Error', detail: error.message, life: 4000 });
            return;
        }

        toast.current.show({ severity: 'success', summary: 'Éxito', detail: values?.IdProduct > 0 ? 'Producto actualizado correctamente' : 'Producto agregado correctamente', life: 3000 });
        setTimeout(() => {            
            getInfo();
            setShowDialog(false);
        }, 1000);
    };

    const onHide = () => {
        setShowDialog(false);
        setSelected([]);
    };

    // Función para confirmar la eliminación
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
        if (!values.ImageURL || !values?.IdProduct) {
            toast.current.show({
            severity: 'warn',
            summary: 'No hay imagen para eliminar',
            life: 3000,
            });
            return;
        }

        try {
            const urlParts = values.ImageURL.split('/');
            const fileName = urlParts[urlParts.length - 1];

            const { error: deleteError } = await supabase.storage
            .from('product-images')
            .remove([fileName]);

            if (deleteError) {
            toast.current.show({
                severity: 'error',
                summary: 'Error al eliminar imagen',
                detail: deleteError.message,
                life: 4000,
            });
            return;
            }

            const { error: updateError } = await supabase
            .from('Products')
            .update({ ImageURL: null })
            .eq('IdProduct', values.IdProduct);

            if (updateError) {
            toast.current.show({
                severity: 'error',
                summary: 'Error al actualizar producto',
                detail: updateError.message,
                life: 4000,
            });
            return;
            }

            setValues((prev) => ({
            ...prev,
            ImageURL: null,
            }));

            toast.current.show({
            severity: 'success',
            summary: 'Imagen eliminada',
            detail: 'Imagen eliminada y producto actualizado correctamente',
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

        const code = selected[0]?.Code || values.Code || 'producto';
        const extension = file.name.split('.').pop().toLowerCase();
        const fileName = `${code}.${extension}`;

        const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(fileName, file, { upsert: true });

        if (uploadError) {
            toast.current.show({
                severity: 'error',
                summary: 'Error al subir imagen',
                detail: uploadError.message,
            });
            return;
        }

        const { data: urlData, error: urlError } = supabase.storage
            .from('product-images')
            .getPublicUrl(fileName);

        if (urlError) {
            toast.current.show({
                severity: 'error',
                summary: 'Error al obtener URL pública',
                detail: urlError.message,
            });
            return;
        }

        const imageUrl = urlData?.publicUrl;

        setValues((prev) => ({
            ...prev,
            ImageURL: imageUrl,
        }));

        if (fileUploadRef.current) fileUploadRef.current.clear();

        if (values?.IdProduct > 0) {
            const { error: updateError } = await supabase
                .from('Products')
                .update({ ImageURL: imageUrl })
                .eq('IdProduct', values.IdProduct);

            if (updateError) {
                toast.current.show({
                    severity: 'error',
                    summary: 'Error al actualizar producto',
                    detail: updateError.message,
                });
                return;
            }

            toast.current.show({
                severity: 'success',
                summary: 'Imagen subida',
                detail: 'Imagen asignada correctamente al producto.',
            });

            getInfo();
        } else {
            toast.current.show({
                severity: 'warn',
                summary: 'Producto aún no guardado',
                detail: 'Guarda el producto antes de subir la imagen.',
            });
        }
    };



    useEffect(() => {
        if(showDialog){
            getValoresIniciales();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showDialog]);

    return (
        <>
        <Dialog visible={showDialog} onHide={onHide} style={{ width: values?.IdProduct > 0 ?'80%' : '60%' }} header={selected.length > 0 ? 'Editar Producto' : 'Agregar Producto'}>
            <Toast ref={toast} />

            <div style={{ display: 'flex', gap: '2rem' }}>
                <div  style={{ flex: 2 }}>
                    {/* Código y Nombre */}
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                        <div style={{ flex: 1 }}>
                        <FloatLabel>
                            <InputText
                                id="Code"
                                value={values.Code}
                                onChange={(e) => handleChange('Code', e.target.value)}
                                required
                                style={{ width: '100%' }}
                                className={errors.Code ? 'p-invalid' : ''}
                                disabled={!editable}
                                autoFocus
                            />
                            <label htmlFor="Code">Código</label>
                        </FloatLabel>
                        </div>

                        <div style={{ flex: 1 }}>
                        <FloatLabel>
                            <InputText
                                id="Name"
                                value={values.Name}
                                onChange={(e) => handleChange('Name', e.target.value)}
                                required
                                style={{ width: '100%' }}
                                className={errors.Name ? 'p-invalid' : ''}
                                disabled={!editable}
                            />
                            <label htmlFor="Name">Nombre</label>
                        </FloatLabel>
                        </div>
                    </div>

                    {/* Descripción y Categoría */}
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                        <div style={{ flex: 1 }}>
                            <FloatLabel>
                                <InputText
                                    id="Description"
                                    value={values.Description}
                                    onChange={(e) => handleChange('Description', e.target.value)}
                                    style={{ width: '100%' }}
                                    disabled={!editable}
                                />
                                <label htmlFor="Description">Descripción</label>
                            </FloatLabel>
                        </div>

                        <div style={{ flex: 1 }}>
                            <FloatLabel>
                                <Dropdown
                                    id="IdCategory"
                                    value={values.IdCategory}
                                    options={categorias}
                                    onChange={(e) => handleChange('IdCategory', e.value)}
                                    placeholder="Seleccione una categoría"
                                    required
                                    optionLabel="Name"
                                    optionValue="IdCategory"
                                    className={errors.IdCategory ? 'p-invalid' : ''}
                                    style={{ width: '100%' }}
                                    disabled={!editable}
                                    showClear
                                />

                                <label htmlFor="IdCategory">Categoría</label>
                            </FloatLabel>
                        </div>
                    </div>

                    {/* Unidad */}
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>

                        <div style={{ flex: 1 }}>
                            <FloatLabel>
                                <Dropdown
                                    id="IdUnit"
                                    value={values.IdUnit}
                                    options={unidades}
                                    onChange={(e) => handleChange('IdUnit', e.value)}
                                    placeholder="Seleccione una unidad"
                                    required
                                    optionLabel="UnitName"
                                    optionValue="IdUnit"
                                    className={errors.IdUnit ? 'p-invalid' : ''}
                                    style={{ width: '100%' }}
                                    disabled={!editable}
                                    showClear
                                />

                                <label htmlFor="IdUnit">Unidad</label>
                            </FloatLabel>
                        </div>

                        <div style={{ flex: 1 }}>
                        </div>
                    </div>
                </div>

                {values?.IdProduct > 0 && (
                    <div style={{ flex: 1, marginTop: '2rem' }}>
                        <FileUpload
                            ref={fileUploadRef}
                            mode="basic"
                            name="file"
                            accept="image/*"
                            // maxFileSize={1000000}
                            customUpload
                            uploadHandler={handleUpload}
                            chooseLabel="Agregar Imagen"
                            auto
                            disabled={values?.ImageURL}
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
                            {values.ImageURL && (
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

                            <h5>Imagen del Producto</h5>

                            {values.ImageURL ? (
                                <img
                                src={values.ImageURL}
                                alt="Imagen del producto"
                                style={{
                                    width: '100%',
                                    borderRadius: '10px',
                                    objectFit: 'contain',
                                    maxHeight: 300,
                                }}
                                />
                            ) : (
                                <h4 style={{ height: 200 }}>No se encontró la imagen</h4>
                            )}
                        </div>
                    </div>
                )}

            </div>

            {/* Botones */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '3rem' }}>
                <Button label="Cancelar" className="p-button-secondary" onClick={onHide} disabled={loading} />
                <Button label="Guardar" onClick={guardarDatos} loading={loading} disabled={loading} />
            </div>
        </Dialog>

        <ConfirmDialog />
        </>
    );
}

export default CRUDProducts;
