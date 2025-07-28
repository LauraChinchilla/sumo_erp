import { Dialog } from 'primereact/dialog';
import React, { useEffect, useRef, useState } from 'react';
import useForm from '../../components/useForm';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { FloatLabel } from 'primereact/floatlabel';
import { InputNumber } from 'primereact/inputnumber';
import { supabase } from '../../supabaseClient';
import { Toast } from 'primereact/toast';
import { useUser } from '../../context/UserContext';
import { Dropdown } from 'primereact/dropdown';
import getLocalDateTimeString from '../../utils/funciones';
import CRUDProducts from '../Products/CRUDProducts';

const CRUDEntradas = ({setShowDialog, showDialog, setSelected, selected, getInfo, editable= true}) => {
    const toast = useRef(null);
    const { user } = useUser();
    const [loading, setLoading] = useState(false);
    const [proveedores, setProveedores] = useState([]);
    const [productos, setProductos] = useState([]);
    const [showDialogProducto, setShowDialogProducto] = useState(false);
    

    const initialValues = {
        IdEntrada: -1,
        PorcentajeGanancia: 30,
        ISV: 15,
    };

    const { values, setValues, handleChange, validateForm, errors } = useForm(initialValues);

    const rules = {
        Cantidad: { required: true, message: 'Debe seleccionar una categoría' },
        PrecioCompra: { required: true, message: 'Precio de compra requerido' },
        PrecioVenta: { required: true, message: 'Precio de venta requerido' },
        PorcentajeGanancia: { required: true, message: 'Porcentaje requerido' },
        ISV: { required: values?.Excento ? false : true, message: 'Porcentaje requerido' },
    };

    const getValoresIniciales = async () => {
        const { data, error } = await supabase.from('Vendors').select('*');
        if (!error) setProveedores(data);
        const { data: data2 } = await supabase.from('vta_products').select('*').eq('IdStatus',1);
        setProductos(data2)
        if(selected?.length > 0){
            setValues({
                ...selected[0],
                PorcentajeGanancia: 30,
                ISV: 15,
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

        const entrada = {
            IdProduct: values?.IdProduct,
            Excento: values.Excento,
            ISV: values.ISV,
            PorcentajeGanancia: values.PorcentajeGanancia,
            PrecioCompra: values.PrecioCompra,
            PrecioVenta: values.PrecioVenta,
            IdStatus: 3,
            IdUserCreate: user?.IdUser,
            Date: getLocalDateTimeString(),
            IdVendor: values?.IdVendor,
            Description: values?.Description || '',
            Cantidad: values?.Cantidad,
            IdCurrency: 1,
        };

        // Paso 1: Insertar entrada
        const { error: errorEntrada } = await supabase
            .from('Entradas')
            .insert([entrada]);

        if (errorEntrada) {
            console.error('Error al guardar entrada:', errorEntrada.message);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo guardar la entrada',
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showDialog]);

    useEffect(() => {
        const { ISV, PrecioCompra, PorcentajeGanancia } = values;

        const tieneValores = (parseFloat(ISV) > 0 || parseFloat(PrecioCompra) > 0 || parseFloat(PorcentajeGanancia) > 0);

        if (tieneValores && values.Excento) {
            setValues(prev => ({ ...prev, Excento: false }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [values.ISV, values.PrecioCompra, values.PorcentajeGanancia]);


    return (
        <Dialog visible={showDialog} onHide={onHide} style={{ width: '60%' }} header={'Nueva Entrada'}>
            <Toast ref={toast} />
            {/* Código y Nombre */}


            {selected?.length > 0 ? (
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
                                disabled
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
                                disabled
                            />
                            <label htmlFor="Name">Nombre</label>
                        </FloatLabel>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                    <div style={{ flex: 1 }}>
                        <FloatLabel>
                            <Dropdown
                                id="IdProduct"
                                value={values.IdProduct}
                                options={productos}
                                onChange={(e) => {
                                const selectedProduct = productos.find(p => p.IdProduct === e.value);
                                    if (selectedProduct) {
                                        setValues(prev => ({
                                            ...prev,
                                            IdProduct: selectedProduct.IdProduct,
                                            Code: selectedProduct.Code,
                                            Name: selectedProduct.Name,
                                            categoryname: selectedProduct.categoryname,
                                            PorcentajeGanancia: 30,
                                            ISV: 15,
                                            UnitName: selectedProduct.UnitName,
                                        }));
                                    } else {
                                        setValues(prev => ({ ...prev, IdProduct: null }));
                                    }
                                }}
                                placeholder="Seleccione un producto"
                                required
                                optionLabel="productoconcat"
                                optionValue="IdProduct"
                                className={errors.IdProduct ? 'p-invalid' : ''}
                                style={{ width: '100%' }}
                                disabled={!editable}
                            />
                            <label htmlFor="IdProduct">Producto</label>
                        </FloatLabel>
                    </div>
                </div>
            )}

            {/* Descripción y Proveedor */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <div style={{ flex: 1 }}>
                    <FloatLabel>
                        <InputText
                            id="categoryname"
                            value={values.categoryname}
                            onChange={(e) => handleChange('categoryname', e.target.value)}
                            style={{ width: '100%' }}
                            disabled={true}
                        />
                        <label htmlFor="categoryname">Categoría</label>
                    </FloatLabel>
                </div>

                <div style={{ flex: 1 }}>
                    <FloatLabel>
                        <Dropdown
                            id="IdVendor"
                            value={values.IdVendor}
                            options={proveedores}
                            onChange={(e) => handleChange('IdVendor', e.value)}
                            placeholder="Seleccione una proveedor"
                            required
                            optionLabel="VendorName"
                            optionValue="IdVendor"
                            className={errors.IdVendor ? 'p-invalid' : ''}
                            style={{ width: '100%' }}
                            disabled={!editable}
                        />

                        <label htmlFor="IdVendor">Proveedor</label>
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
                        prefix='L '
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
                            prefix='L '
                            style={{ width: '100%' }}
                            disabled={!editable}
                            className={errors.PrecioVenta ? 'p-invalid' : ''}
                        />
                        <label htmlFor="PrecioVenta">Precio Venta</label>
                    </FloatLabel>
                </div>
            </div>

            {/* Cantidad */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <div style={{ flex: 1 }}>

                </div>


                <div style={{ flex: 1 }}>
                    <FloatLabel>
                        <InputNumber
                            id="Cantidad"
                            value={values.Cantidad}
                            onChange={(e) => handleChange('Cantidad', e.value)}
                            style={{ width: '100%' }}
                            disabled={!editable}
                            suffix={` ${values?.UnitName}`}
                            className={errors.Cantidad ? 'p-invalid' : ''}
                            autoFocus
                        />
                        <label htmlFor="Cantidad">Cantidad</label>
                    </FloatLabel>
                </div>
            </div>

            {/* Botones */}
            <Button label="Agregar Producto" onClick={() => {setShowDialogProducto(true)}} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <Button label="Cancelar" className="p-button-secondary" onClick={onHide} disabled={loading} />
                <Button label="Guardar" onClick={guardarDatos} loading={loading} disabled={loading} />
            </div>

            {showDialogProducto && (
              <CRUDProducts
                setShowDialog={setShowDialogProducto}
                showDialog={showDialogProducto}
                setSelected={() => {}}
                selected={[]}
                getInfo={getValoresIniciales}
              />
            )}
        </Dialog>


);
}

export default CRUDEntradas;
