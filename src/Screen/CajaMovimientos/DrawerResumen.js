import React, { useEffect, useState } from 'react';
import { Sidebar } from 'primereact/sidebar';
import { supabase } from '../../supabaseClient';
import { Card } from 'primereact/card';
import formatNumber from "../../utils/funcionesFormatNumber";


const DrawerResumen = ({ setShowDialog, showDialog }) => {
    const [data, setData] = useState([]);

    const getValoresIniciales = async () => {
        const { data } = await supabase.from('vta_resumen_caja').select('*');
        setData(data || []);
    };

    const onHide = () => {
        setShowDialog(false);
    };

    useEffect(() => {
        if (showDialog) {
            getValoresIniciales();
        }
    }, [showDialog]);

    return (
        <Sidebar visible={showDialog} position="right" onHide={onHide} style={{ width: '350px' }}>
            <h3>Resumen de Caja</h3>

            {data.length > 0 ? (
                <div className="p-fluid">
                    <Card title="Totales" className="mb-3">
                        <p><strong>Ingresos:</strong> L. {formatNumber(data[0].TotalIngresos)}</p>
                        <p><strong>Egresos:</strong> L. {formatNumber(data[0].TotalEgresos)}</p>
                        <p><strong>Saldo Actual:</strong> L. {formatNumber(data[0].SaldoActual)}</p>
                    </Card>
                </div>
            ) : (
                <p>Cargando resumen...</p>
            )}
        </Sidebar>
    );
};

export default DrawerResumen;
