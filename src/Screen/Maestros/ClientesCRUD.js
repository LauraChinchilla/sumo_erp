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

const ClientesCRUD = ({setShowDialog, showDialog, setSelected, selected, getInfo, editable= true, setActiveIndex}) => {
    const toast = useRef(null);
    const { user } = useUser();
    const [loading, setLoading] = useState(false);

    const initialValues = {
        IdCliente: -1,
    };

    const { values, setValues, handleChange, validateForm, errors } = useForm(initialValues);

    const rules = {
        NombreCompleto: { required: true },
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
        const { data: clientesExistentes, error: errorDup } = await supabase
            .from('Clientes')
            .select('*')
            .or(`NombreCompleto.eq.${values.NombreCompleto},RTN.eq.${values.RTN},Identificacion.eq.${values.Identificacion}`);

        if (errorDup) {
            console.error('Error verificando duplicados:', errorDup.message);
            setLoading(false);
            return;
        }

        const duplicado = clientesExistentes.find(c =>
            (c.NombreCompleto === values.NombreCompleto || c.RTN === values.RTN  || c.Identificacion === values.Identificacion) &&
            c.IdCliente !== values.IdCliente
        );

        if (duplicado) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Duplicado detectado',
                detail: 'Ya existe un cliente con el mismo nombre, RTN. o identidad',
                life: 4000
            });
            setLoading(false);
            return;
        }

        const datos = {
            NombreCompleto: values?.NombreCompleto,
            Identificacion: values?.Identificacion,
            Comentario: values?.Comentario,
            RTN: values?.RTN,
            IdStatus: 1,
            Date: getLocalDateTimeString(),
            IdUserEdit: user?.IdUser,
        };

        let error;

        if (values?.IdCliente > 0) {
            ({ error } = await supabase.from('Clientes').update(datos).eq('IdCliente', values.IdCliente));
        } else {
            ({ error } = await supabase.from('Clientes').insert([datos]));
        }

        if (error) {
            console.error('Error al guardar cliente:', error.message);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo guardar el cliente',
                life: 4000
            });
            setLoading(false);
            return;
        }

        setTimeout(() => {
            getInfo();
            setActiveIndex(1);
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
        <Dialog visible={showDialog} onHide={onHide} style={{ width: '60%' }} header={selected?.length > 0 ? 'Editar Cliente' : 'Nueva Cliente'}>
            <Toast ref={toast} />

            {/* Nombre y Identificacion */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <div style={{ flex: 1 }}>
                    <FloatLabel>
                        <InputText
                            id="NombreCompleto"
                            value={values.NombreCompleto}
                            onChange={(e) => handleChange('NombreCompleto', e.target.value)}
                            style={{ width: '100%' }}
                            disabled={!editable}
                            className={errors.NombreCompleto ? 'p-invalid' : ''}
                        />
                        <label htmlFor="NombreCompleto">Nombre Completo</label>
                    </FloatLabel>
                </div>

                <div style={{ flex: 1 }}>
                    <FloatLabel>
                        <InputText
                            id="Identificacion"
                            value={values.Identificacion}
                            onChange={(e) => handleChange('Identificacion', e.target.value)}
                            style={{ width: '100%' }}
                            disabled={!editable}
                        />
                        <label htmlFor="Identificacion">Identificacion</label>
                    </FloatLabel>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
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

                <div style={{ flex: 1 }}>
                    <FloatLabel>
                        <InputText
                            id="Comentario"
                            value={values.Comentario}
                            onChange={(e) => handleChange('Comentario', e.target.value)}
                            style={{ width: '100%' }}
                            disabled={!editable}
                        />
                        <label htmlFor="Comentario">Comentario</label>
                    </FloatLabel>
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

export default ClientesCRUD;
