import React, { useEffect, useState } from 'react';
import { Sidebar } from 'primereact/sidebar';
import { supabase } from '../../supabaseClient';
import { Card } from 'primereact/card';

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
                        <p><strong>Ingresos:</strong> L. {data[0].TotalIngresos?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        <p><strong>Egresos:</strong> L. {data[0].TotalEgresos?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        <p><strong>Saldo Actual:</strong> L. {data[0].SaldoActual?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    </Card>
                </div>
            ) : (
                <p>Cargando resumen...</p>
            )}
        </Sidebar>
    );
};

export default DrawerResumen;
