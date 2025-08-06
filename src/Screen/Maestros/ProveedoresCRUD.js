import React, { useEffect, useRef, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { FloatLabel } from 'primereact/floatlabel';
import { Toast } from 'primereact/toast';

import useForm from '../../components/useForm';
import { supabase } from '../../supabaseClient';
import { useUser } from '../../context/UserContext';
import getLocalDateTimeString from '../../utils/funciones';

const ProveedoresCRUD = ({setShowDialog, showDialog, setSelected, selected, getInfo, editable= true, setActiveIndex}) => {
    const toast = useRef(null);
    const { user } = useUser();
    const [loading, setLoading] = useState(false);

    const initialValues = {
        IdVendor: -1,
    };

    const { values, setValues, handleChange, validateForm, errors } = useForm(initialValues);

    const rules = {
        VendorName: { required: true },
    };

    const getValoresIniciales = async () => {
        if(selected?.length > 0){
            setValues({
                ...selected[0],
            })
        }
    };

    const guardarDatos = async (e) => {
        e.preventDefault();

        if (!validateForm(rules)) {
            console.log('Formulario con errores', errors);
            return;
        }

        setLoading(true);

        // Verificar duplicados
        const { data: proveedoresExistentes, error: errorDup } = await supabase
            .from('Vendors')
            .select('*')
            .or(`VendorName.eq.${values.VendorName},RTN.eq.${values.RTN}`);

        if (errorDup) {
            console.error('Error verificando duplicados:', errorDup.message);
            setLoading(false);
            return;
        }

        const duplicado = proveedoresExistentes.find(p =>
            (p.VendorName === values.VendorName || p.RTN === values.RTN) &&
            p.IdVendor !== values.IdVendor
        );

        if (duplicado) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Duplicado detectado',
                detail: 'Ya existe un proveedor con el mismo nombre o RTN.',
                life: 4000
            });
            setLoading(false);
            return;
        }

        const datos = {
            VendorName: values?.VendorName,
            Description: values?.Description,
            RTN: values?.RTN,
            IdStatus: 1,
            Date: getLocalDateTimeString(),
            IdUserEdit: user?.IdUser,
        };

        let error;

        if (values?.IdVendor > 0) {
            ({ error } = await supabase.from('Vendors').update(datos).eq('IdVendor', values.IdVendor));
        } else {
            ({ error } = await supabase.from('Vendors').insert([datos]));
        }

        if (error) {
            console.error('Error al guardar proveedor:', error.message);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo guardar el proveedor',
                life: 4000
            });
            setLoading(false);
            return;
        }

        setTimeout(() => {
            getInfo();
            setActiveIndex(2);
            setShowDialog(false);
            setLoading(false);
        }, 800);
    };


    const onHide = () => {
        setShowDialog(false);
        setSelected([]);
    };

    useEffect(() => {
        if(showDialog){
            getValoresIniciales();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showDialog]);


    return (
        <Dialog visible={showDialog} onHide={onHide} style={{ width: '60%' }} header={selected?.length > 0 ? 'Editar Proveedor' : 'Agregar Proveedor'}>
            <Toast ref={toast} />

            {/* Nombre y Identificacion */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <div style={{ flex: 1 }}>
                    <FloatLabel>
                        <InputText
                            id="VendorName"
                            value={values.VendorName}
                            onChange={(e) => handleChange('VendorName', e.target.value)}
                            style={{ width: '100%' }}
                            disabled={!editable}
                            className={errors.VendorName ? 'p-invalid' : ''}
                        />
                        <label htmlFor="VendorName">Nombre</label>
                    </FloatLabel>
                </div>

                <div style={{ flex: 1 }}>
                    <FloatLabel>
                        <InputText
                            id="RTN"
                            value={values.RTN}
                            onChange={(e) => handleChange('RTN', e.target.value)}
                            style={{ width: '100%' }}
                            disabled={!editable}
                        />
                        <label htmlFor="RTN">RTN</label>
                    </FloatLabel>
                </div>
            </div>

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
                        <label htmlFor="Description">Comentario</label>
                    </FloatLabel>
                </div>
                <div style={{ flex: 1 }}>
                </div>
            </div>


            {/* Botones */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <Button label="Cancelar" className="p-button-secondary" onClick={onHide} disabled={loading} />
                <Button label="Guardar" onClick={guardarDatos} loading={loading} disabled={loading} />
            </div>
        </Dialog>
    );
}

export default ProveedoresCRUD;
