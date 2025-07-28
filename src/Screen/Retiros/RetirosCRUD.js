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
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';

const RetirosCRUD = ({setShowDialog, showDialog, setSelected, selected, getInfo, editable= true}) => {
    const toast = useRef(null);
    const { user } = useUser();
    const [loading, setLoading] = useState(false);
    const [tipoRetiros, setTipoRetiros] = useState([]);

    const initialValues = {
        IdRetiro: -1,
    };

    const { values, setValues, handleChange, validateForm, errors } = useForm(initialValues);

    const rules = {
        IdTipoRetiro: { required: true },
    };

    const getValoresIniciales = async () => {
        const { data, error } = await supabase.from('TipoRetiros').select('*');
        if (!error) setTipoRetiros(data);
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

        const datos = {
            IdTipoRetiro: values?.IdTipoRetiro,
            Comentario: values?.Comentario,
            IdStatus: 1,
            Date: getLocalDateTimeString(),
            IdUserEdit: user?.IdUser,
        };

        let error;

        if (values?.IdRetiro > 0) {
            ({ error } = await supabase.from('Retiros').update(datos).eq('IdRetiro', values.IdRetiro));
        } else {
            ({ error } = await supabase.from('Retiros').insert([datos]));
        }

        if (error) {
            console.error('Error al guardar el retiro:', error.message);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo guardar el retiro',
                life: 4000
            });
            setLoading(false);
            return;
        }

        setTimeout(() => {
            getInfo();
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
        <Dialog visible={showDialog} onHide={onHide} style={{ width: '60%' }} header={selected?.length > 0 ? 'Editar Retiro' : 'Nueva Retiro'}>
            <Toast ref={toast} />

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <div style={{ flex: 1 }}>
                    <FloatLabel>
                         <Dropdown
                            id="IdTipoRetiro"
                            value={values.IdTipoRetiro}
                            options={tipoRetiros}
                            onChange={(e) => handleChange('IdTipoRetiro', e.value)}
                            placeholder="Seleccione una tipo"
                            required
                            optionLabel="TipoRetiro"
                            optionValue="IdTipoRetiro"
                            className={errors.IdTipoRetiro ? 'p-invalid' : ''}
                            style={{ width: '100%' }}
                            disabled={!editable}
                            showClear
                        />
                        <label htmlFor="IdTipoRetiro">Tipo Retiro</label>
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

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <div style={{ flex: 1 }}>

                </div>

                <div style={{ flex: 1 }}>
                    <FloatLabel>
                        <InputNumber
                            id="Monto"
                            value={values.Monto}
                            onChange={(e) => handleChange('Monto', e.value)}
                            style={{ width: '100%' }}
                            disabled={!editable}
                            prefix='L '
                        />
                        <label htmlFor="Monto">Monto</label>
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

export default RetirosCRUD;
