import { Dialog } from 'primereact/dialog';
import React, { useEffect, useRef, useState } from 'react';
import useForm from '../../components/useForm';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { FloatLabel } from 'primereact/floatlabel';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { supabase } from '../../supabaseClient';
import { Toast } from 'primereact/toast';

const CRUDProducts = ({setShowDialog, showDialog, setSelected, selected, getInfo, editable= true}) => {
    const [categorias, setCategorias] = useState([]);
    const toast = useRef(null);
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
        PrecioCompra: { required: true, message: 'Precio de compra requerido' },
        PrecioVenta: { required: true, message: 'Precio de venta requerido' },
        PorcentajeGanancia: { required: true, message: 'Porcentaje requerido' },
        ISV: { required: values?.Excento ? false : true, message: 'Porcentaje requerido' },
    };

    const getValoresIniciales = async () => {
        const { data, error } = await supabase.from('Categories').select('*');
        if (!error) setCategorias(data);

        if(selected.length > 0){
            setValues(selected[0]);
        } else {
            setValues(initialValues);
        }
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
            Excento: values.Excento,
            ISV: values.ISV,
            PorcentajeGanancia: values.PorcentajeGanancia,
            PrecioCompra: values.PrecioCompra,
            PrecioVenta: values.PrecioVenta,
            IdStatus: values?.IdStatus ? values?.IdStatus : 1,
        };

        let data, error;

        if (values?.IdProduct > 0) {
            ({ data, error } = await supabase.from('Products').update(Datos).eq('IdProduct', values.IdProduct));
        } else {
            ({ data, error } = await supabase.from('Products').insert([Datos]));
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

    const calcularPrecioVenta = () => {
        const precioCompra = parseFloat(values.PrecioCompra) || 0;
        const isv = parseFloat(values.ISV) || 0;
        const ganancia = parseFloat(values.PorcentajeGanancia) || 0;

        const montoGanancia = precioCompra * (ganancia / 100);
        const montoISV = values.Excento ? 0 : precioCompra * (isv / 100);

        const precioVenta = precioCompra + montoGanancia + montoISV;

        setValues(prev => ({ ...prev, PrecioVenta: precioVenta.toFixed(2) }));
    };

    useEffect(() => {
        if(values?.PrecioCompra && values?.ISV && values?.PorcentajeGanancia){
            calcularPrecioVenta();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [values?.Excento, values?.PrecioCompra, values?.ISV, values?.PorcentajeGanancia]);

    useEffect(() => {
        if(values?.Excento){
            setValues({
                ...values,
                ISV: 0,
            });
            calcularPrecioVenta();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [values.Excento]);

    useEffect(() => {
        if(showDialog){
            getValoresIniciales();
        }
    }, [showDialog]);

    return (
        <Dialog visible={showDialog} onHide={onHide} style={{ width: '60%' }} header={selected.length > 0 ? 'Editar Producto' : 'Agregar Producto'}>
            <Toast ref={toast} />
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
                        />

                        <label htmlFor="IdCategory">Categoría</label>
                    </FloatLabel>
                </div>
            </div>

            {/* ISV y Porcentaje Ganancia */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                {/* Exento Checkbox (alineado a la izquierda) */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Checkbox
                        inputId="Excento"
                        checked={values.Excento || false}
                        onChange={(e) => handleChange('Excento', e.checked)}
                        disabled={!editable}
                    />
                    <label htmlFor="Excento" className="p-checkbox-label" style={{ marginLeft: '0.5rem' }}>
                    Exento
                    </label>
                </div>
                <div style={{ flex: 1 }}>
                <FloatLabel>
                    <InputNumber
                        id="ISV"
                        disabled={values?.Excento || !editable}
                        value={values.ISV}
                        onChange={(e) => handleChange('ISV', e.value)}
                        style={{ width: '90%' }}
                        suffix=' %'
                        className={errors.ISV ? 'p-invalid' : ''}
                    />
                    <label htmlFor="ISV">ISV</label>
                </FloatLabel>
                </div>

                <div style={{ flex: 1, marginLeft: '-0.5rem' }}>
                <FloatLabel>
                    <InputNumber
                        id="PorcentajeGanancia"
                        value={values.PorcentajeGanancia}
                        onChange={(e) => handleChange('PorcentajeGanancia', e.value)}
                        style={{ width: '100%' }}
                        suffix=' %'
                        disabled={!editable}
                        className={errors.PorcentajeGanancia ? 'p-invalid' : ''}
                    />
                    <label htmlFor="PorcentajeGanancia">Porcentaje Ganancia</label>
                </FloatLabel>
                </div>
            </div>

            {/* Precio Compra y Precio Venta */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <div style={{ flex: 1 }}>
                <FloatLabel>
                    <InputNumber
                        id="PrecioCompra"
                        value={values.PrecioCompra}
                        onChange={(e) => handleChange('PrecioCompra', e.value)}
                        required
                        style={{ width: '100%' }}
                        minFractionDigits={3}
                        maxFractionDigits={3}
                        disabled={!editable}
                        className={errors.PrecioCompra ? 'p-invalid' : ''}
                    />
                    <label htmlFor="PrecioCompra">Precio Compra</label>
                </FloatLabel>
                </div>

                <div style={{ flex: 1 }}>
                    <FloatLabel>
                        <InputNumber
                            id="PrecioVenta"
                            value={values.PrecioVenta}
                            onChange={(e) => handleChange('PrecioVenta', e.value)}
                            required
                            style={{ width: '100%' }}
                            disabled={!editable}
                            className={errors.PrecioVenta ? 'p-invalid' : ''}
                        />
                        <label htmlFor="PrecioVenta">Precio Venta</label>
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

export default CRUDProducts;
