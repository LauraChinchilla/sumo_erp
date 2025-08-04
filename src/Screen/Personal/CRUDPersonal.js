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
import { confirmDialog } from 'primereact/confirmdialog';
import { InputNumber } from 'primereact/inputnumber';
import getLocalDateTimeString from '../../utils/funciones';

const CRUDPersonal = ({setShowDialog, showDialog, setSelected, selected, getInfo, setActiveIndex, editable= true}) => {
    const [tipoPlanillas, setTipoPlanilla] = useState([]);
    const [cargos, setCargos] = useState([]);
    const toast = useRef(null);
    const fileUploadRef = useRef(null);
    const [loading, setLoading] = useState(false);

    const initialValues = {
        IdPersonal: -1,
        Nombre: '',
        Apellido: '',
    };

    const { values, setValues, handleChange, validateForm, errors } = useForm(initialValues);

    const rules = {
        Nombre: { required: true, message: 'El código es obligatorio' },
        Apellido: { required: true, message: 'El nombre es obligatorio' },
        IdCargo: { required: true, message: 'Debe seleccionar una categoría' },
        IdTipoPlanilla: { required: true, message: 'Debe seleccionar una unidad' },
    };

    const getValoresIniciales = async () => {
        setLoading(true)
        const { data, error } = await supabase.from('TipoPlanilla').select('*');
        if (!error) setTipoPlanilla(data);

        const { data: cargosTempo  } = await supabase.from('Cargos').select('*');
        setCargos(cargosTempo);

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
            Nombre: values.Nombre,
            Apellido: values.Apellido,
            Identidad: values.Identidad,
            IdTipoPlanilla: values.IdTipoPlanilla,
            IdCargo: values.IdCargo,
            IdStatus: 1,
            FotoURL: values.FotoURL || null,
            SueldoFijo: values?.SueldoFijo,
            FechaIngreso: values?.FechaIngreso ? values?.FechaIngreso : getLocalDateTimeString()
        };

        let error, insertedData;

        if (values?.IdPersonal > 0) {
            ({ error } = await supabase.from('Personal').update(Datos).eq('IdPersonal', values.IdPersonal));
        } else {
            const { data, error: insertError } = await supabase.from('Personal').insert([Datos]).select('IdPersonal'); // Obtener el ID recién insertado

            error = insertError;
            insertedData = data?.[0];

            if (!error && insertedData?.IdPersonal) {
                const codigo = `PER-${insertedData.IdPersonal.toString().padStart(4, '0')}`;
                const { error: updateCodigoError } = await supabase.from('Personal').update({ CodigoPersonal: codigo }).eq('IdPersonal', insertedData.IdPersonal);
                if (updateCodigoError) {
                    toast.current.show({
                        severity: 'error',
                        summary: 'Error al asignar código',
                        detail: updateCodigoError.message,
                        life: 4000,
                    });
                    setLoading(false);
                    return;
                }
            }
        }

        setLoading(false);

        if (error) {
            console.error('Error al guardar personal:', error.message);
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: error.message,
                life: 4000,
            });
            return;
        }

        toast.current.show({
            severity: 'success',
            summary: 'Éxito',
            detail: values?.IdPersonal > 0 ? 'Personal actualizado correctamente' : 'Personal agregado correctamente',
            life: 3000,
        });

        setTimeout(() => {
            setActiveIndex(0)
            getInfo();
            setShowDialog(false);
        }, 1000);
    };

    const onHide = () => {
        setShowDialog(false);
        setSelected([]);
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
        if (!values.FotoURL || !values?.IdPersonal) {
                toast.current.show({
                severity: 'warn',
                summary: 'No hay imagen para eliminar',
                life: 3000,
            });
            return;
        }

        try {
            const urlParts = values.FotoURL.split('/');
            const fileName = urlParts[urlParts.length - 1];

            const { error: deleteError } = await supabase.storage.from('personal-images').remove([fileName]);

            if (deleteError) {
                toast.current.show({
                    severity: 'error',
                    summary: 'Error al eliminar imagen',
                    detail: deleteError.message,
                    life: 4000,
                });
                return;
            }

            const { error: updateError } = await supabase.from('Personal').update({ FotoURL: null }).eq('IdPersonal', values.IdPersonal);

            if (updateError) {
                toast.current.show({
                    severity: 'error',
                    summary: 'Error al actualizar el personal',
                    detail: updateError.message,
                    life: 4000,
                });
                return;
            }

            setValues((prev) => ({
                ...prev,
                FotoURL: null,
            }));

            toast.current.show({
                severity: 'success',
                summary: 'Imagen eliminada',
                detail: 'Imagen eliminada y personal actualizado correctamente',
                life: 3000,
            });

            setActiveIndex(0)
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

        const code = selected[0]?.CodigoPersonal || values.CodigoPersonal || 'personal';
        const extension = file.name.split('.').pop().toLowerCase();
        const fileName = `${code}.${extension}`;

        const { error: uploadError } = await supabase.storage.from('personal-images').upload(fileName, file, { upsert: true });

        if (uploadError) {
            toast.current.show({
                severity: 'error',
                summary: 'Error al subir imagen',
                detail: uploadError.message,
            });
            return;
        }

        const { data: urlData, error: urlError } = supabase.storage.from('personal-images').getPublicUrl(fileName);

        if (urlError) {
            toast.current.show({
                severity: 'error',
                summary: 'Error al obtener URL pública',
                detail: urlError.message,
            });
            return;
        }

        const FotoURL = urlData?.publicUrl;

        setValues((prev) => ({
            ...prev,
            FotoURL: FotoURL,
        }));

        if (fileUploadRef.current) fileUploadRef.current.clear();

        if (values?.IdPersonal > 0) {
            const { error: updateError } = await supabase.from('Personal').update({ FotoURL: FotoURL }).eq('IdPersonal', values.IdPersonal);

            if (updateError) {
                toast.current.show({
                    severity: 'error',
                    summary: 'Error al actualizar personal',
                    detail: updateError.message,
                });
                return;
            }

            toast.current.show({
                severity: 'success',
                summary: 'Imagen subida',
                detail: 'Imagen asignada correctamente al personal.',
            });

            getInfo();
        } else {
            toast.current.show({
                severity: 'warn',
                summary: 'Personal aún no guardado',
                detail: 'Guarda el personal antes de subir la imagen.',
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
        <Dialog visible={showDialog} onHide={onHide} style={{ width: values?.IdPersonal > 0 ?'80%' : '60%' }} header={selected.length > 0 ? 'Editar Producto' : 'Agregar Producto'}>
            <Toast ref={toast} />

            <div style={{ display: 'flex', gap: '2rem' }}>
                <div  style={{ flex: 2 }}>
                    {/* Nombre y Apellido */}
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                        <div style={{ flex: 1 }}>
                        <FloatLabel>
                            <InputText
                                id="Nombre"
                                value={values.Nombre}
                                onChange={(e) => handleChange('Nombre', e.target.value)}
                                required
                                style={{ width: '100%' }}
                                className={errors.Nombre ? 'p-invalid' : ''}
                                disabled={!editable}
                                autoFocus
                            />
                            <label htmlFor="Nombre">Nombre</label>
                        </FloatLabel>
                        </div>

                        <div style={{ flex: 1 }}>
                        <FloatLabel>
                            <InputText
                                id="Apellido"
                                value={values.Apellido}
                                onChange={(e) => handleChange('Apellido', e.target.value)}
                                required
                                style={{ width: '100%' }}
                                className={errors.Apellido ? 'p-invalid' : ''}
                                disabled={!editable}
                            />
                            <label htmlFor="Apellido">Apellido</label>
                        </FloatLabel>
                        </div>
                    </div>

                    {/* Identidad y Plnilla */}
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                        <div style={{ flex: 1 }}>
                            <FloatLabel>
                                <InputText
                                    id="Identidad"
                                    value={values.Identidad}
                                    onChange={(e) => handleChange('Identidad', e.target.value)}
                                    style={{ width: '100%' }}
                                    disabled={!editable}
                                />
                                <label htmlFor="Identidad">Identidad</label>
                            </FloatLabel>
                        </div>

                        <div style={{ flex: 1 }}>
                            <FloatLabel>
                                <Dropdown
                                    id="IdTipoPlanilla"
                                    value={values.IdTipoPlanilla}
                                    options={tipoPlanillas}
                                    onChange={(e) => handleChange('IdTipoPlanilla', e.value)}
                                    placeholder="Seleccione una tipo de planilla"
                                    required
                                    optionLabel="TipoPlanilla"
                                    optionValue="IdTipoPlanilla"
                                    className={errors.IdTipoPlanilla ? 'p-invalid' : ''}
                                    style={{ width: '100%' }}
                                    disabled={!editable}
                                    showClear
                                />

                                <label htmlFor="IdTipoPlanilla">Tipi de Planilla</label>
                            </FloatLabel>
                        </div>
                    </div>

                    {/* Cargo y Sueldo */}
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                        <div style={{ flex: 1 }}>
                            <FloatLabel>
                                <Dropdown
                                    id="IdCargo"
                                    value={values.IdCargo}
                                    options={cargos}
                                    onChange={(e) => handleChange('IdCargo', e.value)}
                                    placeholder="Seleccione un cargo"
                                    required
                                    optionLabel="Cargo"
                                    optionValue="IdCargo"
                                    className={errors.IdCargo ? 'p-invalid' : ''}
                                    style={{ width: '100%' }}
                                    disabled={!editable}
                                    showClear
                                />

                                <label htmlFor="IdCargo">Cargo</label>
                            </FloatLabel>
                        </div>

                        <div style={{ flex: 1 }}>
                            <FloatLabel>
                                <InputNumber
                                    id="SueldoFijo"
                                    value={values.SueldoFijo}
                                    onChange={(e) => handleChange('SueldoFijo', e.value)}
                                    style={{ width: '100%' }}
                                    disabled={!editable}
                                    prefix='L '
                                    minFractionDigits={2}
                                    maxFractionDigits={2}
                                />
                                <label htmlFor="SueldoFijo">Sueldo Fijo</label>
                            </FloatLabel>
                        </div>
                    </div>
                </div>

                {values?.IdPersonal > 0 && (
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
                            disabled={values?.FotoURL}
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
                            {values.FotoURL && (
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

                            <h5>Foto Personal</h5>

                            {values.FotoURL ? (
                                <img
                                src={values.FotoURL}
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
        </>
    );
}

export default CRUDPersonal;
