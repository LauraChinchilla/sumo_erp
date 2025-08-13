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
import formatNumber from '../../utils/funcionesFormatNumber';
import ClientesCRUD from '../Maestros/ClientesCRUD';

const CRUDSalidas = ({ setShowDialog, showDialog, setSelected, selected, getInfo, editable = true }) => {
    const toast = useRef(null);
    const { user } = useUser();
    const [loading, setLoading] = useState(false);
    const [productos, setProductos] = useState([]);
    const [tiposSalida, setTiposSalida] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [showDialogClientes, setShowDialogClientes] = useState(false)
    const [imprimir, setImprimir] = useState(true)

    const initialValues = {
        IdSalida: -1,
        IdTipoSalida: 1,
    };

    const { values, setValues, handleChange, validateForm, errors } = useForm(initialValues);

    const rules = {
        CantidadSalida: { required: true, message: 'Debe seleccionar una categoría' },
        IdTipoSalida: { required: true, message: 'Debe seleccionar un tipo de salida' },
    };

    const getValoresIniciales = async () => {
        const { data: data2 } = await supabase.from('vta_productos_existentes').select('*');
        setProductos(data2);

        const { data: salidasTempo } = await supabase.from('TipoSalidas').select('*');
        setTiposSalida(salidasTempo);

        const { data: clientesTempo } = await supabase.from('Clientes').select('*');
        setClientes(clientesTempo);

        if (selected?.length > 0) {
            const producto = selected[0];

            const { data: entrada } = await supabase
                .from('vta_entradas')
                .select('*')
                .eq('IdProduct', producto.IdProduct)
                .eq('IdStatus', 3)
                .order('Date', { ascending: false })
                .limit(1)
                .maybeSingle();
            const { data: inventario } = await supabase
                .from('vta_inventario')
                .select('*')
                .eq('IdProduct', producto.IdProduct)


            setValues({
                ...producto,
                IdTipoSalida: 1,
                PrecioVenta: entrada?.PrecioVenta || 0,
                PrecioCompra: entrada?.PrecioCompra || 0,
                ISV: entrada?.ISV || 0,
                PorcentajeGanancia: entrada?.PorcentajeGanancia || 0,
                Stock: inventario[0]?.TotalUnidades
            });
        }
    };

    const buscarProdcutoEnEntradas = async (producto) => {
        const { data: entrada } = await supabase
            .from('vta_entradas')
            .select('*')
            .eq('IdProduct', producto.IdProduct)
            .eq('IdStatus', 3)
            .order('Date', { ascending: false })
            .limit(1)
            .maybeSingle();

            const { data: inventario } = await supabase
                .from('vta_inventario')
                .select('*')
                .eq('IdProduct', producto.IdProduct)

        setValues({
            ...producto,
            ...values,
            IdTipoSalida: values?.IdTipoSalida,
            IdProduct: producto.IdProduct,
            Description: producto.Description,
            categoryname: producto.categoryname,
            PrecioVenta: entrada?.PrecioVenta || 0,
            PrecioCompra: entrada?.PrecioCompra || 0,
            ISV: entrada?.ISV || 0,
            PorcentajeGanancia: entrada?.PorcentajeGanancia || 0,
            Stock: inventario[0]?.TotalUnidades,
        });
    }

    const guardarDatos = async (e) => {
        e.preventDefault();

        // Condición: si el tipo de salida es 3, se requiere IdCliente
        if (values?.IdTipoSalida === 3) {
            rules.IdCliente = { required: true, message: 'Debe seleccionar un cliente' };
        } else {
            rules.IdCliente = { required: false };
        }

        if (!validateForm(rules)) {
            console.log('Formulario con errores', errors);
            return;
        }

        if (values?.Stock < values?.CantidadSalida) {
            toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: 'No hay suficientes unidades disponibles para realizar la salida.',
            life: 4000
            });
            return;
        }

        setLoading(true);

        const Datos = {
            IdProduct: values?.IdProduct,
            PrecioCompra: values?.PrecioCompra,
            PrecioVenta: values?.PrecioVenta,
            IdStatus: 5,
            IdUserEdit: user?.IdUser,
            Date: getLocalDateTimeString(),
            CantidadSalida: values?.CantidadSalida,
            IdTipoSalida: values?.IdTipoSalida,
            SubTotal: values?.SubTotal,
            Total: values?.Total,
            ISVQty: values?.ISVQty,
            IdCliente: values?.IdCliente,
            IdCurrency: 1,
            StockAntiguo: values?.Stock || values?.StockAntiguo,
            PagoCredito: values?.IdTipoSalida === 3 ? false : true,
        };

        const { data: salidaInsertada, error: errorEntrada } = await supabase
            .from('Salidas')
            .insert([Datos])
            .select()
            .single();

        if (errorEntrada) {
            console.error('Error al guardar salida:', errorEntrada.message);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo guardar la salida',
                life: 4000
            });
            setLoading(false);
            return;
        }

        // Solo registra movimiento en caja si es tipo de salida = 1 (venta)
        if (values?.IdTipoSalida === 1) {
            const datos = {
                IdTipoMovimiento: 2,
                IdCategoria: 5,
                Descripcion: `Venta del Producto: ${values?.Code} - ${values?.Name}`,
                Monto: values?.Total,
                IdStatus: 8,
                Date: getLocalDateTimeString(),
                IdUser: user?.IdUser,
                IdReferencia: salidaInsertada?.IdSalida,
            };

            const { error } = await supabase.from('CajaMovimientos').insert([datos]);

            if (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Se realizó la salida, pero no se registró el movimiento en caja. Comuníquese con soporte.',
                life: 4000
            });
            setLoading(false);
            return;
            }
        }

        toast.current?.show({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Salida guardada correctamente',
            life: 4000
        });

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
        if (showDialog) {
            getValoresIniciales();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showDialog]);


    useEffect(() => {
        const cantidad = parseFloat(values?.CantidadSalida) || 0;
        const precioVentaConISV = parseFloat(values?.PrecioVenta) || 0;
        const isv = parseFloat(values?.ISV) || 0;
        const precioUnitarioSinISV = values?.Excento ? precioVentaConISV : precioVentaConISV / (1 + isv / 100);

        const subTotal = cantidad * precioUnitarioSinISV;
        const isvTotal = values?.Excento ? 0 : subTotal * (isv / 100);
        const total = precioVentaConISV * cantidad;

        setValues({
            ...values,
            SubTotal: subTotal,
            ISVQty: isvTotal,
            Total: total,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [values?.CantidadSalida]);

    return (
        <>
            <Dialog visible={showDialog} onHide={onHide} style={{ width: '60%' }} header={'Nueva Salida'}>
                <Toast ref={toast} />

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                    <div style={{ flex: 1 }}>
                        <FloatLabel>
                            <Dropdown
                                id="IdTipoSalida"
                                value={values.IdTipoSalida}
                                options={tiposSalida}
                                onChange={(e) => handleChange('IdTipoSalida', e.value)}
                                placeholder="Seleccione un tipo de Salida"
                                required
                                optionLabel="TipoSalida"
                                optionValue="IdTipoSalida"
                                className={errors.IdTipoSalida ? 'p-invalid' : ''}
                                style={{ width: '100%' }}
                                disabled={!editable}
                            />
                            <label htmlFor="IdTipoSalida">Tipo de salida</label>
                        </FloatLabel>
                    </div>

                    <div style={{ flex: 1 }}>
                        <FloatLabel>
                            <Dropdown
                                id="IdCliente"
                                value={values.IdCliente}
                                options={clientes}
                                onChange={(e) => handleChange('IdCliente', e.value)}
                                placeholder="Seleccione un tipo de Salida"
                                required
                                optionLabel="NombreCompleto"
                                optionValue="IdCliente"
                                className={errors.IdCliente ? 'p-invalid' : ''}
                                style={{ width: '100%' }}
                                disabled={!editable}
                            />
                            <label htmlFor="IdCliente">Cliente</label>
                        </FloatLabel>
                    </div>
                </div>
                
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
                                <label htmlFor="Name">Producto</label>
                            </FloatLabel>
                        </div>
                    </div>
                ): (
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
                                            buscarProdcutoEnEntradas(selectedProduct)
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

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                    <div style={{ flex: 1 }}>
                        <FloatLabel>
                            <InputText
                                id="Description"
                                value={values.Description}
                                onChange={(e) => handleChange('Description', e.target.value)}
                                style={{ width: '100%' }}
                                disabled
                            />
                            <label htmlFor="Description">Descripcion</label>
                        </FloatLabel>
                    </div>
                    <div style={{ flex: 1 }}>
                        <FloatLabel>
                            <InputText
                                id="categoryname"
                                value={values.categoryname}
                                onChange={(e) => handleChange('categoryname', e.target.value)}
                                style={{ width: '100%' }}
                                disabled
                            />
                            <label htmlFor="categoryname">Categoría</label>
                        </FloatLabel>
                    </div>
                </div>

                {(user?.IdRol === 1 || user?.IdRol === 2) && (
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
                )}

                {/* Precio Compra y Precio Venta */}
                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                    {(user?.IdRol === 1 || user?.IdRol === 2) && (
                        <div style={{ flex: 1 }}>
                            <FloatLabel>
                                <InputNumber
                                    id="PrecioCompra"
                                    value={values.PrecioCompra}
                                    prefix='L '
                                    onChange={(e) => handleChange('PrecioCompra', e.value)}
                                    required
                                    style={{ width: '100%' }}
                                    minFractionDigits={3}
                                    maxFractionDigits={3}
                                    disabled
                                    className={errors.PrecioCompra ? 'p-invalid' : ''}
                                />
                                <label htmlFor="PrecioCompra">Precio Compra</label>
                            </FloatLabel>
                        </div>
                    )}

                    <div style={{ flex: 1 }}>
                        <FloatLabel>
                            <InputNumber
                                id="PrecioVenta"
                                value={values.PrecioVenta}
                                onChange={(e) => handleChange('PrecioVenta', e.value)}
                                required
                                style={{ width: '100%' }}
                                disabled
                                prefix='L '
                                className={errors.PrecioVenta ? 'p-invalid' : ''}
                            />
                            <label htmlFor="PrecioVenta">Precio Venta</label>
                        </FloatLabel>
                    </div>
                </div>

                {/* Cantidad */}
                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                    <div style={{ flex: 1 }}>
                        <FloatLabel>
                            <InputNumber
                                id="Stock"
                                value={values.Stock}
                                onChange={(e) => handleChange('Stock', e.value)}
                                style={{ width: '100%' }}
                                disabled={true}
                                suffix={` ${values?.UnitName}`}
                                className={errors.Stock ? 'p-invalid' : ''}
                            />
                            <label htmlFor="Stock">Cantidad Disponible</label>
                        </FloatLabel>
                    </div>


                    <div style={{ flex: 1 }}>
                        <FloatLabel>
                            <InputNumber
                                id="CantidadSalida"
                                value={values.CantidadSalida}
                                onChange={(e) => handleChange('CantidadSalida', e.value)}
                                style={{ width: '100%' }}
                                disabled={!values?.IdProduct}
                                suffix={` ${values?.UnitName}`}
                                className={errors.CantidadSalida ? 'p-invalid' : ''}
                            />
                            <label htmlFor="CantidadSalida">Cantidad</label>
                        </FloatLabel>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '1.5rem' }}>
                    {/* Botón a la izquierda */}
                    <div>
                        <Button
                            icon="pi pi-address-book"
                            tooltip="Agregar Cliente"
                            tooltipOptions={{ position: 'top' }}
                            className="p-button-success"
                            severity="primary"
                            onClick={() => setShowDialogClientes(true)}
                        />
                    </div>

                    {/* Totales a la derecha */}
                    <div style={{ textAlign: 'right', paddingRight: '1rem' }}>
                        <h4>SubTotal: L {formatNumber(values.SubTotal)}</h4>
                        <h4>ISV: L {formatNumber(values.ISVQty)}</h4>
                        <h4>Total: L {formatNumber(values.Total)}</h4>
                    </div>
                </div>


                {/* Botones */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                    <Button label="Cancelar" className="p-button-secondary" onClick={onHide} disabled={loading} />
                    <Button label="Guardar" onClick={guardarDatos} loading={loading} disabled={loading} />
                </div>
            </Dialog>


            {showDialogClientes && (
              <ClientesCRUD
                showDialog={showDialogClientes}
                setShowDialog={setShowDialogClientes}
                setSelected={() => {}}
                selected={[]}
                getInfo={getValoresIniciales}
                editable={true}
                setActiveIndex={() => {}}
              />
            )}
        </>

    );
}

export default CRUDSalidas;
