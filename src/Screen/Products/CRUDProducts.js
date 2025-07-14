import { Dialog } from 'primereact/dialog';
import React, { useEffect, useState } from 'react';
import useForm from '../../components/useForm';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { FloatLabel } from 'primereact/floatlabel';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { supabase } from '../../supabaseClient';



const CRUDProducts = ({setShowDialog, showDialog, setSelected, selected, getInfo}) => {
    const [categorias, setCategorias] = useState([])
    const initialValues = {
        IdProduct: -1,
        Name: '',
        Code: '',
        Description: '',
    };
    

    const { values, setValues, handleChange } = useForm(initialValues);

    const getValoresIniciales = async () => {
        const { data, error } = await supabase.from('Categories').select('*');
        if (!error) setCategorias(data);
    }


    const guardarDatos = (e) => {
        e.preventDefault();
        console.log('Valores a guardar:', values);
        // Aquí llamas a tu API o supabase para guardar
    };

    const onHide = () => {
        setShowDialog(false)
        setSelected([])
    }

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
            calcularPrecioVenta()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [values?.Excento, values?.PrecioCompra, values?.ISV, values?.PorcentajeGanancia])

    useEffect(() => {
        if(values?.Excento){
            setValues({
                ...values,
                ISV: 0,
            })
            calcularPrecioVenta()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [values.Excento])

    useEffect(() => {
        if(showDialog){
            getValoresIniciales()
        }
    }, [showDialog]);

  return (
    <Dialog visible={showDialog} onHide={onHide} style={{ width: '60%' }} header={selected.length > 0 ? 'Editar Producto' : 'Agregar Producto'}>
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
                    />
                    <label htmlFor="Description">Descripción</label>
                </FloatLabel>
            </div>

            <div style={{ flex: 1 }}>
                <FloatLabel>
                    <Dropdown
                        id="Category"
                        value={values.Category}
                        options={categorias}
                        onChange={(e) => handleChange('Category', e.value)}
                        placeholder="Seleccione una categoría"
                        required
                        optionLabel="Name"
                        optionValue="IdCategory"
                        style={{ width: '100%' }}
                    />

                    <label htmlFor="Category">Categoría</label>
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
                />
                <label htmlFor="Excento" className="p-checkbox-label" style={{ marginLeft: '0.5rem' }}>
                Exento
                </label>
            </div>
            <div style={{ flex: 1 }}>
            <FloatLabel>
                <InputNumber
                    id="ISV"
                    disabled={values?.Excento}
                    value={values.ISV}
                    onChange={(e) => handleChange('ISV', e.value)}
                    style={{ width: '90%' }}
                    suffix=' %'
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
                />
                <label htmlFor="PrecioVenta">Precio Venta</label>
            </FloatLabel>
            </div>
        </div>

        {/* Botones */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <Button label="Cancelar" className="p-button-secondary" onClick={onHide} />
            <Button label="Guardar" onClick={guardarDatos} />
        </div>

    </Dialog>
  );
}

export default CRUDProducts
