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

const CategoriasCRUD = ({setShowDialog, showDialog, setSelected, selected, getInfo, editable= true, setActiveIndex}) => {
    const toast = useRef(null);
    const { user } = useUser();
    const [loading, setLoading] = useState(false);

    const initialValues = {
        IdCategory: -1,
    };

    const { values, setValues, handleChange, validateForm, errors } = useForm(initialValues);

    const rules = {
        Name: { required: true },
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
            .from('Categories')
            .select('*')
            .or(`Name.eq.${values.Name}`);

        if (errorDup) {
            console.error('Error verificando duplicados:', errorDup.message);
            setLoading(false);
            return;
        }

        const duplicado = clientesExistentes.find(c =>
            (c.Name === values.Name) &&
            c.IdCategory !== values.IdCategory
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
            Name: values?.Name,
            Description: values?.Description,
            IdStatus: 1,
            Date: getLocalDateTimeString(),
            IdUserEdit: user?.IdUser,
        };

        let error;

        if (values?.IdCategory > 0) {
            ({ error } = await supabase.from('Categories').update(datos).eq('IdCategory', values.IdCategory));
        } else {
            ({ error } = await supabase.from('Categories').insert([datos]));
        }

        if (error) {
            console.error('Error al guardar categoria:', error.message);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo guardar la categoria',
                life: 4000
            });
            setLoading(false);
            return;
        }

        setTimeout(() => {
            getInfo();
            setActiveIndex(4);
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
        <Dialog visible={showDialog} onHide={onHide} style={{ width: '60%' }} header={selected?.length > 0 ? 'Editar Categoria' : 'Nueva Categoria'}>
            <Toast ref={toast} />

            {/* Nombre y Identificacion */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <div style={{ flex: 1 }}>
                    <FloatLabel>
                        <InputText
                            id="Name"
                            value={values.Name}
                            onChange={(e) => handleChange('Name', e.target.value)}
                            style={{ width: '100%' }}
                            disabled={!editable}
                            className={errors.Name ? 'p-invalid' : ''}
                        />
                        <label htmlFor="Name">Nombre</label>
                    </FloatLabel>
                </div>

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
            </div>


            {/* Botones */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <Button label="Cancelar" className="p-button-secondary" onClick={onHide} disabled={loading} />
                <Button label="Guardar" onClick={guardarDatos} loading={loading} disabled={loading} />
            </div>
        </Dialog>
    );
}

export default CategoriasCRUD;
