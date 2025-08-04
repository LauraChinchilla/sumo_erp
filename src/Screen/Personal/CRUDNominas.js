import { Dialog } from 'primereact/dialog';
import React, { useEffect, useRef, useState } from 'react';
import useForm from '../../components/useForm';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { FloatLabel } from 'primereact/floatlabel';
import { Dropdown } from 'primereact/dropdown';
import { supabase } from '../../supabaseClient';
import { Toast } from 'primereact/toast';
import { InputNumber } from 'primereact/inputnumber';
import getLocalDateTimeString from '../../utils/funciones';
import { useUser } from '../../context/UserContext';

const CRUDNominas = ({setShowDialog, showDialog, setSelected, selected, getInfo, setActiveIndex, editable= true}) => {
    const [personal, setPersonal] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user } = useUser();
    const toast = useRef(null);

    const initialValues = {
        IdNomina: -1,
    };

    const { values, setValues, handleChange, validateForm, errors } = useForm(initialValues);

    const rules = {
        IdPersonal: { required: true, message: 'El código es obligatorio' },
        Monto: { required: true, message: 'El nombre es obligatorio' },
    };

    const getValoresIniciales = async () => {
        setLoading(true)
        const { data, error } = await supabase.from('vta_personal').select('*');
        if (!error) setPersonal(data);


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
            IdPersonal: values.IdPersonal,
            Monto: values.Monto,
            Comentario: values.Comentario,
            IdStatus: 10,
            Date: getLocalDateTimeString(),
            IdUser: user?.IdUser,
        };

        let { error } = await supabase.from('Nominas').insert([Datos]);

        setLoading(false);

        if (error) {
            console.error('Error al guardar la nomina:', error.message);
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
            detail: 'Nomina agregada correctamente',
            life: 3000,
        });

        setTimeout(() => {
            setActiveIndex(1)
            getInfo();
            setShowDialog(false);
        }, 1000);
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
        <>
            <Dialog visible={showDialog} onHide={onHide} style={{ width: values?.IdPersonal > 0 ?'80%' : '60%' }} header={'Agregar Nomina'}>
                <Toast ref={toast} />

                <div style={{ display: 'flex', gap: '2rem' }}>
                    <div  style={{ flex: 2 }}>
                        {/* Personal */}
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                            <div style={{ flex: 1 }}>
                                <FloatLabel>
                                    <Dropdown
                                        id="IdPersonal"
                                        value={values.IdPersonal}
                                        options={personal}
                                        onChange={(e) => {
                                            const selected = personal.find(p => p.IdPersonal === e.value);

                                            handleChange('IdPersonal', e.value);
                                            handleChange('SueldoFijo', selected?.SueldoFijo ?? 0);
                                            handleChange('Identidad', selected?.Identidad ?? '');
                                        }}
                                        placeholder="Seleccione el personal"
                                        required
                                        optionLabel="NombreCompleto"
                                        optionValue="IdPersonal"
                                        className={errors.IdPersonal ? 'p-invalid' : ''}
                                        style={{ width: '100%' }}
                                        disabled={!editable}
                                        showClear
                                    />
                                    <label htmlFor="IdPersonal">Personal</label>
                                </FloatLabel>
                            </div>

                            <div style={{ flex: 1 }}>
                                <FloatLabel>
                                    <InputText
                                        id="Identidad"
                                        value={values.Identidad}
                                        onChange={(e) => handleChange('Identidad', e.target.value)}
                                        required
                                        style={{ width: '100%' }}
                                        className={errors.Identidad ? 'p-invalid' : ''}
                                        disabled={true}
                                    />
                                    <label htmlFor="Identidad">Identidad</label>
                                </FloatLabel>
                            </div>
                        </div>

                        {/* Comentario */}
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                            <div style={{ flex: 1 }}>
                                <FloatLabel>
                                    <InputText
                                        id="Comentario"
                                        value={values.Comentario}
                                        onChange={(e) => handleChange('Comentario', e.target.value)}
                                        required
                                        style={{ width: '100%' }}
                                        className={errors.Comentario ? 'p-invalid' : ''}
                                        disabled={!editable}
                                    />
                                    <label htmlFor="Comentario">Comentario</label>
                                </FloatLabel>
                            </div>
                        </div>

                        {/* Monto y Sueldo */}
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                            <div style={{ flex: 1 }}>
                                <FloatLabel>
                                    <InputNumber
                                        id="SueldoFijo"
                                        value={values.SueldoFijo}
                                        onChange={(e) => handleChange('SueldoFijo', e.value)}
                                        style={{ width: '100%' }}
                                        disabled={true}
                                        prefix='L '
                                        minFractionDigits={2}
                                        className={errors.SueldoFijo ? 'p-invalid' : ''}
                                        maxFractionDigits={2}
                                    />
                                    <label htmlFor="SueldoFijo">Sueldo Fijo</label>
                                </FloatLabel>
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
                                        minFractionDigits={2}
                                        className={errors.Monto ? 'p-invalid' : ''}
                                        maxFractionDigits={2}
                                    />
                                    <label htmlFor="Monto">Monto</label>
                                </FloatLabel>
                            </div>
                        </div>
                    </div>
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

export default CRUDNominas;
