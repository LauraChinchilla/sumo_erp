import { Dialog } from 'primereact/dialog';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useForm from '../../components/useForm';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { FloatLabel } from 'primereact/floatlabel';
import { supabase } from '../../supabaseClient';
import { Toast } from 'primereact/toast';
import { useUser } from '../../context/UserContext';
import { Dropdown } from 'primereact/dropdown';
import getLocalDateTimeString from '../../utils/funciones';
import ClientesCRUD from '../Maestros/ClientesCRUD';
import { Card } from 'primereact/card';
import Table from '../../components/Table';

const CRUDSalidaMultiple = ({ setShowDialog, showDialog, setSelected, selected, getInfo, editable = true }) => {
    const toast = useRef(null);
    const { user } = useUser();
    const [loading, setLoading] = useState(false);
    const [productos, setProductos] = useState([]);
    const [tiposSalida, setTiposSalida] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [showDialogClientes, setShowDialogClientes] = useState(false)
    const [productosSeleccionados, setProductosSeleccionados] = useState([]);
    const [codigoEscaneado, setCodigoEscaneado] = useState('');

    const initialValues = {
        IdSalidaEnc: -1,
        IdTipoSalida: 1,
    };

    const { values, setValues, handleChange, validateForm, errors } = useForm(initialValues);

    const rules = {
        IdTipoSalida: { required: true, message: 'Debe seleccionar un tipo de salida' },
    };

    const getValoresIniciales = async () => {
        const { data: data2 } = await supabase.from('vta_productos_existentes').select('*');
        setProductos(data2);

        const { data: salidasTempo } = await supabase.from('TipoSalidas').select('*');
        setTiposSalida(salidasTempo);

        const { data: clientesTempo } = await supabase.from('Clientes').select('*');
        setClientes(clientesTempo);
    };

    const guardarDatos = async (e) => {
        e.preventDefault();

        // Validar campos generales (tipo salida, cliente si aplica, etc.)
        if (values?.IdTipoSalida === 3) {
            rules.IdCliente = { required: true, message: 'Debe seleccionar un cliente' };
        } else {
            rules.IdCliente = { required: false };
        }

        if (!validateForm(rules)) {
            console.log('Formulario con errores', errors);
            return;
        }

        if (!productosSeleccionados || productosSeleccionados.length === 0) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Debe seleccionar al menos un producto para la salida.',
                life: 4000
            });
            return;
        }

        const productoConError = productosSeleccionados.find(prod => {
            const cantidad = parseFloat(prod.CantidadSalida) || 0;
            const stock = parseFloat(prod.Stock) || 0;
            return cantidad > stock;
        });

        if (productoConError) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error de stock',
                detail: `El producto ${productoConError.Name} tiene stock insuficiente.`,
                life: 5000
            });
            return;
        }

        const productoConCantidadCero = productosSeleccionados.find(prod => {
            const cantidad = parseFloat(prod.CantidadSalida) || 0;
            return cantidad <= 0;
        });

        if (productoConCantidadCero) {
            toast.current?.show({
                severity: 'error',
                summary: 'Cantidad inválida',
                detail: `El producto ${productoConCantidadCero.Name} tiene una cantidad no válida (0 o menor).`,
                life: 5000
            });
            return;
        }

        setLoading(true);

        let datosEncabezado = {
            IdTipoSalida: values?.IdTipoSalida,
            IdCliente: values?.IdCliente,
            Date: getLocalDateTimeString(),
        }

        const { data: salidaInsertadaEnc, error: errorSalidaEnc } = await supabase.from('SalidasEnc').insert([datosEncabezado]).select().single();


        if(errorSalidaEnc){
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: `No se pudo insertar el encabezado de la Salida`,
                life: 4000
            });
            setLoading(false);
            return;
        }
        // Insertar cada salida individualmente
        for (const item of productosSeleccionados) {
            const Datos = {
                IdProduct: item.IdProduct,
                PrecioCompra: item.PrecioCompra,
                PrecioVenta: item.PrecioVenta,
                IdStatus: 5,
                IdUserEdit: user?.IdUser,
                Date: getLocalDateTimeString(),
                CantidadSalida: item.CantidadSalida,
                IdTipoSalida: values?.IdTipoSalida,
                SubTotal: item.SubTotal,
                Total: item.Total,
                ISVQty: item.ISVQty,
                IdCliente: values?.IdCliente,
                IdCurrency: 1,
                StockAntiguo: item.Stock || item.StockAntiguo,
                PagoCredito: values?.IdTipoSalida === 3 ? false : true,
                IdSalidaEnc: salidaInsertadaEnc?.IdSalidaEnc,
            };


            const { data: salidaInsertada, error: errorSalida } = await supabase.from('Salidas').insert([Datos]).select().single();

            if (errorSalida) {
                console.error(`Error al guardar salida del producto ${item.Name}:`, errorSalida.message);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: `No se pudo guardar la salida del producto ${item.Name}.`,
                    life: 4000
                });
                setLoading(false);
                return;
            }

            if (values?.IdTipoSalida === 1) {
                const datosCaja = {
                    IdTipoMovimiento: 2,
                    IdCategoria: 5,
                    Descripcion: `Venta del Producto: ${item.Code} - ${item.Name}`,
                    Monto: item.Total,
                    IdStatus: 8,
                    Date: getLocalDateTimeString(),
                    IdUser: user?.IdUser,
                    IdReferencia: salidaInsertada?.IdSalida,
                };

                const { error: errorCaja } = await supabase.from('CajaMovimientos').insert([datosCaja]);

                if (errorCaja) {
                    toast.current?.show({
                        severity: 'warn',
                        summary: 'Advertencia',
                        detail: `La salida de ${item.Name} se registró, pero el movimiento en caja no.`,
                        life: 5000
                    });
                    // Aquí NO detenemos el proceso, solo mostramos advertencia
                }
            }
        }

        toast.current?.show({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Todas las salidas se guardaron correctamente.',
            life: 4000
        });

        setTimeout(() => {
            getInfo();
            setShowDialog(false);
            setLoading(false);
        }, 800);
    };

    const handleAgregarProductoPorCodigo = async () => {
        const producto = productos.find(p => p.Code === codigoEscaneado.trim());

        if (!producto) {
            toast.current?.show({
                severity: 'warn',
                summary: 'No encontrado',
                detail: 'Producto no encontrado con ese código',
                life: 3000
            });
            return;
        }

        // Verificar si ya fue agregado
        const yaExiste = productosSeleccionados.some(p => p.IdProduct === producto.IdProduct);
        if (yaExiste) {
            toast.current?.show({
                severity: 'info',
                summary: 'Duplicado',
                detail: 'Este producto ya fue agregado',
                life: 3000
            });
            setCodigoEscaneado('');
            return;
        }

        // Obtener datos de entrada y stock
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
            .eq('IdProduct', producto.IdProduct);

        const nuevoProducto = {
            ...producto,
            IdSalida:  -Math.floor(Math.random() * 1000000),
            PrecioCompra: entrada?.PrecioCompra || 0,
            PrecioVenta: entrada?.PrecioVenta || 0,
            ISV: entrada?.ISV || 0,
            PorcentajeGanancia: entrada?.PorcentajeGanancia || 0,
            Stock: inventario[0]?.TotalUnidades || 0,
            CantidadSalida: 0,
            SubTotal: 0,
            ISVQty: 0,
            Total: 0,
            ISVCalculado: entrada?.ISVCalculado,
        };


        setProductosSeleccionados(prev => [...prev, nuevoProducto]);
        setCodigoEscaneado('');
    };

    const eliminarProducto = useCallback((idSalida) => {
        setProductosSeleccionados(prev => {
            const filtrados = prev.filter(p => p.IdSalida !== idSalida);
            return filtrados;
        });
    }, []);

    const handleCellEdit = (rowData, field, newValue) => {
        const cantidad = parseFloat(newValue) || 0;
        const precioVentaConISV = parseFloat(rowData?.PrecioVenta) || 0;
        const isv = parseFloat(rowData?.ISV) || 0;

        // Calcular precio unitario sin ISV
        const precioUnitarioSinISV = rowData?.Excento
            ? precioVentaConISV
            : precioVentaConISV / (1 + isv / 100);

        // Cálculos
        const subTotal = cantidad * precioUnitarioSinISV;
        const isvTotal = rowData?.Excento ? 0 : subTotal * (isv / 100);
        const total = precioVentaConISV * cantidad;

        setProductosSeleccionados(prev =>
            prev.map(item =>
                item.IdSalida === rowData.IdSalida
                    ? {
                        ...item,
                        [field]: cantidad,
                        SubTotal: subTotal,
                        ISVQty: isvTotal,
                        Total: total,
                    }
                    : item
            )
        );
    };

    const columns = useMemo(() => [
        { field: 'IdSalida', Header: 'ID', className: 'Small', frozen: true, },
        { field: 'Code', Header: 'Código', className: 'Small' },
        { field: 'Name', Header: 'Nombre', className: 'Large' },
        { field: 'UnitName', Header: 'Unidad', className: 'XxxSmall' },
        {
            field: 'Stock',
            Header: 'Cantidad Disponible',
            className: 'XxSmall',
            format: 'number',
            center: true,
        },
        {
            field: 'CantidadSalida',
            Header: 'Cantidad',
            className: 'Small',
            format: 'number',
            editable: true,
        },
        {
            field: 'PrecioVenta',
            Header: 'Precio Venta',
            className: 'Small',
            format: 'number',
            prefix: 'L ',
        },
        {
            field: 'SubTotal',
            Header: 'SubTotal',
            className: 'Small',
            format: 'number',
            summary: true,
            prefix: 'L '
        },
        {
            field: 'ISVQty',
            Header: 'ISV',
            className: 'Small',
            format: 'number',
            summary: true,
            prefix: 'L '
        },
        {
            field: 'Total',
            Header: 'Total',
            className: 'Small',
            format: 'number',
            summary: true,
            prefix: 'L '
        },
        {
            field: '',
            Header: '',
            className: 'XxxSmall',
            isIconColumn: true,
            frozen: true,
            icon: 'pi pi-trash',
            onClick: (rowData) => {
                eliminarProducto(rowData.IdSalida);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
    ], [productosSeleccionados]);


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

    return (
        <>
            <Dialog visible={showDialog} onHide={onHide} style={{ width: '80%' }} header={'Nueva Salida'}>
                <Toast ref={toast} />
                <Card style={{ border: '1px solid #ccc', boxShadow: 'none', background: 'transparent' }}>
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
                                    placeholder="Seleccione un cliente"
                                    required
                                    optionLabel="NombreCompleto"
                                    optionValue="IdCliente"
                                    className={errors.IdCliente ? 'p-invalid' : ''}
                                    style={{ width: '100%' }}
                                    disabled={!editable}
                                    showClear
                                />
                                <label htmlFor="IdCliente">Cliente</label>
                            </FloatLabel>
                        </div>

                        <div style={{ flex: 1 }}>
                            <FloatLabel>
                                <InputText
                                    id="CodigoProducto"
                                    value={codigoEscaneado}
                                    onChange={(e) => setCodigoEscaneado(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleAgregarProductoPorCodigo();
                                            e.preventDefault();
                                        }
                                    }}
                                    style={{ width: '100%' }}
                                    autoFocus
                                />
                                <label htmlFor="CodigoProducto">Escanear o ingresar código</label>
                            </FloatLabel>
                        </div>
                    </div>
                </Card>
                
                <div style={{marginTop: '1rem'}}></div>
                <Table columns={columns} data={productosSeleccionados} onCellEdit={handleCellEdit}/>


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

export default CRUDSalidaMultiple;
