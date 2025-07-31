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

const CRUDMovimientos = ({setShowDialog, showDialog, setSelected, selected, getInfo, editable= true }) => {
    const toast = useRef(null);
    const { user } = useUser();
    const [loading, setLoading] = useState(false);
    const [tipoMovimientos, setTipoMovimientos] = useState([]);
    const [categorias, setCategorias] = useState([]);

    const initialValues = {
        IdMovimiento: -1,
    };

    const { values, setValues, handleChange, validateForm, errors } = useForm(initialValues);

    const rules = {
        IdTipoMovimiento: { required: true },
        IdCategoria: { required: true },
        Monto: { required: true },
    };

    const getValoresIniciales = async () => {
        const { data, error } = await supabase.from('TipoMovimiento').select('*');
        if (!error) setTipoMovimientos(data);

        const { data: data2, error: error2 } = await supabase.from('CategoriaMov').select('*');
        if (!error2) setCategorias(data2);

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
            IdTipoMovimiento: values?.IdTipoMovimiento,
            IdCategoria: values?.IdCategoria,
            Descripcion: values?.Descripcion,
            Monto: values?.Monto,
            IdStatus: 8,
            Date: getLocalDateTimeString(),
            IdUser: user?.IdUser,
        };

        let error;

        if (values?.IdMovimiento > 0) {
            ({ error } = await supabase.from('CajaMovimientos').update(datos).eq('IdMovimiento', values.IdMovimiento));
        } else {
            ({ error } = await supabase.from('CajaMovimientos').insert([datos]));
        }

        if (error) {
            console.error('Error al guardar el movimiento:', error.message);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo guardar el movimiento',
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
        <Dialog visible={showDialog} onHide={onHide} style={{ width: '60%' }} header={selected?.length > 0 ? 'Editar Movimiento' : 'Nuevo Movimiento'}>
            <Toast ref={toast} />

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>

                <div style={{ flex: 1 }}>
                    <FloatLabel>
                        <Dropdown
                            id="IdCategoria"
                            value={values.IdCategoria}
                            options={categorias}
                            onChange={(e) => handleChange('IdCategoria', e.value)}
                            placeholder="Seleccione una categoria"
                            required
                            optionLabel="Categoria"
                            optionValue="IdCategoria"
                            className={errors.IdCategoria ? 'p-invalid' : ''}
                            style={{ width: '100%' }}
                            disabled={!editable}
                        />

                        <label htmlFor="IdCategoria">Categoria</label>
                    </FloatLabel>
                </div>

                <div style={{ flex: 1 }}>
                    <FloatLabel>
                        <Dropdown                            
                            id="IdTipoMovimiento"
                            value={values.IdTipoMovimiento}
                            options={tipoMovimientos}
                            onChange={(e) => handleChange('IdTipoMovimiento', e.value)}
                            placeholder="Seleccione un tipo de movimiento"
                            required
                            optionLabel="Movimiento"
                            optionValue="IdTipoMovimiento"
                            className={errors.IdTipoMovimiento ? 'p-invalid' : ''}
                            style={{ width: '100%' }}
                            disabled={!editable}
                        />

                        <label htmlFor="IdTipoMovimiento">Tipo de Movimiento</label>
                    </FloatLabel>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <div style={{ flex: 1 }}>
                    <FloatLabel>
                        <InputText
                            id="Descripcion"
                            value={values.Descripcion}
                            onChange={(e) => handleChange('Descripcion', e.target.value)}
                            style={{ width: '100%' }}
                            disabled={!editable}
                        />
                        <label htmlFor="Descripcion">Descripcion</label>
                    </FloatLabel>
                </div>

                <FloatLabel>
                    <InputNumber
                        id="Monto"
                        value={values.Monto}
                        onChange={(e) => handleChange('Monto', e.value)}
                        style={{ width: '100%' }}
                        disabled={!editable}
                        className={errors.Monto ? 'p-invalid' : ''}
                        prefix='L '
                        minFractionDigits={2}
                        maxFractionDigits={2}
                    />
                    <label htmlFor="Monto">Monto</label>
                </FloatLabel>
            </div>

            {/* Botones */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <Button label="Cancelar" className="p-button-secondary" onClick={onHide} disabled={loading} />
                <Button label="Guardar" onClick={guardarDatos} loading={loading} disabled={loading} />
            </div>
        </Dialog>
    );
}

export default CRUDMovimientos;
