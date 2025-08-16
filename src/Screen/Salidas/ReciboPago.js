import { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { supabase } from "../../supabaseClient";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import formatNumber from "../../utils/funcionesFormatNumber";

pdfMake.vfs = pdfFonts.pdfMake?.vfs || pdfFonts.vfs;

export default function ReciboPago({ showDialog, setShowDialog, setShowDialogPrincipal, getInfoPrincipal }) {
  const [pdfUrl, setPdfUrl] = useState(null);

  const getInfo = async () => {
    const { data: infoEmpresa, error: errorEmpresa } = await supabase.from("InformacionEmpresa").select("*");

    if (errorEmpresa) {
      console.error(errorEmpresa);
      return;
    }

    const logoUrl = infoEmpresa[0]?.Logo;
    if (!logoUrl) {
      console.warn("No se encontró la URL del logo");
      return;
    }

    const { data: ultimaSalida, error: errorUltima } = await supabase.from("vta_salidas").select("*").order("IdSalida", { ascending: false }).limit(1);

    if (errorUltima || !ultimaSalida?.length) {
      console.error("No se pudo obtener la última salida", errorUltima);
      return;
    }

    const salida = ultimaSalida[0];
    let dataSalida = [];

    if (!salida.IdSalidaEnc) {
      dataSalida = [salida];
    } else {
      const { data: salidasRelacionadas, error: errorRelacionadas } =
        await supabase.from("vta_salidas").select("*").eq("IdSalidaEnc", salida.IdSalidaEnc);
      if (errorRelacionadas) {
        console.error("Error obteniendo salidas relacionadas",errorRelacionadas);
        return;
      }
      dataSalida = salidasRelacionadas;
    }

    const response = await fetch(logoUrl);
    const blob = await response.blob();
    const base64Logo = await blobToBase64(blob);

    GenerarReporte(dataSalida,infoEmpresa[0], base64Logo);
  };

  function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  const GenerarReporte = (data, infoEmpresa, Logo) => {

    const SubTotalGeneral = data.reduce((acc, item) => {
      return acc + (Number(item.SubTotal) || 0);
    }, 0);

    const ISVGeneral = data.reduce((acc, item) => {
      return acc + (Number(item.ISVQty) || 0);
    }, 0);

    const totalGeneral = data.reduce((acc, item) => {
      return acc + (Number(item.Total) || 0);
    }, 0);

    const totalUnidades = data.reduce((acc, item) => {
      return acc + (Number(item.CantidadSalida) || 0);
    }, 0);


    const docDefinition = {
      pageSize: { width: 250, height: "auto" },
      pageMargins: [10, 10, 10, 10],
      content: [
        { 
          text: "RECIBO DE PAGO", 
          style: "header", 
          alignment: "center",
          margin: [0, 0, 0, 5]
        },
        { 
          text: infoEmpresa?.NombreLargo || '', 
          style: "subheader", 
          alignment: "center",
        },
        infoEmpresa?.Telefono ?
        { 
          text: `Telefono: +504 ${infoEmpresa?.Telefono}`, 
          style: "subheader1", 
          margin: [0,6,0,0]
        } : null,
        infoEmpresa?.Email?
        { 
          text: `Correo: ${infoEmpresa?.Email}`, 
          style: "subheader1", 
        } : null,
        infoEmpresa?.RTN ?
        { 
          text: `RTN: +504 ${infoEmpresa?.RTN}`, 
          style: "subheader1", 
        } : null,

        ...(Logo ? [{
          image: Logo,
          width: 80,
          alignment: "center",
          margin: [0, 10, 0, 10]
        }] : []),
        { 
          text: `Cliente: ${data[0]?.NombreCompleto || ''}`, 
          style: 'texto',
        },
        { 
          text: `Fecha: ${new Date().toLocaleDateString()}`, 
          style: 'texto',
        },
        { 
          text: `Hora: ${new Date().toLocaleTimeString()}`, 
          style: 'texto',
        },
        { 
          text: "-----------------------------------------------------------", 
          alignment: "center",
          margin: [0,5,0,0],
          style: 'divisiones',
        },

        {
          table: {
            widths: ['50%', '15%', '*'],
            body: [
              [
                { 
                  text: 'Producto', 
                  style: 'headerTable',
                }, 
                { 
                  text: 'Cant', 
                  style: 'headerTable',
                }, 
                { 
                  text: 'Precio', 
                  style: 'headerTable',
                  alignment: 'center',
                }
              ],

              ...data.map(item => [
                {
                  text: item.productoconcat,
                  style: 'table'
                },
                {
                  text: item.CantidadSalida,
                  style: 'table'
                },
                { 
                  text: `L ${formatNumber(item.PrecioVenta)}`, 
                  alignment: 'right',
                  style: 'table'
                }
              ])
            ]
          },
          layout: 'noBorders',
          margin: [0, 5, 0, 5]
        },
        { text: "-----------------------------------------------------------", alignment: "center", style: 'divisiones' },
        {
          columns: [
            { 
              text: `Total Unidades: ${totalUnidades}`, 
              style: 'totalUnidades',
              margin: [0,5,0,0],
            },
            { 
              text: `Total Lineas ${data?.length}`, 
              style: 'totalUnidades',
              margin: [0,5,0,0],
              alignment: 'right' ,
            },
          ]
        },


        {
          columns: [
            { 
              text: 'Sub Total:', 
              bold: true,
              style: 'headerTable',
              margin: [0,10,0,0],
            },
            { 
              text: `L ${formatNumber(SubTotalGeneral) || '0.00'}`, 
              margin: [0,10,0,0],
              bold: true, 
              style: 'headerTable',
              alignment: 'right' 
            },
          ]
        },
        {
          columns: [
            { 
              text: 'ISV (15%):', 
              bold: true,
              style: 'headerTable' 
            },
            { 
              text: `L ${formatNumber(ISVGeneral) || '0.00'}`, 
              bold: true, 
              style: 'headerTable',
              alignment: 'right' 
            },
          ]
        },
        {
          columns: [
            { 
              text: 'TOTAL:', 
              bold: true,
              style: 'headerTable' 
            },
            { 
              text: `L ${formatNumber(totalGeneral) || '0.00'}`, 
              bold: true, 
              style: 'headerTable',
              alignment: 'right' ,
              margin: [0,3,0,0]
            },
          ]
        },

        { 
          text: infoEmpresa?.Direccion || '', 
          alignment: "center",
          style: 'table',
          margin: [0,30,0,0]
        },
        { 
          text: 'ORIGINAL: Cliente', 
          style: 'table',
          alignment: "center",
          margin: [0,10,0,0]
        },
        { 
          alignment: "center",
          text: 'COPIA: Archivo', 
          style: 'table',
          margin: [0,5,0,0]
        },

        { 
          text: '***** GRACIAS POR PREFERIRNOS *****', 
          alignment: "center",
          style: 'header',
          margin: [0,10,0,50]
        },

      ],
      styles: {
        header: { 
          fontSize: 12, 
          bold: true 
        },
        subheader: { 
          fontSize: 11 
        },
        subheader1: { 
          fontSize: 10
        },
        texto: { 
          fontSize: 11
        },
        headerTable: { 
          fontSize: 10,
          bold: true
        },
        totalUnidades: { 
          fontSize: 10,
          italics: true
        },
        table: { 
          fontSize: 10,
        },
        divisiones: { 
          fontSize: 8,
        },
      }
    };

    pdfMake.createPdf(docDefinition).getBlob((blob) => {
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    });
  };

  const handleClose = () => {
    setShowDialog(false);
    setPdfUrl(null);
    setShowDialogPrincipal(false)
    getInfoPrincipal()
  };

  useEffect(() => {
    if (showDialog) {
      getInfo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDialog]);

  return (
    <Dialog
      visible={showDialog}
      style={{ width: "70%", height: "100vh" }}
      onHide={handleClose}
      modal
    >
      {pdfUrl ? (
        <iframe
          src={pdfUrl}
          title="Salidas"
          width="100%"
          height="730px"
          style={{ border: "none" }}
        />
      ) : (
        <p>Cargando reporte...</p>
      )}
    </Dialog>
  );
}
