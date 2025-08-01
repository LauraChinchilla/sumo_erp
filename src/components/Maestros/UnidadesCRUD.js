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

const UnidadesCRUD = ({setShowDialog, showDialog, setSelected, selected, getInfo, editable= true, setActiveIndex}) => {
    const toast = useRef(null);
    const { user } = useUser();
    const [loading, setLoading] = useState(false);

    const initialValues = {
        IdUnit: -1,
    };

    const { values, setValues, handleChange, validateForm, errors } = useForm(initialValues);

    const rules = {
        UnitName: { required: true },
        UnitSymbol: { required: true },
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
            .from('Units')
            .select('*')
            .or(`UnitName.eq.${values.UnitName}`);

        if (errorDup) {
            console.error('Error verificando duplicados:', errorDup.message);
            setLoading(false);
            return;
        }

        const duplicado = clientesExistentes.find(c =>
            (c.UnitName === values.UnitName) &&
            c.IdUnit !== values.IdUnit
        );

        if (duplicado) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Duplicado detectado',
                detail: 'Ya existe una categoria con el mismo nombre',
                life: 4000
            });
            setLoading(false);
            return;
        }

        const datos = {
            UnitName: values?.UnitName,
            UnitSymbol: values?.UnitSymbol,
            Description: values?.Description,
            IdStatus: 1,
            Date: getLocalDateTimeString(),
            IdUserEdit: user?.IdUser,
        };

        let error;

        if (values?.IdUnit > 0) {
            ({ error } = await supabase.from('Units').update(datos).eq('IdUnit', values.IdUnit));
        } else {
            ({ error } = await supabase.from('Units').insert([datos]));
        }

        if (error) {
            console.error('Error al guardar unidad:', error.message);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo guardar la unidad',
                life: 4000
            });
            setLoading(false);
            return;
        }

        setTimeout(() => {
            getInfo();
            setActiveIndex(5);
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
        <Dialog visible={showDialog} onHide={onHide} style={{ width: '60%' }} header={selected?.length > 0 ? 'Editar Unidad' : 'Nueva Unidad'}>
            <Toast ref={toast} />

            {/* Nombre y Identificacion */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <div style={{ flex: 1 }}>
                    <FloatLabel>
                        <InputText
                            id="UnitName"
                            value={values.UnitName}
                            onChange={(e) => handleChange('UnitName', e.target.value)}
                            style={{ width: '100%' }}
                            disabled={!editable}
                            className={errors.UnitName ? 'p-invalid' : ''}
                        />
                        <label htmlFor="UnitName">Nombre</label>
                    </FloatLabel>
                </div>

                <div style={{ flex: 1 }}>
                     <FloatLabel>
                        <InputText
                            id="UnitSymbol"
                            value={values.UnitSymbol}
                            onChange={(e) => handleChange('UnitSymbol', e.target.value)}
                            style={{ width: '100%' }}
                            disabled={!editable}
                        />
                        <label htmlFor="UnitSymbol">Simbolo</label>
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

export default UnidadesCRUD;
